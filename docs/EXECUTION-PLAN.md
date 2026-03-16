# EXECUTION-PLAN.md
# FLOWING — 충돌 방지 실행 설계도

> **버전**: v1.0
> **작성일**: 2026-03-16
> **작성 근거**: 프로젝트 전수조사 (코드베이스 + 설계 문서 15개 전체 분석)
> **목적**: 에이전트 간 코드 충돌 0% 달성

---

## 1. 현재 상태 (전수조사 결과)

### 1.1 구현 완료 현황

| 에이전트 | 완료율 | 상태 | 미완성 항목 |
|----------|--------|------|-------------|
| Agent 0 (Foundation) | 100% | ✅ 커밋됨 | - |
| Agent 1 (Auth) | 90% | ⚠️ 커밋 안 됨 | PIN API 엔드포인트, 설정 페이지 |
| Agent 1-B (BYOS) | 95% | ⚠️ 커밋 안 됨 | 서버사이드 검증 미비 (minor) |
| Agent 3 (UI Shell) | 85% | ⚠️ 커밋 안 됨 | BottomSheet, PullToRefresh, 온보딩, 실데이터 연동 |
| Agent 11 (AI Chat) | 100% | ✅ 커밋됨 | - |
| Agent 2~10 | 0% | ❌ 미착수 | 전체 |

### 1.2 기존 파일 전체 목록 (src/)

```
src/
├── app/
│   ├── layout.tsx                          # ✅ Root layout (Providers, ChatWidget, OfflineIndicator)
│   ├── page.tsx                            # ✅ 랜딩 페이지
│   ├── globals.css                         # ✅ Tailwind v4 + OKLCH + 커스텀 애니메이션
│   ├── api/
│   │   └── chat/route.ts                   # ✅ AI 챗봇 API (Agent 11)
│   ├── auth/
│   │   └── callback/route.ts               # ✅ OAuth 콜백
│   ├── (auth)/
│   │   ├── layout.tsx                      # ✅ Auth 레이아웃
│   │   ├── login/page.tsx                  # ✅ 로그인 (카카오+구글+PIN 링크)
│   │   └── pin/page.tsx                    # ✅ PIN 입력 키패드
│   ├── (dashboard)/
│   │   ├── layout.tsx                      # ✅ 대시보드 레이아웃 (Sidebar+Header+BottomNav)
│   │   └── dashboard/page.tsx              # ⚠️ 목데이터만 사용
│   └── setup/
│       └── page.tsx                        # ✅ BYOS 셋업
├── components/
│   ├── ui/                                 # ✅ shadcn/ui (9개: avatar, badge, button, card, dropdown-menu, input, label, separator, sheet)
│   ├── auth/
│   │   ├── KakaoLoginButton.tsx            # ✅
│   │   └── GoogleLoginButton.tsx           # ✅
│   ├── chat/
│   │   ├── ChatWidget.tsx                  # ✅
│   │   ├── ChatPanel.tsx                   # ✅
│   │   ├── ChatMessage.tsx                 # ✅
│   │   ├── ChatEmptyState.tsx              # ✅
│   │   ├── QuickChips.tsx                  # ✅
│   │   └── ToolResultCard.tsx              # ✅
│   ├── dashboard/
│   │   ├── DashboardCard.tsx               # ✅ Container Queries
│   │   ├── StatCard.tsx                    # ✅
│   │   ├── EventBanner.tsx                 # ✅ D-day
│   │   └── ZeroDataGuide.tsx               # ✅ 온보딩 체크리스트
│   ├── layout/
│   │   ├── Sidebar.tsx                     # ✅ 역할별 네비게이션
│   │   ├── Header.tsx                      # ✅
│   │   └── BottomNav.tsx                   # ✅ 역할별 하단 탭
│   ├── setup/
│   │   ├── SetupWizard.tsx                 # ✅ 6단계
│   │   ├── StepWelcome.tsx                 # ✅
│   │   ├── StepSupabaseSignup.tsx          # ✅
│   │   ├── StepCreateProject.tsx           # ✅
│   │   ├── StepEnterCredentials.tsx        # ✅
│   │   ├── StepRunSQL.tsx                  # ✅
│   │   └── StepComplete.tsx                # ✅
│   └── shared/
│       ├── Providers.tsx                   # ✅ QueryClient + Sonner
│       ├── RoleGuard.tsx                   # ✅
│       ├── OfflineIndicator.tsx            # ✅
│       ├── EmptyState.tsx                  # ✅
│       └── LoadingSkeleton.tsx             # ✅
├── hooks/
│   ├── useAuth.ts                          # ✅
│   ├── useUser.ts                          # ✅
│   ├── useNetworkStatus.ts                 # ✅
│   ├── useTheme.ts                         # ✅
│   ├── useDelayedLoading.ts                # ✅
│   └── useReducedMotion.ts                 # ✅
├── lib/
│   ├── utils.ts                            # ✅ cn()
│   ├── constants.ts                        # ✅ 앱 상수
│   ├── ai/
│   │   ├── system-prompt.ts                # ✅
│   │   ├── rate-limit.ts                   # ✅
│   │   └── tools/
│   │       ├── read-tools.ts               # ✅ 13개 도구
│   │       └── write-tools.ts              # ✅ 4개 도구
│   ├── supabase/
│   │   ├── client.ts                       # ✅ BYOS 팩토리
│   │   ├── server.ts                       # ✅ 서버 클라이언트
│   │   ├── middleware.ts                   # ✅ 인증 미들웨어
│   │   ├── config.ts                       # ✅ 동적 설정
│   │   ├── check-schema.ts                 # ✅ 스키마 확인
│   │   └── schema-sql.ts                   # ✅ DDL 전체
│   └── utils/
│       ├── format-date.ts                  # ✅ 한국어 날짜
│       ├── format-phone.ts                 # ✅ 010 하이픈
│       └── haptics.ts                      # ✅ 햅틱 피드백
├── stores/
│   ├── sidebarStore.ts                     # ✅
│   └── themeStore.ts                       # ✅
├── types/
│   └── index.ts                            # ✅ 공통 타입 (10개 타입)
└── middleware.ts                            # ✅ Next.js 미들웨어
```

