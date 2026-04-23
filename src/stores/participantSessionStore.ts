import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ParticipantSession {
  id: string
  name: string
  eventId: string
}

interface ParticipantSessionState {
  session: ParticipantSession | null
  setSession: (session: ParticipantSession) => void
  clearSession: () => void
}

function setCookie(session: ParticipantSession): void {
  if (typeof document === 'undefined') return
  const value = JSON.stringify(session)
  document.cookie = `participant-session=${encodeURIComponent(value)}; path=/; max-age=86400; SameSite=Lax`
}

function clearCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = 'participant-session=; path=/; max-age=0; SameSite=Lax'
}

export const useParticipantSessionStore = create<ParticipantSessionState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => {
        setCookie(session)
        set({ session })
      },
      clearSession: () => {
        clearCookie()
        set({ session: null })
      },
    }),
    { name: 'participant-session' }
  )
)
