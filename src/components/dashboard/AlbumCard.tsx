import { Camera, Image as ImageIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

import type { GalleryAlbum } from '@/types'

interface AlbumCardProps {
  album: GalleryAlbum & { photoCount: number }
  onClick: () => void
  className?: string
}

const ALBUM_COLORS = [
  { gradient: 'from-cyan-500/15 to-cyan-600/5', border: 'border-cyan-500/15', iconBg: 'bg-gradient-to-br from-cyan-500 to-cyan-600', glow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]' },
  { gradient: 'from-indigo-500/15 to-indigo-600/5', border: 'border-indigo-500/15', iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600', glow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]' },
  { gradient: 'from-fuchsia-500/15 to-fuchsia-600/5', border: 'border-fuchsia-500/15', iconBg: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600', glow: 'hover:shadow-[0_0_30px_rgba(232,121,249,0.15)]' },
  { gradient: 'from-rose-500/15 to-rose-600/5', border: 'border-rose-500/15', iconBg: 'bg-gradient-to-br from-rose-500 to-rose-600', glow: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]' },
  { gradient: 'from-emerald-500/15 to-emerald-600/5', border: 'border-emerald-500/15', iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600', glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]' },
  { gradient: 'from-amber-500/15 to-amber-600/5', border: 'border-amber-500/15', iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600', glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]' },
]

function getColorByIndex(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0
  }
  return ALBUM_COLORS[Math.abs(hash) % ALBUM_COLORS.length]
}

export function AlbumCard({ album, onClick, className }: AlbumCardProps) {
  const colors = getColorByIndex(album.id)

  return (
    <div
      className={cn(
        'group relative min-h-[160px] cursor-pointer overflow-hidden rounded-2xl border bg-gradient-to-br backdrop-blur-xl',
        'transition-all duration-300 hover:scale-[1.02]',
        colors.gradient,
        colors.border,
        colors.glow,
        'active:scale-[0.98]',
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
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl shadow-lg', colors.iconBg)}>
            <ImageIcon className="h-5 w-5 text-white" />
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
    </div>
  )
}
