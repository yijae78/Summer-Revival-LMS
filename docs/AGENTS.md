# AGENTS.md
# FLOWING — 여름행사 Learning Management System - 개발 에이전트 설계

> **버전**: v2.0 (UX 리서치 반영 전면 업그레이드)
> **작성일**: 2026-03-13

---

## 0. 리더 에이전트 (Orchestrator)

### 역할
리더 에이전트는 **Claude Code 메인 세션**이 담당합니다. 모든 하위 에이전트를 생성, 조율, 검증하는 총괄 역할입니다.

### 책임

| 책임 | 설명 |
|------|------|
| **작업 분배** | 의존성 그래프에 따라 에이전트 실행 순서 결정 |
| **병렬 실행** | 독립적인 에이전트를 동시 실행하여 속도 최적화 |
| **품질 검증** | 에이전트 결과물이 CLAUDE.md 규칙을 준수하는지 확인 |
| **UX 검증** | 4개 UX 문서(ACCESSIBILITY, KOREAN-UX, UX-PATTERNS, REALTIME-UX-PATTERNS) 준수 확인 |
| **통합 관리** | 에이전트 간 공유 파일/인터페이스 충돌 해결 |
| **진행 보고** | 신교수님에게 마일스톤별 진행 상황 보고 |
| **의사결정 요청** | 설계 변경이 필요한 경우 신교수님에게 확인 |

### 실행 프로세스

```
리더 에이전트 (Claude Code 메인)
  │
  ├── 1. 설계 문서 확인 (PRD, TRD, DESIGN, BYOS, SECURITY,
  │      ACCESSIBILITY, KOREAN-UX, UX-PATTERNS, REALTIME-UX-PATTERNS)
  │
  ├── 2. Agent 0 실행 → 완료 확인
  │
  ├── 3. Agent 1 + Agent 1-B + Agent 3 병렬 실행 → 완료 확인
  │      (Agent 1-B는 Agent 1과 동시 진행, Agent 0 완료 후 시작)
  │
  ├── 4. Agent 2 + Agent 6 + Agent 8 병렬 실행 → 완료 확인
  │
  ├── 5. Agent 4 + Agent 5 병렬 실행 → 완료 확인
  │
  ├── 6. Agent 7 실행 → 완료 확인
  │
  ├── 7. Agent 9 + Agent 11 병렬 실행 → 완료 확인
  │
  ├── 8. Agent 10 실행 → 최종 검증
  │
  └── 9. 신교수님에게 완료 보고
```

### 검증 체크리스트 (각 에이전트 완료 후)
- [ ] TypeScript 에러 없음 (`pnpm build` 성공)
- [ ] CLAUDE.md 코딩 규칙 준수
- [ ] **한국어 UX 텍스트** 확인 (해요체, KOREAN-UX.md 준수)
- [ ] **모바일 반응형** 확인 (Safe Area, 역할별 하단 네비, Container Queries)
- [ ] **접근성** 확인 (48px 터치, 16px 본문, WCAG 2.2 AA, ACCESSIBILITY.md 준수)
- [ ] **Empty State** 확인 (아이콘 + 설명 + CTA 3요소 포함, UX-PATTERNS.md 준수)
- [ ] **오프라인 동작** 확인 (해당 기능일 경우)
- [ ] **로딩 상태** 확인 (Skeleton 300ms 딜레이, UX-PATTERNS.md 준수)
- [ ] **다크 모드** 확인 (OKLCH 색상 적용)
- [ ] 다른 에이전트와 충돌 없음

---

## 1. 에이전트 전략 개요

프로젝트를 **기능 도메인별 에이전트**로 분할하여 개발을 진행합니다.
각 에이전트는 독립적인 기능 영역을 담당하며, 공통 기반 위에서 병렬 개발이 가능하도록 설계합니다.
**리더 에이전트**(Claude Code 메인 세션)가 전체를 조율합니다.

```
                    ┌──────────────────────┐
                    │  Agent 0: Foundation │
                    │  (프로젝트 기반 설정) │
                    └──────────┬───────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
    ┌──────┴──────┐    ┌──────┴──────┐    ┌──────┴──────┐
    │  Agent 1    │    │  Agent 1-B  │    │  Agent 3    │
    │  Auth &     │    │  BYOS       │    │  UI Shell   │
    │  Users      │    │  Onboarding │    │  & Layout   │
    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
           │                   │                   │
           └───────────────────┼───────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
    ┌──────┴──────┐    ┌──────┴──────┐    ┌──────┴──────┐
    │  Agent 2    │    │  Agent 6    │    │  Agent 8    │
    │  Event &    │    │  Content    │    │  Gallery    │
    │  Schedule   │    │  (공지,자료) │    │  (사진)     │
    └──────┬──────┘    └─────────────┘    └─────────────┘
           │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
    ┌──────┴──────┐    ┌──────┴──────┐    ┌──────┴──────┐
    │  Agent 4    │    │  Agent 5    │    │  Agent 7    │
    │  Attendance │    │  Groups &   │    │  Quiz       │
    │  System     │    │  Points     │    │  System     │
    └─────────────┘    └─────────────┘    └─────────────┘
                               │
                    ┌──────────┴───────────┐
                    │  Agent 11: AI Chat   │
                    │  (AI 도우미 챗봇)     │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴───────────┐
                    │  Agent 9: PWA &      │
                    │  Offline             │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴───────────┐
                    │  Agent 10: Polish    │
                    │  (통합 테스트, 배포)  │
                    └──────────────────────┘
```

---

## 2. 에이전트 상세 명세

### Agent 0: Foundation (프로젝트 기반)

