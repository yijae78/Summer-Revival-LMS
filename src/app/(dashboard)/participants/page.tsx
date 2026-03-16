'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { Users, Search, DollarSign, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'

import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useParticipants } from '@/hooks/useParticipants'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils/format-date'

import type { Participant } from '@/types'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const GRADE_LABELS: Record<string, string> = {
  elementary_1: '초1',
  elementary_2: '초2',
  elementary_3: '초3',
  elementary_4: '초4',
  elementary_5: '초5',
  elementary_6: '초6',
  middle_1: '중1',
  middle_2: '중2',
  middle_3: '중3',
  high_1: '고1',
  high_2: '고2',
  high_3: '고3',
  college: '대학생',
  adult: '성인',
}

function ParticipantCard({
  participant,
  onClick,
}: {
  participant: Participant
  onClick: () => void
}) {
  const gradeLabel = participant.grade ? GRADE_LABELS[participant.grade] ?? participant.grade : null

  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'cursor-pointer rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 backdrop-blur-xl',
        'transition-all duration-300',
        'hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]',
        'active:scale-[0.99]'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="flex items-center gap-4 px-4 py-4 md:px-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white ring-2 ring-indigo-500/20">
          <span className="text-base font-semibold">
            {participant.name.charAt(0)}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <p className="truncate text-[0.9375rem] font-semibold text-foreground">
              {participant.name}
            </p>
            {gradeLabel && (
              <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-muted-foreground">
                {gradeLabel}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {participant.fee_paid ? (
              <Badge
                variant="outline"
                className="bg-emerald-500/15 text-xs text-emerald-400 border-emerald-500/20"
              >
                <DollarSign className="mr-0.5 size-3" />
                납부 완료
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-amber-500/15 text-xs text-amber-400 border-amber-500/20"
              >
                <DollarSign className="mr-0.5 size-3" />
                미납
              </Badge>
            )}
            {participant.gender && (
              <span className="text-xs text-muted-foreground/60">
                {participant.gender === 'male' ? '남' : '여'}
              </span>
            )}
            <span className="text-xs text-muted-foreground/60">
              {formatRelativeTime(participant.created_at)}
            </span>
          </div>
        </div>

        <ChevronRight className="size-4 shrink-0 text-muted-foreground/40" />
      </div>
    </motion.div>
  )
}

function ParticipantSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 md:p-6">
          <SkeletonBox className="h-11 w-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonBox className="h-4 w-32" />
            <div className="flex gap-2">
              <SkeletonBox className="h-5 w-16" />
              <SkeletonBox className="h-3 w-16" />
            </div>
          </div>
          <SkeletonBox className="h-4 w-4 rounded-sm" />
        </div>
      ))}
    </div>
  )
}

const GRADE_FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'elementary', label: '초등' },
  { key: 'middle', label: '중등' },
  { key: 'high', label: '고등' },
  { key: 'college', label: '대학' },
  { key: 'adult', label: '성인' },
]

function matchGradeFilter(grade: string | null, filter: string): boolean {
  if (filter === 'all') return true
  if (!grade) return false
  if (filter === 'elementary') return grade.startsWith('elementary') || grade.startsWith('초')
  if (filter === 'middle') return grade.startsWith('middle') || grade.startsWith('중')
  if (filter === 'high') return grade.startsWith('high') || grade.startsWith('고')
  if (filter === 'college') return grade === 'college' || grade === '대학생'
  if (filter === 'adult') return grade === 'adult' || grade === '성인'
  return false
}

export default function ParticipantsPage() {
  const router = useRouter()
  const { eventId } = useCurrentEvent()
  const [searchQuery, setSearchQuery] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')

  const { data: participants, isLoading } = useParticipants(eventId ?? null)

  const filteredParticipants = useMemo(() => {
    if (!participants) return []
    let filtered = participants

    // 학년 필터
    if (gradeFilter !== 'all') {
      filtered = filtered.filter((p) => matchGradeFilter(p.grade, gradeFilter))
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query))
    }

    return filtered
  }, [participants, searchQuery, gradeFilter])

  const paidCount = useMemo(
    () => participants?.filter((p) => p.fee_paid).length ?? 0,
    [participants]
  )

  const gradeCountMap = useMemo(() => {
    if (!participants) return {} as Record<string, number>
    const map: Record<string, number> = { all: participants.length }
    GRADE_FILTERS.slice(1).forEach((f) => {
      map[f.key] = participants.filter((p) => matchGradeFilter(p.grade, f.key)).length
    })
    return map
  }, [participants])

  const handleNavigateToDetail = useCallback(
    (id: string) => {
      router.push(`/participants/${id}`)
    },
    [router]
  )

  return (
    <motion.div
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <PageHeader
        title="참가자"
        description="행사 참가자를 관리해요"
        backHref="/dashboard"
      />

      {/* Search */}
      <motion.div variants={fadeUp} className="relative">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="이름으로 검색해 주세요"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 pl-10 rounded-xl border-white/[0.08] bg-white/[0.03] backdrop-blur-sm focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
        />
      </motion.div>

      {/* Grade filter tabs */}
      <motion.div variants={fadeUp} className="flex gap-1.5 overflow-x-auto pb-1">
        {GRADE_FILTERS.map((f) => {
          const count = gradeCountMap[f.key] ?? 0
          const isActive = gradeFilter === f.key
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setGradeFilter(f.key)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_0_16px_rgba(99,102,241,0.3)]'
                  : 'border border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground'
              )}
            >
              {f.label}
              {count > 0 && (
                <span className={cn(
                  'rounded-full px-1.5 py-0.5 text-[0.625rem]',
                  isActive ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-muted-foreground'
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </motion.div>

      {/* Summary bar */}
      {participants && participants.length > 0 && (
        <motion.div
          variants={fadeUp}
          className="flex items-center gap-4 rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/5 px-5 py-3 backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 text-sm">
            <Users className="size-4 text-indigo-400" />
            <span className="font-medium text-foreground">
              총 {participants.length}명
            </span>
          </div>
          <div className="h-4 w-px bg-white/[0.08]" />
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="size-4 text-emerald-400" />
            <span className="text-muted-foreground">
              납부 {paidCount}명
            </span>
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <LoadingSkeleton isLoading={isLoading} skeleton={<ParticipantSkeleton />}>
          {filteredParticipants.length === 0 ? (
            searchQuery.trim() ? (
              <EmptyState
                icon={Search}
                title="검색 결과가 없어요"
                description={`"${searchQuery}"에 해당하는 참가자를 찾을 수 없어요.`}
              />
            ) : (
              <EmptyState
                icon={Users}
                title="아직 참가자가 없어요"
                description="초대 코드를 공유해서 참가 신청을 받아 보세요."
              />
            )
          ) : (
            <motion.div
              className="space-y-3"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {filteredParticipants.map((participant) => (
                <ParticipantCard
                  key={participant.id}
                  participant={participant}
                  onClick={() => handleNavigateToDetail(participant.id)}
                />
              ))}
            </motion.div>
          )}
        </LoadingSkeleton>
      </motion.div>
    </motion.div>
  )
}
