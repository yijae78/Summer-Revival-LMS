'use client'

import { useRouter } from 'next/navigation'

import { useDemoStore } from '@/stores/demoStore'
import { useEventStore } from '@/stores/eventStore'

export function DemoBanner() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const disableDemo = useDemoStore((s) => s.disableDemo)
  const clearCurrentEvent = useEventStore((s) => s.clearCurrentEvent)
  const router = useRouter()

  if (!isDemoMode) return null

  function handleExit() {
    disableDemo()
    clearCurrentEvent()
    router.push('/')
  }

  return (
    <div className="flex h-7 shrink-0 items-center justify-center bg-amber-500/90 text-xs font-semibold text-black">
      <span className="flex items-center gap-2">
        데모 모드로 보고 있어요
        <button
          type="button"
          onClick={handleExit}
          className="rounded bg-black/20 px-2 py-0.5 text-[0.625rem] font-bold transition-colors hover:bg-black/30"
        >
          나가기
        </button>
      </span>
    </div>
  )
}