---

## 2. 설계 문서 충돌 해소

### 2.1 확정 사항 (모든 에이전트 준수)

| 항목 | 확정값 | 근거 |
|------|--------|------|
| Next.js 버전 | **16** (16.1.6 설치됨) | package.json 실측 |
| 패키지 매니저 | **npm** | CLAUDE.md (OneDrive 한글 경로 이슈) |
| AI SDK 버전 | **6** (6.0.116) | package.json 실측 |
| Tailwind CSS | **v4** (@theme inline, OKLCH) | globals.css 실측 |
| 상태관리 | **Zustand** (클라이언트) + **TanStack Query v5** (서버) | 설치 완료 |
| Supabase | **BYOS** (localStorage 동적 연결) | config.ts 구현 완료 |

### 2.2 TRD.md 수정 필요 사항

- ~~`Next.js 15.x`~~ → `Next.js 16`
- ~~`pnpm`~~ → `npm`
- AI SDK streamText: ~~`maxSteps`~~ → `stopWhen: stepCountIs(N)`
- AI SDK useChat: ~~`api` 옵션~~ → `transport: new DefaultChatTransport({ api })`
- AI SDK Message: ~~`content` + `toolInvocations`~~ → `parts` 배열 (TextUIPart, ToolUIPart)

### 2.3 TanStack Query 키 표준 (신규)

