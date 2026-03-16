'use client'

import { cn } from '@/lib/utils'

const QUICK_QUESTIONS = [
  '오늘 일정 알려줘',
  '출석 현황 보여줘',
  '참가자 검색',
  '포인트 순위',
  '공지사항 확인',
  '조별 명단',
]

interface QuickChipsProps {
  onSelect: (question: string) => void
}

export function QuickChips({ onSelect }: QuickChipsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {QUICK_QUESTIONS.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onSelect(q)}
          className={cn(
            'rounded-full border border-border/50 bg-muted/50 px-3.5 py-2',
            'text-[0.8125rem] text-muted-foreground',
            'transition-colors duration-150',
            'hover:border-primary/30 hover:bg-primary/5 hover:text-primary',
            'active:scale-[0.97]',
            'min-h-[40px]'
          )}
        >
          {q}
        </button>
      ))}
    </div>
  )
}
