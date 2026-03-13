# CLAUDE.md
# FLOWING (교회 여름행사 LMS) - 프로젝트 개발 규칙

> 이 파일은 모든 에이전트(Agent 0~11)가 반드시 따라야 하는 개발 규칙입니다.
> 코드 작성 전 이 문서를 먼저 읽으세요.

---

## 1. 기술 스택 (변경 금지)

- **프레임워크**: Next.js 16 (App Router) + TypeScript (strict mode)
- **패키지 매니저**: npm (OneDrive 한글 경로에서 pnpm 심링크 오류로 npm 사용)
- **스타일링**: Tailwind CSS v4 + Pretendard Variable 폰트
- **UI 컴포넌트**: shadcn/ui (필요한 것만 추가)
- **상태관리**: Zustand (클라이언트) + TanStack Query v5 (서버 상태)
- **BaaS**: Supabase (BYOS 모델 - docs/BYOS.md 참조)
- **폼**: React Hook Form + Zod
- **차트**: Recharts
- **애니메이션**: Framer Motion (인터랙션) + CSS Scroll-Driven Animations (스크롤)
- **AI 챗봇**: Vercel AI SDK (`ai` + `@ai-sdk/react`) + Google Gemini + Groq
- **PWA**: Serwist (themeColor: `#0c0e14`, userScalable: true)
- **배포**: Vercel

---

## 2. 디렉토리 규칙

```
src/
├── app/                 # 페이지 (App Router)
│   ├── api/chat/        # AI 챗봇 API Route Handler
│   ├── (public)/        # 인증 불필요 (랜딩, 참가신청, 온보딩)
│   ├── (auth)/          # 인증 페이지 (로그인)
│   ├── (dashboard)/     # 인증 필수 (대시보드)
│   └── layout.tsx
├── components/
│   ├── ui/              # shadcn/ui 원본 (수정 금지)
│   ├── chat/            # AI 채팅 위젯 (ChatWidget, ChatPanel 등)
│   ├── layout/          # 사이드바, 헤더, 네비
│   ├── dashboard/       # 대시보드 전용 컴포넌트
│   ├── forms/           # 폼 컴포넌트
│   └── shared/          # 공통 (RoleGuard, EmptyState 등)
├── lib/
│   ├── supabase/        # Supabase 클라이언트 (BYOS 동적 연결)
│   ├── ai/              # AI 시스템 프롬프트, rate-limit
│   └── utils.ts         # cn(), formatDate() 등
├── hooks/               # 커스텀 훅
├── stores/              # Zustand 스토어
├── types/               # TypeScript 타입
├── actions/             # Server Actions
└── validators/          # Zod 스키마
```

---

## 3. 네이밍 컨벤션

### 파일명
- **컴포넌트**: PascalCase → `AttendanceChecker.tsx`
- **훅**: camelCase, use 접두사 → `useAttendance.ts`
- **액션**: camelCase → `attendance.ts`
- **스토어**: camelCase → `attendanceStore.ts`
- **타입**: camelCase → `attendance.ts`
- **유틸**: camelCase → `formatDate.ts`
- **페이지**: `page.tsx` (Next.js 규칙)
- **레이아웃**: `layout.tsx` (Next.js 규칙)

### 변수/함수명
- **변수**: camelCase → `attendanceList`
- **상수**: UPPER_SNAKE_CASE → `MAX_PARTICIPANTS`
- **함수**: camelCase, 동사 시작 → `checkAttendance()`
- **컴포넌트**: PascalCase → `AttendanceChecker`
- **타입/인터페이스**: PascalCase → `Participant`, `AttendanceRecord`
- **Zod 스키마**: camelCase + Schema 접미사 → `participantSchema`
- **Zustand 스토어**: camelCase + Store 접미사 → `useAttendanceStore`
- **TanStack Query 키**: 배열 형식 → `['attendance', scheduleId]`

### 언어 규칙
- **코드**: 영어 (변수명, 함수명, 주석)
- **UI 텍스트**: 한국어 (버튼, 라벨, 메시지, placeholder)
- **에러 메시지**: 한국어 (사용자 노출), 영어 (개발자 로그)

---

## 4. 컴포넌트 작성 규칙

### Server Component vs Client Component 판단

```
Server Component (기본):
- 데이터 fetch만 하고 표시하는 경우
- 정적 UI (레이아웃, 헤더 텍스트 등)
- SEO가 필요한 페이지

Client Component ('use client'):
- useState, useEffect 사용
- 이벤트 핸들러 (onClick, onChange 등)
- 브라우저 API (localStorage, navigator 등)
- Zustand, TanStack Query 사용
- 실시간 업데이트 (Supabase Realtime)
```

