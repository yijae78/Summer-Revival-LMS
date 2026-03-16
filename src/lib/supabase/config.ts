const STORAGE_KEY = 'supabase_config'

export interface SupabaseConfig {
  url: string
  anonKey: string
}

export function getSupabaseConfig(): SupabaseConfig | null {
  // Priority 1: Environment variables
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey }
  }

  // Priority 2: localStorage (BYOS mode)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SupabaseConfig
        if (parsed.url && parsed.anonKey) return parsed
      } catch {
        // Invalid stored config
      }
    }
  }

  return null
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }
}

export function clearSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
    // Also clear cookies used for server-side BYOS access
    document.cookie = 'sb-url=; path=/; max-age=0; SameSite=Lax'
    document.cookie = 'sb-anon-key=; path=/; max-age=0; SameSite=Lax'
  }
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null
}

interface CookieReader {
  get: (name: string) => { value: string } | undefined
}

export function getSupabaseConfigFromCookies(cookieStore: CookieReader): SupabaseConfig | null {
  const url = cookieStore.get('sb-url')?.value
  const anonKey = cookieStore.get('sb-anon-key')?.value
  if (url && anonKey) return { url, anonKey }
  return null
}
