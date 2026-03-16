'use server'

import { revalidatePath } from 'next/cache'

import { createServerSupabaseClient } from '@/lib/supabase/server'

interface ActionResult {
  success?: boolean
  error?: string
  data?: { id: string }
}

export async function createGroup(input: {
  eventId: string
  name: string
  color: string
}): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('groups')
      .insert({
        event_id: input.eventId,
        name: input.name,
        color: input.color,
        total_points: 0,
      })
      .select('id')
      .single()

    if (error) {
      return { error: '조 만들기에 실패했어요. 다시 시도해 주세요.' }
    }

    revalidatePath('/groups')
    return { success: true, data: { id: data.id } }
  } catch {
    return { error: '조 생성 중 문제가 발생했어요.' }
  }
}

export async function updateGroup(
  id: string,
  data: {
    name?: string
    color?: string
    leader_id?: string | null
  }
): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('groups')
      .update(data)
      .eq('id', id)

    if (error) {
      return { error: '조 정보 수정에 실패했어요.' }
    }

    revalidatePath('/groups')
    return { success: true }
  } catch {
    return { error: '조 정보 수정 중 문제가 발생했어요.' }
  }
}

export async function addGroupMember(input: {
  groupId: string
  participantId: string
}): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()

    // Check if already a member
    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', input.groupId)
      .eq('participant_id', input.participantId)
      .maybeSingle()

    if (existing) {
      return { error: '이미 이 조에 배정된 참가자예요.' }
    }

    const { data, error } = await supabase
      .from('group_members')
      .insert({
        group_id: input.groupId,
        participant_id: input.participantId,
      })
      .select('id')
      .single()

    if (error) {
      return { error: '조원 추가에 실패했어요.' }
    }

    revalidatePath('/groups')
    return { success: true, data: { id: data.id } }
  } catch {
    return { error: '조원 추가 중 문제가 발생했어요.' }
  }
}

export async function removeGroupMember(id: string): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: '조원 제거에 실패했어요.' }
    }

    revalidatePath('/groups')
    return { success: true }
  } catch {
    return { error: '조원 제거 중 문제가 발생했어요.' }
  }
}

export async function deleteGroup(id: string): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()

    // Delete group members first
    await supabase
      .from('group_members')
      .delete()
      .eq('group_id', id)

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: '조 삭제에 실패했어요.' }
    }

    revalidatePath('/groups')
    return { success: true }
  } catch {
    return { error: '조 삭제 중 문제가 발생했어요.' }
  }
}
