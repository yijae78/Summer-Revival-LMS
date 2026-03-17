import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface StatCardProps {
  value: string | number
  label: string
  icon: LucideIcon
  delta?: string
  description?: string
  color?: 'indigo' | 'emerald' | 'fuchsia' | 'amber' | 'primary' | 'secondary' | 'accent' | 'success' | 'rose' | 'cyan'
  className?: string
}

const colorMap = {
  indigo: {
    gradient: 'from-indigo-500/15 to-indigo-600/5',
    border: 'border-indigo-500/15',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    watermark: 'text-indigo-500/[0.03]',
    glow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]',
  },
  emerald: {
    gradient: 'from-emerald-500/15 to-emerald-600/5',
    border: 'border-emerald-500/15',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    watermark: 'text-emerald-500/[0.03]',
    glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
  },
  fuchsia: {
    gradient: 'from-fuchsia-500/15 to-fuchsia-600/5',
    border: 'border-fuchsia-500/15',
    iconBg: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600',
    watermark: 'text-fuchsia-500/[0.03]',
    glow: 'hover:shadow-[0_0_30px_rgba(232,121,249,0.15)]',
  },
  amber: {
    gradient: 'from-amber-500/15 to-amber-600/5',
    border: 'border-amber-500/15',
    iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
    watermark: 'text-amber-500/[0.03]',
    glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]',
  },
  rose: {
    gradient: 'from-rose-500/15 to-rose-600/5',
    border: 'border-rose-500/15',
    iconBg: 'bg-gradient-to-br from-rose-500 to-rose-600',
    watermark: 'text-rose-500/[0.03]',
    glow: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]',
  },
  cyan: {
    gradient: 'from-cyan-500/15 to-cyan-600/5',
    border: 'border-cyan-500/15',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    watermark: 'text-cyan-500/[0.03]',
    glow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]',
  },
  primary: {
    gradient: 'from-indigo-500/15 to-indigo-600/5',
    border: 'border-indigo-500/15',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    watermark: 'text-indigo-500/[0.03]',
    glow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]',
  },
  secondary: {
    gradient: 'from-fuchsia-500/15 to-fuchsia-600/5',
    border: 'border-fuchsia-500/15',
    iconBg: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600',
    watermark: 'text-fuchsia-500/[0.03]',
    glow: 'hover:shadow-[0_0_30px_rgba(232,121,249,0.15)]',
  },
  accent: {
    gradient: 'from-purple-500/15 to-purple-600/5',
    border: 'border-purple-500/15',
    iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
    watermark: 'text-purple-500/[0.03]',
    glow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]',
  },
  success: {
    gradient: 'from-emerald-500/15 to-emerald-600/5',
    border: 'border-emerald-500/15',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    watermark: 'text-emerald-500/[0.03]',
    glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
  },
}

export function StatCard({
  value,
  label,
  icon: Icon,
  delta,
  description,
  color = 'indigo',
  className,
}: StatCardProps) {
  const isPositive = delta?.startsWith('+')
  const isNegative = delta?.startsWith('-')
  const colors = colorMap[color]

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-gradient-to-br backdrop-blur-xl transition-all duration-300',
        'p-3 lg:rounded-2xl lg:p-5',
        colors.gradient,
        colors.border,
        colors.glow,
        className
      )}
    >
      {/* Background watermark */}
      <div className="pointer-events-none absolute -bottom-3 -right-3 lg:-bottom-4 lg:-right-4">
        <Icon className={cn('h-16 w-16 lg:h-28 lg:w-28', colors.watermark)} />
      </div>

      <div className="relative z-10">
        {/* Mobile: horizontal row / Desktop: stacked */}
        <div className="flex items-center gap-3 lg:block">
          <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-md lg:h-12 lg:w-12 lg:rounded-2xl lg:shadow-lg', colors.iconBg)}>
            <Icon className="h-3.5 w-3.5 text-white lg:h-5 lg:w-5" />
          </div>

          <div className="flex-1 lg:mt-3">
            <div className="flex items-baseline gap-2">
              <p className="font-mono text-xl font-bold tracking-tight text-white lg:text-3xl">{value}</p>
              {delta && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[0.5625rem] font-semibold lg:text-xs',
                    isPositive && 'bg-emerald-500/15 text-emerald-400',
                    isNegative && 'bg-red-500/15 text-red-400',
                    !isPositive && !isNegative && 'bg-white/[0.04] text-slate-400'
                  )}
                >
                  {delta}
                </span>
              )}
            </div>
            <p className="text-[0.6875rem] text-slate-400 lg:mt-0.5 lg:text-sm">{label}</p>
          </div>
        </div>

        {description && <p className="mt-1.5 text-[0.625rem] text-slate-500 lg:mt-2 lg:text-xs">{description}</p>}
      </div>
    </div>
  )
}
