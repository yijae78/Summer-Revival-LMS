'use client'

import { Trophy, Medal } from 'lucide-react'

import { cn } from '@/lib/utils'

interface LeaderboardEntry {
  rank: number
  name: string
  points: number
  color?: string | null
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  type: 'group' | 'individual'
}

function getMedalStyles(rank: number): { bg: string; text: string; icon: string } | null {
  switch (rank) {
    case 1:
      return { bg: 'bg-amber-500/15', text: 'text-amber-400', icon: 'text-amber-400' }
    case 2:
      return { bg: 'bg-slate-400/15', text: 'text-slate-300', icon: 'text-slate-300' }
    case 3:
      return { bg: 'bg-orange-600/15', text: 'text-orange-400', icon: 'text-orange-400' }
    default:
      return null
  }
}

function RankBadge({ rank }: { rank: number }) {
  const medalStyles = getMedalStyles(rank)

  if (medalStyles) {
    return (
      <div
        className={cn(
          'flex size-10 items-center justify-center rounded-full',
          medalStyles.bg
        )}
      >
        <Trophy className={cn('size-5', medalStyles.icon)} />
      </div>
    )
  }

  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
      <span className="text-sm font-bold tabular-nums text-muted-foreground">
        {rank}
      </span>
    </div>
  )
}

export function LeaderboardTable({ entries, type }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const medalStyles = getMedalStyles(entry.rank)
        const isTopThree = entry.rank <= 3

        return (
          <div
            key={`${entry.rank}-${entry.name}`}
            className={cn(
              'flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
              isTopThree
                ? 'border-primary/20 bg-card'
                : 'border-border bg-card'
            )}
          >
            <RankBadge rank={entry.rank} />

            {type === 'group' && entry.color && (
              <div
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
                aria-hidden="true"
              />
            )}

            <span
              className={cn(
                'min-w-0 flex-1 truncate text-[0.9375rem] font-medium',
                isTopThree ? 'text-foreground' : 'text-foreground/80'
              )}
            >
              {entry.name}
            </span>

            <span
              className={cn(
                'shrink-0 text-sm font-bold tabular-nums',
                'transition-[color] duration-300',
                medalStyles ? medalStyles.text : 'text-muted-foreground'
              )}
            >
              {entry.points.toLocaleString()}점
            </span>
          </div>
        )
      })}
    </div>
  )
}