### 컴포넌트 구조

```tsx
// 1. 'use client' (필요한 경우만)
'use client'

// 2. import 순서 (빈 줄로 그룹 구분)
import { useState } from 'react'              // React
import { useRouter } from 'next/navigation'    // Next.js

import { Button } from '@/components/ui/button' // shadcn/ui
import { AttendanceCard } from '@/components/dashboard/AttendanceCard' // 내부 컴포넌트

import { useAttendance } from '@/hooks/useAttendance' // 훅
import { checkAttendance } from '@/actions/attendance' // 액션

import type { Participant } from '@/types'      // 타입 (항상 마지막)

// 3. Props 타입 (컴포넌트 바로 위에)
interface AttendanceCheckerProps {
  scheduleId: string
  participants: Participant[]
}

// 4. 컴포넌트 (named export, 화살표 함수 사용 안 함)
export function AttendanceChecker({ scheduleId, participants }: AttendanceCheckerProps) {
  // ...
}
```

### shadcn/ui 사용 규칙
- `components/ui/` 폴더의 파일은 **직접 수정 금지**
- 커스텀이 필요하면 `components/dashboard/` 또는 `components/shared/`에 래퍼 생성
- 새 shadcn 컴포넌트 추가: `npx shadcn@latest add [component]`

---

## 5. 데이터 접근 패턴

### 읽기: TanStack Query

```tsx
// hooks/useAttendance.ts
import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'

export function useAttendance(scheduleId: string) {
  return useQuery({
    queryKey: ['attendance', scheduleId],
    queryFn: async () => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('schedule_id', scheduleId)
      if (error) throw error
      return data
    },
  })
}
```

### 쓰기: Server Actions

```tsx
// actions/attendance.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { attendanceSchema } from '@/validators/attendance'

export async function checkAttendance(formData: FormData) {
  const parsed = attendanceSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: '입력 데이터가 올바르지 않습니다.' }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('attendance')
    .upsert(parsed.data)

  if (error) {
    return { error: '출석 체크에 실패했습니다.' }
  }

  revalidatePath('/attendance')
  return { success: true }
}

// ⚠️ Next.js 15: useFormState → useActionState (React 19)
// import { useActionState } from 'react'  (NOT from 'react-dom')
// const [state, action, isPending] = useActionState(serverAction, initialState)
```

### BYOS 클라이언트 (중요)

Supabase 클라이언트는 **반드시 팩토리 함수**를 통해 생성합니다.
환경변수가 아닌 사용자가 입력한 URL/Key를 사용하기 때문입니다.
상세 구조는 `docs/BYOS.md`를 참조하세요.

```tsx
// ✅ 올바른 사용
import { getSupabaseClient } from '@/lib/supabase/client'
const supabase = getSupabaseClient()

// ❌ 절대 금지 - 직접 생성
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key)
```

---

## 6. 스타일링 규칙

### Tailwind CSS v4 (중요)
- **설정 방식**: `tailwind.config.ts` 없음. CSS 파일에서 `@import "tailwindcss"` + `@theme inline` 사용
- **색상 공간**: OKLCH (HSL 아님). `:root`에 OKLCH CSS 변수 정의 → `@theme inline`에서 Tailwind 네임스페이스에 매핑
- **`@layer base` 사용 금지**: Tailwind v4에서는 `@layer base` 안에 `:root` 넣지 않음. 그냥 `:root { }` 사용
- **반응형**: 모바일 퍼스트 → `기본(모바일) md:(태블릿) lg:(데스크톱)`
- **다크 모드**: `dark:` 접두사 사용
- **간격**: Tailwind 기본 스케일 사용 (p-4, gap-6 등), 임의값 지양
- **색상**: CSS 변수 사용 (`text-primary`, `bg-background` 등), 하드코딩 금지
- **폰트**: Pretendard Variable (한글/영문 통합 가변 폰트)
- **랜딩 페이지**: Direction C "Living Water" — 바다 배경 caustics + 다층 물결, "FLOWING" 워터플로우 그라디언트 로고, 피처 바, 글래스모피즘
- **반응형 뷰포트 토글**: 우측 상단에 데스크톱/태블릿/모바일 전환 버튼 배치
- **상세**: `docs/DESIGN.md` 섹션 14 참조

### cn() 유틸리티
조건부 클래스는 반드시 cn() 사용:
```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  'rounded-lg p-4',
  isActive && 'border-primary bg-primary/10',
  isDisabled && 'opacity-50 cursor-not-allowed'
)} />
```

---

## 7. 에러 핸들링

