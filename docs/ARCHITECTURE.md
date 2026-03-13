# ARCHITECTURE.md
# FLOWING - 시스템 아키텍처

> **버전**: v1.2 (Realtime 제한 + 오프라인 UX 아키텍처)
> **작성일**: 2026-03-13

---

## 1. 아키텍처 개요

### 1.1 설계 철학
- **서버리스 우선**: 자체 백엔드 서버 없이 BaaS(Supabase) + Edge(Vercel)로 구성
- **BYOS (Bring Your Own Supabase)**: 각 교회가 자체 Supabase를 연결하는 모델. 상세: `docs/BYOS.md`
- **JAMstack**: JavaScript + API + Markup 아키텍처
- **관심사 분리**: 프레젠테이션, 비즈니스 로직, 데이터 접근을 명확히 분리

### 1.2 전체 아키텍처 다이어그램

```
                         ┌─────────────────┐
                         │   사용자 접속    │
                         │  (브라우저/PWA)  │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │      Vercel CDN/Edge       │
                    │   (정적 자산 + Edge SSR)    │
                    └─────────────┬─────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
    ┌─────────┴─────────┐ ┌──────┴──────┐  ┌────────┴────────┐
    │   Next.js SSR     │ │ Server      │  │   Static        │
    │   (동적 페이지)    │ │ Actions     │  │   Assets        │
    │   대시보드, 출석   │ │ (데이터 변경)│  │   (이미지, 폰트) │
    └─────────┬─────────┘ └──────┬──────┘  └─────────────────┘
              │                   │
              └────────┬──────────┘
                       │
           ┌───────────┼───────────┐
           │                       │
           ▼                       ▼
    ┌──────────────────────┐  ┌──────────────────────┐
    │  AI API (챗봇)        │  │                      │
    │  Route: /api/chat    │  │                      │
    │  ┌────────────────┐  │  │                      │
    │  │ Gemini Flash   │  │  │                      │
    │  │ (주 모델)       │  │  │                      │
    │  ├────────────────┤  │  │                      │
    │  │ Groq LLaMA 3   │  │  │                      │
    │  │ (fallback)     │  │  │                      │
    │  └────────────────┘  │  │                      │
    └──────────────────────┘  │                      │
                               ▼
    ┌──────────────────────────────────────────────────┐
    │                  Supabase                         │
    │                                                  │
    │  ┌────────────┐  ┌──────────┐  ┌──────────────┐ │
    │  │ PostgreSQL │  │   Auth   │  │   Storage    │ │
    │  │            │  │          │  │              │ │
    │  │ - events   │  │ - 카카오 │  │ - 교재 PDF   │ │
    │  │ - profiles │  │ - 구글   │  │ - 사진       │ │
    │  │ - groups   │  │ - PIN    │  │ - 파일       │ │
    │  │ - attend.  │  │ - JWT    │  │              │ │
    │  │ - quizzes  │  │          │  │              │ │
    │  │ - etc.     │  │          │  │              │ │
    │  └──────┬─────┘  └──────────┘  └──────────────┘ │
    │         │                                        │
    │  ┌──────┴──────────────────────────────────────┐ │
    │  │  Row Level Security (RLS)                   │ │
    │  │  역할별 데이터 접근 제어                     │ │
    │  └─────────────────────────────────────────────┘ │
    │                                                  │
    │  ┌─────────────────────────────────────────────┐ │
    │  │  Realtime (WebSocket)                       │ │
    │  │  출석 현황, 프로그램, 리더보드 실시간 업데이트│ │
    │  └─────────────────────────────────────────────┘ │
    └──────────────────────────────────────────────────┘
```

---

## 2. 레이어 아키텍처

