'use client'

import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

interface ToolResultCardProps {
  toolName: string
  part: {
    toolCallId: string
    state: string
    output?: unknown
    errorText?: string
  }
}

const TOOL_LABELS: Record<string, string> = {
  searchParticipants: '참가자 검색',
  getParticipantDetail: '참가자 상세',
  getGroupMembers: '조/반 명단',
  getSchedule: '일정 조회',
  getAttendanceSummary: '출석 현황',
  getQuizResults: '퀴즈 결과',
  getPointsRanking: '포인트 순위',
  getAnnouncements: '공지사항',
  getEventInfo: '행사 정보',
  getMaterials: '자료 목록',
  getGalleryPhotos: '갤러리',
  getRoomInfo: '숙소 배정',
  getProfiles: '프로필 조회',
  markAttendance: '출석 체크',
  updateParticipant: '참가자 수정',
  createAnnouncement: '공지 작성',
  assignPoints: '포인트 부여',
}

export function ToolResultCard({ toolName, part }: ToolResultCardProps) {
  const label = TOOL_LABELS[toolName] ?? toolName
  const isLoading = part.state === 'input-streaming' || part.state === 'input-available'
  const isDone = part.state === 'output-available'
  const isError = part.state === 'output-error'

  return (
    <div className="my-2 rounded-xl border border-border/50 bg-background/80 p-3">
      <div className="flex items-center gap-2 text-xs">
        {isLoading && (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span className="text-muted-foreground">{label} 조회 중...</span>
          </>
        )}

        {isDone && (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-medium text-foreground">{label}</span>
          </>
        )}

        {isError && (
          <>
            <AlertCircle className="h-3.5 w-3.5 text-red-400" />
            <span className="text-red-400">{label} 실패</span>
          </>
        )}
      </div>

      {isDone && part.output != null && (
        <div className="mt-2">
          <ResultRenderer toolName={toolName} result={part.output as Record<string, unknown>} />
        </div>
      )}

      {isError && part.errorText && (
        <p className="mt-2 text-xs text-red-400">{part.errorText}</p>
      )}
    </div>
  )
}

function ResultRenderer({
  toolName,
  result,
}: {
  toolName: string
  result: Record<string, unknown>
}) {
  // Participants table
  if (toolName === 'searchParticipants' && Array.isArray(result.participants)) {
    const participants = result.participants as Array<Record<string, unknown>>
    if (participants.length === 0) {
      return <p className="text-xs text-muted-foreground">검색 결과가 없어요</p>
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/30">
              <th className="pb-1.5 text-left font-medium text-muted-foreground">#</th>
              <th className="pb-1.5 text-left font-medium text-muted-foreground">이름</th>
              <th className="pb-1.5 text-left font-medium text-muted-foreground">전화번호</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p, i) => (
              <tr key={String(p.id)} className="border-b border-border/20 last:border-0">
                <td className="py-1.5 text-muted-foreground">{i + 1}</td>
                <td className="py-1.5 font-medium">{String(p.name)}</td>
                <td className="py-1.5 text-muted-foreground">{String(p.phone ?? '-')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {typeof result.total === 'number' && result.total > participants.length && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            외 {result.total - participants.length}명 더
          </p>
        )}
      </div>
    )
  }

  // Attendance summary
  if (toolName === 'getAttendanceSummary') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {(['present', 'absent', 'late', 'excused'] as const).map((key) => {
          const val = result[key]
          if (typeof val !== 'number') return null
          const labels: Record<string, { text: string; color: string }> = {
            present: { text: '출석', color: 'text-emerald-400' },
            absent: { text: '결석', color: 'text-red-400' },
            late: { text: '지각', color: 'text-amber-400' },
            excused: { text: '사유', color: 'text-blue-400' },
          }
          const label = labels[key]
          return (
            <div key={key} className="flex items-baseline gap-1.5">
              <span className={cn('text-sm font-bold', label.color)}>{val}</span>
              <span className="text-xs text-muted-foreground">{label.text}</span>
            </div>
          )
        })}
        {typeof result.presentRate === 'string' && (
          <div className="col-span-2 mt-1 text-xs text-muted-foreground">
            출석률: <span className="font-semibold text-foreground">{result.presentRate}</span>
          </div>
        )}
      </div>
    )
  }

  // Schedules
  if (toolName === 'getSchedule' && Array.isArray(result.schedules)) {
    const schedules = result.schedules as Array<Record<string, unknown>>
    if (schedules.length === 0) {
      return <p className="text-xs text-muted-foreground">등록된 일정이 없어요</p>
    }
    return (
      <div className="space-y-1.5">
        {schedules.map((s) => (
          <div key={String(s.id)} className="flex items-start gap-2 text-xs">
            <span className="shrink-0 text-muted-foreground">
              {String(s.start_time ?? '').slice(0, 5)}
            </span>
            <div>
              <p className="font-medium">{String(s.title)}</p>
              {s.location != null && (
                <p className="text-muted-foreground">{String(s.location)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Group members
  if (toolName === 'getGroupMembers' && result.group) {
    const group = result.group as Record<string, unknown>
    const members = (result.members ?? []) as Array<Record<string, unknown>>
    return (
      <div>
        <p className="text-xs font-semibold">
          {String(group.name)} ({members.length}명)
        </p>
        <div className="mt-1.5 space-y-0.5">
          {members.map((m, i) => {
            const participant = (m.participants ?? m) as Record<string, unknown>
            return (
              <p key={i} className="text-xs">
                {i + 1}. {String(participant.name ?? '-')}
              </p>
            )
          })}
        </div>
      </div>
    )
  }

  // Generic fallback
  if (result.message && typeof result.message === 'string') {
    return <p className="text-xs text-muted-foreground">{result.message}</p>
  }

  if (result.success) {
    return (
      <p className="text-xs text-emerald-400">
        {typeof result.message === 'string' ? result.message : '완료했어요'}
      </p>
    )
  }

  return (
    <pre className="max-h-32 overflow-auto text-[0.65rem] leading-relaxed text-muted-foreground">
      {JSON.stringify(result, null, 2)}
    </pre>
  )
}
