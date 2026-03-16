'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

import { participantSchema } from '@/validators/participant'
import { registerParticipant } from '@/actions/participants'
import { formatPhoneNumber } from '@/lib/utils/format-phone'
import { cn } from '@/lib/utils'

import type { ParticipantFormValues } from '@/validators/participant'

interface ParticipantFormProps {
  eventId: string
  eventName: string
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 80 }, (_, i) => CURRENT_YEAR - i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

const GRADE_OPTIONS = [
  { value: 'elementary_1', label: '초등 1학년' },
  { value: 'elementary_2', label: '초등 2학년' },
  { value: 'elementary_3', label: '초등 3학년' },
  { value: 'elementary_4', label: '초등 4학년' },
  { value: 'elementary_5', label: '초등 5학년' },
  { value: 'elementary_6', label: '초등 6학년' },
  { value: 'middle_1', label: '중등 1학년' },
  { value: 'middle_2', label: '중등 2학년' },
  { value: 'middle_3', label: '중등 3학년' },
  { value: 'high_1', label: '고등 1학년' },
  { value: 'high_2', label: '고등 2학년' },
  { value: 'high_3', label: '고등 3학년' },
  { value: 'college', label: '대학생' },
  { value: 'adult', label: '성인' },
]

const CONSENT_ITEMS = [
  {
    id: 'consentPersonalInfo' as const,
    title: '개인정보 수집 및 이용 동의 (필수)',
    description:
      '행사 운영을 위해 성명, 생년월일, 성별, 연락처, 비상연락처를 수집합니다. 수집된 정보는 행사 종료 후 30일 이내에 파기됩니다.',
  },
  {
    id: 'consentSensitiveInfo' as const,
    title: '민감정보 수집 및 이용 동의 (필수)',
    description:
      '안전한 행사 운영을 위해 건강 정보 및 식이 제한 사항을 수집합니다. 해당 정보는 응급 상황 대응 및 식사 준비에만 사용됩니다.',
  },
  {
    id: 'consentPhotoVideo' as const,
    title: '사진/영상 촬영 및 활용 동의 (필수)',
    description:
      '행사 중 촬영된 사진/영상은 교회 내부 기록, 홍보 자료, SNS 등에 활용될 수 있습니다. 촬영을 원하지 않을 경우 현장에서 별도 요청해 주세요.',
  },
  {
    id: 'consentOverseasTransfer' as const,
    title: '개인정보 국외 이전 동의 (필수)',
    description:
      '입력하신 정보는 데이터 처리를 위해 해외 클라우드 서버(Supabase, AWS)에 저장될 수 있습니다. 해당 서버는 국제 보안 기준을 충족합니다.',
  },
]

