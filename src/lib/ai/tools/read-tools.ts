import { tool } from 'ai'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

export function createReadTools(supabase: SupabaseClient) {
  return {
    searchParticipants: tool({
      description:
        'Search participants by name, phone number, or group. ' +
        'Use when user asks to find, look up, or list participants.',
      inputSchema: z.object({
        query: z.string().max(100).describe('Search term (name, phone, or group name)'),
        searchType: z
          .enum(['name', 'phone', 'group'])
          .optional()
          .describe('Field to search. If omitted, searches name.'),
        limit: z.number().optional().default(20).describe('Max results'),
      }),
      execute: async ({ query, searchType, limit }) => {
        const sanitized = query.replace(/[;'"\\]/g, '').slice(0, 100)
        const maxResults = limit ?? 20

        if (searchType === 'group') {
          const { data: groups } = await supabase
            .from('groups')
            .select('id')
            .ilike('name', `%${sanitized}%`)

          if (!groups?.length) return { participants: [], total: 0 }

          const groupIds = groups.map((g) => g.id)
          const { data: members } = await supabase
            .from('group_members')
            .select('participant_id')
            .in('group_id', groupIds)

          if (!members?.length) return { participants: [], total: 0 }

          const participantIds = members.map((m) => m.participant_id)
          const { data, error, count } = await supabase
            .from('participants')
            .select('id, name, phone, gender, grade, fee_paid', { count: 'exact' })
            .in('id', participantIds)
            .limit(maxResults)

          if (error) throw new Error('참가자 검색에 실패했어요')
          return { participants: data ?? [], total: count ?? 0 }
        }

        const field = searchType === 'phone' ? 'phone' : 'name'
        const { data, error, count } = await supabase
          .from('participants')
          .select('id, name, phone, gender, grade, fee_paid', { count: 'exact' })
          .ilike(field, `%${sanitized}%`)
          .limit(maxResults)

        if (error) throw new Error('참가자 검색에 실패했어요')
        return { participants: data ?? [], total: count ?? 0 }
      },
    }),

    getParticipantDetail: tool({
      description:
        'Get detailed info for a specific participant including attendance, points, and quiz scores.',
      inputSchema: z.object({
        participantId: z.string().describe('Participant ID'),
      }),
      execute: async ({ participantId }) => {
        const [participantRes, attendanceRes, pointsRes] = await Promise.all([
          supabase.from('participants').select('*').eq('id', participantId).single(),
          supabase
            .from('attendance')
            .select('status')
            .eq('participant_id', participantId),
          supabase
            .from('points')
            .select('amount, category, description')
            .eq('participant_id', participantId),
        ])

        if (participantRes.error) throw new Error('참가자 정보를 찾을 수 없어요')

        const attendance = attendanceRes.data ?? []
        const totalSessions = attendance.length
        const present = attendance.filter((a) => a.status === 'present').length
        const rate = totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 0

        const points = pointsRes.data ?? []
        const totalPoints = points.reduce((sum, p) => sum + p.amount, 0)

        return {
          participant: participantRes.data,
          attendance: { total: totalSessions, present, rate: `${rate}%` },
          points: { total: totalPoints, details: points },
        }
      },
    }),

    getGroupMembers: tool({
      description: 'Get members of a specific group by group name or ID.',
      inputSchema: z.object({
        groupName: z.string().optional().describe('Group name to search'),
        groupId: z.string().optional().describe('Group ID'),
      }),
      execute: async ({ groupName, groupId }) => {
        let targetGroupId = groupId

        if (!targetGroupId && groupName) {
          const sanitized = groupName.replace(/[;'"\\]/g, '')
          const { data: groups } = await supabase
            .from('groups')
            .select('id, name, color, total_points')
            .ilike('name', `%${sanitized}%`)
            .limit(1)

          if (!groups?.length) return { group: null, members: [], message: '해당 조를 찾을 수 없어요' }
          targetGroupId = groups[0].id
        }

        if (!targetGroupId) return { group: null, members: [], message: '조 이름이나 ID를 알려주세요' }

        const [groupRes, membersRes] = await Promise.all([
          supabase.from('groups').select('*').eq('id', targetGroupId).single(),
          supabase
            .from('group_members')
            .select('participant_id, participants(id, name, phone, gender, grade)')
            .eq('group_id', targetGroupId),
        ])

        return {
          group: groupRes.data,
          members: membersRes.data ?? [],
        }
      },
    }),

    getSchedule: tool({
      description: 'Get schedules for a specific date, day number, or date range.',
      inputSchema: z.object({
        date: z.string().optional().describe('Date in YYYY-MM-DD format'),
        dayNumber: z.number().optional().describe('Day number of the event (1, 2, 3...)'),
      }),
      execute: async ({ date, dayNumber }) => {
        let query = supabase
          .from('schedules')
          .select('id, title, type, start_time, end_time, location, speaker, description, day_number, order_index')
          .order('day_number', { ascending: true })
          .order('order_index', { ascending: true })

        if (dayNumber) query = query.eq('day_number', dayNumber)
        if (date) query = query.eq('date', date)

        const { data, error } = await query
        if (error) throw new Error('일정 조회에 실패했어요')
        return { schedules: data ?? [] }
      },
    }),

    getAttendanceSummary: tool({
      description:
        'Get attendance summary. Shows present/absent/late/excused counts and percentages.',
      inputSchema: z.object({
        scheduleId: z.string().optional().describe('Specific schedule/session ID'),
        date: z.string().optional().describe('Date in YYYY-MM-DD format'),
      }),
      execute: async ({ scheduleId, date }) => {
        let query = supabase.from('attendance').select('status, participant_id, schedule_id')

        if (scheduleId) query = query.eq('schedule_id', scheduleId)
        if (date) {
          const { data: schedules } = await supabase
            .from('schedules')
            .select('id')
            .eq('date', date)
          const scheduleIds = schedules?.map((s) => s.id) ?? []
          if (scheduleIds.length > 0) query = query.in('schedule_id', scheduleIds)
        }

        const { data, error } = await query
        if (error) throw new Error('출석 현황 조회에 실패했어요')

        const records = data ?? []
        const total = records.length
        const present = records.filter((r) => r.status === 'present').length
        const absent = records.filter((r) => r.status === 'absent').length
        const late = records.filter((r) => r.status === 'late').length
        const excused = records.filter((r) => r.status === 'excused').length

        return {
          total,
          present,
          absent,
          late,
          excused,
          presentRate: total > 0 ? `${Math.round((present / total) * 100)}%` : '0%',
        }
      },
    }),

    getQuizResults: tool({
      description: 'Get quiz results, scores, and rankings.',
      inputSchema: z.object({
        quizId: z.string().optional().describe('Specific quiz ID'),
        limit: z.number().optional().default(10).describe('Number of top results'),
      }),
      execute: async ({ quizId, limit }) => {
        if (quizId) {
          const quizRes = await supabase.from('quizzes').select('*').eq('id', quizId).single()

          const { data: questions } = await supabase
            .from('quiz_questions')
            .select('id')
            .eq('quiz_id', quizId)

          const questionIds = questions?.map((q) => q.id) ?? []

          let responses: unknown[] = []
          if (questionIds.length > 0) {
            const { data } = await supabase
              .from('quiz_responses')
              .select('participant_id, is_correct, points_earned, participants(name)')
              .in('question_id', questionIds)
              .order('points_earned', { ascending: false })
              .limit(limit ?? 10)
            responses = data ?? []
          }

          return { quiz: quizRes.data, responses }
        }

        const { data, error } = await supabase
          .from('quizzes')
          .select('id, title, type, is_active, points_per_question')
          .order('created_at', { ascending: false })

        if (error) throw new Error('퀴즈 조회에 실패했어요')
        return { quizzes: data ?? [] }
      },
    }),

    getPointsRanking: tool({
      description: 'Get individual or group points ranking.',
      inputSchema: z.object({
        type: z.enum(['individual', 'group']).describe('Ranking type'),
        limit: z.number().optional().default(10).describe('Number of top results'),
      }),
      execute: async ({ type, limit }) => {
        if (type === 'group') {
          const { data, error } = await supabase
            .from('groups')
            .select('id, name, color, total_points')
            .order('total_points', { ascending: false })
            .limit(limit ?? 10)

          if (error) throw new Error('조별 순위 조회에 실패했어요')
          return { ranking: data ?? [], type: 'group' }
        }

        const { data, error } = await supabase
          .from('points')
          .select('participant_id, amount, participants(name)')
          .order('amount', { ascending: false })
          .limit(limit ?? 10)

        if (error) throw new Error('개인 순위 조회에 실패했어요')
        return { ranking: data ?? [], type: 'individual' }
      },
    }),

    getAnnouncements: tool({
      description: 'Get announcements list, optionally filtered by type.',
      inputSchema: z.object({
        type: z
          .enum(['general', 'urgent', 'group'])
          .optional()
          .describe('Announcement type filter'),
        limit: z.number().optional().default(10),
      }),
      execute: async ({ type, limit }) => {
        let query = supabase
          .from('announcements')
          .select('id, title, content, type, is_pinned, created_at')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(limit ?? 10)

        if (type) query = query.eq('type', type)

        const { data, error } = await query
        if (error) throw new Error('공지사항 조회에 실패했어요')
        return { announcements: data ?? [] }
      },
    }),

    getEventInfo: tool({
      description: 'Get basic event information (name, dates, location, type).',
      inputSchema: z.object({
        eventId: z.string().optional().describe('Event ID. If omitted, returns the latest event.'),
      }),
      execute: async ({ eventId }) => {
        const baseQuery = supabase
          .from('events')
          .select('id, name, type, start_date, end_date, location, description, settings')

        const { data, error } = eventId
          ? await baseQuery.eq('id', eventId).single()
          : await baseQuery.order('created_at', { ascending: false }).limit(1).single()

        if (error) throw new Error('행사 정보를 찾을 수 없어요')
        return { event: data }
      },
    }),

    getMaterials: tool({
      description: 'Get learning materials (textbooks, hymns, worksheets) by category or day.',
      inputSchema: z.object({
        category: z
          .enum(['textbook', 'hymn', 'worksheet', 'video', 'other'])
          .optional()
          .describe('Material category'),
        dayNumber: z.number().optional().describe('Day number'),
      }),
      execute: async ({ category, dayNumber }) => {
        let query = supabase
          .from('materials')
          .select('id, title, category, file_url, file_type, file_size, day_number')
          .order('day_number', { ascending: true })

        if (category) query = query.eq('category', category)
        if (dayNumber) query = query.eq('day_number', dayNumber)

        const { data, error } = await query
        if (error) throw new Error('자료 조회에 실패했어요')
        return { materials: data ?? [] }
      },
    }),

    getGalleryPhotos: tool({
      description: 'Get gallery albums and photos by day or album.',
      inputSchema: z.object({
        dayNumber: z.number().optional().describe('Day number'),
        albumId: z.string().optional().describe('Album ID'),
        limit: z.number().optional().default(20),
      }),
      execute: async ({ dayNumber, albumId, limit }) => {
        if (albumId) {
          const [albumRes, photosRes] = await Promise.all([
            supabase.from('gallery_albums').select('*').eq('id', albumId).single(),
            supabase
              .from('gallery_photos')
              .select('id, file_url, thumbnail_url, caption, created_at')
              .eq('album_id', albumId)
              .order('created_at', { ascending: false })
              .limit(limit ?? 20),
          ])
          return { album: albumRes.data, photos: photosRes.data ?? [] }
        }

        let query = supabase
          .from('gallery_albums')
          .select('id, title, day_number')
          .order('day_number', { ascending: true })

        if (dayNumber) query = query.eq('day_number', dayNumber)

        const { data, error } = await query
        if (error) throw new Error('갤러리 조회에 실패했어요')
        return { albums: data ?? [] }
      },
    }),

    getRoomInfo: tool({
      description: 'Get room assignments and accommodation info.',
      inputSchema: z.object({
        roomName: z.string().optional().describe('Room name to search'),
        participantName: z.string().optional().describe('Participant name to find their room'),
      }),
      execute: async ({ roomName, participantName }) => {
        if (participantName) {
          const sanitized = participantName.replace(/[;'"\\]/g, '')
          const { data } = await supabase
            .from('participants')
            .select('id, name')
            .ilike('name', `%${sanitized}%`)
            .limit(1)

          if (!data?.length) return { message: '해당 참가자를 찾을 수 없어요' }

          const { data: assignment } = await supabase
            .from('room_assignments')
            .select('rooms(id, name, floor, gender, capacity)')
            .eq('participant_id', data[0].id)
            .single()

          return { participant: data[0], room: assignment?.rooms ?? null }
        }

        if (roomName) {
          const sanitized = roomName.replace(/[;'"\\]/g, '')
          const { data: rooms } = await supabase
            .from('rooms')
            .select('id, name, capacity, gender, floor')
            .ilike('name', `%${sanitized}%`)

          if (!rooms?.length) return { message: '해당 방을 찾을 수 없어요' }

          const { data: assignments } = await supabase
            .from('room_assignments')
            .select('participants(id, name, gender)')
            .eq('room_id', rooms[0].id)

          return { room: rooms[0], occupants: assignments ?? [] }
        }

        const { data, error } = await supabase
          .from('rooms')
          .select('id, name, capacity, gender, floor')
          .order('floor', { ascending: true })
          .order('name', { ascending: true })

        if (error) throw new Error('숙소 정보 조회에 실패했어요')
        return { rooms: data ?? [] }
      },
    }),

    getProfiles: tool({
      description: 'Get user profiles (teachers, admins, staff list).',
      inputSchema: z.object({
        role: z
          .enum(['admin', 'staff', 'student', 'parent'])
          .optional()
          .describe('Filter by role'),
      }),
      execute: async ({ role }) => {
        let query = supabase
          .from('profiles')
          .select('id, name, role, phone, avatar_url')
          .order('name', { ascending: true })

        if (role) query = query.eq('role', role)

        const { data, error } = await query.limit(50)
        if (error) throw new Error('프로필 조회에 실패했어요')
        return { profiles: data ?? [] }
      },
    }),
  }
}
