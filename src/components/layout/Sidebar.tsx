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
  FolderOpen,
  Flame,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { getDepartmentByKey, getDepartmentTheme } from '@/constants/departments'
import { useDepartmentFilterStore } from '@/stores/departmentFilterStore'

import type { UserRole } from '@/types'

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
  color: string
}

// Quick access (2x2 grid at top)
const QUICK_NAV: NavItem[] = [
  { label: '홈', icon: Home, href: '/dashboard', color: '#818cf8' },
  { label: '일정', icon: Calendar, href: '/schedule', color: '#a78bfa' },
  { label: '출석', icon: ClipboardCheck, href: '/attendance', color: '#34d399' },
  { label: '퀴즈', icon: Gamepad2, href: '/quiz', color: '#fbbf24' },
]

// Menu sections
const MENU_SECTIONS: Record<UserRole, { label: string; items: NavItem[] }[]> = {
  admin: [
    {
      label: '관리',
      items: [
        { label: '참가자', icon: Users, href: '/participants', color: '#6366f1' },
        { label: '조/반', icon: UsersRound, href: '/groups', color: '#f97316' },
        { label: '회계', icon: Banknote, href: '/accounting', color: '#2dd4bf' },
      ],
    },
    {
      label: '소통',
      items: [
        { label: '공지', icon: Megaphone, href: '/announcements', color: '#f43f5e' },
        { label: '갤러리', icon: Image, href: '/gallery', color: '#22d3ee' },
        { label: '자료실', icon: FolderOpen, href: '/materials', color: '#e879f9' },
      ],
    },
  ],
  staff: [
    {
      label: '관리',
      items: [
        { label: '조/반', icon: UsersRound, href: '/groups', color: '#f97316' },
        { label: '회계', icon: Banknote, href: '/accounting', color: '#2dd4bf' },
      ],
    },
    {
      label: '소통',
      items: [
        { label: '공지', icon: Megaphone, href: '/announcements', color: '#f43f5e' },
      ],
    },
  ],
  student: [
    {
      label: '활동',
      items: [
        { label: '갤러리', icon: Image, href: '/gallery', color: '#22d3ee' },
        { label: '공지', icon: Megaphone, href: '/announcements', color: '#f43f5e' },
      ],
    },
  ],
  parent: [
    {
      label: '정보',
      items: [
        { label: '공지', icon: Megaphone, href: '/announcements', color: '#f43f5e' },
        { label: '갤러리', icon: Image, href: '/gallery', color: '#22d3ee' },
      ],
    },
  ],
}

interface SidebarProps {
  role?: UserRole
}

