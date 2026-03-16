'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, ImagePlus } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PhotoGrid } from '@/components/dashboard/PhotoGrid'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'

import { usePhotos } from '@/hooks/useGallery'
import { useUser } from '@/hooks/useUser'

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

export default function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { albumId } = use(params)
  const router = useRouter()
  const { data: user } = useUser()
  const { data: photos, isLoading } = usePhotos(albumId)

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
              onClick={() => {
                // Placeholder: open add photo dialog / upload flow
              }}
            >
              <ImagePlus className="h-4 w-4" />
              <span className="hidden sm:inline">사진 추가</span>
              <span className="sm:hidden">추가</span>
            </Button>
          ) : undefined
        }
      />

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
                    onClick: () => {
                      // Placeholder: open add photo dialog / upload flow
                    },
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
