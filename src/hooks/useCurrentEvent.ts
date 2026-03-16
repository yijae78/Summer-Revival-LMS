'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'

import { useEventStore } from '@/stores/eventStore'
import { queryKeys } from '@/lib/query-keys'
import { useAppModeStore } from '@/stores/appModeStore'
import { DEMO_EVENT } from '@/lib/demo/data'
import { getById } from '@/lib/local-db'

import type { Event } from '@/types'

export function useCurrentEvent() {
  const eventId = useEventStore((state) => state.currentEventId)
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: queryKeys.event(eventId!),
    queryFn: async () => {
      if (mode === 'local') {
        return getById<Event>('events', eventId!) ?? DEMO_EVENT
      }

      const supabase = getSupabaseClient()!
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId!)
        .single()
      if (error) throw error
      return data
    },
    enabled: eventId !== null && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
    return {
      event: DEMO_EVENT,
      isLoading: false,
      error: null,
      eventId: eventId ?? DEMO_EVENT.id,
    }
  }

  if (mode === 'none') {
    return { event: null, isLoading: false, error: null, eventId }
  }

  if (mode === 'cloud' && !isSupabaseConfigured()) {
    return { event: null, isLoading: false, error: null, eventId }
  }

  return { event: query.data, isLoading: query.isFetching, error: query.error, eventId }
}
