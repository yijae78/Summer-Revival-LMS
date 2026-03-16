'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'

import { PhotoViewer } from '@/components/dashboard/PhotoViewer'

import type { GalleryPhoto } from '@/types'

interface PhotoGridProps {
  photos: GalleryPhoto[]
  className?: string
}

export function PhotoGrid({ photos, className }: PhotoGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  function handlePhotoClick(index: number) {
    setSelectedIndex(index)
  }

  function handleClose() {
    setSelectedIndex(null)
  }

  function handlePrev() {
    setSelectedIndex((prev) => {
      if (prev === null || prev === 0) return photos.length - 1
      return prev - 1
    })
  }

  function handleNext() {
    setSelectedIndex((prev) => {
      if (prev === null || prev === photos.length - 1) return 0
      return prev + 1
    })
  }

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-3 gap-1 md:gap-2 lg:grid-cols-4',
          className
        )}
      >
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            className="group relative aspect-square overflow-hidden rounded-lg bg-white/[0.04] transition-all hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
            onClick={() => handlePhotoClick(index)}
            aria-label={photo.caption ?? '사진 보기'}
          >
            <img
              src={photo.thumbnail_url ?? photo.file_url}
              alt={photo.caption ?? ''}
              loading="lazy"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            {photo.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-2 pt-6 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-xs text-white">{photo.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <PhotoViewer
          photo={photos[selectedIndex]}
          onClose={handleClose}
          onPrev={photos.length > 1 ? handlePrev : undefined}
          onNext={photos.length > 1 ? handleNext : undefined}
          currentIndex={selectedIndex}
          totalCount={photos.length}
        />
      )}
    </>
  )
}
