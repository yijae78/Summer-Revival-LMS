# UX-PATTERNS.md
# FLOWING - UX 패턴 & 온보딩 설계 명세

> **버전**: v1.0
> **작성일**: 2026-03-13
> **범위**: Empty States, Onboarding, Wizard UX, Help & Support, Error/Success/Loading States
> **기술 스택**: Next.js 15 + shadcn/ui + Framer Motion + Tailwind CSS v4 + Zustand + TanStack Query v5

---

## 목차

1. [Empty State Design](#1-empty-state-design)
2. [First-Run Experience (최초 실행 경험)](#2-first-run-experience)
3. [Progressive Onboarding (단계적 온보딩)](#3-progressive-onboarding)
4. [Wizard/Stepper UX (위자드/단계 폼)](#4-wizardstepper-ux)
5. [Help & Support UX (도움 & 지원)](#5-help--support-ux)
6. [Error States & Feedback (오류 상태 & 피드백)](#6-error-states--feedback)
7. [Success States (성공 상태)](#7-success-states)
8. [Loading States (로딩 상태)](#8-loading-states)
9. [Role-Specific UX Strategies (역할별 UX 전략)](#9-role-specific-ux-strategies)
10. [Implementation Roadmap (구현 로드맵)](#10-implementation-roadmap)

---

## 1. Empty State Design

### 1.1 설계 원칙

Empty state는 사용자가 빈 화면에 좌절하지 않고 다음 행동을 취하도록 유도하는 핵심 UX 기회이다. "데이터가 없다"는 메시지만 표시하면 사용자는 이탈한다. 반드시 다음 3개 요소를 포함해야 한다:

```
┌─────────────────────────────────────────┐
│                                         │
│        [일러스트레이션/아이콘]            │
│                                         │
│     왜 비어있는지 설명 (Headline)         │
│     어떻게 해결하는지 (Subtext)          │
│                                         │
│         [ CTA 버튼 ]                    │
│                                         │
└─────────────────────────────────────────┘
```

1. **시각 요소**: 브랜드 톤에 맞는 일러스트 또는 아이콘 (Lucide Icons 사용)
2. **설명 카피**: Headline(왜 비었는지) + Subtext(다음 행동)
3. **CTA 버튼**: 유저가 즉시 행동할 수 있는 primary action

### 1.2 Empty State 유형별 패턴

#### A. First-Use Empty State (최초 사용)

사용자가 처음 기능에 접근했을 때 데이터가 없는 상태. 기능의 가치를 설명하고 첫 행동을 유도한다.

```
컴포넌트: EmptyState (components/shared/EmptyState.tsx)

Props:
  icon: LucideIcon          // 기능을 나타내는 아이콘
  title: string             // 헤드라인 (한국어)
  description: string       // 설명 (한국어)
  actionLabel: string       // CTA 버튼 텍스트
  onAction: () => void      // CTA 클릭 핸들러
  secondaryAction?: {...}   // 보조 액션 (선택)
  illustration?: 'people' | 'calendar' | 'check' | 'trophy' | 'camera'
```

#### B. 페이지별 Empty State 설계

**참가자 관리 (관리자)**
```
┌──────────────────────────────────────┐
│                                      │
│           [Users 아이콘]              │
│                                      │
│    아직 등록된 참가자가 없습니다       │
│    참가 신청 링크를 공유하거나          │
│    직접 참가자를 추가해보세요           │
│                                      │
│  [참가자 추가하기]  [신청 링크 복사]   │
│                                      │
└──────────────────────────────────────┘
```

**일정표 (관리자)**
```
┌──────────────────────────────────────┐
│                                      │
│         [Calendar 아이콘]             │
│                                      │
│    행사 일정을 등록해주세요            │
│    일차별 세션을 추가하면              │
│    참가자들이 타임라인으로 확인합니다   │
│                                      │
│        [첫 일정 추가하기]             │
│                                      │
└──────────────────────────────────────┘
```

**출석 현황 (교사)**
```
┌──────────────────────────────────────┐
│                                      │
│        [CheckCircle 아이콘]           │
│                                      │
│    오늘 출석 체크할 세션이 없습니다     │
│    일정이 등록되면 여기서              │
│    조원 출석을 체크할 수 있어요        │
│                                      │
│        [일정 확인하기]                │
│                                      │
└──────────────────────────────────────┘
```

**조별 현황 (참가자)**
```
┌──────────────────────────────────────┐
│                                      │
│          [Users 아이콘]               │
│                                      │
│    아직 조가 편성되지 않았어요         │
│    선생님이 곧 조를 알려줄 거예요!     │
│                                      │
│        [일정 보기]                    │
│                                      │
└──────────────────────────────────────┘
```

**프로그램 (참가자)**
```
┌──────────────────────────────────────┐
│                                      │
│         [HelpCircle 아이콘]           │
│                                      │
│    아직 참여할 프로그램이 없어요        │
│    프로그램이 시작되면 알림을 보내드릴게요! │
│                                      │
│        [리더보드 보기]                │
│                                      │
└──────────────────────────────────────┘
```

**갤러리 (모든 역할)**
```
┌──────────────────────────────────────┐
│                                      │
│          [Camera 아이콘]              │
│                                      │
│    아직 사진이 없습니다               │
│    행사 중 추억을 공유해보세요!        │
│                                      │
│    [사진 업로드] (교사 이상)           │
│    또는                               │
│    행사가 시작되면 사진이 올라옵니다    │
│    (참가자/학부모)                     │
│                                      │
└──────────────────────────────────────┘
```

**공지사항 (모든 역할)**
```
┌──────────────────────────────────────┐
│                                      │
│         [Megaphone 아이콘]            │
│                                      │
│    등록된 공지사항이 없습니다          │
│                                      │
│    [공지 작성하기] (관리자)            │
│    새로운 공지가 등록되면              │
│    여기에 표시됩니다 (기타 역할)       │
│                                      │
└──────────────────────────────────────┘
```

#### C. No-Results Empty State (검색/필터 결과 없음)

```
┌──────────────────────────────────────┐
│                                      │
│          [Search 아이콘]              │
│                                      │
│    "{검색어}"에 대한 결과가 없습니다   │
│    다른 검색어를 시도해보세요          │
│                                      │
│    [필터 초기화]                      │
│                                      │
└──────────────────────────────────────┘
```

#### D. Celebration Empty State (모두 완료)

출석을 모두 체크했거나, 읽지 않은 공지가 없을 때:

```
┌──────────────────────────────────────┐
│                                      │
│          [PartyPopper 아이콘]         │
│           (primary 색상)              │
│                                      │
│    모든 출석 체크를 완료했습니다!       │
│    수고하셨습니다                      │
│                                      │
│    [대시보드로 돌아가기]              │
│                                      │
└──────────────────────────────────────┘
```

### 1.3 대시보드 Zero-Data 화면

관리자가 처음 대시보드에 진입했을 때, 모든 위젯이 빈 상태인 경우 Bento Grid 전체를 "설정 가이드" 화면으로 대체한다:

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  환영합니다, [이름]님!                                    │
│  행사 준비를 시작해볼까요?                                 │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ ① 행사 등록   │  │ ② 일정 추가   │  │ ③ 참가자 등록 │   │
│  │              │  │              │  │              │   │
│  │ 행사명, 기간, │  │ 일차별 세션을  │  │ 신청 폼 링크를│   │
│  │ 장소를 입력   │  │ 등록하세요    │  │ 공유하세요    │   │
│  │              │  │              │  │              │   │
│  │ [시작하기 →]  │  │ [아직 안됨]   │  │ [아직 안됨]   │   │
│  │ ✅ 완료됨     │  │ ○ 대기중      │  │ ○ 대기중      │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │ ④ 조 편성     │  │ ⑤ 공지 작성   │                     │
│  │              │  │              │                     │
│  │ 조를 만들고   │  │ 첫 공지를     │                     │
│  │ 교사를 배정   │  │ 작성해보세요   │                     │
│  │              │  │              │                     │
│  │ [아직 안됨]   │  │ [아직 안됨]   │                     │
│  │ ○ 대기중      │  │ ○ 대기중      │                     │
│  └──────────────┘  └──────────────┘                     │
│                                                          │
│  💡 도움이 필요하면 우측 하단 AI 도우미에게 물어보세요     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**구현 로직**:
- 각 카드는 해당 테이블의 데이터 존재 여부로 상태 결정
- 이전 단계가 완료되어야 다음 단계 활성화 (sequential unlock)
- 완료된 카드는 체크마크 + 실제 데이터 미리보기 표시
- 모든 단계 완료 시 → 정상 Bento Grid 대시보드로 전환

### 1.4 EmptyState 컴포넌트 설계

```typescript
// components/shared/EmptyState.tsx
interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  variant?: 'default' | 'celebration' | 'search' | 'error'
  className?: string
}

// 스타일 가이드:
// - 컨테이너: py-16 flex flex-col items-center text-center
// - 아이콘: 48x48, bg-muted rounded-xl p-3, text-muted-foreground
// - celebration variant: bg-primary/10, text-primary
// - 제목: text-lg font-semibold text-foreground mt-4
// - 설명: text-sm text-muted-foreground mt-2 max-w-sm
// - CTA 버튼: mt-6, variant="default" (primary)
// - 보조 액션: variant="ghost"
// - Framer Motion: initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
```

---

## 2. First-Run Experience

### 2.1 설계 원칙

사용자가 앱에 처음 접속했을 때 60초 이내에 핵심 가치를 경험("Aha moment")하게 해야 한다.
이 프로젝트에서 각 역할의 Aha moment는 다음과 같다:

| 역할 | Aha Moment | 목표 시간 |
|------|-----------|-----------|
| 관리자 | 대시보드에서 행사 현황 한눈에 보기 | 5분 (BYOS 설정 포함) |
| 교사 | 내 조 학생 목록 확인 + 출석 체크 해보기 | 30초 |
| 참가자 | 내 일정 + 내 조 정보 확인 | 15초 |
| 학부모 | 자녀 참여 현황 확인 | 15초 |

### 2.2 역할별 First-Run 플로우

#### A. 관리자 (Admin) - BYOS 온보딩 위자드

BYOS 온보딩 위자드(docs/BYOS.md Section 4 참조)가 완료된 직후, 관리자는 "행사 설정 가이드" (Section 1.3의 Zero-Data 대시보드)를 만나게 된다.

위자드 완료 직후 추가 행동:
```
BYOS 위자드 완료
    ↓
🎉 축하 모달 (confetti 애니메이션, 2초)
    "설정이 완료되었습니다!"
    "이제 행사를 만들어볼까요?"
    ↓
[행사 만들기 시작] 클릭
    ↓
행사 생성 폼 (이름, 기간, 장소, 유형)
    ↓
완료 → 대시보드 진입 (Zero-Data 가이드 표시)
```

#### B. 교사 (Staff) - 빠른 온보딩

교사는 관리자로부터 초대 링크를 받아 접속한다. 불필요한 설정 없이 즉시 핵심 기능에 접근해야 한다.

```
초대 링크 클릭 → 로그인
    ↓
┌────────────────────────────────────────┐
│   환영합니다, [이름] 선생님!            │
│                                        │
│   [교회명] [행사명]에 교사로             │
│   등록되었습니다.                       │
│                                        │
│   담당 조: [사랑조] (조원 8명)           │
│                                        │
│   ┌──────────────┐  ┌──────────────┐  │
│   │ 내 조 보기    │  │ 출석 체크하기  │  │
│   └──────────────┘  └──────────────┘  │
│                                        │
│   💡 화면 하단 메뉴에서 더 많은         │
│      기능을 확인할 수 있어요            │
│                                        │
│           [시작하기]                    │
└────────────────────────────────────────┘
```

교사에게는 3단계 coachmark 투어만 제공:
1. **하단 네비게이션** 강조 → "여기서 주요 기능에 접근하세요"
2. **출석 탭** 강조 → "매 세션마다 여기서 조원 출석을 체크하세요"
3. **AI 도우미 버튼** 강조 → "사용법이 궁금하면 언제든 물어보세요"

#### C. 참가자 (Student, 10-18세) - Zero-Friction 진입

참가자는 가입/로그인을 최소화하고 즉시 컨텐츠에 접근해야 한다.

```
참가 코드 또는 링크 입력
    ↓
이름 + 생년월일 확인 (이미 등록된 참가자 매칭)
    ↓
즉시 대시보드 진입
    ↓
첫 화면: 풀스크린 환영 카드 (1회만 표시)
┌────────────────────────────────────────┐
│                                        │
│   [교회 로고/행사 이미지]               │
│                                        │
│   [행사명] 여름수련회                   │
│   에 오신 것을 환영합니다!              │
│                                        │
│   [이름]님은 [사랑조]입니다             │
│   조장 선생님: [교사이름]               │
│                                        │
│          [시작하기]                     │
│                                        │
└────────────────────────────────────────┘
```

참가자 UI에는 투어나 coachmark를 사용하지 않는다. 대신:
- **직관적 아이콘 + 큰 터치 타겟** (최소 48x48px)
- **하단 네비게이션 4탭**: 홈, 일정, 프로그램, 내정보
- **첫 접속 시 팁 카드**: 대시보드 상단에 dismiss 가능한 팁 카드 1개

```
┌────────────────────────────────────────┐
│ 💡 오늘의 팁                    [✕]   │
│ 하단 메뉴에서 일정을 확인하고           │
│ 프로그램에 참여할 수 있어요!            │
└────────────────────────────────────────┘
```

#### D. 학부모 (Parent) - Read-Only 대시보드

학부모는 자녀의 참가 상태를 확인하는 것이 유일한 목적이다. 별도 투어 없이 간단한 안내만 제공한다.

```
로그인 후 즉시:
┌────────────────────────────────────────┐
│                                        │
│   [자녀이름]의 참여 현황                │
│                                        │
│   ┌──────────┐ ┌──────────┐           │
│   │ 출석률    │ │ 참여 일수 │           │
│   │ 95%      │ │ 2/3일    │           │
│   └──────────┘ └──────────┘           │
│                                        │
│   오늘의 일정                          │
│   ─────────────────                    │
│   09:00 아침집회 ✅ 출석                │
│   10:30 조별활동 (진행중)              │
│   ...                                  │
│                                        │
│   갤러리 (최신 사진)                    │
│   ┌────┐ ┌────┐ ┌────┐               │
│   │ 📷 │ │ 📷 │ │ 📷 │               │
│   └────┘ └────┘ └────┘               │
│                                        │
└────────────────────────────────────────┘
```

### 2.3 구현: React Libraries

**권장 라이브러리: NextStep.js 또는 Driver.js**

| 라이브러리 | 장점 | 적합 시나리오 |
|-----------|------|-------------|
| **NextStep.js** | Next.js App Router 네이티브 지원, Framer Motion 기반 애니메이션, 경량 | Coachmark 투어 (교사 온보딩) |
| **Driver.js** | 프레임워크 무관, 가벼움(5KB), 시각적으로 세련됨 | 단일 요소 highlight (관리자 가이드) |
| **OnboardJS** | Headless(UI 자유), 상태 머신 기반 | 복잡한 조건부 온보딩 플로우 |

**권장 선택**: NextStep.js (Next.js 네이티브, Framer Motion 이미 사용 중, shadcn/ui 호환)

```typescript
// 교사 온보딩 투어 정의 예시
const teacherTourSteps = [
  {
    selector: '[data-tour="bottom-nav"]',
    title: '주요 메뉴',
    content: '여기서 출석, 일정, 조 정보에 접근하세요',
    position: 'top',
  },
  {
    selector: '[data-tour="attendance-tab"]',
    title: '출석 체크',
    content: '매 세션마다 여기서 조원 출석을 체크하세요',
    position: 'top',
  },
  {
    selector: '[data-tour="ai-chat-button"]',
    title: 'AI 도우미',
    content: '사용법이 궁금하면 언제든 물어보세요',
    position: 'left',
  },
]
```

### 2.4 투어 상태 관리

```typescript
// stores/onboardingStore.ts
interface OnboardingState {
  // 각 역할별 투어 완료 상태
  tourCompleted: Record<string, boolean>  // { 'teacher-main': true, ... }
  // 팁 카드 dismiss 상태
  dismissedTips: string[]                // ['dashboard-tip', 'quiz-tip', ...]
  // 설정 가이드 진행 상태
  setupSteps: Record<string, boolean>    // { 'event-created': true, ... }

  completeTour: (tourId: string) => void
  dismissTip: (tipId: string) => void
  completeSetupStep: (stepId: string) => void
  resetOnboarding: () => void
}

// localStorage에 persist하여 새로고침 후에도 유지
// Zustand persist middleware 사용
```

---

## 3. Progressive Onboarding

### 3.1 설계 원칙

모든 기능을 한 번에 보여주면 cognitive overload가 발생한다. 특히 비기술 사용자(교회 스태프)에게는 "다음에 해야 할 한 가지"만 명확하게 안내해야 한다.

**핵심 원칙**:
- 사용자가 현재 작업을 완료했을 때만 다음 기능을 소개
- 컨텍스트에 맞는 시점에 도움말 표시 (기능 사용 직전)
- "Did you know?" 패턴은 기능을 3회 이상 사용한 후에 고급 기능 소개

### 3.2 Contextual Help (맥락적 도움말)

#### A. Inline Hint (인라인 힌트)

폼 필드나 복잡한 UI 옆에 항상 표시되는 작은 도움말:

```
조 편성  ⓘ
─────────────────────
[조 이름] [조원 드래그 앤 드롭 영역]

ⓘ 호버/클릭 시:
┌─────────────────────────────────┐
│ 학년과 성별을 고려하여            │
│ 균형있게 배분하세요.             │
│ 드래그로 조원을 이동할 수 있어요. │
└─────────────────────────────────┘
```

구현:
```typescript
// shadcn/ui의 Tooltip 또는 HoverCard 활용
// components/shared/InlineHint.tsx
interface InlineHintProps {
  content: string
  children: React.ReactNode
}
```

#### B. Contextual Tooltip (컨텍스트 툴팁)

특정 기능을 처음 사용할 때 자동으로 나타나고, dismiss하면 다시 표시하지 않는다:

```typescript
// 표시 조건: 해당 기능 페이지에 처음 진입 + 투어 미완료
// 저장: onboardingStore.dismissedTips

사용 예시:
- 출석 체크 페이지 첫 진입 → "좌우 스와이프로 지각/사유를 선택할 수 있어요"
- 퀴즈 생성 첫 진입 → "OX 문제가 가장 쉽게 만들 수 있어요. 먼저 시도해보세요"
- 갤러리 첫 진입 → "사진을 여러 장 한 번에 업로드할 수 있어요"
```

#### C. Feature Discovery (기능 발견)

사용자가 특정 행동 패턴을 보일 때 관련 고급 기능을 소개:

| 트리거 | 소개할 기능 | 메시지 |
|--------|-----------|--------|
| 참가자 5명 이상 수동 추가 | 엑셀 가져오기 | "여러 명을 한 번에 등록하고 싶으세요? 엑셀 파일로 가져오기가 가능합니다" |
| 출석 체크 3회 이상 완료 | 출석 통계 | "출석 통계에서 세션별 출석률을 확인할 수 있어요" |
| 퀴즈 2개 이상 생성 | 실시간 대회 모드 | "실시간 퀴즈 대회로 더 재미있게 진행해보세요!" |
| 사진 10장 이상 업로드 | 앨범 분류 | "앨범별로 사진을 정리하면 찾기 쉬워요" |

구현:
```typescript
// hooks/useFeatureDiscovery.ts
function useFeatureDiscovery(featureId: string, triggerCount: number) {
  // TanStack Query로 사용 횟수 추적
  // 조건 충족 시 toast 또는 banner 표시
  // dismiss 시 onboardingStore에 저장
}
```

### 3.3 Checklist Pattern (체크리스트 패턴)

관리자 대시보드에 "설정 완료도"를 표시하는 사이드바 위젯:

```
┌──────────────────────────┐
│ 행사 준비 현황     3/6    │
│ ━━━━━━━━━░░░░░░ 50%     │
│                          │
│ ✅ Supabase 연결          │
│ ✅ 행사 등록              │
│ ✅ 일정 추가              │
│ ○  참가자 등록 ← 다음!    │
│ ○  조 편성                │
│ ○  교사 초대              │
│                          │
│ [참가자 등록하기 →]       │
└──────────────────────────┘
```

**설계 원칙**:
- 프로그레스 바로 전체 진행률 시각화
- 현재 해야 할 단계를 "← 다음!" 또는 화살표로 강조
- 완료된 항목은 체크마크 + 취소선 없이 유지 (성취감)
- 모든 항목 완료 시 → confetti + "모든 준비가 완료되었습니다!" → 위젯 자동 숨김
- 위젯은 닫기 가능하되, 미완료 항목이 있으면 사이드바에 작은 뱃지로 잔류

---

## 4. Wizard/Stepper UX

### 4.1 설계 원칙

이 프로젝트에서 wizard/stepper가 필요한 핵심 플로우:
1. **BYOS 온보딩 위자드** (4~5단계) - 가장 중요
2. **행사 생성 폼** (3단계: 기본정보 → 일정 → 조편성)
3. **참가 신청 폼** (2단계: 개인정보 → 건강/동의)
4. **퀴즈 생성 폼** (3단계: 기본설정 → 문제입력 → 미리보기)

### 4.2 Progress Indicator 패턴

#### 데스크톱: Horizontal Stepper

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ① Supabase 가입 ──── ② 프로젝트 생성 ──── ③ 연결   │
│       ✅                  ● (현재)            ○      │
│                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░░ 50%     │
│                                                      │
└──────────────────────────────────────────────────────┘

● 현재 단계: primary 색, filled circle, bold 텍스트
✅ 완료 단계: primary 색, 체크마크, 클릭하면 해당 단계로 이동
○ 미래 단계: muted 색, empty circle, 비활성
연결선: 완료 구간은 primary, 미완료는 muted
```

#### 모바일: Dot Stepper + Text

```
┌────────────────────────────────────┐
│  Step 2 / 4                       │
│  프로젝트 생성                     │
│  ● ● ○ ○                         │
└────────────────────────────────────┘

모바일에서는 공간 절약을 위해:
- 현재 단계 번호/이름만 텍스트로 표시
- 전체 진행률은 dot indicator
- 상단 고정 (sticky)
```

### 4.3 Step Validation (단계별 검증)

```typescript
// 각 단계별 Zod 스키마로 독립 검증
// validators/onboarding.ts

import { z } from 'zod'

export const step1Schema = z.object({
  supabaseUrl: z.string()
    .url('올바른 URL 형식이 아닙니다')
    .includes('supabase', { message: 'Supabase URL이 아닙니다' }),
  anonKey: z.string()
    .min(100, 'anon key가 너무 짧습니다')
    .startsWith('eyJ', '올바른 anon key 형식이 아닙니다'),
})

export const step2Schema = z.object({
  churchName: z.string().min(2, '교회명을 입력하세요'),
  adminName: z.string().min(2, '관리자 이름을 입력하세요'),
})
```

**검증 UX 원칙**:
- 다음 단계 진행 시 현재 단계 검증 (submit-time validation)
- 인라인 오류 메시지 (필드 바로 아래, 빨간색)
- 이전 단계로 돌아가면 입력값 유지
- 검증 실패 시 첫 번째 오류 필드로 자동 스크롤 + 포커스

### 4.4 Save & Resume (저장 및 이어하기)

BYOS 온보딩은 중간에 이탈할 가능성이 높다 (Supabase 가입 후 프로젝트 생성 대기 중 등).

```typescript
// hooks/useWizardPersistence.ts
function useWizardPersistence(wizardId: string) {
  // 각 단계 완료 시 localStorage에 자동 저장
  // 키: `wizard_${wizardId}_state`
  // 값: { currentStep, completedSteps, formData, lastSavedAt }

  // 재접속 시:
  // 1. 저장된 상태 확인
  // 2. 이어하기 다이얼로그 표시:
  //    "이전에 진행하던 설정이 있습니다. 이어서 하시겠습니까?"
  //    [이어서 하기] [처음부터 다시]
  // 3. timestamp 기반 만료 (7일)
}
```

**시각적 피드백**:
```
자동 저장 시:
  하단에 "✓ 자동 저장됨" 텍스트 (fade-in → 2초 후 fade-out)
  색상: muted-foreground
  위치: stepper 아래 또는 폼 영역 좌측 하단
```

### 4.5 Wizard 네비게이션 패턴

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  [← 이전]                              [다음 →]   │
│                                                    │
│  마지막 단계에서:                                   │
│  [← 이전]                           [완료하기 ✓]  │
│                                                    │
│  버튼 스타일:                                       │
│  - 이전: ghost variant, 좌측 화살표 아이콘           │
│  - 다음: primary variant, 우측 화살표 아이콘         │
│  - 완료: primary variant, 체크마크 아이콘, 더 굵게   │
│                                                    │
│  키보드:                                            │
│  - Enter: 다음 단계                                 │
│  - Escape: 위자드 닫기 (확인 다이얼로그)            │
│                                                    │
│  모바일:                                            │
│  - 버튼 하단 고정 (sticky bottom)                   │
│  - safe-area-bottom 적용                            │
│  - 버튼 높이: 52px                                  │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 5. Help & Support UX

### 5.1 도움말 계층 구조

이 프로젝트의 도움말은 4개 계층으로 구성된다:

```
Level 1: AI 챗봇 (항상 접근 가능, 자연어)
    ↑
Level 2: Contextual Tooltip (기능 사용 시점, 자동)
    ↑
Level 3: FAQ/도움말 페이지 (설정 > 도움말)
    ↑
Level 4: 온보딩 투어 재실행 (설정 > 튜토리얼 다시보기)
```

### 5.2 AI 챗봇 통합 (Level 1)

DESIGN.md Section 16의 채팅 위젯 디자인에 추가되는 UX 패턴:

#### 역할별 빠른 질문 칩 차별화

```typescript
const quickQuestionsByRole = {
  admin: [
    '참가자를 어떻게 등록하나요?',
    '조 편성은 어떻게 하나요?',
    '출석 통계를 보려면?',
    'Supabase 설정 변경하기',
  ],
  staff: [
    '출석 체크 방법',
    '조별 점수 입력하기',
    '공지 작성하기',
    '사진 업로드하기',
  ],
  student: [
    '내 조는 어디야?',
    '퀴즈는 언제 해?',
    '사진 보는 법',
  ],
  parent: [
    '우리 아이 출석 확인',
    '행사 일정 보기',
    '사진 다운로드',
  ],
}
```

#### AI 챗봇 시스템 프롬프트 가이드라인

```
- 한국어로 응답
- 현재 사용자의 역할에 맞는 답변 제공
- 단계별 안내 시 번호 매기기 (① ② ③)
- 앱 내 화면 경로 안내 시: "대시보드 > 출석 > 조원 목록" 형태
- 학생 질문에는 쉬운 말, 짧은 문장 사용
- 모르는 질문에는 "이 부분은 선생님께 직접 물어보세요" 안내
```

#### 대화 시작 시 환영 메시지

```
AI 도우미를 처음 열 때:
┌─────────────────────────────────────┐
│  AI: 안녕하세요! 교회 여름행사        │
│  LMS 사용을 도와드릴게요.            │
│                                     │
│  아래 질문을 누르거나,                │
│  궁금한 점을 자유롭게 물어보세요.     │
│                                     │
│  [출석 방법] [조편성] [프로그램 생성]    │
│  [사용법]                            │
└─────────────────────────────────────┘

2회차 이후 열 때:
┌─────────────────────────────────────┐
│  AI: 다시 오셨군요! 무엇을           │
│  도와드릴까요?                       │
│                                     │
│  [출석 방법] [조편성] [프로그램 생성]    │
└─────────────────────────────────────┘
```

### 5.3 FAQ 도움말 페이지 (Level 3)

설정 메뉴 내 "도움말" 페이지. shadcn/ui의 Accordion 컴포넌트 활용.

```
┌────────────────────────────────────────┐
│  도움말                                │
│                                        │
│  카테고리:  [전체] [시작하기] [출석]    │
│            [일정] [프로그램] [문제해결]  │
│                                        │
│  ┌────────────────────────────────────┐│
│  │ ▶ Supabase 연결이 끊어졌어요       ││
│  ├────────────────────────────────────┤│
│  │ ▶ 참가자를 일괄 등록하고 싶어요     ││
│  ├────────────────────────────────────┤│
│  │ ▼ 출석 체크는 어떻게 하나요?       ││
│  │                                    ││
│  │   1. 하단 메뉴에서 '출석'을         ││
│  │      눌러주세요                     ││
│  │   2. 오늘의 세션을 선택하세요       ││
│  │   3. 조원 목록에서 출석/결석을      ││
│  │      체크하세요                     ││
│  │   4. '제출하기'를 눌러주세요        ││
│  │                                    ││
│  │   💡 스와이프로 지각/사유도          ││
│  │      선택할 수 있어요               ││
│  ├────────────────────────────────────┤│
│  │ ▶ 퀴즈는 어떻게 만드나요?          ││
│  ├────────────────────────────────────┤│
│  │ ▶ 오프라인에서도 사용할 수 있나요?  ││
│  └────────────────────────────────────┘│
│                                        │
│  찾는 내용이 없나요?                    │
│  [AI 도우미에게 물어보기]              │
│                                        │
└────────────────────────────────────────┘
```

**구현 구조**:
```
// Accordion 내용은 JSON 또는 MDX로 관리
// lib/help/faqData.ts

interface FaqItem {
  id: string
  category: 'getting-started' | 'attendance' | 'schedule' | 'quiz' | 'troubleshooting'
  question: string
  answer: string  // 마크다운 지원
  roles: ('admin' | 'staff' | 'student' | 'parent')[]
}
```

### 5.4 튜토리얼 재실행 (Level 4)

설정 > "튜토리얼 다시보기"에서 온보딩 투어를 다시 실행할 수 있다:

```
┌────────────────────────────────────────┐
│  튜토리얼                              │
│                                        │
│  ┌────────────────────────────────────┐│
│  │ 기능 둘러보기                ▶ 시작 ││
│  │ 주요 화면과 기능을 안내합니다       ││
│  ├────────────────────────────────────┤│
│  │ 출석 체크 방법              ▶ 시작 ││
│  │ 조원 출석을 체크하는 방법          ││
│  ├────────────────────────────────────┤│
│  │ 퀴즈 만들기 (관리자)        ▶ 시작 ││
│  │ 성경 퀴즈를 만드는 방법            ││
│  └────────────────────────────────────┘│
│                                        │
│  [온보딩 전체 초기화]                  │
│  (모든 팁과 안내가 다시 표시됩니다)    │
│                                        │
└────────────────────────────────────────┘
```

---

## 6. Error States & Feedback

### 6.1 설계 원칙

1. **구체적**: "오류가 발생했습니다" 대신 "인터넷 연결이 끊어졌습니다"
2. **해결 가능**: 오류 메시지에 반드시 해결 방법 포함
3. **비난하지 않음**: "잘못된 입력" 대신 "형식을 확인해주세요"
4. **한국어**: 사용자 노출 메시지는 모두 한국어 (개발자 로그만 영어)
5. **적절한 채널**: 오류 심각도에 따라 Toast / Inline / Banner / Modal 분리

### 6.2 오류 표시 채널 매트릭스

| 심각도 | 채널 | 예시 | 지속시간 |
|--------|------|------|----------|
| **Critical** | Modal (차단) | Supabase 연결 실패, 인증 만료 | 사용자가 닫을 때까지 |
| **High** | Banner (상단 고정) | 오프라인 상태, 스키마 불일치 | 상태 복구까지 |
| **Medium** | Toast (알림) | 저장 실패, API 오류 | 5초 (닫기 가능) |
| **Low** | Inline (필드 아래) | 폼 검증 오류 | 오류 해결까지 |

### 6.3 Toast Notification 시스템

```typescript
// DESIGN.md Section 8.6의 스펙을 따르되, 아래 패턴 추가

// toast 유형별 사양
interface ToastConfig {
  variant: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  action?: { label: string; onClick: () => void }  // "다시 시도" 등
  duration?: number  // 기본: 5000ms
}

// 사용 예:
toast({
  variant: 'error',
  title: '출석 저장에 실패했습니다',
  description: '잠시 후 다시 시도해주세요',
  action: {
    label: '다시 시도',
    onClick: () => retrySubmission(),
  },
})

toast({
  variant: 'success',
  title: '출석이 저장되었습니다',
  description: '사랑조 12명 출석 완료',
})
```

**Toast 위치**:
- 데스크톱: 우측 하단 (AI 챗봇 버튼과 겹치지 않게 y 오프셋)
- 모바일: 상단 (헤더 아래, 하단 네비 위에 표시하면 가려짐)

**Toast 스택**: 최대 3개 동시 표시, FIFO 방식으로 오래된 것부터 제거

### 6.4 Inline Form Validation (인라인 폼 검증)

```
┌────────────────────────────────────────┐
│  참가자 등록                            │
│                                        │
│  이름 *                                │
│  ┌────────────────────────────────────┐│
│  │ 김                                 ││ ← border: red
│  └────────────────────────────────────┘│
│  ⚠️ 이름은 2글자 이상 입력해주세요      │ ← text-destructive, text-sm
│                                        │
│  생년월일 *                             │
│  ┌────────────────────────────────────┐│
│  │ 2015-03-22                         ││ ← border: default (정상)
│  └────────────────────────────────────┘│
│  ✓ 만 11세                             │ ← text-primary, text-sm
│                                        │
│  연락처 *                              │
│  ┌────────────────────────────────────┐│
│  │                                    ││ ← 아직 입력 안함: border: default
│  └────────────────────────────────────┘│
│  (빈 필드는 제출 시까지 오류 안 보임)    │
│                                        │
└────────────────────────────────────────┘
```

**검증 타이밍 규칙**:
1. **최초 입력**: 오류 표시하지 않음 (focus 시점에 검증하면 짜증남)
2. **blur 시 (필드 떠날 때)**: 검증 실행, 오류 있으면 표시
3. **submit 시**: 모든 필드 검증, 첫 오류 필드로 스크롤+포커스
4. **오류 해결 중**: 타이핑할 때마다 실시간 검증 (이미 오류가 표시된 필드만)

```typescript
// React Hook Form + Zod 통합 패턴
// mode: 'onBlur'로 설정하되, 오류 상태인 필드만 'onChange'로 전환

const form = useForm({
  resolver: zodResolver(participantSchema),
  mode: 'onBlur',        // 기본: blur 시 검증
  reValidateMode: 'onChange',  // 오류 표시 후: 타이핑마다 재검증
})
```

### 6.5 Network Error Recovery (네트워크 오류 복구)

#### 오프라인 배너

```
┌────────────────────────────────────────────────────────┐
│ ⚠️ 인터넷 연결이 끊어졌습니다                           │
│    저장된 데이터로 일부 기능만 사용할 수 있습니다         │
│    변경사항은 연결이 복구되면 자동으로 저장됩니다         │
│                                              [닫기]    │
└────────────────────────────────────────────────────────┘

스타일:
  bg-amber-50 border-b border-amber-200 (light)
  bg-amber-900/20 border-amber-700 (dark)
  px-4 py-3
  Framer Motion: slide-down 300ms
  위치: 헤더 바로 아래, sticky

온라인 복구 시:
┌────────────────────────────────────────────────────────┐
│ ✅ 인터넷이 다시 연결되었습니다                          │
│    저장 대기 중인 데이터를 동기화합니다...               │
└────────────────────────────────────────────────────────┘
  bg-primary/10
  3초 후 자동 fade-out
```

#### API 오류 재시도 패턴

```typescript
// TanStack Query 재시도 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,                    // 최대 2회 재시도
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      staleTime: 1000 * 60 * 5,   // 5분간 캐시
    },
    mutations: {
      retry: 1,                    // 변경 작업은 1회만 재시도
      onError: (error) => {
        // 전역 에러 핸들러
        toast({
          variant: 'error',
          title: '요청 처리에 실패했습니다',
          description: '잠시 후 다시 시도해주세요',
          action: { label: '다시 시도', onClick: () => {} },
        })
      },
    },
  },
})
```

#### Full-Page Error Screen

전체 페이지 로드가 실패했을 때:

```
┌────────────────────────────────────────┐
│                                        │
│                                        │
│         [CloudOff 아이콘]               │
│          64px, text-muted              │
│                                        │
│    페이지를 불러올 수 없습니다           │
│                                        │
│    인터넷 연결을 확인하거나              │
│    잠시 후 다시 시도해주세요             │
│                                        │
│    [다시 시도]   [홈으로 가기]          │
│                                        │
│    오류 코드: NETWORK_ERROR             │
│    (작은 텍스트, muted)                 │
│                                        │
└────────────────────────────────────────┘
```

```typescript
// app/(dashboard)/error.tsx (Next.js Error Boundary)
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // EmptyState variant="error" 활용
}
```

### 6.6 Supabase-Specific 오류 처리

| Supabase 오류 | 사용자 메시지 | 해결 방법 |
|---------------|-------------|-----------|
| `PGRST301` (JWT expired) | "로그인이 만료되었습니다" | [다시 로그인] 버튼 |
| `23505` (unique violation) | "이미 등록된 [항목]입니다" | 중복 데이터 확인 안내 |
| `42501` (insufficient privilege) | "이 작업의 권한이 없습니다" | 관리자에게 문의 안내 |
| `PGRST204` (no rows) | (empty state 표시) | 데이터 추가 CTA |
| `FetchError` | "서버에 연결할 수 없습니다" | 네트워크 확인 안내 |
| Rate limit (429) | "잠시 후 다시 시도해주세요" | 자동 재시도 (exponential backoff) |

---

## 7. Success States

### 7.1 설계 원칙

성공 상태는 사용자에게 "작업이 완료되었다"는 확신과 함께 "다음 행동"을 안내해야 한다.
83%의 사용자가 명확한 완료 확인을 기대하며, 이를 제공하지 않으면 이탈률이 상승한다.

### 7.2 Success 유형별 패턴

#### A. Inline Success (인라인 성공)

빈번한 작업의 즉각적 확인. 새 화면 전환 없이 현재 UI에서 피드백.

```
출석 체크 완료:
┌────────────────────────────────────┐
│ ┌──┐                              │
│ │JM│  김민준           ✅ 출석     │  체크 시:
│ └──┘  중등 2학년                   │  1. 체크마크 SVG path draw (200ms)
│                                    │  2. 행 배경 fade: white → emerald/10
│                                    │  3. 디바이스 진동 50ms (모바일)
└────────────────────────────────────┘
```

적용 대상:
- 출석 체크 개별 항목
- 포인트 부여
- 공지 읽음 처리
- 설정 토글 변경

구현:
```typescript
// React 19 useOptimistic 활용
// 체크 즉시 UI 반영 → 서버 확인 → 실패 시 rollback

const [optimisticAttendance, addOptimistic] = useOptimistic(
  attendance,
  (state, { participantId, status }) =>
    state.map(item =>
      item.participantId === participantId
        ? { ...item, status }
        : item
    )
)
```

#### B. Toast Success (토스트 성공)

폼 제출, 일괄 작업 등 명시적 action 후 확인:

```
┌────────────────────────────────┐
│ ✅ │ 출석이 저장되었습니다       │
│    │ 사랑조 12명 출석 완료      │
└────────────────────────────────┘
  slide-in 300ms → 3초 후 fade-out
```

적용 대상:
- 출석 일괄 제출
- 공지 작성 완료
- 참가자 등록 완료
- 자료 업로드 완료
- 설정 저장 완료

#### C. Confirmation Screen (확인 화면)

중요한 작업(행사 생성, BYOS 설정) 완료 시 전용 화면:

```
┌────────────────────────────────────────┐
│                                        │
│         [CheckCircle 아이콘]            │
│         primary, 64px                  │
│         scale 0→1 bounce (400ms)       │
│                                        │
│    행사가 성공적으로 등록되었습니다!      │
│                                        │
│    ┌──────────────────────────────┐    │
│    │ 행사명: 2026 여름 수련회       │    │
│    │ 기간: 7/20 ~ 7/22 (2박 3일)  │    │
│    │ 장소: 소망수양관              │    │
│    └──────────────────────────────┘    │
│                                        │
│    다음 단계:                           │
│    ┌──────────────┐ ┌──────────────┐  │
│    │ 일정 추가하기  │ │ 참가자 등록   │  │
│    │     →         │ │     →        │  │
│    └──────────────┘ └──────────────┘  │
│                                        │
│    [대시보드로 가기]                    │
│                                        │
└────────────────────────────────────────┘
```

#### D. Celebration Animation (축하 애니메이션)

특별한 성취 시 모션으로 기쁨을 전달:

| 상황 | 애니메이션 | 지속시간 |
|------|-----------|----------|
| BYOS 설정 완료 | Confetti burst (상단에서 아래로) | 2000ms |
| 전체 출석 달성 | Checkmark draw + pulse | 800ms |
| 퀴즈 정답 | 작은 confetti + 점수 count-up | 1000ms |
| 퀴즈 만점 | 큰 confetti + 별 효과 | 2000ms |
| 리더보드 1위 달성 | Crown 아이콘 등장 + glow | 1500ms |

```typescript
// 구현: canvas-confetti 라이브러리 (경량, ~6KB)
// 또는 Framer Motion 커스텀 파티클 시스템

import confetti from 'canvas-confetti'

function celebrateCompletion() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.3 },
    colors: ['#10B981', '#3B82F6', '#F59E0B'],  // primary, secondary, accent
  })
}
```

**접근성**: `prefers-reduced-motion: reduce` 시 confetti/파티클 비활성, 체크마크만 표시

### 7.3 Next-Step Suggestions (다음 단계 제안)

모든 성공 상태에는 "다음에 할 일"을 제안해야 한다:

```typescript
// 성공 상태별 다음 단계 매핑
const nextStepSuggestions = {
  'event-created': [
    { label: '일정 추가하기', path: '/schedule/new' },
    { label: '참가자 등록 열기', path: '/participants' },
  ],
  'schedule-created': [
    { label: '참가자 등록', path: '/participants' },
    { label: '조 편성하기', path: '/groups' },
  ],
  'attendance-submitted': [
    { label: '출석 통계 보기', path: '/attendance/stats' },
    { label: '대시보드로 가기', path: '/dashboard' },
  ],
  'quiz-created': [
    { label: '미리 풀어보기', path: '/quiz/preview' },
    { label: '퀴즈 목록으로', path: '/quiz' },
  ],
}
```

---

## 8. Loading States

### 8.1 설계 원칙

로딩 상태는 "시스템이 동작 중"임을 전달하여 사용자의 불안을 해소한다.
연구에 따르면 skeleton screen은 동일한 대기 시간을 20% 더 빠르게 느끼게 한다.

**원칙**:
1. **100ms 미만**: 로딩 표시 없음 (즉각 반영)
2. **100ms ~ 300ms**: 미세한 opacity 변화 또는 spinner (버튼 내부)
3. **300ms ~ 1초**: Skeleton screen
4. **1초 이상**: Skeleton + 진행 상태 텍스트
5. **3초 이상**: 진행률 표시 + 취소 옵션

### 8.2 Skeleton Screen 패턴

#### 대시보드 Skeleton

```
┌──────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ ░░░░░░   │  │ ░░░░░░   │  │ ░░░░░░░░░░░░░░   │   │
│  │ ░░░░░░░░ │  │ ░░░░░░░░ │  │ ░░░░░░░░░░░░░    │   │
│  │ ░░░░     │  │ ░░░░     │  │ ░░░░░            │   │
│  └──────────┘  └──────────┘  └──────────────────┘   │
│  ┌──────────────────┐  ┌──────────┐  ┌──────────┐   │
│  │ ░░░░░░░░░░░      │  │ ░░░░░░   │  │ ░░░░░░   │   │
│  │ ░░░░░░░░░░░░░    │  │ ░░░░░░░░ │  │ ░░░░░░░░ │   │
│  │ ░░░░░░░░░        │  │ ░░░░     │  │ ░░░░     │   │
│  │ ░░░░░░░░░░░      │  └──────────┘  └──────────┘   │
│  └──────────────────┘                                │
└──────────────────────────────────────────────────────┘

각 카드는 실제 레이아웃과 동일한 위치/크기
```

#### 목록 Skeleton

```
┌────────────────────────────────────┐
│ ┌──┐  ░░░░░░░░░░░     ░░░░       │
│ └──┘  ░░░░░░                      │
├────────────────────────────────────┤
│ ┌──┐  ░░░░░░░░░        ░░░░      │
│ └──┘  ░░░░░░░                     │
├────────────────────────────────────┤
│ ┌──┐  ░░░░░░░░░░░░     ░░░░      │
│ └──┘  ░░░░░                       │
└────────────────────────────────────┘

아바타: rounded-full, 36x36
이름: h-4 w-32 rounded
부가정보: h-3 w-20 rounded
```

### 8.3 Shimmer Effect 구현

```css
/* globals.css 또는 Tailwind 유틸리티 */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--muted) 25%,
    oklch(0.95 0.002 247) 50%,  /* Slate 50보다 약간 밝게 */
    var(--muted) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite ease-in-out;
  border-radius: 4px;
}

