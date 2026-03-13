# TRD (Technical Requirements Document)
# FLOWING — 여름행사 Learning Management System - 기술 요구사항 명세서

> **버전**: v1.1 (Serwist/Tailwind v4/Kakao 반영)
> **작성일**: 2026-03-13

---

## 1. 기술 스택

### 1.1 확정 스택

| 계층 | 기술 | 버전 | 선정 이유 |
|------|------|------|-----------|
| **프레임워크** | Next.js (App Router) | 15.x | Vercel 최적 호환, Server Actions로 백엔드 최소화 |
| **언어** | TypeScript | 5.x | 타입 안전성, Supabase SDK 타입 연동 |
| **스타일링** | Tailwind CSS | v4 | 모바일 반응형, 빠른 개발 |
| **UI 컴포넌트** | shadcn/ui | latest | RSC 호환, 대시보드에 최적, 커스텀 자유도 |
| **차트** | Recharts | 2.x | shadcn/ui 통합, 대시보드 통계 시각화 |
| **상태관리 (클라이언트)** | Zustand | 5.x | 최소 보일러플레이트, 가벼움 |
| **서버 상태** | TanStack Query | 5.x | Supabase 데이터 캐싱/동기화 |
| **BaaS** | Supabase | latest | Auth + DB + Storage + Realtime 통합 |
| **폼 처리** | React Hook Form + Zod | latest | 타입 안전한 폼 검증 |
| **PWA** | Serwist | latest | 오프라인 캐시, 홈 화면 추가 |
| **배포** | Vercel | - | 자동 CI/CD, Edge Network |
| **AI SDK** | Vercel AI SDK 6 (`ai` + `@ai-sdk/react`) | 6.x | 스트리밍 AI 챗봇, useChat 훅 |
| **AI 모델 (주)** | Google Gemini 2.5 Flash-Lite | latest | 무료 1,000 RPD, 가장 빠른 응답 |
| **AI 모델 (보조)** | Groq LLaMA 3.3 70B | latest | 무료 fallback, Gemini 한도 초과 시 |
| **애니메이션** | Framer Motion | 12.x | 레이아웃/제스처 애니메이션 (스크롤은 CSS) |
| **토스트** | Sonner | latest | shadcn/ui 공식 토스트 (2-3KB, 스택 애니메이션) |
| **한글 처리** | es-hangul (Toss) | latest | 초성 검색, 조사 처리 (은/는, 이/가) |
| **IndexedDB** | idb | latest | 오프라인 데이터 큐 (경량 래퍼) |
| **바텀 시트** | react-modal-sheet | latest | 모바일 드릴다운 UI |
| **날짜 포맷** | date-fns + ko locale | latest | 한국어 상대시간, YYYY.MM.DD |
| **버전 관리** | Git + GitHub | - | 협업, 버전 관리, Vercel 자동 배포 연동 |

### 1.2 패키지 매니저
- **pnpm** (빠른 설치, 디스크 효율)

---

## 2. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                    사용자 (브라우저)                    │
│              PWA (Service Worker 캐싱)                │
└─────────────────┬───────────────────────────────────┘
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────────────────┐
│                 Vercel Edge Network                  │
│  ┌───────────────────────────────────────────────┐  │
│  │           Next.js App Router                   │  │
│  │  ┌─────────────┐  ┌──────────────────────┐   │  │
│  │  │ Server       │  │ Client Components    │   │  │
│  │  │ Components   │  │ (대시보드, 프로그램 등)  │   │  │
│  │  │ (SSR/SSG)    │  │                      │   │  │
│  │  └─────────────┘  └──────────────────────┘   │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │        Server Actions                    │  │  │
│  │  │   (데이터 변경: 등록, 출석, 점수 등)     │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│                   Supabase                           │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐ │
│  │PostgreSQL│ │   Auth   │ │Storage │ │Realtime │ │
│  │(Database)│ │(인증/JWT)│ │(파일)  │ │(WebSocket)│ │
│  └──────────┘ └──────────┘ └────────┘ └─────────┘ │
│  ┌──────────────────────────────────────────────┐  │
│  │        Row Level Security (RLS)               │  │
│  │        역할별 데이터 접근 제어                 │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 2.1 렌더링 전략

