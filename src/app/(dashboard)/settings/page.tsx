'use client'

import { useState } from 'react'
import { LogOut, Moon, Sun, Monitor, RefreshCw, CloudOff, Info, User, Lock, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/PageHeader'

import { useUser } from '@/hooks/useUser'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

import { useAdminAuthStore } from '@/stores/adminAuthStore'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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

function AdminPasswordSection() {
  const { passwordHash, setPassword, changePassword } = useAdminAuthStore()
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const hasPassword = !!passwordHash

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newPw.trim()) {
      toast.error('새 비밀번호를 입력해 주세요')
      return
    }
    if (newPw.length < 4) {
      toast.error('비밀번호는 4자리 이상이어야 해요')
      return
    }
    if (newPw !== confirmPw) {
      toast.error('비밀번호가 일치하지 않아요')
      return
    }

    if (hasPassword) {
      if (!oldPw.trim()) {
        toast.error('현재 비밀번호를 입력해 주세요')
        return
      }
      const success = changePassword(oldPw, newPw)
      if (!success) {
        toast.error('현재 비밀번호가 일치하지 않아요')
        return
      }
      toast.success('관리자 비밀번호가 변경되었어요')
    } else {
      setPassword(newPw)
      toast.success('관리자 비밀번호가 설정되었어요')
    }

    setOldPw('')
    setNewPw('')
    setConfirmPw('')
  }

  return (
    <GlassSection icon={Lock} title="관리자 비밀번호" description="관리자 기능과 회계 페이지를 보호해요">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">
              {hasPassword ? '비밀번호 설정됨' : '비밀번호 미설정'}
            </p>
            <p className="text-xs text-muted-foreground">
              {hasPassword ? '관리자 기능 접근 시 비밀번호를 입력해야 해요' : '비밀번호를 설정하면 관리자 기능을 보호할 수 있어요'}
            </p>
          </div>
          <div className={cn(
            'flex h-3 w-3 rounded-full',
            hasPassword ? 'bg-emerald-500' : 'bg-amber-500'
          )} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {hasPassword && (
            <div className="relative">
              <Input
                type={showPw ? 'text' : 'password'}
                value={oldPw}
                onChange={(e) => setOldPw(e.target.value)}
                placeholder="현재 비밀번호"
                className="h-12 rounded-xl border-white/[0.08] bg-white/[0.03] pr-10 backdrop-blur-sm focus:border-indigo-500/30 focus:ring-2 focus:ring-indigo-500/10"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          )}
          <div className="relative">
            <Input
              type={showPw ? 'text' : 'password'}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder={hasPassword ? '새 비밀번호' : '비밀번호 설정 (4자리 이상)'}
              className="h-12 rounded-xl border-white/[0.08] bg-white/[0.03] pr-10 backdrop-blur-sm focus:border-indigo-500/30 focus:ring-2 focus:ring-indigo-500/10"
            />
            {!hasPassword && (
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
          <Input
            type={showPw ? 'text' : 'password'}
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="비밀번호 확인"
            className="h-12 rounded-xl border-white/[0.08] bg-white/[0.03] backdrop-blur-sm focus:border-indigo-500/30 focus:ring-2 focus:ring-indigo-500/10"
          />
          <Button
            type="submit"
            disabled={!newPw.trim() || !confirmPw.trim() || (hasPassword && !oldPw.trim())}
            className="min-h-[48px] w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-white"
          >
            <Lock className="mr-2 h-4 w-4" />
            {hasPassword ? '비밀번호 변경' : '비밀번호 설정'}
          </Button>
        </form>
      </div>
    </GlassSection>
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

      {/* Admin Password Section */}
      {(user?.role === 'admin' || user?.role === 'staff') && (
        <AdminPasswordSection />
      )}

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
