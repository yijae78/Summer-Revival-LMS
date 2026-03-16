import type { SupabaseClient } from '@supabase/supabase-js'

const REQUIRED_TABLES = [
  '_app_meta',
  'events',
  'profiles',
  'participants',
  'groups',
  'group_members',
  'schedules',
  'attendance',
  'announcements',
  'materials',
  'quizzes',
  'points',
]

export async function checkSchemaInitialized(
  supabase: SupabaseClient
): Promise<{ initialized: boolean; version: string | null; error: string | null; missingTables: string[] }> {
  try {
    // Check schema version from _app_meta
    const { data, error } = await supabase
      .from('_app_meta')
      .select('value')
      .eq('key', 'schema_version')
      .single()

    if (error) {
      return { initialized: false, version: null, error: null, missingTables: ['_app_meta'] }
    }

    // Verify critical tables exist by attempting a lightweight query on each
    const missingTables: string[] = []

    for (const table of REQUIRED_TABLES) {
      if (table === '_app_meta') continue // already verified above
      const { error: tableError } = await supabase
        .from(table)
        .select('id')
        .limit(1)

      if (tableError?.code === '42P01' || tableError?.message?.includes('does not exist')) {
        missingTables.push(table)
      }
    }

    if (missingTables.length > 0) {
      return {
        initialized: false,
        version: data.value,
        error: `다음 테이블이 누락되었어요: ${missingTables.join(', ')}`,
        missingTables,
      }
    }

    return { initialized: true, version: data.value, error: null, missingTables: [] }
  } catch {
    return { initialized: false, version: null, error: 'Schema check failed', missingTables: [] }
  }
}
