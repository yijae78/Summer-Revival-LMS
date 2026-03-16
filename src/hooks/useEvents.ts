'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'

import { queryKeys } from '@/lib/query-keys'
import { useAppModeStore } from '@/stores/appModeStore'
import { DEMO_EVENT } from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'
import { getAll } from '@/lib/local-db'

import type { Event } from '@/types'

export function useEvents() {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: queryKeys.events(),
    queryFn: async () => {
      if (mode === 'local') {
        const events = getAll<Event>('events')
        return events.sort(
          (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        )
      }

      const supabase = getSupabaseClient()!
      const { data, error } = await supabase
        .from('events')
        .select('id, name, type, start_date, end_date, location')
        .order('start_date', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: mode === 'local' || (mode === 'cloud' && isSupabaseConfigured()),
  })

  if (mode === 'demo') {
    const demoResult = createDemoQueryResult([DEMO_EVENT])
    return { events: demoResult.data, isLoading: false, error: null }
  }

  if (mode === 'none') {
    return { events: null, isLoading: false, error: null }
  }

  // Cloud mode without Supabase configured
  if (mode === 'cloud' && !isSupabaseConfigured()) {
    return { events: null, isLoading: false, error: null }
  }

  return { events: query.data, isLoading: query.isFetching, error: query.error }
}
