// Supabase 자동 생성 타입은 database.ts에서 import
// export type { Database } from './database'

// === 역할 ===
export type UserRole = 'admin' | 'staff' | 'student' | 'parent'

// === 출석 ===
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

// === 세션 유형 ===
export type SessionType = 'worship' | 'study' | 'recreation' | 'meal' | 'free' | 'special'

// === 퀴즈 ===
export type QuizType = 'multiple_choice' | 'ox' | 'fill_blank'

// === 포인트 ===
export type PointCategory = 'attendance' | 'quiz' | 'activity' | 'bonus'

// === PIPA 동의 유형 ===
export type ConsentType = 'personal_info' | 'sensitive_info' | 'photo_video' | 'overseas_transfer'

// === 오프라인 큐 ===
export interface QueuedAction {
  id: string
  action: 'insert' | 'update' | 'upsert' | 'delete'
  table: string
  payload: Record<string, unknown>
  timestamp: number
  retryCount: number
  status: 'pending' | 'syncing' | 'failed'
}

// === 행사 유형 ===
export type EventType = 'retreat' | 'vbs' | 'camp'

// === 공지 유형 ===
export type AnnouncementType = 'general' | 'urgent' | 'group'

// === 자료 카테고리 ===
export type MaterialCategory = 'textbook' | 'hymn' | 'worksheet' | 'video' | 'other'
