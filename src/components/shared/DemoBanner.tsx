'use client'

import { useRouter } from 'next/navigation'

import { useAppModeStore } from '@/stores/appModeStore'
import { useDemoStore } from '@/stores/demoStore'
import { useEventStore } from '@/stores/eventStore'
import { cn } from '@/lib/utils'

export function DemoBanner() {
  const mode = useAppModeStore((s) => s.mode)
  const resetMode = useAppModeStore((s) => s.resetMode)
  const disableDemo = useDemoStore((s) => s.disableDemo)
  const clearCurrentEvent = useEventStore((s) => s.clearCurrentEvent)
  const router = useRouter()

  // No banner for cloud or none mode
  if (mode === 'cloud' || mode === 'none') return null

  const isDemo = mode === 'demo'
  const isLocal = mode === 'local'

  if (!isDemo && !isLocal) return null

  function handleExit() {
    disableDemo()
    resetMode()
    clearCurrentEvent()
    router.push('/')
  }

  return (
    <div
      className={cn(
        'flex h-7 shrink-0 items-center justify-center text-xs font-semibold',
        isDemo && 'bg-amber-500/90 text-black',
        isLocal && 'bg-primary/90 text-primary-foreground'
      )}
    >
      <span className="flex items-center gap-2">
        {isDemo && '데모 모드로 보고 있어요'}
        {isLocal && '이 기기에 데이터가 저장돼요'}
        <button
          type="button"
          onClick={handleExit}
          className={cn(
            'rounded px-2 py-0.5 text-[0.625rem] font-bold transition-colors',
            isDemo && 'bg-black/20 hover:bg-black/30',
            isLocal && 'bg-white/20 hover:bg-white/30'
          )}
        >
          나가기
        </button>
      </span>
    </div>
  )
}
