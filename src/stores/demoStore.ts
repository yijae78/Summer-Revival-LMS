import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { useAppModeStore } from '@/stores/appModeStore'

interface DemoState {
  isDemoMode: boolean
  enableDemo: () => void
  disableDemo: () => void
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      isDemoMode: false,
      enableDemo: () => {
        // Sync with appModeStore — set to demo mode
        useAppModeStore.getState().setMode('demo')
        // Set cookie for middleware access
        if (typeof document !== 'undefined') {
          document.cookie = 'demo-mode=true; path=/; max-age=86400; SameSite=Lax'
        }
        set({ isDemoMode: true })
      },
      disableDemo: () => {
        // Sync with appModeStore — reset to none
        useAppModeStore.getState().resetMode()
        // Remove cookie
        if (typeof document !== 'undefined') {
          document.cookie = 'demo-mode=; path=/; max-age=0; SameSite=Lax'
        }
        set({ isDemoMode: false })
      },
    }),
    { name: 'demo-storage' }
  )
)
