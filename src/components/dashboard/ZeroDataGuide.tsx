import { CalendarPlus, UserPlus, Clock, UsersRound, Check, ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

interface GuideStep {
  icon: React.ElementType
  title: string
  description: string
  completed: boolean
  href: string
  iconColor: string
  iconBg: string
}

interface ZeroDataGuideProps {
  hasEvent?: boolean
  hasParticipants?: boolean
  hasSchedule?: boolean
  hasGroups?: boolean
}

export function ZeroDataGuide({
  hasEvent = false,
  hasParticipants = false,
  hasSchedule = false,
  hasGroups = false,
}: ZeroDataGuideProps) {
  const steps: GuideStep[] = [
    {
      icon: CalendarPlus,
      title: '행사 만들기',
      description: '수련회, VBS, 캠프 중 선택하세요',
      completed: hasEvent,
      href: '/events/new',
      iconColor: 'text-[#38bdf8]',
      iconBg: 'bg-[#38bdf8]/12',
    },
    {
      icon: UserPlus,
      title: '참가자 등록',
      description: '참가 신청 링크를 공유하세요',
      completed: hasParticipants,
      href: '/participants',
      iconColor: 'text-[#22d3ee]',
      iconBg: 'bg-[#22d3ee]/12',
    },
    {
      icon: Clock,
      title: '일정 생성',
      description: '일차별 세션을 만들어요',
      completed: hasSchedule,
      href: '/schedule',
      iconColor: 'text-[#a78bfa]',
      iconBg: 'bg-[#a78bfa]/12',
    },
    {
      icon: UsersRound,
      title: '조 편성',
      description: '참가자를 조별로 나누세요',
      completed: hasGroups,
      href: '/groups',
      iconColor: 'text-[#34d399]',
      iconBg: 'bg-[#34d399]/12',
    },
  ]

  const completedCount = steps.filter((s) => s.completed).length
  const progress = (completedCount / steps.length) * 100

  return (
    <div className="overflow-hidden rounded-2xl border border-[#1e2235] bg-[#151823]">
      <div className="border-b border-[#1e2235] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">시작해 볼까요?</h3>
            <p className="mt-0.5 text-sm text-[#8892a8]">
              아래 단계를 따라 행사를 준비하세요
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl font-bold text-primary">
              {completedCount}/{steps.length}
            </p>
            <p className="text-xs text-[#5c6478]">완료</p>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#1c2030]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#38bdf8] to-[#22d3ee] transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundSize: '200% 100%',
              animation: progress > 0 ? 'shimmer 2s infinite' : 'none',
            }}
          />
        </div>
      </div>

      <div className="divide-y divide-[#1a1e2e]">
        {steps.map((step, index) => (
          <a
            key={step.title}
            href={step.href}
            className={cn(
              'group flex items-center gap-4 p-4 transition-all duration-200',
              step.completed ? 'bg-primary/5' : 'hover:bg-[#181c28]'
            )}
          >
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
                step.completed
                  ? 'bg-primary text-[#0f172a]'
                  : cn(step.iconBg, step.iconColor)
              )}
            >
              {step.completed ? (
                <Check className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>

            <div className="flex-1">
              <p
                className={cn(
                  'text-sm font-semibold',
                  step.completed ? 'text-[#8892a8] line-through' : 'text-[#e2e8f0]'
                )}
              >
                {index + 1}. {step.title}
              </p>
              <p className="mt-0.5 text-xs text-[#5c6478]">{step.description}</p>
            </div>

            {!step.completed && (
              <ArrowRight className="h-4 w-4 text-[#5c6478] transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary" />
            )}
          </a>
        ))}
      </div>
    </div>
  )
}
