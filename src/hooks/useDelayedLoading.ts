'use client'

import { useEffect, useState } from 'react'

const SKELETON_DELAY_MS = 300

export function useDelayedLoading(isLoading: boolean): boolean {
  const [showSkeleton, setShowSkeleton] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setShowSkeleton(false)
      return
    }

    const timer = setTimeout(() => {
      setShowSkeleton(true)
    }, SKELETON_DELAY_MS)

    return () => clearTimeout(timer)
  }, [isLoading])

  return showSkeleton
}
