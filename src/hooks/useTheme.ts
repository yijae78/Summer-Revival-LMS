'use client'

import { useEffect } from 'react'

import { useThemeStore } from '@/stores/themeStore'

export function useTheme() {
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement

    function applyTheme(resolved: 'light' | 'dark') {
      if (resolved === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mq.matches ? 'dark' : 'light')

      function handler(e: MediaQueryListEvent) {
        applyTheme(e.matches ? 'dark' : 'light')
      }

      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }

    applyTheme(theme)
  }, [theme])

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system'
      ? typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme

  return { theme, setTheme, resolvedTheme }
}
