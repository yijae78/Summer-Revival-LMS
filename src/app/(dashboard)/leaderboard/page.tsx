'use client'

import { useMemo } from 'react'

import { Trophy, Users, User } from 'lucide-react'
import { motion } from 'framer-motion'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'
import { LeaderboardTable } from '@/components/dashboard/LeaderboardTable'

import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { usePointsRanking } from '@/hooks/usePoints'

import type { RankEntry } from '@/hooks/usePoints'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

function LeaderboardSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonBox key={i} className="h-16 rounded-xl" />
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
  const { data: groupRanking, isLoading: groupLoading } = usePointsRanking(
    eventId ?? null,
    'group'
  )
  const { data: individualRanking, isLoading: individualLoading } = usePointsRanking(
    eventId ?? null,
    'individual'
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
      className="space-y-6 p-4 md:p-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-bold text-foreground md:text-2xl">순위표</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          조별, 개인별 포인트 순위를 확인해 보세요
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp}>
      <Tabs defaultValue="group" className="space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="group" className="flex-1 gap-1.5">
            <Users className="size-4" />
            조별 순위
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex-1 gap-1.5">
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
