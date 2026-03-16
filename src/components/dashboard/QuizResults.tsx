'use client'

import { CheckCircle2, XCircle, Clock, Trophy } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'

import { useQuiz, useMyQuizResponses } from '@/hooks/useQuiz'

import type { QuizQuestion, QuizResponse } from '@/types'

interface QuizResultsProps {
  quizId: string
  participantId: string
  className?: string
}

function ResultSkeletons() {
  return (
    <div className="space-y-4">
      <SkeletonBox className="h-24 rounded-xl" />
      <SkeletonBox className="h-16 rounded-xl" />
      <SkeletonBox className="h-16 rounded-xl" />
      <SkeletonBox className="h-16 rounded-xl" />
    </div>
  )
}

export function QuizResults({
  quizId,
  participantId,
  className,
}: QuizResultsProps) {
  const { data: quiz, isLoading: quizLoading } = useQuiz(quizId)
  const { data: responses, isLoading: responsesLoading } =
    useMyQuizResponses(quizId, participantId)

  const isLoading = quizLoading || responsesLoading

  const correctCount =
    responses?.filter((r) => r.is_correct).length ?? 0
  const wrongCount =
    responses?.filter((r) => !r.is_correct).length ?? 0
  const totalScore =
    responses?.reduce((sum, r) => sum + r.points_earned, 0) ?? 0
  const totalTime =
    responses?.reduce((sum, r) => sum + (r.time_taken ?? 0), 0) ?? 0
  const totalQuestions = quiz?.questions.length ?? 0
  const maxScore = totalQuestions * (quiz?.points_per_question ?? 0)

  // Create a map of responses by question_id for breakdown
  const responseByQuestion = new Map<string, QuizResponse>()
  responses?.forEach((r) => {
    if (r.question_id) {
      responseByQuestion.set(r.question_id, r)
    }
  })

  return (
    <div className={cn('space-y-4', className)}>
      <LoadingSkeleton
        isLoading={isLoading}
        skeleton={<ResultSkeletons />}
      >
        {/* Score Summary */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-primary" />
              결과 요약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {totalScore}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{maxScore}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  총 점수
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-bold text-emerald-500">
                    {correctCount}
                  </span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-lg font-bold text-destructive">
                    {wrongCount}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  정답/오답
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalTime > 0
                    ? `${Math.round(totalTime / 1000)}초`
                    : '-'}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  소요 시간
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question-by-question breakdown */}
        {quiz?.questions.map((question: QuizQuestion, index: number) => {
          const response = responseByQuestion.get(question.id)
          const isCorrect = response?.is_correct ?? false

          return (
            <Card
              key={question.id}
              className={cn(
                'transition-colors',
                response &&
                  (isCorrect
                    ? 'border-emerald-500/30'
                    : 'border-destructive/30')
              )}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {response ? (
                      isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      <span className="mr-1.5 text-muted-foreground">
                        Q{index + 1}.
                      </span>
                      {question.question}
                    </p>
                    {response && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge
                          variant={isCorrect ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {response.answer ?? '미응답'}
                        </Badge>
                        {!isCorrect && (
                          <span className="text-xs text-muted-foreground">
                            정답: {question.correct_answer}
                          </span>
                        )}
                        {response.time_taken !== null &&
                          response.time_taken > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {Math.round(response.time_taken / 1000)}초
                            </span>
                          )}
                        <span className="text-xs font-medium text-primary">
                          +{response.points_earned}점
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </LoadingSkeleton>
    </div>
  )
}
