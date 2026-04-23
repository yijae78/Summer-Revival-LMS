'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { Loader2, QrCode, AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { useAppModeStore } from '@/stores/appModeStore'
import { useParticipantSessionStore } from '@/stores/participantSessionStore'
import { getById } from '@/lib/local-db'
import { DEMO_PARTICIPANTS } from '@/lib/demo/data'

import type { Participant } from '@/types'

export default function QrLoginPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const mode = useAppModeStore((s) => s.mode)
  const setSession = useParticipantSessionStore((s) => s.setSession)

  const [status, setStatus] = useState<'loading' | 'error' | 'local-only'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!params.id) {
      setStatus('error')
      setErrorMsg('잘못된 QR 코드예요.')
      return
    }

    async function authenticate() {
      try {
        let participant: { id: string; name: string; eventId: string } | null = null

        if (mode === 'local') {
          // Local mode: admin scans QR → go to participant detail page (not login)
          const p = getById<Participant>('participants', params.id)
          if (p) {
            router.replace(`/participants/${p.id}`)
            return
          } else {
            setStatus('error')
            setErrorMsg('참가자를 찾을 수 없어요.')
            return
          }
        } else if (mode === 'demo') {
          const p = DEMO_PARTICIPANTS.find((d) => d.id === params.id)
          if (p) {
            participant = { id: p.id, name: p.name, eventId: p.event_id ?? '' }
          }
        } else if (mode === 'cloud') {
          // Cloud mode: student login via API
          const response = await fetch('/api/auth/qr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ participantId: params.id }),
          })

          if (response.ok) {
            const data = await response.json()
            participant = data.participant
          }
        } else {
          // mode === 'none': new browser, no setup
          // Try cloud API first — if it works, this is a cloud deployment
          try {
            const response = await fetch('/api/auth/qr', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ participantId: params.id }),
            })

            if (response.ok) {
              const data = await response.json()
              participant = data.participant
            } else {
              // Cloud API failed — this is likely a local-mode QR
              setStatus('local-only')
              return
            }
          } catch {
            setStatus('local-only')
            return
          }
        }

        if (!participant) {
          setStatus('error')
          setErrorMsg('참가자를 찾을 수 없어요.')
          return
        }

        setSession(participant)
        router.replace('/dashboard')
      } catch {
        setStatus('error')
        setErrorMsg('로그인 중 문제가 발생했어요.')
      }
    }

    authenticate()
  }, [params.id, mode, setSession, router])

  if (status === 'local-only') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
          <QrCode className="size-8 text-amber-400" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">관리자 기기에서 스캔해 주세요</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          이 QR코드는 행사 관리자 기기에서만 사용할 수 있어요.
          <br />
          관리자에게 요청해 주세요.
        </p>
        <Button variant="outline" onClick={() => router.push('/')} className="mt-2">
          홈으로 돌아가기
        </Button>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <AlertTriangle className="size-8 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{errorMsg}</h2>
        <p className="text-sm text-muted-foreground">QR 코드가 올바른지 확인해 주세요.</p>
        <Button variant="outline" onClick={() => router.push('/')} className="mt-2">
          홈으로 돌아가기
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <QrCode className="size-8 text-primary" />
      </div>
      <Loader2 className="size-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">로그인 중이에요...</p>
    </div>
  )
}