/* 다크모드 */
.dark .skeleton {
  background: linear-gradient(
    90deg,
    var(--muted) 25%,
    oklch(0.25 0.02 260) 50%,
    var(--muted) 75%
  );
}
```

### 8.4 Skeleton 컴포넌트

```typescript
// components/shared/Skeleton.tsx
// shadcn/ui의 Skeleton 컴포넌트를 래핑

interface SkeletonCardProps {
  variant: 'stat' | 'list-item' | 'timeline' | 'card' | 'avatar'
  count?: number  // 반복 횟수
}

// 대시보드용 조합 컴포넌트
function DashboardSkeleton() {
  return (
    <div className="bento-grid">
      <SkeletonCard variant="stat" />
      <SkeletonCard variant="stat" />
      <SkeletonCard variant="card" className="bento-wide" />
      <SkeletonCard variant="timeline" className="bento-wide bento-tall" />
      <SkeletonCard variant="stat" />
      <SkeletonCard variant="stat" />
    </div>
  )
}
```

### 8.5 Progressive Loading (점진적 로딩)

대시보드의 여러 위젯이 독립적으로 로드되도록 설계:

```typescript
// 각 Bento Card가 독립적인 TanStack Query를 사용
// 먼저 로드된 카드부터 skeleton → 실제 데이터로 교체

