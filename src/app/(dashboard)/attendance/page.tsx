'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { ClipboardCheck, Clock, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'

import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useSchedules } from '@/hooks/useSchedules'
import { cn } from '@/lib/utils'

import type { Schedule } from '@/types'

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

interface ScheduleAttendanceCardProps {
  schedule: Schedule
  onNavigate: (scheduleId: string) => void
}

function ScheduleAttendanceCard({ schedule, onNavigate }: ScheduleAttendanceCardProps) {
  return (
    <Card
      className="cursor-pointer gap-0 border-white/[0.08] bg-white/[0.04] backdrop-blur-xl py-0 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(56,189,248,0.1)] active:scale-[0.99]"
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
      <CardContent className="flex items-center gap-3 px-4 py-3.5 md:px-6">
        {/* Icon */}
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <ClipboardCheck className="size-5 text-primary" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.9375rem] font-medium text-foreground">
            {schedule.title}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
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
      </CardContent>
    </Card>
  )
}

function AttendanceSkeleton() {
  return (
    <div className="space-y-4">
      {/* Day tabs skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBox key={i} className="h-9 w-16 rounded-lg" />
        ))}
      </div>

      {/* Cards skeleton */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-4">
          <SkeletonBox className="size-10 rounded-lg" />
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
  const { data: schedules, isLoading } = useSchedules(eventId ?? null)

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
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-bold text-foreground">출석 체크</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          세션별 출석을 체크해 보세요
        </p>
      </motion.div>

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
              {/* Day selector tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {dayNumbers.map((day) => (
                  <Button
                    key={day}
                    variant={activeDay === day ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      'shrink-0 px-4',
                      activeDay === day && 'shadow-sm'
                    )}
                  >
                    {day}일차
                  </Button>
                ))}
              </div>

              {/* Schedule cards */}
              {filteredSchedules.length === 0 ? (
                <EmptyState
                  icon={ClipboardCheck}
                  title="이 일차에는 세션이 없어요"
                  description="다른 일차를 선택해 보세요."
                  className="py-12"
                />
              ) : (
                <div className="space-y-2">
                  {filteredSchedules.map((schedule) => (
                    <ScheduleAttendanceCard
                      key={schedule.id}
                      schedule={schedule}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </LoadingSkeleton>
      </motion.div>
    </motion.div>
  )
}
