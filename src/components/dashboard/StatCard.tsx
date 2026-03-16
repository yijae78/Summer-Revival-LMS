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
        'group relative overflow-hidden rounded-2xl border bg-gradient-to-br backdrop-blur-xl p-5 transition-all duration-300',
        'hover:scale-[1.02] hover:-translate-y-0.5',
        colors.gradient,
        colors.border,
        colors.glow,
        className
      )}
    >
      {/* Background watermark icon */}
      <div className="pointer-events-none absolute -bottom-4 -right-4 opacity-100">
        <Icon className={cn('h-28 w-28', colors.watermark)} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg', colors.iconBg)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {delta && (
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                isPositive && 'bg-emerald-500/15 text-emerald-400',
                isNegative && 'bg-red-500/15 text-red-400',
                !isPositive && !isNegative && 'bg-white/[0.04] text-slate-400'
              )}
            >
              {delta}
            </span>
          )}
        </div>

        <p className="mt-4 font-mono text-3xl font-bold tracking-tight text-white">{value}</p>
        <p className="mt-1 text-sm text-slate-400">{label}</p>
        {description && <p className="mt-2 text-xs text-slate-500">{description}</p>}
      </div>
    </div>
  )
}
