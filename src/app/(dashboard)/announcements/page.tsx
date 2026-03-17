'use client'

import { useState, useCallback, useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import {
  Megaphone,
  Pin,
  Plus,
  Trash2,
  List,
  LayoutGrid,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { PageHeader } from '@/components/shared/PageHeader'
import { DepartmentFilter } from '@/components/shared/DepartmentFilter'

import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useAnnouncements } from '@/hooks/useAnnouncements'
import { useUser } from '@/hooks/useUser'
import { useDepartmentFilterStore } from '@/stores/departmentFilterStore'
import { createAnnouncement, deleteAnnouncement } from '@/actions/announcements'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'

import type { Announcement, AnnouncementType } from '@/types'

type ViewMode = 'list' | 'compact' | 'timeline'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }

const TYPE_CONFIG: Record<AnnouncementType, { label: string; className: string; dotColor: string }> = {
  general: {
    label: '일반',
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    dotColor: 'bg-blue-400',
  },
  urgent: {
    label: '긴급',
    className: 'bg-red-500/15 text-red-400 border-red-500/20',
    dotColor: 'bg-red-400',
  },
  group: {
    label: '조별',
    className: 'bg-green-500/15 text-green-400 border-green-500/20',
    dotColor: 'bg-green-400',
  },
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  return format(d, 'M월 d일 (EEE) a h:mm', { locale: ko })
}

function formatDateOnly(dateStr: string): string {
  const d = new Date(dateStr)
  return format(d, 'M월 d일 (EEE)', { locale: ko })
}

function formatTimeOnly(dateStr: string): string {
  const d = new Date(dateStr)
  return format(d, 'a h:mm', { locale: ko })
}

// ============================================
// List View (기본 — 카드형, 펼침/접기)
// ============================================

function ListCard({
  announcement,
  canManage,
  onDelete,
}: {
  announcement: Announcement
  canManage: boolean
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const typeConfig = TYPE_CONFIG[announcement.type as AnnouncementType] ?? TYPE_CONFIG.general
  const isPinned = announcement.is_pinned
  const isLong = announcement.content.length > 80

  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'rounded-2xl border backdrop-blur-xl transition-all duration-300',
        isPinned
          ? 'border-amber-500/25 bg-gradient-to-br from-amber-500/15 to-amber-600/5 shadow-[0_0_25px_rgba(245,158,11,0.12)]'
          : 'border-rose-500/15 bg-gradient-to-br from-rose-500/10 to-rose-600/5',
        'hover:scale-[1.01] hover:shadow-2xl'
      )}
    >
      <div className="px-4 py-4 md:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {isPinned && <Pin className="size-3.5 text-amber-400" />}
              <Badge variant="outline" className={cn('text-xs', typeConfig.className)}>
                {typeConfig.label}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
                <Calendar className="size-3" />
                {formatDateOnly(announcement.created_at)}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
                <Clock className="size-3" />
                {formatTimeOnly(announcement.created_at)}
              </span>
            </div>
            <h3 className="text-base font-semibold leading-snug text-foreground">
              {announcement.title}
            </h3>
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
      </div>
      <div className="px-4 pb-4 md:px-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={expanded ? 'full' : 'clamp'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              'whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-muted-foreground',
              !expanded && isLong && 'line-clamp-2'
            )}
          >
            {announcement.content}
          </motion.p>
        </AnimatePresence>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-xs font-medium text-primary/70 hover:text-primary transition-colors"
          >
            {expanded ? (
              <>접기 <ChevronUp className="size-3" /></>
            ) : (
              <>더 보기 <ChevronDown className="size-3" /></>
            )}
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ============================================
// Compact View (썸네일형 — 한 줄 요약)
// ============================================

function CompactCard({
  announcement,
  canManage,
  onDelete,
}: {
  announcement: Announcement
  canManage: boolean
  onDelete: (id: string) => void
}) {
  const typeConfig = TYPE_CONFIG[announcement.type as AnnouncementType] ?? TYPE_CONFIG.general
  const isPinned = announcement.is_pinned

  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'group flex items-center gap-3 rounded-xl border px-4 py-3 backdrop-blur-xl transition-all duration-300',
        isPinned
          ? 'border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-amber-600/5'
          : 'border-white/[0.08] bg-white/[0.04]',
        'hover:bg-white/[0.06] hover:shadow-lg'
      )}
    >
      {/* Type dot */}
      <div className={cn('h-2.5 w-2.5 shrink-0 rounded-full', typeConfig.dotColor)} />

      {/* Pin icon */}
      {isPinned && <Pin className="size-3 shrink-0 text-amber-400" />}

      {/* Title */}
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {announcement.title}
      </p>

      {/* Badge */}
      <Badge variant="outline" className={cn('shrink-0 text-[0.6875rem]', typeConfig.className)}>
        {typeConfig.label}
      </Badge>

      {/* Date/Time */}
      <span className="hidden shrink-0 text-xs text-muted-foreground/50 sm:block">
        {formatDateTime(announcement.created_at)}
      </span>
      <span className="shrink-0 text-xs text-muted-foreground/50 sm:hidden">
        {formatDateOnly(announcement.created_at)}
      </span>

      {/* Delete */}
      {canManage && (
        <Button
          variant="ghost"
          size="icon-xs"
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(announcement.id)}
          aria-label="공지 삭제"
        >
          <Trash2 className="size-3.5" />
        </Button>
      )}
    </motion.div>
  )
}