**목표**: 프로젝트 초기 설정, 공통 인프라 구축, **UX 공통 유틸리티 셋업**

**작업 목록**:
1. Next.js 프로젝트 초기화 (pnpm, TypeScript, App Router)
2. Tailwind CSS v4 + shadcn/ui 설정 (`@theme inline`, OKLCH, `postcss.config.mjs`)
3. Supabase 프로젝트 생성 + 클라이언트 설정
4. DB 마이그레이션 (전체 스키마 생성)
5. TypeScript 타입 생성 (supabase gen types)
6. ESLint + Prettier 설정
7. 디렉토리 구조 생성
8. 환경 변수 설정 (.env.local.example)
9. PWA 기본 설정 (manifest.json, icons)
10. Git 초기화 + .gitignore
11. **UX 패키지 설치**: `sonner`, `es-hangul`, `idb`, `react-modal-sheet`, `date-fns`, `framer-motion`
12. **글로벌 CSS 설정**: `word-break: keep-all`, `line-height: 1.7`, `body { font-size: 16px }`
13. **공통 UX 유틸리티 구현**:
    - `src/lib/utils/haptics.ts` — `triggerHaptic('success' | 'error' | 'selection')` (navigator.vibrate 패턴)
    - `src/lib/utils/format-phone.ts` — `formatPhoneNumber()` (010-XXXX-XXXX 자동 하이픈)
    - `src/lib/utils/format-date.ts` — `formatRelativeTime()`, `formatKoreanDate()` (date-fns ko locale)
    - `src/components/shared/EmptyState.tsx` — 아이콘 + 설명 + CTA 3요소 구조
    - `src/components/shared/LoadingSkeleton.tsx` — 300ms 딜레이 후 표시 (UX-PATTERNS.md 준수)
    - `src/components/shared/OfflineIndicator.tsx` — 네트워크 상태 배너
    - `src/hooks/useReducedMotion.ts` — `prefers-reduced-motion` 감지 훅
    - `src/hooks/useNetworkStatus.ts` — `navigator.onLine` + `online`/`offline` 이벤트 훅
14. **Sonner (Toast) 설정**: 성공 3초, 에러 수동 닫기, 최대 4개 스택

**산출물**:
- 실행 가능한 Next.js 프로젝트
- Supabase 연결 완료
- DB 스키마 적용 완료
- 타입 정의 완료
- **공통 UX 유틸리티 및 컴포넌트 준비 완료**

**선행 조건**: 없음
**예상 작업량**: 2~3시간

---

### Agent 1-B: BYOS Onboarding (Supabase 연결 온보딩)

**목표**: 사용자가 자체 Supabase를 연결하는 온보딩 위자드 구현

> **중요**: Supabase JS 클라이언트(`@supabase/supabase-js`)는 **DDL(CREATE TABLE 등)을 실행할 수 없습니다**.
> PostgREST는 DML만 지원하므로, DB 스키마는 사용자가 **SQL Editor에 복사-붙여넣기**로 직접 실행해야 합니다.
> 자세한 내용은 `docs/BYOS.md` v2.0 참조.

**작업 목록**:
1. Supabase 연결 설정 감지 로직 (환경변수 → localStorage → 미설정)
2. 동적 Supabase 클라이언트 팩토리 (`getSupabaseClient()`)
3. 온보딩 위자드 UI (**6단계 스텝 폼**, BYOS.md v2.0 준수)
   - Step 1: 환영 & 안내 (약 5분 소요, 무료, 데이터 교회 소유)
   - Step 2: Supabase 가입 (스크린샷 가이드, "Continue with Google" 안내)
   - Step 3: 프로젝트 생성 (project name, region 복사 버튼 제공)
   - Step 4: 연결 정보 입력 (URL + anon key 복사-붙여넣기)
   - Step 5: **SQL 실행 안내** (SQL 스크립트 전체 복사 → SQL Editor 붙여넣기 → Run)
   - Step 6: 설정 완료 & 관리자 계정 설정
4. Supabase 연결 테스트 기능 (Step 4 → SELECT로 연결 확인)
5. **SQL 스크립트 전체 복사 UI** (Step 5): 전체 스키마 + RLS + Storage 버킷 생성 SQL을 하나의 블록으로 제공, `[전체 복사 📋]` 버튼
6. **스키마 확인 로직** (`checkSchemaInitialized()`): SELECT 쿼리로 `_app_meta` 테이블 존재 여부 확인 (DDL 불가하므로 읽기 전용)
7. 스키마 버전 관리 (`_app_meta` 테이블 — SQL 스크립트에 포함)
8. 연결 해제/재설정 기능
9. 오류 처리 및 사용자 안내 메시지 (**해요체**, 친절한 톤)
10. 스크린샷 가이드 이미지 (각 Step별 정적 자산)
11. **미래 대비**: Edge Function으로 DDL 자동 실행 가능성 주석 표기

**핵심 파일**:
```
src/app/(public)/setup/page.tsx            # 온보딩 위자드 페이지
src/components/setup/SetupWizard.tsx        # 위자드 컨테이너 (6단계 스텝퍼)
src/components/setup/StepWelcome.tsx        # Step 1: 환영
src/components/setup/StepSupabaseSignup.tsx # Step 2: 가입 안내
src/components/setup/StepCreateProject.tsx  # Step 3: 프로젝트 생성
src/components/setup/StepEnterCredentials.tsx # Step 4: 연결 정보 입력
src/components/setup/StepRunSQL.tsx         # Step 5: SQL 복사-붙여넣기 안내
src/components/setup/StepComplete.tsx       # Step 6: 완료 + 관리자 설정
src/lib/supabase/config.ts                 # 동적 설정 관리
src/lib/supabase/client.ts                 # 동적 클라이언트 팩토리
src/lib/supabase/server.ts                 # 서버 클라이언트
src/lib/supabase/schema-sql.ts             # 전체 SQL 스크립트 (문자열 상수)
src/lib/supabase/check-schema.ts           # checkSchemaInitialized() (SELECT only)
```

