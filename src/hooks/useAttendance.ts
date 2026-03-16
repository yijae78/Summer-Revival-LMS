'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-keys'
import { useDemoStore } from '@/stores/demoStore'
import { DEMO_ATTENDANCE, DEMO_PARTICIPANTS } from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'

import type { AttendanceRecord } from '@/types'

export interface AttendanceWithParticipant extends AttendanceRecord {
  participant_name: string
}

export function useAttendance(scheduleId: string | null) {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)

  const query = useQuery({
    queryKey: queryKeys.attendance(scheduleId!),
    queryFn: async (): Promise<AttendanceWithParticipant[]> => {
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
    enabled: scheduleId !== null && !isDemoMode,
  })

  if (isDemoMode) {
    const nameMap = new Map(DEMO_PARTICIPANTS.map((p) => [p.id, p.name]))
    const filtered = DEMO_ATTENDANCE
      .filter((a) => a.schedule_id === scheduleId)
      .map((a) => ({
        ...a,
        participant_name: nameMap.get(a.participant_id ?? '') ?? '',
      }))
    return createDemoQueryResult(filtered)
  }

  return query
}
