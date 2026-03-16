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
  const churchName = (settings.churchName as string) ?? null
  const eventTheme = (settings.theme as string) ?? null
  const themeVerse = (settings.themeVerse as string) ?? null

  return (
    <header
      className={cn(
        'flex h-auto min-h-14 flex-col border-b bg-card',
        className
      )}
    >
      {/* Church name + Theme banner */}
      {(churchName || eventTheme) && (
        <div className="overflow-hidden border-b border-white/[0.06] bg-gradient-to-r from-indigo-500/[0.08] via-purple-500/[0.06] to-fuchsia-500/[0.08] px-4 py-2">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5"
          >
            {churchName && (
              <span
                className="bg-clip-text text-xs font-bold text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #818cf8, #c084fc, #e879f9, #c084fc, #818cf8)',
                  backgroundSize: '200% auto',
                  animation: 'textShimmer 4s linear infinite',
                }}
              >
                {churchName}
              </span>
            )}
            {eventTheme && (
              <motion.span
                className="bg-clip-text text-xs font-semibold text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #38bdf8, #818cf8, #c084fc, #818cf8, #38bdf8)',
                  backgroundSize: '200% auto',
                  animation: 'textShimmer 5s linear infinite',
                }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                &ldquo;{eventTheme}&rdquo;
              </motion.span>
            )}
            {themeVerse && (
              <span className="text-[0.625rem] text-muted-foreground/60">
                {themeVerse}
              </span>
            )}
          </motion.div>
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