**참조 문서**: `docs/BYOS.md` v2.0, `docs/UX-PATTERNS.md` (Wizard/Stepper UX)
**의존성**: Agent 0
**실행 시점**: Phase 2에서 Agent 1, Agent 3과 **동시 병렬 실행**
**예상 작업량**: 4~5시간

---

### Agent 1: Auth & Users (인증 & 사용자)

**목표**: 인증 시스템 및 사용자/역할 관리

**작업 목록**:
1. Supabase Auth 설정 (**카카오 OAuth 네이티브 지원**, 구글 OAuth)
2. **로그인 페이지 UI**:
   - **카카오 버튼**: 공식 디자인 가이드 준수 (`#FEE500` 배경, 검정 텍스트, 카카오 로고)
   - **소셜 로그인 순서**: 카카오 → 구글 (한국 사용자 접근성 기준)
   - **PIN 로그인 링크**: 하단에 "PIN으로 로그인" 텍스트 링크
3. PIN 코드 인증 시스템 구현
4. 미들웨어 (인증 확인, 리다이렉트)
5. 프로필 관리 (profiles 테이블 연동)
6. 역할 관리 시스템 (admin, staff, student, parent)
7. RoleGuard 컴포넌트
8. PIN 로그인 페이지 UI
9. 사용자 설정 페이지
10. **역할별 온보딩 플래그** 관리 (`has_seen_onboarding` 프로필 필드)

**핵심 파일**:
```
src/app/(auth)/login/page.tsx
src/app/(auth)/pin/page.tsx
src/lib/supabase/middleware.ts
src/lib/supabase/client.ts
src/lib/supabase/server.ts
src/components/auth/KakaoLoginButton.tsx    # 카카오 공식 디자인
src/components/auth/GoogleLoginButton.tsx
src/components/shared/RoleGuard.tsx
src/hooks/useAuth.ts
src/hooks/useUser.ts
```

**참조 문서**: `docs/KOREAN-UX.md` (카카오 버튼 디자인, 소셜 로그인 순서)
**의존성**: Agent 0
**예상 작업량**: 3~4시간

---

### Agent 2: Event & Schedule (행사 & 일정)

**목표**: 행사 CRUD, 일정 관리, **참가 신청 (PIPA 준수) + 한국형 폼 패턴**

**작업 목록**:
1. 행사 생성/수정 폼
2. 행사 목록 및 선택
3. 초대 코드 생성 로직
4. **참가 신청 폼** (공개 URL: /join/[code]):
   - **PIPA 4개 분리 동의서** 구현 (SECURITY.md 준수):
     - 개인정보 수집·이용 동의 (PIPA 제15조)
     - 민감정보 처리 동의 (PIPA 제23조) — 건강/알레르기
     - 사진·영상 촬영 및 활용 동의 (PIPA 제17조)
     - 개인정보 국외이전 동의 (PIPA 제28조의8) — Supabase/미국
   - 각 동의서: 접이식 아코디언, 본문 → 체크박스 → 서명
   - 미성년자: 법정대리인(보호자) 연락처 필수 (제22조 제6항)
   - **전화번호 자동 하이픈** (`formatPhoneNumber()`, `inputMode="numeric"`)
   - **생년월일 드롭다운** (연/월/일 분리, 스크롤 선택)
   - **Zod 해요체 에러 메시지** ("올바른 전화번호를 입력해 주세요")
5. 참가자 관리 대시보드 (목록, 검색, 필터):
   - **초성 검색** (`es-hangul` 라이브러리 사용)
6. 참가자 상세 프로필
7. 일정 생성/수정 (일차 > 세션 구조)
8. 타임라인 뷰 (현재 세션 하이라이트)
9. 참가자 엑셀 내보내기
10. 참가비 수납 체크

**핵심 파일**:
```
src/app/(public)/join/[code]/page.tsx
src/app/(dashboard)/participants/page.tsx
src/app/(dashboard)/participants/[id]/page.tsx
src/app/(dashboard)/schedule/page.tsx
src/actions/events.ts
src/actions/participants.ts
src/actions/schedules.ts
src/components/forms/ParticipantForm.tsx
src/components/forms/ConsentForms.tsx         # PIPA 4개 동의서
src/components/forms/PhoneInput.tsx           # 자동 하이픈
src/components/forms/BirthDatePicker.tsx      # 연/월/일 드롭다운
src/components/dashboard/TimelineView.tsx
src/components/dashboard/ParticipantSearch.tsx # 초성 검색
src/lib/validations/participant.ts            # Zod 스키마 (해요체)
```

**참조 문서**: `docs/SECURITY.md` (PIPA 동의서), `docs/KOREAN-UX.md` (전화번호, 초성 검색, 해요체), `docs/UX-PATTERNS.md` (Wizard UX)
**의존성**: Agent 0, Agent 1
**예상 작업량**: 6~7시간

---

### Agent 3: UI Shell & Layout (레이아웃)

**목표**: 대시보드 쉘, 네비게이션, 공통 레이아웃, **역할별 UX 분기**