```typescript
// src/lib/query-keys.ts (새로 생성)
export const queryKeys = {
  user:         () => ['user'] as const,
  event:        (id?: string) => ['event', id] as const,
  events:       () => ['events'] as const,
  participants: (eventId: string, filters?: Record<string, unknown>) => ['participants', eventId, filters] as const,
  participant:  (id: string) => ['participant', id] as const,
  schedules:    (eventId: string, day?: number) => ['schedules', eventId, day] as const,
  attendance:   (scheduleId: string) => ['attendance', scheduleId] as const,
  groups:       (eventId: string) => ['groups', eventId] as const,
  group:        (id: string) => ['group', id] as const,
  points:       (eventId: string, type?: 'individual' | 'group') => ['points', eventId, type] as const,
  quizzes:      (eventId: string) => ['quizzes', eventId] as const,
  quiz:         (id: string) => ['quiz', id] as const,
  announcements:(eventId: string) => ['announcements', eventId] as const,
  materials:    (eventId: string) => ['materials', eventId] as const,
  gallery:      (eventId: string) => ['gallery', eventId] as const,
  rooms:        (eventId: string) => ['rooms', eventId] as const,
} as const
```

---

## 3. 파일 소유권 매핑 (충돌 방지 핵심)

### 3.1 공유 파일 — 수정 규칙

| 공유 파일 | 소유 에이전트 | 다른 에이전트 권한 | 수정 방법 |
|-----------|--------------|-------------------|-----------|
| `types/index.ts` | **리더** (메인 세션) | 읽기 전용 | 에이전트가 타입 필요 시 → 리더에게 요청 → 리더가 추가 |
| `lib/supabase/client.ts` | Agent 1-B ✅완료 | 읽기 전용 | 동결 (수정 필요 없음) |
| `lib/supabase/server.ts` | Agent 1-B ✅완료 | 읽기 전용 | 동결 |
| `lib/supabase/middleware.ts` | Agent 1 ✅완료 | 읽기 전용 | 동결 (새 public 경로 추가만 리더가 처리) |
| `lib/utils.ts` | Agent 0 ✅완료 | 읽기 전용 | 동결 |
| `lib/constants.ts` | **리더** | 읽기 전용 | 에이전트가 상수 필요 시 리더가 추가 |
| `app/layout.tsx` | **리더** | 읽기 전용 | Provider 추가 등은 리더만 |
| `app/(dashboard)/layout.tsx` | Agent 3 ✅완료 | 읽기 전용 | 동결 |
| `components/ui/*` | shadcn | **수정 금지** | `npx shadcn@latest add` 로만 추가 |
| `globals.css` | Agent 0 ✅완료 | 읽기 전용 | 동결 (커스텀 CSS 필요 시 별도 파일) |
| `lib/query-keys.ts` | **리더** (신규 생성) | 읽기 전용 | 리더가 관리 |

### 3.2 에이전트별 전용 파일 (충돌 불가)

#### Phase 3: Agent 2 (Event & Schedule) — 전용 영역
```
src/app/(public)/join/[code]/page.tsx          # 참가 신청
src/app/(dashboard)/participants/page.tsx       # 참가자 목록
src/app/(dashboard)/participants/[id]/page.tsx  # 참가자 상세
src/app/(dashboard)/schedule/page.tsx           # 일정 관리
src/actions/events.ts
src/actions/participants.ts
src/actions/schedules.ts
src/components/forms/ParticipantForm.tsx
src/components/forms/ConsentForms.tsx
src/components/forms/PhoneInput.tsx
src/components/forms/BirthDatePicker.tsx
src/components/dashboard/TimelineView.tsx
src/components/dashboard/ParticipantSearch.tsx
src/validators/participant.ts
src/hooks/useParticipants.ts
src/hooks/useSchedules.ts
```

#### Phase 3: Agent 6 (Content) — 전용 영역
```
src/app/(dashboard)/announcements/page.tsx
src/app/(dashboard)/materials/page.tsx
src/actions/announcements.ts
src/actions/materials.ts
src/components/dashboard/AnnouncementCard.tsx
src/components/dashboard/MaterialCard.tsx
src/hooks/useAnnouncements.ts
src/hooks/useMaterials.ts
```

#### Phase 3: Agent 8 (Gallery) — 전용 영역
```
src/app/(dashboard)/gallery/page.tsx
src/app/(dashboard)/gallery/[albumId]/page.tsx
src/actions/gallery.ts
src/components/dashboard/PhotoGrid.tsx
src/components/dashboard/PhotoViewer.tsx
src/components/dashboard/AlbumCard.tsx
src/hooks/useGallery.ts
```

