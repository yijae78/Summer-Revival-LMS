import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

import { getSupabaseConfigFromCookies } from '@/lib/supabase/config'

export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies()

  // Priority 1: Environment variables (non-BYOS deployments)
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Priority 2: Cookies (BYOS mode - credentials forwarded from client)
  if (!url || !anonKey) {
    const cookieConfig = getSupabaseConfigFromCookies(cookieStore)
    if (cookieConfig) {
      url = cookieConfig.url
      anonKey = cookieConfig.anonKey
    }
  }

  if (!url || !anonKey) {
    throw new Error(
      'Supabase credentials not found. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables, or complete the BYOS setup wizard.'
    )
  }

  return createClient(url, anonKey, {
    global: {
      headers: {
        cookie: cookieStore.toString(),
      },
    },
  })
}
