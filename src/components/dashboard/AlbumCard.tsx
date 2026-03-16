import { Camera, Image as ImageIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import type { GalleryAlbum } from '@/types'

interface AlbumCardProps {
  album: GalleryAlbum & { photoCount: number }
  onClick: () => void
  className?: string
}

export function AlbumCard({ album, onClick, className }: AlbumCardProps) {
  return (
    <Card
      className={cn(
        'group relative min-h-[160px] cursor-pointer overflow-hidden rounded-xl border-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background transition-all hover:shadow-lg active:scale-[0.98]',
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={`${album.title} 앨범 열기`}
    >
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <ImageIcon className="h-5 w-5 text-primary" />
          </div>
          {album.day_number !== null && (
            <Badge variant="secondary" className="text-xs">
              Day {album.day_number}
            </Badge>
          )}
        </div>

        <div className="mt-auto pt-4">
          <h3 className="text-base font-semibold text-foreground leading-snug">
            {album.title}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Camera className="h-3.5 w-3.5" />
            <span>{album.photoCount}장</span>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-foreground/5 transition-all group-hover:ring-primary/20" />
    </Card>
  )
}
