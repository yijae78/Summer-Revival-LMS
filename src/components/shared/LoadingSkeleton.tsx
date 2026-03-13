'use client'

import { cn } from '@/lib/utils'
import { useDelayedLoading } from '@/hooks/useDelayedLoading'

interface LoadingSkeletonProps {
  isLoading: boolean
  children: React.ReactNode
  skeleton: React.ReactNode
}

export function LoadingSkeleton({ isLoading, children, skeleton }: LoadingSkeletonProps) {
  const showSkeleton = useDelayedLoading(isLoading)

  if (!isLoading) return <>{children}</>
  if (!showSkeleton) return null

  return <>{skeleton}</>
}

interface SkeletonBoxProps {
  className?: string
}

export function SkeletonBox({ className }: SkeletonBoxProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-muted',
        className
      )}
    />
  )
}
