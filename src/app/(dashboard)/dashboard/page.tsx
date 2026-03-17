'use client'

import { useRouter } from 'next/navigation'
import {
  Users,
  ClipboardCheck,
  Calendar,
  Trophy,
  Medal,
  Megaphone,
  Camera,
  HelpCircle,
  FolderOpen,
  Settings,
  Banknote,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { EventBanner } from '@/components/dashboard/EventBanner'
import { StatCard } from '@/components/dashboard/StatCard'
import { ZeroDataGuide } from '@/components/dashboard/ZeroDataGuide'
import { DepartmentFilter } from '@/components/shared/DepartmentFilter'

import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useEvents } from '@/hooks/useEvents'
import { useParticipants } from '@/hooks/useParticipants'
import { useSchedules } from '@/hooks/useSchedules'
import { useEventStore } from '@/stores/eventStore'
import { useDepartmentFilterStore } from '@/stores/departmentFilterStore'
import { useViewportStore } from '@/stores/viewportStore'
import { getDepartmentByKey, getDepartmentTheme } from '@/constants/departments'
import { cn } from '@/lib/utils'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const QUICK_ACTIONS = [
  { href: '/participants', icon: Users, label: '참가자', gradient: 'from-indigo-500 to-indigo-600' },
  { href: '/schedule', icon: Calendar, label: '일정', gradient: 'from-purple-500 to-purple-600' },
  { href: '/attendance', icon: ClipboardCheck, label: '출석', gradient: 'from-emerald-500 to-emerald-600' },
  { href: '/quiz', icon: HelpCircle, label: '퀴즈', gradient: 'from-amber-500 to-amber-600' },
  { href: '/leaderboard', icon: Trophy, label: '리더보드', gradient: 'from-amber-500 to-amber-600' },
  { href: '/announcements', icon: Megaphone, label: '공지', gradient: 'from-rose-500 to-rose-600' },
  { href: '/gallery', icon: Camera, label: '갤러리', gradient: 'from-cyan-500 to-cyan-600' },
  { href: '/groups', icon: Medal, label: '조/반', gradient: 'from-orange-500 to-orange-600' },
  { href: '/materials', icon: FolderOpen, label: '자료실', gradient: 'from-fuchsia-500 to-fuchsia-600' },
  { href: '/accounting', icon: Banknote, label: '회계', gradient: 'from-teal-500 to-teal-600' },
]

function EventSelector() {
  const { events, isLoading } = useEvents()
  const setCurrentEventId = useEventStore((state) => state.setCurrentEventId)

  if (isLoading) {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">행사 목록을 불러오고 있어요...</p>
        </div>
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <motion.div
        className="space-y-5"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <h1 className="bg-gradient-to-r from-indigo-300 via-purple-300 to-fuchsia-300 bg-clip-text text-xl font-bold text-transparent">환영해요!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            아직 등록된 행사가 없어요. 새 행사를 만들어 시작해 보세요.
          </p>
        </motion.div>
        <motion.div variants={fadeUp}>
          <ZeroDataGuide />
        </motion.div>
      </motion.div>
    )
  }

  function handleSelectEvent(eventId: string) {
    setCurrentEventId(eventId)
  }

  const eventColors = ['indigo', 'fuchsia', 'emerald', 'amber', 'rose', 'cyan'] as const
  const colorStyles = {
    indigo: { gradient: 'from-indigo-500/15 to-indigo-600/5', border: 'border-indigo-500/15', badge: 'bg-indigo-500/15 text-indigo-300', glow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]' },
    fuchsia: { gradient: 'from-fuchsia-500/15 to-fuchsia-600/5', border: 'border-fuchsia-500/15', badge: 'bg-fuchsia-500/15 text-fuchsia-300', glow: 'hover:shadow-[0_0_30px_rgba(232,121,249,0.15)]' },
    emerald: { gradient: 'from-emerald-500/15 to-emerald-600/5', border: 'border-emerald-500/15', badge: 'bg-emerald-500/15 text-emerald-300', glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]' },
    amber: { gradient: 'from-amber-500/15 to-amber-600/5', border: 'border-amber-500/15', badge: 'bg-amber-500/15 text-amber-300', glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]' },
    rose: { gradient: 'from-rose-500/15 to-rose-600/5', border: 'border-rose-500/15', badge: 'bg-rose-500/15 text-rose-300', glow: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]' },
    cyan: { gradient: 'from-cyan-500/15 to-cyan-600/5', border: 'border-cyan-500/15', badge: 'bg-cyan-500/15 text-cyan-300', glow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]' },
  }

  return (
    <motion.div
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp}>
        <h1 className="bg-gradient-to-r from-indigo-300 via-purple-300 to-fuchsia-300 bg-clip-text text-xl font-bold text-transparent">행사를 선택해 주세요</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          관리할 행사를 선택하면 대시보드가 표시돼요
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {events.map((event, idx) => {
          const colorKey = eventColors[idx % eventColors.length]
          const style = colorStyles[colorKey]
          return (
            <motion.button
              key={event.id}
              variants={fadeUp}
              type="button"
              onClick={() => handleSelectEvent(event.id)}
              className={cn(
                'group relative overflow-hidden rounded-2xl border bg-gradient-to-br backdrop-blur-xl',
                'p-5 text-left transition-all duration-300',
                'hover:scale-[1.02] hover:-translate-y-0.5',
                style.gradient,
                style.border,
                style.glow
              )}
            >
              <div className="relative z-10 space-y-3">
                <div className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', style.badge)}>
                  {event.type === 'retreat' ? '수련회' : event.type === 'vbs' ? 'VBS' : '캠프'}
                </div>
                <h3 className="text-lg font-bold text-foreground">{event.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {event.start_date} ~ {event.end_date}
                  </span>
                </div>
                {event.location && (
                  <p className="text-xs text-muted-foreground/60">{event.location}</p>
                )}
              </div>
            </motion.button>
          )
        })}
      </motion.div>
    </motion.div>
  )
}