// 로딩 순서 (우선순위):
// 1. D-Day 배너 (상단, 가장 먼저)
// 2. 통계 카드 (출석률, 참가자 수)
// 3. 타임라인 (일정)
// 4. 공지사항
// 5. 리더보드 (하단, 마지막)
```

### 8.6 Optimistic Rendering (낙관적 렌더링)

서버 응답을 기다리지 않고 즉시 UI를 업데이트하는 패턴.
실패 시 자동 rollback.

```typescript
// 적용 대상 (실패 확률 낮고, 빈번한 액션):
// - 출석 체크 (개별 토글)
// - 포인트 부여
// - 공지 읽음 처리
// - 퀴즈 답변 제출

// 미적용 대상 (실패 시 영향이 큰 액션):
// - 참가자 등록/삭제
// - 행사 설정 변경
// - 조 편성 변경
// - 파일 업로드

// React 19 useOptimistic + TanStack Query 조합 예시:
function useOptimisticAttendance(scheduleId: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: AttendanceUpdate) => {
      return checkAttendance(data)
    },
    onMutate: async (newData) => {
      // 1. 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: ['attendance', scheduleId] })

      // 2. 현재 상태 스냅샷
      const previousData = queryClient.getQueryData(['attendance', scheduleId])

      // 3. 낙관적 업데이트
      queryClient.setQueryData(['attendance', scheduleId], (old) =>
        optimisticallyUpdate(old, newData)
      )

      return { previousData }
    },
    onError: (err, newData, context) => {
      // 4. 실패 시 rollback
      queryClient.setQueryData(
        ['attendance', scheduleId],
        context?.previousData
      )
      toast({ variant: 'error', title: '저장에 실패했습니다' })
    },
    onSettled: () => {
      // 5. 최종 동기화
      queryClient.invalidateQueries({ queryKey: ['attendance', scheduleId] })
    },
  })

  return mutation
}
```

### 8.7 Button Loading State (버튼 로딩)

```
제출 전:    [ 제출하기 ]          primary, h-52px
제출 중:    [ ⟳ 제출 중... ]     primary, opacity-80, cursor-not-allowed
                                   spinner: 16px, inline, 좌측
