import { tool } from 'ai'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

export function createWriteTools(supabase: SupabaseClient) {
  return {
    markAttendance: tool({
      description:
        'Mark attendance status for a participant. Requires approval before execution.',
      inputSchema: z.object({
        participantId: z.string().describe('Participant ID'),
        scheduleId: z.string().describe('Schedule/session ID'),
        status: z.enum(['present', 'absent', 'late', 'excused']).describe('Attendance status'),
      }),
      execute: async ({ participantId, scheduleId, status }) => {
        const { error } = await supabase.from('attendance').upsert(
          {
            participant_id: participantId,
            schedule_id: scheduleId,
            status,
            checked_at: new Date().toISOString(),
          },
          { onConflict: 'schedule_id,participant_id' }
        )

        if (error) throw new Error('출석 체크에 실패했어요')
        return { success: true, message: `출석 상태를 '${status}'로 변경했어요` }
      },
    }),

    updateParticipant: tool({
      description: 'Update participant information (e.g., move to different group).',
      inputSchema: z.object({
        participantId: z.string().describe('Participant ID'),
        updates: z
          .object({
            name: z.string().optional(),
            phone: z.string().optional(),
            group_id: z.string().optional(),
            fee_paid: z.boolean().optional(),
          })
          .describe('Fields to update'),
      }),
      execute: async ({ participantId, updates }) => {
        const { error } = await supabase
          .from('participants')
          .update(updates)
          .eq('id', participantId)

        if (error) throw new Error('참가자 정보 수정에 실패했어요')
        return { success: true, message: '참가자 정보를 수정했어요' }
      },
    }),

    createAnnouncement: tool({
      description: 'Create a new announcement.',
      inputSchema: z.object({
        title: z.string().max(200).describe('Announcement title'),
        content: z.string().max(2000).describe('Announcement content'),
        type: z
          .enum(['general', 'urgent', 'group'])
          .optional()
          .default('general')
          .describe('Announcement type'),
        isPinned: z.boolean().optional().default(false).describe('Pin to top'),
      }),
      execute: async ({ title, content, type, isPinned }) => {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error('인증이 필요해요')

        const { data: events } = await supabase
          .from('events')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1)

        if (!events?.length) throw new Error('행사가 없어서 공지를 작성할 수 없어요')

        const { error } = await supabase.from('announcements').insert({
          event_id: events[0].id,
          title,
          content,
          type: type ?? 'general',
          is_pinned: isPinned ?? false,
          author_id: user.id,
        })

        if (error) throw new Error('공지사항 작성에 실패했어요')
        return { success: true, message: '공지사항을 작성했어요' }
      },
    }),

    assignPoints: tool({
      description: 'Assign points to a participant or group.',
      inputSchema: z.object({
        participantId: z.string().optional().describe('Participant ID (for individual points)'),
        groupId: z.string().optional().describe('Group ID (for group points)'),
        amount: z.number().min(-1000).max(1000).describe('Points amount (negative to deduct)'),
        category: z
          .enum(['attendance', 'quiz', 'activity', 'bonus'])
          .describe('Points category'),
        description: z.string().max(200).optional().describe('Reason for points'),
      }),
      execute: async ({ participantId, groupId, amount, category, description }) => {
        if (!participantId && !groupId) {
          throw new Error('참가자 ID 또는 조 ID가 필요해요')
        }

        const { data: events } = await supabase
          .from('events')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1)

        if (!events?.length) throw new Error('행사가 없어서 포인트를 부여할 수 없어요')

        const { error } = await supabase.from('points').insert({
          event_id: events[0].id,
          participant_id: participantId ?? null,
          group_id: groupId ?? null,
          amount,
          category,
          description: description ?? '',
        })

        if (error) throw new Error('포인트 부여에 실패했어요')

        if (groupId) {
          await supabase.rpc('increment_group_points', {
            p_group_id: groupId,
            p_amount: amount,
          })
        }

        return {
          success: true,
          message: `${amount > 0 ? '+' : ''}${amount}점을 부여했어요`,
        }
      },
    }),
  }
}
