'use server'

import { revalidatePath } from 'next/cache'

import { createServerSupabaseClient } from '@/lib/supabase/server'

interface ActionResult {
  success?: boolean
  error?: string
  data?: { id: string; invite_code: string }
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function createEvent(data: {
  name: string
  type: string
  start_date: string
  end_date: string
  location?: string
  description?: string
}): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()
    const inviteCode = generateInviteCode()

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        name: data.name,
        type: data.type,
        start_date: data.start_date,
        end_date: data.end_date,
        location: data.location ?? null,
        description: data.description ?? null,
        invite_code: inviteCode,
        settings: {},
      })
      .select('id, invite_code')
      .single()

    if (error) {
      return { error: '행사 생성에 실패했어요. 다시 시도해 주세요.' }
    }

    revalidatePath('/dashboard')
    return { success: true, data: { id: event.id, invite_code: event.invite_code } }
  } catch {
    return { error: '행사 생성 중 문제가 발생했어요.' }
  }
}

export async function updateEvent(
  id: string,
  data: {
    name?: string
    type?: string
    start_date?: string
    end_date?: string
    location?: string | null
    description?: string | null
    settings?: Record<string, unknown>
  }
): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('events')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return { error: '행사 수정에 실패했어요.' }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: '행사 수정 중 문제가 발생했어요.' }
  }
}
