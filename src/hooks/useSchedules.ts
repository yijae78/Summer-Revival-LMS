'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-keys'

import type { Schedule } from '@/types'

export function useSchedules(eventId: string | null, day?: number) {
  return useQuery({
    queryKey: queryKeys.schedules(eventId!, day),
    queryFn: async (): Promise<Schedule[]> => {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('schedules')
        .select('*')
        .eq('event_id', eventId!)
        .order('day_number', { ascending: true })
        .order('order_index', { ascending: true })
        .order('start_time', { ascending: true })

      if (day !== undefined) {
        query = query.eq('day_number', day)
      }

      const { data, error } = await query

      if (error) throw error
      return (data ?? []) as Schedule[]
    },
    enabled: eventId !== null,
  })
}
