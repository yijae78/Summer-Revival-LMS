'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

import { HelpCircle, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QuizCard } from '@/components/dashboard/QuizCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'

import { useQuizzes } from '@/hooks/useQuiz'
import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useUser } from '@/hooks/useUser'
import { useAppModeStore } from '@/stores/appModeStore'
import { createQuiz } from '@/actions/quiz'
import { insert } from '@/lib/local-db'
import { queryKeys } from '@/lib/query-keys'

import type { Quiz } from '@/types'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const QUIZ_TYPES = [
  { value: 'multiple_choice', label: '객관식' },
  { value: 'ox', label: 'OX 퀴즈' },
  { value: 'fill_blank', label: '빈칸 채우기' },
] as const

function QuizSkeletons() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonBox key={i} className="min-h-[140px] rounded-2xl" />
      ))}
    </div>
  )
}

// ============================================
// Create Quiz Dialog
// ============================================

function CreateQuizDialog({
  open,
  onOpenChange,
  eventId,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  onCreated: () => void
}) {
  const mode = useAppModeStore((s) => s.mode)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [quizType, setQuizType] = useState<string>('multiple_choice')
  const [timeLimit, setTimeLimit] = useState('')
  const [pointsPerQuestion, setPointsPerQuestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = useCallback(() => {
    setTitle('')
    setDescription('')
    setQuizType('multiple_choice')
    setTimeLimit('')
    setPointsPerQuestion('')
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      toast.error('퀴즈 제목을 입력해 주세요.')
      return
    }

    const parsedTimeLimit = timeLimit ? parseInt(timeLimit, 10) : undefined
    const parsedPoints = pointsPerQuestion ? parseInt(pointsPerQuestion, 10) : 10

    if (timeLimit && (isNaN(parsedTimeLimit!) || parsedTimeLimit! <= 0)) {
      toast.error('제한 시간은 1초 이상이어야 해요.')
      return
    }

    if (isNaN(parsedPoints) || parsedPoints <= 0) {
      toast.error('문제당 점수는 1점 이상이어야 해요.')
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'local') {
        insert<Omit<Quiz, 'id'> & { id?: string }>('quizzes', {
          event_id: eventId,
          title: title.trim(),
          description: description.trim() || null,
          type: quizType,
          is_active: false,
          time_limit: parsedTimeLimit ?? null,
          points_per_question: parsedPoints,
          created_at: new Date().toISOString(),
        })

        toast.success('퀴즈가 만들어졌어요!')
        resetForm()
        onOpenChange(false)
        onCreated()
      } else if (mode === 'cloud') {
        const result = await createQuiz({
          eventId,
          title: title.trim(),
          description: description.trim() || undefined,
          type: quizType,
          timeLimit: parsedTimeLimit,
          pointsPerQuestion: parsedPoints,
        })

        if (result.error) {
          toast.error(result.error)
          return
        }

        toast.success('퀴즈가 만들어졌어요!')
        resetForm()
        onOpenChange(false)
        onCreated()
      } else {
        toast.error('데모 모드에서는 퀴즈를 만들 수 없어요.')
      }
    } catch {
      toast.error('퀴즈 생성 중 문제가 발생했어요.')
    } finally {
      setIsSubmitting(false)
    }
  }, [title, description, quizType, timeLimit, pointsPerQuestion, mode, eventId, resetForm, onOpenChange, onCreated])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 퀴즈 만들기</DialogTitle>
          <DialogDescription>
            참가자들이 풀 퀴즈를 만들어 보세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="quiz-title">퀴즈 제목</Label>
            <Input
              id="quiz-title"
              placeholder="예: 1일차 말씀 퀴즈"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="quiz-description">
              설명 <span className="text-muted-foreground">(선택)</span>
            </Label>
            <Textarea
              id="quiz-description"
              placeholder="퀴즈에 대한 간단한 설명을 입력해 주세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Quiz Type */}
          <div className="grid gap-2">
            <Label htmlFor="quiz-type">유형</Label>
            <Select value={quizType} onValueChange={setQuizType}>
              <SelectTrigger id="quiz-type" className="h-12 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUIZ_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Limit */}
          <div className="grid gap-2">
            <Label htmlFor="quiz-time-limit">
              제한 시간 (초) <span className="text-muted-foreground">(선택)</span>
            </Label>
            <Input
              id="quiz-time-limit"
              type="number"
              inputMode="numeric"
              placeholder="30"
              min={1}
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              className="h-12"
            />
          </div>

          {/* Points Per Question */}
          <div className="grid gap-2">
            <Label htmlFor="quiz-points">문제당 점수</Label>
            <Input
              id="quiz-points"
              type="number"
              inputMode="numeric"
              placeholder="10"
              min={1}
              value={pointsPerQuestion}
              onChange={(e) => setPointsPerQuestion(e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
            className="min-h-12 w-full sm:w-auto"
          >
            {isSubmitting ? '만드는 중...' : '만들기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Main Page
// ============================================

export default function QuizPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { eventId } = useCurrentEvent()
  const { data: user } = useUser()
  const { data: quizzes, isLoading } = useQuizzes(eventId ?? null)

  const [dialogOpen, setDialogOpen] = useState(false)

  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff'
  const hasQuizzes = quizzes && quizzes.length > 0

  const handleRefresh = useCallback(() => {
    if (eventId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes(eventId) })
    }
  }, [eventId, queryClient])

  return (
    <motion.div
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <PageHeader
        title="퀴즈"
        description="퀴즈로 재미있게 배워요"
        backHref="/dashboard"
        action={
          isAdminOrStaff ? (
            <Button
              size="lg"
              className="h-12 gap-2"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">퀴즈 만들기</span>
              <span className="sm:hidden">추가</span>
            </Button>
          ) : undefined
        }
      />

      {/* Content */}
      <motion.div variants={fadeUp}>
        <LoadingSkeleton isLoading={isLoading} skeleton={<QuizSkeletons />}>
          {hasQuizzes ? (
            <motion.div
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {quizzes.map((quiz) => (
                <motion.div key={quiz.id} variants={fadeUp}>
                  <QuizCard
                    quiz={quiz}
                    questionCount={quiz.questionCount}
                    onClick={() => router.push(`/quiz/${quiz.id}`)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              icon={HelpCircle}
              title="아직 퀴즈가 없어요"
              description="행사에서 배운 내용을 퀴즈로 확인할 수 있어요"
              {...(isAdminOrStaff
                ? {
                    action: {
                      label: '첫 퀴즈 만들기',
                      onClick: () => setDialogOpen(true),
                    },
                  }
                : {})}
            />
          )}
        </LoadingSkeleton>
      </motion.div>

      {/* Create Quiz Dialog */}
      {eventId && (
        <CreateQuizDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          eventId={eventId}
          onCreated={handleRefresh}
        />
      )}
    </motion.div>
  )
}
