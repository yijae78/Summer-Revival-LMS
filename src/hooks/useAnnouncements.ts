'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'

import { queryKeys } from '@/lib/query-keys'
import { useAppModeStore } from '@/stores/appModeStore'
import { DEMO_ANNOUNCEMENTS } from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'
import { getAll } from '@/lib/local-db'

import type { Announcement } from '@/types'

function sortAnnouncements(announcements: Announcement[]): Announcement[] {
  return [...announcements].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

function filterByDepartment(announcements: Announcement[], department?: string): Announcement[] {
  if (!department || department === 'all') return announcements
  return announcements.filter((a) => !a.department || a.department === department)
}

export function useAnnouncements(eventId: string, type?: string, department?: string) {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: queryKeys.announcements(eventId, type, department),
    queryFn: async () => {
      if (mode === 'local') {
        let announcements = getAll<Announcement>('announcements').filter(
          (a) => a.event_id === eventId
        )
        if (type) {
          announcements = announcements.filter((a) => a.type === type)
        }
        announcements = filterByDepartment(announcements, department)
        return sortAnnouncements(announcements)
      }

      const supabase = getSupabaseClient()!
      let q = supabase
        .from('announcements')
        .select('*')
        .eq('event_id', eventId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (type) {
        q = q.eq('type', type)
      }

      const { data, error } = await q
      if (error) throw error
      return filterByDepartment(data as Announcement[], department)
    },
    enabled: !!eventId && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
    let announcements = [...DEMO_ANNOUNCEMENTS]
    if (type) {
      announcements = announcements.filter((a) => a.type === type)
    }
    announcements = filterByDepartment(announcements, department)
    return createDemoQueryResult(sortAnnouncements(announcements))
  }

  return query
}
