'use client'

import { useMemo } from 'react'

import { Monitor, Tablet, Smartphone } from 'lucide-react'

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { DemoBanner } from '@/components/shared/DemoBanner'

import { useUser } from '@/hooks/useUser'
import { useDepartmentFilterStore } from '@/stores/departmentFilterStore'
import { useViewportStore } from '@/stores/viewportStore'
import { getDepartmentTheme } from '@/constants/departments'
import { cn } from '@/lib/utils'

import type { ViewportMode } from '@/stores/viewportStore'

const VIEWPORT_CONFIG: Record<ViewportMode, { width: string; showSidebar: boolean; showBottomNav: boolean }> = {
  desktop: { width: '100%', showSidebar: true, showBottomNav: true },
  tablet: { width: '768px', showSidebar: false, showBottomNav: true },
  mobile: { width: '375px', showSidebar: false, showBottomNav: true },
}

const VIEWPORT_OPTIONS: { mode: ViewportMode; icon: typeof Monitor; label: string }[] = [
  { mode: 'desktop', icon: Monitor, label: '데스크톱' },
  { mode: 'tablet', icon: Tablet, label: '태블릿' },
  { mode: 'mobile', icon: Smartphone, label: '모바일' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: user } = useUser()
  const department = useDepartmentFilterStore((s) => s.department)
  const theme = useMemo(() => getDepartmentTheme(department), [department])
  const viewport = useViewportStore((s) => s.viewport)
  const setViewport = useViewportStore((s) => s.setViewport)

  const config = VIEWPORT_CONFIG[viewport]
  const isFramed = viewport !== 'desktop'

  const dashboardContent = (
    <div className={cn('flex h-full flex-col', isFramed && 'h-dvh')}>
      <DemoBanner />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar — only when not framed */}
        {config.showSidebar && !isFramed && (
          <div className="relative z-20 hidden lg:flex">
            <Sidebar role={user?.role} />
            <div
              className="pointer-events-none absolute inset-y-0 -right-6 w-6 transition-all duration-700"
              style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.08) 40%, transparent 100%)' }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 -right-3 w-3 transition-all duration-700"
              style={{ background: `linear-gradient(90deg, rgba(${theme.primary},0.06) 0%, transparent 100%)` }}
            />
          </div>
        )}

        {/* Main area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Ambient caustics */}
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div
              className="absolute h-[700px] w-[700px] rounded-full transition-all duration-1000"
              style={{
                top: '5%', right: '10%', opacity: 0.4,
                background: `radial-gradient(circle, rgba(${theme.primary},0.15) 0%, transparent 70%)`,
                animation: 'causticsDrift1 30s ease-in-out infinite',
              }}
            />
            <div
              className="absolute h-[500px] w-[500px] rounded-full transition-all duration-1000"
              style={{
                bottom: '20%', left: '5%', opacity: 0.35,
                background: `radial-gradient(circle, rgba(${theme.secondary},0.10) 0%, transparent 70%)`,
                animation: 'causticsDrift2 40s ease-in-out infinite',
              }}
            />
          </div>

          <Header />

          <main className="flex-1 overflow-auto pb-20 lg:pb-0">
            <div className={cn('mx-auto p-4', !isFramed && 'max-w-6xl lg:p-6')}>
              {children}
            </div>
          </main>

          <BottomNav role={user?.role} />
        </div>
      </div>
    </div>
  )

  // Desktop mode — render normally
  if (!isFramed) {
    return <div className="flex h-dvh flex-col">{dashboardContent}</div>
  }

  // Framed mode (tablet/mobile simulation)
  return (
    <div className="flex h-dvh flex-col bg-[#0a0a0f]">
      {/* Viewport toggle bar */}
      <div className="flex h-10 shrink-0 items-center justify-center gap-1 border-b border-white/[0.06] bg-[#0c0e14]">
        {VIEWPORT_OPTIONS.map((v) => {
          const Icon = v.icon
          const isActive = viewport === v.mode
          return (
            <button
              key={v.mode}
              type="button"
              onClick={() => setViewport(v.mode)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/[0.1] text-white'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {v.label}
            </button>
          )
        })}
      </div>

      {/* Device frame */}
      <div className="flex flex-1 items-start justify-center overflow-auto py-4">
        <div
          className="relative flex-shrink-0 overflow-hidden rounded-2xl border border-white/[0.1] shadow-[0_0_60px_rgba(0,0,0,0.5)]"
          style={{
            width: config.width,
            height: viewport === 'mobile' ? '812px' : viewport === 'tablet' ? '1024px' : '100%',
            maxHeight: 'calc(100dvh - 3.5rem)',
          }}
        >
          {/* Device notch (mobile only) */}
          {viewport === 'mobile' && (
            <div className="absolute left-1/2 top-0 z-50 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-black" />
          )}

          <div className="h-full overflow-auto bg-background">
            {dashboardContent}
          </div>
        </div>
      </div>
    </div>
  )
}
