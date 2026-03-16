'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  HelpCircle,
  PlayCircle,
  Plus,
  Settings,
  Trophy,
  Users,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuizResults } from '@/components/dashboard/QuizResults'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'

import { useQuiz, useQuizResponses } from '@/hooks/useQuiz'
import { useUser } from '@/hooks/useUser'
import { toggleQuizActive } from '@/actions/quiz'

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
