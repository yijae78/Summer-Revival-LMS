import type { AttendanceStatus } from '@/types'

const QUEUE_KEY = 'flowing_attendance_queue'

interface QueuedAttendanceRecord {
  id: string
  scheduleId: string
  participantId: string
  status: AttendanceStatus
  timestamp: number
}

export function queueAttendanceCheck(record: {
  scheduleId: string
  participantId: string
  status: AttendanceStatus
}): void {
  if (typeof window === 'undefined') return

  const queue = getQueuedChecks()
  const id = `${record.scheduleId}_${record.participantId}_${Date.now()}`

  // Replace existing entry for the same schedule+participant combo
  const filtered = queue.filter(
    (item) =>
      !(item.scheduleId === record.scheduleId && item.participantId === record.participantId)
  )

  filtered.push({
    id,
    scheduleId: record.scheduleId,
    participantId: record.participantId,
    status: record.status,
    timestamp: Date.now(),
  })

  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered))
  } catch {
    // localStorage might be full or unavailable
  }
}

export function getQueuedChecks(): QueuedAttendanceRecord[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(QUEUE_KEY)
    if (!stored) return []
    return JSON.parse(stored) as QueuedAttendanceRecord[]
  } catch {
    return []
  }
}

export function clearQueuedCheck(id: string): void {
  if (typeof window === 'undefined') return

  const queue = getQueuedChecks()
  const filtered = queue.filter((item) => item.id !== id)

  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered))
  } catch {
    // localStorage might be full or unavailable
  }
}

export async function syncQueuedChecks(
  supabase: { from: (table: string) => { upsert: (data: unknown, options?: unknown) => Promise<{ error: unknown | null }> } }
): Promise<{ synced: number; failed: number }> {
  const queue = getQueuedChecks()
  if (queue.length === 0) return { synced: 0, failed: 0 }

  let synced = 0
  let failed = 0

  for (const record of queue) {
    const { error } = await supabase
      .from('attendance')
      .upsert(
        {
          schedule_id: record.scheduleId,
          participant_id: record.participantId,
          status: record.status,
          checked_at: new Date(record.timestamp).toISOString(),
        },
        {
          onConflict: 'schedule_id,participant_id',
        }
      )

    if (error) {
      failed++
    } else {
      clearQueuedCheck(record.id)
      synced++
    }
  }

  return { synced, failed }
}