**작업 목록**:
1. 대시보드 레이아웃 (사이드바 + 헤더 + 콘텐츠)
2. 데스크톱 사이드바 (접이식)
3. **역할별 모바일 하단 네비게이션**:
   - 관리자 5탭: 홈, 참가자, 출석, 프로그램, 더보기
   - 교사 4탭: 홈, 출석, 조/반, 더보기
   - 참가자/학부모 4탭: 홈, 일정, 프로그램, 더보기
   - Safe Area CSS: `padding-bottom: env(safe-area-inset-bottom)`
4. 헤더 (행사명, 사용자 메뉴, 알림 배지)
5. 랜딩 페이지
6. **메인 대시보드**:
   - **Bento Grid 위젯**: Container Queries 사용 (`@container` / `cqw`)
   - **Zero-Data 대시보드**: 첫 진입 시 단계별 설정 가이드 (UX-PATTERNS.md 준수)
7. DashboardCard 컴포넌트 (Container Queries 반응형)
8. StatCard 컴포넌트
9. EventBanner (D-day) 컴포넌트
10. **로딩 상태**: Skeleton 300ms 딜레이 (`useDelayedLoading` 훅)
11. **Empty State**: 공통 컴포넌트 사용 (아이콘 + 설명 + CTA)
12. **다크 모드**: `prefers-color-scheme` 자동 감지 + 수동 토글 (Zustand persist)
13. **Bottom Sheet**: `react-modal-sheet` (모바일 드릴다운, 필터 패널 등)
14. **Pull-to-Refresh**: 모바일 새로고침 패턴 (대시보드, 목록 페이지)
15. **역할별 온보딩 투어**: 교사 코치마크 (NextStep.js 또는 커스텀), 참가자 웰컴 카드

**핵심 파일**:
```
src/app/(dashboard)/layout.tsx
src/app/(dashboard)/page.tsx
src/app/(public)/page.tsx
src/components/layout/Sidebar.tsx
src/components/layout/BottomNav.tsx            # 역할별 탭 분기
src/components/layout/Header.tsx
src/components/layout/SafeAreaWrapper.tsx       # Safe Area CSS
src/components/dashboard/DashboardCard.tsx      # Container Queries
src/components/dashboard/StatCard.tsx
src/components/dashboard/EventBanner.tsx
src/components/dashboard/ZeroDataGuide.tsx      # 첫 진입 설정 가이드
src/components/shared/EmptyState.tsx            # (Agent 0에서 생성)
src/components/shared/LoadingSkeleton.tsx        # (Agent 0에서 생성)
src/components/shared/BottomSheet.tsx           # react-modal-sheet 래퍼
src/components/shared/PullToRefresh.tsx
src/components/onboarding/CoachMark.tsx         # 교사 코치마크 투어
src/components/onboarding/WelcomeCard.tsx       # 참가자 웰컴
src/hooks/useDelayedLoading.ts                  # 300ms 스켈레톤 딜레이
src/hooks/useTheme.ts                           # 다크 모드 토글
```

**참조 문서**: `docs/DESIGN.md` (Container Queries, 다크 모드), `docs/UX-PATTERNS.md` (Empty State, Zero-Data, 온보딩), `docs/ACCESSIBILITY.md` (Safe Area, 터치 타겟)
**의존성**: Agent 0
**예상 작업량**: 5~6시간

---

### Agent 4: Attendance System (출석 관리)

**목표**: 출석 체크 및 현황 관리 + **옵티미스틱 UI + 햅틱 피드백 + 오프라인 큐**

**작업 목록**:
1. 세션별 출석 체크 페이지 (교사용)
2. 출석 체크 리스트 UI (**스와이프 제스처**: 왼→결석, 오른→출석)
3. **옵티미스틱 UI**: 탭/스와이프 즉시 반영 → 서버 확인 → 실패 시 롤백
   - `useOptimistic` (React 19) 또는 TanStack `onMutate` 패턴
4. **햅틱 피드백** (출석 체크 시):
   - 성공: `navigator.vibrate([30, 50, 30])` + 체크마크 애니메이션
   - 에러: `navigator.vibrate([50, 30, 50, 30, 50])` + 쉐이크 + 토스트
   - iOS 미지원: `navigator.vibrate` 존재 확인 후 호출
5. 일괄 출석 처리
6. 출석 현황 대시보드 (세션별, 조별)
7. 출석률 통계 차트
8. 미출석자 알림
9. 출석 이력 조회
10. **오프라인 출석 큐**: IndexedDB (`idb` 라이브러리) 큐에 저장 → 온라인 복귀 시 자동 동기화
    - `QueuedAction` 인터페이스: `{ id, action, table, payload, timestamp, retryCount }`
    - 동기화: `navigator.onLine` + `online` 이벤트 트리거
    - 충돌 해결: OR 로직 (서버/로컬 중 하나라도 출석이면 출석 처리)

**핵심 파일**:
```
src/app/(dashboard)/attendance/page.tsx
src/app/(dashboard)/attendance/[scheduleId]/page.tsx
src/actions/attendance.ts
src/components/dashboard/AttendanceChecker.tsx   # 옵티미스틱 UI + 햅틱
src/components/dashboard/AttendanceSwipeItem.tsx  # 스와이프 제스처
src/components/dashboard/AttendanceStats.tsx
src/hooks/useAttendance.ts
src/hooks/useOptimisticAttendance.ts             # 옵티미스틱 업데이트
src/lib/offline/attendance-queue.ts              # IndexedDB 출석 큐
```

**참조 문서**: `docs/DESIGN.md` (햅틱 패턴), `docs/ARCHITECTURE.md` (오프라인 동기화, 충돌 해결), `docs/UX-PATTERNS.md` (Success/Error States)
**의존성**: Agent 0, Agent 1, Agent 2 (schedules, participants 필요)
**예상 작업량**: 5~6시간

