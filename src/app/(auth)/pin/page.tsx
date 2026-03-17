'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

export default function PinPage() {
  const [inviteCode, setInviteCode] = useState('')
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const isFormValid = inviteCode.trim().length > 0 && name.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(birthDate)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isFormValid || isVerifying) return

    setIsVerifying(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode: inviteCode.trim(),
          name: name.trim(),
          birthDate,
        }),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else if (response.status === 429) {
        setError('시도 횟수를 초과했어요. 10분 후 다시 시도해 주세요.')
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([50, 30, 50, 30, 50])
        }
      } else {
        setError('정보가 일치하지 않아요. 다시 확인해 주세요.')
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([50, 30, 50, 30, 50])
        }
      }
    } catch {
      setError('연결에 문제가 생겼어요. 다시 시도해 주세요.')
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 30, 50, 30, 50])
      }
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Header */}
      <div className="flex w-full items-center">
        <Link
          href="/login"
          className="inline-flex h-12 w-12 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      {/* Title */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-foreground">초대코드로 입장</h1>
        <p className="text-[0.9375rem] text-muted-foreground">
          행사 초대코드와 본인 정보를 입력해 주세요
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <div className="space-y-2">
          <label htmlFor="invite-code" className="text-sm font-medium text-foreground">
            초대코드
          </label>
          <input
            id="invite-code"
            type="text"
            value={inviteCode}
            onChange={(e) => {
              setError(null)
              setInviteCode(e.target.value)
            }}
            placeholder="행사 초대코드를 입력해 주세요"
            disabled={isVerifying}
            aria-label="초대 코드"
            className={cn(
              'min-h-[48px] w-full rounded-xl border border-border/50 bg-background px-4 py-3',
              'text-[0.9375rem] leading-[1.7] placeholder:text-muted-foreground/50',
              'focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-colors duration-150',
              error && 'border-destructive'
            )}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            이름
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => {
              setError(null)
              setName(e.target.value)
            }}
            placeholder="등록된 이름을 입력해 주세요"
            disabled={isVerifying}
            aria-label="이름"
            className={cn(
              'min-h-[48px] w-full rounded-xl border border-border/50 bg-background px-4 py-3',
              'text-[0.9375rem] leading-[1.7] placeholder:text-muted-foreground/50',
              'focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-colors duration-150',
              error && 'border-destructive'
            )}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="birth-date" className="text-sm font-medium text-foreground">
            생년월일
          </label>
          <input
            id="birth-date"
            type="date"
            value={birthDate}
            onChange={(e) => {
              setError(null)
              setBirthDate(e.target.value)
            }}
            disabled={isVerifying}
            aria-label="생년월일"
            className={cn(
              'min-h-[48px] w-full rounded-xl border border-border/50 bg-background px-4 py-3',
              'text-[0.9375rem] leading-[1.7] placeholder:text-muted-foreground/50',
              'focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-colors duration-150',
              error && 'border-destructive'
            )}
          />
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <button
          type="submit"
          disabled={!isFormValid || isVerifying}
          className={cn(
            'inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl',
            'bg-primary text-[0.9375rem] font-medium text-primary-foreground',
            'transition-all duration-150',
            'hover:bg-primary/90 active:scale-[0.98]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          )}
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              확인 중...
            </>
          ) : (
            '입장하기'
          )}
        </button>
      </form>
    </div>
  )
}
