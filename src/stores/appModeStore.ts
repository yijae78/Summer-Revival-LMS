import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppMode = 'none' | 'local' | 'cloud' | 'demo'

interface AppModeState {
  mode: AppMode
  setMode: (mode: AppMode) => void
  resetMode: () => void
}

function syncCookie(mode: AppMode): void {
  if (typeof document === 'undefined') return

  if (mode === 'local' || mode === 'demo') {
    document.cookie = 'demo-mode=true; path=/; max-age=86400; SameSite=Lax'
  } else {
    document.cookie = 'demo-mode=; path=/; max-age=0; SameSite=Lax'
  }
}

export const useAppModeStore = create<AppModeState>()(
  persist(
    (set) => ({
      mode: 'none',
      setMode: (mode: AppMode) => {
        syncCookie(mode)
        set({ mode })
      },
      resetMode: () => {
        syncCookie('none')
        set({ mode: 'none' })
      },
    }),
    { name: 'app-mode' }
  )
)