---

### Agent 5: Groups & Points (조/반 관리 & 포인트)

**목표**: 조/반 편성, 포인트/리더보드 + **Framer Motion 실시간 순위 애니메이션**

**작업 목록**:
1. 조 생성/수정
2. 조원 배정 (드래그 앤 드롭 또는 선택)
3. 조 리더 배정
4. 조별 현황 카드
5. 조 상세 페이지 (조원 목록, 활동 기록)
6. 포인트 시스템 (출석/프로그램/활동/보너스)
7. 포인트 입력 UI + **플로팅 텍스트 애니메이션** ("+10점" Framer Motion)
8. **리더보드 (실시간 순위)**:
   - `layout` / `layoutId` 속성으로 순위 변동 애니메이션 (Framer Motion)
   - 순위 상승: 초록 화살표 + 위로 이동 spring 애니메이션
   - 순위 하락: 빨간 화살표 + 아래로 이동
   - spring 프리셋: `{ type: "spring", stiffness: 500, damping: 30 }`
   - **Supabase Realtime 구독**: `postgres_changes` → 포인트 테이블 변경 감지
9. 포인트 이력 조회

**핵심 파일**:
```
src/app/(dashboard)/groups/page.tsx
src/app/(dashboard)/groups/[id]/page.tsx
src/actions/groups.ts
src/actions/points.ts
src/components/dashboard/GroupCard.tsx
src/components/dashboard/LeaderBoard.tsx         # Framer Motion layout 애니메이션
src/components/dashboard/LeaderBoardItem.tsx      # layoutId 개별 아이템
src/components/dashboard/PointInput.tsx
src/components/dashboard/FloatingPointText.tsx    # "+10점" 플로팅 애니메이션
src/hooks/useGroups.ts
src/hooks/usePoints.ts
src/hooks/useRealtimePoints.ts                   # Supabase Realtime 구독
```

**참조 문서**: `docs/REALTIME-UX-PATTERNS.md` (리더보드 애니메이션, spring 프리셋), `docs/DESIGN.md` (Framer Motion)
**의존성**: Agent 0, Agent 1, Agent 2
**예상 작업량**: 5~6시간

---

### Agent 6: Content (공지사항 & 자료실)

**목표**: 공지사항 CRUD, 자료 업로드/다운로드

**작업 목록**:
1. 공지사항 목록 (전체/조별, 긴급/일반)
2. 공지 작성/수정 (리치텍스트 또는 마크다운)
3. 고정 공지 기능
4. 공지 읽음 표시
5. 자료실 페이지 (카테고리별)
6. 파일 업로드 (Supabase Storage)
7. PDF 인라인 뷰어
8. 파일 다운로드
9. **Empty State**: 공지사항 없음 / 자료 없음 (아이콘 + 설명 + CTA)
10. **해요체 텍스트**: "아직 공지사항이 없어요", "자료를 업로드해 보세요"

**핵심 파일**:
```
src/app/(dashboard)/announcements/page.tsx
src/app/(dashboard)/materials/page.tsx
src/actions/announcements.ts
src/actions/materials.ts
src/components/dashboard/AnnouncementCard.tsx
src/components/dashboard/FileUploader.tsx
src/components/dashboard/PdfViewer.tsx
```

**참조 문서**: `docs/UX-PATTERNS.md` (Empty State), `docs/KOREAN-UX.md` (해요체)
**의존성**: Agent 0, Agent 1
**예상 작업량**: 3~4시간

---

### Agent 7: Quiz System (프로그램)

**목표**: 퀴즈 생성/참여/결과 + **라이브 퀴즈 UX + Realtime 200커넥션 채널 전략**

**작업 목록**:
1. 퀴즈 생성 폼 (문제 유형: 객관식, OX, 빈칸)
2. 문제 추가/수정/삭제
3. 퀴즈 목록 (활성/종료)
4. **퀴즈 참여 UI (라이브 퀴즈 모드)**:
   - **SVG 원형 타이머**: `stroke-dasharray` + Framer Motion 애니메이션
   - 5초 이하: destructive 색상 전환 (`#EF4444`) + scale 펄스
   - `aria-live="assertive"` + `aria-label={`${timeLeft}초 남음`}` (접근성)
5. **4단계 답안 공개 UX** (REALTIME-UX-PATTERNS.md 준수):
   - Phase 1: 선택 → 선택 하이라이트 + 대기 텍스트
   - Phase 2: 정답 공개 → 정답 초록, 오답 빨강
   - Phase 3: 결과 피드백 → 정답 시 confetti, 오답 시 shake 애니메이션
   - Phase 4: 점수 표시 → 플로팅 "+N점" 텍스트
6. **실시간 퀴즈 대회** (Supabase Realtime):
   - **200 커넥션 제한 대응 채널 전략**:
     - 퀴즈 시작 시 불필요한 다른 Realtime 채널 해제
     - `quiz:{quizId}` 단일 Broadcast 채널 사용 (경량 메시지)
     - Presence API: 참여자 수 실시간 표시
     - 채널 해제 순서: 리더보드 > 공지 > 출석 (퀴즈 종료 후 재연결)
7. 자동 채점
8. **결과 페이지** (개인/조별): 순위 애니메이션, confetti
9. 포인트 시스템 연동 (충돌 해결: first-write-wins)

