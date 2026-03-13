'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Delete } from 'lucide-react'

import { cn } from '@/lib/utils'

const PIN_LENGTH = 6

export default function PinPage() {
  const [pin, setPin] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleNumberPress = useCallback(
    (num: string) => {
      if (pin.length >= PIN_LENGTH) return
      setError(null)
      const newPin = pin + num

      if (newPin.length === PIN_LENGTH) {
        setPin(newPin)
        verifyPin(newPin)
      } else {
        setPin(newPin)
      }
    },
    [pin]
  )

  const handleDelete = useCallback(() => {
    setError(null)
    setPin((prev) => prev.slice(0, -1))
  }, [])

  const verifyPin = async (pinCode: string) => {
    setIsVerifying(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinCode }),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        setError('PIN이 올바르지 않아요. 다시 시도해 주세요.')
        setPin('')
      }
    } catch {
      setError('연결에 문제가 생겼어요. 다시 시도해 주세요.')
      setPin('')
    } finally {
      setIsVerifying(false)
    }
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'delete', '0', 'confirm']

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Header */}
      <div className="flex w-full items-center">
        <Link
          href="/login"
          className="inline-flex h-12 w-12 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      {/* Title */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-foreground">PIN으로 입장</h1>
        <p className="text-[0.9375rem] text-muted-foreground">
          6자리 PIN을 입력해 주세요
        </p>
      </div>

      {/* PIN Display */}
      <div className="flex gap-3">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all',
              i < pin.length
                ? 'border-primary bg-primary/10'
                : 'border-border bg-background',
              error && 'border-destructive'
            )}
          >
            {i < pin.length && (
              <div className="h-3 w-3 rounded-full bg-primary" />
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Keypad */}
      <div className="grid w-full max-w-[280px] grid-cols-3 gap-3">
        {keys.map((key) => {
          if (key === 'delete') {
            return (
              <button
                key={key}
                type="button"
                onClick={handleDelete}
                disabled={isVerifying || pin.length === 0}
                className="inline-flex min-h-[56px] min-w-[56px] items-center justify-center rounded-full text-xl text-muted-foreground transition-colors hover:bg-muted active:scale-[0.95] disabled:opacity-30"
              >
                <Delete className="h-6 w-6" />
              </button>
            )
          }
          if (key === 'confirm') {
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (pin.length === PIN_LENGTH) verifyPin(pin)
                }}
                disabled={isVerifying || pin.length < PIN_LENGTH}
                className={cn(
                  'inline-flex min-h-[56px] min-w-[56px] items-center justify-center rounded-full text-sm font-medium transition-colors active:scale-[0.95] disabled:opacity-30',
                  pin.length === PIN_LENGTH
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'text-muted-foreground'
                )}
              >
                {isVerifying ? '...' : '확인'}
              </button>
            )
          }
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleNumberPress(key)}
              disabled={isVerifying || pin.length >= PIN_LENGTH}
              className="inline-flex min-h-[56px] min-w-[56px] items-center justify-center rounded-full text-xl font-medium text-foreground transition-colors hover:bg-muted active:scale-[0.95] disabled:opacity-30"
            >
              {key}
            </button>
          )
        })}
      </div>
    </div>
  )
}
