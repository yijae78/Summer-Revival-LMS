import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface StatCardProps {
  value: string | number
  label: string
  icon: LucideIcon
  delta?: string
  description?: string
  color?: 'primary' | 'secondary' | 'accent' | 'success'
  className?: string
}

const colorMap = {
  primary: {
    bg: 'bg-[#38bdf8]/12',
    icon: 'text-[#38bdf8]',
    glow: 'hover:shadow-[0_0_20px_rgba(56,189,248,0.1)]',
  },
  secondary: {
    bg: 'bg-[#22d3ee]/12',
    icon: 'text-[#22d3ee]',
    glow: 'hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]',
  },
  accent: {
    bg: 'bg-[#a78bfa]/12',
    icon: 'text-[#a78bfa]',
    glow: 'hover:shadow-[0_0_20px_rgba(167,139,250,0.1)]',
  },
  success: {
    bg: 'bg-[#34d399]/12',
    icon: 'text-[#34d399]',
    glow: 'hover:shadow-[0_0_20px_rgba(52,211,153,0.1)]',
  },
}

export function StatCard({
  value,
  label,
  icon: Icon,
  delta,
  description,
  color = 'primary',
  className,
}: StatCardProps) {
  const isPositive = delta?.startsWith('+')
  const isNegative = delta?.startsWith('-')
  const colors = colorMap[color]

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-5 transition-all duration-300',
        'hover:border-primary/20 hover:bg-white/[0.06] hover:-translate-y-0.5',
        colors.glow,
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#38bdf8]/3 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', colors.bg)}>
            <Icon className={cn('h-5 w-5', colors.icon)} />
          </div>
          {delta && (
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                isPositive && 'bg-[#34d399]/12 text-[#34d399]',
                isNegative && 'bg-[#f87171]/12 text-[#f87171]',
                !isPositive && !isNegative && 'bg-white/[0.04] text-[#8892a8]'
              )}
            >
              {delta}
            </span>
          )}
        </div>

        <p className="mt-4 font-mono text-3xl font-bold tracking-tight text-white">{value}</p>
        <p className="mt-1 text-sm text-[#8892a8]">{label}</p>
        {description && <p className="mt-2 text-xs text-[#5c6478]">{description}</p>}
      </div>
    </div>
  )
}
