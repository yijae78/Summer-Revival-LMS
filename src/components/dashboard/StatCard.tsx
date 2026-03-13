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
    glow: 'shadow-[0_0_20px_rgba(56,189,248,0.08)]',
  },
  secondary: {
    bg: 'bg-[#22d3ee]/12',
    icon: 'text-[#22d3ee]',
    glow: 'shadow-[0_0_20px_rgba(34,211,238,0.08)]',
  },
  accent: {
    bg: 'bg-[#a78bfa]/12',
    icon: 'text-[#a78bfa]',
    glow: 'shadow-[0_0_20px_rgba(167,139,250,0.08)]',
  },
  success: {
    bg: 'bg-[#34d399]/12',
    icon: 'text-[#34d399]',
    glow: 'shadow-[0_0_20px_rgba(52,211,153,0.08)]',
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
        'group relative overflow-hidden rounded-2xl border border-[#1e2235] bg-[#151823] p-5 transition-all duration-200',
        'hover:border-[#2a3048] hover:shadow-lg hover:-translate-y-0.5',
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
                !isPositive && !isNegative && 'bg-[#1c2030] text-[#8892a8]'
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
