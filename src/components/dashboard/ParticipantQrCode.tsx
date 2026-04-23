'use client'

import { useState, useEffect } from 'react'

import { Download, QrCode } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SkeletonBox } from '@/components/shared/LoadingSkeleton'

import { generateQrDataUrl } from '@/lib/qr'
import { useAppModeStore } from '@/stores/appModeStore'

interface ParticipantQrCodeProps {
  participantId: string
  participantName: string
  size?: number
}

export function ParticipantQrCode({ participantId, participantName, size = 200 }: ParticipantQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const mode = useAppModeStore((s) => s.mode)

  useEffect(() => {
    const baseUrl = window.location.origin
    generateQrDataUrl(participantId, baseUrl).then(setDataUrl)
  }, [participantId])

  function handleDownload() {
    if (!dataUrl) return
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `${participantName}_QR.png`
    link.click()
  }

  if (!dataUrl) {
    return (
      <div className="flex flex-col items-center gap-3">
        <SkeletonBox className="h-[200px] w-[200px] rounded-lg" />
        <SkeletonBox className="h-4 w-20" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-xl bg-white p-3">
        <img src={dataUrl} alt={`${participantName} QR 코드`} width={size} height={size} />
      </div>
      <p className="text-sm font-medium text-foreground">{participantName}</p>
      <p className="text-xs leading-relaxed text-muted-foreground/70">
        {mode === 'cloud'
          ? '학생에게 보내면 자동 로그인돼요'
          : '이름표에 인쇄하거나 이 기기에서 스캔하세요'}
      </p>
      <Button variant="outline" size="sm" onClick={handleDownload} className="border-white/[0.08]">
        <Download className="mr-1.5 size-3.5" />
        QR 다운로드
      </Button>
    </div>
  )
}
