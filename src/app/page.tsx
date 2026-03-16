'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCheck,
  Trophy,
  Users,
  Megaphone,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Monitor,
  Tablet,
  Smartphone,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useDemoStore } from '@/stores/demoStore'
import { useEventStore } from '@/stores/eventStore'

const FEATURES = [
  {
    icon: UserCheck,
    label: '출석',
    title: '실시간 출석 체크',
    description: '터치 한 번으로 출석 완료. 오프라인에서도 자동 저장되고, 온라인 복귀 시 동기화돼요.',
  },
  {
    icon: Trophy,
    label: '프로그램',
    title: '프로그램 관리',
    description: '행사 일정과 프로그램을 한눈에. 시간표 관리부터 진행 현황까지 깔끔하게.',
  },
  {
    icon: Users,
    label: '조/반 관리',
    title: '조·반 편성·관리',
    description: '균형 잡힌 자동 조/반 편성부터 조별 활동 점수, 미션 관리까지 한 곳에서.',
  },
  {
    icon: Megaphone,
    label: '공지',
    title: '실시간 공지사항',
    description: '긴급 공지부터 일정 변경까지 즉시 전달. 밴드·문자를 대체해요.',
  },
  {
    icon: ImageIcon,
    label: '갤러리',
    title: '포토 갤러리',
    description: '행사 사진을 실시간으로 공유하고, 조별·일자별로 추억을 정리하세요.',
  },
  {
    icon: Sparkles,
    label: 'AI',
    title: 'AI 어시스턴트',
    description: '"오늘 출석 안 한 사람?" — 일정, 출석, 퀴즈 결과를 AI에게 바로 물어보세요.',
  },
]

type Viewport = 'desktop' | 'tablet' | 'mobile'

