'use client'

import { useState, useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import {
  FolderOpen,
  Download,
  FileText,
  Music,
  ClipboardList,
  Video,
  File,
  Upload,
  Trash2,
  Plus,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { DepartmentFilter } from '@/components/shared/DepartmentFilter'

import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useMaterials } from '@/hooks/useMaterials'
import { useUser } from '@/hooks/useUser'
import { useDepartmentFilterStore } from '@/stores/departmentFilterStore'
import { getDepartmentTheme } from '@/constants/departments'
import { useAppModeStore } from '@/stores/appModeStore'
import { deleteMaterial } from '@/actions/materials'
import { insert } from '@/lib/local-db'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'

import type { Material, MaterialCategory } from '@/types'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const CATEGORY_CONFIG: Record<
  MaterialCategory,
  { label: string; icon: typeof FileText; className: string }
> = {
  textbook: {
    label: '교재',
    icon: FileText,
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  },
  hymn: {
    label: '찬양',
    icon: Music,
    className: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  },
  worksheet: {
    label: '활동지',
    icon: ClipboardList,
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  },
  video: {
    label: '영상',
    icon: Video,
    className: 'bg-red-500/15 text-red-400 border-red-500/20',
  },
  other: {
    label: '기타',
    icon: File,
    className: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  },
}

const TABS = [
  { value: 'all', label: '전체' },
  { value: 'textbook', label: '교재' },
  { value: 'hymn', label: '찬양' },
  { value: 'worksheet', label: '활동지' },
  { value: 'video', label: '영상' },
  { value: 'other', label: '기타' },
] as const

function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let unitIndex = 0
  let size = bytes
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function getFileIcon(fileType: string | null) {
  if (!fileType) return File
  if (fileType.startsWith('video/')) return Video
  if (fileType.startsWith('audio/')) return Music
  if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) {
    return FileText
  }
  return File
}

