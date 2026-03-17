'use client'

import { useState, useMemo } from 'react'

import { Trophy, Users, User, Table2, LayoutGrid } from 'lucide-react'
import { motion } from 'framer-motion'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { DepartmentFilter } from '@/components/shared/DepartmentFilter'
import { LeaderboardTable } from '@/components/dashboard/LeaderboardTable'

import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { usePointsRanking } from '@/hooks/usePoints'
import { useDepartmentFilterStore } from '@/stores/departmentFilterStore'
import { getDepartmentTheme } from '@/constants/departments'
import { cn } from '@/lib/utils'

import type { RankEntry } from '@/hooks/usePoints'

type LeaderboardViewMode = 'table' | 'card'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

// ============================================
// View Mode Toggle
// ============================================

function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: LeaderboardViewMode
  onChange: (m: LeaderboardViewMode) => void
}) {
  const options: { value: LeaderboardViewMode; icon: typeof Table2; label: string }[] = [
    { value: 'table', icon: Table2, label: '테이블' },
    { value: 'card', icon: LayoutGrid, label: '카드' },
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
              isActive
                ? 'bg-white/[0.1] text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
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
// Podium Card View (new)
// ============================================

interface LeaderboardEntry {
  rank: number
  name: string
  points: number
  color?: string | null
}

function getMedalConfig(rank: number) {
  switch (rank) {
    case 1:
      return {
        gradient: 'from-amber-500/25 to-yellow-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-300',
        badge: 'bg-gradient-to-br from-amber-500 to-yellow-600',
        glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
      }
    case 2:
      return {
        gradient: 'from-slate-400/20 to-slate-500/5',
        border: 'border-slate-400/25',
        text: 'text-slate-300',
        badge: 'bg-gradient-to-br from-slate-400 to-slate-500',
        glow: 'shadow-[0_0_25px_rgba(148,163,184,0.15)]',
      }
    case 3:
      return {
        gradient: 'from-orange-600/20 to-orange-700/5',
        border: 'border-orange-500/25',
        text: 'text-orange-400',
        badge: 'bg-gradient-to-br from-orange-500 to-orange-700',
        glow: 'shadow-[0_0_20px_rgba(234,88,12,0.15)]',
      }
    default:
      return null
  }
}

function PodiumCardView({
  entries,
  type,
}: {
  entries: LeaderboardEntry[]
  type: 'group' | 'individual'
}) {
  const topThree = entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <motion.div
      className="space-y-3"
      variants={stagger}
      initial="hidden"
      animate="show"
      key="card-view"
    >
      {/* Top 3 podium cards */}
      {topThree.map((entry) => {
        const medal = getMedalConfig(entry.rank)
        return (
          <motion.div
            key={`${entry.rank}-${entry.name}`}
            variants={fadeUp}
            className={cn(
              'rounded-2xl border px-5 py-6 backdrop-blur-xl transition-all duration-300',
              medal ? cn('bg-gradient-to-br', medal.gradient, medal.border, medal.glow) : ''
            )}
          >
            <div className="flex items-center gap-4">
              {/* Rank badge */}
              <div
                className={cn(
                  'flex size-12 shrink-0 items-center justify-center rounded-full shadow-lg',
                  medal?.badge
                )}
              >
                <Trophy className="size-6 text-white" />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {type === 'group' && entry.color && (
                    <div
                      className="size-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor: entry.color,
                        boxShadow: `0 0 8px ${entry.color}60`,
                      }}
                      aria-hidden="true"
                    />
                  )}
                  <h3 className="truncate text-lg font-bold text-foreground">
                    {entry.name}
                  </h3>
                </div>
                <p className={cn('mt-0.5 text-sm font-semibold', medal?.text)}>
                  {entry.rank === 1 ? '1st' : entry.rank === 2 ? '2nd' : '3rd'}
                </p>
              </div>

              {/* Points */}
              <span className={cn('shrink-0 text-xl font-extrabold tabular-nums', medal?.text)}>
                {entry.points.toLocaleString()}점
              </span>
            </div>
          </motion.div>
        )
      })}

      {/* Remaining entries */}
      {rest.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {rest.map((entry) => (
            <motion.div
              key={`${entry.rank}-${entry.name}`}
              variants={fadeUp}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-white/[0.04]">
                <span className="text-sm font-bold tabular-nums text-muted-foreground">
                  {entry.rank}
                </span>
              </div>

              {type === 'group' && entry.color && (
                <div
                  className="size-3 shrink-0 rounded-full"
                  style={{
                    backgroundColor: entry.color,
                    boxShadow: `0 0 8px ${entry.color}60`,
                  }}
                  aria-hidden="true"
                />
              )}

              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground/80">
                {entry.name}
              </span>

              <span className="shrink-0 text-sm font-bold tabular-nums text-muted-foreground">
                {entry.points.toLocaleString()}점
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ============================================
// Skeletons & helpers
// ============================================

function LeaderboardSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonBox key={i} className="h-16 rounded-2xl" />
      ))}
    </div>
  )
}

