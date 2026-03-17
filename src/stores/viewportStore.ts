import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewportMode = 'desktop' | 'tablet' | 'mobile'

interface ViewportState {
  viewport: ViewportMode
  isAutoDetected: boolean
  setViewport: (viewport: ViewportMode) => void
}

function detectViewport(): ViewportMode {
  if (typeof window === 'undefined') return 'desktop'
  const w = window.innerWidth
  if (w < 640) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

export const useViewportStore = create<ViewportState>()(
  persist(
    (set, get) => ({
      viewport: detectViewport(),
      isAutoDetected: true,
      setViewport: (viewport: ViewportMode) => set({ viewport, isAutoDetected: false }),
    }),
    {
      name: 'viewport-mode',
      onRehydrateStorage: () => (state) => {
        // On first load, auto-detect if user hasn't manually set it
        if (state?.isAutoDetected) {
          const detected = detectViewport()
          useViewportStore.setState({ viewport: detected })
        }
      },
    }
  )
)
