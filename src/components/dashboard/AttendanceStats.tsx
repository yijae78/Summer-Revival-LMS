import { cn } from '@/lib/utils'

interface AttendanceStatsProps {
  present: number
  late: number
  absent: number
  excused: number
  total: number
  className?: string
}

export function AttendanceStats({
  present,
  late,
  absent,
  excused,
  total,
  className,
}: AttendanceStatsProps) {
  const checked = present + late + absent + excused
  const unchecked = total - checked

  const getPercent = (value: number) => {
    if (total === 0) return 0
    return Math.round((value / total) * 100)
  }

  const segments = [
    { value: present, label: '출석', gradient: 'bg-gradient-to-r from-emerald-500 to-emerald-400', dot: 'bg-emerald-500', textColor: 'text-emerald-400' },
    { value: late, label: '지각', gradient: 'bg-gradient-to-r from-amber-500 to-amber-400', dot: 'bg-amber-500', textColor: 'text-amber-400' },
    { value: absent, label: '결석', gradient: 'bg-gradient-to-r from-red-500 to-red-400', dot: 'bg-red-500', textColor: 'text-red-400' },
    { value: excused, label: '사유', gradient: 'bg-gradient-to-r from-sky-500 to-sky-400', dot: 'bg-sky-500', textColor: 'text-sky-400' },
  ]

  return (
    <div className={cn('space-y-3', className)}>
      {/* Stat bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
        {segments.map((segment) => {
          const percent = getPercent(segment.value)
          if (percent === 0) return null
          return (
            <div
              key={segment.label}
              className={cn('transition-all duration-300', segment.gradient)}
              style={{ width: `${percent}%` }}
              role="meter"
              aria-label={`${segment.label} ${percent}%`}
              aria-valuenow={segment.value}
              aria-valuemin={0}
              aria-valuemax={total}
            />
          )
        })}
        {unchecked > 0 && (
          <div
            className="bg-muted-foreground/20"
            style={{ width: `${getPercent(unchecked)}%` }}
          />
        )}
      </div>

      {/* Labels */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5">
            <div className={cn('size-2.5 rounded-full', segment.dot)} />
            <span className="text-xs text-muted-foreground">
              {segment.label}
            </span>
            <span className={cn('text-xs font-semibold', segment.textColor)}>
              {segment.value}
            </span>
          </div>
        ))}
        {unchecked > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-muted-foreground/20" />
            <span className="text-xs text-muted-foreground">미체크</span>
            <span className="text-xs font-semibold text-muted-foreground">
              {unchecked}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
