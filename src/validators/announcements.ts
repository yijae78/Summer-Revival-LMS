import { z } from 'zod'

export const createAnnouncementSchema = z.object({
  eventId: z.string().min(1),
  title: z.string().min(1, '제목을 입력해 주세요'),
  content: z.string().min(1, '내용을 입력해 주세요'),
  type: z.enum(['general', 'urgent', 'group']),
  isPinned: z.boolean().default(false),
})

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>
