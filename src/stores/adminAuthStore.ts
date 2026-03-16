import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminAuthState {
  passwordHash: string | null
  recoveryPhone: string | null
  isAuthenticated: boolean
  setPassword: (password: string) => void
  setRecoveryPhone: (phone: string) => void
  changePassword: (oldPassword: string, newPassword: string) => boolean
  resetPasswordWithPhone: (phone: string, newPassword: string) => boolean
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
      recoveryPhone: null,
      isAuthenticated: false,

      setPassword: (password: string) => {
        set({ passwordHash: simpleHash(password) })
      },

      setRecoveryPhone: (phone: string) => {
        set({ recoveryPhone: phone.replace(/[^0-9]/g, '') })
      },

      resetPasswordWithPhone: (phone: string, newPassword: string) => {
        const { recoveryPhone } = get()
        if (!recoveryPhone) return false
        const cleaned = phone.replace(/[^0-9]/g, '')
        if (cleaned !== recoveryPhone) return false
        set({ passwordHash: simpleHash(newPassword) })
        return true
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
      partialize: (state) => ({ passwordHash: state.passwordHash, recoveryPhone: state.recoveryPhone }),
    }
  )
)