**핵심 파일**:
```
src/app/(dashboard)/quiz/page.tsx
src/app/(dashboard)/quiz/create/page.tsx
src/app/(dashboard)/quiz/[id]/page.tsx
src/app/(dashboard)/quiz/[id]/play/page.tsx      # 라이브 퀴즈 플레이
src/app/(dashboard)/quiz/[id]/result/page.tsx
src/actions/quizzes.ts
src/components/quiz/QuizPlayer.tsx                # 라이브 퀴즈 메인
src/components/quiz/CircularTimer.tsx             # SVG 원형 타이머
src/components/quiz/AnswerReveal.tsx              # 4단계 답안 공개
src/components/quiz/QuizConfetti.tsx              # 정답 confetti
src/components/quiz/QuizCreator.tsx
src/components/quiz/QuizResult.tsx
src/hooks/useQuiz.ts
src/hooks/useRealtimeQuiz.ts                     # Realtime 채널 관리
src/lib/realtime/channel-manager.ts              # 채널 해제/재연결 전략
```

**참조 문서**: `docs/REALTIME-UX-PATTERNS.md` (타이머, 답안 공개, confetti, Presence), `docs/ARCHITECTURE.md` (200커넥션 제한)
**의존성**: Agent 0, Agent 1, Agent 5 (포인트 연동)
**예상 작업량**: 6~7시간

---

### Agent 8: Gallery (갤러리)

**목표**: 사진/영상 갤러리 시스템

**작업 목록**:
1. 앨범 생성/관리
2. 사진 다중 업로드 (Supabase Storage)
3. 이미지 압축/리사이징 (클라이언트)
4. 메이슨리/그리드 레이아웃
5. 라이트박스 뷰 (전체화면 슬라이드)
6. 앨범/사진 다운로드
7. YouTube 영상 임베드
8. **Empty State**: "아직 사진이 없어요. 첫 사진을 올려 보세요!" (아이콘 + CTA)
9. **사진 촬영 동의 확인**: 갤러리 업로드 시 PIPA 사진 동의 참가자만 태그 가능

**핵심 파일**:
```
src/app/(dashboard)/gallery/page.tsx
src/app/(dashboard)/gallery/[albumId]/page.tsx
src/actions/gallery.ts
src/components/dashboard/PhotoGrid.tsx
src/components/dashboard/Lightbox.tsx
src/components/dashboard/ImageUploader.tsx
```

**참조 문서**: `docs/UX-PATTERNS.md` (Empty State), `docs/SECURITY.md` (사진 동의)
**의존성**: Agent 0, Agent 1
**예상 작업량**: 3~4시간

---

### Agent 9: PWA & Offline (오프라인)

**목표**: PWA 설정, 오프라인 지원, **iOS 수동 설치 가이드, 네트워크 적응형 동기화, 충돌 해결**

**작업 목록**:
1. Service Worker 설정 (**Serwist v9.5.6**, `@serwist/next`)
2. 캐싱 전략 구현 (정적: CacheFirst, API: NetworkFirst, 출석: NetworkOnly + IndexedDB Fallback)
3. 오프라인 폴백 페이지
4. 출석 데이터 오프라인 큐 (Agent 4와 연동)
5. 온라인 복귀 시 자동 동기화
6. **NetworkAwareFetch**: 네트워크 상태에 따른 재시도 전략
   - Offline → IndexedDB 큐 저장
   - Slow 3G → 3회 재시도, exponential backoff
   - 4G/WiFi → 즉시 전송 + prefetch
7. **PWA 설치 프롬프트**:
   - Android: `beforeinstallprompt` 이벤트 지연 캡처 → 적절한 시점에 표시
   - iOS: `navigator.standalone` 확인 → 미설치 시 수동 가이드 Bottom Sheet ("공유 → 홈 화면에 추가")
   - `navigator.storage.persist()` 호출 (저장소 지속성 요청)
8. **Service Worker 업데이트 UX**: "새 버전이 있어요!" 토스트 → "업데이트" 버튼 → `skipWaiting()`
9. OfflineIndicator 컴포넌트 (Agent 0에서 생성)
10. **데이터 충돌 해결 전략**:
    - 출석: OR 로직 (하나라도 출석이면 출석)
    - 퀴즈 답안: first-write-wins (먼저 제출된 답안 유지)
    - 포인트: additive (합산)
11. **prefetch**: 좋은 네트워크(WiFi) 감지 시 핵심 데이터 선제 캐싱 (참가자 목록, 일정)
12. PWA 매니페스트 설정 (TRD.md 준수)

**핵심 파일**:
```
public/manifest.json
src/app/sw.ts                                   # Serwist Service Worker
src/lib/offline/queue.ts                         # IndexedDB 큐 관리
src/lib/offline/sync.ts                          # 자동 동기화 로직
src/lib/offline/conflict-resolver.ts             # 충돌 해결 전략
src/lib/offline/network-aware-fetch.ts           # 네트워크 적응형 fetch
src/lib/offline/prefetch.ts                      # WiFi 시 선제 캐싱
src/components/shared/OfflineIndicator.tsx        # (Agent 0에서 생성)
src/components/shared/InstallPrompt.tsx           # Android 설치 프롬프트
src/components/shared/IOSInstallGuide.tsx         # iOS 수동 설치 가이드
src/components/shared/ServiceWorkerUpdate.tsx     # SW 업데이트 토스트
next.config.ts                                   # Serwist 플러그인
```

**참조 문서**: `docs/TRD.md` (Serwist 설정, 캐싱 전략), `docs/ARCHITECTURE.md` (오프라인 동기화, 충돌 해결), `docs/DESIGN.md` (PWA 설치 UX)
**의존성**: Agent 0, 기능 에이전트들 완료 후
**예상 작업량**: 4~5시간

---

### Agent 11: AI Chatbot (AI 도우미)

**목표**: AI 채팅 위젯 구현 (Gemini + Groq fallback) + **역할별 빠른 질문, 해요체 UI**

