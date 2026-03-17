'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Menu, Flame, ChevronRight, Home } from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { getDepartmentByKey, getDepartmentTheme } from '@/constants/departments'
import { useDepartmentFilterStore } from '@/stores/departmentFilterStore'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Page name mapping for breadcrumb
const PAGE_NAMES: Record<string, string> = {
  '/dashboard': '홈',
  '/participants': '참가자',
  '/schedule': '일정',
  '/attendance': '출석',
  '/quiz': '퀴즈',
  '/groups': '조/반',
  '/announcements': '공지사항',
  '/gallery': '갤러리',
  '/materials': '자료실',
  '/accounting': '회계',
  '/settings': '설정',
  '/leaderboard': '리더보드',
}

function getBreadcrumb(pathname: string): string {
  if (PAGE_NAMES[pathname]) return PAGE_NAMES[pathname]
  // Match dynamic routes like /participants/123
  const base = '/' + pathname.split('/')[1]
  return PAGE_NAMES[base] ?? ''
}

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname()
  const { event } = useCurrentEvent()
  const settings = (event?.settings ?? {}) as Record<string, unknown>
  const rawChurchName = (settings.churchName as string) ?? null
  const departmentKeys = (settings.departments as string[]) ?? []
  const departmentLabels = departmentKeys.map((k) => getDepartmentByKey(k)?.label ?? k)
  const eventTheme = (settings.theme as string) ?? null
  const themeVerse = (settings.themeVerse as string) ?? null
  const deptKey = useDepartmentFilterStore((s) => s.department)
  const deptTheme = getDepartmentTheme(deptKey)

  const currentPage = getBreadcrumb(pathname)

  return (
    <header
      className={cn('flex h-auto flex-col', className)}
    >
      {/* ── Line 1 + 2: Banner (교회+부서 / 주제+성구) ── */}
      {(rawChurchName || eventTheme) && (
        <div
          className="relative overflow-hidden transition-all duration-700"
          style={{ background: `linear-gradient(180deg, rgba(${deptTheme.primary},0.07) 0%, rgba(${deptTheme.secondary},0.03) 60%, transparent 100%)` }}
        >
          {/* Subtle ripple effects */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute rounded-full transition-all duration-700"
                style={{
                  width: `${i * 200}px`,
                  height: `${i * 60}px`,
                  background: `radial-gradient(ellipse, rgba(${deptTheme.headerGlow},${0.04 / i}) 0%, transparent 70%)`,
                  animation: `graceRipple ${5 + i}s ease-out infinite`,
                  animationDelay: `${i * 0.8}s`,
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative flex flex-col items-center gap-0.5 px-3 py-3 text-center md:gap-1 md:px-4 md:py-4"
          >
            {/* Church name */}
            {rawChurchName && (
              <p className="text-xs font-bold text-white/90 md:text-sm lg:text-base">
                {rawChurchName}
              </p>
            )}

            {/* Department labels — hidden on very small, scrollable on mobile */}
            {departmentLabels.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1">
                {departmentLabels.map((label, i) => (
                  <span key={i} className="rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[0.5625rem] font-medium text-slate-400 md:text-[0.625rem]">
                    {label}
                  </span>
                ))}
              </div>
            )}

            {/* Theme + Verse in one line */}
            {(eventTheme || themeVerse) && (
              <p className="flex flex-wrap items-center justify-center gap-1.5 text-[0.6875rem] text-slate-400 md:gap-2 md:text-sm">
                {eventTheme && (
                  <span
                    className="font-semibold transition-colors duration-700"
                    style={{ color: `rgba(${deptTheme.primary},0.8)`, textShadow: `0 0 20px rgba(${deptTheme.primary},0.2)` }}
                  >
                    &ldquo;{eventTheme}&rdquo;
                  </span>
                )}
                {themeVerse && (
                  <span className="text-slate-500">— {themeVerse}</span>
                )}
              </p>
            )}
          </motion.div>
        </div>
      )}

      {/* ── Line 3: Navigation bar ── */}
      <div
        className="flex h-12 items-center justify-between border-b border-white/[0.06] px-4"
        style={{ background: 'rgba(12,14,20,0.6)', backdropFilter: 'blur(12px)' }}
      >
        {/* Left: Mobile menu + breadcrumb */}
        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden min-h-[48px] min-w-[48px]"
                aria-label="메뉴 열기"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <div className="flex h-14 items-center border-b px-4">
                <Flame className="mr-2 h-4 w-4 text-indigo-400" />
                <span className="text-sm font-bold">FLOWING</span>
              </div>
              <nav className="space-y-1 p-2">
                <MobileNavLink href="/dashboard" label="홈" />
                <MobileNavLink href="/participants" label="참가자" />
                <MobileNavLink href="/schedule" label="일정" />
                <MobileNavLink href="/attendance" label="출석" />
                <MobileNavLink href="/quiz" label="퀴즈" />
                <MobileNavLink href="/groups" label="조/반" />
                <MobileNavLink href="/announcements" label="공지" />
                <MobileNavLink href="/gallery" label="갤러리" />
                <MobileNavLink href="/materials" label="자료실" />
                <MobileNavLink href="/accounting" label="회계" />
                <MobileNavLink href="/settings" label="설정" />
              </nav>
            </SheetContent>
          </Sheet>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-slate-500 transition-colors hover:text-slate-300"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">홈</span>
            </Link>
            {currentPage && pathname !== '/dashboard' && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-600" />
                <span className="font-medium text-slate-300">{currentPage}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Notification + Avatar */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="relative min-h-[48px] min-w-[48px] text-slate-400 hover:text-slate-200"
            aria-label="알림"
          >
            <Bell className="h-4.5 w-4.5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="min-h-[48px] min-w-[48px]">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[0.625rem] font-semibold">관리</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/settings">설정</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

function MobileNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-[48px] items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {label}
    </Link>
  )
}
