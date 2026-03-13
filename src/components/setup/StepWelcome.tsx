import { Tent } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface StepWelcomeProps {
  onNext: () => void
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
        <Tent className="h-10 w-10 text-primary" />
      </div>

      <h1 className="mt-6 text-2xl font-bold">환영해요!</h1>
      <p className="mt-2 text-muted-foreground">
        교회 여름행사를 쉽게 관리할 수 있도록 도와드릴게요.
      </p>

      <div className="mt-8 w-full space-y-3 text-left">
        <InfoItem emoji="📎" text="약 5분이면 충분해요" />
        <InfoItem emoji="💰" text="완전 무료예요" />
        <InfoItem emoji="🔒" text="교회 데이터는 교회 계정에 안전하게 저장돼요" />
      </div>

      <Button onClick={onNext} className="mt-8 h-12 w-full text-base">
        시작하기
      </Button>
    </div>
  )
}

function InfoItem({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
      <span className="text-lg" role="img">{emoji}</span>
      <span className="text-[0.9375rem]">{text}</span>
    </div>
  )
}
