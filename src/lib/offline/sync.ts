import { getSupabaseClient } from '@/lib/supabase/client'

import {
  getAll,
  removeById,
  incrementRetry,
  updateItem,
} from './queue'

interface SyncResult {
  synced: number
  failed: number
  remaining: number
}

async function executeAction(
  supabase: ReturnType<typeof getSupabaseClient>,
  table: string,
  action: string,
  payload: Record<string, unknown>
): Promise<{ error: unknown | null }> {
  switch (action) {
    case 'insert':
      return supabase.from(table).insert(payload)
    case 'update': {
      const { id, ...rest } = payload
      return supabase.from(table).update(rest).eq('id', id as string)
    }
    case 'upsert':
      return supabase.from(table).upsert(payload)
    case 'delete':
      return supabase.from(table).delete().eq('id', payload.id as string)
    default:
      return { error: `Unknown action: ${action}` }
  }
}

export async function startSync(): Promise<SyncResult> {
  const items = getAll().filter((item) => item.status !== 'failed')

  if (items.length === 0) {
    return { synced: 0, failed: 0, remaining: 0 }
  }

  let supabase: ReturnType<typeof getSupabaseClient>
  try {
    supabase = getSupabaseClient()
  } catch {
    // Supabase not configured — cannot sync
    return { synced: 0, failed: 0, remaining: items.length }
  }

  let synced = 0
  let failed = 0

  // Process items in order (FIFO)
  for (const item of items) {
    updateItem(item.id, { status: 'syncing' })

    const { error } = await executeAction(
      supabase,
      item.table,
      item.action,
      item.payload
    )

    if (error) {
      const canRetry = incrementRetry(item.id)
      if (canRetry) {
        updateItem(item.id, { status: 'pending' })
      }
      failed++
    } else {
      removeById(item.id)
      synced++
    }
  }

  const remaining = getAll().filter((i) => i.status === 'pending').length

  return { synced, failed, remaining }
}
