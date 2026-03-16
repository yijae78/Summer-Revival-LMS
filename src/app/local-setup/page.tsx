'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  Building2,
  CalendarDays,
  Clock,
  Users,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { cn } from '@/lib/utils'
import { insert, clearTable } from '@/lib/local-db'
import { useAdminAuthStore } from '@/stores/adminAuthStore'
import { useAppModeStore } from '@/stores/appModeStore'
import { useEventStore } from '@/stores/eventStore'

import type { Event, Profile, Schedule, Group } from '@/types'

// ============================================
// Constants
// ============================================

const TOTAL_STEPS = 6

const DEPARTMENT_OPTIONS = [
  '유치부',
  '아동부',
  '초등부',
  '중등부',
  '고등부',
  '청년부',
  '성인부',
]

const EVENT_TYPE_OPTIONS = [
  { value: 'retreat', label: '수련회' },
  { value: 'vbs', label: '성경학교(VBS)' },
  { value: 'camp', label: '캠프' },
  { value: 'other', label: '기타' },
]

const GROUP_PRESET_COLORS = [
  '#38bdf8', // sky
  '#a78bfa', // violet
  '#f472b6', // pink
  '#34d399', // emerald
  '#fbbf24', // amber
  '#fb923c', // orange
  '#f87171', // red
  '#22d3ee', // cyan
]

const DEFAULT_GROUP_NAMES = [
  '사랑조',
  '믿음조',
  '소망조',
  '기쁨조',
  '감사조',
  '은혜조',
  '평화조',
  '빛조',
  '소금조',
  '열매조',
]

interface ScheduleItem {
  id: string
  title: string
  type: string
  startTime: string
  endTime: string
}

interface GroupItem {
  id: string
  name: string
  color: string
}

const DEFAULT_SCHEDULE_TEMPLATE: Omit<ScheduleItem, 'id'>[] = [
  { title: '아침 묵상', type: 'worship', startTime: '07:00', endTime: '07:50' },
  { title: '아침식사', type: 'meal', startTime: '08:00', endTime: '08:50' },
  { title: '성경공부', type: 'study', startTime: '10:00', endTime: '11:30' },
  { title: '점심식사', type: 'meal', startTime: '12:00', endTime: '12:50' },
  { title: '레크리에이션', type: 'recreation', startTime: '14:00', endTime: '16:00' },
  { title: '저녁식사', type: 'meal', startTime: '18:00', endTime: '18:50' },
  { title: '저녁 집회', type: 'worship', startTime: '19:00', endTime: '20:30' },
]

// ============================================
// Animation variants
// ============================================

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

// ============================================
// Utility
// ============================================

function getDayCount(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return Math.max(diff, 0)
}

function generateDefaultSchedules(): ScheduleItem[] {
  return DEFAULT_SCHEDULE_TEMPLATE.map((item) => ({
    ...item,
    id: crypto.randomUUID(),
  }))
}

function formatDateKr(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

// ============================================
// Glass Card wrapper
// ============================================

function GlassCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Lock
  title: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </motion.div>
  )
}

// ============================================
// Step Components
// ============================================

