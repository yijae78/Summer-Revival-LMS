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
        'cursor-pointer rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(56,189,248,0.1)] active:scale-[0.98]',
        quiz.is_active &&
          'border-primary/40 bg-primary/10 shadow-[0_0_16px_rgba(56,189,248,0.15)]',
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
            className="shrink-0"
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
          <span className="text-primary font-medium">
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
