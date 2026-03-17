'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import {
  Camera,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  Image as ImageIcon,
  ChevronRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'

import { useAlbums } from '@/hooks/useGallery'
import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useUser } from '@/hooks/useUser'
import { createAlbum } from '@/actions/gallery'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'

import type { GalleryAlbum } from '@/types'

type ViewMode = 'grid' | 'list' | 'timeline'
type AlbumWithCount = GalleryAlbum & { photoCount: number }

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }

const ALBUM_COLORS = [
  { bg: 'from-cyan-500/15 to-cyan-600/5', border: 'border-cyan-500/15', icon: 'from-cyan-500 to-cyan-600', glow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]', dot: 'bg-cyan-400', rgb: '6,182,212' },
  { bg: 'from-indigo-500/15 to-indigo-600/5', border: 'border-indigo-500/15', icon: 'from-indigo-500 to-indigo-600', glow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]', dot: 'bg-indigo-400', rgb: '99,102,241' },
  { bg: 'from-fuchsia-500/15 to-fuchsia-600/5', border: 'border-fuchsia-500/15', icon: 'from-fuchsia-500 to-fuchsia-600', glow: 'hover:shadow-[0_0_30px_rgba(232,121,249,0.15)]', dot: 'bg-fuchsia-400', rgb: '232,121,249' },
  { bg: 'from-rose-500/15 to-rose-600/5', border: 'border-rose-500/15', icon: 'from-rose-500 to-rose-600', glow: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]', dot: 'bg-rose-400', rgb: '244,63,94' },
  { bg: 'from-emerald-500/15 to-emerald-600/5', border: 'border-emerald-500/15', icon: 'from-emerald-500 to-emerald-600', glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]', dot: 'bg-emerald-400', rgb: '16,185,129' },
  { bg: 'from-amber-500/15 to-amber-600/5', border: 'border-amber-500/15', icon: 'from-amber-500 to-amber-600', glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]', dot: 'bg-amber-400', rgb: '245,158,11' },
]

function getColor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0
  return ALBUM_COLORS[Math.abs(hash) % ALBUM_COLORS.length]
}

// ============================================
// Grid View (카드형)
// ============================================

