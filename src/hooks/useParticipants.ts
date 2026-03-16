'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-keys'

import type { Participant } from '@/types'

interface ParticipantFilters {
  search?: string
  feePaid?: boolean
}

export function useParticipants(eventId: string | null, filters?: ParticipantFilters) {
  return useQuery({
    queryKey: queryKeys.participants(eventId!, filters as Record<string, unknown>),
    queryFn: async (): Promise<Participant[]> => {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('participants')
        .select('*')
        .eq('event_id', eventId!)
        .order('created_at', { ascending: false })

      if (filters?.feePaid !== undefined) {
        query = query.eq('fee_paid', filters.feePaid)
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return (data ?? []) as Participant[]
    },
    enabled: eventId !== null,
  })
}

export function useParticipant(id: string | null) {
  return useQuery({
    queryKey: queryKeys.participant(id!),
    queryFn: async (): Promise<Participant> => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('id', id!)
        .single()

      if (error) throw error
      return data as Participant
    },
    enabled: id !== null,
  })
}
