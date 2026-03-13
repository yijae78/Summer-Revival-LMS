import { format, formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

export function formatKoreanDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'yyyy년 MM월 dd일', { locale: ko })
}

export function formatKoreanDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'yyyy년 MM월 dd일 a h:mm', { locale: ko })
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: ko })
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MM.dd (EEE)', { locale: ko })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'a h:mm', { locale: ko })
}
