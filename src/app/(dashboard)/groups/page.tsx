'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

import { Users, Plus, ChevronRight, Star } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'

import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useGroups } from '@/hooks/useGroups'
import { useUser } from '@/hooks/useUser'
import { createGroup } from '@/actions/groups'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const GROUP_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
]

function GroupCard({
  name,
  color,
  memberCount,
  totalPoints,
  onClick,
}: {
  name: string
  color: string | null
  memberCount: number
  totalPoints: number
  onClick: () => void
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'cursor-pointer rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl',
        'transition-all duration-300',
        'hover:border-primary/20 hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(56,189,248,0.1)]',
        'active:scale-[0.98]'
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
      <div className="flex flex-col gap-3 px-5 py-5">
        <div className="flex items-center gap-3">
          <div
            className="size-4 shrink-0 rounded-full"
            style={{
              backgroundColor: color ?? '#6b7280',
              boxShadow: `0 0 8px ${color ?? '#6b7280'}40, 0 0 0 2px ${color ?? '#6b7280'}30`,
            }}
            aria-hidden="true"
          />
          <h3 className="truncate text-base font-semibold text-foreground">{name}</h3>
          <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground/40" />
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            {memberCount}명
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="size-3.5 text-amber-400" />
            {totalPoints}점
          </span>
        </div>
      </div>
      {/* Colored left border accent */}
      <div
        className="h-1 w-full rounded-b-2xl"
        style={{ backgroundColor: `${color ?? '#6b7280'}60` }}
      />
    </motion.div>
  )
}

function GroupsSkeletons() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonBox key={i} className="min-h-[120px] rounded-2xl" />
      ))}
    </div>
  )
}

export default function GroupsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { eventId } = useCurrentEvent()
  const { data: user } = useUser()
  const { data: groups, isLoading } = useGroups(eventId ?? null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [selectedColor, setSelectedColor] = useState(GROUP_COLORS[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isAdmin = user?.role === 'admin' || user?.role === 'staff'
  const hasGroups = groups && groups.length > 0

  const handleCreate = useCallback(async () => {
    if (!eventId || !groupName.trim()) return

    setIsSubmitting(true)
    const result = await createGroup({
      eventId,
      name: groupName.trim(),
      color: selectedColor,
    })

    setIsSubmitting(false)

    if (result.success) {
      setDialogOpen(false)
      setGroupName('')
      setSelectedColor(GROUP_COLORS[0])
      await queryClient.invalidateQueries({ queryKey: queryKeys.groups(eventId) })
    }
  }, [eventId, groupName, selectedColor, queryClient])

  return (
    <motion.div
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <PageHeader
        title="조/반 관리"
        description="조별 활동을 관리해요"
        backHref="/dashboard"
        action={
          isAdmin ? (
            <Button
              size="lg"
              className="h-12 gap-2"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">조 만들기</span>
              <span className="sm:hidden">추가</span>
            </Button>
          ) : undefined
        }
      />

      {/* Group Grid */}
      <motion.div variants={fadeUp}>
      <LoadingSkeleton isLoading={isLoading} skeleton={<GroupsSkeletons />}>
        {hasGroups ? (
          <motion.div
            className="grid grid-cols-2 gap-3 md:grid-cols-3"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                name={group.name}
                color={group.color}
                memberCount={group.member_count}
                totalPoints={group.total_points}
                onClick={() => router.push(`/groups/${group.id}`)}
              />
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={Users}
            title="아직 조가 없어요"
            description="조를 만들어 참가자들을 배정해 보세요"
            {...(isAdmin
              ? {
                  action: {
                    label: '첫 조 만들기',
                    onClick: () => setDialogOpen(true),
                  },
                }
              : {})}
          />
        )}
      </LoadingSkeleton>
      </motion.div>

      {/* Create Group Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 조 만들기</DialogTitle>
            <DialogDescription>조 이름과 대표 색상을 선택해 주세요</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="group-name">조 이름</Label>
              <Input
                id="group-name"
                placeholder="예: 1조, 다윗조, 사자팀"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="h-12"
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label>대표 색상</Label>
              <div className="flex flex-wrap gap-2">
                {GROUP_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      'flex size-10 items-center justify-center rounded-full transition-all',
                      selectedColor === color
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : 'hover:scale-110'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`색상 ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="h-12"
            >
              취소
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!groupName.trim() || isSubmitting}
              className="h-12"
            >
              {isSubmitting ? '생성 중...' : '만들기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
