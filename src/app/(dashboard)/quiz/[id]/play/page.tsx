'use client'

import { use, useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Clock, XCircle } from 'lucide-react'

import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'
import { QuizResults } from '@/components/dashboard/QuizResults'

import { useQuiz } from '@/hooks/useQuiz'
import { useUser } from '@/hooks/useUser'
import { submitAnswer } from '@/actions/quiz'

import type { QuizQuestion } from '@/types'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

interface QuizPlayPageProps {
  params: Promise<{ id: string }>
}

type QuizPhase = 'playing' | 'answered' | 'finished'

interface AnswerRecord {
  questionId: string
  answer: string
  isCorrect: boolean
  timeTaken: number
  pointsEarned: number
}

function PlaySkeletons() {
  return (
    <div className="space-y-6">
      <SkeletonBox className="h-3 w-full rounded-full" />
      <SkeletonBox className="h-40 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <SkeletonBox className="h-14 rounded-xl" />
        <SkeletonBox className="h-14 rounded-xl" />
        <SkeletonBox className="h-14 rounded-xl" />
        <SkeletonBox className="h-14 rounded-xl" />
      </div>
    </div>
  )
}

export default function QuizPlayPage({ params }: QuizPlayPageProps) {
  const { id: quizId } = use(params)
  const router = useRouter()
  const { data: user } = useUser()
  const { data: quiz, isLoading } = useQuiz(quizId)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<QuizPhase>('playing')
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [fillAnswer, setFillAnswer] = useState('')
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Track question start time
  const questionStartRef = useRef<number>(Date.now())

  const questions = quiz?.questions ?? []
  const currentQuestion: QuizQuestion | undefined = questions[currentIndex]
  const totalQuestions = questions.length
  const progressPercent =
    totalQuestions > 0
      ? Math.round(((currentIndex + (phase === 'finished' ? 1 : 0)) / totalQuestions) * 100)
      : 0

  // Parse options for multiple choice questions
  const options: string[] = (() => {
    if (!currentQuestion?.options) return []
    const opts = currentQuestion.options as Record<string, unknown>
    if (Array.isArray(opts)) return opts as string[]
    return Object.values(opts).map(String)
  })()

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

  // Timer countdown
  useEffect(() => {
    if (phase !== 'playing' || !quiz?.time_limit) return

    setTimeLeft(quiz.time_limit)
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentIndex, phase, quiz?.time_limit])

  // Auto-submit on timeout
  useEffect(() => {
    if (timeLeft === 0 && phase === 'playing') {
      handleSubmitAnswer('')
    }
  }, [timeLeft]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset question start time when moving to next question
  useEffect(() => {
    if (phase === 'playing') {
      questionStartRef.current = Date.now()
      setSelectedAnswer(null)
      setFillAnswer('')
    }
  }, [currentIndex, phase])

  const handleSubmitAnswer = useCallback(
    async (answer: string) => {
      if (!currentQuestion || !user?.id || isSubmitting) return

      setIsSubmitting(true)
      const timeTaken = Date.now() - questionStartRef.current
      const isCorrect =
        answer.trim().toLowerCase() ===
        currentQuestion.correct_answer.trim().toLowerCase()
      const pointsEarned = isCorrect ? currentQuestion.points : 0

      await submitAnswer({
        questionId: currentQuestion.id,
        participantId: user.id,
        answer: answer || '(시간 초과)',
        isCorrect,
        timeTaken,
        pointsEarned,
      })

      const record: AnswerRecord = {
        questionId: currentQuestion.id,
        answer: answer || '(시간 초과)',
        isCorrect,
        timeTaken,
        pointsEarned,
      }

      setAnswers((prev) => [...prev, record])
      setSelectedAnswer(answer)
      setPhase('answered')
      setIsSubmitting(false)

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(isCorrect ? [30, 50, 30] : [50, 30, 50, 30, 50])
      }
    },
    [currentQuestion, user?.id, isSubmitting]
  )

  function handleNext() {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1)
      setPhase('playing')
    } else {
      setPhase('finished')
    }
  }

  // Finished state: show results
  if (phase === 'finished' && user?.id) {
    const totalScore = answers.reduce((sum, a) => sum + a.pointsEarned, 0)
    const correctCount = answers.filter((a) => a.isCorrect).length

    return (
      <motion.div
        className="space-y-5"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/quiz/${quizId}`)}
            className={cn(
              'flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center',
              'rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm',
              'text-muted-foreground transition-all duration-300',
              'hover:border-primary/20 hover:bg-white/[0.06] hover:text-foreground'
            )}
            aria-label="퀴즈 상세로"
          >
            <ArrowLeft className="size-[18px]" />
          </button>
          <h1 className="text-xl font-bold text-foreground md:text-2xl">
            퀴즈 완료!
          </h1>
        </motion.div>

        {/* Quick Summary */}
        <motion.div variants={fadeUp}>
          <Card className="border-primary/30 bg-primary/5 backdrop-blur-xl">
            <CardContent className="py-6 text-center">
              <p className="text-4xl font-bold tabular-nums text-primary">{totalScore}점</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {totalQuestions}문제 중 {correctCount}문제 정답이에요
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed results */}
        <motion.div variants={fadeUp}>
          <QuizResults quizId={quizId} participantId={user.id} />
        </motion.div>

        <motion.div variants={fadeUp}>
          <Button
            variant="outline"
            className="h-12 w-full"
            onClick={() => router.push('/quiz')}
          >
            퀴즈 목록으로 돌아가기
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(`/quiz/${quizId}`)}
          className={cn(
            'flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center',
            'rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm',
            'text-muted-foreground transition-all duration-300',
            'hover:border-primary/20 hover:bg-white/[0.06] hover:text-foreground'
          )}
          aria-label="퀴즈로 돌아가기"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-foreground">
            {quiz?.title ?? '퀴즈'}
          </h1>
        </div>
        {timeLeft !== null && timeLeft > 0 && phase === 'playing' && (
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium',
              timeLeft <= 5
                ? 'border-destructive/30 bg-destructive/10 text-destructive'
                : 'border-white/[0.08] bg-white/[0.04] text-muted-foreground'
            )}
          >
            <Clock className="h-4 w-4" />
            {timeLeft}초
          </div>
        )}
      </motion.div>

      <LoadingSkeleton isLoading={isLoading} skeleton={<PlaySkeletons />}>
        {currentQuestion && (
          <>
            {/* Progress Bar */}
            <motion.div variants={fadeUp} className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {currentIndex + 1} / {totalQuestions}
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>

            {/* Question */}
            <motion.div variants={fadeUp}>
              <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-xl">
                <CardContent className="py-6">
                  <p className="text-center text-lg font-semibold leading-relaxed text-foreground">
                    <span className="mr-2 text-primary">
                      Q{currentIndex + 1}.
                    </span>
                    {currentQuestion.question}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Answer Area */}
            {currentQuestion.type === 'multiple_choice' && (
              <motion.div
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                variants={stagger}
                initial="hidden"
                animate="show"
              >
                {options.map((option, index) => {
                  const label = optionLabels[index] ?? String(index + 1)
                  const isSelected = selectedAnswer === option
                  const isCorrectAnswer =
                    phase === 'answered' &&
                    option.trim().toLowerCase() ===
                      currentQuestion.correct_answer.trim().toLowerCase()
                  const isWrongSelected =
                    phase === 'answered' && isSelected && !isCorrectAnswer

                  return (
                    <motion.button
                      key={index}
                      variants={fadeUp}
                      type="button"
                      disabled={phase !== 'playing' || isSubmitting}
                      onClick={() => handleSubmitAnswer(option)}
                      whileTap={phase === 'playing' ? { scale: 0.97 } : undefined}
                      className={cn(
                        'flex min-h-[56px] items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all',
                        phase === 'playing' &&
                          'border-white/[0.08] bg-white/[0.03] hover:border-primary/50 hover:bg-primary/5',
                        isCorrectAnswer &&
                          'border-emerald-500 bg-emerald-500/10',
                        isWrongSelected &&
                          'border-destructive bg-destructive/10',
                        phase !== 'playing' &&
                          !isCorrectAnswer &&
                          !isWrongSelected &&
                          'border-white/[0.08] opacity-50'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                          phase === 'playing' &&
                            'bg-white/[0.06] text-muted-foreground',
                          isCorrectAnswer &&
                            'bg-emerald-500 text-white',
                          isWrongSelected &&
                            'bg-destructive text-white'
                        )}
                      >
                        {isCorrectAnswer ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isWrongSelected ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          label
                        )}
                      </span>
                      <span className="flex-1">{option}</span>
                    </motion.button>
                  )
                })}
              </motion.div>
            )}

            {currentQuestion.type === 'ox' && (
              <motion.div
                className="grid grid-cols-2 gap-4"
                variants={stagger}
                initial="hidden"
                animate="show"
              >
                {[
                  { label: 'O', value: 'O', subtext: '맞아요' },
                  { label: 'X', value: 'X', subtext: '틀려요' },
                ].map((item) => {
                  const isSelected = selectedAnswer === item.value
                  const isCorrectAnswer =
                    phase === 'answered' &&
                    item.value === currentQuestion.correct_answer
                  const isWrongSelected =
                    phase === 'answered' &&
                    isSelected &&
                    !isCorrectAnswer

                  return (
                    <motion.button
                      key={item.value}
                      variants={fadeUp}
                      type="button"
                      disabled={phase !== 'playing' || isSubmitting}
                      onClick={() => handleSubmitAnswer(item.value)}
                      whileTap={phase === 'playing' ? { scale: 0.97 } : undefined}
                      className={cn(
                        'flex min-h-[100px] flex-col items-center justify-center gap-2 rounded-2xl border-2 text-center transition-all',
                        phase === 'playing' &&
                          'border-white/[0.08] bg-white/[0.03] hover:border-primary/50 hover:bg-primary/5',
                        isCorrectAnswer &&
                          'border-emerald-500 bg-emerald-500/10',
                        isWrongSelected &&
                          'border-destructive bg-destructive/10',
                        phase !== 'playing' &&
                          !isCorrectAnswer &&
                          !isWrongSelected &&
                          'border-white/[0.08] opacity-50'
                      )}
                    >
                      <span
                        className={cn(
                          'text-4xl font-black',
                          phase === 'playing' && 'text-foreground',
                          isCorrectAnswer && 'text-emerald-500',
                          isWrongSelected && 'text-destructive'
                        )}
                      >
                        {item.label}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {item.subtext}
                      </span>
                    </motion.button>
                  )
                })}
              </motion.div>
            )}

            {currentQuestion.type === 'fill_blank' && (
              <motion.div variants={fadeUp} className="space-y-4">
                {phase === 'playing' ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (fillAnswer.trim()) {
                        handleSubmitAnswer(fillAnswer.trim())
                      }
                    }}
                    className="space-y-3"
                  >
                    <Input
                      value={fillAnswer}
                      onChange={(e) => setFillAnswer(e.target.value)}
                      placeholder="정답을 입력해 주세요"
                      className="h-14 rounded-xl border-white/[0.08] bg-white/[0.03] text-center text-lg"
                      autoFocus
                      disabled={isSubmitting}
                    />
                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 w-full"
                      disabled={!fillAnswer.trim() || isSubmitting}
                    >
                      제출하기
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div
                      className={cn(
                        'rounded-xl border-2 px-4 py-4 text-center',
                        answers[answers.length - 1]?.isCorrect
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-destructive bg-destructive/10'
                      )}
                    >
                      <p className="text-sm text-muted-foreground">
                        내 답변
                      </p>
                      <p className="mt-1 text-lg font-semibold">
                        {answers[answers.length - 1]?.answer}
                      </p>
                    </div>
                    {!answers[answers.length - 1]?.isCorrect && (
                      <div className="rounded-xl border-2 border-emerald-500 bg-emerald-500/10 px-4 py-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          정답
                        </p>
                        <p className="mt-1 text-lg font-semibold text-emerald-500">
                          {currentQuestion.correct_answer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Answered feedback & Next button */}
            {phase === 'answered' && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                <div
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium',
                    answers[answers.length - 1]?.isCorrect
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-destructive/10 text-destructive'
                  )}
                >
                  {answers[answers.length - 1]?.isCorrect ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      정답이에요! +{answers[answers.length - 1]?.pointsEarned}점
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5" />
                      아쉬워요! 정답은 &ldquo;{currentQuestion.correct_answer}&rdquo;이에요
                    </>
                  )}
                </div>
                <Button
                  size="lg"
                  className="h-12 w-full"
                  onClick={handleNext}
                >
                  {currentIndex < totalQuestions - 1
                    ? '다음 문제'
                    : '결과 보기'}
                </Button>
              </motion.div>
            )}
          </>
        )}
      </LoadingSkeleton>
    </motion.div>
  )
}
