import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
        // Set cookie for middleware access
        if (typeof document !== 'undefined') {
          document.cookie = 'demo-mode=true; path=/; max-age=86400; SameSite=Lax'
        }
        set({ isDemoMode: true })
      },
      disableDemo: () => {
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