| 페이지 유형 | 렌더링 방식 | 이유 |
|-------------|-------------|------|
| 대시보드 | SSR + Client Hydration | 실시간 데이터, 역할별 분기 |
| 일정표 | SSG + ISR (60초) | 변경 빈도 낮음, 빠른 로드 |
| 참가 신청 폼 | SSR | SEO 불필요, 동적 폼 |
| 공지사항 목록 | SSR | 최신 데이터 필요 |
| 프로그램 참여 | Client-only | 실시간 인터랙션, WebSocket |
| 갤러리 | SSG + ISR | 이미지 최적화, 빠른 로드 |
| 관리자 설정 | Client-only | 동적 폼, CRUD |

### 2.2 Next.js 15 캐싱 주의사항

> **중요**: Next.js 15에서 `fetch()`는 기본적으로 **캐싱하지 않음** (`no-store`).
> v14에서는 자동 캐싱이었으나, v15에서 변경됨. 대시보드는 실시간 데이터이므로 기본값이 적합.
> 정적 데이터(일정표 등)만 선택적으로 캐싱: `fetch(url, { cache: 'force-cache' })`

> **폼 처리**: `useFormState` 대신 React 19의 `useActionState` 사용 (deprecated).
> `next/form` 컴포넌트로 검색/필터 폼 구현 (클라이언트 네비게이션, 프리페칭 지원).

### 2.3 데이터 흐름

```
[읽기 흐름]
Server Component → Supabase SDK (서버) → PostgreSQL → RSC로 초기 렌더
Client Component → TanStack Query → Supabase SDK (클라이언트) → 실시간 갱신

[쓰기 흐름]
React Hook Form → Zod 검증 → Server Action → Supabase SDK → PostgreSQL
                                            → revalidatePath/Tag → 캐시 무효화

[실시간 흐름]
Supabase Realtime → WebSocket → TanStack Query invalidation → UI 업데이트
```

---

## 3. 인증/권한 설계

### 3.1 인증 방식

| 방식 | 대상 사용자 | 구현 |
|------|-------------|------|
| **카카오 로그인** | 관리자, 교사 | Supabase Auth 네이티브 지원 (Kakao provider 내장) |
| **구글 로그인** | 관리자, 교사 | Supabase Auth 기본 지원 |
| **PIN 코드** | 참가자, 학부모 | 행사 코드 + 이름 + 생년월일 조합 |
| **매직 링크** | 보조 수단 | Supabase Auth Email (선택) |

### 3.2 인증 플로우

```
[관리자/교사]
카카오/구글 로그인 → Supabase Auth → JWT 발급 → 역할 확인(DB) → 대시보드

[참가자/학부모]
행사 초대 링크 접속 → 행사코드 + 이름 + 생년월일 입력 → 매칭 확인 → 세션 발급 → 대시보드
```

### 3.3 Row Level Security (RLS)

```sql
-- 예시: 출석 데이터 접근 제어
-- 관리자: 전체 접근
CREATE POLICY "admin_all_attendance" ON attendance
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- 교사: 담당 조원의 출석만
CREATE POLICY "staff_group_attendance" ON attendance
  FOR ALL TO authenticated
  USING (
    participant_id IN (
      SELECT gm.participant_id FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE g.leader_id = auth.uid()
    )
  );

-- 참가자: 본인 출석만 읽기
CREATE POLICY "student_own_attendance" ON attendance
  FOR SELECT TO authenticated
  USING (participant_id = auth.uid());
```

---

## 4. 데이터베이스 스키마

### 4.1 ER 다이어그램 (텍스트)

```
events ─┬──< schedules (세션)
        ├──< participants ──< attendance
        ├──< groups ──< group_members
        ├──< announcements
        ├──< materials
        ├──< quizzes ──< quiz_questions ──< quiz_responses
        ├──< gallery_albums ──< gallery_photos
        └──< rooms ──< room_assignments

users ──< participants
      ──< groups.leader_id
```

