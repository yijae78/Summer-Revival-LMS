'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { queryKeys } from '@/lib/query-keys'
import { useDemoStore } from '@/stores/demoStore'
import { DEMO_SCHEDULES } from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'

import type { Schedule } from '@/types'

export function useSchedules(eventId: string | null, day?: number) {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)

  const query = useQuery({
    queryKey: queryKeys.schedules(eventId!, day),
    queryFn: async (): Promise<Schedule[]> => {
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
    enabled: eventId !== null && !isDemoMode && isSupabaseConfigured(),
  })

  if (isDemoMode) {
    let schedules = [...DEMO_SCHEDULES]
    if (day !== undefined) {
      schedules = schedules.filter((s) => s.day_number === day)
    }
    return createDemoQueryResult(schedules)
  }

  return query
}
