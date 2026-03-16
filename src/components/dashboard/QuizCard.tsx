import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

import type { Quiz } from '@/types'

interface QuizCardProps {
  quiz: Quiz
  questionCount: number
  onClick?: () => void
  className?: string
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

export function QuizCard({
  quiz,
  questionCount,
  onClick,
  className,
}: QuizCardProps) {
  return (
    <div
      className={cn(
        'cursor-pointer rounded-2xl border backdrop-blur-xl transition-all duration-300',
        'hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]',
        quiz.is_active
          ? 'border-amber-500/25 bg-gradient-to-br from-amber-500/15 to-orange-500/10 shadow-[0_0_25px_rgba(245,158,11,0.12)]'
          : 'border-purple-500/15 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/5 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]',
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="p-6 pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
            {quiz.title}
          </h3>
          <Badge
            variant={quiz.is_active ? 'default' : 'secondary'}
            className={cn(
              'shrink-0',
              quiz.is_active && 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0'
            )}
          >
            {quiz.is_active ? '활성' : '비활성'}
          </Badge>
        </div>
      </div>
      <div className="px-6 pb-6 pt-0">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            {getTypeLabel(quiz.type)}
          </Badge>
          <span>{questionCount}문제</span>
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text font-medium text-transparent">
            {quiz.points_per_question}점/문제
          </span>
        </div>
        {quiz.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {quiz.description}
          </p>
        )}
        {quiz.time_limit && (
          <p className="mt-1 text-xs text-muted-foreground">
            제한시간: {quiz.time_limit}초
          </p>
        )}
      </div>
    </div>
  )
}
