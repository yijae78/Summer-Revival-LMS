'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'

import { queryKeys } from '@/lib/query-keys'

export function useEvents() {
  const { data: events, isLoading, error } = useQuery({
    queryKey: queryKeys.events(),
    queryFn: async () => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('events')
        .select('id, name, type, start_date, end_date, location')
        .order('start_date', { ascending: false })
      if (error) throw error
      return data
    },
  })

  return { events, isLoading, error }
}
