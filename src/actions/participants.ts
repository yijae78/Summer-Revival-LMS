'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { participantSchema, adminParticipantSchema, adminBulkParticipantSchema } from '@/validators/participant'

interface ActionResult {
  success?: boolean
  error?: string
  data?: { id: string }
}

interface BulkActionResult {
  success?: boolean
  error?: string
  data?: { count: number }
}

export async function registerParticipant(formData: FormData): Promise<ActionResult> {
  try {
    const raw = Object.fromEntries(formData)

    // Convert consent string values to booleans
    const parsed = participantSchema.safeParse({
      ...raw,
      consentPersonalInfo: raw.consentPersonalInfo === 'true',
      consentSensitiveInfo: raw.consentSensitiveInfo === 'true',
      consentPhotoVideo: raw.consentPhotoVideo === 'true',
      consentOverseasTransfer: raw.consentOverseasTransfer === 'true',
    })

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return { error: firstIssue?.message ?? '입력 데이터가 올바르지 않아요' }
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('participants')
      .insert({
        event_id: parsed.data.eventId,
        name: parsed.data.name,
        birth_date: parsed.data.birthDate,
        gender: parsed.data.gender,
        grade: parsed.data.grade ?? null,
        phone: parsed.data.phone || null,
        parent_phone: parsed.data.parentPhone || null,
        emergency_contact: parsed.data.emergencyContact,
        health_info: parsed.data.healthInfo
          ? { note: parsed.data.healthInfo }
          : {},
        dietary_restrictions: parsed.data.dietaryRestrictions || null,
        transportation: parsed.data.transportation ?? null,
        consent_personal_info: parsed.data.consentPersonalInfo,
        consent_sensitive_info: parsed.data.consentSensitiveInfo,
        consent_photo_video: parsed.data.consentPhotoVideo,
        consent_overseas_transfer: parsed.data.consentOverseasTransfer,
        fee_paid: false,
      })
      .select('id')
      .single()

    if (error) {
      return { error: '참가 신청에 실패했어요. 다시 시도해 주세요.' }
    }

    return { success: true, data: { id: data.id } }
  } catch {
    return { error: '참가 신청 중 문제가 발생했어요.' }
  }
}

export async function addParticipantByAdmin(input: {
  name: string
  grade: string
  gender: string
  phone?: string
  birthDate?: string
  eventId: string
}): Promise<ActionResult> {
  try {
    const parsed = adminParticipantSchema.safeParse(input)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return { error: firstIssue?.message ?? '입력 데이터가 올바르지 않아요' }
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('participants')
      .insert({
        event_id: parsed.data.eventId,
        name: parsed.data.name,
        grade: parsed.data.grade,
        gender: parsed.data.gender,
        phone: parsed.data.phone || null,
        birth_date: parsed.data.birthDate || null,
        fee_paid: false,
      })
      .select('id')
      .single()

    if (error) {
      return { error: '참가자 추가에 실패했어요.' }
    }

    return { success: true, data: { id: data.id } }
  } catch {
    return { error: '참가자 추가 중 문제가 발생했어요.' }
  }
}

export async function addParticipantsBulk(input: {
  eventId: string
  participants: { name: string; grade: string; gender: string }[]
}): Promise<BulkActionResult> {
  try {
    const parsed = adminBulkParticipantSchema.safeParse(input)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return { error: firstIssue?.message ?? '입력 데이터가 올바르지 않아요' }
    }

    const supabase = await createServerSupabaseClient()
    const rows = parsed.data.participants.map((p) => ({
      event_id: parsed.data.eventId,
      name: p.name,
      grade: p.grade,
      gender: p.gender,
      fee_paid: false,
    }))

    const { error } = await supabase.from('participants').insert(rows)

    if (error) {
      return { error: '일괄 등록에 실패했어요.' }
    }

    return { success: true, data: { count: rows.length } }
  } catch {
    return { error: '일괄 등록 중 문제가 발생했어요.' }
  }
}

export async function deleteParticipant(id: string): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()

    // Nullify FK references that don't cascade
    await supabase.from('points').update({ participant_id: null }).eq('participant_id', id)
    await supabase.from('income_records').update({ participant_id: null }).eq('participant_id', id)

    // Delete participant (CASCADE handles group_members, attendance, quiz_responses, room_assignments)
    const { error } = await supabase.from('participants').delete().eq('id', id)

    if (error) {
      return { error: '참가자 삭제에 실패했어요.' }
    }

    return { success: true }
  } catch {
    return { error: '참가자 삭제 중 문제가 발생했어요.' }
  }
}

export async function updateParticipant(
  id: string,
  updates: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('participants')
      .update(updates)
      .eq('id', id)

    if (error) {
      return { error: '참가자 정보 수정에 실패했어요.' }
    }

    return { success: true }
  } catch {
    return { error: '참가자 정보 수정 중 문제가 발생했어요.' }
  }
}
