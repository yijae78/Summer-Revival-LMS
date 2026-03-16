'use client'

import { useCallback } from 'react'

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
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'

import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useMaterials } from '@/hooks/useMaterials'
import { useUser } from '@/hooks/useUser'
import { deleteMaterial } from '@/actions/materials'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils/format-date'

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
}: {
  material: Material
  canManage: boolean
  onDelete: (id: string) => void
}) {
  const categoryConfig =
    CATEGORY_CONFIG[material.category as MaterialCategory] ?? CATEGORY_CONFIG.other
  const CategoryIcon = categoryConfig.icon
  const FileIcon = getFileIcon(material.file_type)

  return (
    <Card className="gap-0 border-white/[0.08] bg-white/[0.04] backdrop-blur-xl py-0 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(56,189,248,0.1)]">
      <CardContent className="flex items-center gap-4 px-4 py-4 md:px-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
          <FileIcon className="size-5 text-muted-foreground" />
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
      </CardContent>
    </Card>
  )
}

function MaterialSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-4 md:p-6">
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
}: {
  materials: Material[]
  canManage: boolean
  onDelete: (id: string) => void
  category: string
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
    <div className="space-y-3">
      {filtered.map((material) => (
        <MaterialCard
          key={material.id}
          material={material}
          canManage={canManage}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default function MaterialsPage() {
  const { eventId } = useCurrentEvent()
  const { data: materials, isLoading } = useMaterials(eventId ?? '')
  const { data: user } = useUser()
  const queryClient = useQueryClient()

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
      <motion.div variants={fadeUp} className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">자료실</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            행사에 필요한 자료를 확인해 보세요
          </p>
        </div>
        {canManage && (
          <Button className="min-h-12 gap-2" disabled>
            <Upload />
            자료 업로드
          </Button>
        )}
      </motion.div>

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
              <TabsList className="w-full overflow-x-auto md:w-auto">
                {TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="min-h-9">
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
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </LoadingSkeleton>
      </motion.div>
    </motion.div>
  )
}
