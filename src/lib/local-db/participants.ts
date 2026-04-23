/**
 * Local-DB write helpers for participants.
 * Used when appMode === 'local' — Server Actions cannot access localStorage.
 */

import { insert, update, remove, query } from '@/lib/local-db'

import type { Participant } from '@/types'

interface AdminParticipantInput {
  name: string
  grade: string
  gender: string
  phone?: string
  birthDate?: string
  eventId: string
}

export function addLocalParticipant(input: AdminParticipantInput): Participant {
  const participant: Participant = {
    id: crypto.randomUUID(),
    event_id: input.eventId,
    user_id: null,
    name: input.name,
    birth_date: input.birthDate || null,
    gender: input.gender,
    grade: input.grade,
    phone: input.phone || null,
    parent_phone: null,
    emergency_contact: null,
    health_info: {},
    dietary_restrictions: null,
    transportation: null,
    fee_paid: false,
    consent_personal_info: false,
    consent_sensitive_info: false,
    consent_photo_video: false,
    consent_overseas_transfer: false,
    consent_ip: null,
    created_at: new Date().toISOString(),
  }

  return insert('participants', participant)
}

export function addLocalParticipantsBulk(
  eventId: string,
  participants: { name: string; grade: string; gender: string }[]
): Participant[] {
  return participants.map((p) =>
    addLocalParticipant({ ...p, eventId })
  )
}

export function updateLocalParticipant(
  id: string,
  updates: Partial<Participant>
): Participant | null {
  return update<Participant>('participants', id, updates)
}

export function deleteLocalParticipant(id: string): boolean {
  // Clean up related tables (mimicking CASCADE behavior)
  const relatedTables = ['group_members', 'attendance', 'quiz_responses', 'room_assignments']
  for (const table of relatedTables) {
    const rows = query<{ id: string; participant_id: string }>(table, { participant_id: id })
    for (const row of rows) {
      remove(table, row.id)
    }
  }

  // Nullify participant_id in non-cascade tables
  const pointRows = query<{ id: string; participant_id: string | null }>(
    'points',
    { participant_id: id }
  )
  for (const row of pointRows) {
    update<{ id: string; participant_id: string | null }>('points', row.id, { participant_id: null })
  }

  const incomeRows = query<{ id: string; participant_id: string | null }>(
    'income_records',
    { participant_id: id }
  )
  for (const row of incomeRows) {
    update<{ id: string; participant_id: string | null }>('income_records', row.id, { participant_id: null })
  }

  return remove('participants', id)
}