성공:       [ ✓ 완료 ]           primary → success green, 1초 후 원복
실패:       [ 제출하기 ]          원복 + toast 오류

구현:
  <Button disabled={isPending}>
    {isPending ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        제출 중...
      </>
    ) : '제출하기'}
  </Button>
```

---

## 9. Role-Specific UX Strategies

### 9.1 관리자 (Admin) - Non-Technical Church Staff

**핵심 과제**: IT 비전문가가 Supabase 설정 + 전체 행사 관리를 할 수 있어야 함

| UX 전략 | 구현 |
|---------|------|
| 안내형 설정 | BYOS 위자드 (스크린샷 포함 단계별 가이드) |
| 설정 체크리스트 | Zero-Data 대시보드 + 사이드바 체크리스트 위젯 |
| 맥락적 도움 | 모든 관리 기능에 inline hint 아이콘 |
| AI 도우미 | 관리자 전용 빠른 질문 칩 |
| 실수 방지 | 삭제 시 확인 모달, 되돌리기(undo) 토스트 |
| 진행 상황 | 설정 완료도 퍼센트, 체크리스트 |

**Undo 패턴** (삭제 작업):
```
참가자 삭제 시:
  1. 즉시 UI에서 제거 (optimistic)
  2. Toast: "김민준 님이 삭제되었습니다  [되돌리기]" (5초)
  3. 5초 내 되돌리기 → 복원
  4. 5초 경과 → 실제 DB 삭제 실행