function DashboardContent() {
  const router = useRouter()
  const { event, isLoading: isEventLoading, eventId } = useCurrentEvent()
  const viewport = useViewportStore((s) => s.viewport)
  const isMobileView = viewport === 'mobile' || viewport === 'tablet'
  const department = useDepartmentFilterStore((s) => s.department)
  const deptDef = getDepartmentByKey(department)
  const deptTheme = getDepartmentTheme(department)
  const { data: participants, isLoading: isParticipantsLoading } = useParticipants(eventId)
  const { data: schedules, isLoading: isSchedulesLoading } = useSchedules(eventId, undefined, department)
  const clearCurrentEvent = useEventStore((state) => state.clearCurrentEvent)

  // Map department to StatCard color
  const statColorMap: Record<string, 'indigo' | 'emerald' | 'fuchsia' | 'amber' | 'rose' | 'cyan'> = {
    all: 'indigo', kindergarten: 'rose', children: 'emerald', elementary: 'cyan',
    middle: 'indigo', high: 'amber', college: 'fuchsia', adult: 'cyan',
  }
  const statColor = statColorMap[department] ?? 'indigo'

  if (isEventLoading) {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">대시보드를 불러오고 있어요...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return <EventSelector />
  }

  const participantCount = participants?.length ?? 0
  const scheduleCount = schedules?.length ?? 0
  const hasParticipants = participantCount > 0
  const hasSchedule = scheduleCount > 0
  const hasData = hasParticipants || hasSchedule

  const startDate = new Date(event.start_date)
  const endDate = new Date(event.end_date)

  return (
    <motion.div
      className="space-y-3 md:space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Welcome + Department Badge */}
      <motion.div variants={fadeUp} className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className={cn('flex flex-wrap items-center', isMobileView ? 'gap-1.5' : 'gap-2.5')}>
            <h1
              className={cn('font-bold transition-colors duration-500', isMobileView ? 'text-sm' : 'text-xl')}
              style={{ color: `rgba(${deptTheme.primary}, 0.9)` }}
            >
              안녕하세요!
            </h1>
            {department !== 'all' && deptDef && (
              <motion.span
                key={department}
                initial={{ opacity: 0, scale: 0.8, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-bold transition-all duration-500 lg:px-2.5 lg:py-1 lg:text-xs"
                style={{
                  background: `linear-gradient(135deg, rgba(${deptTheme.primary},0.2), rgba(${deptTheme.secondary},0.1))`,
                  border: `1px solid rgba(${deptTheme.primary},0.25)`,
                  color: `rgba(${deptTheme.primary}, 1)`,
                }}
              >
                <span>{deptDef.emoji}</span>
                {deptDef.label}
              </motion.span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground lg:mt-1 lg:text-sm">
            {hasData ? '오늘도 행사 준비를 함께해요' : '여름행사를 준비해 볼까요?'}
          </p>
        </div>
        <button
          type="button"
          onClick={clearCurrentEvent}
          className={cn(
            'shrink-0 rounded-lg border px-2.5 py-1.5 text-[0.6875rem] transition-all duration-500 backdrop-blur-xl lg:rounded-xl lg:px-3 lg:py-2 lg:text-xs',
            'hover:scale-[1.02]'
          )}
          style={{
            borderColor: `rgba(${deptTheme.primary},0.15)`,
            background: `linear-gradient(135deg, rgba(${deptTheme.primary},0.1), rgba(${deptTheme.secondary},0.05))`,
            color: `rgba(${deptTheme.primary},0.8)`,
          }}
        >
          행사 변경
        </button>
      </motion.div>

      <DepartmentFilter />

      {/* Event banner + Stats */}
      <div className={cn(
        isMobileView
          ? 'space-y-2'
          : 'grid grid-cols-4 gap-4'
      )}>
        <motion.div variants={fadeUp} className={cn(!isMobileView && 'col-span-2 [&>div]:h-full')}>
          <EventBanner eventName={event.name} startDate={startDate} endDate={endDate} />
        </motion.div>
        <div className={cn(isMobileView ? 'grid grid-cols-2 gap-2' : 'contents')}>
          <motion.div variants={fadeUp} className="cursor-pointer" onClick={() => router.push('/participants')} whileTap={{ scale: 0.97 }}>
            <StatCard value={isParticipantsLoading ? '...' : participantCount} label="참가자" icon={Users} color={statColor} className="h-full" />
          </motion.div>
          <motion.div variants={fadeUp} className="cursor-pointer" onClick={() => router.push('/schedule')} whileTap={{ scale: 0.97 }}>
            <StatCard value={isSchedulesLoading ? '...' : hasSchedule ? scheduleCount : '\u2014'} label={hasSchedule ? '일정' : '출석률'} icon={hasSchedule ? Calendar : ClipboardCheck} color={statColor} className="h-full" />
          </motion.div>
        </div>
      </div>

      {/* Quick Actions Grid — mobile: compact 4 cols */}
      <motion.div variants={fadeUp}>
        <h2 className={cn('mb-2 flex items-center gap-2 font-semibold text-foreground', isMobileView ? 'text-sm' : 'mb-3 text-base')}>
          빠른 이동
        </h2>
        <motion.div
          className={cn('grid gap-2', isMobileView ? 'grid-cols-4' : 'grid-cols-5 gap-3')}
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.href}
                variants={fadeUp}
                type="button"
                onClick={() => router.push(action.href)}
                whileTap={{ scale: 0.93 }}
                className={cn(
                  'flex flex-col items-center justify-center rounded-xl',
                  'bg-white/[0.04] backdrop-blur-xl transition-all duration-300',
                  'hover:bg-white/[0.06] active:scale-[0.95]',
                  isMobileView ? 'gap-1 px-1.5 py-2.5' : 'gap-2 rounded-2xl px-3 py-4'
                )}
                style={{
                  border: `1px solid rgba(${deptTheme.primary},0.08)`,
                }}
              >
                <div className={cn(
                  'flex items-center justify-center bg-gradient-to-br',
                  isMobileView ? 'h-9 w-9 rounded-xl shadow-md' : 'h-12 w-12 rounded-2xl shadow-lg',
                  action.gradient
                )}>
                  <Icon className={cn('text-white', isMobileView ? 'size-4' : 'size-5')} />
                </div>
                <span className={cn('font-medium text-slate-400', isMobileView ? 'text-[0.625rem]' : 'text-xs')}>
                  {action.label}
                </span>
              </motion.button>
            )
          })}
        </motion.div>
      </motion.div>

      {!hasData && (
        <motion.div variants={fadeUp}>
          <ZeroDataGuide
            hasEvent
            hasParticipants={hasParticipants}
            hasSchedule={hasSchedule}
          />
        </motion.div>
      )}
    </motion.div>
  )
}

export default function DashboardPage() {
  const eventId = useEventStore((state) => state.currentEventId)

  if (!eventId) {
    return <EventSelector />
  }

  return <DashboardContent />
}
