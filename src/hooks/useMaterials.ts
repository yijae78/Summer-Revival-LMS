'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'

import { queryKeys } from '@/lib/query-keys'

import type { Material } from '@/types'

export function useMaterials(eventId: string, category?: string) {
  return useQuery({
    queryKey: queryKeys.materials(eventId, category),
    queryFn: async () => {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('materials')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Material[]
    },
    enabled: !!eventId,
  })
}
