'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-keys'
import { useDemoStore } from '@/stores/demoStore'
import { DEMO_PARTICIPANTS } from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'

import type { Participant } from '@/types'

interface ParticipantFilters {
  search?: string
  feePaid?: boolean
}

export function useParticipants(eventId: string | null, filters?: ParticipantFilters) {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)

  const query = useQuery({
    queryKey: queryKeys.participants(eventId!, filters as Record<string, unknown>),
    queryFn: async (): Promise<Participant[]> => {
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
    enabled: eventId !== null && !isDemoMode,
  })

  if (isDemoMode) {
    let filtered = [...DEMO_PARTICIPANTS]
    if (filters?.feePaid !== undefined) {
      filtered = filtered.filter((p) => p.fee_paid === filters.feePaid)
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(search))
    }
    return createDemoQueryResult(filtered)
  }

  return query
}

export function useParticipant(id: string | null) {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)

  const query = useQuery({
    queryKey: queryKeys.participant(id!),
    queryFn: async (): Promise<Participant> => {
      const supabase = getSupabaseClient()!
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('id', id!)
        .single()

      if (error) throw error
      return data as Participant
    },
    enabled: id !== null && !isDemoMode,
  })

  if (isDemoMode) {
    const participant = DEMO_PARTICIPANTS.find((p) => p.id === id) ?? null
    return createDemoQueryResult(participant)
  }

  return query
}
