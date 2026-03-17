'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Camera, ImagePlus } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { PhotoGrid } from '@/components/dashboard/PhotoGrid'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'

import { usePhotos } from '@/hooks/useGallery'
import { useUser } from '@/hooks/useUser'
import { useAppModeStore } from '@/stores/appModeStore'
import { addPhoto } from '@/actions/gallery'
import { insert } from '@/lib/local-db'
import { queryKeys } from '@/lib/query-keys'

import type { GalleryPhoto } from '@/types'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

interface AlbumDetailPageProps {
  params: Promise<{ albumId: string }>
}

function PhotoSkeletons() {
  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2 lg:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <SkeletonBox key={i} className="aspect-square rounded-xl" />
      ))}
    </div>
  )
}

function AddPhotoDialog({
  open,
  onOpenChange,
  albumId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  albumId: string
}) {
  const mode = useAppModeStore((s) => s.mode)
  const queryClient = useQueryClient()
  const [caption, setCaption] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fileUrl.trim()) {
      toast.error('사진 URL을 입력해 주세요')
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'local' || mode === 'demo') {
        insert<GalleryPhoto>('gallery_photos', {
          id: crypto.randomUUID(),
          album_id: albumId,
          file_url: fileUrl.trim(),
          thumbnail_url: null,
          caption: caption.trim() || null,
          uploaded_by: null,
          created_at: new Date().toISOString(),
        })
        toast.success('사진이 추가되었어요')
      } else {
        const result = await addPhoto({
          albumId,
          fileUrl: fileUrl.trim(),
          thumbnailUrl: null,
          caption: caption.trim() || null,
        })
        if (result.error) {
          toast.error(result.error)
          return
        }
        toast.success('사진이 추가되었어요')
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.photos(albumId) })
      setCaption('')
      setFileUrl('')
      onOpenChange(false)
    } catch {
      toast.error('사진 추가에 실패했어요')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>사진 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="photo-url">사진 URL</Label>
            <Input
              id="photo-url"
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://..."
              className="h-12"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="photo-caption">설명 (선택)</Label>
            <Input
              id="photo-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="사진에 대한 설명을 입력하세요"
              className="h-12"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-h-[48px]"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !fileUrl.trim()}
              className="min-h-[48px]"
            >
              {isSubmitting ? '추가 중...' : '추가하기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { albumId } = use(params)
  const router = useRouter()
  const { data: user } = useUser()
  const { data: photos, isLoading } = usePhotos(albumId)
  const [dialogOpen, setDialogOpen] = useState(false)

  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff'
  const hasPhotos = photos && photos.length > 0

  return (
    <motion.div
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <PageHeader
        title="앨범"
        backHref="/gallery"
        backLabel="갤러리로"
        description={hasPhotos ? `${photos.length}장의 사진` : undefined}
        action={
          isAdminOrStaff ? (
            <Button
              size="lg"
              className="h-12 shrink-0 gap-2"
              onClick={() => setDialogOpen(true)}
            >
              <ImagePlus className="h-4 w-4" />
              <span className="hidden sm:inline">사진 추가</span>
              <span className="sm:hidden">추가</span>
            </Button>
          ) : undefined
        }
      />

      {isAdminOrStaff && (
        <AddPhotoDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          albumId={albumId}
        />
      )}

      {/* Content */}
      <motion.div variants={fadeUp}>
      <LoadingSkeleton isLoading={isLoading} skeleton={<PhotoSkeletons />}>
        {hasPhotos ? (
          <PhotoGrid photos={photos} />
        ) : (
          <EmptyState
            icon={Camera}
            title="앨범이 비어있어요"
            description="사진을 추가해서 추억을 채워보세요"
            {...(isAdminOrStaff
              ? {
                  action: {
                    label: '사진 추가하기',
                    onClick: () => setDialogOpen(true),
                  },
                }
              : {})}
          />
        )}
      </LoadingSkeleton>
      </motion.div>
    </motion.div>
  )
}
