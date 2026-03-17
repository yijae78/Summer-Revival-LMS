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
          className="relative transition-all duration-700"
          style={{ background: `linear-gradient(180deg, rgba(${deptTheme.primary},0.12) 0%, rgba(${deptTheme.secondary},0.06) 40%, rgba(${deptTheme.primary},0.02) 80%, transparent 100%)` }}
        >
          {/* White ripple waves — 흰색 물결이 강하게 밀려나감 */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${i * 150}px`,
                  height: `${i * 45}px`,
                  border: `2px solid rgba(255,255,255,${0.35 / i})`,
                  boxShadow: `0 0 ${10 + i * 5}px rgba(255,255,255,${0.15 / i}), inset 0 0 ${5 + i * 2}px rgba(255,255,255,${0.06 / i})`,
                  animation: `graceRipple ${2.5 + i * 0.6}s ease-out infinite`,
                  animationDelay: `${i * 0.35}s`,
                }}
              />
            ))}
          </div>

          {/* Center white glow pulse — 강한 발광 */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2"
            style={{
              width: '400px',
              height: '160px',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 35%, transparent 65%)',
              animation: 'gracePulse 3.5s ease-in-out infinite',
            }}
          />

          {/* White light rays flowing down — 굵고 많게 */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `${3 + i * 6.5}%`,
                  width: '2px',
                  height: `${16 + (i % 4) * 8}px`,
                  borderRadius: '1px',
                  background: `linear-gradient(180deg, rgba(255,255,255,${0.4 + (i % 3) * 0.1}), transparent)`,
                  animation: `graceFlow ${1.5 + i * 0.12}s ease-in infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative flex flex-col items-center gap-1.5 px-3 py-5 text-center md:gap-2 md:px-4 md:py-6"
          >
            {/* Church name — 크게 */}
            {rawChurchName && (
              <motion.p
                className="text-base font-extrabold tracking-tight text-white md:text-lg lg:text-xl"
                animate={{ scale: [1, 1.01, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                style={{ textShadow: `0 0 20px rgba(${deptTheme.primary},0.3)` }}
              >
                {rawChurchName}
              </motion.p>
            )}

            {/* Department labels — pill badges */}
            {departmentLabels.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1">
                {departmentLabels.map((label, i) => (
                  <span
                    key={i}
                    className="rounded-full px-2.5 py-0.5 text-[0.625rem] font-semibold transition-all duration-700 md:text-xs"
                    style={{
                      background: `rgba(${deptTheme.primary},0.12)`,
                      color: `rgba(${deptTheme.primary},0.8)`,
                      border: `1px solid rgba(${deptTheme.primary},0.15)`,
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}

            {/* Theme — 주제 (글로우 강조) */}
            {eventTheme && (
              <motion.p
                className="mt-0.5 text-sm font-bold md:text-base"
                animate={{ scale: [1, 1.015, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                style={{
                  color: `rgba(${deptTheme.primary},0.9)`,
                  textShadow: `0 0 24px rgba(${deptTheme.primary},0.4), 0 0 48px rgba(${deptTheme.primary},0.15)`,
                }}
              >
                &ldquo;{eventTheme}&rdquo;
              </motion.p>
            )}

            {/* Verse — 성구 */}
            {themeVerse && (
              <motion.p
                className="text-xs font-medium text-slate-400/80 md:text-sm"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                {themeVerse}
              </motion.p>
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
