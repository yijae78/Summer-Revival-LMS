'use client'

import { useMemo } from 'react'

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

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'

import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useSchedules } from '@/hooks/useSchedules'
import { cn } from '@/lib/utils'

import type { Schedule, SessionType } from '@/types'

const SESSION_CONFIG: Record<
  SessionType,
  { label: string; icon: typeof BookOpen; className: string }
> = {
  worship: {
    label: '예배',
    icon: Music,
    className: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  },
  study: {
    label: '공부',
    icon: BookOpen,
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  },
  recreation: {
    label: '레크레이션',
    icon: Gamepad2,
    className: 'bg-green-500/15 text-green-400 border-green-500/20',
  },
  meal: {
    label: '식사',
    icon: Utensils,
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  },
  free: {
    label: '자유시간',
    icon: Coffee,
    className: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  },
  special: {
    label: '특별활동',
    icon: Star,
    className: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
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

function ScheduleCard({ schedule }: { schedule: Schedule }) {
  const config = SESSION_CONFIG[schedule.type as SessionType] ?? SESSION_CONFIG.special
  const TypeIcon = config.icon

  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex gap-4 px-4 py-4 md:px-6">
        {/* Time column */}
        <div className="flex w-20 shrink-0 flex-col items-start pt-0.5">
          <span className="text-sm font-semibold text-foreground">
            {schedule.start_time.slice(0, 5)}
          </span>
          <span className="text-xs text-muted-foreground/60">
            {schedule.end_time.slice(0, 5)}
          </span>
        </div>

        {/* Vertical line indicator */}
        <div className="relative flex w-1 shrink-0 items-stretch">
          <div className={cn('w-full rounded-full', config.className.split(' ')[0])} />
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
      </CardContent>
    </Card>
  )
}

function ScheduleSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, dayIdx) => (
        <div key={dayIdx} className="space-y-3">
          <SkeletonBox className="h-6 w-24" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-xl border bg-card p-4 md:p-6">
              <div className="w-20 space-y-1">
                <SkeletonBox className="h-4 w-12" />
                <SkeletonBox className="h-3 w-10" />
              </div>
              <SkeletonBox className="h-full w-1" />
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">일정표</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            행사 일정을 확인해 보세요
          </p>
        </div>
      </div>

      <LoadingSkeleton isLoading={isLoading} skeleton={<ScheduleSkeleton />}>
        {sortedDays.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="아직 등록된 일정이 없어요"
            description="관리자가 일정을 등록하면 여기에 표시돼요."
          />
        ) : (
          <div className="space-y-8">
            {sortedDays.map((day) => {
              const daySchedules = groupedByDay.get(day) ?? []
              const firstSchedule = daySchedules[0]
              const dateDisplay = firstSchedule?.date
                ? ` (${firstSchedule.date})`
                : ''

              return (
                <section key={day} className="space-y-3">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <CalendarDays className="size-4 text-primary" />
                    {day}일차{dateDisplay}
                  </h2>

                  <div className="space-y-2">
                    {daySchedules.map((schedule) => (
                      <ScheduleCard key={schedule.id} schedule={schedule} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </LoadingSkeleton>
    </div>
  )
}
