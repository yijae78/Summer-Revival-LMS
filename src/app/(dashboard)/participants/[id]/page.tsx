'use client'

import { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { useQueryClient } from '@tanstack/react-query'
import {
  User,
  Phone,
  Heart,
  Bus,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Pencil,
  Trash2,
  QrCode,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { EditParticipantDialog } from '@/components/dashboard/EditParticipantDialog'
import { DeleteParticipantDialog } from '@/components/dashboard/DeleteParticipantDialog'
import { ParticipantQrCode } from '@/components/dashboard/ParticipantQrCode'

import { useParticipant } from '@/hooks/useParticipants'
import { useUser } from '@/hooks/useUser'
import { useAppModeStore } from '@/stores/appModeStore'
import { updateParticipant } from '@/actions/participants'
import { updateLocalParticipant } from '@/lib/local-db/participants'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

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
  adult: '교사',
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

function GlassSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof User
  title: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]"
    >
      <div className="px-4 py-4 md:px-6">
        <h3 className="flex items-center gap-2.5 text-base font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <Icon className="size-4 text-white" />
          </div>
          {title}
        </h3>
      </div>
      <div className="divide-y divide-white/[0.06] px-4 pb-4 pt-0 md:px-6">
        {children}
      </div>
    </motion.div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 md:p-6">
        <div className="flex items-center gap-4">
          <SkeletonBox className="h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <SkeletonBox className="h-5 w-32" />
            <SkeletonBox className="h-4 w-24" />
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 md:p-6">
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
    </div>
  )
}

export default function ParticipantDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const mode = useAppModeStore((s) => s.mode)
  const { data: user } = useUser()
  const { data: participant, isLoading } = useParticipant(params.id ?? null)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const canManage = user?.role === 'admin' || user?.role === 'staff'

  const invalidateParticipant = useCallback(() => {
    if (!participant) return
    queryClient.invalidateQueries({ queryKey: queryKeys.participant(participant.id) })
    if (participant.event_id) {
      queryClient.invalidateQueries({ queryKey: queryKeys.participants(participant.event_id) })
    }
  }, [participant, queryClient])

  const handleToggleFeePaid = useCallback(async () => {
    if (!participant) return

    if (mode === 'local') {
      updateLocalParticipant(participant.id, { fee_paid: !participant.fee_paid })
      toast.success(participant.fee_paid ? '미납 상태로 변경했어요.' : '납부 완료로 변경했어요.')
      invalidateParticipant()
      return
    }

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
    invalidateParticipant()
  }, [participant, mode, invalidateParticipant])

  const healthNote =
    participant?.health_info && typeof participant.health_info === 'object'
      ? (participant.health_info as Record<string, unknown>)?.note
      : null

  return (
    <motion.div
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <PageHeader
        title={participant?.name ?? '참가자 정보'}
        backHref="/participants"
        backLabel="참가자 목록으로"
      />

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
          <>
            {/* Profile header */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/5 backdrop-blur-xl">
              <div className="flex items-center gap-4 px-4 py-5 md:px-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white ring-2 ring-purple-500/20">
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
              </div>
            </motion.div>

            {/* Admin actions (admin/staff only) */}
            {canManage && (
              <motion.div variants={fadeUp} className="space-y-2">
                <RoleGuard allowedRoles={['admin', 'staff']}>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className={cn(
                        'min-h-12 flex-1 gap-2 rounded-xl',
                        participant.fee_paid
                          ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                          : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                      )}
                      onClick={handleToggleFeePaid}
                    >
                      <DollarSign className="size-4" />
                      {participant.fee_paid ? '미납으로 변경' : '납부 완료로 변경'}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="min-h-10 flex-1 gap-2 rounded-xl border-white/[0.08]"
                      onClick={() => setEditOpen(true)}
                    >
                      <Pencil className="size-3.5" />
                      수정
                    </Button>
                    <Button
                      variant="outline"
                      className="min-h-10 gap-2 rounded-xl border-red-500/20 text-red-400 hover:bg-red-500/10"
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash2 className="size-3.5" />
                      삭제
                    </Button>
                  </div>
                </RoleGuard>
              </motion.div>
            )}

            {/* Basic Info */}
            <GlassSection icon={User} title="기본 정보">
              <InfoRow label="이름" value={participant.name} />
              <InfoRow label="생년월일" value={participant.birth_date} />
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
            </GlassSection>

            {/* Contact Info */}
            <GlassSection icon={Phone} title="연락처">
              <InfoRow label="본인 연락처" value={participant.phone} />
              <InfoRow label="보호자 연락처" value={participant.parent_phone} />
              <InfoRow label="비상연락처" value={participant.emergency_contact} />
            </GlassSection>

            {/* Health & Dietary */}
            {(healthNote || participant.dietary_restrictions) && (
              <GlassSection icon={Heart} title="건강 및 식이">
                <InfoRow label="건강 정보" value={healthNote as string | null} />
                <InfoRow label="식이 제한" value={participant.dietary_restrictions} />
              </GlassSection>
            )}

            {/* Transportation */}
            {participant.transportation && (
              <GlassSection icon={Bus} title="교통편">
                <InfoRow
                  label="교통편"
                  value={
                    TRANSPORTATION_LABELS[participant.transportation] ??
                    participant.transportation
                  }
                />
              </GlassSection>
            )}

            {/* Consent Status */}
            <GlassSection icon={ShieldCheck} title="동의 현황">
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
            </GlassSection>

            {/* QR Code (admin/staff only) */}
            {canManage && (
              <GlassSection icon={QrCode} title="QR 코드">
                <div className="flex justify-center py-4">
                  <ParticipantQrCode
                    participantId={participant.id}
                    participantName={participant.name}
                  />
                </div>
              </GlassSection>
            )}

            {/* Edit / Delete Dialogs */}
            {canManage && (
              <>
                <EditParticipantDialog
                  participant={participant}
                  open={editOpen}
                  onOpenChange={setEditOpen}
                  onSuccess={invalidateParticipant}
                />
                <DeleteParticipantDialog
                  participant={participant}
                  open={deleteOpen}
                  onOpenChange={setDeleteOpen}
                  onSuccess={() => router.push('/participants')}
                />
              </>
            )}
          </>
        )}
      </LoadingSkeleton>
    </motion.div>
  )
}