#### Phase 4: Agent 4 (Attendance) — 전용 영역
```
src/app/(dashboard)/attendance/page.tsx
src/app/(dashboard)/attendance/[scheduleId]/page.tsx
src/actions/attendance.ts
src/components/dashboard/AttendanceChecker.tsx
src/components/dashboard/AttendanceSwipeItem.tsx
src/components/dashboard/AttendanceStats.tsx
src/hooks/useAttendance.ts
src/hooks/useOptimisticAttendance.ts
src/lib/offline/attendance-queue.ts
```

#### Phase 4: Agent 5 (Groups & Points) — 전용 영역
```
src/app/(dashboard)/groups/page.tsx
src/app/(dashboard)/groups/[id]/page.tsx
src/app/(dashboard)/leaderboard/page.tsx
src/actions/groups.ts
src/actions/points.ts
src/components/dashboard/GroupCard.tsx
src/components/dashboard/LeaderboardTable.tsx
src/components/dashboard/PointsAnimation.tsx
src/hooks/useGroups.ts
src/hooks/usePoints.ts
```

#### Phase 5: Agent 7 (Quiz) — 전용 영역
```
src/app/(dashboard)/quiz/page.tsx
src/app/(dashboard)/quiz/[id]/page.tsx
src/app/(dashboard)/quiz/[id]/play/page.tsx
src/actions/quiz.ts
src/components/dashboard/QuizCard.tsx
src/components/dashboard/QuizPlayer.tsx
src/components/dashboard/QuizResults.tsx
src/hooks/useQuiz.ts
src/hooks/useRealtimeQuiz.ts
```

#### Phase 6: Agent 9 (PWA & Offline) — 전용 영역
```
src/lib/offline/queue.ts
src/lib/offline/sync.ts
src/hooks/useOfflineQueue.ts
public/sw.ts (또는 serwist 설정)
public/manifest.json
```

---

## 4. 수정된 실행 순서

기존 AGENTS.md의 Phase 구조를 유지하되, **이미 완료된 작업을 반영**합니다.

### Phase 1 ✅ 완료
- Agent 0 (Foundation) — 커밋됨
- Agent 11 (AI Chat) — 커밋됨

### Phase 1.5 🔧 마무리 (현재 단계)

**목표**: 커밋 안 된 Agent 1, 1-B, 3 완성 + 공유 인프라 확정

**순서** (순차 실행 — 충돌 방지):

1. **리더**: `lib/query-keys.ts` 생성 (공유 인프라)
2. **리더**: `types/index.ts`에 Phase 3~5에 필요한 타입 사전 추가
3. **Agent 1 마무리**: PIN API 엔드포인트 + 설정 페이지
4. **Agent 3 마무리**: Sidebar/BottomNav 실제 role 연동, BottomSheet, 실데이터 연동 준비
5. **빌드 검증 + 통합 커밋**

### Phase 2: Agent 2 + Agent 6 + Agent 8 (병렬 실행 가능)

**충돌 위험**: ❌ 없음
- 3개 에이전트 모두 **전용 디렉토리만 사용**
- 공유 파일 수정 불필요 (types/query-keys는 Phase 1.5에서 사전 추가)

### Phase 3: Agent 4 + Agent 5 (병렬 실행 가능)

**충돌 위험**: ❌ 없음
- 전용 디렉토리만 사용
- Agent 4는 `schedules`/`participants` 테이블 읽기만
- Agent 5는 `groups`/`points` 테이블 사용

### Phase 4: Agent 7 (Quiz) (단독)

**충돌 위험**: ❌ 없음
- Supabase Realtime 채널 사용 → Agent 9와의 조율은 Phase 5에서

### Phase 5: Agent 9 (PWA & Offline) (단독)

**충돌 위험**: ⚠️ 낮음
- `app/layout.tsx` 수정 가능 (SW 등록) → 리더가 처리
- 오프라인 큐는 전용 `lib/offline/` 디렉토리

