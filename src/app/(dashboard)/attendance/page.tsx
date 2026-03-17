'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { ClipboardCheck, Clock, ChevronRight, CalendarDays, LayoutGrid, List } from 'lucide-react'
import { motion } from 'framer-motion'

import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { DepartmentFilter } from '@/components/shared/DepartmentFilter'

import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useSchedules } from '@/hooks/useSchedules'
import { useDepartmentFilterStore } from '@/stores/departmentFilterStore'
import { getDepartmentTheme } from '@/constants/departments'
import { cn } from '@/lib/utils'

import type { Schedule } from '@/types'

type AttendanceViewMode = 'card' | 'list'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

function formatTime(time: string): string {
  const parts = time.split(':')
  if (parts.length < 2) return time
  const hour = parseInt(parts[0], 10)
  const minute = parts[1]
  const period = hour < 12 ? '오전' : '오후'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${period} ${displayHour}:${minute}`
}

// ============================================
// View Mode Toggle
// ============================================

function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: AttendanceViewMode
  onChange: (m: AttendanceViewMode) => void
}) {
  const options: { value: AttendanceViewMode; icon: typeof LayoutGrid; label: string }[] = [
    { value: 'card', icon: LayoutGrid, label: '카드' },
    { value: 'list', icon: List, label: '리스트' },
  ]

  return (
    <div className="flex rounded-full border border-white/[0.08] bg-white/[0.03] p-0.5">
      {options.map((opt) => {
        const Icon = opt.icon
        const isActive = mode === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
              isActive
                ? 'bg-white/[0.1] text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-pressed={isActive}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ============================================
// Card View (existing)
// ============================================

interface ScheduleAttendanceCardProps {
  schedule: Schedule
  onNavigate: (scheduleId: string) => void
  deptTheme: ReturnType<typeof getDepartmentTheme>
}

function ScheduleAttendanceCard({ schedule, onNavigate, deptTheme: theme }: ScheduleAttendanceCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'cursor-pointer rounded-2xl border backdrop-blur-xl',
        'transition-all duration-500',
        'hover:scale-[1.02]',
        'active:scale-[0.99]'
      )}
      style={{
        borderColor: `rgba(${theme.primary},0.15)`,
        background: `linear-gradient(135deg, rgba(${theme.primary},0.1), rgba(${theme.secondary},0.05))`,
      }}
      onClick={() => onNavigate(schedule.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onNavigate(schedule.id)
        }
      }}
    >
      <div className="flex items-center gap-3 px-4 py-4 md:px-6">
        {/* Icon */}
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-xl shadow-lg transition-all duration-500"
          style={{
            background: `linear-gradient(135deg, rgb(${theme.primary}), rgb(${theme.secondary}))`,
          }}
        >
          <ClipboardCheck className="size-5 text-white" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.9375rem] font-medium text-foreground">
            {schedule.title}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
            </span>
            {schedule.location && (
              <span className="text-xs text-muted-foreground">
                {schedule.location}
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="size-5 shrink-0 text-muted-foreground/50" />
      </div>
    </motion.div>
  )
}

// ============================================
// List View (new - compact single-line)
// ============================================

function ScheduleAttendanceListItem({
  schedule,
  onNavigate,
}: {
  schedule: Schedule
  onNavigate: (scheduleId: string) => void
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'group flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 backdrop-blur-xl',
        'border-white/[0.08] bg-white/[0.04]',
        'transition-all duration-300',
        'hover:bg-white/[0.06] hover:shadow-lg',
        'active:scale-[0.99]'
      )}
      onClick={() => onNavigate(schedule.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onNavigate(schedule.id)
        }
      }}
    >
      {/* Time */}
      <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
        {schedule.start_time.slice(0, 5)}
      </span>

      {/* Title */}
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {schedule.title}
      </span>

      {/* Time range */}
      <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
        <Clock className="size-3" />
        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
      </span>

      {/* Location */}
      {schedule.location && (
        <span className="hidden shrink-0 text-xs text-muted-foreground md:block">
          {schedule.location}
        </span>
      )}

      {/* Arrow */}
      <ChevronRight className="size-4 shrink-0 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.div>
  )
}

function AttendanceSkeleton() {
  return (
    <div className="space-y-4">
      {/* Day tabs skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBox key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>

      {/* Cards skeleton */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-4">
          <SkeletonBox className="size-11 rounded-xl" />
          <div className="flex-1 space-y-1.5">
            <SkeletonBox className="h-4 w-32" />
            <SkeletonBox className="h-3 w-48" />
          </div>
          <SkeletonBox className="size-5" />
        </div>
      ))}
    </div>
  )
}

export default function AttendancePage() {
  const router = useRouter()
  const { eventId } = useCurrentEvent()
  const department = useDepartmentFilterStore((s) => s.department)
  const deptTheme = getDepartmentTheme(department)
  const { data: schedules, isLoading } = useSchedules(eventId ?? null, undefined, department)
  const [viewMode, setViewMode] = useState<AttendanceViewMode>('card')

  // Group schedules by day
  const dayNumbers = useMemo(() => {
    if (!schedules || schedules.length === 0) return []
    const days = new Set(schedules.map((s) => s.day_number))
    return Array.from(days).sort((a, b) => a - b)
  }, [schedules])

  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  // Auto-select first day when data loads
  const activeDay = selectedDay ?? dayNumbers[0] ?? null

  const filteredSchedules = useMemo(() => {
    if (!schedules || activeDay === null) return []
    return schedules.filter((s) => s.day_number === activeDay)
  }, [schedules, activeDay])

  function handleNavigate(scheduleId: string) {
    router.push(`/attendance/${scheduleId}`)
  }

  return (
    <motion.div
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <PageHeader
        title="출석 체크"
        description="세션별 출석을 관리해요"
        backHref="/dashboard"
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 overflow-hidden">
          <DepartmentFilter />
        </div>
        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      </div>

      <motion.div variants={fadeUp}>
        <LoadingSkeleton isLoading={isLoading} skeleton={<AttendanceSkeleton />}>
          {dayNumbers.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="아직 출석 체크할 세션이 없어요"
              description="관리자가 일정을 등록하면 출석 체크를 할 수 있어요."
            />
          ) : (
            <div className="space-y-4">
              {/* Day selector tabs - glass pill style */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {dayNumbers.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-500',
                      activeDay !== day && 'border-white/[0.08] bg-white/[0.04] text-muted-foreground hover:bg-white/[0.06]'
                    )}
                    style={activeDay === day ? {
                      borderColor: `rgba(${deptTheme.primary},0.3)`,
                      background: `linear-gradient(to right, rgba(${deptTheme.primary},0.15), rgba(${deptTheme.secondary},0.15))`,
                      color: `rgb(${deptTheme.primary})`,
                      boxShadow: `0 0 16px rgba(${deptTheme.primary},0.15)`,
                    } : undefined}
                  >
                    <CalendarDays className="size-3.5" />
                    {day}일차
                  </button>
                ))}
              </div>

              {/* Schedule items */}
              {filteredSchedules.length === 0 ? (
                <EmptyState
                  icon={ClipboardCheck}
                  title="이 일차에는 세션이 없어요"
                  description="다른 일차를 선택해 보세요."
                  className="py-12"
                />
              ) : viewMode === 'card' ? (
                <motion.div
                  className="space-y-3"
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  key="card"
                >
                  {filteredSchedules.map((schedule) => (
                    <ScheduleAttendanceCard
                      key={schedule.id}
                      schedule={schedule}
                      onNavigate={handleNavigate}
                      deptTheme={deptTheme}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-1.5"
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  key="list"
                >
                  {filteredSchedules.map((schedule) => (
                    <ScheduleAttendanceListItem
                      key={schedule.id}
                      schedule={schedule}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </LoadingSkeleton>
      </motion.div>
    </motion.div>
  )
}
