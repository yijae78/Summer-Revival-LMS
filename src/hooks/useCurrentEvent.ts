'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'

import { useEventStore } from '@/stores/eventStore'
import { queryKeys } from '@/lib/query-keys'
import { useDemoStore } from '@/stores/demoStore'
import { DEMO_EVENT } from '@/lib/demo/data'

export function useCurrentEvent() {
  const eventId = useEventStore((state) => state.currentEventId)
  const isDemoMode = useDemoStore((s) => s.isDemoMode)

  const query = useQuery({
    queryKey: queryKeys.event(eventId!),
    queryFn: async () => {
      const supabase = getSupabaseClient()!
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId!)
        .single()
      if (error) throw error
      return data
    },
    enabled: eventId !== null && !isDemoMode && isSupabaseConfigured(),
  })

  if (isDemoMode) {
    return {
      event: DEMO_EVENT,
      isLoading: false,
      error: null,
      eventId: eventId ?? DEMO_EVENT.id,
    }
  }

  if (!isSupabaseConfigured()) {
    return { event: null, isLoading: false, error: null, eventId }
  }

  return { event: query.data, isLoading: query.isFetching, error: query.error, eventId }
}
