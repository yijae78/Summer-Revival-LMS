'use client'

import { useState } from 'react'
import { LogOut, Moon, Sun, Monitor, RefreshCw, CloudOff, Info, User } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'

import { useUser } from '@/hooks/useUser'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

import { cn } from '@/lib/utils'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const APP_VERSION = '0.1.0'

type ThemeOption = 'light' | 'dark' | 'system'

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: '라이트', icon: Sun },
  { value: 'dark', label: '다크', icon: Moon },
  { value: 'system', label: '시스템', icon: Monitor },
]

function GlassSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof User
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(99,102,241,0.1)]"
    >
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <Icon className="size-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-5 pt-3">
        {children}
      </div>
    </motion.div>
  )
}

export default function SettingsPage() {
  const { data: user } = useUser()
  const { signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { isSyncing, pendingCount, triggerSync } = useOfflineSync()
  const isOnline = useNetworkStatus()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      await signOut()
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <motion.div
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <PageHeader
        title="설정"
        backHref="/dashboard"
      />

      {/* Profile Section */}
      <GlassSection icon={User} title="프로필" description="내 계정 정보를 확인하세요">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white ring-2 ring-indigo-500/20 shadow-lg"
            aria-hidden="true"
          >
            {user?.name?.charAt(0) ?? '?'}
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold leading-relaxed">
              {user?.name ?? '이름 없음'}
            </p>
            <p className="text-sm text-muted-foreground">
              {user?.phone ?? '전화번호 미등록'}
            </p>
          </div>
        </div>
      </GlassSection>

      {/* Theme Section */}
      <GlassSection icon={Sun} title="테마" description="화면 밝기를 설정하세요">
        <div className="grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={cn(
                  'flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl border p-3 text-sm transition-all duration-300',
                  theme === option.value
                    ? 'border-indigo-500/30 bg-gradient-to-br from-indigo-500/15 to-purple-500/10 text-indigo-300 shadow-[0_0_16px_rgba(99,102,241,0.15)]'
                    : 'border-white/[0.08] bg-white/[0.04] hover:border-indigo-500/20 hover:bg-white/[0.06]'
                )}
                aria-pressed={theme === option.value}
              >
                <Icon className="h-5 w-5" />
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
      </GlassSection>

      {/* Offline Queue Section */}
      <GlassSection icon={CloudOff} title="오프라인 데이터" description="오프라인에서 저장된 데이터를 확인하고 동기화하세요">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">대기 중인 항목</p>
              <p className="text-2xl font-bold tabular-nums">{pendingCount}건</p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-3 w-3 rounded-full',
                  isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                )}
                aria-label={isOnline ? '온라인' : '오프라인'}
              />
              <span className="text-xs text-muted-foreground">
                {isOnline ? '온라인' : '오프라인'}
              </span>
            </div>
          </div>

          <Button
            onClick={triggerSync}
            disabled={isSyncing || pendingCount === 0 || !isOnline}
            className="w-full min-h-[48px]"
            variant={pendingCount > 0 ? 'default' : 'outline'}
          >
            <RefreshCw
              className={cn('mr-2 h-4 w-4', isSyncing && 'animate-spin')}
            />
            {isSyncing
              ? '동기화 중...'
              : pendingCount > 0
                ? '지금 동기화하기'
                : '동기화할 데이터가 없어요'}
          </Button>

          {!isOnline && pendingCount > 0 && (
            <p className="text-sm text-amber-400">
              인터넷에 연결되면 자동으로 동기화돼요
            </p>
          )}
        </div>
      </GlassSection>

      {/* App Info Section */}
      <GlassSection icon={Info} title="앱 정보">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">버전</span>
            <span className="font-mono tabular-nums">{APP_VERSION}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">앱 이름</span>
            <span className="font-semibold text-primary">FLOWING</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">연결 상태</span>
            <span className={isOnline ? 'text-emerald-400' : 'text-amber-400'}>
              {isOnline ? '온라인' : '오프라인'}
            </span>
          </div>
        </div>
      </GlassSection>

      {/* Sign Out */}
      <motion.div variants={fadeUp}>
        <Button
          onClick={handleSignOut}
          disabled={isSigningOut}
          variant="destructive"
          className="w-full min-h-[48px] rounded-2xl"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isSigningOut ? '로그아웃 중...' : '로그아웃'}
        </Button>
      </motion.div>
    </motion.div>
  )
}