```
┌───────────────────────────────────────────────────┐
│  Presentation Layer (프레젠테이션)                  │
│  ├── Pages (App Router)                           │
│  ├── Components (shadcn/ui + Custom)              │
│  └── Layouts (Dashboard, Auth, Public)            │
├───────────────────────────────────────────────────┤
│  Application Layer (애플리케이션 로직)              │
│  ├── Server Actions (데이터 변경)                  │
│  ├── Hooks (useAttendance, useQuiz, etc.)         │
│  └── Stores (Zustand - UI 상태)                   │
├───────────────────────────────────────────────────┤
│  Domain Layer (도메인 로직)                        │
│  ├── Validators (Zod schemas)                     │
│  ├── Types (TypeScript interfaces)                │
│  └── Utils (날짜, 포인트 계산, 통계)               │
├───────────────────────────────────────────────────┤
│  Data Access Layer (데이터 접근)                   │
│  ├── Supabase Client (Server / Browser)           │
│  ├── TanStack Query (캐싱/동기화)                  │
│  └── Supabase Realtime (실시간 구독)               │
└───────────────────────────────────────────────────┘
```

---

## 3. 라우팅 구조

### 3.1 라우트 맵

```
/                           → 랜딩 페이지 (행사 소개)
/login                      → 로그인 (카카오/구글)
/pin                        → PIN 로그인 (참가자/학부모)
/join/[invite-code]         → 참가 신청 폼

/(dashboard)/               → 메인 대시보드
/(dashboard)/participants   → 참가자 관리
/(dashboard)/participants/[id] → 참가자 상세
/(dashboard)/schedule       → 일정/커리큘럼
/(dashboard)/attendance     → 출석 관리
/(dashboard)/attendance/[scheduleId] → 세션별 출석 체크
/(dashboard)/groups         → 조/반 관리
/(dashboard)/groups/[id]    → 조 상세
/(dashboard)/announcements  → 공지사항
/(dashboard)/materials      → 자료실
/(dashboard)/quiz           → 프로그램 목록
/(dashboard)/quiz/[id]      → 프로그램 참여
/(dashboard)/quiz/[id]/result → 프로그램 결과
/(dashboard)/gallery        → 갤러리
/(dashboard)/gallery/[albumId] → 앨범 상세
/(dashboard)/rooms          → 숙소 관리
/(dashboard)/settings       → 설정
/(dashboard)/reports        → 통계/리포트
```

### 3.2 라우트 그룹 설계

```
src/app/
├── (public)/               # 공개 페이지 (인증 불필요)
│   ├── page.tsx            # 랜딩
│   └── join/[code]/page.tsx # 참가 신청
├── (auth)/                 # 인증 페이지
│   ├── login/page.tsx
│   └── pin/page.tsx
├── (dashboard)/            # 인증 필요, 사이드바 레이아웃
│   ├── layout.tsx          # 공통 레이아웃 (사이드바 + 헤더)
│   ├── page.tsx            # 메인 대시보드
│   ├── participants/
│   ├── schedule/
│   ├── attendance/
│   ├── groups/
│   ├── announcements/
│   ├── materials/
│   ├── quiz/
│   ├── gallery/
│   ├── rooms/
│   ├── settings/
│   └── reports/
└── layout.tsx              # 루트 레이아웃
```

---

## 4. 미들웨어

### 4.1 인증 미들웨어

```
요청 → middleware.ts
  ├── /login, /pin, /join/*, /setup → 통과 (공개)
  ├── /api/chat → 통과 (AI 챗봇, 인증 선택적)
  ├── /(dashboard)/* → Supabase 세션 확인
  │   ├── 세션 있음 → 통과
  │   └── 세션 없음 → /login 리다이렉트
  └── 정적 자산 → 통과
```

### 4.2 역할 기반 접근 제어

```
대시보드 페이지 접근 시:
  1. 미들웨어: 인증 확인
  2. Server Component: 역할 확인
  3. 권한 없음 → 403 또는 제한된 뷰 렌더
  4. 클라이언트: RoleGuard 컴포넌트로 UI 요소 조건부 렌더
```

---

## 5. 오프라인/PWA 아키텍처

### 5.1 캐싱 전략

