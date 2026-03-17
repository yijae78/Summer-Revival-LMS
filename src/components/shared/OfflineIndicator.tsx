'use client'

import { useEffect, useRef, useState } from 'react'
import { WifiOff } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

export function OfflineIndicator() {
  const isOnline = useNetworkStatus()
  const [showRecovery, setShowRecovery] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)
  const wasEverOnlineRef = useRef(false)

  // Track whether user was ever online (distinguishes initial offline from reconnection)
  useEffect(() => {
    if (isOnline) {
      wasEverOnlineRef.current = true
    }
  }, [isOnline])

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true)
      setShowRecovery(false)
    } else if (wasOffline && wasEverOnlineRef.current) {
      setShowRecovery(true)
      const timer = setTimeout(() => {
        setShowRecovery(false)
        setWasOffline(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, wasOffline])

  if (isOnline && !showRecovery) return null

  return (
    <div
      role="status"
      aria-live="assertive"
      className={cn(
        'fixed top-0 right-0 left-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300',
        !isOnline && 'bg-amber-500 text-amber-950',
        showRecovery && 'bg-emerald-500 text-white'
      )}
    >
      {!isOnline && (
        <>
          <WifiOff className="h-4 w-4" />
          <span>인터넷 연결이 끊어졌어요</span>
        </>
      )}
      {showRecovery && (
        <span>다시 연결되었어요!</span>
      )}
    </div>
  )
}
