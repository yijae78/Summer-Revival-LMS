'use client'

import { useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Heart,
  Bus,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'
import { RoleGuard } from '@/components/shared/RoleGuard'

import { useParticipant } from '@/hooks/useParticipants'
import { useUser } from '@/hooks/useUser'
import { updateParticipant } from '@/actions/participants'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'

const GRADE_LABELS: Record<string, string> = {
  elementary_1: '초등 1학년',
  elementary_2: '초등 2학년',
  elementary_3: '초등 3학년',
  elementary_4: '초등 4학년',
  elementary_5: '초등 5학년',
  elementary_6: '초등 6학년',
  middle_1: '중등 1학년',
  middle_2: '중등 2학년',
  middle_3: '중등 3학년',
  high_1: '고등 1학년',
  high_2: '고등 2학년',
  high_3: '고등 3학년',
  college: '대학생',
  adult: '성인',
}

const TRANSPORTATION_LABELS: Record<string, string> = {
  bus: '버스 (단체)',
  car: '자차',
  other: '기타',
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function ConsentBadge({ label, consented }: { label: string; consented: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      {consented ? (
        <Badge
          variant="outline"
          className="bg-emerald-500/15 text-xs text-emerald-400 border-emerald-500/20"
        >
          <ShieldCheck className="mr-0.5 size-3" />
          동의
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="bg-red-500/15 text-xs text-red-400 border-red-500/20"
        >
          미동의
        </Badge>
      )}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonBox className="h-9 w-9 rounded-md" />
        <SkeletonBox className="h-6 w-32" />
      </div>
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <SkeletonBox className="h-5 w-24" />
        <div className="mt-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <SkeletonBox className="h-4 w-20" />
              <SkeletonBox className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <SkeletonBox className="h-5 w-24" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <SkeletonBox className="h-4 w-36" />
              <SkeletonBox className="h-5 w-14" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ParticipantDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: user } = useUser()
  const { data: participant, isLoading } = useParticipant(params.id ?? null)

  const canManage = user?.role === 'admin' || user?.role === 'staff'

  const handleToggleFeePaid = useCallback(async () => {
    if (!participant) return

    const result = await updateParticipant(participant.id, {
      fee_paid: !participant.fee_paid,
    })

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(
      participant.fee_paid ? '미납 상태로 변경했어요.' : '납부 완료로 변경했어요.'
    )
    queryClient.invalidateQueries({ queryKey: queryKeys.participant(participant.id) })
    if (participant.event_id) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.participants(participant.event_id),
      })
    }
  }, [participant, queryClient])

  const healthNote =
    participant?.health_info && typeof participant.health_info === 'object'
      ? (participant.health_info as Record<string, unknown>).note
      : null

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="min-h-10 min-w-10"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">참가자 정보</h1>
      </div>

      <LoadingSkeleton isLoading={isLoading} skeleton={<DetailSkeleton />}>
        {!participant ? (
          <EmptyState
            icon={AlertTriangle}
            title="참가자를 찾을 수 없어요"
            description="잘못된 경로이거나 참가자 정보가 삭제되었을 수 있어요."
            action={{
              label: '목록으로 돌아가기',
              onClick: () => router.push('/participants'),
            }}
          />
        ) : (
          <div className="space-y-4">
            {/* Profile header */}
            <Card className="gap-0 py-0">
              <CardContent className="flex items-center gap-4 px-4 py-5 md:px-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-xl font-bold">
                    {participant.name.charAt(0)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <p className="text-lg font-semibold text-foreground">
                    {participant.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {participant.gender && (
                      <span className="text-sm text-muted-foreground">
                        {participant.gender === 'male' ? '남자' : '여자'}
                      </span>
                    )}
                    {participant.grade && (
                      <span className="text-sm text-muted-foreground">
                        {GRADE_LABELS[participant.grade] ?? participant.grade}
                      </span>
                    )}
                    {participant.fee_paid ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/15 text-xs text-emerald-400 border-emerald-500/20"
                      >
                        납부 완료
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-500/15 text-xs text-amber-400 border-amber-500/20"
                      >
                        미납
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fee toggle (admin/staff only) */}
            {canManage && (
              <RoleGuard allowedRoles={['admin', 'staff']}>
                <Button
                  variant="outline"
                  className={cn(
                    'min-h-12 w-full gap-2',
                    participant.fee_paid
                      ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                      : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                  )}
                  onClick={handleToggleFeePaid}
                >
                  <DollarSign className="size-4" />
                  {participant.fee_paid ? '미납으로 변경' : '납부 완료로 변경'}
                </Button>
              </RoleGuard>
            )}

            {/* Basic Info */}
            <Card className="gap-0 py-0">
              <CardHeader className="px-4 py-4 md:px-6">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="size-4 text-muted-foreground" />
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border px-4 pb-4 pt-0 md:px-6">
                <InfoRow label="이름" value={participant.name} />
                <InfoRow
                  label="생년월일"
                  value={participant.birth_date}
                />
                <InfoRow
                  label="성별"
                  value={
                    participant.gender === 'male'
                      ? '남자'
                      : participant.gender === 'female'
                        ? '여자'
                        : null
                  }
                />
                <InfoRow
                  label="학년"
                  value={
                    participant.grade
                      ? GRADE_LABELS[participant.grade] ?? participant.grade
                      : null
                  }
                />
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="gap-0 py-0">
              <CardHeader className="px-4 py-4 md:px-6">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Phone className="size-4 text-muted-foreground" />
                  연락처
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border px-4 pb-4 pt-0 md:px-6">
                <InfoRow label="본인 연락처" value={participant.phone} />
                <InfoRow label="보호자 연락처" value={participant.parent_phone} />
                <InfoRow label="비상연락처" value={participant.emergency_contact} />
              </CardContent>
            </Card>

            {/* Health & Dietary */}
            {(healthNote || participant.dietary_restrictions) && (
              <Card className="gap-0 py-0">
                <CardHeader className="px-4 py-4 md:px-6">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Heart className="size-4 text-muted-foreground" />
                    건강 및 식이
                  </CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-border px-4 pb-4 pt-0 md:px-6">
                  <InfoRow label="건강 정보" value={healthNote as string | null} />
                  <InfoRow label="식이 제한" value={participant.dietary_restrictions} />
                </CardContent>
              </Card>
            )}

            {/* Transportation */}
            {participant.transportation && (
              <Card className="gap-0 py-0">
                <CardHeader className="px-4 py-4 md:px-6">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bus className="size-4 text-muted-foreground" />
                    교통편
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0 md:px-6">
                  <InfoRow
                    label="교통편"
                    value={
                      TRANSPORTATION_LABELS[participant.transportation] ??
                      participant.transportation
                    }
                  />
                </CardContent>
              </Card>
            )}

            {/* Consent Status */}
            <Card className="gap-0 py-0">
              <CardHeader className="px-4 py-4 md:px-6">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="size-4 text-muted-foreground" />
                  동의 현황
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border px-4 pb-4 pt-0 md:px-6">
                <ConsentBadge
                  label="개인정보 수집 및 이용"
                  consented={participant.consent_personal_info}
                />
                <ConsentBadge
                  label="민감정보 수집 및 이용"
                  consented={participant.consent_sensitive_info}
                />
                <ConsentBadge
                  label="사진/영상 촬영 및 활용"
                  consented={participant.consent_photo_video}
                />
                <ConsentBadge
                  label="개인정보 국외 이전"
                  consented={participant.consent_overseas_transfer}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </LoadingSkeleton>
    </div>
  )
}
