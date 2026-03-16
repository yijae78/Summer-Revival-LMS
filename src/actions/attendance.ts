'use server'

import { revalidatePath } from 'next/cache'

import { createServerSupabaseClient } from '@/lib/supabase/server'

import type { AttendanceStatus } from '@/types'

interface ActionResult {
  success?: boolean
  error?: string
}

export async function checkAttendance(data: {
  scheduleId: string
  participantId: string
  status: AttendanceStatus
}): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('attendance')
      .upsert(
        {
          schedule_id: data.scheduleId,
          participant_id: data.participantId,
          status: data.status,
          checked_at: new Date().toISOString(),
        },
        {
          onConflict: 'schedule_id,participant_id',
        }
      )

    if (error) {
      return { error: '출석 체크에 실패했어요. 다시 시도해 주세요.' }
    }

    revalidatePath('/attendance')
    return { success: true }
  } catch {
    return { error: '출석 체크 중 문제가 발생했어요.' }
  }
}

export async function batchCheckAttendance(
  records: Array<{
    scheduleId: string
    participantId: string
    status: AttendanceStatus
  }>
): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()

    const upsertData = records.map((record) => ({
      schedule_id: record.scheduleId,
      participant_id: record.participantId,
      status: record.status,
      checked_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('attendance')
      .upsert(upsertData, {
        onConflict: 'schedule_id,participant_id',
      })

    if (error) {
      return { error: '일괄 출석 체크에 실패했어요. 다시 시도해 주세요.' }
    }

    revalidatePath('/attendance')
    return { success: true }
  } catch {
    return { error: '일괄 출석 체크 중 문제가 발생했어요.' }
  }
}
