'use client'

import { useState, useCallback, useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAttendance } from '@/hooks/useAttendance'
import { checkAttendance } from '@/actions/attendance'
import { triggerHaptic } from '@/lib/utils/haptics'
import { queueAttendanceCheck } from '@/lib/offline/attendance-queue'
import { queryKeys } from '@/lib/query-keys'
import { useAppModeStore } from '@/stores/appModeStore'

import type { AttendanceStatus } from '@/types'
import type { AttendanceWithParticipant } from '@/hooks/useAttendance'

export function useOptimisticAttendance(scheduleId: string | null) {
  const queryClient = useQueryClient()
  const mode = useAppModeStore((s) => s.mode)
  const isNonCloud = mode === 'demo' || mode === 'local'
  const { data: serverRecords, isLoading } = useAttendance(scheduleId)
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Map<string, AttendanceStatus>
  >(new Map())
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())
  const abortControllers = useRef<Map<string, AbortController>>(new Map())

  // Merge server records with optimistic updates
  const records: AttendanceWithParticipant[] = (serverRecords ?? []).map((record) => {
    const optimisticStatus = optimisticUpdates.get(record.participant_id ?? '')
    if (optimisticStatus) {
      return { ...record, status: optimisticStatus }
    }
    return record
  })

  const updateStatus = useCallback(
    async (participantId: string, status: AttendanceStatus) => {
      if (!scheduleId) return

      // In demo/local mode, just apply optimistic update without server call
      if (isNonCloud) {
        setOptimisticUpdates((prev) => {
          const next = new Map(prev)
          next.set(participantId, status)
          return next
        })
        triggerHaptic('success')
        toast.success(mode === 'demo' ? '출석이 체크됐어요 (데모)' : '출석이 체크됐어요')
        return
      }

      // Cancel any in-flight request for this participant
      const existingController = abortControllers.current.get(participantId)
      if (existingController) {
        existingController.abort()
      }

      const controller = new AbortController()
      abortControllers.current.set(participantId, controller)

      // Find previous status for rollback
      const previousStatus = serverRecords?.find(
        (r) => r.participant_id === participantId
      )?.status as AttendanceStatus | undefined

      // Optimistically update
      setOptimisticUpdates((prev) => {
        const next = new Map(prev)
        next.set(participantId, status)
        return next
      })
      setUpdatingIds((prev) => new Set(prev).add(participantId))

      try {
        const result = await checkAttendance({
          scheduleId,
          participantId,
          status,
        })

        if (controller.signal.aborted) return

        if (result.error) {
          // Rollback optimistic update
          setOptimisticUpdates((prev) => {
            const next = new Map(prev)
            if (previousStatus) {
              next.set(participantId, previousStatus as AttendanceStatus)
            } else {
              next.delete(participantId)
            }
            return next
          })
          triggerHaptic('error')
          toast.error(result.error)
        } else {
          // Clear the optimistic update now that server has confirmed
          setOptimisticUpdates((prev) => {
            const next = new Map(prev)
            next.delete(participantId)
            return next
          })
          // Invalidate to refetch fresh data
          await queryClient.invalidateQueries({
            queryKey: queryKeys.attendance(scheduleId),
          })
        }
      } catch {
        if (controller.signal.aborted) return

        // Network error - queue for offline sync
        queueAttendanceCheck({ scheduleId, participantId, status })
        toast.warning('오프라인 상태예요. 연결되면 자동으로 동기화돼요.')
      } finally {
        if (!controller.signal.aborted) {
          setUpdatingIds((prev) => {
            const next = new Set(prev)
            next.delete(participantId)
            return next
          })
          abortControllers.current.delete(participantId)
        }
      }
    },
    [scheduleId, serverRecords, queryClient, isNonCloud, mode]
  )

  return {
    records,
    updateStatus,
    isUpdating: updatingIds.size > 0,
    isLoading,
    isParticipantUpdating: (participantId: string) => updatingIds.has(participantId),
  }
}
