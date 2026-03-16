'use client'

import { useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

import {
  Users,
  Star,
  UserPlus,
  UserMinus,
  Search,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'

import { useGroup, useGroupMembers } from '@/hooks/useGroups'
import { usePointHistory } from '@/hooks/usePoints'
import { useParticipants } from '@/hooks/useParticipants'
import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useUser } from '@/hooks/useUser'
import { addGroupMember, removeGroupMember } from '@/actions/groups'
import { queryKeys } from '@/lib/query-keys'
import { formatRelativeTime } from '@/lib/utils/format-date'
import { cn } from '@/lib/utils'

import type { PointRecord } from '@/types'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const CATEGORY_LABELS: Record<string, string> = {
  attendance: '출석',
  quiz: '퀴즈',
  activity: '활동',
  bonus: '보너스',
}

function PointHistoryItem({ point }: { point: PointRecord }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-foreground">
          {point.description ?? CATEGORY_LABELS[point.category] ?? point.category}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(point.created_at)}
        </span>
      </div>
      <Badge
        variant={point.amount >= 0 ? 'default' : 'destructive'}
        className="shrink-0 tabular-nums"
      >
        {point.amount >= 0 ? '+' : ''}{point.amount}점
      </Badge>
    </div>
  )
}

function MemberListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-4">
          <SkeletonBox className="h-10 w-10 rounded-full" />
          <SkeletonBox className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const groupId = params.id as string

  const { eventId } = useCurrentEvent()
  const { data: user } = useUser()
  const { data: group, isLoading: groupLoading } = useGroup(groupId)
  const { data: members, isLoading: membersLoading } = useGroupMembers(groupId)
  const { data: pointHistory } = usePointHistory(eventId ?? null, groupId)
  const { data: allParticipants } = useParticipants(eventId ?? null)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isAdmin = user?.role === 'admin' || user?.role === 'staff'

  // Participants not yet in this group
  const memberIds = useMemo(
    () => new Set(members?.map((m) => m.participant_id) ?? []),
    [members]
  )

  const availableParticipants = useMemo(() => {
    if (!allParticipants) return []
    const filtered = allParticipants.filter((p) => !memberIds.has(p.id))
    if (!searchQuery.trim()) return filtered
    const query = searchQuery.trim().toLowerCase()
    return filtered.filter((p) => p.name.toLowerCase().includes(query))
  }, [allParticipants, memberIds, searchQuery])

  const handleAddMember = useCallback(
    async (participantId: string) => {
      setIsSubmitting(true)
      const result = await addGroupMember({ groupId, participantId })
      setIsSubmitting(false)

      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.groupMembers(groupId) })
        if (eventId) {
          await queryClient.invalidateQueries({ queryKey: queryKeys.groups(eventId) })
        }
      }
    },
    [groupId, queryClient, eventId]
  )

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      setIsSubmitting(true)
      const result = await removeGroupMember(memberId)
      setIsSubmitting(false)

      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.groupMembers(groupId) })
        if (eventId) {
          await queryClient.invalidateQueries({ queryKey: queryKeys.groups(eventId) })
        }
      }
    },
    [groupId, queryClient, eventId]
  )

  return (
    <motion.div
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <PageHeader
        title={group?.name ?? '조 상세'}
        backHref="/groups"
        backLabel="조 목록으로"
        action={
          isAdmin ? (
            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-1.5"
              onClick={() => {
                setSearchQuery('')
                setAddDialogOpen(true)
              }}
            >
              <UserPlus className="size-4" />
              조원 추가
            </Button>
          ) : undefined
        }
      />

      {/* Group Header Card */}
      <motion.div variants={fadeUp}>
      <LoadingSkeleton
        isLoading={groupLoading}
        skeleton={<SkeletonBox className="h-24 rounded-2xl" />}
      >
        {group && (
          <div
            className="rounded-2xl border backdrop-blur-xl"
            style={{
              borderColor: `${group.color ?? '#6b7280'}25`,
              background: `linear-gradient(to bottom right, ${group.color ?? '#6b7280'}15, ${group.color ?? '#6b7280'}05)`,
            }}
          >
            <div className="flex items-center gap-4 px-5 py-5">
              <div
                className="size-14 shrink-0 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${group.color ?? '#6b7280'}, ${group.color ?? '#6b7280'}90)`,
                  boxShadow: `0 0 20px ${group.color ?? '#6b7280'}40`,
                }}
                aria-hidden="true"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{group.name}</h2>
                <div className="mt-1.5 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    {members?.length ?? 0}명
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="size-3.5 text-amber-400" />
                    <span className="font-semibold text-foreground">{group.total_points}점</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </LoadingSkeleton>
      </motion.div>

      {/* Members Section */}
      <motion.div variants={fadeUp}>
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Users className="size-4 text-indigo-400" />
          조원 목록
        </h2>

        <LoadingSkeleton isLoading={membersLoading} skeleton={<MemberListSkeleton />}>
          {members && members.length > 0 ? (
            <motion.div
              className="space-y-2"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {members.map((member) => (
                <motion.div
                  key={member.id}
                  variants={fadeUp}
                  className={cn(
                    'rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 backdrop-blur-xl',
                    'transition-all duration-300',
                    'hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(99,102,241,0.12)]'
                  )}
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white ring-2 ring-indigo-500/20">
                      <span className="text-sm font-semibold">
                        {member.participant?.name?.charAt(0) ?? '?'}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">
                        {member.participant?.name ?? '알 수 없음'}
                      </span>
                      {member.participant?.grade && (
                        <span className="text-xs text-muted-foreground">
                          {member.participant.grade}
                        </span>
                      )}
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={isSubmitting}
                        aria-label={`${member.participant?.name ?? ''} 제거`}
                      >
                        <UserMinus className="size-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              icon={Users}
              title="아직 조원이 없어요"
              description="참가자를 이 조에 추가해 보세요"
              {...(isAdmin
                ? {
                    action: {
                      label: '조원 추가하기',
                      onClick: () => setAddDialogOpen(true),
                    },
                  }
                : {})}
            />
          )}
        </LoadingSkeleton>
      </section>
      </motion.div>

      {/* Points History Section */}
      <motion.div variants={fadeUp}>
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Star className="size-4 text-amber-400" />
          포인트 내역
        </h2>
        {pointHistory && pointHistory.length > 0 ? (
          <Card className="gap-0 border-white/[0.08] bg-white/[0.04] backdrop-blur-xl py-0">
            <CardContent className="divide-y divide-white/[0.06] px-4">
              {pointHistory.map((point) => (
                <PointHistoryItem key={point.id} point={point} />
              ))}
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={Star}
            title="아직 포인트 내역이 없어요"
            description="활동을 통해 포인트가 쌓여요"
          />
        )}
      </section>
      </motion.div>

      {/* Add Member Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>조원 추가</DialogTitle>
            <DialogDescription>이 조에 추가할 참가자를 선택해 주세요</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="이름으로 검색해 주세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-10"
              />
            </div>

            <div className="max-h-60 space-y-1 overflow-y-auto">
              {availableParticipants.length > 0 ? (
                availableParticipants.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all duration-300 hover:bg-white/[0.06] active:scale-[0.99]"
                    onClick={() => handleAddMember(p.id)}
                    disabled={isSubmitting}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <span className="text-xs font-semibold">{p.name.charAt(0)}</span>
                    </div>
                    <span className="truncate text-sm font-medium text-foreground">
                      {p.name}
                    </span>
                    <UserPlus className="ml-auto size-4 shrink-0 text-muted-foreground" />
                  </button>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {searchQuery.trim()
                    ? '검색 결과가 없어요'
                    : '추가할 수 있는 참가자가 없어요'}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
