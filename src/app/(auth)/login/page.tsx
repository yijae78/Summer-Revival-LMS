'use client'

import Link from 'next/link'

import { KakaoLoginButton } from '@/components/auth/KakaoLoginButton'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center gap-8">
      {/* App Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground">로그인</h1>
        <p className="text-[0.9375rem] text-muted-foreground">
          여름행사 LMS에 오신 것을 환영해요
        </p>
      </div>

      {/* Social Login Buttons */}
      <div className="flex w-full flex-col gap-3">
        <KakaoLoginButton />
        <GoogleLoginButton />
      </div>

      {/* Divider */}
      <div className="flex w-full items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm text-muted-foreground">또는</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* PIN Login Link */}
      <Link
        href="/pin"
        className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-border bg-background text-[0.9375rem] font-medium text-foreground transition-colors hover:bg-muted active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        PIN으로 입장
      </Link>
    </div>
  )
}
