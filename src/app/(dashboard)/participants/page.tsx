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
import { DEPARTMENTS, matchDepartment as matchDept } from '@/constants/departments'
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
  adult: '교사',
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

function matchSubGrade(grade: string | null, subGrade: string | null): boolean {
  if (!subGrade) return true
  if (!grade) return false
  return grade === subGrade
}

export default function ParticipantsPage() {
  const router = useRouter()
  const { eventId } = useCurrentEvent()
  const [searchQuery, setSearchQuery] = useState('')
  const [department, setDepartment] = useState('all')
  const [subGrade, setSubGrade] = useState<string | null>(null)

  const { data: participants, isLoading } = useParticipants(eventId ?? null)

  const activeDept = DEPARTMENTS.find((d) => d.key === department)

  const filteredParticipants = useMemo(() => {
    if (!participants) return []
    let filtered = participants

    // 부서 필터
    if (department !== 'all') {
      filtered = filtered.filter((p) => matchDept(p.grade, department))
    }

    // 세부 학년 필터
    if (subGrade) {
      filtered = filtered.filter((p) => matchSubGrade(p.grade, subGrade))
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query))
    }

    return filtered
  }, [participants, searchQuery, department, subGrade])

  const paidCount = useMemo(
    () => participants?.filter((p) => p.fee_paid).length ?? 0,
    [participants]
  )

  const deptCountMap = useMemo(() => {
    if (!participants) return {} as Record<string, number>
    const map: Record<string, number> = { all: participants.length }
    DEPARTMENTS.slice(1).forEach((d) => {
      map[d.key] = participants.filter((p) => matchDept(p.grade, d.key)).length
    })
    return map
  }, [participants])

  const subGradeCountMap = useMemo(() => {
    if (!participants || !activeDept) return {} as Record<string, number>
    const map: Record<string, number> = {}
    activeDept.subGrades.forEach((sg) => {
      map[sg] = participants.filter((p) => p.grade === sg).length
    })
    return map
  }, [participants, activeDept])

  function handleDeptChange(key: string) {
    setDepartment(key)
    setSubGrade(null)
  }

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

      {/* Department filter — 3D hover */}
      <motion.div variants={fadeUp} className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {DEPARTMENTS.map((d) => {
            const count = deptCountMap[d.key] ?? 0
            const isActive = department === d.key
            return (
              <motion.button
                key={d.key}
                type="button"
                onClick={() => handleDeptChange(d.key)}
                whileHover={{
                  y: -6,
                  scale: 1.05,
                  rotateX: -5,
                  transition: { type: 'spring', stiffness: 400, damping: 15 },
                }}
                whileTap={{ scale: 0.95, y: 0 }}
                className={cn(
                  'relative flex shrink-0 flex-col items-center gap-1 rounded-2xl px-4 py-3 text-xs font-bold transition-colors duration-200',
                  isActive
                    ? cn('bg-gradient-to-br text-white shadow-xl', d.gradient)
                    : 'border border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:text-foreground',
                )}
                style={{
                  perspective: '600px',
                  boxShadow: isActive
                    ? '0 10px 30px -5px rgba(0,0,0,0.4), 0 0 20px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.15)'
                    : undefined,
                }}
              >
                <span className="text-base">{d.emoji}</span>
                <span>{d.label}</span>
                {count > 0 && (
                  <span className={cn(
                    'absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.5625rem] font-black',
                    isActive
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'bg-white/10 text-muted-foreground',
                  )}>
                    {count}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Sub-grade tabs — 세부 학년 */}
        {activeDept && activeDept.subGrades.length > 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-1.5 overflow-x-auto"
          >
            <button
              type="button"
              onClick={() => setSubGrade(null)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200',
                !subGrade
                  ? 'bg-white/[0.12] text-foreground'
                  : 'text-muted-foreground hover:bg-white/[0.06] hover:text-foreground'
              )}
            >
              전체 {activeDept.label}
            </button>
            {activeDept.subGrades.map((sg) => {
              const sgCount = subGradeCountMap[sg] ?? 0
              const isActive = subGrade === sg
              return (
                <button
                  key={sg}
                  type="button"
                  onClick={() => setSubGrade(isActive ? null : sg)}
                  className={cn(
                    'flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200',
                    isActive
                      ? cn('bg-gradient-to-r text-white shadow-md', activeDept.gradient)
                      : 'text-muted-foreground hover:bg-white/[0.06] hover:text-foreground'
                  )}
                >
                  {sg}
                  {sgCount > 0 && (
                    <span className={cn(
                      'rounded-full px-1.5 text-[0.5625rem]',
                      isActive ? 'bg-white/20' : 'bg-white/[0.06]'
                    )}>
                      {sgCount}
                    </span>
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
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