```
Service Worker (Serwist)
├── Cache First (정적 자산)
│   ├── CSS, JS 번들
│   ├── 이미지 (로고, 아이콘)
│   ├── 폰트
│   └── PWA 매니페스트
├── Network First → Cache Fallback (동적 데이터)
│   ├── 일정표 데이터
│   ├── 조원 목록
│   ├── 공지사항
│   └── 교재/자료 (PDF)
├── Network Only (실시간 필수)
│   ├── 출석 제출
│   ├── 퀴즈 응답
│   └── 인증
└── Stale While Revalidate (대시보드)
    ├── 대시보드 통계
    └── 리더보드
```

### 5.2 오프라인 데이터 동기화 (수련원 네트워크 대응)

```
사용자 액션 (출석 체크)
  │
  ├── 온라인? ─── Yes ─── Supabase 직접 저장 (옵티미스틱 UI)
  │                         ├── 성공 → UI 확정 + 햅틱 success
  │                         └── 실패 → IndexedDB 큐 저장 + amber 배지
  │
  └── 오프라인? ── IndexedDB 큐 저장 (즉시 UI 반영, amber 상태)
                      │
                      ▼
                 온라인 복귀 감지
                 (online 이벤트 / visibilitychange / Background Sync)
                      │
                      ▼
                 큐 항목 순차 전송 (progressive retry: 1s → 3s → 5s)
                      │
                      ├── 성공 → 큐에서 제거 + green 상태 + 토스트
                      └── 실패 → 재시도 대기 (max 3회)
```

**충돌 해결 전략:**
- 출석: OR 로직 (오프라인 "출석" + 온라인 "출석" = "출석")
- 퀴즈: 첫 응답 우선 (UNIQUE 제약)
- 포인트: 가산 연산 (`+= delta`, 절대값 덮어쓰기 금지)

### 5.3 사전 캐싱 (수련원 도착 전)

```
양호한 WiFi에서 첫 접속 시:
  자동 프리페치 → 일정표, 조원 목록, 교재/자료, 공지사항
  TanStack Query에 캐싱 → 오프라인에서 즉시 표시 가능
```

---

## 6. 실시간 기능 아키텍처

### 6.1 Supabase Realtime 채널

| 채널 | 이벤트 | 대상 |
|------|--------|------|
| `attendance:{scheduleId}` | INSERT/UPDATE | 출석 현황 실시간 업데이트 |
| `quiz:{quizId}` | INSERT/UPDATE | 실시간 퀴즈 진행 |
| `points:{eventId}` | INSERT | 포인트 변동, 리더보드 갱신 |
| `announcements:{eventId}` | INSERT | 새 공지 알림 |

> **⚠️ Supabase 무료 티어 Realtime 제한: 동시 접속 200개**
>
> 타겟 사용자 200명이 동시에 퀴즈에 참여하면 **한계치에 정확히 도달**합니다.
> 교사/관리자 접속까지 고려하면 초과 가능성이 있습니다.
>
> **대응 방안:**
> - 퀴즈 시 불필요한 다른 Realtime 채널 구독 해제 (출석, 공지 등)
> - 하나의 `quiz:{quizId}` 채널만 활성화하여 커넥션 수 절약
> - Broadcast 메시지 사용 (DB 변경 이벤트보다 경량)
> - 200명 초과 시 Supabase Pro 업그레이드 (월 $25, 500 커넥션) 안내

### 6.2 실시간 퀴즈 플로우

```
관리자: 퀴즈 시작 → DB 상태 변경 (is_active = true)
                                ↓
                    Realtime broadcast
                                ↓
참가자들: 퀴즈 시작 화면 표시 → 문제 표시 → 답변 제출
                                                ↓
                                        DB에 응답 저장
                                                ↓
                                    Realtime → 관리자 화면에 실시간 응답 현황
                                                ↓
관리자: 다음 문제 또는 결과 공개 → Realtime → 참가자 화면에 결과 표시
```

---

## 7. 보안 아키텍처

### 7.1 보안 레이어

