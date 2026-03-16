'use client'

import { useRouter } from 'next/navigation'
import { Camera, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AlbumCard } from '@/components/dashboard/AlbumCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'

import { useAlbums } from '@/hooks/useGallery'
import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useUser } from '@/hooks/useUser'

function GallerySkeletons() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonBox key={i} className="min-h-[160px] rounded-xl" />
      ))}
    </div>
  )
}

export default function GalleryPage() {
  const router = useRouter()
  const { eventId } = useCurrentEvent()
  const { data: user } = useUser()
  const { data: albums, isLoading } = useAlbums(eventId ?? null)

  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff'
  const hasAlbums = albums && albums.length > 0

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground md:text-2xl">
            사진 갤러리
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            행사의 소중한 순간들을 확인해보세요
          </p>
        </div>
        {isAdminOrStaff && (
          <Button
            size="lg"
            className="h-12 gap-2"
            onClick={() => {
              // Placeholder: open create album dialog
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">앨범 만들기</span>
            <span className="sm:hidden">추가</span>
          </Button>
        )}
      </div>

      {/* Content */}
      <LoadingSkeleton isLoading={isLoading} skeleton={<GallerySkeletons />}>
        {hasAlbums ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onClick={() => router.push(`/gallery/${album.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Camera}
            title="아직 사진이 없어요"
            description="행사가 시작되면 소중한 순간들이 여기에 모여요"
            {...(isAdminOrStaff
              ? {
                  action: {
                    label: '첫 앨범 만들기',
                    onClick: () => {
                      // Placeholder: open create album dialog
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
