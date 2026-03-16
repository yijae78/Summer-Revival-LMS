'use client'

import { CalendarDays, MapPin } from 'lucide-react'
import { differenceInDays, format } from 'date-fns'
import { ko } from 'date-fns/locale'

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

  const dateText = `${format(startDate, 'M월 d일 (EEE)', { locale: ko })} ~ ${format(endDate, 'M월 d일 (EEE)', { locale: ko })}`

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-fuchsia-500/5 backdrop-blur-xl p-6 shadow-[0_0_40px_rgba(99,102,241,0.1)]">
      {/* Vivid gradient glow effects */}
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/10 blur-3xl" />
      <div className="absolute -bottom-10 left-1/4 h-36 w-36 rounded-full bg-fuchsia-500/10 blur-2xl" />
      <div className="absolute right-1/3 top-1/2 h-20 w-20 rounded-full bg-cyan-500/10 blur-xl" />

      {/* Shimmer border animation */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(129,140,248,0.15) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'textShimmer 4s ease-in-out infinite',
        }}
      />

      {/* Holy Spirit flame mark */}
      <div className="absolute right-6 top-6 opacity-15 lg:right-10 lg:top-1/2 lg:-translate-y-1/2">
        <svg
          className="h-28 w-28 lg:h-40 lg:w-40"
          viewBox="0 0 120 120"
          fill="none"
          style={{ animation: 'fireFloat 4s ease-in-out infinite' }}
        >
          <path
            d="M60 10 C60 10, 30 50, 30 72 C30 92, 45 110, 60 110 C75 110, 90 92, 90 72 C90 50, 60 10, 60 10Z"
            fill="url(#vividFlame)"
            style={{ animation: 'flamePulse 2.5s ease-in-out infinite' }}
          />
          <path
            d="M60 40 C60 40, 44 65, 44 78 C44 92, 52 102, 60 102 C68 102, 76 92, 76 78 C76 65, 60 40, 60 40Z"
            fill="url(#vividFlameInner)"
            style={{ animation: 'flamePulse 2.5s ease-in-out infinite 0.4s' }}
          />
          <ellipse cx="60" cy="88" rx="7" ry="10" fill="#e0e7ff" opacity="0.8" />
          <path
            d="M54 78 C54 78, 56 74, 60 74 C64 74, 66 78, 66 78 C66 78, 64 76, 60 76 C56 76, 54 78, 54 78Z"
            fill="white"
            opacity="0.5"
          />
          <defs>
            <linearGradient id="vividFlame" x1="60" y1="10" x2="60" y2="110" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#818cf8" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="vividFlameInner" x1="60" y1="40" x2="60" y2="102" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f5f3ff" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#c084fc" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
            <FlameIcon className="h-3.5 w-3.5" />
            여름행사
          </div>
          <h2 className="bg-gradient-to-r from-indigo-200 via-purple-200 to-fuchsia-200 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent lg:text-3xl">
            {eventName}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {dateText}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {totalDays}박 {totalDays - 1}일
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 lg:flex-col lg:items-end lg:gap-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {getDdayLabel()}
          </p>
          <p className="bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text font-mono text-5xl font-black tracking-tighter text-transparent lg:text-6xl">
            {getDdayText()}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fireFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.03); }
        }
        @keyframes flamePulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c0 0-6.5 8-6.5 13a6.5 6.5 0 0 0 13 0C18.5 10 12 2 12 2zm0 17.5c-2.5 0-4.5-2-4.5-4.5 0-3 3-7.5 4.5-9.5 1.5 2 4.5 6.5 4.5 9.5 0 2.5-2 4.5-4.5 4.5z" />
    </svg>
  )
}
