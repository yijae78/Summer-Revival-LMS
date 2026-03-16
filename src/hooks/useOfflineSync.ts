'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

import { startSync } from '@/lib/offline/sync'
import { size as getQueueSize } from '@/lib/offline/queue'

export function useOfflineSync() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  // Keep pending count up to date
  useEffect(() => {
    setPendingCount(getQueueSize())

    const interval = setInterval(() => {
      setPendingCount(getQueueSize())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const triggerSync = useCallback(async () => {
    const count = getQueueSize()
    if (count === 0 || isSyncing) return

    setIsSyncing(true)

    try {
      const result = await startSync()
      setPendingCount(getQueueSize())

      if (result.synced > 0) {
        toast.success(`${result.synced}건의 데이터가 동기화됐어요`)
      }

      if (result.failed > 0) {
        toast.error(`${result.failed}건의 동기화에 실패했어요`)
      }
    } catch {
      toast.error('동기화 중 오류가 발생했어요')
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing])

  // Auto-sync when coming back online
  useEffect(() => {
    function handleOnline() {
      const count = getQueueSize()
      if (count > 0) {
        toast.info(`${count}건의 대기 중인 데이터를 동기화하고 있어요...`)
        triggerSync()
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [triggerSync])

  return { isSyncing, pendingCount, triggerSync }
}
