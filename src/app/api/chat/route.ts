import { streamText, UIMessage, convertToModelMessages, stepCountIs } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGroq } from '@ai-sdk/groq'

import { buildSystemPrompt } from '@/lib/ai/system-prompt'
import { checkRateLimit } from '@/lib/ai/rate-limit'
import { createReadTools } from '@/lib/ai/tools/read-tools'
import { createWriteTools } from '@/lib/ai/tools/write-tools'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types'

export const maxDuration = 30

const GEMINI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY
const GROQ_KEY = process.env.GROQ_API_KEY

function getModel() {
  if (GEMINI_KEY) {
    const google = createGoogleGenerativeAI({ apiKey: GEMINI_KEY })
    return google('gemini-2.5-flash')
  }
  if (GROQ_KEY) {
    const groq = createGroq({ apiKey: GROQ_KEY })
    return groq('llama-3.3-70b-versatile')
  }
  return null
}

function getFallbackModel() {
  if (GROQ_KEY) {
    const groq = createGroq({ apiKey: GROQ_KEY })
    return groq('llama-3.3-70b-versatile')
  }
  return null
}

export async function POST(req: Request) {
  const model = getModel()
  if (!model) {
    return Response.json(
      { error: 'AI 기능이 비활성화되어 있어요. API 키를 설정해 주세요.' },
      { status: 503 }
    )
  }

  const { messages, role }: { messages: UIMessage[]; role?: UserRole } = await req.json()

  // Rate limit check using a simple identifier from headers
  const userId = req.headers.get('x-user-id') ?? 'anonymous'
  const { allowed, remaining } = checkRateLimit(userId)

  if (!allowed) {
    return Response.json(
      { error: '요청 횟수를 초과했어요. 잠시 후 다시 시도해 주세요.' },
      { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
    )
  }

  // Build tools based on authentication and role
  let tools = {}

  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const readTools = createReadTools(supabase)
      tools = { ...readTools }

      if (role === 'admin' || role === 'staff') {
        const writeTools = createWriteTools(supabase)
        tools = { ...tools, ...writeTools }
      }
    }
  } catch {
    // No auth — chatbot works without tools (Q&A only mode)
  }

  const systemPrompt = buildSystemPrompt(role)
  const recentMessages = messages.slice(-40)

  try {
    const result = streamText({
      model,
      system: systemPrompt,
      messages: await convertToModelMessages(recentMessages),
      tools,
      stopWhen: stepCountIs(5),
      abortSignal: AbortSignal.timeout(25000),
    })

    return result.toUIMessageStreamResponse()
  } catch {
    // Fallback to Groq if Gemini fails
    const fallback = getFallbackModel()
    if (!fallback) {
      return Response.json(
        { error: '답변을 생성할 수 없어요. 잠시 후 다시 시도해 주세요.' },
        { status: 500 }
      )
    }

    const result = streamText({
      model: fallback,
      system: systemPrompt,
      messages: await convertToModelMessages(recentMessages),
      tools,
      stopWhen: stepCountIs(5),
    })

    return result.toUIMessageStreamResponse()
  }
}
