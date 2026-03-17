'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { Users, Search, DollarSign, ChevronRight, List, LayoutGrid, Table2, Phone } from 'lucide-react'
import { motion } from 'framer-motion'

import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'

import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useParticipants } from '@/hooks/useParticipants'
import { DEPARTMENTS, matchDepartment as matchDept, getDepartmentTheme } from '@/constants/departments'
import { cn } from '@/lib/utils'

import type { Participant } from '@/types'

type ViewMode = 'card' | 'compact' | 'table'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }

const GRADE_LABELS: Record<string, string> = {
  elementary_1: '초1', elementary_2: '초2', elementary_3: '초3',
  elementary_4: '초4', elementary_5: '초5', elementary_6: '초6',
  middle_1: '중1', middle_2: '중2', middle_3: '중3',
  high_1: '고1', high_2: '고2', high_3: '고3',
  college: '대학생', adult: '교사',
}

function getGradeLabel(grade: string | null): string | null {
  if (!grade) return null
  return GRADE_LABELS[grade] ?? grade
}

// ============================================
// Card View (기본 — 상세 카드)
// ============================================

function CardItem({ participant, onClick, deptTheme: theme }: { participant: Participant; onClick: () => void; deptTheme: ReturnType<typeof getDepartmentTheme> }) {
  const gradeLabel = getGradeLabel(participant.grade)

  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'cursor-pointer rounded-2xl border backdrop-blur-xl',
        'transition-all duration-500',
        'hover:scale-[1.01]',
        'active:scale-[0.99]'
      )}
      style={{
        borderColor: `rgba(${theme.primary},0.15)`,
        background: `linear-gradient(135deg, rgba(${theme.primary},0.1), rgba(${theme.secondary},0.05))`,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-all duration-500"
          style={{
            background: `linear-gradient(135deg, rgb(${theme.primary}), rgb(${theme.secondary}))`,
            boxShadow: `0 0 0 2px rgba(${theme.primary},0.2)`,
          }}
        >
          <span className="text-sm font-semibold">{participant.name.charAt(0)}</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{participant.name}</p>
            {gradeLabel && (
              <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[0.625rem] text-muted-foreground">{gradeLabel}</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {participant.fee_paid ? (
              <Badge variant="outline" className="bg-emerald-500/15 text-[0.625rem] text-emerald-400 border-emerald-500/20 px-1.5 py-0">
                납부
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/15 text-[0.625rem] text-amber-400 border-amber-500/20 px-1.5 py-0">
                미납
              </Badge>
            )}
            {participant.gender && (
              <span className="text-[0.625rem] text-muted-foreground/50">{participant.gender === 'male' ? '남' : '여'}</span>
            )}
          </div>
        </div>

        <ChevronRight className="size-4 shrink-0 text-muted-foreground/30" />
      </div>
    </motion.div>
  )
}

// ============================================
// Compact View (요약 — 한 줄)
// ============================================

function CompactItem({ participant, onClick, deptTheme: theme }: { participant: Participant; onClick: () => void; deptTheme: ReturnType<typeof getDepartmentTheme> }) {
  const gradeLabel = getGradeLabel(participant.grade)

  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'group flex cursor-pointer items-center gap-3 rounded-lg border border-white/[0.06] px-3 py-2',
        'transition-all duration-200 hover:bg-white/[0.05]'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
    >
      {/* Avatar initial */}
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold transition-all duration-500"
        style={{
          backgroundColor: `rgba(${theme.primary},0.2)`,
          color: `rgb(${theme.primary})`,
        }}
      >
        {participant.name.charAt(0)}
      </div>

      {/* Name */}
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{participant.name}</p>

      {/* Grade */}
      {gradeLabel && (
        <span className="shrink-0 text-xs text-muted-foreground/60">{gradeLabel}</span>
      )}

      {/* Gender */}
      {participant.gender && (
        <span className="shrink-0 text-xs text-muted-foreground/40">{participant.gender === 'male' ? '남' : '여'}</span>
      )}

      {/* Fee status dot */}
      <div className={cn('h-2 w-2 shrink-0 rounded-full', participant.fee_paid ? 'bg-emerald-400' : 'bg-amber-400')} title={participant.fee_paid ? '납부 완료' : '미납'} />

      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/20 transition-transform group-hover:translate-x-0.5" />
    </motion.div>
  )
}

