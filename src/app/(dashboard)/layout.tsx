'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

import { useUser } from '@/hooks/useUser'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: user } = useUser()

  return (
    <div className="flex h-dvh">
      {/* Desktop sidebar */}
      <Sidebar role={user?.role} />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Ambient caustics — Living Water 세계관 연결 */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div
            className="absolute h-[600px] w-[600px] rounded-full opacity-30"
            style={{
              top: '5%',
              right: '10%',
              background: 'radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 70%)',
              animation: 'causticsDrift1 30s ease-in-out infinite',
            }}
          />
          <div
            className="absolute h-[400px] w-[400px] rounded-full opacity-20"
            style={{
              bottom: '20%',
              left: '5%',
              background: 'radial-gradient(circle, rgba(34,211,238,0.03) 0%, transparent 70%)',
              animation: 'causticsDrift2 40s ease-in-out infinite',
            }}
          />
        </div>

        <Header />

        <main className="flex-1 overflow-auto pb-20 lg:pb-0">
          <div className="mx-auto max-w-6xl p-4 lg:p-6">{children}</div>
        </main>

        {/* Mobile bottom nav */}
        <BottomNav role={user?.role} />
      </div>
    </div>
  )
}
