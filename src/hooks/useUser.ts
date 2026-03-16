'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'

import { useDemoStore } from '@/stores/demoStore'
import { DEMO_USER } from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'

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
  const isDemoMode = useDemoStore((s) => s.isDemoMode)

  const query = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async (): Promise<UserProfile | null> => {
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
    enabled: !isDemoMode && isSupabaseConfigured(),
  })

  if (isDemoMode) {
    return createDemoQueryResult(DEMO_USER as UserProfile)
  }

  return query
}
