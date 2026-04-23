'use client'

import { useState, useCallback } from 'react'

import { UserPlus } from 'lucide-react'
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
import { addParticipantByAdmin } from '@/actions/participants'
import { addLocalParticipant } from '@/lib/local-db/participants'
import { cn } from '@/lib/utils'

interface AddParticipantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  onSuccess: () => void
}

const GRADE_OPTIONS = [
  '유치부',
  '초1', '초2', '초3', '초4', '초5', '초6',
  '중1', '중2', '중3',
  '고1', '고2', '고3',
  '대학생', '교사',
]

export function AddParticipantDialog({ open, onOpenChange, eventId, onSuccess }: AddParticipantDialogProps) {
  const mode = useAppModeStore((s) => s.mode)
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | ''>('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tried, setTried] = useState(false)

  const nameError = tried && !name.trim()
  const gradeError = tried && !grade
  const genderError = tried && !gender

  const resetForm = useCallback(() => {
    setName('')
    setGrade('')
    setGender('')
    setPhone('')
    setBirthDate('')
    setTried(false)
  }, [])

  const handleSubmit = useCallback(async () => {
    setTried(true)
    if (!name.trim() || !grade || !gender) {
      return
    }

    if (mode === 'demo') {
      toast.error('데모 모드에서는 추가할 수 없어요')
      return
    }

    setIsSubmitting(true)

    if (mode === 'local') {
      addLocalParticipant({ name: name.trim(), grade, gender, phone: phone.trim() || undefined, birthDate: birthDate || undefined, eventId })
      setIsSubmitting(false)
      toast.success(`${name.trim()}님이 등록됐어요`)
      resetForm()
      onOpenChange(false)
      onSuccess()
      return
    }

    // Cloud mode
    const result = await addParticipantByAdmin({
      name: name.trim(),
      grade,
      gender,
      phone: phone.trim() || undefined,
      birthDate: birthDate || undefined,
      eventId,
    })
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(`${name.trim()}님이 등록됐어요`)
    resetForm()
    onOpenChange(false)
    onSuccess()
  }, [name, grade, gender, phone, birthDate, mode, eventId, onOpenChange, onSuccess, resetForm])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/[0.08] bg-[#151823] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <UserPlus className="size-5 text-primary" />
            참가자 추가
          </DialogTitle>
          <DialogDescription>이름, 학년, 성별을 입력해 주세요</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="add-name" className={cn(nameError && 'text-amber-400')}>이름 *</Label>
            <Input
              id="add-name"
              placeholder="이름을 입력해 주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                'h-11 border-white/[0.08] bg-white/[0.03]',
                nameError && 'border-amber-400 bg-amber-400/10'
              )}
              autoFocus
            />
            {nameError && <p className="text-xs text-amber-400">이름을 입력해 주세요</p>}
          </div>

          {/* Grade */}
          <div className="space-y-2">
            <Label className={cn(gradeError && 'text-amber-400')}>학년 *</Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger className={cn(
                'h-11 w-full border-white/[0.08] bg-white/[0.03]',
                gradeError && 'border-amber-400 bg-amber-400/10'
              )}>
                <SelectValue placeholder="학년을 선택해 주세요" />
              </SelectTrigger>
              <SelectContent>
                {GRADE_OPTIONS.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {gradeError && <p className="text-xs text-amber-400">학년을 선택해 주세요</p>}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label className={cn(genderError && 'text-amber-400')}>성별 *</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={cn(
                  'flex h-11 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
                  gender === 'male'
                    ? 'border-primary bg-primary/10 text-primary'
                    : genderError
                      ? 'border-amber-400 bg-amber-400/10 text-amber-400'
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
                    : genderError
                      ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                      : 'border-white/[0.08] text-muted-foreground hover:border-primary/50'
                )}
              >
                여자
              </button>
            </div>
            {genderError && <p className="text-xs text-amber-400">성별을 선택해 주세요</p>}
          </div>

          {/* Birth Date (optional) */}
          <div className="space-y-2">
            <Label htmlFor="add-birth-date">생년월일</Label>
            <Input
              id="add-birth-date"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="h-11 border-white/[0.08] bg-white/[0.03]"
            />
          </div>

          {/* Phone (optional) */}
          <div className="space-y-2">
            <Label htmlFor="add-phone">핸드폰</Label>
            <Input
              id="add-phone"
              type="tel"
              inputMode="tel"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => {
                const v = e.target.value.replace(/[^\d-]/g, '')
                if (v.length <= 13) setPhone(v)
              }}
              className="h-11 border-white/[0.08] bg-white/[0.03]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/[0.08]"
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '등록 중...' : '등록하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