### 4.2 핵심 테이블 상세

```sql
-- 행사
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- 행사명 (예: "2026 여름수련회")
  type TEXT NOT NULL,                    -- 유형: retreat, bible_school, camp
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location TEXT,
  description TEXT,
  invite_code TEXT UNIQUE,               -- 참가자 초대 코드
  settings JSONB DEFAULT '{}',           -- 행사별 설정
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 사용자 프로필 (Supabase Auth 확장)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',  -- admin, staff, student, parent
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 참가자 (행사별 등록 정보)
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  birth_date DATE,
  gender TEXT,                           -- male, female
  grade TEXT,                            -- 학년/부서
  phone TEXT,
  parent_phone TEXT,                     -- 보호자 연락처
  emergency_contact TEXT,                -- 비상연락처
  health_info JSONB DEFAULT '{}',        -- 알레르기, 지병, 약물
  dietary_restrictions TEXT,
  transportation TEXT,                   -- 교통편
  fee_paid BOOLEAN DEFAULT false,        -- 참가비 납부
  photo_consent BOOLEAN DEFAULT false,   -- 사진 게시 동의
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- 조/분반
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- 조 이름 (예: "1조 사랑")
  leader_id UUID REFERENCES profiles(id),
  color TEXT,                            -- 조 색상
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 조원 매핑
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  UNIQUE(group_id, participant_id)
);

-- 일정/세션
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,           -- 일차 (1, 2, 3...)
  title TEXT NOT NULL,                   -- 세션명
  type TEXT NOT NULL,                    -- worship, study, recreation, meal, free, special
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  speaker TEXT,                          -- 강사/담당자
  description TEXT,
  materials TEXT[],                       -- 관련 자료 ID 배열
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 출석
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'absent', -- present, absent, late, excused
  checked_by UUID REFERENCES profiles(id),
  checked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(schedule_id, participant_id)
);

-- 공지사항
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'general',           -- general, urgent, group
  target_group_id UUID REFERENCES groups(id),
  is_pinned BOOLEAN DEFAULT false,
  author_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 자료
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,                -- textbook, hymn, worksheet, video, etc.
  file_url TEXT NOT NULL,
  file_type TEXT,                        -- pdf, image, video_link
  file_size INTEGER,
  day_number INTEGER,                    -- 관련 일차
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 퀴즈
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'standard',          -- standard, realtime
  is_active BOOLEAN DEFAULT false,
  time_limit INTEGER,                    -- 제한시간 (초)
  points_per_question INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 퀴즈 문제
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type TEXT NOT NULL,                    -- multiple_choice, ox, fill_blank
  options JSONB,                         -- 선택지 배열
  correct_answer TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  points INTEGER DEFAULT 10
);

-- 퀴즈 응답
CREATE TABLE quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  answer TEXT,
  is_correct BOOLEAN,
  time_taken INTEGER,                    -- 소요시간 (밀리초)
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(question_id, participant_id)
);

-- 포인트 이력
CREATE TABLE points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id),
  group_id UUID REFERENCES groups(id),
  category TEXT NOT NULL,                -- attendance, quiz, activity, bonus
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 갤러리 앨범
CREATE TABLE gallery_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  day_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 갤러리 사진
CREATE TABLE gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 숙소/방
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- 방 이름/호수
  capacity INTEGER,
  gender TEXT,                           -- male, female, mixed
  floor TEXT
);

-- 방 배정
CREATE TABLE room_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  UNIQUE(room_id, participant_id)
);
```

---

## 5. 프로젝트 디렉토리 구조

