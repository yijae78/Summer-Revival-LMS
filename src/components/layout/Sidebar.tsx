'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  Calendar,
  ClipboardCheck,
  Gamepad2,
  UsersRound,
  Megaphone,
  Image,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Banknote,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/stores/sidebarStore'

import type { UserRole } from '@/types'

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
}

const navByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { label: '홈', icon: Home, href: '/dashboard' },
    { label: '참가자', icon: Users, href: '/participants' },
    { label: '일정', icon: Calendar, href: '/schedule' },
    { label: '출석', icon: ClipboardCheck, href: '/attendance' },
    { label: '퀴즈', icon: Gamepad2, href: '/quiz' },
    { label: '조', icon: UsersRound, href: '/groups' },
    { label: '공지', icon: Megaphone, href: '/announcements' },
    { label: '갤러리', icon: Image, href: '/gallery' },
    { label: '회계', icon: Banknote, href: '/accounting' },
    { label: '설정', icon: Settings, href: '/settings' },
  ],
  staff: [
    { label: '홈', icon: Home, href: '/dashboard' },
    { label: '출석', icon: ClipboardCheck, href: '/attendance' },
    { label: '조', icon: UsersRound, href: '/groups' },
    { label: '공지', icon: Megaphone, href: '/announcements' },
    { label: '일정', icon: Calendar, href: '/schedule' },
    { label: '회계', icon: Banknote, href: '/accounting' },
  ],
  student: [
    { label: '홈', icon: Home, href: '/dashboard' },
    { label: '일정', icon: Calendar, href: '/schedule' },
    { label: '퀴즈', icon: Gamepad2, href: '/quiz' },
    { label: '갤러리', icon: Image, href: '/gallery' },
    { label: '공지', icon: Megaphone, href: '/announcements' },
  ],
  parent: [
    { label: '홈', icon: Home, href: '/dashboard' },
    { label: '일정', icon: Calendar, href: '/schedule' },
    { label: '공지', icon: Megaphone, href: '/announcements' },
    { label: '갤러리', icon: Image, href: '/gallery' },
  ],
}

interface SidebarProps {
  role?: UserRole
}

export function Sidebar({ role = 'admin' }: SidebarProps) {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebarStore()
  const items = navByRole[role]

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col border-r bg-card transition-all duration-200',
        collapsed ? 'w-[72px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && (
          <span className="text-sm font-bold text-foreground">여름행사 LMS</span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 p-2">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                'min-h-[48px]',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t p-2">
        <button
          type="button"
          onClick={toggle}
          className="flex min-h-[48px] w-full items-center justify-center gap-3 rounded-lg px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
          aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <>
              <PanelLeftClose className="h-5 w-5" />
              <span>접기</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
