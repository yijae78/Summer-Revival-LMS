'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'

import { queryKeys } from '@/lib/query-keys'

import type { Announcement } from '@/types'

export function useAnnouncements(eventId: string, type?: string) {
  return useQuery({
    queryKey: queryKeys.announcements(eventId, type),
    queryFn: async () => {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('announcements')
        .select('*')
        .eq('event_id', eventId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (type) {
        query = query.eq('type', type)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Announcement[]
    },
    enabled: !!eventId,
  })
}
