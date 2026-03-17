'use client'

import { useState, useId } from 'react'
import { Lock, Eye, EyeOff, ShieldCheck, Phone, KeyRound } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdminAuthStore } from '@/stores/adminAuthStore'
import { cn } from '@/lib/utils'

interface AdminGateProps {
  children: React.ReactNode
}

// Each AdminGate instance requires its own password entry.
// When the component mounts (page navigation), unlocked starts as false.
export function AdminGate({ children }: AdminGateProps) {
  const { passwordHash, recoveryPhone, verifyPassword, resetPasswordWithPhone, setPassword } = useAdminAuthStore()
  const gateId = useId()
  const [unlocked, setUnlocked] = useState(false)
  const [input, setInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [showRecovery, setShowRecovery] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [newPw, setNewPw] = useState('')
  const [newPwConfirm, setNewPwConfirm] = useState('')

  // No password set — allow access
  if (!passwordHash) return <>{children}</>

  // Already unlocked for this page visit
  if (unlocked) return <>{children}</>

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (verifyPassword(input)) {
      setUnlocked(true)
      toast.success('관리자 인증에 성공했어요')
    } else {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      toast.error('비밀번호가 일치하지 않아요')
      setInput('')
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 30, 50, 30, 50])
      }
    }
  }

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw.length < 4) {
      toast.error('새 비밀번호는 4자리 이상이어야 해요')
      return
    }
    if (newPw !== newPwConfirm) {
      toast.error('새 비밀번호가 일치하지 않아요')
      return
    }

    if (recoveryPhone) {
      const success = resetPasswordWithPhone(phoneInput, newPw)
      if (!success) {
        setIsShaking(true)
        setTimeout(() => setIsShaking(false), 500)
        toast.error('전화번호가 일치하지 않아요')
        return
      }
    } else {
      setPassword(newPw)
    }

    setUnlocked(true)
    toast.success('비밀번호가 재설정되었어요')
  }

  return (
    <div className="flex min-h-[60dvh] items-center justify-center px-4" key={gateId}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'w-full max-w-sm rounded-3xl border border-sky-500/15 bg-gradient-to-br from-sky-500/10 to-blue-500/5 p-8 backdrop-blur-xl',
          isShaking && 'animate-[shake_0.5s_ease-in-out]'
        )}
      >
        <AnimatePresence mode="wait">
          {!showRecovery ? (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20">
                  <Lock className="h-7 w-7 text-white" />
                </div>
              </div>

              <h2 className="mt-5 text-center text-lg font-bold text-foreground">관리자 인증</h2>
              <p className="mt-1.5 text-center text-sm text-muted-foreground">비밀번호를 입력해야 접근할 수 있어요</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="관리자 비밀번호"
                    autoFocus
                    aria-label="관리자 비밀번호"
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
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-sm font-bold text-white shadow-lg shadow-sky-500/20 disabled:opacity-40"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  확인
                </Button>
              </form>

              <button
                type="button"
                onClick={() => setShowRecovery(true)}
                className="mt-4 w-full text-center text-xs text-muted-foreground/60 transition-colors hover:text-primary"
              >
                비밀번호를 잊으셨나요?
              </button>
            </motion.div>
          ) : (
            <motion.div key="recovery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
                  <KeyRound className="h-7 w-7 text-white" />
                </div>
              </div>

              <h2 className="mt-5 text-center text-lg font-bold text-foreground">비밀번호 재설정</h2>
              <p className="mt-1.5 text-center text-sm text-muted-foreground">
                {recoveryPhone ? '등록된 전화번호로 본인 확인 후 재설정해요' : '새 비밀번호를 설정해 주세요'}
              </p>

              <form onSubmit={handleRecovery} className="mt-6 space-y-3">
                {recoveryPhone && (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="tel"
                      inputMode="numeric"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="등록된 전화번호 입력"
                      autoFocus
                      aria-label="등록된 전화번호"
                      className="h-12 rounded-xl border-white/[0.08] bg-white/[0.03] pl-10 backdrop-blur-sm focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/10"
                    />
                  </div>
                )}

                <Input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="새 비밀번호 (4자리 이상)"
                  autoFocus={!recoveryPhone}
                  aria-label="새 비밀번호"
                  className="h-12 rounded-xl border-white/[0.08] bg-white/[0.03] backdrop-blur-sm focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/10"
                />

                <Input
                  type="password"
                  value={newPwConfirm}
                  onChange={(e) => setNewPwConfirm(e.target.value)}
                  placeholder="새 비밀번호 확인"
                  aria-label="새 비밀번호 확인"
                  className="h-12 rounded-xl border-white/[0.08] bg-white/[0.03] backdrop-blur-sm focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/10"
                />

                <Button
                  type="submit"
                  disabled={!newPw.trim() || !newPwConfirm.trim() || (!!recoveryPhone && !phoneInput.trim())}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-sm font-bold text-white shadow-lg shadow-amber-500/20 disabled:opacity-40"
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  비밀번호 재설정
                </Button>
              </form>

              <button
                type="button"
                onClick={() => setShowRecovery(false)}
                className="mt-4 w-full text-center text-xs text-muted-foreground/60 transition-colors hover:text-primary"
              >
                비밀번호 입력으로 돌아가기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
