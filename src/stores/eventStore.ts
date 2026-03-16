import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface EventState {
  currentEventId: string | null
  setCurrentEventId: (id: string) => void
  clearCurrentEvent: () => void
}

export const useEventStore = create<EventState>()(
  persist(
    (set) => ({
      currentEventId: null,
      setCurrentEventId: (id) => set({ currentEventId: id }),
      clearCurrentEvent: () => set({ currentEventId: null }),
    }),
    { name: 'event-storage' }
  )
)
