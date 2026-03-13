'use client'

import { ShieldX } from 'lucide-react'

import { useUser } from '@/hooks/useUser'
import { EmptyState } from './EmptyState'

import type { UserRole } from '@/types'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { data: user, isLoading } = useUser()

  if (isLoading) return null
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      fallback ?? (
        <EmptyState
          icon={ShieldX}
          title="접근 권한이 없어요"
          description="이 페이지를 볼 수 있는 권한이 없어요. 관리자에게 문의해 주세요."
        />
      )
    )
  }

  return <>{children}</>
}