### Server Actions
```tsx
// 항상 { error?: string, success?: boolean, data?: T } 형태 반환
export async function someAction() {
  try {
    // ...
    return { success: true, data: result }
  } catch (e) {
    console.error('someAction failed:', e)  // 영어 로그
    return { error: '처리 중 오류가 발생했습니다.' }  // 한국어 사용자 메시지
  }
}
```

### 클라이언트
```tsx
// TanStack Query의 error boundary 활용
// 개별 컴포넌트에서 try-catch 남발 금지
// toast로 사용자에게 피드백
```

---

## 8. 커밋 규칙

### 메시지 형식
```
<type>(<scope>): <한국어 설명>

예시:
feat(attendance): 출석 체크 페이지 구현
fix(quiz): 퀴즈 타이머 오류 수정
style(dashboard): 대시보드 카드 반응형 개선
refactor(auth): BYOS 연결 로직 리팩토링
```

### type
- `feat`: 새 기능
- `fix`: 버그 수정
- `style`: UI/스타일 변경
- `refactor`: 코드 리팩토링
- `chore`: 설정, 의존성 변경
- `docs`: 문서 변경

---

## 9. 에이전트 간 규칙

### 공유 파일 수정 시
다음 파일은 여러 에이전트가 의존합니다. 수정 시 다른 에이전트에 영향을 확인하세요:
- `types/index.ts` (공통 타입)
- `lib/supabase/*` (Supabase 클라이언트)
- `lib/utils.ts` (유틸리티)
- `components/ui/*` (shadcn/ui - 수정 금지)
- `app/(dashboard)/layout.tsx` (대시보드 레이아웃)

### 새 shadcn 컴포넌트 추가 시
`npx shadcn@latest add [name]` 실행 후 사용. 수동 생성 금지.

### 환경변수 추가 시
`.env.local.example`에 반드시 추가하고 `docs/DEPLOY.md`에 설명 추가.

---

## 10. UX 개발 규칙

### 한국형 UX (KOREAN-UX.md 참조)
- **전화번호**: `inputMode="tel"`, 010 자동 하이픈 삽입, Zod 정규식 검증
- **UX 텍스트**: 해요체 존댓말 ("완료됐어요", "문제가 생겼어요")
- **초성 검색**: `es-hangul` 라이브러리 `getChoseong()`, 200ms 디바운스
- **소셜 로그인 순서**: 카카오 → 구글 → PIN
- **날짜**: `date-fns/locale/ko`, YYYY.MM.DD, 상대시간
- **텍스트 줄바꿈**: 전역 `word-break: keep-all`

### 접근성 (ACCESSIBILITY.md 참조)
- 최소 폰트: body 16px, caption 13px. **10px 이하 텍스트 금지**
- 최소 터치 타깃: 48x48px, 간격 8px
- 색상 대비: Slate 400은 장식용만, 텍스트는 Slate 500+
- `prefers-reduced-motion: reduce` → 모든 애니메이션 비활성화
- 한글 행간: `line-height: 1.7`

### Empty State & 로딩
- 빈 화면에는 반드시 아이콘 + 설명 + CTA 버튼 (UX-PATTERNS.md 참조)
- 스켈레톤: 300ms 딜레이 후 표시 (빠른 로드 시 깜빡임 방지)
- 옵티미스틱 UI: 출석 체크는 즉시 UI 반영, 실패 시 롤백

### 오프라인 (수련원 네트워크)
- 쓰기 실패 시 IndexedDB 큐에 저장 → 온라인 복귀 시 자동 동기화
- 오프라인 배너: amber 슬라이드다운, 온라인 복귀: green 토스트 3초
- 토스트 라이브러리: `sonner` (shadcn/ui 공식)

### 햅틱 피드백
- `navigator.vibrate` 사용, iOS 미지원 → 항상 시각 피드백 병행
- 성공: `[30, 50, 30]ms`, 에러: `[50, 30, 50, 30, 50]ms`, 선택: `5ms`

---

## 11. 절대 하지 말 것

- ❌ `any` 타입 사용 (unknown으로 대체)
- ❌ `console.log` 남기기 (개발 중에도 제거)
- ❌ shadcn/ui 원본 파일 직접 수정
- ❌ Supabase 클라이언트 직접 생성 (팩토리 함수 사용)
- ❌ 하드코딩된 색상값 (CSS 변수 사용)
- ❌ 인라인 스타일 (Tailwind 사용)
- ❌ default export (named export만 사용)
- ❌ 한국어 변수명/함수명
- ❌ `eslint-disable` 주석
- ❌ 미사용 import 남기기