**작업 목록**:
1. API Route Handler (`/api/chat`) - Vercel AI SDK `streamText`
2. Gemini Flash-Lite 연동 (`@ai-sdk/google`)
3. Groq LLaMA 3 fallback 연동 (`@ai-sdk/groq`)
4. 시스템 프롬프트 작성 (앱 기능 안내, **해요체 한국어**)
5. ChatWidget 컴포넌트 (플로팅 버튼 + 패널 토글)
6. ChatPanel 컴포넌트 (메시지 목록 + 입력)
7. ChatMessage 컴포넌트 (AI/사용자 버블, 마크다운 렌더링)
8. **QuickChips 컴포넌트 (역할별 빠른 질문)**:
   - 관리자: "참가자 현황 알려줘", "오늘 일정 뭐야?", "출석률 어때?"
   - 교사: "우리 조원 누구야?", "다음 세션 뭐야?", "포인트 어떻게 줘?"
   - 참가자: "오늘 일정 알려줘", "퀴즈 언제 해?", "우리 조 몇 등이야?"
9. 스트리밍 응답 UI (타이핑 효과)
10. Rate limiting (사용자당 30회/시간)
11. 모바일 전체화면 채팅 모드
12. AI 비활성화 처리 (API 키 미설정 시 위젯 숨김)
13. **해요체 UI 텍스트**: "무엇이든 물어보세요!", "답변을 준비하고 있어요...", "도움이 되었나요?"

**핵심 파일**:
```
src/app/api/chat/route.ts
src/components/chat/ChatWidget.tsx
src/components/chat/ChatPanel.tsx
src/components/chat/ChatMessage.tsx
src/components/chat/QuickChips.tsx               # 역할별 빠른 질문
src/lib/ai/system-prompt.ts                      # 해요체 시스템 프롬프트
src/lib/ai/rate-limit.ts
```

**참조 문서**: `docs/TRD.md` 8절, `docs/DESIGN.md` 16절, `docs/KOREAN-UX.md` (해요체), `docs/UX-PATTERNS.md` (Help & Support)
**의존성**: Agent 0, Agent 3 (레이아웃에 위젯 삽입)
**예상 작업량**: 3~4시간

---

### Agent 10: Polish & Deploy (마무리 & 배포)

**목표**: 통합 테스트, 성능 최적화, **접근성·한국 UX·오프라인 플로우 검증**, 배포

**작업 목록**:
1. 전체 기능 통합 테스트
2. 반응형 검증 (모바일/태블릿/데스크톱, **Container Queries 포함**)
3. **접근성 검사 (WCAG 2.2 AA)**:
   - `axe-core` 자동 테스트 (에러 0 목표)
   - 48px 터치 타겟 + 8px 간격 검증
   - 16px 최소 본문 크기 검증
   - 색상 대비 4.5:1 검증 (OKLCH)
   - `aria-label`, `aria-live`, 키보드 네비게이션 검증
   - `prefers-reduced-motion` 동작 검증
4. **한국형 UX 검증**:
   - 전화번호 자동 하이픈 동작
   - 초성 검색 동작 (es-hangul)
   - 해요체 텍스트 전수 검사 (에러 메시지, Empty State, 토스트)
   - 카카오 로그인 버튼 공식 디자인 가이드 준수
   - 날짜 형식 (YYYY년 MM월 DD일, date-fns ko locale)
5. **오프라인 플로우 검증**:
   - 오프라인 출석 체크 → 온라인 동기화 성공
   - 오프라인 인디케이터 표시/해제
   - IndexedDB 큐 데이터 정합성
   - Service Worker 캐싱 정상 동작
6. **삼성 인터넷 브라우저 테스트** (한국 시니어 사용자)
7. 성능 최적화 (Lighthouse 90+ 목표: Performance + Accessibility)
8. SEO 설정 (메타데이터)
9. 에러 바운더리 설정
10. 시드 데이터 작성 (데모용)
11. Git 정리 + GitHub 푸시
12. Vercel 배포 설정
13. 커스텀 도메인 연결
14. README.md 작성

**참조 문서**: `docs/ACCESSIBILITY.md` (WCAG 2.2 AA 체크리스트), `docs/KOREAN-UX.md` (한국형 검증), `docs/UX-PATTERNS.md` (전체 UX 패턴 준수 확인)
**의존성**: 모든 에이전트 완료
**예상 작업량**: 3~4시간

---

## 3. 에이전트 실행 순서 (의존성 그래프)

```
Phase 1 (병렬 불가):
  Agent 0: Foundation → 모든 에이전트의 선행 조건

Phase 2 (병렬 가능):
  Agent 1: Auth & Users ─────┐
  Agent 1-B: BYOS Onboarding ┤ (Agent 0 완료 후 동시 시작)
  Agent 3: UI Shell ──────────┘

Phase 3 (병렬 가능):
  Agent 2: Event & Schedule ──┐ (Agent 1 완료 후)
  Agent 6: Content ───────────┤ (Agent 1 완료 후)
  Agent 8: Gallery ───────────┘ (Agent 1 완료 후)

Phase 4 (병렬 가능):
  Agent 4: Attendance ─────┐ (Agent 2 완료 후)
  Agent 5: Groups & Points ┘ (Agent 2 완료 후)

Phase 5:
  Agent 7: Quiz (Agent 5 완료 후 - 포인트 연동)

Phase 6 (병렬 가능):
  Agent 9: PWA & Offline ──┐ (기능 에이전트 완료 후)
  Agent 11: AI Chatbot ────┘ (Agent 0 + Agent 3 완료 후)

Phase 7:
  Agent 10: Polish & Deploy (전체 완료 후)
```

