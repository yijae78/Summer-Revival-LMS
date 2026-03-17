// Department definitions with emoji, gradient, and grade mapping
// Shared across all pages that need department filtering

export interface DepartmentDef {
  key: string
  label: string
  emoji: string
  gradient: string
  subGrades: string[]
}

export const DEPARTMENTS: DepartmentDef[] = [
  { key: 'all', label: '전체', emoji: '👥', gradient: 'from-slate-500 to-slate-600', subGrades: [] },
  { key: 'kindergarten', label: '유치부', emoji: '🧒', gradient: 'from-pink-500 to-rose-500', subGrades: ['유치부'] },
  { key: 'children', label: '아동부', emoji: '🌱', gradient: 'from-emerald-500 to-green-500', subGrades: ['초1', '초2', '초3'] },
  { key: 'elementary', label: '초등부', emoji: '📚', gradient: 'from-sky-500 to-blue-500', subGrades: ['초4', '초5', '초6'] },
  { key: 'middle', label: '중등부', emoji: '⚡', gradient: 'from-indigo-500 to-purple-500', subGrades: ['중1', '중2', '중3'] },
  { key: 'high', label: '고등부', emoji: '🔥', gradient: 'from-orange-500 to-amber-500', subGrades: ['고1', '고2', '고3'] },
  { key: 'college', label: '청년부', emoji: '✨', gradient: 'from-fuchsia-500 to-purple-500', subGrades: ['대학생'] },
  { key: 'adult', label: '교사', emoji: '🙏', gradient: 'from-cyan-500 to-teal-500', subGrades: ['교사'] },
]

// All departments except 'all'
export const DEPARTMENT_LIST = DEPARTMENTS.filter((d) => d.key !== 'all')

// Get department key from a participant's grade
export function getDepartmentKeyFromGrade(grade: string | null): string | null {
  if (!grade) return null
  const dept = DEPARTMENT_LIST.find((d) => d.subGrades.includes(grade))
  return dept?.key ?? null
}

// Get department definition by key
export function getDepartmentByKey(key: string): DepartmentDef | undefined {
  return DEPARTMENTS.find((d) => d.key === key)
}

// Check if a grade belongs to a department
export function matchDepartment(grade: string | null, deptKey: string): boolean {
  if (deptKey === 'all') return true
  if (!grade) return false
  const dept = DEPARTMENTS.find((d) => d.key === deptKey)
  if (!dept) return false
  return dept.subGrades.includes(grade)
}

// Department theme colors for page-wide theming
export interface DepartmentTheme {
  primary: string       // main RGB (e.g. '99,102,241')
  secondary: string     // accent RGB
  text: string          // tailwind text class
  border: string        // tailwind border class
  cardBg: string        // card gradient
  cardBorder: string    // card border color
  headerGlow: string    // header banner glow RGB
}

const DEPARTMENT_THEMES: Record<string, DepartmentTheme> = {
  all: {
    primary: '99,102,241', secondary: '139,92,246',
    text: 'text-indigo-300', border: 'border-indigo-500/20',
    cardBg: 'from-indigo-500/10 to-purple-500/5',
    cardBorder: 'border-indigo-500/15',
    headerGlow: '139,92,246',
  },
  kindergarten: {
    primary: '236,72,153', secondary: '244,63,94',
    text: 'text-pink-300', border: 'border-pink-500/20',
    cardBg: 'from-pink-500/10 to-rose-500/5',
    cardBorder: 'border-pink-500/15',
    headerGlow: '236,72,153',
  },
  children: {
    primary: '16,185,129', secondary: '34,197,94',
    text: 'text-emerald-300', border: 'border-emerald-500/20',
    cardBg: 'from-emerald-500/10 to-green-500/5',
    cardBorder: 'border-emerald-500/15',
    headerGlow: '16,185,129',
  },
  elementary: {
    primary: '14,165,233', secondary: '59,130,246',
    text: 'text-sky-300', border: 'border-sky-500/20',
    cardBg: 'from-sky-500/10 to-blue-500/5',
    cardBorder: 'border-sky-500/15',
    headerGlow: '14,165,233',
  },
  middle: {
    primary: '99,102,241', secondary: '139,92,246',
    text: 'text-indigo-300', border: 'border-indigo-500/20',
    cardBg: 'from-indigo-500/10 to-purple-500/5',
    cardBorder: 'border-indigo-500/15',
    headerGlow: '139,92,246',
  },
  high: {
    primary: '249,115,22', secondary: '245,158,11',
    text: 'text-orange-300', border: 'border-orange-500/20',
    cardBg: 'from-orange-500/10 to-amber-500/5',
    cardBorder: 'border-orange-500/15',
    headerGlow: '249,115,22',
  },
  college: {
    primary: '232,121,249', secondary: '168,85,247',
    text: 'text-fuchsia-300', border: 'border-fuchsia-500/20',
    cardBg: 'from-fuchsia-500/10 to-purple-500/5',
    cardBorder: 'border-fuchsia-500/15',
    headerGlow: '232,121,249',
  },
  adult: {
    primary: '6,182,212', secondary: '45,212,191',
    text: 'text-cyan-300', border: 'border-cyan-500/20',
    cardBg: 'from-cyan-500/10 to-teal-500/5',
    cardBorder: 'border-cyan-500/15',
    headerGlow: '6,182,212',
  },
}

export function getDepartmentTheme(key: string): DepartmentTheme {
  return DEPARTMENT_THEMES[key] ?? DEPARTMENT_THEMES.all
}
