const MAX_REQUESTS = 30
const WINDOW_MS = 60 * 60 * 1000

const store = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(userId: string): {
  allowed: boolean
  remaining: number
} {
  const now = Date.now()
  const record = store.get(userId)

  if (!record || now > record.resetAt) {
    store.set(userId, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_REQUESTS - 1 }
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: MAX_REQUESTS - record.count }
}

// Cleanup stale entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of store) {
      if (now > value.resetAt) {
        store.delete(key)
      }
    }
  }, 10 * 60 * 1000)
}
