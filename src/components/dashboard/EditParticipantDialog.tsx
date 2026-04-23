'use client'

import { useState, useCallback, useEffect } from 'react'

import { Pencil } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useAppModeStore } from '@/stores/appModeStore'
import { updateParticipant } from '@/actions/participants'
import { updateLocalParticipant } from '@/lib/local-db/participants'
import { cn } from '@/lib/utils'

import type { Participant } from '@/types'

interface EditParticipantDialogProps {
  participant: Participant
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const GRADE_OPTIONS = [
  '유치부',
  '초1', '초2', '초3', '초4', '초5', '초6',
  '중1', '중2', '중3',
  '고1', '고2', '고3',
  '대학생', '교사',
]

export function EditParticipantDialog({ participant, open, onOpenChange, onSuccess }: EditParticipantDialogProps) {
  const mode = useAppModeStore((s) => s.mode)
  const [name, setName] = useState(participant.name)
  const [grade, setGrade] = useState(participant.grade ?? '')
  const [gender, setGender] = useState<'male' | 'female' | ''>(
    (participant.gender as 'male' | 'female') ?? ''
  )
  const [phone, setPhone] = useState(participant.phone ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName(participant.name)
      setGrade(participant.grade ?? '')
      setGender((participant.gender as 'male' | 'female') ?? '')
      setPhone(participant.phone ?? '')
    }
  }, [open, participant])

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      toast.error('이름을 입력해 주세요')
      return
    }

    setIsSubmitting(true)

    const updates: Record<string, unknown> = {
      name: name.trim(),
      grade: grade || null,
      gender: gender || null,
      phone: phone || null,
    }

    if (mode === 'local') {
      updateLocalParticipant(participant.id, updates as Partial<Participant>)
      setIsSubmitting(false)
      toast.success('참가자 정보가 수정됐어요')
      onOpenChange(false)
      onSuccess()
      return
    }

    const result = await updateParticipant(participant.id, updates)
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('참가자 정보가 수정됐어요')
    onOpenChange(false)
    onSuccess()
  }, [name, grade, gender, phone, mode, participant.id, onOpenChange, onSuccess])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/[0.08] bg-[#151823] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Pencil className="size-5 text-primary" />
            참가자 수정
          </DialogTitle>
          <DialogDescription>{participant.name}님의 정보를 수정해요</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-name">이름 *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 border-white/[0.08] bg-white/[0.03]"
            />
          </div>

          <div className="space-y-2">
            <Label>학년</Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger className="h-11 w-full border-white/[0.08] bg-white/[0.03]">
                <SelectValue placeholder="학년 선택" />
              </SelectTrigger>
              <SelectContent>
                {GRADE_OPTIONS.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>성별</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={cn(
                  'flex h-11 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
                  gender === 'male'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-white/[0.08] text-muted-foreground hover:border-primary/50'
                )}
              >
                남자
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={cn(
                  'flex h-11 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
                  gender === 'female'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-white/[0.08] text-muted-foreground hover:border-primary/50'
                )}
              >
                여자
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-phone">연락처</Label>
            <Input
              id="edit-phone"
              inputMode="tel"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 border-white/[0.08] bg-white/[0.03]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/[0.08]">
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
