import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { getSupabaseConfig } from './config'

let clientInstance: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  const config = getSupabaseConfig()
  if (!config) {
    throw new Error('Supabase is not configured. Please complete the setup wizard.')
  }

  if (!clientInstance) {
    clientInstance = createClient(config.url, config.anonKey)
  }

  return clientInstance
}

export function resetSupabaseClient(): void {
  clientInstance = null
}
