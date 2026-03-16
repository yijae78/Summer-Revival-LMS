'use client'

import Link from 'next/link'
import { Bell, Menu, Flame } from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { useCurrentEvent } from '@/hooks/useCurrentEvent'
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

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { event } = useCurrentEvent()
  const settings = (event?.settings ?? {}) as Record<string, unknown>
  const rawChurchName = (settings.churchName as string) ?? null
  const departments = (settings.departments as string[]) ?? []
  const churchName = rawChurchName
    ? departments.length > 0
      ? `${rawChurchName} ${departments.join(' · ')}`
      : rawChurchName
    : null
  const eventTheme = (settings.theme as string) ?? null
  const themeVerse = (settings.themeVerse as string) ?? null

  return (
    <header
      className={cn(
        'flex h-auto min-h-14 flex-col border-b bg-card',
        className
      )}
    >
      {/* Church name + Theme banner — 3D + flowing grace effect */}
      {(churchName || eventTheme) && (
        <div className="relative overflow-hidden border-b border-white/[0.06] px-4 py-5"
          style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 40%, rgba(232,121,249,0.06) 70%, transparent 100%)' }}>

          {/* Flowing grace ripples — 은혜가 중심에서 바깥으로 흘러가는 효과 */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute rounded-full border border-purple-400/10"
                style={{
                  width: `${i * 120}px`,
                  height: `${i * 60}px`,
                  animation: `graceRipple ${3 + i * 0.8}s ease-out infinite`,
                  animationDelay: `${i * 0.6}s`,
                }}
              />
            ))}
          </div>

          {/* Downward flowing particles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute h-8 w-px rounded-full"
                style={{
                  left: `${15 + i * 18}%`,
                  background: 'linear-gradient(180deg, rgba(139,92,246,0.3), transparent)',
                  animation: `graceFlow ${2.5 + i * 0.4}s ease-in infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>

          {/* Content — 3D push/pull effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, z: -20 }}
            animate={{ opacity: 1, scale: 1, z: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="relative flex flex-col items-center gap-2 text-center"
            style={{ perspective: '600px' }}
          >
            {/* Church name — large, 3D breathing */}
            {churchName && (
              <motion.h2
                className="bg-clip-text text-lg font-black tracking-wide text-transparent md:text-xl"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #818cf8, #c084fc, #e879f9, #f0abfc, #e879f9, #c084fc, #818cf8)',
                  backgroundSize: '300% auto',
                  animation: 'waterFlow 6s linear infinite',
                }}
                animate={{
                  scale: [1, 1.04, 1],
                  rotateX: [0, 2, 0, -2, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {churchName}
              </motion.h2>
            )}

            {/* Theme — medium, 3D pop */}
            {eventTheme && (
              <motion.p
                className="bg-clip-text text-base font-bold text-transparent md:text-lg"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #38bdf8, #818cf8, #c084fc, #e879f9, #c084fc, #818cf8, #38bdf8)',
                  backgroundSize: '200% auto',
                  animation: 'textShimmer 5s linear infinite',
                  textShadow: '0 0 30px rgba(139,92,246,0.3)',
                }}
                animate={{
                  scale: [1, 1.06, 1],
                  z: [0, 15, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              >
                &ldquo;{eventTheme}&rdquo;
              </motion.p>
            )}

            {/* Verse — subtle glow */}
            {themeVerse && (
              <motion.p
                className="text-sm text-purple-300/70"
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {themeVerse}
              </motion.p>
            )}
          </motion.div>

          {/* Bottom gradient fade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4"
            style={{ background: 'linear-gradient(to top, var(--card), transparent)' }} />
        </div>
      )}
      {/* Main header row */}
      <div className="flex h-14 items-center justify-between px-4">
      {/* Left: Mobile menu + App name */}
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
              <span className="text-sm font-bold">여름행사 LMS</span>
            </div>
            <nav className="space-y-1 p-2">
              <MobileNavLink href="/dashboard" label="홈" />
              <MobileNavLink href="/participants" label="참가자" />
              <MobileNavLink href="/schedule" label="일정" />
              <MobileNavLink href="/attendance" label="출석" />
              <MobileNavLink href="/quiz" label="퀴즈" />
              <MobileNavLink href="/groups" label="조" />
              <MobileNavLink href="/announcements" label="공지" />
              <MobileNavLink href="/gallery" label="갤러리" />
              <MobileNavLink href="/settings" label="설정" />
            </nav>
          </SheetContent>
        </Sheet>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground transition-colors hover:text-primary"
        >
          <Flame className="h-4 w-4 text-[#ef4444]" />
          여름행사 LMS
        </Link>
      </div>

      {/* Right: Notification + Avatar */}
      <div className="flex items-center gap-1">
        {/* Notification */}
        <Button
          variant="ghost"
          size="icon"
          className="relative min-h-[48px] min-w-[48px]"
          aria-label="알림"
        >
          <Bell className="h-5 w-5" />
          {/* Badge dot */}
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        {/* User avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="min-h-[48px] min-w-[48px]">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs font-medium">관리</AvatarFallback>
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