---

## 4. 에이전트 간 공유 인터페이스

### 4.1 공통 타입 (types/index.ts)

모든 에이전트가 공유하는 타입:
- `Database` (Supabase 자동 생성)
- `UserRole` = 'admin' | 'staff' | 'student' | 'parent'
- `AttendanceStatus` = 'present' | 'absent' | 'late' | 'excused'
- `SessionType` = 'worship' | 'study' | 'recreation' | 'meal' | 'free' | 'special'
- `QuizType` = 'multiple_choice' | 'ox' | 'fill_blank'
- `PointCategory` = 'attendance' | 'quiz' | 'activity' | 'bonus'
- `QueuedAction` = `{ id, action, table, payload, timestamp, retryCount }` (오프라인 큐)
- `ConsentType` = 'personal_info' | 'sensitive_info' | 'photo_video' | 'overseas_transfer'

### 4.2 공통 훅

- `useAuth()` → 현재 인증 상태
- `useUser()` → 현재 사용자 프로필 + 역할
- `useEvent()` → 현재 선택된 행사
- `useRole()` → 역할 기반 권한 체크
- `useReducedMotion()` → `prefers-reduced-motion` 감지
- `useNetworkStatus()` → 온라인/오프라인 상태
- `useDelayedLoading()` → 300ms 후 로딩 표시

### 4.3 공통 유틸리티

- `supabase/client.ts` → 브라우저 Supabase 인스턴스
- `supabase/server.ts` → 서버 Supabase 인스턴스
- `utils.ts` → cn(), formatDate(), formatTime() 등
- `utils/haptics.ts` → `triggerHaptic('success' | 'error' | 'selection')`
- `utils/format-phone.ts` → `formatPhoneNumber()` (010-XXXX-XXXX)
- `utils/format-date.ts` → `formatRelativeTime()`, `formatKoreanDate()`

### 4.4 공통 컴포넌트 (Agent 0에서 생성)

- `EmptyState` → 아이콘 + 설명 + CTA 3요소 (모든 목록 페이지에서 사용)
- `LoadingSkeleton` → 300ms 딜레이 후 표시
- `OfflineIndicator` → 네트워크 상태 배너
- `BottomSheet` → react-modal-sheet 래퍼 (모바일 드릴다운)

---

## 5. 에이전트 프롬프트 템플릿

각 에이전트 실행 시 사용할 프롬프트 구조:

```
## 역할
당신은 [Agent 이름] 에이전트입니다.

## 목표
[목표 설명]

## 기술 스택
- Next.js 15 (App Router, TypeScript)
- Tailwind CSS v4 + shadcn/ui (OKLCH, @theme inline, postcss.config.mjs)
- Supabase (Auth, Database, Storage, Realtime)
- Zustand + TanStack Query
- Framer Motion 12 (애니메이션)
- Sonner (토스트), es-hangul (초성 검색), idb (IndexedDB)

## 작업 목록
[구체적 작업 목록]

## 참조 문서
- PRD.md: 기능 요구사항
- TRD.md: 기술 명세
- DESIGN.md: 디자인 시스템
- ARCHITECTURE.md: 시스템 아키텍처
- BYOS.md: Supabase 연결 아키텍처
- SECURITY.md: 보안 및 PIPA 준수
- ACCESSIBILITY.md: 접근성 & 연령 포용 디자인
- KOREAN-UX.md: 한국형 UX 컨벤션
- UX-PATTERNS.md: Empty State, 온보딩, 에러/성공/로딩 UX
- REALTIME-UX-PATTERNS.md: 실시간 퀴즈, 리더보드, 타이머 UX

## 기존 코드
[의존하는 기존 파일/컴포넌트 목록]

## UX 제약사항
- 해요체 한국어 (에러 메시지, Empty State, 토스트 모두)
- 48px 터치 타겟 + 8px 간격 (WCAG 2.2 AA)
- 16px 최소 본문, line-height: 1.7, word-break: keep-all
- Empty State: 아이콘 + 설명 + CTA 3요소 필수
- Skeleton: 300ms 딜레이 후 표시
- 다크 모드: OKLCH 색상 사용
- 모바일 우선 반응형 + Safe Area 대응
- reduced motion 존중 (useReducedMotion 훅)
- 오프라인: 해당 기능에 IndexedDB 큐 + 옵티미스틱 UI

## 기술 제약사항
- shadcn/ui 컴포넌트 우선 사용
- Server Components 가능한 곳에서 사용
- 클라이언트 상태는 Zustand, 서버 데이터는 TanStack Query
- Tailwind v4: @theme inline, OKLCH, postcss.config.mjs (tailwind.config.ts 없음)
- 한국어 UI (해요체)
```

---

## 6. 예상 전체 일정

| Phase | 에이전트 | 예상 시간 | 누적 |
|-------|----------|-----------|------|
| 1 | Agent 0: Foundation | 2~3h | 3h |
| 2 | Agent 1 + Agent 1-B + Agent 3 (병렬) | 5~6h | 9h |
| 3 | Agent 2 + Agent 6 + Agent 8 (병렬) | 6~7h | 16h |
| 4 | Agent 4 + Agent 5 (병렬) | 5~6h | 22h |
| 5 | Agent 7: Quiz | 6~7h | 29h |
| 6 | Agent 9: PWA + Agent 11: AI Chat (병렬) | 4~5h | 34h |
| 7 | Agent 10: Polish | 3~4h | 38h |
| **총계** | **13 에이전트** | **~38시간** | |

> 병렬 실행 고려 시 실제 소요: **약 18~22시간 (2~3일)**