```

### 9.2 교사 (Staff) - Quick Access Focus

**핵심 과제**: 모바일에서 30초 이내에 출석 체크 완료

| UX 전략 | 구현 |
|---------|------|
| 빠른 온보딩 | 3-step coachmark (30초 이내) |
| 최소 네비게이션 | 하단 탭에서 출석 1탭으로 접근 |
| 터치 최적화 | 출석 체크: 큰 터치 영역, 스와이프 제스처 |
| 오프라인 지원 | 출석 데이터 로컬 캐시, 온라인 복구 시 동기화 |
| 간소화된 뷰 | 관리 기능 숨김, 내 조 중심 UI |

### 9.3 참가자 (Student, 10-18세) - Intuitive & Fun

**핵심 과제**: 설명서 없이 즉시 사용 가능해야 함

| UX 전략 | 구현 |
|---------|------|
| Zero-tutorial | 투어 없음. 직관적 아이콘 + 큰 터치 타겟 |
| 게이미피케이션 | 퀴즈 점수, 리더보드, 출석 스트릭, 뱃지 |
| 시각적 피드백 | 퀴즈 정답 confetti, 출석 체크 애니메이션 |
| 최소 텍스트 | 아이콘 중심, 짧은 문장 |
| 연령대별 톤 | 초등 "~해요", 중고등 "~합니다" (AI 챗봇 자동 조절) |
| 즐거운 empty state | 캐릭터/이모지 활용, 격려 메시지 |

**게이미피케이션 요소**:
```
┌────────────────────────────────────────┐
│  내 활동                               │
│                                        │
│  🔥 출석 연속 3일째!                    │  streak 카운터
│                                        │
│  ┌──────────┐ ┌──────────┐            │
│  │ 퀴즈 점수 │ │ 우리 조   │            │
│  │ 450 pt   │ │ 2위 🥈   │            │
│  │ 반 평균+12│ │ 1,100pt  │            │
│  └──────────┘ └──────────┘            │
│                                        │
│  최근 뱃지:                             │
│  [📚 성경퀴즈왕] [⭐ 개근상]            │
│                                        │
└────────────────────────────────────────┘
```

### 9.4 학부모 (Parent) - Simple Read-Only

**핵심 과제**: 복잡한 기능 없이 자녀 정보만 명확히 확인

| UX 전략 | 구현 |
|---------|------|
| 극도로 단순한 UI | 대시보드 1페이지에 모든 정보 |
| 읽기 전용 | 편집 기능 없음, 수정 불가 명확히 표시 |
| 자녀 중심 | 자녀 이름 + 사진이 항상 상단에 표시 |
| 알림 연동 | 출석 확인 자동 알림 (PWA push) |
| 갤러리 접근 | 자녀가 포함된 사진 쉽게 접근 |

---

## 10. Implementation Roadmap

### Phase 1 - Core (MVP와 함께)

| 항목 | 우선순위 | 복잡도 |
|------|----------|--------|
| EmptyState 공통 컴포넌트 | P0 | 낮음 |
| Skeleton 공통 컴포넌트 | P0 | 낮음 |
| Toast 시스템 (shadcn/ui sonner) | P0 | 낮음 |
| Inline form validation (RHF + Zod) | P0 | 낮음 |
| Button loading state | P0 | 낮음 |
| BYOS 위자드 stepper | P0 | 중간 |
| 네트워크 오류 배너 | P0 | 낮음 |
| Next.js error.tsx boundary | P0 | 낮음 |

### Phase 2 - Onboarding (행사 2주 전)

| 항목 | 우선순위 | 복잡도 |
|------|----------|--------|
| Zero-Data 대시보드 가이드 | P1 | 중간 |
| 교사 coachmark 투어 (NextStep.js) | P1 | 중간 |
| 참가자 환영 카드 | P1 | 낮음 |
| 학부모 간소 대시보드 | P1 | 낮음 |
| 온보딩 상태 Zustand store | P1 | 낮음 |
| AI 챗봇 역할별 빠른 질문 | P1 | 낮음 |

### Phase 3 - Polish (행사 1주 전)

| 항목 | 우선순위 | 복잡도 |
|------|----------|--------|
| 설정 체크리스트 위젯 | P2 | 중간 |
| FAQ 도움말 페이지 | P2 | 낮음 |
| 축하 애니메이션 (confetti) | P2 | 낮음 |
| Feature discovery 토스트 | P2 | 중간 |
| Optimistic rendering (출석) | P2 | 중간 |
| Undo 패턴 (삭제 취소) | P2 | 중간 |
| 게이미피케이션 UI (참가자) | P2 | 중간 |
| 튜토리얼 재실행 | P2 | 낮음 |

### Phase 4 - Enhancement (행사 후)

| 항목 | 우선순위 | 복잡도 |
|------|----------|--------|
| Progressive disclosure (고급 기능) | P3 | 중간 |
| 적응형 온보딩 (행동 기반) | P3 | 높음 |
| 다국어 온보딩 | P3 | 중간 |

---

## References

### Empty State Design
- [Empty state UX examples and design rules (Eleken)](https://www.eleken.co/blog-posts/empty-state-ux)
- [Empty State UX Best Practices (Pencil & Paper)](https://www.pencilandpaper.io/articles/empty-states)
- [Empty States Pattern (Carbon Design System)](https://carbondesignsystem.com/patterns/empty-states-pattern/)
- [Designing the Overlooked Empty States (UXPin)](https://www.uxpin.com/studio/blog/ux-best-practices-designing-the-overlooked-empty-states/)
- [Empty State UI Pattern (Mobbin)](https://mobbin.com/glossary/empty-state)

### Onboarding & First-Run Experience
- [7 User Onboarding Best Practices for 2026 (Formbricks)](https://formbricks.com/blog/user-onboarding-best-practices)
- [17 Best Onboarding Flow Examples for New Users 2026 (Whatfix)](https://whatfix.com/blog/user-onboarding-examples/)
- [First-Time User Experience 2026: AI-Powered Onboarding (Chameleon)](https://www.chameleon.io/blog/first-time-user-experience)
- [Onboarding Tutorials vs. Contextual Help (NN/g)](https://www.nngroup.com/articles/onboarding-tutorials/)
- [Coach Marks Guide (FlowMapp)](https://www.flowmapp.com/blog/qa/coach-marks)

### Progressive Onboarding
- [Progressive Onboarding: UX and Adoption (Userpilot)](https://userpilot.com/blog/progressive-onboarding/)
- [What is Progressive Disclosure? (IxDF)](https://ixdf.org/literature/topics/progressive-disclosure)
- [Advanced Guide to Progressive Onboarding (UserGuiding)](https://userguiding.com/blog/progressive-onboarding)

### Wizard/Stepper
- [Beyond the Progress Bar: Stepper UI Design 2026 (Lollypop)](https://lollypop.design/blog/2026/february/beyond-the-progress-bar-the-art-of-stepper-ui-design/)
- [Multi-Step Form Best Practices 2025 (Webstacks)](https://www.webstacks.com/blog/multi-step-form)
- [Creating Effective Multistep Form (Smashing Magazine)](https://www.smashingmagazine.com/2024/12/creating-effective-multistep-form-better-user-experience/)
- [Multi-Step Form Navigation Best Practices (Reform)](https://www.reform.app/blog/multi-step-form-navigation-best-practices)

### Help & Support
- [Contextual Help UX Patterns (Chameleon)](https://www.chameleon.io/blog/contextual-help-ux)
- [AI Chatbot UX: 2026 Best Practices (Groto)](https://www.letsgroto.com/blog/ux-best-practices-for-ai-chatbots)
- [Best FAQ Page Examples 2026 (REVE Chat)](https://www.revechat.com/blog/best-faq-page-examples/)

### Error States
- [Error Messages UX (Smart Interface Design Patterns)](https://smart-interface-design-patterns.com/articles/error-messages-ux/)
- [Designing Better Error Messages UX (Smashing Magazine)](https://www.smashingmagazine.com/2022/08/error-messages-ux-design/)
- [10 Design Guidelines for Errors in Forms (NN/g)](https://www.nngroup.com/articles/errors-forms-design-guidelines/)

### Success States
- [Success Screen Pattern (Wise Design)](https://wise.design/patterns/success-screen)
- [Success States Design (UX Planet)](https://uxplanet.org/success-states-design-44572c2b3d1f)
- [Success Message UX Examples (Pencil & Paper)](https://www.pencilandpaper.io/articles/success-ux)

### Loading States
- [Skeleton Screens 101 (NN/g)](https://www.nngroup.com/articles/skeleton-screens/)
- [Skeleton Screens: Improving Perceived Performance (Clay)](https://clay.global/blog/skeleton-screen)
- [Skeleton Loading Screen Design (LogRocket)](https://blog.logrocket.com/ux-design/skeleton-loading-screen-design/)

### React Implementation
- [5 Best React Onboarding Libraries 2026 (OnboardJS)](https://onboardjs.com/blog/5-best-react-onboarding-libraries-in-2025-compared)
- [NextStep.js (Next.js Onboarding Library)](https://nextstepjs.com)
- [React 19 useOptimistic Deep Dive (DEV)](https://dev.to/a1guy/react-19-useoptimistic-deep-dive-building-instant-resilient-and-user-friendly-uis-49fp)
- [Optimistic Updates with React Query and Zustand](https://medium.com/@anshulkahar2211/building-lightning-fast-uis-implementing-optimistic-updates-with-react-query-and-zustand-cfb7f9e7cd82)

### Youth UX & Gamification
- [UX Design for Kids (Gapsy)](https://gapsystudio.com/blog/ux-design-for-kids/)
- [Designing User Interfaces for All Ages (The Cecily Group)](https://thececilygroup.com/designing-user-interfaces-for-all-ages-a-ux-designers-guide/)
- [Gamification in Product Design 2025 (Arounda)](https://arounda.agency/blog/gamification-in-product-design-in-2024-ui-ux)
- [eLearning UI/UX Design Guide 2025 (Vi Artisan)](https://viartisan.com/2025/05/27/elearning-ui-ux-design/)
