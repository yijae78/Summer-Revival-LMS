'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'

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
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async (): Promise<UserProfile | null> => {
      const supabase = getSupabaseClient()
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
  })
}
