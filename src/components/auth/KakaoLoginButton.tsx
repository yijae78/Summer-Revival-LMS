'use client'

import { useState } from 'react'

import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

function KakaoSymbol({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.725 1.794 5.117 4.503 6.476l-.853 3.1a.344.344 0 00.531.374l3.635-2.417c.71.097 1.44.148 2.184.148 5.523 0 10-3.463 10-7.691C22 6.463 17.523 3 12 3z" />
    </svg>
  )
}

export function KakaoLoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { signInWithKakao } = useAuth()

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await signInWithKakao()
    } catch {
      toast.error('카카오 로그인에 실패했어요. 다시 시도해 주세요.')
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        'inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-[0.9375rem] font-medium text-[#191919] transition-colors hover:bg-[#FEE500]/90 active:scale-[0.98]',
        isLoading && 'cursor-not-allowed opacity-70'
      )}
    >
      <KakaoSymbol className="h-5 w-5" />
      {isLoading ? '로그인 중...' : '카카오 로그인'}
    </button>
  )
}