function MaterialCard({
  material,
  canManage,
  onDelete,
  deptTheme: theme,
}: {
  material: Material
  canManage: boolean
  onDelete: (id: string) => void
  deptTheme: ReturnType<typeof getDepartmentTheme>
}) {
  const categoryConfig =
    CATEGORY_CONFIG[material.category as MaterialCategory] ?? CATEGORY_CONFIG.other
  const CategoryIcon = categoryConfig.icon
  const FileIcon = getFileIcon(material.file_type)

  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'rounded-2xl border backdrop-blur-xl',
        'transition-all duration-500',
        'hover:scale-[1.01]'
      )}
      style={{
        borderColor: `rgba(${theme.primary},0.15)`,
        background: `linear-gradient(135deg, rgba(${theme.primary},0.1), rgba(${theme.secondary},0.05))`,
      }}
    >
      <div className="flex items-center gap-4 px-4 py-4 md:px-6">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-lg transition-all duration-500"
          style={{
            background: `linear-gradient(135deg, rgb(${theme.primary}), rgb(${theme.secondary}))`,
          }}
        >
          <FileIcon className="size-5 text-white" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p className="truncate text-[0.9375rem] font-medium leading-snug text-foreground">
            {material.title}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn('text-xs', categoryConfig.className)}
            >
              <CategoryIcon className="mr-0.5 size-3" />
              {categoryConfig.label}
            </Badge>
            {material.file_size && (
              <span className="text-xs text-muted-foreground/60">
                {formatFileSize(material.file_size)}
              </span>
            )}
            {material.day_number && (
              <span className="text-xs text-muted-foreground/60">
                {material.day_number}일차
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="min-h-12 min-w-12"
            asChild
          >
            <a
              href={material.file_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${material.title} 다운로드`}
            >
              <Download className="size-4" />
            </a>
          </Button>
          {canManage && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(material.id)}
              aria-label="자료 삭제"
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function MaterialSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-4 md:p-6">
          <SkeletonBox className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <SkeletonBox className="h-4 w-48" />
            <SkeletonBox className="h-3 w-24" />
          </div>
          <SkeletonBox className="h-8 w-8 rounded-md" />
        </div>
      ))}
    </div>
  )
}

function MaterialList({
  materials,
  canManage,
  onDelete,
  category,
  deptTheme: theme,
}: {
  materials: Material[]
  canManage: boolean
  onDelete: (id: string) => void
  category: string
  deptTheme: ReturnType<typeof getDepartmentTheme>
}) {
  const filtered =
    category === 'all'
      ? materials
      : materials.filter((m) => m.category === category)

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="아직 등록된 자료가 없어요"
        description="행사 자료가 등록되면 여기에 표시돼요."
      />
    )
  }

  return (
    <motion.div
      className="space-y-3"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {filtered.map((material) => (
        <MaterialCard
          key={material.id}
          material={material}
          canManage={canManage}
          onDelete={onDelete}
          deptTheme={theme}
        />
      ))}
    </motion.div>
  )
}

function CreateMaterialDialog({
  open,
  onOpenChange,
  eventId,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  eventId: string
  onCreated: () => void
}) {
  const mode = useAppModeStore((s) => s.mode)
  const department = useDepartmentFilterStore((s) => s.department)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<MaterialCategory>('textbook')
  const [fileUrl, setFileUrl] = useState('')
  const [dayNumber, setDayNumber] = useState<string>('none')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = useCallback(() => {
    setTitle('')
    setCategory('textbook')
    setFileUrl('')
    setDayNumber('none')
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      toast.error('자료 제목을 입력해 주세요.')
      return
    }

    setIsSubmitting(true)

    if (mode === 'local' || mode === 'demo') {
      const newMaterial: Material = {
        id: `m-${Date.now()}`,
        event_id: eventId,
        title: title.trim(),
        category,
        file_url: fileUrl.trim() || '#',
        file_type: 'pdf',
        file_size: null,
        day_number: dayNumber === 'none' ? null : Number(dayNumber),
        uploaded_by: 'demo-user',
        department: department !== 'all' ? department : null,
        created_at: new Date().toISOString(),
      }
      insert<Material>('materials', newMaterial)
      toast.success('자료가 등록됐어요.')
      resetForm()
      onOpenChange(false)
      onCreated()
    } else {
      const { createMaterial } = await import('@/actions/materials')
      const result = await createMaterial({
        eventId,
        title: title.trim(),
        category,
        fileUrl: fileUrl.trim() || '#',
        fileType: 'pdf',
        fileSize: null,
        dayNumber: dayNumber === 'none' ? null : Number(dayNumber),
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('자료가 등록됐어요.')
        resetForm()
        onOpenChange(false)
        onCreated()
      }
    }

    setIsSubmitting(false)
  }, [eventId, title, category, fileUrl, dayNumber, department, mode, resetForm, onOpenChange, onCreated])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>자료 등록</DialogTitle>
          <DialogDescription>행사 자료를 등록해 주세요.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="mat-title">자료 제목</Label>
            <Input id="mat-title" placeholder="예: 1일차 큐티 교재" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mat-category">카테고리</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as MaterialCategory)}>
              <SelectTrigger id="mat-category" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="textbook">교재</SelectItem>
                <SelectItem value="hymn">찬양</SelectItem>
                <SelectItem value="worksheet">활동지</SelectItem>
                <SelectItem value="video">영상</SelectItem>
                <SelectItem value="other">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mat-url">파일 URL (선택)</Label>
            <Input id="mat-url" placeholder="https://..." value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mat-day">일차</Label>
            <Select value={dayNumber} onValueChange={setDayNumber}>
              <SelectTrigger id="mat-day" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">전체</SelectItem>
                <SelectItem value="1">1일차</SelectItem>
                <SelectItem value="2">2일차</SelectItem>
                <SelectItem value="3">3일차</SelectItem>
                <SelectItem value="4">4일차</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim()} className="min-h-12 w-full sm:w-auto">
            {isSubmitting ? '등록 중...' : '등록하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function MaterialsPage() {
  const { eventId } = useCurrentEvent()
  const department = useDepartmentFilterStore((s) => s.department)
  const deptTheme = getDepartmentTheme(department)
  const { data: materials, isLoading } = useMaterials(eventId ?? '', undefined, department)
  const { data: user } = useUser()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)

  const canManage = user?.role === 'admin' || user?.role === 'staff'

  const handleRefresh = useCallback(() => {
    if (eventId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials(eventId) })
    }
  }, [eventId, queryClient])

  const handleDelete = useCallback(
    async (id: string) => {
      const result = await deleteMaterial(id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('자료가 삭제됐어요.')
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
        title="자료실"
        description="행사 자료를 다운받아요"
        backHref="/dashboard"
        action={
          canManage ? (
            <Button className="min-h-12 gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              자료 등록
            </Button>
          ) : undefined
        }
      />

      <DepartmentFilter />

      <motion.div variants={fadeUp}>
        <LoadingSkeleton isLoading={isLoading} skeleton={<MaterialSkeleton />}>
          {!materials || materials.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="아직 등록된 자료가 없어요"
              description="행사 자료가 등록되면 여기에 표시돼요."
            />
          ) : (
            <Tabs defaultValue="all">
              <style>{`
                .materials-tabs [data-state=active] {
                  background: linear-gradient(to right, rgba(${deptTheme.primary},0.15), rgba(${deptTheme.secondary},0.15)) !important;
                  color: rgb(${deptTheme.primary}) !important;
                }
              `}</style>
              <TabsList
                className="materials-tabs w-full overflow-x-auto rounded-full border p-1 backdrop-blur-xl transition-all duration-500 md:w-auto"
                style={{
                  borderColor: `rgba(${deptTheme.primary},0.15)`,
                  background: `linear-gradient(to right, rgba(${deptTheme.primary},0.1), rgba(${deptTheme.secondary},0.05))`,
                }}
              >
                {TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="min-h-9 rounded-full transition-all duration-500">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {TABS.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-4">
                  <MaterialList
                    materials={materials}
                    canManage={canManage}
                    onDelete={handleDelete}
                    category={tab.value}
                    deptTheme={deptTheme}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </LoadingSkeleton>
      </motion.div>

      {canManage && eventId && (
        <CreateMaterialDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          eventId={eventId}
          onCreated={handleRefresh}
        />
      )}
    </motion.div>
  )
}
