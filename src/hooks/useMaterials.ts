'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'

import { queryKeys } from '@/lib/query-keys'
import { useAppModeStore } from '@/stores/appModeStore'
import { DEMO_MATERIALS } from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'
import { getAll } from '@/lib/local-db'

import type { Material } from '@/types'

export function useMaterials(eventId: string, category?: string) {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: queryKeys.materials(eventId, category),
    queryFn: async () => {
      if (mode === 'local') {
        let materials = getAll<Material>('materials').filter(
          (m) => m.event_id === eventId
        )
        if (category) {
          materials = materials.filter((m) => m.category === category)
        }
        return materials.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }

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
    enabled: !!eventId && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
    let materials = [...DEMO_MATERIALS]
    if (category) {
      materials = materials.filter((m) => m.category === category)
    }
    return createDemoQueryResult(materials)
  }

  return query
}