```
church-summer-lms/
├── .github/
│   └── workflows/           # CI/CD (선택)
├── public/
│   ├── icons/               # PWA 아이콘
│   ├── manifest.json        # PWA 매니페스트
│   └── sw.js                # Service Worker
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts # AI 챗봇 API (Vercel AI SDK)
│   │   ├── (auth)/          # 인증 라우트 그룹
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── pin/
│   │   ├── (dashboard)/     # 대시보드 라우트 그룹
│   │   │   ├── layout.tsx   # 사이드바/네비 레이아웃
│   │   │   ├── page.tsx     # 메인 대시보드
│   │   │   ├── participants/
│   │   │   ├── schedule/
│   │   │   ├── attendance/
│   │   │   ├── groups/
│   │   │   ├── announcements/
│   │   │   ├── materials/
│   │   │   ├── quiz/
│   │   │   ├── gallery/
│   │   │   ├── rooms/
│   │   │   └── settings/
│   │   ├── join/            # 참가자 초대 링크 진입
│   │   ├── layout.tsx       # 루트 레이아웃
│   │   └── page.tsx         # 랜딩 페이지
│   ├── components/
│   │   ├── ui/              # shadcn/ui 기본 컴포넌트
│   │   ├── chat/            # AI 채팅 위젯
│   │   │   ├── ChatWidget.tsx     # 플로팅 버튼 + 패널
│   │   │   ├── ChatPanel.tsx      # 채팅 패널 본체
│   │   │   ├── ChatMessage.tsx    # 메시지 버블
│   │   │   └── QuickChips.tsx     # 빠른 질문 칩
│   │   ├── dashboard/       # 대시보드 위젯
│   │   ├── forms/           # 폼 컴포넌트
│   │   ├── layout/          # 사이드바, 네비, 헤더
│   │   └── shared/          # 공통 컴포넌트
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts    # 브라우저 Supabase 클라이언트
│   │   │   ├── server.ts    # 서버 Supabase 클라이언트
│   │   │   └── middleware.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── hooks/               # 커스텀 훅
│   ├── stores/              # Zustand 스토어
│   ├── types/               # TypeScript 타입
│   │   ├── database.ts      # Supabase 자동 생성 타입
│   │   └── index.ts
│   └── actions/             # Server Actions
│       ├── participants.ts
│       ├── attendance.ts
│       ├── groups.ts
│       └── ...
├── supabase/
│   ├── migrations/          # DB 마이그레이션
│   └── seed.sql             # 시드 데이터
├── .env.local               # 환경 변수
├── next.config.ts
├── postcss.config.mjs         # Tailwind v4 (tailwind.config.ts 불필요)
├── tsconfig.json
├── package.json
└── README.md
```

---

## 6. API/데이터 접근 패턴

### 6.1 Server Actions (쓰기)

```typescript
// src/actions/attendance.ts (예시 구조)
'use server'

export async function checkAttendance(scheduleId: string, participantId: string, status: string) {
  // Zod 검증 → Supabase upsert → revalidatePath
}

export async function bulkCheckAttendance(scheduleId: string, records: AttendanceRecord[]) {
  // 조별 일괄 출석 체크
}
```

### 6.2 TanStack Query (읽기 + 캐싱)

```typescript
// 실시간 출석 현황 예시 구조
useQuery({
  queryKey: ['attendance', scheduleId],
  queryFn: () => supabase.from('attendance').select('*').eq('schedule_id', scheduleId)
})
```

### 6.3 Supabase Realtime (실시간)

```typescript
// 실시간 리더보드 구독 예시 구조
supabase
  .channel('points')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'points' }, handler)
  .subscribe()
```

---

## 7. 배포 구성

### 7.1 환경 변수

> **BYOS 모델**: 환경변수가 미설정된 경우 앱은 온보딩 위자드를 표시하여
> 사용자가 직접 Supabase URL/Key를 입력하도록 안내합니다.
> 상세 로직은 `docs/BYOS.md`를 참조하세요.

```env
# Supabase (선택 - 미설정 시 BYOS 모드로 온보딩 위자드 표시)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Auth (선택 - 소셜 로그인 사용 시)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

### 7.1.1 BYOS 동적 연결

환경변수가 없는 경우 Supabase 클라이언트는 런타임에 동적으로 초기화됩니다:

```
앱 시작 → 환경변수 확인 → 없음 → localStorage 확인 → 없음 → 온보딩 위자드
                        → 있음 → 해당 값으로 연결
