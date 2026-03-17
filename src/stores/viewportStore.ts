import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewportMode = 'desktop' | 'tablet' | 'mobile'

interface ViewportState {
  viewport: ViewportMode
  setViewport: (viewport: ViewportMode) => void
}

export const useViewportStore = create<ViewportState>()(
  persist(
    (set) => ({
      viewport: 'desktop',
      setViewport: (viewport: ViewportMode) => set({ viewport }),
    }),
    { name: 'viewport-mode' }
  )
)
