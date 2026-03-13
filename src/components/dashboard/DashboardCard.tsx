import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <Card className={cn('@container', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
