'use server'

import { revalidatePath } from 'next/cache'

import { createServerSupabaseClient } from '@/lib/supabase/server'

interface ActionResult {
  success?: boolean
  error?: string
  data?: { id: string }
}

export async function assignPoints(input: {
  eventId: string
  participantId?: string
  groupId?: string
  amount: number
  category: string
  description?: string
}): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('points')
      .insert({
        event_id: input.eventId,
        participant_id: input.participantId ?? null,
        group_id: input.groupId ?? null,
        category: input.category,
        amount: input.amount,
        description: input.description ?? null,
      })
      .select('id')
      .single()

    if (error) {
      return { error: '포인트 부여에 실패했어요.' }
    }

    // If group points, update the group's total_points
    if (input.groupId) {
      const { data: group } = await supabase
        .from('groups')
        .select('total_points')
        .eq('id', input.groupId)
        .single()

      if (group) {
        const currentPoints = (group.total_points as number) ?? 0
        await supabase
          .from('groups')
          .update({ total_points: currentPoints + input.amount })
          .eq('id', input.groupId)
      }
    }

    revalidatePath('/groups')
    revalidatePath('/leaderboard')
    return { success: true, data: { id: data.id } }
  } catch {
    return { error: '포인트 부여 중 문제가 발생했어요.' }
  }
}

export async function deletePointRecord(id: string): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()

    // Get the point record first to adjust group total
    const { data: point } = await supabase
      .from('points')
      .select('group_id, amount')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('points')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: '포인트 삭제에 실패했어요.' }
    }

    // Adjust group total_points if it was a group point
    if (point?.group_id) {
      const { data: group } = await supabase
        .from('groups')
        .select('total_points')
        .eq('id', point.group_id as string)
        .single()

      if (group) {
        const currentPoints = (group.total_points as number) ?? 0
        const amount = (point.amount as number) ?? 0
        await supabase
          .from('groups')
          .update({ total_points: Math.max(0, currentPoints - amount) })
          .eq('id', point.group_id as string)
      }
    }

    revalidatePath('/groups')
    revalidatePath('/leaderboard')
    return { success: true }
  } catch {
    return { error: '포인트 삭제 중 문제가 발생했어요.' }
  }
}
