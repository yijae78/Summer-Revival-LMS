import { AlertCircle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ParticipantForm } from '@/components/forms/ParticipantForm'

import { createServerSupabaseClient } from '@/lib/supabase/server'

import type { Event } from '@/types'

interface JoinPageProps {
  params: Promise<{ code: string }>
}

async function fetchEventByCode(code: string): Promise<Event | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('invite_code', code.toUpperCase())
      .single()

    if (error) return null
    return data as Event
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: JoinPageProps) {
  const { code } = await params
  const event = await fetchEventByCode(code)
  return {
    title: event ? `${event.name} 참가 신청` : '참가 신청',
    description: event?.description ?? '행사 참가 신청 페이지입니다.',
  }
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { code } = await params
  const event = await fetchEventByCode(code)

  if (!event) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              행사를 찾을 수 없어요
            </h2>
            <p className="mt-1.5 text-[0.9375rem] text-muted-foreground">
              초대 코드를 다시 확인해 주세요.
              <br />
              코드가 만료되었거나 올바르지 않을 수 있어요.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const now = new Date()
  const endDate = new Date(event.end_date)
  const isExpired = now > endDate

  if (isExpired) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              신청이 마감되었어요
            </h2>
            <p className="mt-1.5 text-[0.9375rem] text-muted-foreground">
              이 행사의 참가 신청 기간이 종료되었어요.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-lg p-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{event.name}</CardTitle>
            <CardDescription>
              {event.description ?? '참가 신청서를 작성해 주세요.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ParticipantForm eventId={event.id} eventName={event.name} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
