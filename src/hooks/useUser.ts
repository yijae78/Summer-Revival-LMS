'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'

import { useAppModeStore } from '@/stores/appModeStore'
import { DEMO_USER } from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'
import { getAll } from '@/lib/local-db'

import type { UserRole } from '@/types'

interface UserProfile {
  id: string
  name: string
  role: UserRole
  phone: string | null
  avatarUrl: string | null
  hasSeenOnboarding: boolean
}

export function useUser() {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async (): Promise<UserProfile | null> => {
      if (mode === 'local') {
        const profiles = getAll<UserProfile & Record<string, unknown>>('profiles')
        if (profiles.length > 0) {
          const p = profiles[0]
          return {
            id: p.id as string,
            name: p.name as string,
            role: (p.role as UserRole) ?? 'admin',
            phone: (p.phone as string | null) ?? null,
            avatarUrl: (p.avatarUrl as string | null) ?? null,
            hasSeenOnboarding: (p.hasSeenOnboarding as boolean) ?? true,
          }
        }
        return DEMO_USER as UserProfile
      }

      const supabase = getSupabaseClient()!
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!data) return null

      return {
        id: data.id,
        name: data.name,
        role: data.role as UserRole,
        phone: data.phone,
        avatarUrl: data.avatar_url,
        hasSeenOnboarding: data.has_seen_onboarding,
      }
    },
    enabled: mode === 'local' || (mode === 'cloud' && isSupabaseConfigured()),
  })

  if (mode === 'demo') {
    return createDemoQueryResult(DEMO_USER as UserProfile)
  }

  if (mode === 'none') {
    return { ...query, data: null, isLoading: false, isFetching: false }
  }

  // Cloud mode without Supabase configured
  if (mode === 'cloud' && !isSupabaseConfigured()) {
    return { ...query, data: null, isLoading: false, isFetching: false }
  }

  return query
}
