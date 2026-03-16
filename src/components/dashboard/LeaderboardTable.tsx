'use client'

import { Trophy } from 'lucide-react'

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

function getMedalStyles(rank: number) {
  switch (rank) {
    case 1:
      return {
        gradient: 'from-amber-500/20 to-yellow-500/10',
        border: 'border-amber-500/25',
        text: 'text-amber-300',
        icon: 'text-amber-400',
        iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-600',
        glow: 'shadow-[0_0_25px_rgba(245,158,11,0.15)]',
      }
    case 2:
      return {
        gradient: 'from-slate-400/15 to-slate-500/5',
        border: 'border-slate-400/20',
        text: 'text-slate-300',
        icon: 'text-slate-300',
        iconBg: 'bg-gradient-to-br from-slate-400 to-slate-500',
        glow: 'shadow-[0_0_20px_rgba(148,163,184,0.1)]',
      }
    case 3:
      return {
        gradient: 'from-orange-600/15 to-orange-700/5',
        border: 'border-orange-500/20',
        text: 'text-orange-400',
        icon: 'text-orange-400',
        iconBg: 'bg-gradient-to-br from-orange-500 to-orange-700',
        glow: 'shadow-[0_0_20px_rgba(234,88,12,0.1)]',
      }
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
          'flex size-10 items-center justify-center rounded-full shadow-lg',
          medalStyles.iconBg
        )}
      >
        <Trophy className="size-5 text-white" />
      </div>
    )
  }

  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-white/[0.04]">
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
              'flex items-center gap-3 rounded-xl border px-4 py-3 backdrop-blur-xl transition-all duration-300',
              isTopThree && medalStyles
                ? cn(
                    'bg-gradient-to-br',
                    medalStyles.gradient,
                    medalStyles.border,
                    medalStyles.glow
                  )
                : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
            )}
          >
            <RankBadge rank={entry.rank} />

            {type === 'group' && entry.color && (
              <div
                className="size-3 shrink-0 rounded-full"
                style={{
                  backgroundColor: entry.color,
                  boxShadow: `0 0 8px ${entry.color}60`,
                }}
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
