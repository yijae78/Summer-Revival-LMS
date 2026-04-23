'use client'

import { useState, useCallback } from 'react'

import { Printer } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { generateQrDataUrl } from '@/lib/qr'

import type { Participant } from '@/types'

interface BulkQrDownloadProps {
  participants: Participant[]
}

export function BulkQrDownload({ participants }: BulkQrDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handlePrint = useCallback(async () => {
    if (participants.length === 0) {
      toast.error('참가자가 없어요')
      return
    }

    setIsGenerating(true)
    const baseUrl = window.location.origin

    const qrItems = await Promise.all(
      participants.map(async (p) => ({
        name: p.name,
        grade: p.grade ?? '',
        dataUrl: await generateQrDataUrl(p.id, baseUrl),
      }))
    )

    setIsGenerating(false)

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('팝업 차단을 해제해 주세요')
      return
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>QR 코드 명찰</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Pretendard Variable', sans-serif; }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      padding: 16px;
    }
    .card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      break-inside: avoid;
    }
    .card img { width: 120px; height: 120px; }
    .card .name { font-size: 14px; font-weight: 700; margin-top: 6px; }
    .card .grade { font-size: 11px; color: #6b7280; margin-top: 2px; }
    @media print {
      .grid { padding: 8px; gap: 8px; }
      .card { border: 1px solid #d1d5db; }
    }
  </style>
</head>
<body>
  <div class="grid">
    ${qrItems.map((item) => `
      <div class="card">
        <img src="${item.dataUrl}" alt="${item.name}" />
        <div class="name">${item.name}</div>
        <div class="grade">${item.grade}</div>
      </div>
    `).join('')}
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`

    printWindow.document.write(html)
    printWindow.document.close()
  }, [participants])

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      disabled={isGenerating || participants.length === 0}
      className="border-white/[0.08]"
    >
      <Printer className="mr-1.5 size-3.5" />
      {isGenerating ? '생성 중...' : 'QR 일괄 출력'}
    </Button>
  )
}
