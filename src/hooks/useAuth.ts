'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { getSupabaseClient } from '@/lib/supabase/client'
import { useDemoStore } from '@/stores/demoStore'

export function useAuth() {
  const router = useRouter()
  const isDemoMode = useDemoStore((s) => s.isDemoMode)

  const signInWithKakao = useCallback(async () => {
    if (isDemoMode) return
    const supabase = getSupabaseClient()
    if (!supabase) return
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
  }, [isDemoMode])

  const signInWithGoogle = useCallback(async () => {
    if (isDemoMode) return
    const supabase = getSupabaseClient()
    if (!supabase) return
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
  }, [isDemoMode])

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      useDemoStore.getState().disableDemo()
      router.push('/')
      return
    }
    const supabase = getSupabaseClient()
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/login')
  }, [router, isDemoMode])

  return { signInWithKakao, signInWithGoogle, signOut }
}
