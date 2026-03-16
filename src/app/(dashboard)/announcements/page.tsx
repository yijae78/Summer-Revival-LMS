'use client'

import { useState, useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { Megaphone, Pin, Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'

import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useAnnouncements } from '@/hooks/useAnnouncements'
import { useUser } from '@/hooks/useUser'
import { createAnnouncement, deleteAnnouncement } from '@/actions/announcements'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils/format-date'

import type { Announcement, AnnouncementType } from '@/types'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const TYPE_CONFIG: Record<AnnouncementType, { label: string; className: string }> = {
  general: {
    label: '일반',
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  },
  urgent: {
    label: '긴급',
    className: 'bg-red-500/15 text-red-400 border-red-500/20',
  },
  group: {
    label: '조별',
    className: 'bg-green-500/15 text-green-400 border-green-500/20',
  },
}

function AnnouncementCard({
  announcement,
  canManage,
  onDelete,
}: {
  announcement: Announcement
  canManage: boolean
  onDelete: (id: string) => void
}) {
  const typeConfig = TYPE_CONFIG[announcement.type as AnnouncementType] ?? TYPE_CONFIG.general

  return (
    <Card className="gap-0 border-white/[0.08] bg-white/[0.04] backdrop-blur-xl py-0 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(56,189,248,0.1)]">
      <CardHeader className="gap-3 px-4 py-4 md:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {announcement.is_pinned && (
                <Pin className="size-3.5 text-primary" />
              )}
              <Badge
                variant="outline"
                className={cn('text-xs', typeConfig.className)}
              >
                {typeConfig.label}
              </Badge>
            </div>
            <CardTitle className="text-base leading-snug">
              {announcement.title}
            </CardTitle>
          </div>
          {canManage && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(announcement.id)}
              aria-label="공지 삭제"
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 md:px-6">
        <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-muted-foreground">
          {announcement.content}
        </p>
        <p className="mt-3 text-xs text-muted-foreground/60">
          {formatRelativeTime(announcement.created_at)}
        </p>
      </CardContent>
    </Card>
  )
}

function AnnouncementSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-4 md:p-6">
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-5 w-12" />
            <SkeletonBox className="h-5 w-48" />
          </div>
          <SkeletonBox className="mt-3 h-4 w-full" />
          <SkeletonBox className="mt-2 h-4 w-3/4" />
          <SkeletonBox className="mt-3 h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

function CreateAnnouncementDialog({
  eventId,
  onCreated,
}: {
  eventId: string
  onCreated: () => void
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<AnnouncementType>('general')
  const [isPinned, setIsPinned] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = useCallback(() => {
    setTitle('')
    setContent('')
    setType('general')
    setIsPinned(false)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('제목과 내용을 모두 입력해 주세요.')
      return
    }

    setIsSubmitting(true)
    const result = await createAnnouncement({
      eventId,
      title: title.trim(),
      content: content.trim(),
      type,
      isPinned,
    })
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('공지사항이 등록됐어요.')
    resetForm()
    setOpen(false)
    onCreated()
  }, [eventId, title, content, type, isPinned, resetForm, onCreated])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="min-h-12 gap-2">
          <Plus />
          공지 작성
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 공지사항</DialogTitle>
          <DialogDescription>
            참가자에게 전달할 공지사항을 작성해 주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="announcement-title">제목</Label>
            <Input
              id="announcement-title"
              placeholder="공지사항 제목을 입력해 주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="announcement-content">내용</Label>
            <Textarea
              id="announcement-content"
              placeholder="공지 내용을 입력해 주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="announcement-type">유형</Label>
            <Select value={type} onValueChange={(v) => setType(v as AnnouncementType)}>
              <SelectTrigger id="announcement-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">일반</SelectItem>
                <SelectItem value="urgent">긴급</SelectItem>
                <SelectItem value="group">조별</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="announcement-pinned" className="cursor-pointer">
              상단 고정
            </Label>
            <Switch
              id="announcement-pinned"
              checked={isPinned}
              onCheckedChange={setIsPinned}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="min-h-12 w-full sm:w-auto"
          >
            {isSubmitting ? '등록 중...' : '등록하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AnnouncementsPage() {
  const { eventId } = useCurrentEvent()
  const { data: announcements, isLoading } = useAnnouncements(eventId ?? '')
  const { data: user } = useUser()
  const queryClient = useQueryClient()

  const canManage = user?.role === 'admin' || user?.role === 'staff'

  const handleRefresh = useCallback(() => {
    if (eventId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements(eventId) })
    }
  }, [eventId, queryClient])

  const handleDelete = useCallback(
    async (id: string) => {
      const result = await deleteAnnouncement(id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('공지사항이 삭제됐어요.')
      handleRefresh()
    },
    [handleRefresh]
  )

  return (
    <motion.div
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">공지사항</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            행사 관련 공지사항을 확인해 보세요
          </p>
        </div>
        {canManage && eventId && (
          <CreateAnnouncementDialog
            eventId={eventId}
            onCreated={handleRefresh}
          />
        )}
      </motion.div>

      <motion.div variants={fadeUp}>
        <LoadingSkeleton isLoading={isLoading} skeleton={<AnnouncementSkeleton />}>
          {!announcements || announcements.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="아직 공지사항이 없어요"
              description="행사 관련 공지가 등록되면 여기에 표시돼요."
            />
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  canManage={canManage}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </LoadingSkeleton>
      </motion.div>
    </motion.div>
  )
}
