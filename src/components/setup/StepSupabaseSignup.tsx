import { ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface StepSupabaseSignupProps {
  onNext: () => void
  onBack: () => void
}

export function StepSupabaseSignup({ onNext, onBack }: StepSupabaseSignupProps) {
  return (
    <div>
      <h2 className="text-xl font-bold">Supabase 가입하기</h2>
      <p className="mt-1 text-muted-foreground">
        데이터를 저장할 무료 서비스에 가입해요.
      </p>

      <div className="mt-6 space-y-4">
        <StepItem number={1} text='아래 버튼을 눌러 Supabase 사이트를 열어주세요' />
        <StepItem number={2} text='"Continue with GitHub" 또는 "Continue with Google"을 눌러 가입하세요' />
        <StepItem number={3} text='가입이 완료되면 다음 단계로 넘어가세요' />
      </div>

      <a
        href="https://supabase.com/dashboard"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3ECF8E] text-base font-medium text-white transition-colors hover:bg-[#36b87e] active:scale-[0.98]"
      >
        Supabase 가입 페이지 열기
        <ExternalLink className="h-4 w-4" />
      </a>

      <div className="mt-6 rounded-lg border-l-4 border-primary bg-primary/5 p-4">
        <p className="text-sm text-muted-foreground">
          💡 GitHub 계정이 없으시면 Google 계정으로도 가입할 수 있어요.
          이미 Supabase 계정이 있다면 이 단계를 건너뛰세요.
        </p>
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1 text-base">
          이전
        </Button>
        <Button onClick={onNext} className="h-12 flex-1 text-base">
          다음
        </Button>
      </div>
    </div>
  )
}

function StepItem({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
        {number}
      </div>
      <p className="pt-0.5 text-[0.9375rem]">{text}</p>
    </div>
  )
}
