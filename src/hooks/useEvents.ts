'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'

import { queryKeys } from '@/lib/query-keys'
import { useDemoStore } from '@/stores/demoStore'
import { DEMO_EVENT } from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'

export function useEvents() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)

  const query = useQuery({
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
    enabled: !isDemoMode,
  })

  if (isDemoMode) {
    const demoResult = createDemoQueryResult([DEMO_EVENT])
    return { events: demoResult.data, isLoading: demoResult.isLoading, error: demoResult.error }
  }

  return { events: query.data, isLoading: query.isLoading, error: query.error }
}
