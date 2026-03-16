import { z } from 'zod'

export const createMaterialSchema = z.object({
  eventId: z.string().min(1),
  title: z.string().min(1, '제목을 입력해 주세요'),
  category: z.enum(['textbook', 'hymn', 'worksheet', 'video', 'other']),
  fileUrl: z.string().url('올바른 파일 URL을 입력해 주세요'),
  fileType: z.string().nullable().default(null),
  fileSize: z.number().nullable().default(null),
  dayNumber: z.number().nullable().default(null),
})

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>
