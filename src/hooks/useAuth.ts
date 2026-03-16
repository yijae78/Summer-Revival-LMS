'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { getSupabaseClient } from '@/lib/supabase/client'
import { useAppModeStore } from '@/stores/appModeStore'
import { useDemoStore } from '@/stores/demoStore'

export function useAuth() {
  const router = useRouter()
  const mode = useAppModeStore((s) => s.mode)
  const isNonCloud = mode === 'demo' || mode === 'local'

  const signInWithKakao = useCallback(async () => {
    if (isNonCloud) return
    const supabase = getSupabaseClient()
    if (!supabase) return
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
  }, [isNonCloud])

  const signInWithGoogle = useCallback(async () => {
    if (isNonCloud) return
    const supabase = getSupabaseClient()
    if (!supabase) return
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
  }, [isNonCloud])

  const signOut = useCallback(async () => {
    if (isNonCloud) {
      // Reset both stores for backward compatibility
      useDemoStore.getState().disableDemo()
      useAppModeStore.getState().resetMode()
      router.push('/')
      return
    }
    const supabase = getSupabaseClient()
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/login')
  }, [router, isNonCloud])

  return { signInWithKakao, signInWithGoogle, signOut }
}
