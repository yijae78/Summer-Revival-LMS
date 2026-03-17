'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Smartphone, Cloud, Eye, ArrowLeft } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAppModeStore } from '@/stores/appModeStore'
import { useDemoStore } from '@/stores/demoStore'
import { useEventStore } from '@/stores/eventStore'

import type { AppMode } from '@/stores/appModeStore'

interface ModeOption {
  id: AppMode
  icon: typeof Smartphone
  title: string
  description: string
  gradientFrom: string
  gradientTo: string
  glowColor: string
}

const MODE_OPTIONS: ModeOption[] = [
  {
    id: 'local',
    icon: Smartphone,
    title: '이 기기에서 바로 사용하기',
    description: '간단한 초기 설정 후 시작해요. 데이터는 이 기기에 저장돼요.',
    gradientFrom: 'rgba(56,189,248,0.15)',
    gradientTo: 'rgba(14,165,233,0.05)',
    glowColor: 'rgba(56,189,248,0.25)',
  },
  {
    id: 'cloud',
    icon: Cloud,
    title: '클라우드로 사용하기',
    description: '여러 기기에서 함께 사용해요. Supabase 연결이 필요해요.',
    gradientFrom: 'rgba(167,139,250,0.15)',
    gradientTo: 'rgba(139,92,246,0.05)',
    glowColor: 'rgba(167,139,250,0.25)',
  },
  {
    id: 'demo',
    icon: Eye,
    title: '데모로 둘러보기',
    description: '샘플 데이터로 먼저 체험해요. 수정은 저장되지 않아요.',
    gradientFrom: 'rgba(34,211,238,0.15)',
    gradientTo: 'rgba(6,182,212,0.05)',
    glowColor: 'rgba(34,211,238,0.25)',
  },
]

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const containerVariantsReduced = {
  hidden: {},
  show: {},
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const itemVariantsReduced = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
}

export default function StartPage() {
  const router = useRouter()
  const setMode = useAppModeStore((s) => s.setMode)
  const enableDemo = useDemoStore((s) => s.enableDemo)
  const setCurrentEventId = useEventStore((s) => s.setCurrentEventId)

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mql.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  function handleSelect(option: ModeOption) {
    switch (option.id) {
      case 'local': {
        router.push('/local-setup')
        break
      }
      case 'cloud': {
        setMode('cloud')
        router.push('/setup')
        break
      }
      case 'demo': {
        setMode('demo')
        enableDemo()
        setCurrentEventId('demo-event-1')
        router.push('/dashboard')
        break
      }
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Back link */}
      <motion.button
        type="button"
        onClick={() => router.push('/')}
        initial={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="absolute left-4 top-4 z-10 flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-xl text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background md:left-8 md:top-8"
        aria-label="뒤로 가기"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden md:inline">돌아가기</span>
      </motion.button>

      {/* Header */}
      <motion.div
        className="relative z-10 mb-10 text-center"
        initial={prefersReducedMotion ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <h1
          className="bg-clip-text text-3xl font-black uppercase leading-none tracking-[-0.02em] text-transparent md:text-4xl"
          style={{
            backgroundImage:
              'linear-gradient(90deg, #0ea5e9, #38bdf8, #7dd3fc, #38bdf8, #0ea5e9)',
            backgroundSize: '200% auto',
            animation: prefersReducedMotion ? 'none' : 'waterFlow 6s linear infinite',
          }}
        >
          Flowing
        </h1>
        <p className="mt-3 text-sm leading-[1.7] text-muted-foreground md:text-base">
          어떻게 사용하고 싶으세요?
        </p>
      </motion.div>

      {/* Mode cards */}
      <motion.div
        className="relative z-10 flex w-full max-w-lg flex-col gap-4"
        variants={prefersReducedMotion ? containerVariantsReduced : containerVariants}
        initial="hidden"
        animate="show"
      >
        {MODE_OPTIONS.map((option) => (
          <motion.button
            key={option.id}
            type="button"
            variants={prefersReducedMotion ? itemVariantsReduced : itemVariants}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.01 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            onClick={() => handleSelect(option)}
            className={cn(
              'group relative flex min-h-[5rem] w-full items-center gap-4 overflow-hidden rounded-2xl border border-white/[0.08] p-5 text-left backdrop-blur-xl transition-all duration-300',
              'hover:border-white/[0.15]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'
            )}
            style={{
              background: `linear-gradient(135deg, ${option.gradientFrom}, ${option.gradientTo})`,
            }}
          >
            {/* Hover glow */}
            <div
              className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                boxShadow: `0 0 30px ${option.glowColor}, inset 0 0 30px ${option.glowColor}`,
              }}
            />

            {/* Icon */}
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] transition-colors duration-300 group-hover:bg-white/[0.10]">
              <option.icon className="h-5 w-5 text-foreground/80" />
            </div>

            {/* Text */}
            <div className="relative min-w-0 flex-1">
              <p className="text-base font-bold leading-tight text-foreground">
                {option.title}
              </p>
              <p className="mt-1 text-sm leading-[1.6] text-muted-foreground">
                {option.description}
              </p>
            </div>

            {/* Arrow indicator */}
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.04] transition-all duration-300 group-hover:bg-white/[0.08] group-hover:translate-x-0.5">
              <svg
                className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Footer hint */}
      <motion.p
        className="relative z-10 mt-8 max-w-sm text-center text-xs leading-[1.7] text-muted-foreground/60"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.8, duration: 0.5 }}
      >
        나중에 언제든 설정에서 모드를 변경할 수 있어요
      </motion.p>
    </div>
  )
}