export function Sidebar({ role = 'admin' }: SidebarProps) {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebarStore()
  const sections = MENU_SECTIONS[role]
  const { event } = useCurrentEvent()
  const settings = (event?.settings ?? {}) as Record<string, unknown>
  const churchName = (settings.churchName as string) ?? null
  const deptKey = useDepartmentFilterStore((s) => s.department)
  const deptDef = getDepartmentByKey(deptKey)
  const deptTheme = getDepartmentTheme(deptKey)

  function isActive(href: string) {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  }

  return (
    <aside
      className={cn(
        'flex flex-col transition-all duration-300 relative',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
      style={{
        background: 'linear-gradient(180deg, #0a0f1e 0%, #0f1629 30%, #111b30 60%, #0d1424 100%)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.4), 2px 0 8px rgba(0,0,0,0.3), inset -1px 0 0 rgba(255,255,255,0.03)',
      }}
    >
      {/* Top inner glow */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-32 w-full transition-all duration-700"
        style={{ background: `linear-gradient(180deg, rgba(${deptTheme.primary},0.06) 0%, transparent 100%)` }}
      />

      {/* Right edge highlight */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-px transition-all duration-700"
        style={{ background: `linear-gradient(180deg, rgba(${deptTheme.primary},0.35) 0%, rgba(${deptTheme.secondary},0.15) 50%, transparent 100%)` }}
      />

      {/* ── Logo + Church + Department ── */}
      <div className="border-b border-white/[0.06] px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, rgba(${deptTheme.primary},0.9), rgba(${deptTheme.secondary},0.8))`,
              boxShadow: `0 4px 14px rgba(${deptTheme.primary},0.35), inset 0 1px 0 rgba(255,255,255,0.15)`,
            }}
          >
            <Flame className="h-4.5 w-4.5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <span
                className="block truncate text-sm font-black tracking-wider bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(90deg, rgba(${deptTheme.primary},1), rgba(${deptTheme.secondary},0.9))` }}
              >
                FLOWING
              </span>
              {churchName && (
                <span className="block truncate text-[0.6875rem] text-slate-500">{churchName}</span>
              )}
            </div>
          )}
        </div>

        {/* Current department badge */}
        {!collapsed && deptKey !== 'all' && deptDef && (
          <div
            className="mt-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, rgba(${deptTheme.primary},0.12), rgba(${deptTheme.secondary},0.06))`,
              border: `1px solid rgba(${deptTheme.primary},0.2)`,
              color: `rgba(${deptTheme.primary},0.9)`,
            }}
          >
            <span>{deptDef.emoji}</span>
            <span>{deptDef.label}</span>
          </div>
        )}
      </div>

      {/* ── Quick Access 2x2 Grid ── */}
      {!collapsed && (
        <div className="border-b border-white/[0.06] px-3 py-3">
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_NAV.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group relative flex flex-col items-center gap-1.5 rounded-xl px-2 py-3',
                    'text-xs font-medium transition-all duration-200',
                    'min-h-[60px] justify-center',
                    active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  )}
                  style={active ? {
                    background: `linear-gradient(135deg, ${item.color}20, ${item.color}08)`,
                    boxShadow: `0 2px 12px ${item.color}18, inset 0 1px 0 rgba(255,255,255,0.05)`,
                    border: `1px solid ${item.color}25`,
                  } : {
                    border: '1px solid rgba(255,255,255,0.04)',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <item.icon
                    className="h-5 w-5 transition-all duration-200 group-hover:scale-110"
                    style={active ? { color: item.color } : undefined}
                  />
                  <span>{item.label}</span>

                  {!active && (
                    <div
                      className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      style={{ background: `linear-gradient(135deg, ${item.color}08, transparent)` }}
                    />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Collapsed: Quick nav as single column ── */}
      {collapsed && (
        <div className="border-b border-white/[0.06] px-2 py-2">
          {QUICK_NAV.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex h-10 w-full items-center justify-center rounded-lg transition-all duration-200',
                  active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                )}
                style={active ? {
                  background: `linear-gradient(135deg, ${item.color}20, ${item.color}08)`,
                  border: `1px solid ${item.color}25`,
                } : undefined}
                title={item.label}
              >
                <item.icon className="h-[18px] w-[18px]" style={active ? { color: item.color } : undefined} />
              </Link>
            )
          })}
        </div>
      )}

      {/* ── Section Menus ── */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-2">
        {sections.map((section) => (
          <div key={section.label} className="mb-3">
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[0.625rem] font-bold uppercase tracking-widest text-slate-600">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-[0.8125rem] font-medium',
                      'min-h-[40px] transition-all duration-200',
                      active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                    )}
                    style={active ? {
                      background: `linear-gradient(135deg, ${item.color}18, ${item.color}06)`,
                      border: `1px solid ${item.color}20`,
                    } : undefined}
                    title={collapsed ? item.label : undefined}
                  >
                    {/* Active bar */}
                    {active && (
                      <div
                        className="absolute -left-2.5 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
                        style={{ background: item.color, boxShadow: `0 0 6px ${item.color}60` }}
                      />
                    )}

                    <div
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all duration-200',
                        !active && 'bg-white/[0.04] group-hover:bg-white/[0.08]'
                      )}
                      style={active ? { background: `${item.color}20` } : undefined}
                    >
                      <item.icon
                        className="h-4 w-4"
                        style={active ? { color: item.color } : undefined}
                      />
                    </div>

                    {!collapsed && <span className="truncate">{item.label}</span>}

                    {!active && (
                      <div
                        className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        style={{ background: `linear-gradient(135deg, ${item.color}06, transparent)` }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Bottom: Settings + Collapse ── */}
      <div className="border-t border-white/[0.06] px-2.5 py-2">
        <Link
          href="/settings"
          className={cn(
            'group flex items-center gap-3 rounded-lg px-2.5 py-2 text-[0.8125rem] font-medium min-h-[40px] transition-all duration-200',
            isActive('/settings') ? 'text-white bg-white/[0.06]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
          )}
          title={collapsed ? '설정' : undefined}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>설정</span>}
        </Link>

        <button
          type="button"
          onClick={toggle}
          className={cn(
            'mt-1 flex min-h-[40px] w-full items-center justify-center gap-2 rounded-lg px-2.5 py-2',
            'text-xs text-slate-600 transition-all duration-200',
            'hover:bg-white/[0.04] hover:text-slate-400 active:scale-[0.97]'
          )}
          aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /><span>접기</span></>}
        </button>
      </div>
    </aside>
  )
}
