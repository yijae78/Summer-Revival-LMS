import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface DashboardCardProps {
  title: string
  icon?: LucideIcon
  children: React.ReactNode
  color?: 'indigo' | 'purple' | 'fuchsia' | 'emerald' | 'amber' | 'rose' | 'cyan'
  className?: string
}

const colorMap = {
  indigo: {
    gradient: 'from-indigo-500/15 to-indigo-600/5',
    border: 'border-indigo-500/15',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    glow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]',
  },
  purple: {
    gradient: 'from-purple-500/15 to-purple-600/5',
    border: 'border-purple-500/15',
    iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
    glow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]',
  },
  fuchsia: {
    gradient: 'from-fuchsia-500/15 to-fuchsia-600/5',
    border: 'border-fuchsia-500/15',
    iconBg: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600',
    glow: 'hover:shadow-[0_0_30px_rgba(232,121,249,0.15)]',
  },
  emerald: {
    gradient: 'from-emerald-500/15 to-emerald-600/5',
    border: 'border-emerald-500/15',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
  },
  amber: {
    gradient: 'from-amber-500/15 to-amber-600/5',
    border: 'border-amber-500/15',
    iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
    glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]',
  },
  rose: {
    gradient: 'from-rose-500/15 to-rose-600/5',
    border: 'border-rose-500/15',
    iconBg: 'bg-gradient-to-br from-rose-500 to-rose-600',
    glow: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]',
  },
  cyan: {
    gradient: 'from-cyan-500/15 to-cyan-600/5',
    border: 'border-cyan-500/15',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    glow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]',
  },
}

export function DashboardCard({
  title,
  icon: Icon,
  children,
  color = 'indigo',
  className,
}: DashboardCardProps) {
  const colors = colorMap[color]

  return (
    <div
      className={cn(
        '@container rounded-2xl border bg-gradient-to-br backdrop-blur-xl transition-all duration-300',
        'hover:scale-[1.02] hover:-translate-y-0.5',
        colors.gradient,
        colors.border,
        colors.glow,
        className
      )}
    >
      <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
        <h3 className="text-sm font-medium text-slate-400">
          {title}
        </h3>
        {Icon && (
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', colors.iconBg)}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
      <div className="p-6 pt-0">{children}</div>
    </div>
  )
}
