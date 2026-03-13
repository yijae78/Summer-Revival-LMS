import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase environment variables are not set for server-side access.')
  }

  const cookieStore = await cookies()

  return createClient(url, anonKey, {
    global: {
      headers: {
        cookie: cookieStore.toString(),
      },
    },
  })
}
