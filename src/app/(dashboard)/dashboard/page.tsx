'use client'

import { useRouter } from 'next/navigation'
import {
  Users,
  ClipboardCheck,
  Calendar,
  Trophy,
  Megaphone,
  Camera,
  HelpCircle,
  FolderOpen,
  Settings,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { EventBanner } from '@/components/dashboard/EventBanner'
import { StatCard } from '@/components/dashboard/StatCard'
import { ZeroDataGuide } from '@/components/dashboard/ZeroDataGuide'

import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useEvents } from '@/hooks/useEvents'
import { useParticipants } from '@/hooks/useParticipants'
import { useSchedules } from '@/hooks/useSchedules'
import { useEventStore } from '@/stores/eventStore'
import { cn } from '@/lib/utils'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const QUICK_ACTIONS = [
  { href: '/participants', icon: Users, label: '참가자', gradient: 'from-indigo-500 to-indigo-600' },
  { href: '/schedule', icon: Calendar, label: '일정', gradient: 'from-purple-500 to-purple-600' },
  { href: '/attendance', icon: ClipboardCheck, label: '출석', gradient: 'from-emerald-500 to-emerald-600' },
  { href: '/quiz', icon: HelpCircle, label: '퀴즈', gradient: 'from-amber-500 to-amber-600' },
  { href: '/announcements', icon: Megaphone, label: '공지', gradient: 'from-rose-500 to-rose-600' },
  { href: '/gallery', icon: Camera, label: '갤러리', gradient: 'from-cyan-500 to-cyan-600' },
  { href: '/groups', icon: Trophy, label: '조/반', gradient: 'from-orange-500 to-orange-600' },
  { href: '/materials', icon: FolderOpen, label: '자료실', gradient: 'from-fuchsia-500 to-fuchsia-600' },
  { href: '/settings', icon: Settings, label: '설정', gradient: 'from-slate-500 to-slate-600' },
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
  const { data: participants, isLoading: isParticipantsLoading } = useParticipants(eventId)
  const { data: schedules, isLoading: isSchedulesLoading } = useSchedules(eventId)
  const clearCurrentEvent = useEventStore((state) => state.clearCurrentEvent)

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
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Welcome */}
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-indigo-300 via-purple-300 to-fuchsia-300 bg-clip-text text-xl font-bold text-transparent">
            안녕하세요!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasData ? '오늘도 행사 준비를 함께해요' : '여름행사를 준비해 볼까요?'}
          </p>
        </div>
        <button
          type="button"
          onClick={clearCurrentEvent}
          className={cn(
            'rounded-xl border border-purple-500/15 bg-gradient-to-br from-purple-500/10 to-purple-600/5 px-3 py-2 text-xs',
            'text-purple-300 transition-all duration-300 backdrop-blur-xl',
            'hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]'
          )}
        >
          행사 변경
        </button>
      </motion.div>

      {/* Event banner + Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={fadeUp} className="md:col-span-2">
          <EventBanner
            eventName={event.name}
            startDate={startDate}
            endDate={endDate}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            value={isParticipantsLoading ? '...' : participantCount}
            label="참가자"
            icon={Users}
            color="indigo"
            description={hasParticipants ? undefined : '아직 등록된 참가자가 없어요'}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            value={isSchedulesLoading ? '...' : hasSchedule ? scheduleCount : '\u2014'}
            label={hasSchedule ? '일정' : '출석률'}
            icon={hasSchedule ? Calendar : ClipboardCheck}
            color="fuchsia"
            description={hasSchedule ? `${scheduleCount}개 세션이 준비됐어요` : '행사가 시작되면 표시돼요'}
          />
        </motion.div>
      </div>

      {/* Quick Actions Grid */}
      <motion.div variants={fadeUp}>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
          빠른 이동
        </h2>
        <motion.div
          className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5"
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
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-2xl',
                  'border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl',
                  'px-3 py-4 transition-all duration-300',
                  'hover:bg-white/[0.06] hover:shadow-2xl',
                  'active:scale-[0.97]'
                )}
              >
                <div className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg',
                  action.gradient
                )}>
                  <Icon className="size-5 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-400">
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