### Phase 6: Agent 10 (Polish)

**충돌 위험**: ⚠️ 중간
- 전체 파일 접근 가능 (버그 수정, 최적화)
- **반드시 리더 감독 하에 실행**

---

## 5. 공유 파일 수정 프로토콜

### 수정이 필요한 경우 절차:

```
1. 에이전트가 공유 파일 수정 필요 발견
   ↓
2. 에이전트는 수정하지 않고, 필요한 변경 내용을 리더에게 보고
   ↓
3. 리더가 다른 에이전트에 영향 확인
   ↓
4. 리더가 직접 수정 후 빌드 검증
   ↓
5. 에이전트 작업 계속
```

### 자주 발생할 수정 요청:

| 요청 유형 | 대상 파일 | 처리 |
|-----------|-----------|------|
| 새 타입 추가 | `types/index.ts` | 리더가 Phase 시작 전 사전 추가 |
| 새 쿼리 키 추가 | `lib/query-keys.ts` | 리더가 Phase 시작 전 사전 추가 |
| 새 shadcn 컴포넌트 | `components/ui/` | 리더가 `npx shadcn@latest add` 실행 |
| 새 public 경로 | `middleware.ts` | 리더가 PUBLIC_PATHS 배열에 추가 |
| 새 상수 추가 | `lib/constants.ts` | 리더가 추가 |
| layout 수정 | `app/layout.tsx` | 리더가 직접 수정 |

---

## 6. 빌드 검증 게이트

각 Phase 완료 시 반드시:

```bash
# 1. TypeScript 검사
npx next build

# 2. 커밋 안 된 변경 확인
git status

# 3. 공유 파일 변경 확인
git diff --name-only -- src/types/ src/lib/supabase/ src/lib/utils.ts src/lib/constants.ts src/middleware.ts src/app/layout.tsx

# 4. 성공 시 커밋
git add . && git commit -m "feat(scope): 설명"
```

---

## 7. 위험 요소 & 대응

### 7.1 Supabase Realtime 200 커넥션 제한
- **위험**: Agent 7 (Quiz) + Agent 9 (PWA) 동시 Realtime 사용 시 초과 가능
- **대응**: Agent 7에서 채널 풀링 구현, Agent 9에서 Realtime 커넥션 모니터링

### 7.2 BYOS 모드에서 서버사이드 렌더링
- **위험**: `createServerSupabaseClient()`는 env 변수 사용 → BYOS는 localStorage
- **대응**: 서버 컴포넌트에서 Supabase 접근 시 cookie 기반 인증만 사용, 데이터는 클라이언트에서 fetch

### 7.3 PIN 인증 보안
- **위험**: PIN이 행사코드+이름+생일 조합 → 브루트포스 가능
- **대응**: 5회 실패 시 10분 잠금, rate limit 적용

### 7.4 대규모 SQL 스크립트 실행 실패
- **위험**: BYOS 사용자가 SQL Editor에서 전체 스키마 복사-붙여넣기 실패
- **대응**: 테이블별 분리 실행 옵션 제공 (Step 5에서)

---

## 8. 체크리스트 (리더용)

### Phase 1.5 시작 전
- [ ] `lib/query-keys.ts` 생성
- [ ] `types/index.ts` Phase 2~5 필요 타입 사전 추가
- [ ] Agent 1 마무리 (PIN API)
- [ ] Agent 3 마무리 (role 연동)
- [ ] 빌드 검증 + 커밋
- [ ] `middleware.ts`에 Phase 2 public 경로 추가 (`/join`)

### 각 Phase 시작 전
- [ ] 해당 Phase에서 필요한 shadcn 컴포넌트 사전 설치
- [ ] 해당 Phase에서 필요한 타입/쿼리키/상수 사전 추가
- [ ] 에이전트 전용 디렉토리 구조 확인
- [ ] 이전 Phase 빌드 성공 확인

### 각 Phase 완료 후
- [ ] `npx next build` 성공
- [ ] 공유 파일 변경 없음 확인
- [ ] 커밋 + git status clean