function GridCard({ album, onClick }: { album: AlbumWithCount; onClick: () => void }) {
  const c = getColor(album.id)
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'group relative min-h-[160px] cursor-pointer overflow-hidden rounded-2xl border bg-gradient-to-br backdrop-blur-xl',
        'transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.98]',
        c.bg, c.border, c.glow
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
    >
      {/* Watermark */}
      <div className="pointer-events-none absolute -bottom-6 -right-6 opacity-[0.03]">
        <Camera className="h-32 w-32" />
      </div>

      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex items-start justify-between">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg', c.icon)}>
            <ImageIcon className="h-5 w-5 text-white" />
          </div>
          {album.day_number !== null && (
            <Badge variant="secondary" className="text-xs">
              Day {album.day_number}
            </Badge>
          )}
        </div>
        <div className="mt-auto pt-4">
          <h3 className="text-base font-semibold text-foreground leading-snug">{album.title}</h3>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Camera className="h-3.5 w-3.5" />
            <span>{album.photoCount}장</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// List View (리스트형)
// ============================================

function ListCard({ album, onClick }: { album: AlbumWithCount; onClick: () => void }) {
  const c = getColor(album.id)
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'group flex cursor-pointer items-center gap-4 rounded-xl border px-4 py-3.5 backdrop-blur-xl',
        'transition-all duration-300 hover:bg-white/[0.06] hover:shadow-lg active:scale-[0.99]',
        c.border, 'bg-white/[0.03]'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
    >
      {/* Icon */}
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg', c.icon)}>
        <ImageIcon className="h-5 w-5 text-white" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.9375rem] font-semibold text-foreground">{album.title}</p>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Camera className="size-3" />
            {album.photoCount}장
          </span>
          {album.day_number !== null && (
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              Day {album.day_number}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
    </motion.div>
  )
}

// ============================================
// Timeline View (일차별 타임라인)
// ============================================

function TimelineView({ albums, onNavigate }: { albums: AlbumWithCount[]; onNavigate: (id: string) => void }) {
  // Group by day
  const dayMap = new Map<number | null, AlbumWithCount[]>()
  for (const a of albums) {
    const day = a.day_number
    if (!dayMap.has(day)) dayMap.set(day, [])
    dayMap.get(day)!.push(a)
  }
  const sortedDays = Array.from(dayMap.keys()).sort((a, b) => (a ?? 999) - (b ?? 999))

  return (
    <div className="space-y-6">
      {sortedDays.map((day) => {
        const items = dayMap.get(day) ?? []
        return (
          <motion.div key={day ?? 'other'} variants={fadeUp}>
            {/* Day header */}
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.05] px-3 text-xs font-semibold text-muted-foreground">
                <Calendar className="size-3" />
                {day !== null ? `${day}일차` : '기타'}
              </div>
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-xs text-muted-foreground/50">{items.reduce((s, a) => s + a.photoCount, 0)}장</span>
            </div>

            {/* Albums for this day */}
            <div className="space-y-0">
              {items.map((album, idx) => {
                const c = getColor(album.id)
                const isLast = idx === items.length - 1

                return (
                  <div key={album.id} className="relative flex gap-3 pl-1">
                    {/* Timeline dot + line */}
                    <div className="flex w-5 shrink-0 flex-col items-center">
                      <div className={cn('mt-3 h-3 w-3 shrink-0 rounded-full ring-2 ring-background', c.dot)} />
                      {!isLast && <div className="w-px flex-1 bg-white/[0.08]" />}
                    </div>

                    {/* Card */}
                    <motion.div
                      variants={fadeUp}
                      className={cn(
                        'mb-3 flex flex-1 cursor-pointer items-center gap-4 rounded-xl border px-4 py-3 backdrop-blur-xl',
                        'transition-all duration-300 hover:bg-white/[0.06] hover:shadow-lg',
                        c.border, 'bg-white/[0.03]'
                      )}
                      onClick={() => onNavigate(album.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(album.id) } }}
                    >
                      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg', c.icon)}>
                        <ImageIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{album.title}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Camera className="size-3" />
                          {album.photoCount}장
                        </p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground/40" />
                    </motion.div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ============================================
// View Mode Toggle
// ============================================

function ViewModeToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  const options: { value: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
    { value: 'grid', icon: LayoutGrid, label: '그리드' },
    { value: 'list', icon: List, label: '리스트' },
    { value: 'timeline', icon: Calendar, label: '타임라인' },
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

function GallerySkeletons() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonBox key={i} className="aspect-square rounded-2xl" />
      ))}
    </div>
  )
}

// ============================================
// Create Album Dialog
// ============================================

function CreateAlbumDialog({
  open,
  onOpenChange,
  eventId,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  onCreated: () => void
}) {
  const [title, setTitle] = useState('')
  const [dayNumber, setDayNumber] = useState<string>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = useCallback(() => {
    setTitle('')
    setDayNumber('all')
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      toast.error('앨범 제목을 입력해 주세요.')
      return
    }

    setIsSubmitting(true)
    const result = await createAlbum({
      eventId,
      title: title.trim(),
      dayNumber: dayNumber === 'all' ? null : Number(dayNumber),
    })
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('앨범이 만들어졌어요.')
    resetForm()
    onOpenChange(false)
    onCreated()
  }, [eventId, title, dayNumber, resetForm, onOpenChange, onCreated])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 앨범 만들기</DialogTitle>
          <DialogDescription>
            사진을 모아둘 앨범을 만들어 주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="album-title">앨범 제목</Label>
            <Input
              id="album-title"
              placeholder="앨범 제목을 입력해 주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="album-day">일차 선택</Label>
            <Select value={dayNumber} onValueChange={setDayNumber}>
              <SelectTrigger id="album-day" className="w-full">
                <SelectValue placeholder="일차를 선택해 주세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="1">1일차</SelectItem>
                <SelectItem value="2">2일차</SelectItem>
                <SelectItem value="3">3일차</SelectItem>
                <SelectItem value="4">4일차</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
            className="min-h-12 w-full sm:w-auto"
          >
            {isSubmitting ? '만드는 중...' : '만들기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Main Page
// ============================================

export default function GalleryPage() {
  const router = useRouter()
  const { eventId } = useCurrentEvent()
  const { data: user } = useUser()
  const { data: albums, isLoading } = useAlbums(eventId ?? null)
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [dialogOpen, setDialogOpen] = useState(false)

  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff'
  const hasAlbums = albums && albums.length > 0

  const handleRefresh = useCallback(() => {
    if (eventId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.albums(eventId) })
    }
  }, [eventId, queryClient])

  function handleNavigate(albumId: string) {
    router.push(`/gallery/${albumId}`)
  }

  return (
    <motion.div
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <PageHeader
        title="사진 갤러리"
        description="소중한 순간들을 확인해요"
        backHref="/dashboard"
        action={
          isAdminOrStaff ? (
            <Button size="lg" className="h-12 gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">앨범 만들기</span>
              <span className="sm:hidden">추가</span>
            </Button>
          ) : undefined
        }
      />

      {/* View toggle */}
      <motion.div variants={fadeUp} className="flex justify-end">
        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      </motion.div>

      {/* Content */}
      <motion.div variants={fadeUp}>
        <LoadingSkeleton isLoading={isLoading} skeleton={<GallerySkeletons />}>
          {hasAlbums ? (
            viewMode === 'timeline' ? (
              <TimelineView albums={albums} onNavigate={handleNavigate} />
            ) : viewMode === 'list' ? (
              <motion.div
                className="space-y-1.5"
                variants={stagger}
                initial="hidden"
                animate="show"
                key="list"
              >
                {albums.map((album) => (
                  <ListCard key={album.id} album={album} onClick={() => handleNavigate(album.id)} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
                variants={stagger}
                initial="hidden"
                animate="show"
                key="grid"
              >
                {albums.map((album) => (
                  <GridCard key={album.id} album={album} onClick={() => handleNavigate(album.id)} />
                ))}
              </motion.div>
            )
          ) : (
            <EmptyState
              icon={Camera}
              title="아직 사진이 없어요"
              description="행사가 시작되면 소중한 순간들이 여기에 모여요"
              {...(isAdminOrStaff
                ? { action: { label: '첫 앨범 만들기', onClick: () => setDialogOpen(true) } }
                : {})}
            />
          )}
        </LoadingSkeleton>
      </motion.div>

      {/* Create Album Dialog */}
      {isAdminOrStaff && eventId && (
        <CreateAlbumDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          eventId={eventId}
          onCreated={handleRefresh}
        />
      )}
    </motion.div>
  )
}
