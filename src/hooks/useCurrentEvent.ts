'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'

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
    enabled: eventId !== null && !isDemoMode,
  })

  if (isDemoMode) {
    return {
      event: DEMO_EVENT,
      isLoading: false,
      error: null,
      eventId: eventId ?? DEMO_EVENT.id,
    }
  }

  return { event: query.data, isLoading: query.isLoading, error: query.error, eventId }
}
