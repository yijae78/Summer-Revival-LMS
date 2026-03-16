'use client'

import { useRouter } from 'next/navigation'
import { HelpCircle, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { QuizCard } from '@/components/dashboard/QuizCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'

import { useQuizzes } from '@/hooks/useQuiz'
import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useUser } from '@/hooks/useUser'

function QuizSkeletons() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonBox key={i} className="min-h-[140px] rounded-xl" />
      ))}
    </div>
  )
}

export default function QuizPage() {
  const router = useRouter()
  const { eventId } = useCurrentEvent()
  const { data: user } = useUser()
  const { data: quizzes, isLoading } = useQuizzes(eventId ?? null)

  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff'
  const hasQuizzes = quizzes && quizzes.length > 0

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground md:text-2xl">
            퀴즈
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            재미있는 퀴즈로 배운 내용을 확인해보세요
          </p>
        </div>
        {isAdminOrStaff && (
          <Button
            size="lg"
            className="h-12 gap-2"
            onClick={() => {
              // Placeholder: open create quiz dialog
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">퀴즈 만들기</span>
            <span className="sm:hidden">추가</span>
          </Button>
        )}
      </div>

      {/* Content */}
      <LoadingSkeleton isLoading={isLoading} skeleton={<QuizSkeletons />}>
        {hasQuizzes ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                questionCount={quiz.questionCount}
                onClick={() => router.push(`/quiz/${quiz.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={HelpCircle}
            title="아직 퀴즈가 없어요"
            description="행사에서 배운 내용을 퀴즈로 확인할 수 있어요"
            {...(isAdminOrStaff
              ? {
                  action: {
                    label: '첫 퀴즈 만들기',
                    onClick: () => {
                      // Placeholder: open create quiz dialog
                    },
                  },
                }
              : {})}
          />
        )}
      </LoadingSkeleton>
    </div>
  )
}
