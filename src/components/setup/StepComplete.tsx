'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PartyPopper } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function StepComplete() {
  const router = useRouter()
  const [churchName, setChurchName] = useState('')

  function handleStart() {
    // Store church name for later use
    if (churchName.trim() && typeof window !== 'undefined') {
      localStorage.setItem('church_name', churchName.trim())
    }
    router.push('/dashboard')
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
        <PartyPopper className="h-10 w-10 text-primary" />
      </div>

      <h1 className="mt-6 text-2xl font-bold">설정이 완료되었어요!</h1>
      <p className="mt-2 text-muted-foreground">
        모든 준비가 끝났어요. 이제 행사를 만들어 볼까요?
      </p>

      <div className="mt-8 w-full space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="church-name" className="text-base">
            교회명
          </Label>
          <Input
            id="church-name"
            placeholder="예: ○○교회"
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
            className="h-12 text-base"
          />
        </div>
      </div>

      <Button onClick={handleStart} className="mt-8 h-12 w-full text-base">
        행사 만들기 시작
      </Button>
    </div>
  )
}