function toLeaderboardEntries(
  data: RankEntry[] | undefined,
  type: 'group' | 'individual'
) {
  if (!data) return []

  return data.map((entry, index) => ({
    rank: index + 1,
    name: entry.name,
    points: entry.totalPoints,
    color: type === 'group' && 'color' in entry ? entry.color : undefined,
  }))
}

// ============================================
// Main Page
// ============================================

export default function LeaderboardPage() {
  const { eventId } = useCurrentEvent()
  const department = useDepartmentFilterStore((s) => s.department)
  const deptTheme = getDepartmentTheme(department)
  const [viewMode, setViewMode] = useState<LeaderboardViewMode>('table')
  const { data: groupRanking, isLoading: groupLoading } = usePointsRanking(
    eventId ?? null,
    'group',
    department
  )
  const { data: individualRanking, isLoading: individualLoading } = usePointsRanking(
    eventId ?? null,
    'individual',
    department
  )

  const groupEntries = useMemo(
    () => toLeaderboardEntries(groupRanking, 'group'),
    [groupRanking]
  )

  const individualEntries = useMemo(
    () => toLeaderboardEntries(individualRanking, 'individual'),
    [individualRanking]
  )

  return (
    <motion.div
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <PageHeader
        title="리더보드"
        description="조별/개인 순위를 확인해요"
        backHref="/dashboard"
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 overflow-hidden">
          <DepartmentFilter />
        </div>
        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {/* Tabs */}
      <motion.div variants={fadeUp}>
      <Tabs defaultValue="group" className="space-y-4">
        <style>{`
          .leaderboard-tabs [data-state=active] {
            background: linear-gradient(to right, rgba(${deptTheme.primary},0.15), rgba(${deptTheme.secondary},0.15)) !important;
            color: rgb(${deptTheme.primary}) !important;
          }
        `}</style>
        <TabsList
          className="leaderboard-tabs w-full rounded-full border p-1 backdrop-blur-xl transition-all duration-500"
          style={{
            borderColor: `rgba(${deptTheme.primary},0.15)`,
            background: `linear-gradient(to right, rgba(${deptTheme.primary},0.1), rgba(${deptTheme.secondary},0.05))`,
          }}
        >
          <TabsTrigger
            value="group"
            className="flex-1 gap-1.5 rounded-full transition-all duration-500"
          >
            <Users className="size-4" />
            조별 순위
          </TabsTrigger>
          <TabsTrigger
            value="individual"
            className="flex-1 gap-1.5 rounded-full transition-all duration-500"
          >
            <User className="size-4" />
            개인 순위
          </TabsTrigger>
        </TabsList>

        <TabsContent value="group">
          <LoadingSkeleton isLoading={groupLoading} skeleton={<LeaderboardSkeleton />}>
            {groupEntries.length > 0 ? (
              viewMode === 'table' ? (
                <LeaderboardTable entries={groupEntries} type="group" />
              ) : (
                <PodiumCardView entries={groupEntries} type="group" />
              )
            ) : (
              <EmptyState
                icon={Trophy}
                title="아직 조별 순위가 없어요"
                description="조를 만들고 활동에 참여하면 순위가 나타나요"
              />
            )}
          </LoadingSkeleton>
        </TabsContent>

        <TabsContent value="individual">
          <LoadingSkeleton
            isLoading={individualLoading}
            skeleton={<LeaderboardSkeleton />}
          >
            {individualEntries.length > 0 ? (
              viewMode === 'table' ? (
                <LeaderboardTable entries={individualEntries} type="individual" />
              ) : (
                <PodiumCardView entries={individualEntries} type="individual" />
              )
            ) : (
              <EmptyState
                icon={Trophy}
                title="아직 개인 순위가 없어요"
                description="활동에 참여하면 순위가 나타나요"
              />
            )}
          </LoadingSkeleton>
        </TabsContent>
      </Tabs>
      </motion.div>
    </motion.div>
  )
}