// ============================================
// Table View (표 형식)
// ============================================

function TableView({ participants, onNavigate, deptTheme: theme }: { participants: Participant[]; onNavigate: (id: string) => void; deptTheme: ReturnType<typeof getDepartmentTheme> }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.03]">
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">이름</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">학년</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground">성별</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground">납부</th>
            <th className="hidden px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground sm:table-cell">연락처</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p, idx) => {
            const gradeLabel = getGradeLabel(p.grade)
            return (
              <tr
                key={p.id}
                className={cn(
                  'cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.04]',
                  idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'
                )}
                onClick={() => onNavigate(p.id)}
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.5rem] font-bold transition-all duration-500"
                      style={{
                        backgroundColor: `rgba(${theme.primary},0.2)`,
                        color: `rgb(${theme.primary})`,
                      }}
                    >
                      {p.name.charAt(0)}
                    </div>
                    <span className="font-medium text-foreground">{p.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">{gradeLabel ?? '-'}</td>
                <td className="px-3 py-2.5 text-center text-muted-foreground">{p.gender === 'male' ? '남' : p.gender === 'female' ? '여' : '-'}</td>
                <td className="px-3 py-2.5 text-center">
                  <span className={cn(
                    'inline-flex rounded-full px-1.5 py-0.5 text-[0.625rem] font-semibold',
                    p.fee_paid ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                  )}>
                    {p.fee_paid ? '완료' : '미납'}
                  </span>
                </td>
                <td className="hidden px-3 py-2.5 text-muted-foreground/60 sm:table-cell">
                  <span className="flex items-center gap-1">
                    <Phone className="size-3" />
                    {p.phone ?? p.parent_phone ?? '-'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ============================================
// View Mode Toggle
// ============================================

function ViewModeToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  const options: { value: ViewMode; icon: typeof List; label: string }[] = [
    { value: 'card', icon: LayoutGrid, label: '카드' },
    { value: 'compact', icon: List, label: '요약' },
    { value: 'table', icon: Table2, label: '표' },
  ]

  return (
    <div className="flex rounded-full border border-white/[0.08] bg-white/[0.03] p-0.5">
      {options.map((opt) => {
        const Icon = opt.icon
        const isActive = mode === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
              isActive ? 'bg-white/[0.1] text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
            aria-pressed={isActive}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ============================================
// Skeleton
// ============================================

function ParticipantSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
          <SkeletonBox className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonBox className="h-4 w-32" />
            <SkeletonBox className="h-3 w-20" />
          </div>
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

// ============================================
// Main Page
// ============================================

export default function ParticipantsPage() {
  const router = useRouter()
  const { eventId } = useCurrentEvent()
  const [searchQuery, setSearchQuery] = useState('')
  const [department, setDepartment] = useState('all')
  const [subGrade, setSubGrade] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('card')

  const { data: participants, isLoading } = useParticipants(eventId ?? null)

  const activeDept = DEPARTMENTS.find((d) => d.key === department)
  const deptTheme = getDepartmentTheme(department)

  const filteredParticipants = useMemo(() => {
    if (!participants) return []
    let filtered = participants
    if (department !== 'all') {
      filtered = filtered.filter((p) => matchDept(p.grade, department))
    }
    if (subGrade) {
      filtered = filtered.filter((p) => matchSubGrade(p.grade, subGrade))
    }
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
    (id: string) => { router.push(`/participants/${id}`) },
    [router]
  )

  return (
    <motion.div
      className="space-y-4"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <PageHeader
        title="참가자"
        description="행사 참가자를 관리해요"
        backHref="/dashboard"
      />

      {/* Search + View toggle */}
      <motion.div variants={fadeUp} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="이름으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-9 rounded-xl border-white/[0.08] bg-white/[0.03] backdrop-blur-sm focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      </motion.div>

      {/* Department filter */}
      <motion.div variants={fadeUp} className="space-y-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {DEPARTMENTS.map((d) => {
            const count = deptCountMap[d.key] ?? 0
            const isActive = department === d.key
            return (
              <motion.button
                key={d.key}
                type="button"
                onClick={() => handleDeptChange(d.key)}
                whileTap={{ scale: 0.94 }}
                className={cn(
                  'relative flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[0.6875rem] font-bold transition-colors duration-200',
                  isActive
                    ? cn('bg-gradient-to-r text-white shadow-md', d.gradient)
                    : 'border border-white/[0.08] bg-white/[0.03] text-muted-foreground',
                )}
              >
                <span className="text-xs">{d.emoji}</span>
                <span>{d.label}</span>
                {count > 0 && (
                  <span className={cn(
                    'flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[0.5rem] font-black',
                    isActive ? 'bg-white/20 text-white' : 'bg-white/[0.08] text-muted-foreground',
                  )}>
                    {count}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Sub-grade tabs */}
        {activeDept && activeDept.subGrades.length > 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex gap-1.5 overflow-x-auto"
          >
            <button
              type="button"
              onClick={() => setSubGrade(null)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200',
                !subGrade ? 'bg-white/[0.12] text-foreground' : 'text-muted-foreground hover:bg-white/[0.06]'
              )}
            >
              전체 {activeDept.label}
            </button>
            {activeDept.subGrades.map((sg) => {
              const sgCount = subGradeCountMap[sg] ?? 0
              const active = subGrade === sg
              return (
                <button
                  key={sg}
                  type="button"
                  onClick={() => setSubGrade(active ? null : sg)}
                  className={cn(
                    'flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200',
                    active ? cn('bg-gradient-to-r text-white shadow-md', activeDept.gradient) : 'text-muted-foreground hover:bg-white/[0.06]'
                  )}
                >
                  {sg}
                  {sgCount > 0 && (
                    <span className={cn('rounded-full px-1.5 text-[0.5625rem]', active ? 'bg-white/20' : 'bg-white/[0.06]')}>
                      {sgCount}
                    </span>
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </motion.div>

      {/* Summary */}
      {participants && participants.length > 0 && (
        <motion.div
          variants={fadeUp}
          className="flex items-center gap-3 rounded-xl border px-4 py-2.5 backdrop-blur-xl transition-all duration-500"
          style={{
            borderColor: `rgba(${deptTheme.primary},0.15)`,
            background: `linear-gradient(135deg, rgba(${deptTheme.primary},0.1), rgba(${deptTheme.secondary},0.05))`,
          }}
        >
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="size-3.5" style={{ color: `rgb(${deptTheme.primary})` }} />
            <span className="font-medium text-foreground">{filteredParticipants.length}명</span>
            {filteredParticipants.length !== participants.length && (
              <span className="text-xs text-muted-foreground/50">/ {participants.length}</span>
            )}
          </div>
          <div className="h-3.5 w-px bg-white/[0.08]" />
          <div className="flex items-center gap-1.5 text-sm">
            <DollarSign className="size-3.5 text-emerald-400" />
            <span className="text-muted-foreground">납부 {paidCount}</span>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <motion.div variants={fadeUp}>
        <LoadingSkeleton isLoading={isLoading} skeleton={<ParticipantSkeleton />}>
          {filteredParticipants.length === 0 ? (
            searchQuery.trim() ? (
              <EmptyState icon={Search} title="검색 결과가 없어요" description={`"${searchQuery}"에 해당하는 참가자를 찾을 수 없어요.`} />
            ) : (
              <EmptyState icon={Users} title="아직 참가자가 없어요" description="초대 코드를 공유해서 참가 신청을 받아 보세요." />
            )
          ) : viewMode === 'table' ? (
            <TableView participants={filteredParticipants} onNavigate={handleNavigateToDetail} deptTheme={deptTheme} />
          ) : (
            <motion.div
              className={cn(viewMode === 'card' ? 'space-y-2' : 'space-y-1')}
              variants={stagger}
              initial="hidden"
              animate="show"
              key={viewMode}
            >
              {filteredParticipants.map((participant) =>
                viewMode === 'card' ? (
                  <CardItem key={participant.id} participant={participant} onClick={() => handleNavigateToDetail(participant.id)} deptTheme={deptTheme} />
                ) : (
                  <CompactItem key={participant.id} participant={participant} onClick={() => handleNavigateToDetail(participant.id)} deptTheme={deptTheme} />
                )
              )}
            </motion.div>
          )}
        </LoadingSkeleton>
      </motion.div>
    </motion.div>
  )
}
