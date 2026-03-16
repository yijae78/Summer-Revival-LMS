'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-keys'

import type { AttendanceRecord } from '@/types'

export interface AttendanceWithParticipant extends AttendanceRecord {
  participant_name: string
}

export function useAttendance(scheduleId: string | null) {
  return useQuery({
    queryKey: queryKeys.attendance(scheduleId!),
    queryFn: async (): Promise<AttendanceWithParticipant[]> => {
      const supabase = getSupabaseClient()
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
    enabled: scheduleId !== null,
  })
}
