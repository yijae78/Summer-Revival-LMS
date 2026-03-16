'use client'

import { useState } from 'react'
import { LogOut, Moon, Sun, Monitor, RefreshCw, CloudOff, Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { useUser } from '@/hooks/useUser'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

import { cn } from '@/lib/utils'

const APP_VERSION = '0.1.0'

type ThemeOption = 'light' | 'dark' | 'system'

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: '라이트', icon: Sun },
  { value: 'dark', label: '다크', icon: Moon },
  { value: 'system', label: '시스템', icon: Monitor },
]

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">설정</h1>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>프로필</CardTitle>
          <CardDescription>내 계정 정보를 확인하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary"
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
        </CardContent>
      </Card>

      {/* Theme Section */}
      <Card>
        <CardHeader>
          <CardTitle>테마</CardTitle>
          <CardDescription>화면 밝기를 설정하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    'flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-lg border p-3 text-sm transition-colors',
                    theme === option.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-accent'
                  )}
                  aria-pressed={theme === option.value}
                >
                  <Icon className="h-5 w-5" />
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Offline Queue Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudOff className="h-5 w-5" />
            오프라인 데이터
          </CardTitle>
          <CardDescription>
            오프라인에서 저장된 데이터를 확인하고 동기화하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">대기 중인 항목</p>
              <p className="text-2xl font-bold tabular-nums">{pendingCount}건</p>
            </div>
            <div
              className={cn(
                'flex h-3 w-3 rounded-full',
                isOnline ? 'bg-emerald-500' : 'bg-amber-500'
              )}
              aria-label={isOnline ? '온라인' : '오프라인'}
            />
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
            <p className="text-sm text-amber-600 dark:text-amber-400">
              인터넷에 연결되면 자동으로 동기화돼요
            </p>
          )}
        </CardContent>
      </Card>

      {/* App Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            앱 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">버전</span>
            <span className="font-mono">{APP_VERSION}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">앱 이름</span>
            <span>FLOWING</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">연결 상태</span>
            <span className={isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
              {isOnline ? '온라인' : '오프라인'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleSignOut}
            disabled={isSigningOut}
            variant="destructive"
            className="w-full min-h-[48px]"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isSigningOut ? '로그아웃 중...' : '로그아웃'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
