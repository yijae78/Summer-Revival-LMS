'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { queryKeys } from '@/lib/query-keys'
import { useAppModeStore } from '@/stores/appModeStore'
import { DEMO_PARTICIPANTS } from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'
import { getAll } from '@/lib/local-db'

import type { Participant } from '@/types'

interface ParticipantFilters {
  search?: string
  feePaid?: boolean
}

function filterParticipants(participants: Participant[], filters?: ParticipantFilters): Participant[] {
  let filtered = [...participants]
  if (filters?.feePaid !== undefined) {
    filtered = filtered.filter((p) => p.fee_paid === filters.feePaid)
  }
  if (filters?.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(search))
  }
  return filtered
}

export function useParticipants(eventId: string | null, filters?: ParticipantFilters) {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: queryKeys.participants(eventId!, filters as Record<string, unknown>),
    queryFn: async (): Promise<Participant[]> => {
      if (mode === 'local') {
        const all = getAll<Participant>('participants')
        const byEvent = all.filter((p) => p.event_id === eventId)
        return filterParticipants(byEvent, filters)
      }

      const supabase = getSupabaseClient()!
      let q = supabase
        .from('participants')
        .select('*')
        .eq('event_id', eventId!)
        .order('created_at', { ascending: false })

      if (filters?.feePaid !== undefined) {
        q = q.eq('fee_paid', filters.feePaid)
      }

      if (filters?.search) {
        q = q.ilike('name', `%${filters.search}%`)
      }

      const { data, error } = await q

      if (error) throw error
      return (data ?? []) as Participant[]
    },
    enabled: eventId !== null && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
    return createDemoQueryResult(filterParticipants(DEMO_PARTICIPANTS, filters))
  }

  if (mode === 'none' || (mode === 'cloud' && !isSupabaseConfigured())) {
    return createDemoQueryResult([])
  }

  return query
}

export function useParticipant(id: string | null) {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: queryKeys.participant(id!),
    queryFn: async (): Promise<Participant> => {
      if (mode === 'local') {
        const all = getAll<Participant>('participants')
        const found = all.find((p) => p.id === id)
        if (!found) throw new Error('Participant not found')
        return found
      }

      const supabase = getSupabaseClient()!
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('id', id!)
        .single()

      if (error) throw error
      return data as Participant
    },
    enabled: id !== null && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
    const participant = DEMO_PARTICIPANTS.find((p) => p.id === id) ?? null
    return createDemoQueryResult(participant)
  }

  return query
}
