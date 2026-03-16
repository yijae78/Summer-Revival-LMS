import type { QueuedAction } from '@/types'

const QUEUE_KEY = 'flowing_offline_queue'
const MAX_RETRY_COUNT = 3

function readQueue(): QueuedAction[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(QUEUE_KEY)
    if (!stored) return []
    return JSON.parse(stored) as QueuedAction[]
  } catch {
    return []
  }
}

function writeQueue(queue: QueuedAction[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  } catch {
    // localStorage might be full or unavailable
  }
}

export function enqueue(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount' | 'status'>): void {
  const queue = readQueue()

  const item: QueuedAction = {
    id: `${action.table}_${action.action}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    action: action.action,
    table: action.table,
    payload: action.payload,
    timestamp: Date.now(),
    retryCount: 0,
    status: 'pending',
  }

  queue.push(item)
  writeQueue(queue)
}

export function dequeue(): QueuedAction | null {
  const queue = readQueue()
  if (queue.length === 0) return null

  const item = queue[0]
  writeQueue(queue.slice(1))
  return item
}

export function peek(): QueuedAction | null {
  const queue = readQueue()
  return queue.length > 0 ? queue[0] : null
}

export function size(): number {
  return readQueue().length
}

export function clear(): void {
  writeQueue([])
}

export function getAll(): QueuedAction[] {
  return readQueue()
}

export function removeById(id: string): void {
  const queue = readQueue()
  writeQueue(queue.filter((item) => item.id !== id))
}

export function updateItem(id: string, updates: Partial<QueuedAction>): void {
  const queue = readQueue()
  const index = queue.findIndex((item) => item.id === id)

  if (index === -1) return

  queue[index] = { ...queue[index], ...updates }
  writeQueue(queue)
}

export function incrementRetry(id: string): boolean {
  const queue = readQueue()
  const item = queue.find((i) => i.id === id)

  if (!item) return false

  const nextRetry = item.retryCount + 1

  if (nextRetry > MAX_RETRY_COUNT) {
    updateItem(id, { status: 'failed', retryCount: nextRetry })
    return false
  }

  updateItem(id, { retryCount: nextRetry })
  return true
}

export function getPendingItems(): QueuedAction[] {
  return readQueue().filter((item) => item.status === 'pending')
}

export function getFailedItems(): QueuedAction[] {
  return readQueue().filter((item) => item.status === 'failed')
}

export { MAX_RETRY_COUNT }
