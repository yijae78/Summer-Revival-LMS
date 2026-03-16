import { z } from 'zod'

const PHONE_REGEX = /^010-\d{4}-\d{4}$/

export const participantSchema = z
  .object({
    name: z
      .string()
      .min(2, '이름은 2글자 이상 입력해 주세요')
      .max(20, '이름은 20글자 이하로 입력해 주세요'),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 생년월일을 선택해 주세요'),
    gender: z.enum(['male', 'female'], {
      error: '성별을 선택해 주세요',
    }),
    grade: z.string().optional(),
    phone: z
      .string()
      .regex(PHONE_REGEX, '올바른 전화번호를 입력해 주세요')
      .optional()
      .or(z.literal('')),
    parentPhone: z
      .string()
      .regex(PHONE_REGEX, '올바른 보호자 전화번호를 입력해 주세요')
      .optional()
      .or(z.literal('')),
    emergencyContact: z
      .string()
      .min(1, '비상연락처를 입력해 주세요'),
    healthInfo: z.string().optional(),
    dietaryRestrictions: z.string().optional(),
    transportation: z
      .enum(['car', 'bus', 'other'])
      .optional(),
    consentPersonalInfo: z.literal(true, {
      error: '개인정보 수집 및 이용에 동의해 주세요',
    }),
    consentSensitiveInfo: z.literal(true, {
      error: '민감정보 수집 및 이용에 동의해 주세요',
    }),
    consentPhotoVideo: z.literal(true, {
      error: '사진/영상 촬영 및 활용에 동의해 주세요',
    }),
    consentOverseasTransfer: z.literal(true, {
      error: '개인정보 국외 이전에 동의해 주세요',
    }),
    eventId: z.string().uuid('올바른 행사 정보가 아니에요'),
  })
  .check((ctx) => {
    // Calculate age from birthDate
    const birth = new Date(ctx.value.birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    // If minor (under 14), parentPhone is required
    if (age < 14 && (!ctx.value.parentPhone || ctx.value.parentPhone === '')) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value.parentPhone,
        message: '만 14세 미만은 보호자 연락처를 입력해 주세요',
        path: ['parentPhone'],
      })
    }
  })

export type ParticipantFormValues = z.infer<typeof participantSchema>
