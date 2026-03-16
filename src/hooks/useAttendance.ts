'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { queryKeys } from '@/lib/query-keys'
import { useAppModeStore } from '@/stores/appModeStore'
import { DEMO_ATTENDANCE, DEMO_PARTICIPANTS } from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'
import { getAll } from '@/lib/local-db'

import type { AttendanceRecord, Participant } from '@/types'

export interface AttendanceWithParticipant extends AttendanceRecord {
  participant_name: string
}

function buildAttendanceWithNames(
  attendance: AttendanceRecord[],
  participants: Participant[]
): AttendanceWithParticipant[] {
  const nameMap = new Map(participants.map((p) => [p.id, p.name]))
  return attendance.map((a) => ({
    ...a,
    participant_name: nameMap.get(a.participant_id ?? '') ?? '',
  }))
}

export function useAttendance(scheduleId: string | null) {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: queryKeys.attendance(scheduleId!),
    queryFn: async (): Promise<AttendanceWithParticipant[]> => {
      if (mode === 'local') {
        const allAttendance = getAll<AttendanceRecord>('attendance')
        const filtered = allAttendance.filter((a) => a.schedule_id === scheduleId)
        const participants = getAll<Participant>('participants')
        return buildAttendanceWithNames(filtered, participants)
      }

      const supabase = getSupabaseClient()!
      const { data, error } = await supabase
        .from('attendance')
        .select('*, participants(name)')
        .eq('schedule_id', scheduleId!)

      if (error) throw error

      // Flatten the joined participant name
      const records = (data ?? []).map((record: Record<string, unknown>) => {
        const participants = record.participants as { name: string } | null
        return {
          ...record,
          participant_name: participants?.name ?? '',
        } as AttendanceWithParticipant
      })

      return records
    },
    enabled: scheduleId !== null && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
    const filtered = DEMO_ATTENDANCE.filter((a) => a.schedule_id === scheduleId)
    return createDemoQueryResult(buildAttendanceWithNames(filtered, DEMO_PARTICIPANTS))
  }

  return query
}
