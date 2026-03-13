'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { getSupabaseClient } from '@/lib/supabase/client'

export function useAuth() {
  const router = useRouter()

  const signInWithKakao = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
  }, [router])

  return { signInWithKakao, signInWithGoogle, signOut }
}
