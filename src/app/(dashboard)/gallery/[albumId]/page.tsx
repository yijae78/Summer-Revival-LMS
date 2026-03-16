'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, ImagePlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PhotoGrid } from '@/components/dashboard/PhotoGrid'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'

import { usePhotos } from '@/hooks/useGallery'
import { useUser } from '@/hooks/useUser'

interface AlbumDetailPageProps {
  params: Promise<{ albumId: string }>
}

function PhotoSkeletons() {
  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2 lg:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <SkeletonBox key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  )
}

export default function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { albumId } = use(params)
  const router = useRouter()
  const { data: user } = useUser()
  const { data: photos, isLoading } = usePhotos(albumId)

  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff'
  const hasPhotos = photos && photos.length > 0

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/gallery')}
          className="h-12 w-12 shrink-0"
          aria-label="갤러리로 돌아가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-foreground md:text-2xl">
            앨범 상세
          </h1>
          {hasPhotos && (
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Camera className="mr-1 h-3 w-3" />
                {photos.length}장
              </Badge>
            </div>
          )}
        </div>
        {isAdminOrStaff && (
          <Button
            size="lg"
            className="h-12 shrink-0 gap-2"
            onClick={() => {
              // Placeholder: open add photo dialog / upload flow
            }}
          >
            <ImagePlus className="h-4 w-4" />
            <span className="hidden sm:inline">사진 추가</span>
            <span className="sm:hidden">추가</span>
          </Button>
        )}
      </div>

      {/* Content */}
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
                    onClick: () => {
                      // Placeholder: open add photo dialog / upload flow
                    },
                  },
                }
              : {})}
          />
        )}
      </LoadingSkeleton>
    </div>
  )
}
