import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-dvh">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto pb-20 lg:pb-0">
          <div className="mx-auto max-w-6xl p-4 lg:p-6">{children}</div>
        </main>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>
    </div>
  )
}
