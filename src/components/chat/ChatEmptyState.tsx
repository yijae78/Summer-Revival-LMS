'use client'

import { Bot } from 'lucide-react'

import { QuickChips } from '@/components/chat/QuickChips'

interface ChatEmptyStateProps {
  onQuickQuestion: (question: string) => void
}

export function ChatEmptyState({ onQuickQuestion }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Bot className="h-7 w-7 text-primary" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-foreground">
        무엇이든 물어보세요
      </h3>
      <p className="mt-1.5 text-center text-sm leading-[1.7] text-muted-foreground" style={{ wordBreak: 'keep-all' }}>
        참가자 검색, 출석 현황, 일정 확인 등
        <br />
        행사 관련 궁금한 것을 AI에게 물어보세요.
      </p>

      <div className="mt-6 w-full">
        <QuickChips onSelect={onQuickQuestion} />
      </div>
    </div>
  )
}
