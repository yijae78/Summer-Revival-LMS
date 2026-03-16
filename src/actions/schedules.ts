'use server'

import { revalidatePath } from 'next/cache'

import { createServerSupabaseClient } from '@/lib/supabase/server'

interface ActionResult {
  success?: boolean
  error?: string
  data?: { id: string }
}

export async function createSchedule(data: {
  event_id: string
  day_number: number
  date?: string
  title: string
  type: string
  start_time: string
  end_time: string
  location?: string
  speaker?: string
  description?: string
  order_index?: number
}): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: schedule, error } = await supabase
      .from('schedules')
      .insert({
        event_id: data.event_id,
        day_number: data.day_number,
        date: data.date ?? null,
        title: data.title,
        type: data.type,
        start_time: data.start_time,
        end_time: data.end_time,
        location: data.location ?? null,
        speaker: data.speaker ?? null,
        description: data.description ?? null,
        order_index: data.order_index ?? 0,
      })
      .select('id')
      .single()

    if (error) {
      return { error: '일정 추가에 실패했어요. 다시 시도해 주세요.' }
    }

    revalidatePath('/schedule')
    return { success: true, data: { id: schedule.id } }
  } catch {
    return { error: '일정 추가 중 문제가 발생했어요.' }
  }
}

export async function updateSchedule(
  id: string,
  data: {
    day_number?: number
    date?: string | null
    title?: string
    type?: string
    start_time?: string
    end_time?: string
    location?: string | null
    speaker?: string | null
    description?: string | null
    order_index?: number
  }
): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('schedules')
      .update(data)
      .eq('id', id)

    if (error) {
      return { error: '일정 수정에 실패했어요.' }
    }

    revalidatePath('/schedule')
    return { success: true }
  } catch {
    return { error: '일정 수정 중 문제가 발생했어요.' }
  }
}

export async function deleteSchedule(id: string): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: '일정 삭제에 실패했어요.' }
    }

    revalidatePath('/schedule')
    return { success: true }
  } catch {
    return { error: '일정 삭제 중 문제가 발생했어요.' }
  }
}
