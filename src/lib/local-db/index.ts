/**
 * localStorage-based CRUD layer that mimics Supabase table operations.
 * Each table is stored under the key `local-db-{tableName}`.
 */

const PREFIX = 'local-db-'

function getStorageKey(tableName: string): string {
  return `${PREFIX}${tableName}`
}

function readTable<T>(tableName: string): T[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(getStorageKey(tableName))
  if (!raw) return []
  try {
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

function writeTable<T>(tableName: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(getStorageKey(tableName), JSON.stringify(data))
}

export function getAll<T>(tableName: string): T[] {
  return readTable<T>(tableName)
}

export function getById<T extends { id: string }>(tableName: string, id: string): T | null {
  const items = readTable<T>(tableName)
  return items.find((item) => item.id === id) ?? null
}

export function insert<T extends { id?: string }>(tableName: string, item: T): T {
  const items = readTable<T>(tableName)
  const newItem = {
    ...item,
    id: item.id ?? crypto.randomUUID(),
  } as T
  items.push(newItem)
  writeTable(tableName, items)
  return newItem
}

export function update<T extends { id: string }>(
  tableName: string,
  id: string,
  updates: Partial<T>
): T | null {
  const items = readTable<T>(tableName)
  const index = items.findIndex((item) => item.id === id)
  if (index === -1) return null

  const updated = { ...items[index], ...updates } as T
  items[index] = updated
  writeTable(tableName, items)
  return updated
}

export function remove(tableName: string, id: string): boolean {
  const items = readTable<{ id: string }>(tableName)
  const index = items.findIndex((item) => item.id === id)
  if (index === -1) return false

  items.splice(index, 1)
  writeTable(tableName, items)
  return true
}

export function query<T extends Record<string, unknown>>(
  tableName: string,
  filters?: Record<string, unknown>
): T[] {
  const items = readTable<T>(tableName)
  if (!filters) return items

  return items.filter((item) =>
    Object.entries(filters).every(([key, value]) => item[key] === value)
  )
}

export function clearTable(tableName: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(getStorageKey(tableName))
}

export function tableExists(tableName: string): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(getStorageKey(tableName)) !== null
}