const VIEWPORTS: { mode: Viewport; icon: typeof Monitor; label: string; width: string }[] = [
  { mode: 'desktop', icon: Monitor, label: '데스크톱', width: '100%' },
  { mode: 'tablet', icon: Tablet, label: '태블릿', width: '768px' },
  { mode: 'mobile', icon: Smartphone, label: '모바일', width: '375px' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

export default function LandingPage() {
  const router = useRouter()
  const navigate = () => router.push('/dashboard')
  const enableDemo = useDemoStore((s) => s.enableDemo)
  const setCurrentEventId = useEventStore((s) => s.setCurrentEventId)
  const [viewport, setViewport] = useState<Viewport>('desktop')

  const handleDemoMode = () => {
    enableDemo()
    setCurrentEventId('demo-event-1')
    router.push('/dashboard')
  }

  const isFramed = viewport !== 'desktop'
  const frameWidth = VIEWPORTS.find((v) => v.mode === viewport)?.width ?? '100%'

  return (
    <div className="relative min-h-dvh bg-background">
      {/* ── Viewport toggle ── */}
      <motion.div
        className="fixed right-4 top-4 z-50"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="flex items-center gap-0.5 rounded-full border border-white/[0.08] bg-white/[0.04] p-1 backdrop-blur-xl">
          {VIEWPORTS.map((v) => (
            <button
              key={v.mode}
              type="button"
              onClick={() => setViewport(v.mode)}
              aria-label={v.label}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200',
                viewport === v.mode
                  ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <v.icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Frame wrapper ── */}
      <div
        className={cn(
          'relative mx-auto flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 pb-40 transition-all duration-500 ease-out',
          isFramed && 'my-8 min-h-[calc(100dvh-4rem)] rounded-2xl border border-white/[0.08] shadow-[0_0_40px_rgba(0,0,0,0.3)]'
        )}
        style={{ maxWidth: frameWidth }}
      >
      {/* ── Ocean background: Caustics + Layered Waves ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Caustic light 1 — large, slow */}
        <div
          className="absolute h-[600px] w-[600px] rounded-full opacity-100"
          style={{
            top: '10%',
            left: '20%',
            background:
              'radial-gradient(circle, rgba(14,165,233,0.09) 0%, rgba(14,165,233,0.03) 40%, transparent 70%)',
            animation: 'causticsDrift1 20s ease-in-out infinite',
          }}
        />
        {/* Caustic light 2 — medium, different phase */}
        <div
          className="absolute h-[500px] w-[500px] rounded-full"
          style={{
            top: '30%',
            right: '10%',
            background:
              'radial-gradient(circle, rgba(34,211,238,0.07) 0%, rgba(34,211,238,0.02) 40%, transparent 70%)',
            animation: 'causticsDrift2 25s ease-in-out infinite',
          }}
        />
        {/* Caustic light 3 — small accent */}
        <div
          className="absolute h-[350px] w-[350px] rounded-full"
          style={{
            bottom: '20%',
            left: '40%',
            background:
              'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 60%)',
            animation: 'causticsDrift3 18s ease-in-out infinite',
          }}
        />

        {/* Layered waves — top area */}
        <svg
          className="absolute top-[15%] h-[120px] w-[200%] opacity-[0.04]"
          style={{ animation: 'waveFloat1 18s ease-in-out infinite' }}
          viewBox="0 0 2880 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 Q180,20 360,50 Q540,80 720,50 Q900,20 1080,50 Q1260,80 1440,50 Q1620,20 1800,50 Q1980,80 2160,50 Q2340,20 2520,50 Q2700,80 2880,50"
            fill="none"
            stroke="rgba(56,189,248,1)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Layered waves — middle area */}
        <svg
          className="absolute top-[40%] h-[120px] w-[200%] opacity-[0.06]"
          style={{ animation: 'waveFloat2 22s ease-in-out infinite' }}
          viewBox="0 0 2880 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 Q240,30 480,60 Q720,90 960,60 Q1200,30 1440,60 Q1680,90 1920,60 Q2160,30 2400,60 Q2640,90 2880,60"
            fill="none"
            stroke="rgba(34,211,238,1)"
            strokeWidth="1"
          />
        </svg>

        {/* Layered waves — lower area */}
        <svg
          className="absolute top-[65%] h-[120px] w-[200%] opacity-[0.05]"
          style={{ animation: 'waveFloat3 15s ease-in-out infinite' }}
          viewBox="0 0 2880 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 Q360,20 720,50 Q1080,80 1440,50 Q1800,20 2160,50 Q2520,80 2880,50"
            fill="none"
            stroke="rgba(56,189,248,1)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* ── Main content ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Brand badge — TRINITY AI FORUM */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="relative mb-8"
        >
          <div
            className="absolute -inset-px rounded-full"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(56,189,248,0.3), rgba(34,211,238,0.3), rgba(167,139,250,0.3), transparent)',
              backgroundSize: '200% 100%',
              animation: 'textShimmer 4s linear infinite',
            }}
          />
          <div
            className="relative inline-flex items-center gap-2.5 rounded-full bg-[#0c0e14] px-5 py-2 backdrop-blur-md"
            style={{ animation: 'glowPulse 3s ease-in-out infinite' }}
          >
            <span className="relative flex h-2 w-2">
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-primary"
                animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span
              className="bg-clip-text text-[0.75rem] font-bold uppercase tracking-[0.25em] text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #8892a8, #38bdf8, #22d3ee, #a78bfa, #8892a8)',
                backgroundSize: '200% auto',
                animation: 'textShimmer 3s linear infinite',
              }}
            >
              Trinity AI Forum
            </span>
          </div>
        </motion.div>

        {/* Tagline — sits right above FLOWING, width-matched */}
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="mt-4 w-full text-center text-base font-semibold tracking-[0.08em] text-foreground/70 md:text-lg"
        >
          여름행사의 모든 것을{' '}
          <span
            className="inline-block text-[#ff4d6a]"
            style={{
              animation: 'heartbeat 1.5s ease-in-out infinite',
            }}
          >
            &ldquo;하나로&rdquo;
          </span>{' '}
          흘러가게 하세요
        </motion.p>

        {/* App name — FLOWING */}
        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="bg-clip-text text-[4.5rem] font-black uppercase leading-none tracking-[-0.03em] text-transparent md:text-[6rem] lg:text-[7.5rem]"
          style={{
            backgroundImage:
              'linear-gradient(90deg, #075985, #0ea5e9, #38bdf8, #7dd3fc, #e0f2fe, #7dd3fc, #38bdf8, #0ea5e9, #075985)',
            backgroundSize: '300% auto',
            animation: 'waterFlow 6s linear infinite',
          }}
        >
          Flowing
        </motion.h1>

        {/* LMS subtitle */}
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="mt-1 text-[0.6875rem] uppercase tracking-[0.3em] text-muted-foreground/40"
        >
          <span className="font-bold text-primary">L</span>earning{' '}
          <span className="font-bold text-primary">M</span>anagement{' '}
          <span className="font-bold text-primary">S</span>ystem
        </motion.p>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="mt-6 max-w-sm text-sm leading-[1.7] text-muted-foreground"
        >
          수련회 · 성경학교 · 캠프 — 출석, 프로그램, 공지까지 하나로
        </motion.p>

        {/* CTA */}
        <motion.button
          variants={fadeUp}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={navigate}
          className="mt-10 inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-bold text-primary-foreground shadow-[0_0_30px_rgba(56,189,248,0.25)] transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(56,189,248,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          시작하기
          <ArrowRight className="h-4 w-4" />
        </motion.button>

        {/* Demo mode link */}
        <motion.button
          variants={fadeUp}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          type="button"
          onClick={handleDemoMode}
          className="mt-3 text-sm text-muted-foreground transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          데모로 둘러보기
        </motion.button>
      </motion.div>

      {/* ── Feature bar + detail ── */}
      <FeatureBar />

      {/* Footer */}
      <motion.p
        className="absolute bottom-3 z-20 text-xs font-semibold text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        Developed by Yijae Shin
      </motion.p>

      {/* Wave decoration (bottom) — 4 layers, vivid */}
      <div className="pointer-events-none absolute -bottom-px left-0 right-0 h-44 overflow-hidden">
        {/* Glow base */}
        <div
          className="absolute bottom-0 left-0 right-0 h-full"
          style={{
            background:
              'linear-gradient(to top, rgba(56,189,248,0.12), rgba(34,211,238,0.04) 60%, transparent)',
          }}
        />
        {/* Wave 1 — front, brightest */}
        <svg
          className="absolute bottom-0 h-full w-[200%]"
          style={{ animation: 'waveSlide 10s linear infinite' }}
          viewBox="0 0 2880 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,45 Q180,15 360,45 Q540,75 720,45 Q900,15 1080,45 Q1260,75 1440,45 Q1620,15 1800,45 Q1980,75 2160,45 Q2340,15 2520,45 Q2700,75 2880,45 L2880,100 L0,100 Z"
            fill="url(#waveGrad1)"
          />
          <defs>
            <linearGradient id="waveGrad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.08" />
            </linearGradient>
          </defs>
        </svg>
        {/* Wave 2 — mid, cyan */}
        <svg
          className="absolute bottom-0 h-full w-[200%]"
          style={{ animation: 'waveSlide 16s linear infinite reverse' }}
          viewBox="0 0 2880 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 Q240,30 480,60 Q720,90 960,60 Q1200,30 1440,60 Q1680,90 1920,60 Q2160,30 2400,60 Q2640,90 2880,60 L2880,100 L0,100 Z"
            fill="url(#waveGrad2)"
          />
          <defs>
            <linearGradient id="waveGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
        {/* Wave 3 — back, violet accent */}
        <svg
          className="absolute bottom-0 h-full w-[200%]"
          style={{ animation: 'waveSlide 22s linear infinite' }}
          viewBox="0 0 2880 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,70 Q360,45 720,70 Q1080,95 1440,70 Q1800,45 2160,70 Q2520,95 2880,70 L2880,100 L0,100 Z"
            fill="url(#waveGrad3)"
          />
          <defs>
            <linearGradient id="waveGrad3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.03" />
            </linearGradient>
          </defs>
        </svg>
        {/* Wave 4 — foam highlight at very bottom */}
        <svg
          className="absolute bottom-0 h-[40%] w-[200%]"
          style={{ animation: 'waveSlide 8s linear infinite reverse' }}
          viewBox="0 0 2880 40"
          preserveAspectRatio="none"
        >
          <path
            d="M0,20 Q180,8 360,20 Q540,32 720,20 Q900,8 1080,20 Q1260,32 1440,20 Q1620,8 1800,20 Q1980,32 2160,20 Q2340,8 2520,20 Q2700,32 2880,20 L2880,40 L0,40 Z"
            fill="rgba(224,242,254,0.08)"
          />
        </svg>
      </div>
      </div>
    </div>
  )
}

/* ── Feature bar component ── */
function FeatureBar() {
  const [active, setActive] = useState<number | null>(null)
  const selected = active !== null ? FEATURES[active] : null

  return (
    <motion.div
      className="absolute bottom-40 z-10 flex w-full max-w-lg flex-col items-center gap-3 px-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Detail card */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.label}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-xl"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <selected.icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {selected.title}
                </p>
                <p className="mt-1 text-[0.8125rem] leading-[1.6] text-muted-foreground">
                  {selected.description}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon bar */}
      <div className="grid w-full grid-cols-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-2 py-2.5 backdrop-blur-md">
        {FEATURES.map((f, i) => {
          const isActive = active === i
          return (
            <button
              key={f.label}
              type="button"
              onClick={() => setActive(isActive ? null : i)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl py-1.5 transition-all duration-200',
                isActive
                  ? 'bg-primary/10'
                  : 'hover:bg-white/[0.04]'
              )}
            >
              <f.icon
                className={cn(
                  'h-[18px] w-[18px] transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-primary/50'
                )}
              />
              <span
                className={cn(
                  'text-[0.625rem] font-medium transition-colors duration-200',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {f.label}
              </span>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
