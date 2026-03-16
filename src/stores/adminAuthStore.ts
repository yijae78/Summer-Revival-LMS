import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminAuthState {
  passwordHash: string | null
  isAuthenticated: boolean
  setPassword: (password: string) => void
  changePassword: (oldPassword: string, newPassword: string) => boolean
  verifyPassword: (input: string) => boolean
  authenticate: () => void
  lock: () => void
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

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      passwordHash: null,
      isAuthenticated: false,

      setPassword: (password: string) => {
        set({ passwordHash: simpleHash(password) })
      },

      changePassword: (oldPassword: string, newPassword: string) => {
        const { passwordHash } = get()
        if (!passwordHash) return false
        if (simpleHash(oldPassword) !== passwordHash) return false
        set({ passwordHash: simpleHash(newPassword) })
        return true
      },

      verifyPassword: (input: string) => {
        const { passwordHash } = get()
        if (!passwordHash) return true
        return simpleHash(input) === passwordHash
      },

      authenticate: () => {
        set({ isAuthenticated: true })
      },

      lock: () => {
        set({ isAuthenticated: false })
      },
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({ passwordHash: state.passwordHash }),
    }
  )
)