```

Supabase 클라이언트는 반드시 `getSupabaseClient()` 팩토리 함수를 통해 생성합니다.
직접 `createClient()` 호출은 금지입니다. (CLAUDE.md 참조)

### 7.2 Vercel 배포 설정
- **Framework**: Next.js (자동 감지)
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Node.js Version**: 20.x
- **환경 변수**: Vercel Dashboard에서 설정
- **도메인**: 커스텀 도메인 연결 (예: lms.church-name.kr)

### 7.3 CI/CD 파이프라인

```
GitHub Push → Vercel 자동 빌드 → Preview 배포 (PR)
                                → Production 배포 (main 브랜치)
```

---

## 8. AI 챗봇 구현

### 8.1 아키텍처

```
사용자 (브라우저)
  │  useChat() hook
  │  (Vercel AI SDK @ai-sdk/react)
  ▼
Next.js Route Handler
  /api/chat (POST)
  │
  ├── Gemini Flash-Lite (주 모델)
  │   Google AI SDK (@ai-sdk/google)
  │   모델: gemini-2.0-flash-lite
  │   무료: 1,000 requests/day
  │
  └── [Fallback] Groq LLaMA 3 (보조)
      @ai-sdk/groq
      모델: llama-3.3-70b-versatile
      무료: 6,000 requests/day
```

### 8.2 핵심 코드 패턴

```typescript
// src/app/api/chat/route.ts (AI SDK 6 패턴)
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';

export const maxDuration = 30; // Vercel 스트리밍 타임아웃 확장

const systemPrompt = `당신은 FLOWING의 AI 도우미입니다.
이 앱의 기능(출석, 일정, 프로그램, 조/반 관리 등)에 대해 안내합니다.
한국어로 친절하게 답변하세요. 간결하고 실용적으로 답하세요.
개인정보(이름, 연락처 등)를 요청하거나 수집하지 마세요.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const modelMessages = convertToModelMessages(messages);

  try {
    const result = streamText({
      model: google('gemini-2.5-flash-lite'),
      system: systemPrompt,
      messages: modelMessages,
    });
    return result.toUIMessageStreamResponse();
  } catch {
    // Gemini 한도 초과 시 Groq fallback
    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      messages: modelMessages,
    });
    return result.toUIMessageStreamResponse();
  }
}
```

```typescript
// 클라이언트: useChat 훅 (AI SDK 6 패턴)
'use client';
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

// AI SDK 6에서는 input 상태를 직접 관리
const [input, setInput] = useState('');
const { messages, sendMessage, isLoading } = useChat();

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  sendMessage({ text: input });
  setInput('');
};
```

### 8.3 환경 변수

```env
# AI (선택 - 미설정 시 AI 채팅 비활성화)
GOOGLE_GENERATIVE_AI_API_KEY=    # Gemini API Key (Google AI Studio에서 무료 발급)
GROQ_API_KEY=                    # Groq API Key (groq.com에서 무료 발급)
```

### 8.4 비용 분석

| 서비스 | 무료 한도 | 예상 사용량 (200명) | 여유 |
|--------|-----------|-------------------|------|
| Gemini 2.5 Flash-Lite | 1,000 RPD / 15 RPM | ~100 req/day | 10x |
| Groq LLaMA 3.3 70B | ~500K TPD | fallback only | 충분 |
| **총 비용** | **$0** | **$0** | - |

> **주의**: Gemini 2.0 모델은 2026년 6월 폐기 예정. 반드시 `gemini-2.5-flash-lite` 사용.

### 8.5 Rate Limiting

```
클라이언트:
  - 사용자당 최대 30회/시간 질문 제한
  - 연속 질문 간 3초 쿨다운

서버:
  - 전체 1,000 req/day (Gemini 한도)
  - 한도 도달 시 자동 Groq fallback
  - Groq도 소진 시 "잠시 후 다시 시도해주세요" 안내
```

---

## 9. PWA / Serwist 구성

### 9.1 Serwist 설정 패턴