// ============================================
// Timeline View (타임라인형 — 날짜별 그룹)
// ============================================

function TimelineView({
  announcements,
  canManage,
  onDelete,
}: {
  announcements: Announcement[]
  canManage: boolean
  onDelete: (id: string) => void
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, Announcement[]>()
    for (const a of announcements) {
      const dateKey = formatDateOnly(a.created_at)
      if (!map.has(dateKey)) map.set(dateKey, [])
      map.get(dateKey)!.push(a)
    }
    return map
  }, [announcements])

  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([dateLabel, items]) => (
        <motion.div key={dateLabel} variants={fadeUp}>
          {/* Date header */}
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.05] px-3 text-xs font-semibold text-muted-foreground">
              <Calendar className="size-3" />
              {dateLabel}
            </div>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          {/* Timeline items */}
          <div className="space-y-0">
            {items.map((announcement, idx) => {
              const typeConfig = TYPE_CONFIG[announcement.type as AnnouncementType] ?? TYPE_CONFIG.general
              const isPinned = announcement.is_pinned
              const isLast = idx === items.length - 1

              return (
                <div key={announcement.id} className="relative flex gap-3 pl-1">
                  {/* Timeline dot + line */}
                  <div className="flex w-5 shrink-0 flex-col items-center">
                    <div className={cn(
                      'mt-2 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-background',
                      isPinned ? 'bg-amber-400' : typeConfig.dotColor
                    )} />
                    {!isLast && <div className="w-px flex-1 bg-white/[0.08]" />}
                  </div>

                  {/* Card */}
                  <motion.div
                    variants={fadeUp}
                    className={cn(
                      'mb-3 flex-1 rounded-xl border px-4 py-3 backdrop-blur-xl transition-all duration-300',
                      isPinned
                        ? 'border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-amber-600/5'
                        : 'border-white/[0.08] bg-white/[0.04]',
                      'hover:bg-white/[0.06]'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {isPinned && <Pin className="size-3 text-amber-400" />}
                          <Badge variant="outline" className={cn('text-[0.6875rem]', typeConfig.className)}>
                            {typeConfig.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground/50">
                            {formatTimeOnly(announcement.created_at)}
                          </span>
                        </div>
                        <h4 className="mt-1.5 text-sm font-semibold text-foreground">
                          {announcement.title}
                        </h4>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {announcement.content}
                        </p>
                      </div>
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => onDelete(announcement.id)}
                          aria-label="공지 삭제"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                </div>
              )
            })}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ============================================
// View Mode Toggle
// ============================================

function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: ViewMode
  onChange: (m: ViewMode) => void
}) {
  const options: { value: ViewMode; icon: typeof List; label: string }[] = [
    { value: 'list', icon: List, label: '카드' },
    { value: 'compact', icon: LayoutGrid, label: '요약' },
    { value: 'timeline', icon: Clock, label: '타임라인' },
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
// Skeletons
// ============================================

function AnnouncementSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-4 md:p-6">
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

// ============================================
// Create Dialog
// ============================================

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

// ============================================
// Main Page
// ============================================

export default function AnnouncementsPage() {
  const { eventId } = useCurrentEvent()
  const department = useDepartmentFilterStore((s) => s.department)
  const { data: announcements, isLoading } = useAnnouncements(eventId ?? '', undefined, department)
  const { data: user } = useUser()
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<ViewMode>('list')

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
      <PageHeader
        title="공지사항"
        description="중요한 소식을 확인해요"
        backHref="/dashboard"
        action={
          canManage && eventId ? (
            <CreateAnnouncementDialog
              eventId={eventId}
              onCreated={handleRefresh}
            />
          ) : undefined
        }
      />

      {/* Department filter + View mode toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 overflow-hidden">
          <DepartmentFilter />
        </div>
        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      </div>

      <motion.div variants={fadeUp}>
        <LoadingSkeleton isLoading={isLoading} skeleton={<AnnouncementSkeleton />}>
          {!announcements || announcements.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="아직 공지사항이 없어요"
              description="행사 관련 공지가 등록되면 여기에 표시돼요."
            />
          ) : viewMode === 'timeline' ? (
            <TimelineView
              announcements={announcements}
              canManage={canManage}
              onDelete={handleDelete}
            />
          ) : (
            <motion.div
              className={cn(viewMode === 'list' ? 'space-y-3' : 'space-y-1.5')}
              variants={stagger}
              initial="hidden"
              animate="show"
              key={viewMode}
            >
              {announcements.map((announcement) =>
                viewMode === 'list' ? (
                  <ListCard
                    key={announcement.id}
                    announcement={announcement}
                    canManage={canManage}
                    onDelete={handleDelete}
                  />
                ) : (
                  <CompactCard
                    key={announcement.id}
                    announcement={announcement}
                    canManage={canManage}
                    onDelete={handleDelete}
                  />
                )
              )}
            </motion.div>
          )}
        </LoadingSkeleton>
      </motion.div>
    </motion.div>
  )
}
