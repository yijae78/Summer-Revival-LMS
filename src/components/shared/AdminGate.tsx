'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdminAuthStore } from '@/stores/adminAuthStore'
import { cn } from '@/lib/utils'

interface AdminGateProps {
  children: React.ReactNode
}

export function AdminGate({ children }: AdminGateProps) {
  const { passwordHash, isAuthenticated, verifyPassword, authenticate } = useAdminAuthStore()
  const [input, setInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isShaking, setIsShaking] = useState(false)

  // No password set → pass through
  if (!passwordHash) return <>{children}</>

  // Already authenticated this session → pass through
  if (isAuthenticated) return <>{children}</>

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (verifyPassword(input)) {
      authenticate()
      toast.success('관리자 인증에 성공했어요')
    } else {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      toast.error('비밀번호가 일치하지 않아요')
      setInput('')
    }
  }

  return (
    <div className="flex min-h-[60dvh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'w-full max-w-sm rounded-3xl border border-sky-500/15 bg-gradient-to-br from-sky-500/10 to-blue-500/5 p-8 backdrop-blur-xl',
          isShaking && 'animate-[shake_0.5s_ease-in-out]'
        )}
      >
        {/* Lock icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20">
            <Lock className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="mt-5 text-center text-lg font-bold text-foreground">
          관리자 인증
        </h2>
        <p className="mt-1.5 text-center text-sm text-muted-foreground">
          비밀번호를 입력해야 접근할 수 있어요
        </p>

        {/* Password form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="관리자 비밀번호를 입력하세요"
              autoFocus
              className="h-12 rounded-xl border-white/[0.08] bg-white/[0.03] pr-12 text-center text-lg tracking-widest backdrop-blur-sm focus:border-sky-500/30 focus:ring-2 focus:ring-sky-500/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={!input.trim()}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:shadow-xl hover:shadow-sky-500/30 disabled:opacity-40"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            확인
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground/60">
          비밀번호는 설정에서 변경할 수 있어요
        </p>
      </motion.div>
    </div>
  )
}