```
1. 전송 보안: HTTPS (Vercel 기본)
2. 인증: Supabase Auth (JWT)
3. 인가: Row Level Security (PostgreSQL)
4. 입력 검증: Zod (클라이언트 + 서버)
5. CSRF: Next.js Server Actions (기본 보호)
6. XSS: React (기본 이스케이프) + CSP 헤더
```

### 7.2 민감 데이터 처리

| 데이터 | 분류 | 처리 방식 |
|--------|------|-----------|
| 비밀번호 | N/A | Supabase Auth가 처리 (bcrypt) |
| 건강/의료 정보 | 민감 | RLS로 관리자만 접근, 별도 테이블 분리 고려 |
| 연락처 | 개인정보 | RLS로 역할별 접근 제한 |
| 사진 | 초상권 | 동의 받은 참가자만 포함, 비공개 버킷 |

### 7.3 환경 변수 관리

```
브라우저 노출 가능:
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  NEXT_PUBLIC_APP_URL

서버 전용 (절대 브라우저 노출 금지):
  SUPABASE_SERVICE_ROLE_KEY
  KAKAO_CLIENT_SECRET
```

---

## 8. 배포/인프라 아키텍처

### 8.1 배포 파이프라인

```
개발자 → git push → GitHub
                      ↓
              Vercel Build Hook
                      ↓
              ┌───────────────┐
              │  Build Phase  │
              │ pnpm install  │
              │ pnpm build    │
              │ Type Check    │
              │ Lint          │
              └───────┬───────┘
                      ↓
         ┌────────────┴────────────┐
         │                         │
    PR/Branch                   main
         ↓                         ↓
  Preview Deploy            Production Deploy
  (고유 URL)                (lms.church.kr)
```

### 8.2 환경 구성

| 환경 | URL | Supabase | 용도 |
|------|-----|----------|------|
| **Local** | localhost:3000 | Supabase Local (Docker) | 개발 |
| **Preview** | *.vercel.app | Supabase Dev Project | PR 리뷰 |
| **Production** | lms.church.kr | Supabase Prod Project | 실서비스 |

---

## 9. 확장성 고려

### 9.1 다중 행사 지원
- `events` 테이블 기반으로 여러 행사를 하나의 인스턴스에서 관리
- URL 구조: `/(dashboard)/events/[eventId]/...`
- 행사 전환 드롭다운

### 9.2 다년도 재사용
- 행사 템플릿 기능: 전년도 행사 설정 복사
- 연도별 데이터 분리 (event_id 기준 자연스럽게 분리)
- 참가자 히스토리: profiles 테이블은 유지, participants는 행사별 생성

### 9.3 성능 한계 예측

| 지표 | 무료 티어 한계 | 예상 사용량 (200명) | 여유 | 위험도 |
|------|---------------|-------------------|------|--------|
| Supabase DB | 500MB | ~50MB | 10x | 낮음 |
| Supabase Storage | 1GB | ~500MB (사진) | 2x | 중간 |
| Supabase MAU | 50,000 | ~500 | 100x | 낮음 |
| **Supabase Realtime** | **200 동시접속** | **~200 (퀴즈 시)** | **1x** | **⚠️ 높음** |
| Supabase 자동 일시정지 | 7일 비활동 | 행사 전 비활동 | - | 중간 |
| Vercel 대역폭 | 100GB/월 | ~5GB | 20x | 낮음 |

> **⚠️ Realtime 200 커넥션 제한**이 가장 큰 병목입니다.
> 퀴즈 진행 시 모든 참가자가 동시 접속하므로, 채널 관리 최적화가 필수입니다.
> 상세 대응 방안은 섹션 6.1을 참조하세요.
>
> **⚠️ Supabase 무료 티어 자동 일시정지**
> 7일간 API 호출이 없으면 프로젝트가 자동 일시정지됩니다.
> 행사 전 몇 주간 미사용 시 일시정지될 수 있으므로, 행사 전 활성화 확인이 필요합니다.
> 앱에서 시작 시 연결 실패하면 "Supabase Dashboard에서 프로젝트를 활성화해주세요" 안내를 표시합니다.
