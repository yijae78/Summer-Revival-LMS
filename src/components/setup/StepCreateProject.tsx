'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

interface StepCreateProjectProps {
  onNext: () => void
  onBack: () => void
}

export function StepCreateProject({ onNext, onBack }: StepCreateProjectProps) {
  return (
    <div>
      <h2 className="text-xl font-bold">프로젝트 만들기</h2>
      <p className="mt-1 text-muted-foreground">
        Supabase에서 새 프로젝트를 만들어요.
      </p>

      <div className="mt-6 space-y-4">
        <StepItem
          number={1}
          text='Dashboard에서 "New Project" 버튼을 눌러주세요'
        />
        <StepItem number={2} text="아래 정보를 입력하세요:" />
      </div>

      <div className="mt-4 space-y-3">
        <CopyField label="Project name" value="church-lms" />
        <CopyField label="Region" value="Northeast Asia (Tokyo)" />
      </div>

      <div className="mt-4 rounded-lg border-l-4 border-primary bg-primary/5 p-4">
        <p className="text-sm text-muted-foreground">
          💡 Database Password는 원하는 비밀번호를 자유롭게 설정하세요.
          프로젝트 생성에 1~2분 정도 걸려요.
        </p>
      </div>

      <div className="mt-4 space-y-4">
        <StepItem number={3} text='"Create new project"를 클릭하세요' />
        <StepItem number={4} text='프로젝트가 생성되면 다음 단계로 넘어가세요' />
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

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    toast.success('복사되었어요')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3">
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-mono text-sm font-medium">{value}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted"
        aria-label={`${value} 복사`}
      >
        {copied ? (
          <Check className="h-4 w-4 text-primary" />
        ) : (
          <Copy className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
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
