'use client'

import { useState, useMemo } from 'react'

import {
  CalendarDays,
  Clock,
  MapPin,
  BookOpen,
  Utensils,
  Gamepad2,
  Music,
  Star,
  Coffee,
} from 'lucide-react'

import { motion } from 'framer-motion'

import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'

import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useSchedules } from '@/hooks/useSchedules'
import { cn } from '@/lib/utils'

import type { Schedule, SessionType } from '@/types'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const SESSION_CONFIG: Record<
  SessionType,
  { label: string; icon: typeof BookOpen; className: string; dotColor: string }
> = {
  worship: {
    label: '예배',
    icon: Music,
    className: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    dotColor: 'bg-purple-400',
  },
  study: {
    label: '공부',
    icon: BookOpen,
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    dotColor: 'bg-blue-400',
  },
  recreation: {
    label: '레크레이션',
    icon: Gamepad2,
    className: 'bg-green-500/15 text-green-400 border-green-500/20',
    dotColor: 'bg-green-400',
  },
  meal: {
    label: '식사',
    icon: Utensils,
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    dotColor: 'bg-amber-400',
  },
  free: {
    label: '자유시간',
    icon: Coffee,
    className: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
    dotColor: 'bg-slate-400',
  },
  special: {
    label: '특별활동',
    icon: Star,
    className: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
    dotColor: 'bg-rose-400',
  },
}

function formatTimeRange(startTime: string, endTime: string): string {
  const formatSingle = (t: string) => {
    const parts = t.split(':')
    if (parts.length < 2) return t
    const hour = parseInt(parts[0], 10)
    const minute = parts[1]
    const period = hour < 12 ? '오전' : '오후'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${period} ${displayHour}:${minute}`
  }

  return `${formatSingle(startTime)} - ${formatSingle(endTime)}`
}

function TimelineCard({ schedule, isLast }: { schedule: Schedule; isLast: boolean }) {
  const config = SESSION_CONFIG[schedule.type as SessionType] ?? SESSION_CONFIG.special
  const TypeIcon = config.icon

  return (
    <div className="relative flex gap-4 pl-1">
      {/* Timeline column: dot + line */}
      <div className="flex w-6 shrink-0 flex-col items-center">
        <div className={cn('mt-1.5 h-3 w-3 shrink-0 rounded-full ring-2 ring-background', config.dotColor)} />
        {!isLast && (
          <div className="w-px flex-1 bg-white/[0.08]" />
        )}
      </div>

      {/* Card */}
      <motion.div
        variants={fadeUp}
        className={cn(
          'mb-3 flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl',
          'transition-all duration-300',
          'hover:border-primary/20 hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(56,189,248,0.1)]'
        )}
      >
        <div className="flex gap-4 px-4 py-4 md:px-5">
          {/* Time */}
          <div className="flex w-16 shrink-0 flex-col items-start pt-0.5">
            <span className="text-sm font-semibold text-foreground">
              {schedule.start_time.slice(0, 5)}
            </span>
            <span className="text-xs text-muted-foreground/60">
              {schedule.end_time.slice(0, 5)}
            </span>
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[0.9375rem] font-medium leading-snug text-foreground">
                {schedule.title}
              </p>
              <Badge
                variant="outline"
                className={cn('shrink-0 text-xs', config.className)}
              >
                <TypeIcon className="mr-0.5 size-3" />
                {config.label}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {formatTimeRange(schedule.start_time, schedule.end_time)}
              </span>
              {schedule.location && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {schedule.location}
                </span>
              )}
            </div>

            {schedule.speaker && (
              <p className="text-xs text-muted-foreground">
                {schedule.speaker}
              </p>
            )}

            {schedule.description && (
              <p className="text-xs leading-relaxed text-muted-foreground/80">
                {schedule.description}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function ScheduleSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, dayIdx) => (
        <div key={dayIdx} className="space-y-3">
          <SkeletonBox className="h-6 w-24" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-4 md:p-6">
              <div className="w-16 space-y-1">
                <SkeletonBox className="h-4 w-12" />
                <SkeletonBox className="h-3 w-10" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <SkeletonBox className="h-4 w-36" />
                  <SkeletonBox className="h-5 w-16" />
                </div>
                <SkeletonBox className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function SchedulePage() {
  const { eventId } = useCurrentEvent()
  const { data: schedules, isLoading } = useSchedules(eventId ?? null)

  const groupedByDay = useMemo(() => {
    if (!schedules || schedules.length === 0) return new Map<number, Schedule[]>()

    const groups = new Map<number, Schedule[]>()
    for (const schedule of schedules) {
      const day = schedule.day_number
      if (!groups.has(day)) {
        groups.set(day, [])
      }
      groups.get(day)!.push(schedule)
    }
    return groups
  }, [schedules])

  const sortedDays = useMemo(
    () => Array.from(groupedByDay.keys()).sort((a, b) => a - b),
    [groupedByDay]
  )

  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const activeDay = selectedDay ?? sortedDays[0] ?? null

  const activeDaySchedules = useMemo(() => {
    if (activeDay === null) return []
    return groupedByDay.get(activeDay) ?? []
  }, [groupedByDay, activeDay])

  return (
    <motion.div
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <PageHeader
        title="일정"
        description="행사 일정을 확인해요"
        backHref="/dashboard"
      />

      <motion.div variants={fadeUp}>
        <LoadingSkeleton isLoading={isLoading} skeleton={<ScheduleSkeleton />}>
          {sortedDays.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="아직 등록된 일정이 없어요"
              description="관리자가 일정을 등록하면 여기에 표시돼요."
            />
          ) : (
            <div className="space-y-5">
              {/* Day tabs - glass pill style */}
              {sortedDays.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {sortedDays.map((day) => {
                    const daySchedules = groupedByDay.get(day) ?? []
                    const dateDisplay = daySchedules[0]?.date ?? ''
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className={cn(
                          'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300',
                          activeDay === day
                            ? 'border-primary/30 bg-primary/10 text-primary shadow-[0_0_16px_rgba(56,189,248,0.15)]'
                            : 'border-white/[0.08] bg-white/[0.04] text-muted-foreground hover:border-primary/20 hover:bg-white/[0.06]'
                        )}
                      >
                        <CalendarDays className="size-3.5" />
                        {day}일차
                        {dateDisplay && (
                          <span className="text-xs opacity-60">{dateDisplay}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Timeline */}
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
              >
                {activeDaySchedules.map((schedule, idx) => (
                  <TimelineCard
                    key={schedule.id}
                    schedule={schedule}
                    isLast={idx === activeDaySchedules.length - 1}
                  />
                ))}
              </motion.div>
            </div>
          )}
        </LoadingSkeleton>
      </motion.div>
    </motion.div>
  )
}
