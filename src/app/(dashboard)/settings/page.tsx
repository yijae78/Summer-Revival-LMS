'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  LogOut, Moon, Sun, Monitor, RefreshCw, CloudOff, Info, User, Lock, Eye, EyeOff,
  Building2, CalendarDays, BookOpen, Save, Check,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/shared/PageHeader'

import { useUser } from '@/hooks/useUser'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useCurrentEvent } from '@/hooks/useCurrentEvent'

import { useAdminAuthStore } from '@/stores/adminAuthStore'
import { useAppModeStore } from '@/stores/appModeStore'
import { useEventStore } from '@/stores/eventStore'
import { useViewportStore } from '@/stores/viewportStore'
import { AdminGate } from '@/components/shared/AdminGate'
import { DEPARTMENT_LIST } from '@/constants/departments'
import { update as updateLocal } from '@/lib/local-db'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

import type { Event } from '@/types'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const APP_VERSION = '0.1.0'

type ThemeOption = 'light' | 'dark' | 'system'

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: '라이트', icon: Sun },
  { value: 'dark', label: '다크', icon: Moon },
  { value: 'system', label: '시스템', icon: Monitor },
]

const inputClass = 'h-12 rounded-xl border-white/[0.08] bg-white/[0.03] backdrop-blur-sm focus:border-indigo-500/30 focus:ring-2 focus:ring-indigo-500/10'

