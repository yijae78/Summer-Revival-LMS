'use client'

import { Users, ClipboardCheck, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

import { EventBanner } from '@/components/dashboard/EventBanner'
import { StatCard } from '@/components/dashboard/StatCard'
import { ZeroDataGuide } from '@/components/dashboard/ZeroDataGuide'

import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useEvents } from '@/hooks/useEvents'
import { useParticipants } from '@/hooks/useParticipants'
import { useSchedules } from '@/hooks/useSchedules'
import { useEventStore } from '@/stores/eventStore'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

function EventSelector() {
  const { events, isLoading } = useEvents()
  const setCurrentEventId = useEventStore((state) => state.setCurrentEventId)

  if (isLoading) {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
          <h1 className="text-xl font-bold text-white">환영해요!</h1>
          <p className="mt-1 text-sm text-[#8892a8]">
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

  return (
    <motion.div
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-bold text-white">행사를 선택해 주세요</h1>
        <p className="mt-1 text-sm text-[#8892a8]">
          관리할 행사를 선택하면 대시보드가 표시돼요
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <motion.button
            key={event.id}
            variants={fadeUp}
            type="button"
            onClick={() => handleSelectEvent(event.id)}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-5 text-left transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(56,189,248,0.1)] hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                {event.type === 'retreat' ? '수련회' : event.type === 'vbs' ? 'VBS' : '캠프'}
              </div>
              <h3 className="text-lg font-bold text-white">{event.name}</h3>
              <div className="flex items-center gap-2 text-sm text-[#8892a8]">
                <Calendar className="h-4 w-4" />
                <span>
                  {event.start_date} ~ {event.end_date}
                </span>
              </div>
              {event.location && (
                <p className="text-xs text-[#5c6478]">{event.location}</p>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

function DashboardContent() {
  const { event, isLoading: isEventLoading, eventId } = useCurrentEvent()
  const { data: participants, isLoading: isParticipantsLoading } = useParticipants(eventId)
  const { data: schedules, isLoading: isSchedulesLoading } = useSchedules(eventId)
  const clearCurrentEvent = useEventStore((state) => state.clearCurrentEvent)

  if (isEventLoading) {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">안녕하세요!</h1>
          <p className="mt-1 text-sm text-[#8892a8]">
            {hasData ? '오늘도 행사 준비를 함께해요' : '여름행사를 준비해 볼까요?'}
          </p>
        </div>
        <button
          type="button"
          onClick={clearCurrentEvent}
          className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#8892a8] transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.06] hover:text-white"
        >
          행사 변경
        </button>
      </motion.div>

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
            color="primary"
            description={hasParticipants ? undefined : '아직 등록된 참가자가 없어요'}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            value={isSchedulesLoading ? '...' : hasSchedule ? scheduleCount : '—'}
            label={hasSchedule ? '일정' : '출석률'}
            icon={hasSchedule ? Calendar : ClipboardCheck}
            color="secondary"
            description={hasSchedule ? `${scheduleCount}개 세션이 준비됐어요` : '행사가 시작되면 표시돼요'}
          />
        </motion.div>
      </div>

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
