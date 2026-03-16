'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'

import { queryKeys } from '@/lib/query-keys'
import { useDemoStore } from '@/stores/demoStore'
import { DEMO_MATERIALS } from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'

import type { Material } from '@/types'

export function useMaterials(eventId: string, category?: string) {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)

  const query = useQuery({
    queryKey: queryKeys.materials(eventId, category),
    queryFn: async () => {
      const supabase = getSupabaseClient()!
      let q = supabase
        .from('materials')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (category) {
        q = q.eq('category', category)
      }

      const { data, error } = await q
      if (error) throw error
      return data as Material[]
    },
    enabled: !!eventId && !isDemoMode && isSupabaseConfigured(),
  })

  if (isDemoMode) {
    let materials = [...DEMO_MATERIALS]
    if (category) {
      materials = materials.filter((m) => m.category === category)
    }
    return createDemoQueryResult(materials)
  }

  return query
}
