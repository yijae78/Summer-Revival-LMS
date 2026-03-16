'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { Users, Search, DollarSign, ChevronRight } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'

import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useParticipants } from '@/hooks/useParticipants'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils/format-date'

import type { Participant } from '@/types'

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
    <Card
      className="cursor-pointer gap-0 py-0 transition-colors hover:bg-accent/50 active:scale-[0.99]"
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
      <CardContent className="flex items-center gap-4 px-4 py-4 md:px-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="text-base font-semibold">
            {participant.name.charAt(0)}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[0.9375rem] font-medium text-foreground">
              {participant.name}
            </p>
            {gradeLabel && (
              <span className="shrink-0 text-xs text-muted-foreground">
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
      </CardContent>
    </Card>
  )
}

function ParticipantSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border bg-card p-4 md:p-6">
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

export default function ParticipantsPage() {
  const router = useRouter()
  const { eventId } = useCurrentEvent()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: participants, isLoading } = useParticipants(eventId ?? null)

  const filteredParticipants = useMemo(() => {
    if (!participants) return []
    if (!searchQuery.trim()) return participants

    const query = searchQuery.trim().toLowerCase()
    return participants.filter((p) =>
      p.name.toLowerCase().includes(query)
    )
  }, [participants, searchQuery])

  const paidCount = useMemo(
    () => participants?.filter((p) => p.fee_paid).length ?? 0,
    [participants]
  )

  const handleNavigateToDetail = useCallback(
    (id: string) => {
      router.push(`/participants/${id}`)
    },
    [router]
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">참가자 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {participants
              ? `총 ${participants.length}명 (납부 ${paidCount}명)`
              : '참가자 목록을 불러오고 있어요'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="이름으로 검색해 주세요"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 pl-10"
        />
      </div>

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
          <div className="space-y-3">
            {filteredParticipants.map((participant) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                onClick={() => handleNavigateToDetail(participant.id)}
              />
            ))}
          </div>
        )}
      </LoadingSkeleton>
    </div>
  )
}
