'use client'

import { useRouter } from 'next/navigation'
import { HelpCircle, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { QuizCard } from '@/components/dashboard/QuizCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton, SkeletonBox } from '@/components/shared/LoadingSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'

import { useQuizzes } from '@/hooks/useQuiz'
import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { useUser } from '@/hooks/useUser'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

function QuizSkeletons() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonBox key={i} className="min-h-[140px] rounded-2xl" />
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
              onClick={() => {
                // Placeholder: open create quiz dialog
              }}
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
                      onClick: () => {
                        // Placeholder: open create quiz dialog
                      },
                    },
                  }
                : {})}
            />
          )}
        </LoadingSkeleton>
      </motion.div>
    </motion.div>
  )
}
