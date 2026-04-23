'use client'

import { useState, useMemo, useCallback } from 'react'

import { Users, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { useAppModeStore } from '@/stores/appModeStore'
import { addParticipantsBulk } from '@/actions/participants'
import { addLocalParticipantsBulk } from '@/lib/local-db/participants'
import { cn } from '@/lib/utils'

interface BulkAddParticipantsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  onSuccess: () => void
}

const VALID_GRADES = new Set([
  '유치부',
  '초1', '초2', '초3', '초4', '초5', '초6',
  '중1', '중2', '중3',
  '고1', '고2', '고3',
  '대학생', '교사',
])

const GENDER_MAP: Record<string, 'male' | 'female'> = {
  '남': 'male', '남자': 'male', '남성': 'male', 'M': 'male', 'male': 'male',
  '여': 'female', '여자': 'female', '여성': 'female', 'F': 'female', 'female': 'female',
}

interface ParsedRow {
  name: string
  grade: string
  gender: 'male' | 'female'
  valid: boolean
  error?: string
}

function parseRows(text: string): ParsedRow[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const parts = line.split(/\t|,/).map((s) => s.trim())
      const [rawName, rawGrade, rawGender] = parts

      if (!rawName) return { name: '', grade: '', gender: 'male' as const, valid: false, error: '이름 없음' }

      const name = rawName
      const grade = rawGrade ?? ''
      const gender = GENDER_MAP[rawGender ?? ''] ?? null

      if (!VALID_GRADES.has(grade)) {
        return { name, grade, gender: 'male' as const, valid: false, error: `잘못된 학년: "${grade}"` }
      }
      if (!gender) {
        return { name, grade, gender: 'male' as const, valid: false, error: `잘못된 성별: "${rawGender ?? ''}"` }
      }

      return { name, grade, gender, valid: true }
    })
}

export function BulkAddParticipantsDialog({ open, onOpenChange, eventId, onSuccess }: BulkAddParticipantsDialogProps) {
  const mode = useAppModeStore((s) => s.mode)
  const [rawText, setRawText] = useState('')
  const [step, setStep] = useState<'input' | 'preview'>('input')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const parsedRows = useMemo(() => (step === 'preview' ? parseRows(rawText) : []), [rawText, step])
  const validRows = useMemo(() => parsedRows.filter((r) => r.valid), [parsedRows])
  const invalidRows = useMemo(() => parsedRows.filter((r) => !r.valid), [parsedRows])

  const resetForm = useCallback(() => {
    setRawText('')
    setStep('input')
  }, [])

  function handlePreview() {
    const rows = parseRows(rawText)
    if (rows.length === 0) {
      toast.error('등록할 데이터를 입력해 주세요')
      return
    }
    setStep('preview')
  }

  async function handleSubmit() {
    if (validRows.length === 0) {
      toast.error('유효한 데이터가 없어요')
      return
    }

    if (mode === 'demo') {
      toast.error('데모 모드에서는 추가할 수 없어요')
      return
    }

    setIsSubmitting(true)
    const participants = validRows.map((r) => ({ name: r.name, grade: r.grade, gender: r.gender }))

    if (mode === 'local') {
      addLocalParticipantsBulk(eventId, participants)
      setIsSubmitting(false)
      toast.success(`${participants.length}명이 등록됐어요`)
      resetForm()
      onOpenChange(false)
      onSuccess()
      return
    }

    const result = await addParticipantsBulk({ eventId, participants })
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(`${participants.length}명이 등록됐어요`)
    resetForm()
    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v) }}>
      <DialogContent className="border-white/[0.08] bg-[#151823] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Users className="size-5 text-primary" />
            일괄 등록
          </DialogTitle>
          <DialogDescription>
            {step === 'input'
              ? '이름, 학년, 성별을 탭 또는 쉼표로 구분하여 붙여넣기 해 주세요'
              : `${parsedRows.length}명 중 ${validRows.length}명 등록 가능`}
          </DialogDescription>
        </DialogHeader>

        {step === 'input' ? (
          <div className="space-y-3 py-2">
            <Label>명단 입력</Label>
            <textarea
              placeholder={`김은혜\t초5\t여\n이준서\t중1\t남\n박서연\t고2\t여`}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={10}
              className="flex w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
            <p className="text-xs text-muted-foreground/60">
              한 줄에 한 명씩. 이름, 학년(초1~고3/대학생/교사), 성별(남/여)을 탭 또는 쉼표로 구분
            </p>
          </div>
        ) : (
          <div className="max-h-72 space-y-1 overflow-y-auto py-2">
            {parsedRows.map((row, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                  row.valid ? 'bg-emerald-500/5' : 'bg-red-500/10'
                )}
              >
                {row.valid ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="size-4 shrink-0 text-red-400" />
                )}
                <span className="flex-1 font-medium text-foreground">{row.name || '(빈 이름)'}</span>
                <span className="text-muted-foreground">{row.grade}</span>
                <span className="text-muted-foreground">{row.gender === 'male' ? '남' : '여'}</span>
                {row.error && (
                  <span className="text-xs text-red-400">{row.error}</span>
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          {step === 'input' ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/[0.08]">
                취소
              </Button>
              <Button onClick={handlePreview} disabled={!rawText.trim()}>
                미리보기
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep('input')} className="border-white/[0.08]">
                뒤로
              </Button>
              {invalidRows.length > 0 && (
                <p className="flex-1 text-xs text-amber-400">
                  {invalidRows.length}명은 오류로 제외돼요
                </p>
              )}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || validRows.length === 0}
              >
                {isSubmitting ? '등록 중...' : `${validRows.length}명 등록하기`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
