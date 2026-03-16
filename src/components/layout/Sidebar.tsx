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
import { useCurrentEvent } from '@/hooks/useCurrentEvent'

import type { UserRole } from '@/types'

function SidebarTitle() {
  const { event } = useCurrentEvent()
  const settings = (event?.settings ?? {}) as Record<string, unknown>
  const departments = (settings.departments as string[]) ?? []
  const eventName = event?.name

  if (eventName) {
    const deptLabel = departments.length > 0 ? ` ${departments.join('·')}` : ''
    return (
      <span
        className="truncate bg-clip-text text-[0.8125rem] font-bold text-transparent"
        style={{
          backgroundImage: 'linear-gradient(90deg, #818cf8, #c084fc, #e879f9)',
        }}
      >
        {eventName}{deptLabel}
      </span>
    )
  }

  return (
    <span
      className="bg-clip-text text-sm font-black tracking-wider text-transparent"
      style={{
        backgroundImage: 'linear-gradient(90deg, #818cf8, #c084fc, #e879f9)',
      }}
    >
      FLOWING
    </span>
  )
}

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
        'hidden lg:flex flex-col border-r border-white/[0.08] bg-gradient-to-b from-[#0f172a] via-[#131b2e] to-[#0f172a] transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo / Event name */}
      <div className="flex h-14 items-center border-b border-white/[0.06] px-4">
        {!collapsed && (
          <SidebarTitle />
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                'min-h-[48px]',
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-300 shadow-[0_0_16px_rgba(99,102,241,0.12)] border border-indigo-500/20'
                  : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground border border-transparent'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-indigo-400')} />
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
