'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'

import { useEventStore } from '@/stores/eventStore'
import { queryKeys } from '@/lib/query-keys'

export function useCurrentEvent() {
  const eventId = useEventStore((state) => state.currentEventId)

  const { data: event, isLoading, error } = useQuery({
    queryKey: queryKeys.event(eventId!),
    queryFn: async () => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId!)
        .single()
      if (error) throw error
      return data
    },
    enabled: eventId !== null,
  })

  return { event, isLoading, error, eventId }
}
