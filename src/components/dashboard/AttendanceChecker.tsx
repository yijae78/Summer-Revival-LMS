'use client'

import { Button } from '@/components/ui/button'

import { triggerHaptic } from '@/lib/utils/haptics'
import { cn } from '@/lib/utils'

import type { AttendanceStatus } from '@/types'

interface AttendanceCheckerProps {
  participantId: string
  participantName: string
  currentStatus: AttendanceStatus | null
  scheduleId: string
  onStatusChange: (participantId: string, status: AttendanceStatus) => void
  isUpdating?: boolean
}

const STATUS_OPTIONS: Array<{
  value: AttendanceStatus
  label: string
  activeClassName: string
  inactiveClassName: string
}> = [
  {
    value: 'present',
    label: '출석',
    activeClassName: 'bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500',
    inactiveClassName: 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10',
  },
  {
    value: 'late',
    label: '지각',
    activeClassName: 'bg-amber-500 text-white hover:bg-amber-600 border-amber-500',
    inactiveClassName: 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10',
  },
  {
    value: 'absent',
    label: '결석',
    activeClassName: 'bg-red-500 text-white hover:bg-red-600 border-red-500',
    inactiveClassName: 'border-red-500/30 text-red-500 hover:bg-red-500/10',
  },
  {
    value: 'excused',
    label: '사유',
    activeClassName: 'bg-sky-500 text-white hover:bg-sky-600 border-sky-500',
    inactiveClassName: 'border-sky-500/30 text-sky-500 hover:bg-sky-500/10',
  },
]

export function AttendanceChecker({
  participantId,
  participantName,
  currentStatus,
  onStatusChange,
  isUpdating = false,
}: AttendanceCheckerProps) {
  function handleStatusClick(status: AttendanceStatus) {
    if (status === currentStatus) return
    triggerHaptic('success')
    onStatusChange(participantId, status)
  }

  return (
    <div
      className={cn(
        'flex min-h-14 items-center gap-3 rounded-xl border bg-card px-3 py-2.5 transition-opacity md:px-4',
        isUpdating && 'opacity-70'
      )}
    >
      {/* Participant name */}
      <span className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium text-foreground">
        {participantName}
      </span>

      {/* Status buttons */}
      <div className="flex shrink-0 gap-1.5">
        {STATUS_OPTIONS.map((option) => {
          const isActive = currentStatus === option.value

          return (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={() => handleStatusClick(option.value)}
              className={cn(
                'h-9 min-w-[3rem] px-2 text-xs font-medium transition-all active:scale-95 md:min-w-[3.5rem] md:px-3',
                isActive ? option.activeClassName : option.inactiveClassName
              )}
              aria-pressed={isActive}
              aria-label={`${participantName} ${option.label}`}
            >
              {option.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
