'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, ClipboardCheck, Calendar, Trophy, Megaphone, Camera,
  ChevronRight, TrendingUp, Flame, Sparkles, Zap,
  Heart, Music, BookOpen, Star, Award, Gamepad2,
  Sun, Moon, Coffee, Waves,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }

type Concept = 'A' | 'B' | 'C'

export default function DesignPreviewPage() {
  const [concept, setConcept] = useState<Concept>('A')

  return (
    <div className={cn(
      'min-h-dvh transition-colors duration-500',
      concept === 'A' && 'bg-[#0a0a0f]',
      concept === 'B' && 'bg-[#1a1512]',
      concept === 'C' && 'bg-[#0f172a]',
    )}>
      {/* Selector */}
      <div className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-sm font-bold text-white/80">디자인 프리뷰</h1>
          <div className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-1">
            {(['A', 'B', 'C'] as Concept[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setConcept(c)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-300',
                  concept === c && c === 'A' && 'bg-[#00ff87] text-black shadow-[0_0_20px_rgba(0,255,135,0.3)]',
                  concept === c && c === 'B' && 'bg-[#f59e0b] text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]',
                  concept === c && c === 'C' && 'bg-gradient-to-r from-[#818cf8] to-[#e879f9] text-white shadow-[0_0_20px_rgba(129,140,248,0.3)]',
                  concept !== c && 'text-white/50 hover:text-white/80',
                )}
              >
                {c === 'A' ? 'Neon Pulse' : c === 'B' ? 'Warm Sunrise' : 'Vivid Glass'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {concept === 'A' && <ConceptA key="A" />}
        {concept === 'B' && <ConceptB key="B" />}
        {concept === 'C' && <ConceptC key="C" />}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   A — "Neon Pulse" (네온 펄스)
   사이버펑크 / 게이밍. 네온 그린 + 핫핑크 + 일렉트릭 블루.
   날카로운 모서리, 글리치 느낌, 프로그레스 바, XP 레벨.
   청소년부가 열광할 디자인.
   ═══════════════════════════════════════════════════ */
function ConceptA() {
  const neonGreen = '#00ff87'
  const hotPink = '#ff006e'
  const electricBlue = '#00b4d8'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="mx-auto max-w-5xl px-4 py-8">

      {/* Neon grid background */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(0,255,135,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,135,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* Label */}
        <motion.div variants={fadeUp}>
          <div className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5"
            style={{ borderColor: neonGreen + '40', backgroundColor: neonGreen + '10' }}>
            <Gamepad2 className="h-3.5 w-3.5" style={{ color: neonGreen }} />
            <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: neonGreen }}>Neon Pulse</span>
          </div>
          <p className="mt-2 text-sm text-white/50">게이밍 감성의 사이버펑크 대시보드. 네온 라이트가 빛나는 인터페이스.</p>
        </motion.div>

        {/* Welcome Banner — Neon border */}
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-lg border p-6"
          style={{ borderColor: neonGreen + '30', background: `linear-gradient(135deg, ${neonGreen}08, ${hotPink}05, ${electricBlue}08)` }}>
          {/* Scanning line animation */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${neonGreen}40, transparent)`, animation: 'waveFloat1 3s ease-in-out infinite', top: '30%' }} />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: neonGreen, boxShadow: `0 0 8px ${neonGreen}` }} />
              <span className="text-xs font-mono uppercase tracking-widest" style={{ color: neonGreen }}>System Online</span>
            </div>
            <h2 className="mt-3 text-2xl font-black text-white">2026 여름수련회</h2>
            <p className="mt-1 text-sm text-white/40">D-127 · 속초 은혜수련원</p>
            {/* XP Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-white/50">행사 준비도</span>
                <span className="font-mono font-bold" style={{ color: neonGreen }}>72%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: '72%' }} transition={{ duration: 1.5, ease: 'easeOut' }}
                  style={{ background: `linear-gradient(90deg, ${neonGreen}, ${electricBlue})`, boxShadow: `0 0 12px ${neonGreen}60` }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats — Neon cards with sharp corners */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: '참가자', value: '128', icon: Users, color: neonGreen, glow: `0 0 20px ${neonGreen}15` },
            { label: '출석률', value: '94%', icon: ClipboardCheck, color: electricBlue, glow: `0 0 20px ${electricBlue}15` },
            { label: '퀴즈 점수', value: '860', icon: Zap, color: hotPink, glow: `0 0 20px ${hotPink}15` },
            { label: '1위 조', value: '사랑', icon: Trophy, color: '#fbbf24', glow: '0 0 20px rgba(251,191,36,0.15)' },
          ].map((stat) => (
            <div key={stat.label} className="group relative overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 transition-all duration-300 hover:border-opacity-40"
              style={{ ['--card-color' as string]: stat.color }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = stat.color + '40'; e.currentTarget.style.boxShadow = stat.glow }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}>
              <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              <p className="mt-2 text-xs font-mono uppercase tracking-wider text-white/40">{stat.label}</p>
              <p className="mt-1 text-2xl font-black text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Quick Actions — Neon icon buttons */}
        <motion.div variants={fadeUp}>
          <p className="mb-3 text-xs font-mono uppercase tracking-widest text-white/30">Quick Access</p>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
            {[
              { icon: Users, label: '참가자', c: neonGreen },
              { icon: Calendar, label: '일정', c: electricBlue },
              { icon: ClipboardCheck, label: '출석', c: hotPink },
              { icon: Zap, label: '퀴즈', c: '#fbbf24' },
              { icon: Megaphone, label: '공지', c: '#f472b6' },
              { icon: Camera, label: '갤러리', c: '#a78bfa' },
            ].map((item) => (
              <motion.button key={item.label} type="button"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-all duration-200 hover:bg-white/[0.05]"
                style={{ ['--hover-color' as string]: item.c }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border" style={{ borderColor: item.c + '30', backgroundColor: item.c + '10' }}>
                  <item.icon className="h-5 w-5" style={{ color: item.c }} />
                </div>
                <span className="text-[0.625rem] font-mono text-white/50">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Leaderboard — Gaming style */}
        <motion.div variants={fadeUp} className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-5">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4" style={{ color: '#fbbf24' }} />
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Leaderboard</h3>
          </div>
          <div className="mt-4 space-y-2">
            {[
              { rank: 1, name: '1조 사랑', pts: 120, color: neonGreen, bar: 100 },
              { rank: 2, name: '3조 소망', pts: 110, color: electricBlue, bar: 91 },
              { rank: 3, name: '2조 믿음', pts: 95, color: hotPink, bar: 79 },
              { rank: 4, name: '4조 기쁨', pts: 85, color: '#fbbf24', bar: 70 },
            ].map((team) => (
              <div key={team.rank} className="flex items-center gap-3">
                <span className="w-6 text-center text-sm font-black" style={{ color: team.color }}>#{team.rank}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white/80">{team.name}</span>
                    <span className="text-xs font-mono font-bold" style={{ color: team.color }}>{team.pts}pt</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${team.bar}%` }}
                      transition={{ duration: 1, delay: team.rank * 0.15 }}
                      style={{ backgroundColor: team.color, boxShadow: `0 0 8px ${team.color}40` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════
   B — "Warm Sunrise" (따뜻한 새벽)
   따뜻한 어스톤. 코랄 + 피치 + 소프트 골드 + 세이지.
   유기적 둥근 형태, 자연 영감, 경건하고 포근한 느낌.
   전연령 범용. 부모님/어른도 편안하게.
   ═══════════════════════════════════════════════════ */
function ConceptB() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="mx-auto max-w-5xl px-4 py-8">

      {/* Warm ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-20 top-[10%] h-[500px] w-[500px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.08) 0%, transparent 70%)', animation: 'causticsDrift1 30s ease-in-out infinite' }} />
        <div className="absolute -left-10 bottom-[20%] h-[400px] w-[400px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.06) 0%, transparent 70%)', animation: 'causticsDrift2 35s ease-in-out infinite' }} />
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
        {/* Label */}
        <motion.div variants={fadeUp}>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/5 px-4 py-1.5">
            <Sun className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-xs font-bold tracking-wider text-orange-400">WARM SUNRISE</span>
          </div>
          <p className="mt-2 text-sm text-[#a8998a]">따뜻한 새벽 감성. 경건하면서도 포근한, 모든 세대를 위한 디자인.</p>
        </motion.div>

        {/* Welcome — Warm gradient card */}
        <motion.div variants={fadeUp} className="overflow-hidden rounded-[28px] border border-orange-900/20 p-6"
          style={{ background: 'linear-gradient(135deg, rgba(251,146,60,0.12) 0%, rgba(244,114,182,0.06) 50%, rgba(253,186,116,0.08) 100%)' }}>
          <div className="flex items-center gap-2">
            <Coffee className="h-4 w-4 text-orange-300/70" />
            <span className="text-xs font-medium text-orange-300/70">좋은 아침이에요</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-[#fde8d4]">2026 여름수련회</h2>
          <p className="mt-1 text-sm text-[#a8998a]">속초 은혜수련원 · 7월 20일 - 23일</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-400/10 px-3 py-1.5">
            <Heart className="h-3 w-3 text-orange-300" />
            <span className="text-xs font-medium text-orange-300">D-127 남았어요</span>
          </div>
        </motion.div>

        {/* Stats — Warm earth tones, very rounded */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: '참가자', value: '128', sub: '명', icon: Users, bg: 'from-orange-500/10 to-orange-600/5', iconColor: 'text-orange-400', iconBg: 'bg-orange-500/10' },
            { label: '출석률', value: '94', sub: '%', icon: ClipboardCheck, bg: 'from-emerald-500/10 to-emerald-600/5', iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/10' },
            { label: '프로그램', value: '19', sub: '개', icon: Calendar, bg: 'from-pink-500/10 to-pink-600/5', iconColor: 'text-pink-400', iconBg: 'bg-pink-500/10' },
            { label: '포인트', value: '1,240', sub: 'pt', icon: Star, bg: 'from-amber-500/10 to-amber-600/5', iconColor: 'text-amber-400', iconBg: 'bg-amber-500/10' },
          ].map((stat) => (
            <div key={stat.label} className={cn('relative overflow-hidden rounded-[22px] border border-white/[0.05] p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl', 'bg-gradient-to-br', stat.bg)}>
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', stat.iconBg)}>
                <stat.icon className={cn('h-5 w-5', stat.iconColor)} />
              </div>
              <p className="mt-4 text-xs font-medium text-[#a8998a]">{stat.label}</p>
              <p className="mt-0.5 flex items-baseline gap-0.5">
                <span className="text-3xl font-bold text-[#fde8d4]">{stat.value}</span>
                <span className="text-sm text-[#a8998a]">{stat.sub}</span>
              </p>
            </div>
          ))}
        </motion.div>

        {/* Schedule — Warm timeline */}
        <motion.div variants={fadeUp}>
          <h3 className="mb-4 text-lg font-bold text-[#fde8d4]">오늘의 일정</h3>
          <div className="space-y-2">
            {[
              { time: '09:00', title: '새벽 기도', icon: Sun, color: 'border-l-orange-400', iconBg: 'bg-orange-400/10', iconC: 'text-orange-400' },
              { time: '10:00', title: '성경공부 — 요한복음', icon: BookOpen, color: 'border-l-pink-400', iconBg: 'bg-pink-400/10', iconC: 'text-pink-400', active: true },
              { time: '12:00', title: '점심식사', icon: Coffee, color: 'border-l-amber-400', iconBg: 'bg-amber-400/10', iconC: 'text-amber-400' },
              { time: '14:00', title: '찬양 시간', icon: Music, color: 'border-l-rose-400', iconBg: 'bg-rose-400/10', iconC: 'text-rose-400' },
              { time: '16:00', title: '조별 활동', icon: Users, color: 'border-l-emerald-400', iconBg: 'bg-emerald-400/10', iconC: 'text-emerald-400' },
              { time: '19:00', title: '저녁 집회', icon: Flame, color: 'border-l-orange-400', iconBg: 'bg-orange-400/10', iconC: 'text-orange-400' },
            ].map((item) => (
              <div key={item.time} className={cn(
                'flex items-center gap-4 rounded-2xl border-l-[3px] px-4 py-3 transition-all duration-300',
                item.color,
                item.active ? 'bg-orange-400/[0.06] shadow-[0_0_20px_rgba(251,146,60,0.06)]' : 'hover:bg-white/[0.02]'
              )}>
                <span className="w-12 text-right text-sm font-semibold text-[#a8998a]" style={{ fontVariantNumeric: 'tabular-nums' }}>{item.time}</span>
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', item.iconBg)}>
                  <item.icon className={cn('h-5 w-5', item.iconC)} />
                </div>
                <span className={cn('text-sm font-medium', item.active ? 'text-[#fde8d4]' : 'text-[#c4b5a7]')}>{item.title}</span>
                {item.active && <span className="ml-auto rounded-full bg-orange-400/10 px-2.5 py-0.5 text-[0.625rem] font-bold text-orange-400">지금</span>}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions — Warm rounded pills */}
        <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
          {[
            { icon: Users, label: '참가자', border: 'border-orange-400/20 hover:bg-orange-400/10' },
            { icon: ClipboardCheck, label: '출석', border: 'border-emerald-400/20 hover:bg-emerald-400/10' },
            { icon: Trophy, label: '리더보드', border: 'border-amber-400/20 hover:bg-amber-400/10' },
            { icon: Megaphone, label: '공지', border: 'border-pink-400/20 hover:bg-pink-400/10' },
            { icon: Camera, label: '갤러리', border: 'border-rose-400/20 hover:bg-rose-400/10' },
            { icon: BookOpen, label: '자료실', border: 'border-orange-400/20 hover:bg-orange-400/10' },
          ].map((item) => (
            <motion.button key={item.label} type="button" whileTap={{ scale: 0.95 }}
              className={cn('flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium text-[#c4b5a7] transition-all duration-200', item.border)}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════
   C — "Vivid Glass" (비비드 글래스)
   강렬한 색상 + 블러 글래스. 인디고 + 퍼플 + 퓨셔.
   Apple 감성, 비비드 그라디언트 배경 위 글래스 카드.
   청년부가 사랑할 모던 럭셔리.
   ═══════════════════════════════════════════════════ */
function ConceptC() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="mx-auto max-w-5xl px-4 py-8">

      {/* Vivid aurora blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.20) 0%, transparent 70%)', animation: 'causticsDrift1 20s ease-in-out infinite' }} />
        <div className="absolute -right-20 top-[30%] h-[500px] w-[500px] rounded-full opacity-35"
          style={{ background: 'radial-gradient(circle, rgba(232,121,249,0.15) 0%, transparent 70%)', animation: 'causticsDrift2 25s ease-in-out infinite' }} />
        <div className="absolute bottom-0 left-[20%] h-[400px] w-[500px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)', animation: 'causticsDrift3 30s ease-in-out infinite' }} />
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* Label */}
        <motion.div variants={fadeUp}>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/5 px-4 py-1.5 backdrop-blur-md">
            <Waves className="h-3.5 w-3.5 text-purple-400" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-xs font-bold tracking-wider text-transparent">VIVID GLASS</span>
          </div>
          <p className="mt-2 text-sm text-slate-400">Apple 감성의 비비드 글래스. 강렬한 색상과 우아한 투명감의 조화.</p>
        </motion.div>

        {/* Welcome — Vivid gradient card */}
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl border border-white/[0.1] p-6 backdrop-blur-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(232,121,249,0.10) 50%, rgba(56,189,248,0.08) 100%)' }}>
          {/* Shimmer border */}
          <div className="absolute inset-0 rounded-3xl"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), rgba(232,121,249,0.3), rgba(56,189,248,0.3), transparent)', backgroundSize: '200% 100%', animation: 'textShimmer 5s linear infinite', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'xor', WebkitMaskComposite: 'xor', padding: '1px', borderRadius: '24px' }} />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white">안녕하세요 👋</h2>
            <p className="mt-1 bg-gradient-to-r from-indigo-300 via-purple-300 to-fuchsia-300 bg-clip-text text-sm font-medium text-transparent">2026 여름수련회 · D-127</p>
            <p className="mt-1 text-sm text-slate-400">속초 은혜수련원</p>
          </div>
        </motion.div>

        {/* Bento Grid — Vivid colored glass */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2">
          {/* Stat cards — each with unique vivid color */}
          {[
            { label: '참가자', value: '128', icon: Users, gradient: 'from-indigo-500/20 to-indigo-600/10', borderC: 'border-indigo-400/20', iconC: 'text-indigo-400', span: '' },
            { label: '출석률', value: '94%', icon: ClipboardCheck, gradient: 'from-emerald-500/20 to-emerald-600/10', borderC: 'border-emerald-400/20', iconC: 'text-emerald-400', span: '' },
            { label: '퀴즈', value: '860pt', icon: Zap, gradient: 'from-fuchsia-500/20 to-fuchsia-600/10', borderC: 'border-fuchsia-400/20', iconC: 'text-fuchsia-400', span: '' },
            { label: '1위', value: '사랑', icon: Award, gradient: 'from-amber-500/20 to-amber-600/10', borderC: 'border-amber-400/20', iconC: 'text-amber-400', span: '' },
          ].map((stat) => (
            <motion.div key={stat.label} variants={fadeUp}
              className={cn('group relative overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl', stat.borderC, 'bg-gradient-to-br', stat.gradient)}>
              <stat.icon className="absolute -bottom-2 -right-2 h-20 w-20 text-white/[0.03]" />
              <div className="relative">
                <stat.icon className={cn('h-5 w-5', stat.iconC)} />
                <p className="mt-2 text-xs text-slate-400">{stat.label}</p>
                <p className="mt-0.5 text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}

          {/* Schedule — Spans 2 cols */}
          <motion.div variants={fadeUp} className="col-span-2 row-span-1 overflow-hidden rounded-2xl border border-purple-400/15 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">오늘 일정</h3>
            </div>
            <div className="mt-3 space-y-1.5">
              {[
                { time: '09:00', title: '아침 묵상', color: 'bg-indigo-400' },
                { time: '10:00', title: '성경공부', color: 'bg-purple-400', active: true },
                { time: '12:00', title: '점심', color: 'bg-amber-400' },
                { time: '14:00', title: '레크리에이션', color: 'bg-fuchsia-400' },
                { time: '19:00', title: '저녁 집회', color: 'bg-indigo-400' },
              ].map((s) => (
                <div key={s.time} className={cn('flex items-center gap-2 rounded-lg py-1 pl-2', s.active && 'bg-white/[0.05]')}>
                  <div className={cn('h-1.5 w-1.5 rounded-full', s.color)} />
                  <span className="w-10 text-xs text-slate-500" style={{ fontVariantNumeric: 'tabular-nums' }}>{s.time}</span>
                  <span className={cn('text-xs', s.active ? 'font-semibold text-white' : 'text-slate-400')}>{s.title}</span>
                  {s.active && <span className="ml-auto text-[0.5rem] font-bold text-purple-400">NOW</span>}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Leaderboard — Spans 2 cols */}
          <motion.div variants={fadeUp} className="col-span-2 row-span-1 overflow-hidden rounded-2xl border border-fuchsia-400/15 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/5 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">조별 순위</h3>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[
                { rank: '🥇', name: '사랑', pts: 120, gradient: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-400/20' },
                { rank: '🥈', name: '소망', pts: 110, gradient: 'from-slate-400/20 to-slate-500/10', border: 'border-slate-400/20' },
                { rank: '🥉', name: '믿음', pts: 95, gradient: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-400/20' },
                { rank: '4', name: '기쁨', pts: 85, gradient: 'from-white/5 to-white/[0.02]', border: 'border-white/10' },
              ].map((team) => (
                <div key={team.name} className={cn('flex flex-col items-center gap-1 rounded-xl border p-3 text-center backdrop-blur-sm', team.border, 'bg-gradient-to-b', team.gradient)}>
                  <span className="text-lg">{team.rank}</span>
                  <span className="text-xs font-semibold text-white">{team.name}</span>
                  <span className="text-[0.625rem] text-slate-400">{team.pts}pt</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions — Vivid gradient icons */}
        <motion.div variants={fadeUp}>
          <p className="mb-3 text-xs font-medium text-slate-500">기능</p>
          <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
            {[
              { icon: Users, label: '참가자', from: 'from-indigo-500', to: 'to-indigo-600' },
              { icon: Calendar, label: '일정', from: 'from-purple-500', to: 'to-purple-600' },
              { icon: ClipboardCheck, label: '출석', from: 'from-emerald-500', to: 'to-emerald-600' },
              { icon: Zap, label: '퀴즈', from: 'from-fuchsia-500', to: 'to-fuchsia-600' },
              { icon: Megaphone, label: '공지', from: 'from-rose-500', to: 'to-rose-600' },
              { icon: Camera, label: '갤러리', from: 'from-cyan-500', to: 'to-cyan-600' },
              { icon: Trophy, label: '순위', from: 'from-amber-500', to: 'to-amber-600' },
              { icon: BookOpen, label: '자료', from: 'from-sky-500', to: 'to-sky-600' },
            ].map((item) => (
              <motion.button key={item.label} type="button"
                whileHover={{ y: -4, scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-1.5 py-2">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-shadow duration-300 hover:shadow-xl', item.from, item.to)}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-[0.625rem] font-medium text-slate-400">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
