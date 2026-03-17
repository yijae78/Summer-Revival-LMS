'use client'

import { CalendarDays, MapPin } from 'lucide-react'
import { differenceInDays, format } from 'date-fns'
import { ko } from 'date-fns/locale'

import { useDepartmentFilterStore } from '@/stores/departmentFilterStore'
import { getDepartmentTheme } from '@/constants/departments'

interface EventBannerProps {
  eventName: string
  startDate: Date
  endDate: Date
}

export function EventBanner({ eventName, startDate, endDate }: EventBannerProps) {
  const today = new Date()
  const daysUntilStart = differenceInDays(startDate, today)
  const totalDays = differenceInDays(endDate, startDate) + 1
  const currentDay = differenceInDays(today, startDate) + 1

  const department = useDepartmentFilterStore((s) => s.department)
  const theme = getDepartmentTheme(department)

  function getDdayText(): string {
    if (daysUntilStart > 0) return `D-${daysUntilStart}`
    if (daysUntilStart === 0) return 'D-Day'
    if (currentDay > 0 && currentDay <= totalDays) return `Day ${currentDay}/${totalDays}`
    return `D+${Math.abs(daysUntilStart)}`
  }

  function getDdayLabel(): string {
    if (daysUntilStart > 0) return '행사까지'
    if (daysUntilStart === 0) return '오늘 시작!'
    if (currentDay > 0 && currentDay <= totalDays) return '진행 중'
    return '행사 종료'
  }

  const dateText = `${format(startDate, 'M.d(EEE)', { locale: ko })}~${format(endDate, 'M.d(EEE)', { locale: ko })}`

  return (
    <div
      className="relative overflow-hidden rounded-xl p-3 transition-all duration-700 lg:rounded-2xl lg:p-5"
      style={{
        border: `1px solid rgba(${theme.primary},0.2)`,
        background: `linear-gradient(135deg, rgba(${theme.primary},0.14) 0%, rgba(${theme.secondary},0.08) 50%, rgba(${theme.primary},0.04) 100%)`,
      }}
    >
      {/* Glow */}
      <div
        className="absolute -right-12 -top-12 h-36 w-36 rounded-full blur-3xl transition-all duration-700 lg:h-56 lg:w-56 lg:-right-16 lg:-top-16"
        style={{ background: `rgba(${theme.primary},0.15)` }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Mobile: single compact block */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[0.8125rem] font-extrabold text-white lg:text-xl lg:text-2xl">
              {eventName}
            </h2>
            <div className="mt-1 flex items-center gap-1.5 text-[0.5625rem] text-slate-400 lg:text-xs">
              <CalendarDays className="h-2.5 w-2.5 shrink-0 lg:h-3.5 lg:w-3.5" />
              <span>{dateText}</span>
              <span className="text-slate-600">·</span>
              <span>{totalDays - 1}박{totalDays}일</span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[0.4375rem] font-semibold uppercase tracking-widest text-slate-500 lg:text-[0.625rem]">
              {getDdayLabel()}
            </p>
            <p
              className="font-mono text-sm font-black tracking-tighter transition-all duration-700 lg:text-4xl lg:text-5xl"
              style={{
                color: `rgba(${theme.primary},1)`,
                textShadow: `0 0 16px rgba(${theme.primary},0.3)`,
              }}
            >
              {getDdayText()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
