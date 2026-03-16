import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface DashboardCardProps {
  title: string
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
}

export function DashboardCard({
  title,
  icon: Icon,
  children,
  className,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        '@container rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(56,189,248,0.1)]',
        className
      )}
    >
      <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          {title}
        </h3>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="p-6 pt-0">{children}</div>
    </div>
  )
}
