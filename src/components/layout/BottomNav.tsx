'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  Calendar,
  ClipboardCheck,
  Gamepad2,
  Settings,
  Banknote,
} from 'lucide-react'

import { cn } from '@/lib/utils'

import type { UserRole } from '@/types'

interface NavTab {
  label: string
  icon: React.ElementType
  href: string
}

const tabsByRole: Record<UserRole, NavTab[]> = {
  admin: [
    { label: '홈', icon: Home, href: '/dashboard' },
    { label: '참가자', icon: Users, href: '/participants' },
    { label: '출석', icon: ClipboardCheck, href: '/attendance' },
    { label: '퀴즈', icon: Gamepad2, href: '/quiz' },
    { label: '설정', icon: Settings, href: '/settings' },
  ],
  staff: [
    { label: '홈', icon: Home, href: '/dashboard' },
    { label: '출석', icon: ClipboardCheck, href: '/attendance' },
    { label: '회계', icon: Banknote, href: '/accounting' },
    { label: '일정', icon: Calendar, href: '/schedule' },
    { label: '설정', icon: Settings, href: '/settings' },
  ],
  student: [
    { label: '홈', icon: Home, href: '/dashboard' },
    { label: '일정', icon: Calendar, href: '/schedule' },
    { label: '퀴즈', icon: Gamepad2, href: '/quiz' },
    { label: '설정', icon: Settings, href: '/settings' },
  ],
  parent: [
    { label: '홈', icon: Home, href: '/dashboard' },
    { label: '일정', icon: Calendar, href: '/schedule' },
    { label: '퀴즈', icon: Gamepad2, href: '/quiz' },
    { label: '설정', icon: Settings, href: '/settings' },
  ],
}

interface BottomNavProps {
  role?: UserRole
}

export function BottomNav({ role = 'admin' }: BottomNavProps) {
  const pathname = usePathname()
  const tabs = tabsByRole[role]

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex h-16 items-center justify-around">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== '/dashboard' && pathname.startsWith(tab.href))

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-1',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <tab.icon className="h-[22px] w-[22px]" aria-hidden="true" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
