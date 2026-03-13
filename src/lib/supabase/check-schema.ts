import type { SupabaseClient } from '@supabase/supabase-js'

export async function checkSchemaInitialized(
  supabase: SupabaseClient
): Promise<{ initialized: boolean; version: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('_app_meta')
      .select('value')
      .eq('key', 'schema_version')
      .single()

    if (error) {
      return { initialized: false, version: null, error: null }
    }

    return { initialized: true, version: data.value, error: null }
  } catch {
    return { initialized: false, version: null, error: 'Schema check failed' }
  }
}
