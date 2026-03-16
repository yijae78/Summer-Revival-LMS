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
  schedules: (eventId: string, day?: number) =>
    ['schedules', eventId, ...(day != null ? [day] : [])] as const,

  // Attendance
  attendance: (scheduleId: string) => ['attendance', scheduleId] as const,
  attendanceSummary: (eventId: string, date?: string) =>
    ['attendanceSummary', eventId, ...(date ? [date] : [])] as const,

  // Groups
  groups: (eventId: string) => ['groups', eventId] as const,
  group: (id: string) => ['group', id] as const,
  groupMembers: (groupId: string) => ['groupMembers', groupId] as const,

  // Points
  points: (eventId: string, type?: 'individual' | 'group') =>
    ['points', eventId, ...(type ? [type] : [])] as const,

  // Quizzes
  quizzes: (eventId: string) => ['quizzes', eventId] as const,
  quiz: (id: string) => ['quiz', id] as const,
  quizResponses: (quizId: string) => ['quizResponses', quizId] as const,

  // Announcements
  announcements: (eventId: string, type?: string) =>
    ['announcements', eventId, ...(type ? [type] : [])] as const,

  // Materials
  materials: (eventId: string, category?: string) =>
    ['materials', eventId, ...(category ? [category] : [])] as const,

  // Gallery
  albums: (eventId: string) => ['albums', eventId] as const,
  photos: (albumId: string) => ['photos', albumId] as const,

  // Rooms
  rooms: (eventId: string) => ['rooms', eventId] as const,
} as const
