'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  HelpCircle,
  PlayCircle,
  Plus,
  Settings,
  Trophy,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuizResults } from '@/components/dashboard/QuizResults'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'

import { useQuiz, useQuizResponses } from '@/hooks/useQuiz'
import { useUser } from '@/hooks/useUser'
import { toggleQuizActive } from '@/actions/quiz'

import type { QuizQuestion } from '@/types'

interface QuizDetailPageProps {
  params: Promise<{ id: string }>
}

function DetailSkeletons() {
  return (
    <div className="space-y-4">
      <SkeletonBox className="h-32 rounded-xl" />
      <SkeletonBox className="h-24 rounded-xl" />
      <SkeletonBox className="h-20 rounded-xl" />
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

export default function QuizDetailPage({ params }: QuizDetailPageProps) {
  const { id: quizId } = use(params)
  const router = useRouter()
  const { data: user } = useUser()
  const { data: quiz, isLoading } = useQuiz(quizId)
  const { data: responses } = useQuizResponses(quizId)
  const [isToggling, setIsToggling] = useState(false)

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
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/quiz')}
          className="h-12 w-12 shrink-0"
          aria-label="퀴즈 목록으로 돌아가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <LoadingSkeleton
            isLoading={isLoading}
            skeleton={<SkeletonBox className="h-7 w-48 rounded-lg" />}
          >
            <h1 className="truncate text-xl font-bold text-foreground md:text-2xl">
              {quiz?.title ?? '퀴즈'}
            </h1>
          </LoadingSkeleton>
        </div>
      </div>

      <LoadingSkeleton isLoading={isLoading} skeleton={<DetailSkeletons />}>
        {quiz && (
          <>
            {/* Quiz Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Settings className="h-4 w-4" />
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
                    onClick={() => {
                      // Placeholder: open add question dialog
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    문제 추가하기
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Questions Preview (Admin) */}
            {isAdminOrStaff && hasQuestions && (
              <div className="space-y-3">
                <h2 className="text-base font-semibold text-foreground">
                  문제 목록
                </h2>
                {quiz.questions.map(
                  (question: QuizQuestion, index: number) => (
                    <Card key={question.id}>
                      <CardContent className="py-3">
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {question.question}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
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
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            )}

            {/* Student: Start Quiz / View Results */}
            {!isAdminOrStaff && (
              <>
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
                    className="h-14 w-full gap-2 text-base"
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
              </>
            )}
          </>
        )}
      </LoadingSkeleton>
    </div>
  )
}
