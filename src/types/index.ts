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

// ============================================
// Database Table Interfaces
// Mapped from schema-sql.ts (snake_case columns)
// ============================================

// === events ===
export interface Event {
  id: string
  name: string
  type: string
  start_date: string
  end_date: string
  location: string | null
  description: string | null
  invite_code: string | null
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

// === event settings ===
export interface EventSettings {
  churchName?: string
  departments?: string[]
  theme?: string
  themeVerse?: string
  adminPassword?: string
  adminPhone?: string
}

// === profiles ===
export interface Profile {
  id: string
  name: string
  role: string
  phone: string | null
  avatar_url: string | null
  has_seen_onboarding: boolean
  created_at: string
}

// === participants ===
export interface Participant {
  id: string
  event_id: string | null
  user_id: string | null
  name: string
  birth_date: string | null
  gender: string | null
  grade: string | null
  phone: string | null
  parent_phone: string | null
  emergency_contact: string | null
  health_info: Record<string, unknown>
  dietary_restrictions: string | null
  transportation: string | null
  fee_paid: boolean
  consent_personal_info: boolean
  consent_sensitive_info: boolean
  consent_photo_video: boolean
  consent_overseas_transfer: boolean
  consent_ip: string | null
  created_at: string
}

// === groups ===
export interface Group {
  id: string
  event_id: string | null
  name: string
  leader_id: string | null
  color: string | null
  total_points: number
  department?: string | null
  created_at: string
}

// === group_members ===
export interface GroupMember {
  id: string
  group_id: string | null
  participant_id: string | null
}

// === schedules ===
export interface Schedule {
  id: string
  event_id: string | null
  day_number: number
  date?: string | null
  title: string
  type: string
  start_time: string
  end_time: string
  location: string | null
  speaker: string | null
  description: string | null
  materials: string[] | null
  order_index: number
  department?: string | null
  created_at: string
}

// === attendance ===
export interface AttendanceRecord {
  id: string
  schedule_id: string | null
  participant_id: string | null
  status: string
  checked_by: string | null
  checked_at: string
}

// === announcements ===
export interface Announcement {
  id: string
  event_id: string | null
  title: string
  content: string
  type: string
  target_group_id: string | null
  is_pinned: boolean
  author_id: string | null
  department?: string | null
  created_at: string
}

// === materials ===
export interface Material {
  id: string
  event_id: string | null
  title: string
  category: string
  file_url: string
  file_type: string | null
  file_size: number | null
  day_number: number | null
  uploaded_by: string | null
  department?: string | null
  created_at: string
}

// === quizzes ===
export interface Quiz {
  id: string
  event_id: string | null
  title: string
  description: string | null
  type: string
  is_active: boolean
  time_limit: number | null
  points_per_question: number
  created_at: string
}

// === quiz_questions ===
export interface QuizQuestion {
  id: string
  quiz_id: string | null
  question: string
  type: string
  options: Record<string, unknown> | null
  correct_answer: string
  order_index: number
  points: number
}

// === quiz_responses ===
export interface QuizResponse {
  id: string
  question_id: string | null
  participant_id: string | null
  answer: string | null
  is_correct: boolean | null
  time_taken: number | null
  points_earned: number
  created_at: string
}

// === points ===
export interface PointRecord {
  id: string
  event_id: string | null
  participant_id: string | null
  group_id: string | null
  category: string
  amount: number
  description: string | null
  created_at: string
}

// === gallery_albums ===
export interface GalleryAlbum {
  id: string
  event_id: string | null
  title: string
  day_number: number | null
  created_at: string
}

// === gallery_photos ===
export interface GalleryPhoto {
  id: string
  album_id: string | null
  file_url: string
  thumbnail_url: string | null
  caption: string | null
  uploaded_by: string | null
  created_at: string
}

// === rooms ===
export interface Room {
  id: string
  event_id: string | null
  name: string
  capacity: number | null
  gender: string | null
  floor: string | null
}

// === room_assignments ===
export interface RoomAssignment {
  id: string
  room_id: string | null
  participant_id: string | null
}

// === 회계: 예산 카테고리 ===
export type IncomeCategory = 'registration_fee' | 'donation' | 'sponsorship' | 'other'

export type ExpenseCategory = 'food' | 'accommodation' | 'transportation' | 'materials' | 'equipment' | 'insurance' | 'venue' | 'other'

export interface BudgetCategory {
  id: string
  event_id: string
  name: string
  planned_amount: number
  created_at: string
}

// === 회계: 수입 기록 ===
export interface IncomeRecord {
  id: string
  event_id: string
  participant_id: string | null
  category: IncomeCategory
  amount: number
  description: string
  paid_at: string | null
  department?: string | null
  created_at: string
}

// === 회계: 지출 기록 ===
export interface ExpenseRecord {
  id: string
  event_id: string
  category: ExpenseCategory
  amount: number
  description: string
  receipt_url: string | null
  paid_by: string | null
  paid_at: string | null
  department?: string | null
  created_at: string
}
