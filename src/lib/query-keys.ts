export const queryKeys = {
  // Auth & User
  user: () => ['user'] as const,

  // Events
  events: () => ['events'] as const,
  event: (id: string) => ['event', id] as const,

  // Participants
  participants: (eventId: string, filters?: Record<string, unknown>) =>
    ['participants', eventId, ...(filters ? [filters] : [])] as const,
  participant: (id: string) => ['participant', id] as const,

  // Schedules
  schedules: (eventId: string, day?: number, department?: string) =>
    ['schedules', eventId, ...(day != null ? [day] : []), ...(department ? [department] : [])] as const,

  // Attendance
  attendance: (scheduleId: string) => ['attendance', scheduleId] as const,
  attendanceSummary: (eventId: string, date?: string) =>
    ['attendanceSummary', eventId, ...(date ? [date] : [])] as const,

  // Groups
  groups: (eventId: string, department?: string) =>
    ['groups', eventId, ...(department ? [department] : [])] as const,
  group: (id: string) => ['group', id] as const,
  groupMembers: (groupId: string) => ['groupMembers', groupId] as const,

  // Points
  points: (eventId: string, type?: 'individual' | 'group', department?: string) =>
    ['points', eventId, ...(type ? [type] : []), ...(department ? [department] : [])] as const,

  // Quizzes
  quizzes: (eventId: string) => ['quizzes', eventId] as const,
  quiz: (id: string) => ['quiz', id] as const,
  quizResponses: (quizId: string) => ['quizResponses', quizId] as const,

  // Announcements
  announcements: (eventId: string, type?: string, department?: string) =>
    ['announcements', eventId, ...(type ? [type] : []), ...(department ? [department] : [])] as const,

  // Materials
  materials: (eventId: string, category?: string, department?: string) =>
    ['materials', eventId, ...(category ? [category] : []), ...(department ? [department] : [])] as const,

  // Gallery
  albums: (eventId: string) => ['albums', eventId] as const,
  photos: (albumId: string) => ['photos', albumId] as const,

  // Rooms
  rooms: (eventId: string) => ['rooms', eventId] as const,

  // Accounting
  accounting: (eventId: string, department?: string) =>
    ['accounting', eventId, ...(department ? [department] : [])] as const,
} as const
