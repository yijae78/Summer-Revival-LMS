'use client'

import { useMemo } from 'react'

import { Trophy, Users, User } from 'lucide-react'
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

import type { RankEntry } from '@/hooks/usePoints'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

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

export default function LeaderboardPage() {
  const { eventId } = useCurrentEvent()
  const department = useDepartmentFilterStore((s) => s.department)
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

      <DepartmentFilter />

      {/* Tabs */}
      <motion.div variants={fadeUp}>
      <Tabs defaultValue="group" className="space-y-4">
        <TabsList className="w-full rounded-full border border-amber-500/15 bg-gradient-to-r from-amber-500/10 to-orange-500/5 p-1 backdrop-blur-xl">
          <TabsTrigger value="group" className="flex-1 gap-1.5 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/15 data-[state=active]:to-orange-500/15 data-[state=active]:text-amber-300">
            <Users className="size-4" />
            조별 순위
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex-1 gap-1.5 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/15 data-[state=active]:to-orange-500/15 data-[state=active]:text-amber-300">
            <User className="size-4" />
            개인 순위
          </TabsTrigger>
        </TabsList>

        <TabsContent value="group">
          <LoadingSkeleton isLoading={groupLoading} skeleton={<LeaderboardSkeleton />}>
            {groupEntries.length > 0 ? (
              <LeaderboardTable entries={groupEntries} type="group" />
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
              <LeaderboardTable entries={individualEntries} type="individual" />
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