```typescript
// next.config.ts
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
});

export default withSerwist({
  // Next.js config
});
```

```typescript
// src/app/sw.ts (Service Worker 엔트리)
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```

### 9.2 캐싱 전략별 설정

| 자원 유형 | 전략 | 이유 |
|-----------|------|------|
| CSS, JS, 폰트 | Cache First | 정적 자산, 변경 시 해시 변경 |
| 일정표, 공지, 조원 목록 | Network First + Cache Fallback | 오프라인 시에도 열람 가능 |
| 출석 제출, 프로그램 응답, 인증 | Network Only + IndexedDB Fallback | 실시간 우선, 실패 시 로컬 큐 |
| 대시보드 통계, 리더보드 | Stale While Revalidate | 빠른 표시 + 백그라운드 갱신 |

### 9.3 오프라인 데이터 동기화 (수련원 네트워크 대응)

```typescript
// IndexedDB 큐 (idb 라이브러리)
// 네트워크 실패 시 출석/프로그램 데이터를 로컬 큐에 저장
// 온라인 복귀 시 자동 동기화

interface QueuedAction {
  id: string;
  type: 'attendance' | 'quiz_response' | 'points';
  payload: Record<string, unknown>;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
}

// 동기화 트리거:
// 1. navigator.onLine + 'online' 이벤트
// 2. document.visibilitychange (탭 복귀 시)
// 3. Background Sync API (Android Chrome만)
```

### 9.4 PWA 매니페스트 & 설치

```json
{
  "name": "FLOWING — 여름행사 Learning Management System",
  "short_name": "FLOWING",
  "start_url": "/?source=pwa",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#10B981",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**설치 프롬프트**: 첫 번째 성공 액션(출석 체크, 등록 완료 등) 이후 표시.
iOS는 `beforeinstallprompt` 미지원 → 수동 설치 가이드 배너 표시.

### 9.5 iOS PWA 제한사항 대응

| 제한 | 영향 | 대응 |
|------|------|------|
| Background Sync 없음 | 오프라인 데이터 자동 동기화 불가 | 앱 열 때 수동 동기화 트리거 |
| 7일 미사용 시 스토리지 삭제 | 캐시 데이터 소실 가능 | `navigator.storage.persist()` 요청 |
| Push 알림: 홈 화면 설치 필수 | 브라우저에서는 push 불가 | 인앱 알림 피드를 메인 채널로 |

> **상세 코드 패턴**: `docs/UX-PATTERNS.md` 섹션 6, 8 참조

---

## 10. 성능 최적화

| 항목 | 전략 |
|------|------|
| **이미지** | Next.js Image 컴포넌트 (자동 최적화, WebP, lazy loading) |
| **번들 크기** | dynamic import, tree-shaking, shadcn/ui 필요 컴포넌트만 포함 |
| **데이터** | TanStack Query staleTime/cacheTime 설정, SSR 초기 데이터 |
| **오프라인** | Serwist Service Worker 캐싱 (일정표, 교재, 정적 자산) |
| **폰트** | next/font (Google Fonts 자동 최적화) |
| **캐싱** | ISR (일정, 공지), static generation (랜딩) |

---

## 11. 테스트 전략

| 유형 | 도구 | 대상 |
|------|------|------|
| **단위 테스트** | Vitest | 유틸리티, Zod 스키마, 비즈니스 로직 |
| **컴포넌트 테스트** | Testing Library | 핵심 UI 컴포넌트 |
| **E2E 테스트** | Playwright | 참가 등록, 출석 체크, 프로그램 플로우 |
| **타입 체크** | TypeScript strict mode | 전체 |
| **린트** | ESLint + Prettier | 전체 |

---

## 12. 모니터링/에러 추적

| 항목 | 도구 | 비용 |
|------|------|------|
| **에러 추적** | Vercel Analytics (기본) | 무료 |
| **성능 모니터링** | Vercel Speed Insights | 무료 (Hobby) |
| **DB 모니터링** | Supabase Dashboard | 무료 |
| **로그** | Vercel Logs | 무료 |
