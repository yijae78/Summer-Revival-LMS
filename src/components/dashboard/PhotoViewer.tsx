'use client'

import { useCallback, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { useReducedMotion } from '@/hooks/useReducedMotion'

import type { GalleryPhoto } from '@/types'

interface PhotoViewerProps {
  photo: GalleryPhoto
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  currentIndex: number
  totalCount: number
}

export function PhotoViewer({
  photo,
  onClose,
  onPrev,
  onNext,
  currentIndex,
  totalCount,
}: PhotoViewerProps) {
  const reducedMotion = useReducedMotion()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' && onPrev) {
        onPrev()
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext()
      }
    },
    [onClose, onPrev, onNext]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const animationProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        onClick={onClose}
        {...animationProps}
      >
        {/* Close button */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-12 w-12 rounded-full bg-black/40 text-white hover:bg-black/60"
            aria-label="닫기"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Counter */}
        {totalCount > 1 && (
          <div className="absolute top-5 left-1/2 z-10 -translate-x-1/2">
            <span className="rounded-full bg-black/40 px-3 py-1 text-sm text-white/80">
              {currentIndex + 1} / {totalCount}
            </span>
          </div>
        )}

        {/* Previous button */}
        {onPrev && (
          <div className="absolute left-2 top-1/2 z-10 -translate-y-1/2 md:left-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onPrev()
              }}
              className="h-12 w-12 rounded-full bg-black/40 text-white hover:bg-black/60"
              aria-label="이전 사진"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
        )}

        {/* Next button */}
        {onNext && (
          <div className="absolute right-2 top-1/2 z-10 -translate-y-1/2 md:right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onNext()
              }}
              className="h-12 w-12 rounded-full bg-black/40 text-white hover:bg-black/60"
              aria-label="다음 사진"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        )}

        {/* Image */}
        <div
          className="flex max-h-[85vh] max-w-[95vw] flex-col items-center md:max-w-[85vw]"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={photo.file_url}
            alt={photo.caption ?? ''}
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
          />
          {photo.caption && (
            <p className="mt-3 max-w-lg text-center text-sm text-white/80">
              {photo.caption}
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
