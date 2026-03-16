import { NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

// In-memory rate limiter for PIN attempts
interface AttemptRecord {
  count: number
  lockedUntil: number
}

const attempts = new Map<string, AttemptRecord>()
const MAX_ATTEMPTS = 5
const LOCK_DURATION = 10 * 60 * 1000 // 10 minutes

// Cleanup stale entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of attempts) {
      if (now > value.lockedUntil && value.count === 0) {
        attempts.delete(key)
      }
    }
  }, 10 * 60 * 1000)
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return 'unknown'
}

function checkPinRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()
  const record = attempts.get(ip)

  if (!record) {
    return { allowed: true, retryAfterMs: 0 }
  }

  if (record.lockedUntil > now) {
    return { allowed: false, retryAfterMs: record.lockedUntil - now }
  }

  // Lock expired, reset
  if (record.lockedUntil > 0 && now > record.lockedUntil) {
    attempts.delete(ip)
    return { allowed: true, retryAfterMs: 0 }
  }

  return { allowed: true, retryAfterMs: 0 }
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now()
  const record = attempts.get(ip)

  if (!record) {
    attempts.set(ip, { count: 1, lockedUntil: 0 })
    return
  }

  record.count++

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCK_DURATION
  }
}

function resetAttempts(ip: string): void {
  attempts.delete(ip)
}

interface PinRequestBody {
  inviteCode: string
  name: string
  birthDate: string
}

function isValidRequestBody(body: unknown): body is PinRequestBody {
  if (typeof body !== 'object' || body === null) return false
  const obj = body as Record<string, unknown>
  return (
    typeof obj.inviteCode === 'string' &&
    obj.inviteCode.length > 0 &&
    typeof obj.name === 'string' &&
    obj.name.length > 0 &&
    typeof obj.birthDate === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(obj.birthDate)
  )
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)

    // Rate limit check
    const { allowed, retryAfterMs } = checkPinRateLimit(ip)
    if (!allowed) {
      const retryAfterSeconds = Math.ceil(retryAfterMs / 1000)
      return NextResponse.json(
        { error: '시도 횟수를 초과했어요. 10분 후 다시 시도해 주세요.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSeconds) },
        }
      )
    }

    // Parse and validate request body
    const body: unknown = await req.json()

    if (!isValidRequestBody(body)) {
      return NextResponse.json(
        { error: '정보가 일치하지 않아요. 다시 확인해 주세요.' },
        { status: 400 }
      )
    }

    const { inviteCode, name, birthDate } = body

    const supabase = await createServerSupabaseClient()

    // Step 1: Find event by invite_code
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('invite_code', inviteCode)
      .single()

    if (eventError || !event) {
      recordFailedAttempt(ip)
      return NextResponse.json(
        { error: '정보가 일치하지 않아요. 다시 확인해 주세요.' },
        { status: 401 }
      )
    }

    // Step 2: Find participant by event_id + name + birth_date
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id, name, event_id')
      .eq('event_id', event.id)
      .eq('name', name)
      .eq('birth_date', birthDate)
      .single()

    if (participantError || !participant) {
      recordFailedAttempt(ip)
      return NextResponse.json(
        { error: '정보가 일치하지 않아요. 다시 확인해 주세요.' },
        { status: 401 }
      )
    }

    // Success: reset attempts and return participant data
    resetAttempts(ip)

    return NextResponse.json({
      success: true,
      participant: {
        id: participant.id,
        name: participant.name,
        event_id: participant.event_id,
      },
    })
  } catch {
    return NextResponse.json(
      { error: '인증 처리 중 문제가 생겼어요.' },
      { status: 500 }
    )
  }
}