export function ParticipantForm({ eventId, eventName }: ParticipantFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [birthYear, setBirthYear] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthDay, setBirthDay] = useState('')

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ParticipantFormValues>({
    resolver: standardSchemaResolver(participantSchema),
    defaultValues: {
      eventId,
      name: '',
      birthDate: '',
      gender: undefined,
      grade: '',
      phone: '',
      parentPhone: '',
      emergencyContact: '',
      healthInfo: '',
      dietaryRestrictions: '',
      transportation: undefined,
      consentPersonalInfo: false as unknown as true,
      consentSensitiveInfo: false as unknown as true,
      consentPhotoVideo: false as unknown as true,
      consentOverseasTransfer: false as unknown as true,
    },
  })

  function handleBirthDateChange(part: 'year' | 'month' | 'day', value: string) {
    const y = part === 'year' ? value : birthYear
    const m = part === 'month' ? value : birthMonth
    const d = part === 'day' ? value : birthDay

    if (part === 'year') setBirthYear(value)
    if (part === 'month') setBirthMonth(value)
    if (part === 'day') setBirthDay(value)

    if (y && m && d) {
      const dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
      setValue('birthDate', dateStr, { shouldValidate: true })
    }
  }

  function handlePhoneInput(
    field: 'phone' | 'parentPhone' | 'emergencyContact',
    value: string
  ) {
    const formatted = formatPhoneNumber(value)
    setValue(field, formatted, { shouldValidate: true })
  }

  async function onSubmit(data: ParticipantFormValues) {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })

    const result = await registerParticipant(formData)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('참가 신청이 완료되었어요!')
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          참가 신청이 완료되었어요!
        </h3>
        <p className="mt-1.5 text-[0.9375rem] text-muted-foreground">
          {eventName}에 참가 신청해 주셔서 감사해요.
          <br />
          담당자가 확인 후 연락드릴게요.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register('eventId')} />

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">이름 *</Label>
        <Input
          id="name"
          placeholder="이름을 입력해 주세요"
          className="h-12"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Birth Date - 3 selects */}
      <div className="space-y-2">
        <Label>생년월일 *</Label>
        <div className="grid grid-cols-3 gap-2">
          <Select
            value={birthYear}
            onValueChange={(v) => handleBirthDateChange('year', v)}
          >
            <SelectTrigger className="h-12 w-full">
              <SelectValue placeholder="년도" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}년
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={birthMonth}
            onValueChange={(v) => handleBirthDateChange('month', v)}
          >
            <SelectTrigger className="h-12 w-full">
              <SelectValue placeholder="월" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {m}월
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={birthDay}
            onValueChange={(v) => handleBirthDateChange('day', v)}
          >
            <SelectTrigger className="h-12 w-full">
              <SelectValue placeholder="일" />
            </SelectTrigger>
            <SelectContent>
              {DAYS.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d}일
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <input type="hidden" {...register('birthDate')} />
        {errors.birthDate && (
          <p className="text-sm text-destructive">{errors.birthDate.message}</p>
        )}
      </div>

      {/* Gender - Radio */}
      <div className="space-y-2">
        <Label>성별 *</Label>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => field.onChange('male')}
                className={cn(
                  'flex h-12 items-center justify-center rounded-lg border text-[0.9375rem] font-medium transition-colors',
                  field.value === 'male'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                남자
              </button>
              <button
                type="button"
                onClick={() => field.onChange('female')}
                className={cn(
                  'flex h-12 items-center justify-center rounded-lg border text-[0.9375rem] font-medium transition-colors',
                  field.value === 'female'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                여자
              </button>
            </div>
          )}
        />
        {errors.gender && (
          <p className="text-sm text-destructive">{errors.gender.message}</p>
        )}
      </div>

      {/* Grade */}
      <div className="space-y-2">
        <Label htmlFor="grade">학년</Label>
        <Controller
          name="grade"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ''} onValueChange={field.onChange}>
              <SelectTrigger className="h-12 w-full">
                <SelectValue placeholder="학년을 선택해 주세요" />
              </SelectTrigger>
              <SelectContent>
                {GRADE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">연락처</Label>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Input
              id="phone"
              inputMode="tel"
              placeholder="010-0000-0000"
              className="h-12"
              value={field.value ?? ''}
              onChange={(e) => handlePhoneInput('phone', e.target.value)}
              aria-invalid={!!errors.phone}
            />
          )}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Parent Phone */}
      <div className="space-y-2">
        <Label htmlFor="parentPhone">보호자 연락처</Label>
        <p className="text-xs text-muted-foreground">
          만 14세 미만인 경우 필수로 입력해 주세요
        </p>
        <Controller
          name="parentPhone"
          control={control}
          render={({ field }) => (
            <Input
              id="parentPhone"
              inputMode="tel"
              placeholder="010-0000-0000"
              className="h-12"
              value={field.value ?? ''}
              onChange={(e) => handlePhoneInput('parentPhone', e.target.value)}
              aria-invalid={!!errors.parentPhone}
            />
          )}
        />
        {errors.parentPhone && (
          <p className="text-sm text-destructive">{errors.parentPhone.message}</p>
        )}
      </div>

      {/* Emergency Contact */}
      <div className="space-y-2">
        <Label htmlFor="emergencyContact">비상연락처 *</Label>
        <Controller
          name="emergencyContact"
          control={control}
          render={({ field }) => (
            <Input
              id="emergencyContact"
              inputMode="tel"
              placeholder="010-0000-0000"
              className="h-12"
              value={field.value ?? ''}
              onChange={(e) => handlePhoneInput('emergencyContact', e.target.value)}
              aria-invalid={!!errors.emergencyContact}
            />
          )}
        />
        {errors.emergencyContact && (
          <p className="text-sm text-destructive">{errors.emergencyContact.message}</p>
        )}
      </div>

      {/* Health Info */}
      <div className="space-y-2">
        <Label htmlFor="healthInfo">건강 관련 사항</Label>
        <textarea
          id="healthInfo"
          placeholder="알레르기, 지병, 복용 중인 약 등을 알려주세요"
          className="flex h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
          {...register('healthInfo')}
        />
      </div>

      {/* Dietary Restrictions */}
      <div className="space-y-2">
        <Label htmlFor="dietaryRestrictions">식이 제한</Label>
        <Input
          id="dietaryRestrictions"
          placeholder="채식, 할랄, 유제품 알레르기 등"
          className="h-12"
          {...register('dietaryRestrictions')}
        />
      </div>

      {/* Transportation */}
      <div className="space-y-2">
        <Label>교통편</Label>
        <Controller
          name="transportation"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'bus', label: '버스 (단체)' },
                { value: 'car', label: '자차' },
                { value: 'other', label: '기타' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => field.onChange(opt.value)}
                  className={cn(
                    'flex h-12 items-center justify-center rounded-lg border text-[0.9375rem] font-medium transition-colors',
                    field.value === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        />
      </div>

      {/* Consent Section */}
      <div className="space-y-3">
        <Label className="text-base">동의 항목</Label>
        <Card className="py-0">
          <CardContent className="p-0">
            <Accordion type="multiple">
              {CONSENT_ITEMS.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <div className="flex items-center gap-3 px-4">
                    <Controller
                      name={item.id}
                      control={control}
                      render={({ field }) => (
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={field.value === true}
                          onClick={() => field.onChange(!field.value)}
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
                            field.value === true
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/30'
                          )}
                        >
                          {field.value === true && (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                      )}
                    />
                    <AccordionTrigger className="flex-1 py-3.5">
                      <span className="text-[0.9375rem]">{item.title}</span>
                    </AccordionTrigger>
                  </div>
                  <AccordionContent className="px-4 pb-4 pl-[3.25rem]">
                    <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
        {(errors.consentPersonalInfo ||
          errors.consentSensitiveInfo ||
          errors.consentPhotoVideo ||
          errors.consentOverseasTransfer) && (
          <p className="text-sm text-destructive">
            모든 동의 항목에 동의해 주세요
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-14 w-full text-base font-semibold"
      >
        {isSubmitting ? '신청 중...' : '참가 신청하기'}
      </Button>
    </form>
  )
}
