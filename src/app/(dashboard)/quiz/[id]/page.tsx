'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import {
  HelpCircle,
  PlayCircle,
  Plus,
  Settings,
  Trophy,
  Users,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QuizResults } from '@/components/dashboard/QuizResults'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'

import { useQuiz, useQuizResponses } from '@/hooks/useQuiz'
import { useUser } from '@/hooks/useUser'
import { useAppModeStore } from '@/stores/appModeStore'
import { toggleQuizActive } from '@/actions/quiz'
import { insert } from '@/lib/local-db'
import { queryKeys } from '@/lib/query-keys'

import type { QuizQuestion } from '@/types'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

interface QuizDetailPageProps {
  params: Promise<{ id: string }>
}

function DetailSkeletons() {
  return (
    <div className="space-y-4">
      <SkeletonBox className="h-32 rounded-2xl" />
      <SkeletonBox className="h-24 rounded-2xl" />
      <SkeletonBox className="h-20 rounded-2xl" />
    </div>
  )
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'multiple_choice':
      return '객관식'
    case 'ox':
      return 'OX 퀴즈'
    case 'fill_blank':
      return '빈칸 채우기'
    default:
      return '퀴즈'
  }
}

function AddQuestionDialog({
  open,
  onOpenChange,
  quizId,
  currentQuestionCount,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  quizId: string
  currentQuestionCount: number
}) {
  const mode = useAppModeStore((s) => s.mode)
  const queryClient = useQueryClient()
  const [questionText, setQuestionText] = useState('')
  const [questionType, setQuestionType] = useState<string>('multiple_choice')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [points, setPoints] = useState(10)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetForm() {
    setQuestionText('')
    setQuestionType('multiple_choice')
    setCorrectAnswer('')
    setOptions(['', '', '', ''])
    setPoints(10)
  }

  function handleOptionChange(index: number, value: string) {
    const updated = [...options]
    updated[index] = value
    setOptions(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!questionText.trim()) {
      toast.error('문제 내용을 입력해 주세요')
      return
    }
    if (!correctAnswer.trim()) {
      toast.error('정답을 입력해 주세요')
      return
    }

    setIsSubmitting(true)
    try {
      const optionsData =
        questionType === 'multiple_choice'
          ? { A: options[0], B: options[1], C: options[2], D: options[3] }
          : null

      if (mode === 'local' || mode === 'demo') {
        insert<QuizQuestion>('quiz_questions', {
          id: crypto.randomUUID(),
          quiz_id: quizId,
          question: questionText.trim(),
          type: questionType,
          options: optionsData,
          correct_answer: correctAnswer.trim(),
          order_index: currentQuestionCount,
          points,
        })
        toast.success('문제가 추가되었어요')
      } else {
        const { getSupabaseClient } = await import('@/lib/supabase/client')
        const supabase = getSupabaseClient()
        if (supabase) {
          const { error } = await supabase.from('quiz_questions').insert({
            quiz_id: quizId,
            question: questionText.trim(),
            type: questionType,
            options: optionsData,
            correct_answer: correctAnswer.trim(),
            order_index: currentQuestionCount,
            points,
          })
          if (error) {
            toast.error('문제 추가에 실패했어요')
            return
          }
          toast.success('문제가 추가되었어요')
        }
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.quiz(quizId) })
      resetForm()
      onOpenChange(false)
    } catch {
      toast.error('문제 추가 중 오류가 발생했어요')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>문제 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question-text">문제 내용</Label>
            <Textarea
              id="question-text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="문제를 입력하세요"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-type">문제 유형</Label>
            <Select value={questionType} onValueChange={setQuestionType}>
              <SelectTrigger id="question-type" className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">객관식</SelectItem>
                <SelectItem value="ox">OX 퀴즈</SelectItem>
                <SelectItem value="fill_blank">빈칸 채우기</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {questionType === 'multiple_choice' && (
            <div className="space-y-2">
              <Label>보기</Label>
              {['A', 'B', 'C', 'D'].map((label, index) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {label}
                  </span>
                  <Input
                    value={options[index]}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`보기 ${label}`}
                    className="h-12"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="correct-answer">정답</Label>
            <Input
              id="correct-answer"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder={
                questionType === 'multiple_choice'
                  ? 'A, B, C, D 중 하나'
                  : questionType === 'ox'
                    ? 'O 또는 X'
                    : '정답을 입력하세요'
              }
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-points">배점</Label>
            <Input
              id="question-points"
              type="number"
              min={1}
              max={100}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value) || 10)}
              className="h-12 w-32"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-h-[48px]"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !questionText.trim() || !correctAnswer.trim()}
              className="min-h-[48px]"
            >
              {isSubmitting ? '추가 중...' : '추가하기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function QuizDetailPage({ params }: QuizDetailPageProps) {
  const { id: quizId } = use(params)
  const router = useRouter()
  const { data: user } = useUser()
  const { data: quiz, isLoading } = useQuiz(quizId)
  const { data: responses } = useQuizResponses(quizId)
  const [isToggling, setIsToggling] = useState(false)
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false)

  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff'
  const hasQuestions = quiz?.questions && quiz.questions.length > 0

  // Count unique participants who answered
  const uniqueParticipants = new Set(
    responses?.map((r) => r.participant_id) ?? []
  ).size

  // Check if current user already answered (simple check by user id)
  const userResponses = responses?.filter(
    (r) => r.participant_id === user?.id
  )
  const hasAnswered = userResponses && userResponses.length > 0

  async function handleToggleActive(checked: boolean) {
    setIsToggling(true)
    await toggleQuizActive(quizId, checked)
    setIsToggling(false)
  }

  return (
    <motion.div
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <PageHeader
        title={quiz?.title ?? '퀴즈'}
        backHref="/quiz"
        backLabel="퀴즈 목록으로"
      />

      <motion.div variants={fadeUp}>
      <LoadingSkeleton isLoading={isLoading} skeleton={<DetailSkeletons />}>
        {quiz && (
          <>
            {/* Quiz Info Card */}
            <Card className="border-purple-500/15 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/5 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="bg-gradient-to-r from-purple-300 to-fuchsia-300 bg-clip-text text-lg text-transparent">{quiz.title}</CardTitle>
                    {quiz.description && (
                      <p className="text-sm text-muted-foreground">
                        {quiz.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={quiz.is_active ? 'default' : 'secondary'}
                    className="shrink-0"
                  >
                    {quiz.is_active ? '활성' : '비활성'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4" />
                    <span>{quiz.questions.length}문제</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="h-4 w-4" />
                    <span>{quiz.points_per_question}점/문제</span>
                  </div>
                  <Badge variant="outline">{getTypeLabel(quiz.type)}</Badge>
                  {quiz.time_limit && (
                    <span>제한시간: {quiz.time_limit}초</span>
                  )}
                  {responses && (
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span>{uniqueParticipants}명 참여</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Admin Controls */}
            {isAdminOrStaff && (
              <Card className="mt-4 border-indigo-500/15 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
                      <Settings className="h-3.5 w-3.5 text-white" />
                    </div>
                    관리
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Toggle Active */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        퀴즈 활성화
                      </p>
                      <p className="text-xs text-muted-foreground">
                        활성화하면 참가자들이 퀴즈를 풀 수 있어요
                      </p>
                    </div>
                    <Switch
                      checked={quiz.is_active}
                      onCheckedChange={handleToggleActive}
                      disabled={isToggling}
                      aria-label="퀴즈 활성화 전환"
                    />
                  </div>

                  {/* Add Questions Button */}
                  <Button
                    variant="outline"
                    className="h-12 w-full gap-2"
                    onClick={() => setQuestionDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    문제 추가하기
                  </Button>

                  <AddQuestionDialog
                    open={questionDialogOpen}
                    onOpenChange={setQuestionDialogOpen}
                    quizId={quizId}
                    currentQuestionCount={quiz?.questions?.length ?? 0}
                  />
                </CardContent>
              </Card>
            )}

            {/* Questions Preview (Admin) */}
            {isAdminOrStaff && hasQuestions && (
              <div className="mt-4 space-y-3">
                <h2 className="text-base font-semibold text-foreground">
                  문제 목록
                </h2>
                {quiz.questions.map(
                  (question: QuizQuestion, index: number) => (
                    <motion.div
                      key={question.id}
                      variants={fadeUp}
                      className="rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                    >
                      <div className="flex items-start gap-3 px-4 py-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {question.question}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(question.type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {question.points}점
                            </span>
                            <span className="text-xs text-emerald-500">
                              정답: {question.correct_answer}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                )}
              </div>
            )}

            {/* Student: Start Quiz / View Results */}
            {!isAdminOrStaff && (
              <div className="mt-4">
                {hasAnswered ? (
                  <div className="space-y-4">
                    <h2 className="text-base font-semibold text-foreground">
                      내 결과
                    </h2>
                    <QuizResults
                      quizId={quizId}
                      participantId={user?.id ?? ''}
                    />
                  </div>
                ) : quiz.is_active && hasQuestions ? (
                  <Button
                    size="lg"
                    className="h-14 w-full gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 text-base text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]"
                    onClick={() => router.push(`/quiz/${quizId}/play`)}
                  >
                    <PlayCircle className="h-5 w-5" />
                    퀴즈 시작하기
                  </Button>
                ) : (
                  <EmptyState
                    icon={HelpCircle}
                    title={
                      !quiz.is_active
                        ? '아직 퀴즈가 열리지 않았어요'
                        : '준비된 문제가 없어요'
                    }
                    description={
                      !quiz.is_active
                        ? '선생님이 퀴즈를 활성화하면 풀 수 있어요'
                        : '조금만 기다려 주세요'
                    }
                  />
                )}
              </div>
            )}
          </>
        )}
      </LoadingSkeleton>
      </motion.div>
    </motion.div>
  )
}
