import { NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { participantId } = body as { participantId?: string }

    if (!participantId) {
      return NextResponse.json(
        { error: '참가자 정보가 필요해요.' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('participants')
      .select('id, name, event_id')
      .eq('id', participantId)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: '참가자를 찾을 수 없어요.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      participant: {
        id: data.id,
        name: data.name,
        eventId: data.event_id,
      },
    })
  } catch {
    return NextResponse.json(
      { error: '인증 처리 중 문제가 생겼어요.' },
      { status: 500 }
    )
  }
}
