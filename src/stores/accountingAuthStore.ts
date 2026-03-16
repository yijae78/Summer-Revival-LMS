import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AccountingAuthState {
  passwordHash: string | null
  sessionUnlocked: boolean
  setPassword: (password: string) => void
  removePassword: () => void
  unlock: () => void
  lock: () => void
  verifyPassword: (input: string) => boolean
}

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

export const useAccountingAuthStore = create<AccountingAuthState>()(
  persist(
    (set, get) => ({
      passwordHash: null,
      sessionUnlocked: false,

      setPassword: (password: string) => {
        set({ passwordHash: simpleHash(password) })
      },

      removePassword: () => {
        set({ passwordHash: null, sessionUnlocked: false })
      },

      unlock: () => {
        set({ sessionUnlocked: true })
      },

      lock: () => {
        set({ sessionUnlocked: false })
      },

      verifyPassword: (input: string) => {
        const { passwordHash } = get()
        if (!passwordHash) return true
        return simpleHash(input) === passwordHash
      },
    }),
    {
      name: 'accounting-auth',
      partialize: (state) => ({ passwordHash: state.passwordHash }),
    }
  )
)
