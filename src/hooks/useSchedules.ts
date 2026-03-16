'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { queryKeys } from '@/lib/query-keys'
import { useAppModeStore } from '@/stores/appModeStore'
import { DEMO_SCHEDULES } from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'
import { getAll } from '@/lib/local-db'

import type { Schedule } from '@/types'

export function useSchedules(eventId: string | null, day?: number) {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: queryKeys.schedules(eventId!, day),
    queryFn: async (): Promise<Schedule[]> => {
      if (mode === 'local') {
        let schedules = getAll<Schedule>('schedules').filter(
          (s) => s.event_id === eventId
        )
        if (day !== undefined) {
          schedules = schedules.filter((s) => s.day_number === day)
        }
        return schedules.sort((a, b) => {
          if (a.day_number !== b.day_number) return a.day_number - b.day_number
          if (a.order_index !== b.order_index) return a.order_index - b.order_index
          return a.start_time.localeCompare(b.start_time)
        })
      }

      const supabase = getSupabaseClient()!
      let q = supabase
        .from('schedules')
        .select('*')
        .eq('event_id', eventId!)
        .order('day_number', { ascending: true })
        .order('order_index', { ascending: true })
        .order('start_time', { ascending: true })

      if (day !== undefined) {
        q = q.eq('day_number', day)
      }

      const { data, error } = await q

      if (error) throw error
      return (data ?? []) as Schedule[]
    },
    enabled: eventId !== null && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
    let schedules = [...DEMO_SCHEDULES]
    if (day !== undefined) {
      schedules = schedules.filter((s) => s.day_number === day)
    }
    return createDemoQueryResult(schedules)
  }

  return query
}
