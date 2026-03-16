/**
 * Seeds the local database (localStorage) with demo data as a starting point.
 * Only seeds tables that are currently empty — does not overwrite existing data.
 */

import { getAll } from '@/lib/local-db'
import {
  DEMO_EVENT,
  DEMO_PARTICIPANTS,
  DEMO_SCHEDULES,
  DEMO_GROUPS,
  DEMO_GROUP_MEMBERS,
  DEMO_ATTENDANCE,
  DEMO_ANNOUNCEMENTS,
  DEMO_QUIZZES,
  DEMO_QUIZ_QUESTIONS,
  DEMO_QUIZ_RESPONSES,
  DEMO_POINTS,
  DEMO_MATERIALS,
  DEMO_ALBUMS,
  DEMO_PHOTOS,
  DEMO_USER,
  DEMO_BUDGET_CATEGORIES,
  DEMO_INCOME_RECORDS,
  DEMO_EXPENSE_RECORDS,
} from '@/lib/demo/data'

const PREFIX = 'local-db-'

function seedTable(tableName: string, data: ReadonlyArray<unknown>): void {
  const existing = getAll(tableName)
  if (existing.length > 0) return

  if (typeof window === 'undefined') return
  localStorage.setItem(`${PREFIX}${tableName}`, JSON.stringify(data))
}

export function seedLocalDatabase(): void {
  seedTable('events', [DEMO_EVENT])
  seedTable('participants', DEMO_PARTICIPANTS)
  seedTable('schedules', DEMO_SCHEDULES)
  seedTable('groups', DEMO_GROUPS)
  seedTable('group_members', DEMO_GROUP_MEMBERS)
  seedTable('attendance', DEMO_ATTENDANCE)
  seedTable('announcements', DEMO_ANNOUNCEMENTS)
  seedTable('quizzes', DEMO_QUIZZES)
  seedTable('quiz_questions', DEMO_QUIZ_QUESTIONS)
  seedTable('quiz_responses', DEMO_QUIZ_RESPONSES)
  seedTable('points', DEMO_POINTS)
  seedTable('materials', DEMO_MATERIALS)
  seedTable('gallery_albums', DEMO_ALBUMS)
  seedTable('gallery_photos', DEMO_PHOTOS)
  seedTable('profiles', [DEMO_USER])
  seedTable('budget_categories', DEMO_BUDGET_CATEGORIES)
  seedTable('income_records', DEMO_INCOME_RECORDS)
  seedTable('expense_records', DEMO_EXPENSE_RECORDS)
}