function StepAdmin({
  adminName,
  setAdminName,
  adminPhone,
  setAdminPhone,
  password,
  setPassword,
  passwordConfirm,
  setPasswordConfirm,
  showPw,
  setShowPw,
}: {
  adminName: string
  setAdminName: (v: string) => void
  adminPhone: string
  setAdminPhone: (v: string) => void
  password: string
  setPassword: (v: string) => void
  passwordConfirm: string
  setPasswordConfirm: (v: string) => void
  showPw: boolean
  setShowPw: (v: boolean) => void
}) {
  function handlePhoneChange(value: string) {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) {
      setAdminPhone(digits)
    } else if (digits.length <= 7) {
      setAdminPhone(`${digits.slice(0, 3)}-${digits.slice(3)}`)
    } else {
      setAdminPhone(`${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`)
    }
  }

  return (
    <GlassCard icon={Lock} title="관리자 설정">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-name" className="text-sm font-medium text-foreground">
            이름 <span className="text-rose-400">*</span>
          </Label>
          <Input
            id="admin-name"
            type="text"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            placeholder="관리자 이름을 입력하세요"
            className="h-12 rounded-xl border-white/[0.08] bg-white/[0.03] backdrop-blur-sm focus:border-sky-500/30 focus:ring-2 focus:ring-sky-500/10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-phone" className="text-sm font-medium text-foreground">
            전화번호 <span className="text-muted-foreground text-xs">(선택)</span>
          </Label>
          <Input
            id="admin-phone"
            type="tel"
            inputMode="tel"
            value={adminPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="010-0000-0000"
            className="h-12 rounded-xl border-white/[0.08] bg-white/[0.03] backdrop-blur-sm focus:border-sky-500/30 focus:ring-2 focus:ring-sky-500/10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-pw" className="text-sm font-medium text-foreground">
            비밀번호 <span className="text-rose-400">*</span>
          </Label>
          <div className="relative">
            <Input
              id="admin-pw"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="4자리 이상 입력하세요"
              className="h-12 rounded-xl border-white/[0.08] bg-white/[0.03] pr-12 backdrop-blur-sm focus:border-sky-500/30 focus:ring-2 focus:ring-sky-500/10"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password.length > 0 && password.length < 4 && (
            <p className="text-xs text-rose-400">비밀번호는 4자리 이상이어야 해요</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-pw-confirm" className="text-sm font-medium text-foreground">
            비밀번호 확인 <span className="text-rose-400">*</span>
          </Label>
          <Input
            id="admin-pw-confirm"
            type={showPw ? 'text' : 'password'}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            className="h-12 rounded-xl border-white/[0.08] bg-white/[0.03] backdrop-blur-sm focus:border-sky-500/30 focus:ring-2 focus:ring-sky-500/10"
          />
          {passwordConfirm.length > 0 && password !== passwordConfirm && (
            <p className="text-xs text-rose-400">비밀번호가 일치하지 않아요</p>
          )}
        </div>
      </div>
    </GlassCard>
  )
}

function StepChurch({
  churchName,
  setChurchName,
  departments,
  setDepartments,
}: {
  churchName: string
  setChurchName: (v: string) => void
  departments: string[]
  setDepartments: (v: string[]) => void
}) {
  function toggleDepartment(dept: string) {
    if (departments.includes(dept)) {
      setDepartments(departments.filter((d) => d !== dept))
    } else {
      setDepartments([...departments, dept])
    }
  }

  return (
    <GlassCard icon={Building2} title="교회 정보">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="church-name" className="text-sm font-medium text-foreground">
            교회 이름 <span className="text-rose-400">*</span>
          </Label>
          <Input
            id="church-name"
            type="text"
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
            placeholder="예: 사랑의교회"
            className="h-12 rounded-xl border-white/[0.08] bg-white/[0.03] backdrop-blur-sm focus:border-sky-500/30 focus:ring-2 focus:ring-sky-500/10"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">부서 선택</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {DEPARTMENT_OPTIONS.map((dept) => {
              const isSelected = departments.includes(dept)
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => toggleDepartment(dept)}
                  className={cn(
                    'flex min-h-[48px] items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200',
                    isSelected
                      ? 'border-sky-500/30 bg-sky-500/15 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.1)]'
                      : 'border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:border-white/[0.15] hover:bg-white/[0.06]'
                  )}
                  aria-pressed={isSelected}
                >
                  {dept}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

function StepEvent({
  eventName,
  setEventName,
  eventType,
  setEventType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  location,
  setLocation,
}: {
  eventName: string
  setEventName: (v: string) => void
  eventType: string
  setEventType: (v: string) => void
  startDate: string
  setStartDate: (v: string) => void
  endDate: string
  setEndDate: (v: string) => void
  location: string
  setLocation: (v: string) => void
}) {
  return (
    <GlassCard icon={CalendarDays} title="행사 정보">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="event-name" className="text-sm font-medium text-foreground">
            행사 이름 <span className="text-rose-400">*</span>
          </Label>
          <Input
            id="event-name"
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="예: 2026 여름수련회"
            className="h-12 rounded-xl border-white/[0.08] bg-white/[0.03] backdrop-blur-sm focus:border-sky-500/30 focus:ring-2 focus:ring-sky-500/10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-type" className="text-sm font-medium text-foreground">
            행사 유형
          </Label>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger
              id="event-type"
              className="h-12 w-full rounded-xl border-white/[0.08] bg-white/[0.03] backdrop-blur-sm"
            >
              <SelectValue placeholder="행사 유형을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="start-date" className="text-sm font-medium text-foreground">
              시작일
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-12 rounded-xl border-white/[0.08] bg-white/[0.03] backdrop-blur-sm focus:border-sky-500/30 focus:ring-2 focus:ring-sky-500/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date" className="text-sm font-medium text-foreground">
              종료일
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="h-12 rounded-xl border-white/[0.08] bg-white/[0.03] backdrop-blur-sm focus:border-sky-500/30 focus:ring-2 focus:ring-sky-500/10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-location" className="text-sm font-medium text-foreground">
            장소
          </Label>
          <Input
            id="event-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="예: 속초 은혜수련원"
            className="h-12 rounded-xl border-white/[0.08] bg-white/[0.03] backdrop-blur-sm focus:border-sky-500/30 focus:ring-2 focus:ring-sky-500/10"
          />
        </div>
      </div>
    </GlassCard>
  )
}

function StepSchedule({
  dayCount,
  schedulesByDay,
  setSchedulesByDay,
}: {
  dayCount: number
  schedulesByDay: Record<number, ScheduleItem[]>
  setSchedulesByDay: (v: Record<number, ScheduleItem[]>) => void
}) {
  const [activeDay, setActiveDay] = useState(1)

  const currentSchedule = schedulesByDay[activeDay] ?? []

  function updateSchedule(dayNum: number, items: ScheduleItem[]) {
    setSchedulesByDay({ ...schedulesByDay, [dayNum]: items })
  }

  function handleItemChange(index: number, field: keyof ScheduleItem, value: string) {
    const updated = [...currentSchedule]
    updated[index] = { ...updated[index], [field]: value }
    updateSchedule(activeDay, updated)
  }

  function addItem() {
    const newItem: ScheduleItem = {
      id: crypto.randomUUID(),
      title: '',
      type: 'free',
      startTime: '09:00',
      endTime: '10:00',
    }
    updateSchedule(activeDay, [...currentSchedule, newItem])
  }

  function removeItem(index: number) {
    const updated = currentSchedule.filter((_, i) => i !== index)
    updateSchedule(activeDay, updated)
  }

  function resetToDefault() {
    updateSchedule(activeDay, generateDefaultSchedules())
    toast.success('기본 일정으로 초기화했어요')
  }

  const effectiveDayCount = Math.max(dayCount, 1)

  return (
    <GlassCard icon={Clock} title="일정 구성">
      <div className="space-y-4">
        {/* Day tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: effectiveDayCount }, (_, i) => i + 1).map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setActiveDay(day)}
              className={cn(
                'flex min-h-[40px] min-w-[64px] items-center justify-center rounded-xl px-3 text-sm font-medium transition-all duration-200',
                activeDay === day
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'border border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06]'
              )}
            >
              {day}일차
            </button>
          ))}
        </div>

        {/* Schedule items for active day */}
        <div className="space-y-3">
          {currentSchedule.map((item, index) => (
            <div
              key={item.id}
              className="flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
            >
              <div className="flex flex-1 flex-col gap-2">
                <Input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                  placeholder="세션 이름"
                  className="h-10 rounded-lg border-white/[0.08] bg-white/[0.03] text-sm focus:border-sky-500/30 focus:ring-1 focus:ring-sky-500/10"
                />
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={item.startTime}
                    onChange={(e) => handleItemChange(index, 'startTime', e.target.value)}
                    className="h-10 flex-1 rounded-lg border-white/[0.08] bg-white/[0.03] text-sm focus:border-sky-500/30 focus:ring-1 focus:ring-sky-500/10"
                  />
                  <span className="flex items-center text-muted-foreground">~</span>
                  <Input
                    type="time"
                    value={item.endTime}
                    onChange={(e) => handleItemChange(index, 'endTime', e.target.value)}
                    className="h-10 flex-1 rounded-lg border-white/[0.08] bg-white/[0.03] text-sm focus:border-sky-500/30 focus:ring-1 focus:ring-sky-500/10"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                aria-label="세션 삭제"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="min-h-[48px] flex-1 rounded-xl border-white/[0.08] bg-white/[0.03]"
          >
            <Plus className="mr-2 h-4 w-4" />
            세션 추가
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={resetToDefault}
            className="min-h-[48px] rounded-xl border-white/[0.08] bg-white/[0.03]"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            기본 일정
          </Button>
        </div>
      </div>
    </GlassCard>
  )
}

function StepGroups({
  groups,
  setGroups,
}: {
  groups: GroupItem[]
  setGroups: (v: GroupItem[]) => void
}) {
  function handleCountChange(value: string) {
    const count = Math.max(1, Math.min(10, Number(value) || 1))
    const current = [...groups]

    if (count > current.length) {
      for (let i = current.length; i < count; i++) {
        current.push({
          id: crypto.randomUUID(),
          name: DEFAULT_GROUP_NAMES[i] ?? `${i + 1}조`,
          color: GROUP_PRESET_COLORS[i % GROUP_PRESET_COLORS.length],
        })
      }
    } else {
      current.splice(count)
    }

    setGroups(current)
  }

  function updateGroup(index: number, field: keyof GroupItem, value: string) {
    const updated = [...groups]
    updated[index] = { ...updated[index], [field]: value }
    setGroups(updated)
  }

  function resetToDefaults() {
    const updated = groups.map((g, i) => ({
      ...g,
      name: DEFAULT_GROUP_NAMES[i] ?? `${i + 1}조`,
    }))
    setGroups(updated)
    toast.success('기본 이름으로 초기화했어요')
  }

  return (
    <GlassCard icon={Users} title="조/반 구성">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="group-count" className="text-sm font-medium text-foreground">
            조 개수
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="group-count"
              type="number"
              min={1}
              max={10}
              value={groups.length}
              onChange={(e) => handleCountChange(e.target.value)}
              className="h-12 w-24 rounded-xl border-white/[0.08] bg-white/[0.03] text-center backdrop-blur-sm focus:border-sky-500/30 focus:ring-2 focus:ring-sky-500/10"
            />
            <input
              type="range"
              min={1}
              max={10}
              value={groups.length}
              onChange={(e) => handleCountChange(e.target.value)}
              className="flex-1 accent-sky-500"
              aria-label="조 개수 조절"
            />
          </div>
        </div>

        <div className="space-y-3">
          {groups.map((group, index) => (
            <div
              key={group.id}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
            >
              <div
                className="h-8 w-8 shrink-0 rounded-lg"
                style={{ backgroundColor: group.color }}
                aria-label={`${group.name} 색상`}
              />
              <Input
                type="text"
                value={group.name}
                onChange={(e) => updateGroup(index, 'name', e.target.value)}
                className="h-10 flex-1 rounded-lg border-white/[0.08] bg-white/[0.03] text-sm focus:border-sky-500/30 focus:ring-1 focus:ring-sky-500/10"
                placeholder="조 이름"
              />
              <div className="flex gap-1">
                {GROUP_PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateGroup(index, 'color', color)}
                    className={cn(
                      'h-6 w-6 rounded-full border-2 transition-all duration-200',
                      group.color === color
                        ? 'border-white scale-110'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`색상 ${color}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={resetToDefaults}
          className="min-h-[48px] w-full rounded-xl border-white/[0.08] bg-white/[0.03]"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          기본 이름으로 채우기
        </Button>
      </div>
    </GlassCard>
  )
}

function StepComplete({
  adminName,
  churchName,
  eventName,
  eventType,
  startDate,
  endDate,
  location,
  scheduleCount,
  groupCount,
}: {
  adminName: string
  churchName: string
  eventName: string
  eventType: string
  startDate: string
  endDate: string
  location: string
  scheduleCount: number
  groupCount: number
}) {
  const typeLabel = EVENT_TYPE_OPTIONS.find((o) => o.value === eventType)?.label ?? eventType

  return (
    <GlassCard icon={CheckCircle} title="설정 완료">
      <div className="space-y-4">
        <p className="text-sm leading-[1.7] text-muted-foreground">
          모든 설정이 완료되었어요. 아래 내용을 확인하고 시작해 주세요.
        </p>

        <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <SummaryRow label="관리자" value={adminName} />
          <SummaryRow label="교회" value={churchName} />
          <SummaryRow label="행사" value={`${eventName} (${typeLabel})`} />
          <SummaryRow
            label="기간"
            value={
              startDate && endDate
                ? `${formatDateKr(startDate)} ~ ${formatDateKr(endDate)}`
                : '미설정'
            }
          />
          <SummaryRow label="장소" value={location || '미설정'} />
          <SummaryRow label="일정" value={`${scheduleCount}개 세션`} />
          <SummaryRow label="조/반" value={`${groupCount}개 조`} />
        </div>
      </div>
    </GlassCard>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  )
}

// ============================================
// Main Wizard Page
// ============================================

export default function LocalSetupPage() {
  const router = useRouter()
  const setPassword = useAdminAuthStore((s) => s.setPassword)
  const authenticate = useAdminAuthStore((s) => s.authenticate)
  const setMode = useAppModeStore((s) => s.setMode)
  const setCurrentEventId = useEventStore((s) => s.setCurrentEventId)

  // Step state
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)

  // Step 1: Admin
  const [adminName, setAdminName] = useState('')
  const [adminPhone, setAdminPhone] = useState('')
  const [password, setPasswordValue] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)

  // Step 2: Church
  const [churchName, setChurchName] = useState('')
  const [departments, setDepartments] = useState<string[]>([])

  // Step 3: Event
  const [eventName, setEventName] = useState('')
  const [eventType, setEventType] = useState('retreat')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [location, setLocation] = useState('')

  // Step 4: Schedules
  const dayCount = useMemo(() => getDayCount(startDate, endDate), [startDate, endDate])
  const [schedulesByDay, setSchedulesByDay] = useState<Record<number, ScheduleItem[]>>(() => ({
    1: generateDefaultSchedules(),
  }))

  // Initialize schedules when dayCount changes
  const initSchedules = useCallback((count: number) => {
    setSchedulesByDay((prev) => {
      const updated = { ...prev }
      for (let i = 1; i <= count; i++) {
        if (!updated[i]) {
          updated[i] = generateDefaultSchedules()
        }
      }
      // Remove extra days
      for (const key of Object.keys(updated)) {
        if (Number(key) > count) {
          delete updated[Number(key)]
        }
      }
      return updated
    })
  }, [])

  // Step 5: Groups
  const [groups, setGroups] = useState<GroupItem[]>(() => {
    const initial: GroupItem[] = []
    for (let i = 0; i < 4; i++) {
      initial.push({
        id: crypto.randomUUID(),
        name: DEFAULT_GROUP_NAMES[i],
        color: GROUP_PRESET_COLORS[i],
      })
    }
    return initial
  })

  // Compute total schedule count for summary
  const totalScheduleCount = useMemo(() => {
    return Object.values(schedulesByDay).reduce((sum, items) => sum + items.length, 0)
  }, [schedulesByDay])

  // Validation per step
  function canProceed(): boolean {
    switch (step) {
      case 1:
        return (
          adminName.trim().length > 0 &&
          password.length >= 4 &&
          password === passwordConfirm
        )
      case 2:
        return churchName.trim().length > 0
      case 3:
        return eventName.trim().length > 0
      case 4:
        return true
      case 5:
        return groups.length > 0 && groups.every((g) => g.name.trim().length > 0)
      case 6:
        return true
      default:
        return false
    }
  }

  function handleNext() {
    if (!canProceed()) return

    if (step === 3) {
      // When leaving step 3, ensure schedules are initialized for all days
      const count = getDayCount(startDate, endDate)
      initSchedules(Math.max(count, 1))
    }

    if (step < TOTAL_STEPS) {
      setDirection(1)
      setStep((s) => s + 1)
    }
  }

  function handlePrev() {
    if (step > 1) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }

  function handleComplete() {
    // 1. Clear existing local-db tables for a fresh start
    clearTable('profiles')
    clearTable('events')
    clearTable('schedules')
    clearTable('groups')

    // 2. Save admin profile
    const profileId = crypto.randomUUID()
    const profile: Profile = {
      id: profileId,
      name: adminName.trim(),
      role: 'admin',
      phone: adminPhone.trim() || null,
      avatar_url: null,
      has_seen_onboarding: true,
      created_at: new Date().toISOString(),
    }
    insert<Profile>('profiles', profile)

    // 3. Save event
    const eventId = crypto.randomUUID()
    const event: Event = {
      id: eventId,
      name: eventName.trim(),
      type: eventType,
      start_date: startDate || new Date().toISOString().split('T')[0],
      end_date: endDate || new Date().toISOString().split('T')[0],
      location: location.trim() || null,
      description: `${churchName.trim()} ${departments.join(', ')}`,
      invite_code: null,
      settings: {
        churchName: churchName.trim(),
        departments,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    insert<Event>('events', event)

    // 4. Save schedules
    let orderIndex = 0
    for (const [dayStr, items] of Object.entries(schedulesByDay)) {
      const dayNumber = Number(dayStr)
      for (const item of items) {
        if (!item.title.trim()) continue
        const schedule: Schedule = {
          id: crypto.randomUUID(),
          event_id: eventId,
          day_number: dayNumber,
          date: null,
          title: item.title.trim(),
          type: item.type,
          start_time: item.startTime,
          end_time: item.endTime,
          location: null,
          speaker: null,
          description: null,
          materials: null,
          order_index: orderIndex++,
          created_at: new Date().toISOString(),
        }
        insert<Schedule>('schedules', schedule)
      }
    }

    // 5. Save groups
    for (const group of groups) {
      const groupData: Group = {
        id: crypto.randomUUID(),
        event_id: eventId,
        name: group.name.trim(),
        leader_id: null,
        color: group.color,
        total_points: 0,
        created_at: new Date().toISOString(),
      }
      insert<Group>('groups', groupData)
    }

    // 6. Set admin password
    setPassword(password)
    authenticate()

    // 7. Set app mode
    setMode('local')

    // 8. Set current event
    setCurrentEventId(eventId)

    // 9. Navigate
    toast.success('설정이 완료되었어요! 대시보드로 이동할게요.')
    router.push('/dashboard')
  }

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <StepAdmin
            adminName={adminName}
            setAdminName={setAdminName}
            adminPhone={adminPhone}
            setAdminPhone={setAdminPhone}
            password={password}
            setPassword={setPasswordValue}
            passwordConfirm={passwordConfirm}
            setPasswordConfirm={setPasswordConfirm}
            showPw={showPw}
            setShowPw={setShowPw}
          />
        )
      case 2:
        return (
          <StepChurch
            churchName={churchName}
            setChurchName={setChurchName}
            departments={departments}
            setDepartments={setDepartments}
          />
        )
      case 3:
        return (
          <StepEvent
            eventName={eventName}
            setEventName={setEventName}
            eventType={eventType}
            setEventType={setEventType}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            location={location}
            setLocation={setLocation}
          />
        )
      case 4:
        return (
          <StepSchedule
            dayCount={dayCount}
            schedulesByDay={schedulesByDay}
            setSchedulesByDay={setSchedulesByDay}
          />
        )
      case 5:
        return (
          <StepGroups
            groups={groups}
            setGroups={setGroups}
          />
        )
      case 6:
        return (
          <StepComplete
            adminName={adminName}
            churchName={churchName}
            eventName={eventName}
            eventType={eventType}
            startDate={startDate}
            endDate={endDate}
            location={location}
            scheduleCount={totalScheduleCount}
            groupCount={groups.length}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      {/* Background ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-4 pb-2">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/start')}
              className={cn(
                'flex min-h-[44px] min-w-[44px] items-center justify-center',
                'rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm',
                'text-muted-foreground transition-all duration-300',
                'hover:border-white/[0.15] hover:text-foreground'
              )}
              aria-label="뒤로 가기"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex-1">
              <h1
                className="bg-clip-text text-xl font-black uppercase leading-none tracking-[-0.02em] text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, #0ea5e9, #38bdf8, #7dd3fc, #38bdf8, #0ea5e9)',
                  backgroundSize: '200% auto',
                  animation: 'waterFlow 6s linear infinite',
                }}
              >
                Flowing
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">초기 설정</p>
            </div>
            <span className="text-sm font-semibold tabular-nums text-muted-foreground">
              {step}/{TOTAL_STEPS}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500"
              initial={false}
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>

          {/* Step dots */}
          <div className="mt-2 flex justify-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i + 1 === step
                    ? 'w-6 bg-sky-400'
                    : i + 1 < step
                      ? 'w-1.5 bg-sky-500/50'
                      : 'w-1.5 bg-white/[0.1]'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 px-4 py-4">
        <div className="mx-auto max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation footer */}
      <div className="sticky bottom-0 z-20 border-t border-white/[0.06] bg-background/80 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg gap-3">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              className="min-h-[48px] flex-1 rounded-xl border-white/[0.08] bg-white/[0.03] font-semibold"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              이전
            </Button>
          )}

          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className={cn(
                'min-h-[48px] flex-1 rounded-xl font-bold text-white shadow-lg transition-all duration-300',
                'bg-gradient-to-r from-sky-500 to-blue-600',
                'hover:from-sky-400 hover:to-blue-500 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]',
                'disabled:opacity-40 disabled:shadow-none'
              )}
            >
              다음
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleComplete}
              className={cn(
                'min-h-[48px] flex-1 rounded-xl font-bold text-white shadow-lg transition-all duration-300',
                'bg-gradient-to-r from-emerald-500 to-green-600',
                'hover:from-emerald-400 hover:to-green-500 hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]'
              )}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              시작하기
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
