'use client'

import { useState, useMemo, useCallback } from 'react'
import { useParams } from 'next/navigation'

import { Search, Users, ClipboardCheck } from 'lucide-react'
import { motion } from 'framer-motion'

import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { AttendanceChecker } from '@/components/dashboard/AttendanceChecker'
import { AttendanceStats } from '@/components/dashboard/AttendanceStats'

import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useParticipants } from '@/hooks/useParticipants'
import { useOptimisticAttendance } from '@/hooks/useOptimisticAttendance'

import type { AttendanceStatus } from '@/types'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

function AttendanceDetailSkeleton() {
  return (
    <div className="space-y-4">
      {/* Stats skeleton */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
        <SkeletonBox className="h-2.5 w-full rounded-full" />
        <div className="mt-3 flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBox key={i} className="h-4 w-14" />
          ))}
        </div>
      </div>

      {/* Search skeleton */}
      <SkeletonBox className="h-12 w-full rounded-xl" />

      {/* List skeleton */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-3">
          <SkeletonBox className="h-4 w-20 flex-1" />
          <div className="flex gap-1.5">
            {Array.from({ length: 4 }).map((_, j) => (
              <SkeletonBox key={j} className="h-9 w-12 rounded-md" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AttendanceDetailPage() {
  const params = useParams()
  const scheduleId = params.scheduleId as string

  const { eventId } = useCurrentEvent()
  const { data: participants, isLoading: isParticipantsLoading } = useParticipants(eventId ?? null)
  const {
    records,
    updateStatus,
    isLoading: isAttendanceLoading,
    isParticipantUpdating,
  } = useOptimisticAttendance(scheduleId)

  const [searchQuery, setSearchQuery] = useState('')

  const isLoading = isParticipantsLoading || isAttendanceLoading

  // Build attendance map: participantId -> status
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceStatus>()
    for (const record of records) {
      if (record.participant_id) {
        map.set(record.participant_id, record.status as AttendanceStatus)
      }
    }
    return map
  }, [records])

  // Filter participants by search query
  const filteredParticipants = useMemo(() => {
    if (!participants) return []
    if (!searchQuery.trim()) return participants

    const query = searchQuery.trim().toLowerCase()
    return participants.filter((p) => p.name.toLowerCase().includes(query))
  }, [participants, searchQuery])

  // Compute stats
  const stats = useMemo(() => {
    const total = participants?.length ?? 0
    let present = 0
    let late = 0
    let absent = 0
    let excused = 0

    for (const [, status] of attendanceMap) {
      switch (status) {
        case 'present':
          present++
          break
        case 'late':
          late++
          break
        case 'absent':
          absent++
          break
        case 'excused':
          excused++
          break
      }
    }

    return { present, late, absent, excused, total }
  }, [attendanceMap, participants])

  const handleStatusChange = useCallback(
    (participantId: string, status: AttendanceStatus) => {
      updateStatus(participantId, status)
    },
    [updateStatus]
  )

  return (
    <motion.div
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <PageHeader
        title="출석 체크"
        description="참가자의 출석 상태를 체크하세요"
        backHref="/attendance"
        backLabel="출석 목록으로"
      />

      <motion.div variants={fadeUp}>
      <LoadingSkeleton isLoading={isLoading} skeleton={<AttendanceDetailSkeleton />}>
        {(!participants || participants.length === 0) ? (
          <EmptyState
            icon={Users}
            title="등록된 참가자가 없어요"
            description="참가자를 먼저 등록하면 출석 체크를 할 수 있어요."
          />
        ) : (
          <div className="space-y-4">
            {/* Summary stats in glass card */}
            <div className="rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-4 backdrop-blur-xl">
              <AttendanceStats
                present={stats.present}
                late={stats.late}
                absent={stats.absent}
                excused={stats.excused}
                total={stats.total}
              />
            </div>

            {/* Checked count */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ClipboardCheck className="size-4" />
              <span>
                {stats.present + stats.late + stats.absent + stats.excused}명 체크됨
                {' / '}
                총 {stats.total}명
              </span>
            </div>

            {/* Search - glass input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="참가자 이름으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-10 rounded-xl border-white/[0.08] bg-white/[0.03] backdrop-blur-sm focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {/* Participant list */}
            {filteredParticipants.length === 0 ? (
              <EmptyState
                icon={Search}
                title="검색 결과가 없어요"
                description="다른 이름으로 검색해 보세요."
                className="py-12"
              />
            ) : (
              <div className="space-y-1.5">
                {filteredParticipants.map((participant) => (
                  <AttendanceChecker
                    key={participant.id}
                    participantId={participant.id}
                    participantName={participant.name}
                    currentStatus={attendanceMap.get(participant.id) ?? null}
                    scheduleId={scheduleId}
                    onStatusChange={handleStatusChange}
                    isUpdating={isParticipantUpdating(participant.id)}
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
