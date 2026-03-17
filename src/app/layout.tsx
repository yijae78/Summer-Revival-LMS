import type { Metadata, Viewport } from 'next'

import { Providers } from '@/components/shared/Providers'
import { OfflineIndicator } from '@/components/shared/OfflineIndicator'
import { ChatWidget } from '@/components/chat/ChatWidget'

import './globals.css'

export const metadata: Metadata = {
  title: '교회 여름행사 LMS',
  description: '수련회·VBS·캠프를 위한 교회 여름행사 관리 시스템',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '여름행사 LMS',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0c0e14',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Noto+Serif+KR:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <Providers>
          <OfflineIndicator />
          {children}
          <ChatWidget />
        </Providers>
      </body>
    </html>
  )
}
