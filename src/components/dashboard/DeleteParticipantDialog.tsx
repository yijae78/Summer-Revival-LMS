'use client'

import { useState, useCallback } from 'react'

import { Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { useAppModeStore } from '@/stores/appModeStore'
import { deleteParticipant } from '@/actions/participants'
import { deleteLocalParticipant } from '@/lib/local-db/participants'

import type { Participant } from '@/types'

interface DeleteParticipantDialogProps {
  participant: Participant
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeleteParticipantDialog({ participant, open, onOpenChange, onSuccess }: DeleteParticipantDialogProps) {
  const mode = useAppModeStore((s) => s.mode)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = useCallback(async () => {
    if (mode === 'demo') {
      toast.error('데모 모드에서는 삭제할 수 없어요')
      return
    }

    setIsDeleting(true)

    if (mode === 'local') {
      deleteLocalParticipant(participant.id)
      setIsDeleting(false)
      toast.success(`${participant.name}님이 삭제됐어요`)
      onOpenChange(false)
      onSuccess()
      return
    }

    const result = await deleteParticipant(participant.id)
    setIsDeleting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(`${participant.name}님이 삭제됐어요`)
    onOpenChange(false)
    onSuccess()
  }, [mode, participant.id, participant.name, onOpenChange, onSuccess])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/[0.08] bg-[#151823] sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Trash2 className="size-5 text-red-400" />
            참가자 삭제
          </DialogTitle>
          <DialogDescription>이 작업은 되돌릴 수 없어요</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
            <div className="text-sm text-amber-200/80">
              <p className="font-medium">{participant.name}님을 삭제할까요?</p>
              <p className="mt-1 text-xs text-amber-200/60">
                조 배정, 출석 기록, 퀴즈 응답 등이 함께 삭제돼요.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/[0.08]">
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? '삭제 중...' : '삭제하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