function GlassSection({
  icon: Icon,
  title,
  description,
  children,
  isMobile,
}: {
  icon: typeof User
  title: string
  description?: string
  children: React.ReactNode
  isMobile?: boolean
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(99,102,241,0.1)]"
    >
      <div className={cn('pb-2', isMobile ? 'px-3 pt-3' : 'px-5 pt-5')}>
        <div className="flex items-center gap-2.5">
          <div className={cn('flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg', isMobile ? 'h-7 w-7' : 'h-8 w-8')}>
            <Icon className={cn('text-white', isMobile ? 'size-3.5' : 'size-4')} />
          </div>
          <div>
            <h3 className={cn('font-semibold text-foreground', isMobile ? 'text-sm' : 'text-base')}>{title}</h3>
            {description && (
              <p className={cn('text-muted-foreground', isMobile ? 'text-xs' : 'text-sm')}>{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className={cn('pt-3', isMobile ? 'p-3' : 'p-5')}>
        {children}
      </div>
    </motion.div>
  )
}

// ============================================
// Event Info Editor
// ============================================

function EventInfoSection() {
  const viewport = useViewportStore((s) => s.viewport)
  const isMobile = viewport === 'mobile' || viewport === 'tablet'
  const { event, eventId } = useCurrentEvent()
  const mode = useAppModeStore((s) => s.mode)
  const eventStore = useEventStore()

  const settings = (event?.settings ?? {}) as Record<string, unknown>

  const [churchName, setChurchName] = useState('')
  const [eventName, setEventName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [location, setLocation] = useState('')
  const [theme, setEventTheme] = useState('')
  const [themeVerse, setThemeVerse] = useState('')
  const [departments, setDepartments] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load current values
  useEffect(() => {
    if (!event) return
    setChurchName((settings.churchName as string) ?? '')
    setEventName(event.name ?? '')
    setStartDate(event.start_date ?? '')
    setEndDate(event.end_date ?? '')
    setLocation(event.location ?? '')
    setEventTheme((settings.theme as string) ?? '')
    setThemeVerse((settings.themeVerse as string) ?? '')
    setDepartments((settings.departments as string[]) ?? [])
  }, [event, settings])

  function toggleDepartment(key: string) {
    setDepartments((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    )
  }

  const handleSave = useCallback(async () => {
    if (!eventId || !event) return

    setIsSaving(true)
    try {
      const updatedEvent: Event = {
        ...event,
        name: eventName.trim() || event.name,
        start_date: startDate || event.start_date,
        end_date: endDate || event.end_date,
        location: location.trim() || null,
        settings: {
          ...settings,
          churchName: churchName.trim(),
          departments,
          theme: theme.trim() || null,
          themeVerse: themeVerse.trim() || null,
        },
      }

      if (mode === 'local' || mode === 'demo') {
        updateLocal<Event>('events', eventId, updatedEvent)
      }

      if (mode === 'cloud') {
        const { getSupabaseClient } = await import('@/lib/supabase/client')
        const supabase = getSupabaseClient()
        if (supabase) {
          await supabase
            .from('events')
            .update({
              name: updatedEvent.name,
              start_date: updatedEvent.start_date,
              end_date: updatedEvent.end_date,
              location: updatedEvent.location,
              settings: updatedEvent.settings,
            })
            .eq('id', eventId)
        }
      }

      // Force re-render by toggling event ID
      eventStore.clearCurrentEvent()
      setTimeout(() => eventStore.setCurrentEventId(eventId), 50)

      setSaved(true)
      toast.success('행사 정보가 저장됐어요')
      setTimeout(() => setSaved(false), 2000)
    } catch {
      toast.error('저장에 실패했어요. 다시 시도해 주세요.')
    } finally {
      setIsSaving(false)
    }
  }, [eventId, event, eventName, startDate, endDate, location, churchName, departments, theme, themeVerse, settings, mode, eventStore])

  if (!event) return null

  return (
    <GlassSection icon={Building2} title="행사 정보" description="교회·행사·부서 정보를 수정해요" isMobile={isMobile}>
      <div className="space-y-4">
        {/* Church Name */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">교회 이름</Label>
          <Input
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
            placeholder="예: 넘치는교회"
            className={inputClass}
          />
        </div>

        {/* Event Name */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">행사 이름</Label>
          <Input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="예: 2026 여름수련회"
            className={inputClass}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">시작일</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">종료일</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">장소</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="예: 속초 은혜수련원"
            className={inputClass}
          />
        </div>

        {/* Theme + Verse */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <BookOpen className="size-3.5" />
            주제
          </Label>
          <Input
            value={theme}
            onChange={(e) => setEventTheme(e.target.value)}
            placeholder="예: 주여 은혜를 주옵소서"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">주제 말씀</Label>
          <Input
            value={themeVerse}
            onChange={(e) => setThemeVerse(e.target.value)}
            placeholder="예: 고린도후서 9:8"
            className={inputClass}
          />
        </div>

        {/* Departments */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            부서 선택
          </Label>
          <div className={cn('grid gap-1.5', isMobile ? 'grid-cols-3' : 'grid-cols-4')}>
            {DEPARTMENT_LIST.map((dept) => {
              const isSelected = departments.includes(dept.key)
              return (
                <button
                  key={dept.key}
                  type="button"
                  onClick={() => toggleDepartment(dept.key)}
                  className={cn(
                    'flex min-h-[44px] items-center justify-center gap-1 rounded-xl border px-2 py-2 text-xs font-medium transition-all duration-200',
                    isSelected
                      ? 'border-indigo-500/30 bg-indigo-500/15 text-indigo-300'
                      : 'border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:border-white/[0.15]'
                  )}
                  aria-pressed={isSelected}
                >
                  <span>{dept.emoji}</span>
                  <span>{dept.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving || !churchName.trim() || !eventName.trim()}
          className={cn(
            'min-h-[48px] w-full rounded-xl font-bold text-white transition-all duration-300',
            saved
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500'
          )}
        >
          {saved ? (
            <><Check className="mr-2 h-4 w-4" />저장 완료</>
          ) : isSaving ? (
            '저장 중...'
          ) : (
            <><Save className="mr-2 h-4 w-4" />변경사항 저장</>
          )}
        </Button>
      </div>
    </GlassSection>
  )
}

// ============================================
// Admin Password Section
// ============================================

function AdminPasswordSection() {
  const viewport = useViewportStore((s) => s.viewport)
  const isMobile = viewport === 'mobile' || viewport === 'tablet'
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
    // Reject all same character (e.g. 1111, aaaa)
    if (new Set(newPw.split('')).size === 1) {
      toast.error('같은 문자만으로 이루어진 비밀번호는 사용할 수 없어요')
      return
    }
    // Reject sequential numbers (ascending or descending)
    const digits = newPw.split('').map(Number)
    if (digits.every((d) => !Number.isNaN(d))) {
      const isAscending = digits.every(
        (d, i) => i === 0 || d === digits[i - 1] + 1
      )
      const isDescending = digits.every(
        (d, i) => i === 0 || d === digits[i - 1] - 1
      )
      if (isAscending || isDescending) {
        toast.error('연속된 숫자로 이루어진 비밀번호는 사용할 수 없어요')
        return
      }
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
    <GlassSection icon={Lock} title="관리자 비밀번호" description="관리자 기능과 회계 페이지를 보호해요" isMobile={isMobile}>
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
                className={cn(inputClass, 'pr-10')}
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
              className={cn(inputClass, 'pr-10')}
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
            className={inputClass}
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

// ============================================
// Main Settings Page
// ============================================

export default function SettingsPage() {
  const viewport = useViewportStore((s) => s.viewport)
  const isMobile = viewport === 'mobile' || viewport === 'tablet'
  const { data: user } = useUser()
  const { signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { isSyncing, pendingCount, triggerSync } = useOfflineSync()
  const isOnline = useNetworkStatus()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const isAdmin = user?.role === 'admin'

  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      await signOut()
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <AdminGate>
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
      <GlassSection icon={User} title="프로필" description="내 계정 정보를 확인하세요" isMobile={isMobile}>
        <div className={cn('flex items-center', isMobile ? 'gap-3' : 'gap-4')}>
          <div
            className={cn('flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white ring-2 ring-indigo-500/20 shadow-lg', isMobile ? 'h-12 w-12 text-lg' : 'h-14 w-14 text-xl')}
            aria-hidden="true"
          >
            {user?.name?.charAt(0) ?? '?'}
          </div>
          <div className="space-y-1">
            <p className={cn('font-semibold leading-relaxed', isMobile ? 'text-sm' : 'text-base')}>
              {user?.name ?? '이름 없음'}
            </p>
            <p className={cn('text-muted-foreground', isMobile ? 'text-xs' : 'text-sm')}>
              {user?.phone ?? '전화번호 미등록'}
            </p>
          </div>
        </div>
      </GlassSection>

      {/* Event Info Editor — Admin only */}
      {isAdmin && <EventInfoSection />}

      {/* Theme Section */}
      <GlassSection icon={Sun} title="테마" description="화면 밝기를 설정하세요" isMobile={isMobile}>
        <div className={cn('grid grid-cols-3', isMobile ? 'gap-1.5' : 'gap-2')}>
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-xl border transition-all duration-300',
                  isMobile ? 'min-h-[44px] p-2 text-xs' : 'min-h-[48px] p-3 text-sm',
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
      <GlassSection icon={CloudOff} title="오프라인 데이터" description="오프라인에서 저장된 데이터를 확인하고 동기화하세요" isMobile={isMobile}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className={cn('font-medium', isMobile ? 'text-xs' : 'text-sm')}>대기 중인 항목</p>
              <p className={cn('font-bold tabular-nums', isMobile ? 'text-xl' : 'text-2xl')}>{pendingCount}건</p>
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
      <GlassSection icon={Info} title="앱 정보" isMobile={isMobile}>
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
    </AdminGate>
  )
}
