import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md active:scale-[0.98]',
        quiz.is_active &&
          'border-primary/50 shadow-[0_0_12px_-3px] shadow-primary/20',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base leading-snug">
            {quiz.title}
          </CardTitle>
          <Badge
            variant={quiz.is_active ? 'default' : 'secondary'}
            className="shrink-0"
          >
            {quiz.is_active ? '활성' : '비활성'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
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
      </CardContent>
    </Card>
  )
}
