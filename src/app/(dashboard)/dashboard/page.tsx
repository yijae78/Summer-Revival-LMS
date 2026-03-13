import { Users, ClipboardCheck, Gamepad2, Award } from 'lucide-react'

import { EventBanner } from '@/components/dashboard/EventBanner'
import { StatCard } from '@/components/dashboard/StatCard'
import { ZeroDataGuide } from '@/components/dashboard/ZeroDataGuide'

const MOCK_EVENT = {
  name: '2026 여름수련회',
  startDate: new Date('2026-07-20'),
  endDate: new Date('2026-07-22'),
}

const HAS_DATA = false

export default function DashboardPage() {
  if (!HAS_DATA) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-white">안녕하세요 👋</h1>
          <p className="mt-1 text-sm text-[#8892a8]">여름행사를 준비해 볼까요?</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <EventBanner
              eventName={MOCK_EVENT.name}
              startDate={MOCK_EVENT.startDate}
              endDate={MOCK_EVENT.endDate}
            />
          </div>
          <StatCard
            value={0}
            label="참가자"
            icon={Users}
            color="primary"
            description="아직 등록된 참가자가 없어요"
          />
          <StatCard
            value="—"
            label="출석률"
            icon={ClipboardCheck}
            color="secondary"
            description="행사가 시작되면 표시돼요"
          />
        </div>

        <ZeroDataGuide />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">안녕하세요 👋</h1>
        <p className="mt-1 text-sm text-[#8892a8]">오늘도 행사 준비를 함께해요</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2">
          <EventBanner
            eventName={MOCK_EVENT.name}
            startDate={MOCK_EVENT.startDate}
            endDate={MOCK_EVENT.endDate}
          />
        </div>
        <StatCard value={52} label="참가자" icon={Users} delta="+3명" color="primary" />
        <StatCard value="94%" label="출석률" icon={ClipboardCheck} delta="+2%" color="secondary" />
        <StatCard value={8} label="진행된 퀴즈" icon={Gamepad2} color="accent" description="오늘 2개 예정" />
        <StatCard value="1,280" label="총 포인트" icon={Award} delta="+150" color="success" description="1위: 3조 (420점)" />
      </div>
    </div>
  )
}
