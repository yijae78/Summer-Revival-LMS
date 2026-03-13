# DESIGN.md
# FLOWING — 여름행사 Learning Management System - 디자인 시스템 & UI/UX 명세

> **버전**: v4.0 (2026 Design Trends + UX 심층리서치 반영)
> **작성일**: 2026-03-13
> **디자인 컨셉**: Bento Grid + Liquid Glass + CSS Scroll-Driven Animations + Bold Typography
> **UX 참조 문서**: `ACCESSIBILITY.md`, `KOREAN-UX.md`, `REALTIME-UX-PATTERNS.md`, `UX-PATTERNS.md`

---

## 1. 디자인 원칙

1. **Bento Grid Layout**: 2026 SaaS 대시보드 표준 (67% 채택률). 불균등 그리드로 정보 계층 표현
2. **Liquid Glass**: Apple 디자인 언어 진화형. 다층 블러 + 동적 투명도로 깊이감 극대화
3. **모바일 퍼스트**: 현장 90%는 스마트폰. 엄지 손가락으로 조작하는 UX
4. **3탭 규칙**: 핵심 기능까지 3번 이하 터치
5. **CSS Scroll-Driven Animations**: JS 없이 GPU 가속 스크롤 애니메이션 (성능 최적)
6. **Bold Typography**: Pretendard Black + 대담한 크기 대비로 시선 유도
7. **Micro-interaction**: 모든 터치에 즉각적 시각/촉각 피드백 + 햅틱 (`navigator.vibrate`)
8. **접근성 우선**: 초등생~60대까지. **WCAG 2.2 AA** (ISO/IEC 40500:2025) 준수
9. **한국형 UX**: 카카오 스타일 대화형 UI, 해요체, 초성 검색, 010 자동 하이픈 (`KOREAN-UX.md`)
10. **오프라인 퍼스트**: 수련원 불안정 네트워크 대응. 옵티미스틱 UI + IndexedDB 큐 (`UX-PATTERNS.md`)
11. **빈 상태는 기회**: 모든 Empty State에 아이콘 + 설명 + CTA 포함 (절대 빈 화면 금지)
12. **Container Queries**: Bento Grid 카드는 뷰포트가 아닌 컨테이너 너비에 반응 (93%+ 브라우저 지원)

---

## 2. 컬러 시스템

### 2.1 듀얼 테마 전략

**히어로/랜딩**: Crimson Red (열정, 강렬한 첫인상)
**대시보드/앱 내부**: Slate + Emerald (차분, 집중, 생산성)

이 두 톤을 분리하여 **첫 화면은 강렬하게**, **내부는 편안하게** 만듭니다.

### 2.2 히어로 컬러 (랜딩 페이지 전용)

```
Hero Red
├── 50:  #FEF2F2
├── 100: #FEE2E2
├── 200: #FECACA
├── 300: #FCA5A5
├── 400: #F87171
├── 500: #EF4444  ← 메인
├── 600: #DC2626  ← 그라디언트 끝
├── 700: #B91C1C
├── 800: #991B1B
├── 900: #7F1D1D

Hero Gradient:
  배경: linear-gradient(135deg, #DC2626 0%, #991B1B 50%, #7F1D1D 100%)
  오버레이: radial-gradient(circle at 30% 40%, rgba(239,68,68,0.3), transparent 60%)
  텍스트: #FFFFFF
  CTA 버튼: #FFFFFF 배경 + #DC2626 텍스트 (반전)
```

### 2.3 앱 컬러 (대시보드 내부)

```
Primary (Emerald - 주요 액션, 성공, 긍정)
├── 50:  #ECFDF5
├── 100: #D1FAE5
├── 200: #A7F3D0
├── 300: #6EE7B7
├── 400: #34D399
├── 500: #10B981  ← 메인 (버튼, 링크, 활성 상태)
├── 600: #059669
├── 700: #047857
├── 800: #065F46
├── 900: #064E3B

Slate (중성 - 텍스트, 배경, 보더)
├── 50:  #F8FAFC  ← 페이지 배경
├── 100: #F1F5F9  ← 카드 배경 (호버)
├── 200: #E2E8F0  ← 보더, 구분선
├── 300: #CBD5E1
├── 400: #94A3B8  ← ⚠️ 보조 텍스트 (대비 3.3:1, 장식용만. 본문 사용 금지)
├── 500: #64748B  ← 보조 텍스트 (대비 5.3:1, WCAG AA 통과)
├── 600: #475569
├── 700: #334155  ← 본문 텍스트
├── 800: #1E293B  ← 제목 텍스트
├── 900: #0F172A  ← 최강조 텍스트

Accent (Amber - 경고, 포인트, 리더보드)
├── 400: #FBBF24
├── 500: #F59E0B  ← 메인
├── 600: #D97706

Secondary (Blue - 정보, 링크, 보조)
├── 400: #60A5FA
├── 500: #3B82F6  ← 메인
├── 600: #2563EB

Semantic
├── Success:  #10B981 (Emerald 500)
├── Warning:  #F59E0B (Amber 500)
├── Error:    #EF4444 (Red 500)
├── Info:     #3B82F6 (Blue 500)
```

### 2.4 2026 트렌드 컬러 참고

```
Pantone 2026 "Cloud Dancer" (#F0EAE4)
  → 오프화이트 배경으로 순백보다 따뜻한 느낌
  → 적용: 랜딩 페이지 기능 소개 섹션 배경 대안
  → bg-[#F0EAE4] 또는 bg-stone-50 근사치

Bento Grid 카드 배경 권장:
  → Light: rgba(255,255,255,0.85) + blur(24px)
  → Dark:  rgba(30,41,59,0.85)  + blur(24px)
```

### 2.5 Tailwind CSS v4 변수 (CSS-First Configuration)

> **주의**: Tailwind v4는 `@layer base`가 아닌 `@theme inline` + plain `:root`를 사용합니다.
> 색상은 HSL이 아닌 **OKLCH** 컬러 스페이스를 사용합니다 (더 넓은 색역, 균일한 인지).

```css
/* globals.css */
@import "tailwindcss";

/* Step 1: Tailwind 네임스페이스 매핑 (유틸리티 클래스 생성) */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --color-hero-from: var(--hero-from);
  --color-hero-to: var(--hero-to);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

/* Step 2: 실제 값 정의 (OKLCH 컬러 스페이스) */
:root {
  --radius: 0.75rem;
  --background: oklch(0.985 0.002 247);       /* Slate 50 */
  --foreground: oklch(0.145 0.014 256);       /* Slate 900 */
  --card: oklch(1 0 0);                        /* White */
  --card-foreground: oklch(0.145 0.014 256);
  --primary: oklch(0.696 0.17 162);           /* Emerald 500 */
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.623 0.214 259);        /* Blue 500 */
  --secondary-foreground: oklch(1 0 0);
  --accent: oklch(0.769 0.188 70);            /* Amber 500 */
  --accent-foreground: oklch(0.145 0.014 256);
  --muted: oklch(0.968 0.003 264);            /* Slate 100 */
  --muted-foreground: oklch(0.554 0.022 257); /* Slate 500 */
  --destructive: oklch(0.637 0.237 25);       /* Red 500 */
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.916 0.007 264);           /* Slate 200 */
  --input: oklch(0.916 0.007 264);
  --ring: oklch(0.696 0.17 162);              /* Emerald 500 */

  --hero-from: oklch(0.577 0.245 27);         /* Red 600 */
  --hero-to: oklch(0.358 0.115 18);           /* Red 900 */
}

.dark {
  --background: oklch(0.13 0.02 260);         /* #0B1120 */
  --foreground: oklch(0.968 0.003 264);
  --card: oklch(0.18 0.02 260);               /* #131C2E */
  --card-foreground: oklch(0.968 0.003 264);
  --primary: oklch(0.696 0.17 162);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.6 0.2 259);
  --muted: oklch(0.22 0.02 260);
  --muted-foreground: oklch(0.6 0.02 260);
  --border: oklch(0.28 0.015 260);
}
```

> **참고**: Tailwind v4에서는 `tailwind.config.ts`가 불필요합니다.
> 모든 설정은 CSS 파일의 `@theme`에서 합니다.
> shadcn/ui도 v4와 호환되며, 위 패턴을 따릅니다.

---

## 3. 타이포그래피

### 3.1 폰트 스택

```
font-family (전역):
  'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont,
  'Apple SD Gothic Neo', system-ui, 'Segoe UI', 'Noto Sans KR',
  'Malgun Gothic', sans-serif

Display/Heading : Pretendard Variable (wght 100~900)
                  fallback: "Noto Sans KR", system-ui, sans-serif
Body            : Pretendard Variable
Mono/숫자 강조   : "Geist Mono", "JetBrains Mono", monospace

히어로 타이틀   : Pretendard Black (900) + letter-spacing: -0.03em
```

> **중요**: Pretendard Variable이 font-family 최우선 순위입니다.
> 기존 -apple-system, BlinkMacSystemFont 등은 fallback으로 밀려납니다.

### 3.2 타이포 스케일

| 토큰 | 크기 | 행간 | 무게 | 용도 |
|------|------|------|------|------|
| `display-xl` | 56px / 3.5rem | 1.1 | Black (900) | 히어로 메인 타이틀 |
| `display` | 44px / 2.75rem | 1.15 | Bold (700) | 히어로 서브 타이틀 |
| `h1` | 32px / 2rem | 1.2 | Bold (700) | 페이지 제목 |
| `h2` | 24px / 1.5rem | 1.25 | Semibold (600) | 섹션 제목 |
| `h3` | 20px / 1.25rem | 1.3 | Semibold (600) | 카드 제목 |
| `h4` | 18px / 1.125rem | 1.35 | Medium (500) | 소제목 |
| `body-lg` | 18px / 1.125rem | 1.7 | Normal (400) | 강조 본문 |
| `body` | 16px / 1rem | 1.7 | Normal (400) | 본문 (기본) ← iOS 줌 방지 |
| `body-sm` | 14px / 0.875rem | 1.6 | Normal (400) | 보조 본문 |
| `caption` | 13px / 0.8125rem | 1.5 | Medium (500) | 캡션, 배지, 레이블 |
| `overline` | 12px / 0.75rem | 1.5 | Semibold (600) | 오버라인, 카테고리 태그 |

> **접근성 변경 (ACCESSIBILITY.md 기반)**:
> - `body` 14px → **16px** (60대 사용자 가독성. iOS 입력 줌 방지)
> - `caption` 12px → **13px**, `overline` 11px → **12px** (시력 저하 사용자)
> - 행간 1.5 → **1.7** (한글 CJK 문자 밀도 대응)
> - **앱 전체에서 10px 이하 텍스트 완전 제거**
> - `word-break: keep-all` 전역 적용 (한글 단어 단위 줄바꿈)

### 3.3 숫자 강조 스타일

대시보드 통계 숫자는 특별 처리:
```css
.stat-number {
  font-family: "Geist Mono", monospace;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
```

---

## 4. 랜딩 페이지 설계

### 4.1 개요

**단일 화면** (스크롤 없음, 100vh). 바다/물 테마의 몰입형 랜딩.
FLOWING 브랜드를 워터플로우 그라디언트와 바다 배경으로 표현.

### 4.2 데스크톱 와이어프레임

```
Desktop (100vh, 스크롤 없음):
┌──────────────────────────────────────────────────────────────┐
│  bg: 바다 배경 (#0c0e14 기반)                                │
│  Caustics 빛 오브 3개 (부유 애니메이션)                       │
│  다층 물결 라인 (수평 흐르는 물결)                             │
│  하단 4겹 웨이브 (진한→옅은 opacity)                          │
│                                                              │
│  ┌─ 상단 ───────────────────────────────────────────────┐   │
│  │  [TRINITY AI FORUM]         [반응형 뷰포트 토글 ◻/📱] │   │
│  │  글래스모피즘 배지                                     │   │
│  │  쉬머 + 글로우 애니메이션                               │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ 중앙 콘텐츠 (세로 중앙 정렬) ──────────────────────┐    │
│  │                                                      │    │
│  │   F L O W I N G                                      │    │
│  │   (대형 로고, 워터플로우 그라디언트 — 오른쪽→왼쪽 흐름) │    │
│  │   (waterFlow 키프레임 애니메이션)                      │    │
│  │                                                      │    │
│  │   여름행사의 모든 것을 "하나로" 흘러가게 하세요         │    │
│  │   ("하나로"만 붉은 네온 심장박동 효과 — heartbeat)      │    │
│  │                                                      │    │
│  │   Learning Management System                         │    │
│  │   (L, M, S 강조 스타일)                               │    │
│  │                                                      │    │
│  │   [ 시작하기 → ]  CTA 버튼                            │    │
│  │                                                      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─ 하단 피처 바 ────────────────────────────────────────┐  │
│  │  [출석] [프로그램] [조·반] [공지] [갤러리] [AI]         │  │
│  │  클릭 시 해당 기능 상세 카드 팝업                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ 푸터 ────────────────────────────────────────────────┐  │
│  │  Developed by Yijae Shin                               │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 4.3 랜딩 페이지 배경 효과

```
[바다 배경]
1. Caustics 빛 오브 3개:
   - 반투명 원형/타원형 빛 덩어리
   - 각각 다른 속도로 부유 (causticsDrift1, causticsDrift2, causticsDrift3)
   - 색상: sky-blue/cyan 계열, opacity 0.05~0.15

2. 다층 물결 라인:
   - 수평 방향 흐르는 얇은 곡선 라인
   - 3~4개 레이어, 각기 다른 속도 (waveFloat1, waveFloat2, waveFloat3)

3. 하단 4겹 웨이브:
   - SVG path 기반 물결 형태
   - 가장 아래가 가장 진하고, 위로 갈수록 투명
   - 각 레이어 미세하게 다른 속도로 좌우 이동

[텍스트 효과]
4. "FLOWING" 로고:
   - 워터플로우 그라디언트 (background-clip: text)
   - 그라디언트가 오른쪽→왼쪽 방향으로 흐르는 애니메이션 (waterFlow)
   - font-weight: 900 (Black)

5. "하나로" 네온 효과:
   - 붉은 색상 + text-shadow 글로우
   - heartbeat 키프레임으로 미세한 크기 맥동
   - opacity 변화로 심장박동 느낌

[TRINITY AI FORUM 배지]
6. 글래스모피즘 스타일:
   - backdrop-filter: blur(12px)
   - background: rgba(255,255,255,0.08)
   - border: 1px solid rgba(255,255,255,0.15)
   - 쉬머(shimmer) + 글로우 애니메이션
```

### 4.4 CSS 키프레임 (랜딩 전용)

```css
/* FLOWING 로고 워터플로우 그라디언트 */
@keyframes waterFlow {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}

/* "하나로" 심장박동 네온 효과 */
@keyframes heartbeat {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.05); opacity: 1; }
}

/* Caustics 빛 오브 부유 */
@keyframes causticsDrift1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.1); }
  66% { transform: translate(-20px, 15px) scale(0.95); }
}

@keyframes causticsDrift2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-25px, 25px) scale(1.05); }
  66% { transform: translate(35px, -15px) scale(0.9); }
}

@keyframes causticsDrift3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, 30px) scale(0.95); }
  66% { transform: translate(-30px, -25px) scale(1.1); }
}

/* 물결 라인 부유 */
@keyframes waveFloat1 {
  0%, 100% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(-30px) translateY(-5px); }
}

@keyframes waveFloat2 {
  0%, 100% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(25px) translateY(3px); }
}

@keyframes waveFloat3 {
  0%, 100% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(-20px) translateY(-4px); }
}
```

### 4.5 모바일 버전

```
Mobile (100vh, 스크롤 없음):
┌────────────────────────┐
│  [TRINITY AI FORUM]    │  글래스모피즘 배지
│                        │
│                        │
│    F L O W I N G       │  워터플로우 로고 (작은 크기)
│                        │
│  여름행사의 모든 것을   │
│  "하나로" 흘러가게      │
│    하세요              │
│                        │
│  Learning Management   │
│      System            │
│                        │
│  [ 시작하기 → ]        │
│                        │
│  [출석][프로그램][조·반] │  피처 바 (2줄 또는 스크롤)
│  [공지][갤러리][AI]     │
│                        │
│  Developed by          │
│  Yijae Shin            │
│                        │
│  ~~ 바다 웨이브 ~~     │
└────────────────────────┘
* Caustics 오브: 2개로 줄임 (성능)
* 물결 라인: 2개로 줄임
* 뷰포트 토글: 숨김 (모바일에서 불필요)
```

---

## 5. 푸터 디자인

### 5.1 전체 푸터

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  bg: Slate 900 (#0F172A)   text: Slate 400 (#94A3B8)        │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │  FLOWING                                              │  │
│  │                                                       │  │
│  │  여름행사의 모든 것을 하나로 흘러가게                    │  │
│  │  올인원 학습 관리 시스템                                │  │
│  │                                                       │  │
│  │  ─────────────────────────────────────────────────    │  │
│  │                                                       │  │
│  │  TRINITY AI FORUM                                     │  │
│  │  (font-size: 11px, letter-spacing: 0.2em, Slate 500)  │  │
│  │                                                       │  │
│  │  Developed by Yijae Shin                              │  │
│  │  (font-size: 13px, Slate 400)                         │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 푸터 CSS 스펙

```css
footer {
  background: #0F172A;
  padding: 48px 24px 32px;
  text-align: center;
}

.footer-brand {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #64748B;  /* Slate 500 */
  margin-bottom: 8px;
}

.footer-credit {
  font-size: 13px;
  font-weight: 400;
  color: #94A3B8;  /* Slate 400 */
}
```

---

## 6. 레이아웃 시스템

### 6.1 데스크톱 (1024px+)

```
┌──────────────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────────────────┐ │
│ │  Header                                           h: 64px│ │
│ │  bg: white/80 backdrop-blur-xl  border-b: Slate 200     │ │
│ │  [사이드바 토글] [행사명 뱃지]        [알림] [프로필 아바타]│ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌────────┬─────────────────────────────────────────────────┐ │
│ │        │                                                 │ │
│ │Sidebar │  Main Content Area                              │ │
│ │w: 260px│  bg: Slate 50                                   │ │
│ │        │  padding: 32px                                  │ │
│ │bg:white│  max-width: 1280px                              │ │
│ │shadow-r│  margin: 0 auto                                 │ │
│ │        │                                                 │ │
│ │ [아바타]│  ═══ Bento Grid Dashboard ═══                   │ │
│ │  이름  │  CSS Grid: repeat(4, 1fr) / auto-rows 120px    │ │
│ │  역할  │  gap: 20px                                      │ │
│ │ ───── │                                                 │ │
│ │  홈    │  ┌────────┐ ┌────────┐ ┌───────────────────┐   │ │
│ │  참가자│  │ Stat   │ │ Stat   │ │ D-day Banner      │   │ │
│ │  일정  │  │ 출석률 │ │ 참가자 │ │ (col-span-2)      │   │ │
│ │  출석  │  │ glass  │ │ glass  │ │ liquid-glass      │   │ │
│ │  조/반 │  └────────┘ └────────┘ └───────────────────┘   │ │
│ │ ───── │  ┌───────────────────┐ ┌────────┐ ┌────────┐   │ │
│ │  공지  │  │ Timeline Card    │ │ Stat   │ │ Stat   │   │ │
│ │  자료  │  │ (col-span-2      │ │ 조순위 │ │ 포인트 │   │ │
│ │  프로그램│  │  row-span-2)     │ │ glass  │ │ glass  │   │ │
│ │  갤러리│  │ 일정 타임라인     │ └────────┘ └────────┘   │ │
│ │ ───── │  │                   │ ┌───────────────────┐   │ │
│ │  설정  │  │                   │ │ Announcement Card │   │ │
│ │        │  └───────────────────┘ │ (col-span-2)      │   │ │
│ │        │                        └───────────────────┘   │ │
│ │        │  ┌─────────── FOOTER ──────────────────────┐   │ │
│ │        │  │ TRINITY AI FORUM                        │   │ │
│ │        │  │ Developed by Yijae Shin                 │   │ │
│ │        │  └─────────────────────────────────────────┘   │ │
│ └────────┴─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 사이드바 상세

```
┌──────────────┐
│              │
│  ┌────────┐  │  프로필 영역
│  │ Avatar │  │  40x40px, ring-2 ring-primary
│  └────────┘  │
│  신교수님     │  font-weight: 600
│  관리자       │  badge: emerald, text-xs
│              │
│ ─────────── │  구분선: Slate 100
│              │
│  ● 홈        │  active: bg-primary/10 text-primary
│    참가자     │  hover: bg-slate-50
│    일정       │  font-size: 14px
│    출석       │  padding: 10px 16px
│    조/반      │  border-radius: 8px
│              │  icon: 20px, gap: 12px
│ ─────────── │
│              │
│    공지       │
│    자료       │
│    프로그램   │
│    갤러리     │
│              │
│ ─────────── │
│              │
│    설정       │
│              │
│ ─────────── │
│ v1.0.0      │  하단: 버전 표시
└──────────────┘

접이식 상태 (w: 72px):
  아이콘만 표시, 호버 시 툴팁
  토글 버튼: 사이드바 하단 << / >>
```

### 6.3 모바일 (< 768px)

```
┌────────────────────────┐
│ Header         h: 56px │
│ [≡] 여름수련회 [🔔][👤]│
│ bg: white/90 blur-xl   │
│ sticky top-0 z-50      │
├────────────────────────┤
│                        │
│  Main Content          │
│  padding: 16px         │
│  gap: 16px             │
│  pb: 80px (네비 여백)   │
│                        │
│  ┌──────────────────┐  │
│  │ 풀 너비 카드      │  │
│  │ border-radius:12px│  │
│  │ shadow-md         │  │
│  └──────────────────┘  │
│                        │
│  ┌────────┐┌────────┐  │
│  │2x2 통계││2x2 통계│  │
│  │ 미니카드 ││ 미니카드 │  │
│  └────────┘└────────┘  │
│                        │
├────────────────────────┤
│ Bottom Nav      h: 64px│
│ bg: white/95 blur-xl   │
│ shadow-t-lg            │
│ border-t: Slate 100    │
│                        │
│ ┌────┐┌────┐┌────┐┌────┐┌────┐
│ │ 홈 ││일정││출석││조/반││더보기│
│ │ ●  ││    ││    ││    ││  ≡ │
│ └────┘└────┘└────┘└────┘└────┘
│                        │
│ active: primary color  │
│ inactive: Slate 400    │
│ icon: 22px             │
│ label: 10px            │
│ safe-area-bottom 적용  │
└────────────────────────┘
```

---

## 7. 컴포넌트 디자인 상세

### 7.1 Stat Card (통계 카드)

```
┌──────────────────────────────┐
│  bg: white                   │
│  border: 1px solid Slate 100 │
│  border-radius: 16px         │
│  padding: 24px               │
│  shadow: shadow-md           │
│  hover: shadow-lg + translateY(-2px)
│  transition: all 200ms ease  │
│                              │
│  [icon]  출석률               │  icon: 36px, bg-primary/10,
│          (Slate 500, 13px)   │        text-primary, rounded-12
│                              │
│  92.5%                       │  Geist Mono, 32px, Bold
│                              │  color: Slate 900
│  ▲ 3.2% 전일 대비           │  Success green, 12px
│                              │  작은 화살표 아이콘 + 텍스트
│  ━━━━━━━━━━━━━━━━━━░░       │  Progress bar
│                              │  h: 4px, rounded-full
│                              │  bg: Slate 100, fill: Primary
└──────────────────────────────┘
```

### 7.2 Liquid Glass Card (2026 진화형 글래스모피즘)

Apple의 Liquid Glass 디자인 언어를 참고한 다층 투명 카드.
대시보드 상단의 D-day 배너, 특별 카드, Bento Grid 강조 셀에 사용:

```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(24px) saturate(1.8);
  -webkit-backdrop-filter: blur(24px) saturate(1.8);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.06),
    0 2px 4px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    inset 0 -1px 0 rgba(0, 0, 0, 0.04);
  transition: background 300ms ease, box-shadow 300ms ease;
}

.liquid-glass:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.08),
    0 4px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.dark .liquid-glass {
  background: rgba(30, 41, 59, 0.65);
  backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
```

### 7.3 Timeline (일정 타임라인)

```
┌────────────────────────────────────────┐
│  오늘의 일정                 Day 2/3   │
│                                        │
│  ○──── 06:30  기상                     │
│  │         Slate 400, 지남              │
│  │                                     │
│  ○──── 07:00  아침식사                  │
│  │         Slate 400, 지남              │
│  │                                     │
│  ●──── 09:00  아침 집회                 │  ● = Primary 색, 펄스 효과
│  │ ┌──────────────────────────────┐    │  현재 세션 카드
│  │ │ 🎤 강사: 김목사님             │    │  bg: primary/5
│  │ │ 📍 본당                      │    │  border-left: 3px primary
│  │ │ NOW                          │    │  "NOW" 뱃지: primary, 깜빡임
│  │ └──────────────────────────────┘    │
│  │                                     │
│  ◎──── 10:30  조별 활동                 │  ◎ = 비어있는 원, 다음
│  │         Slate 300, 예정              │
│  │                                     │
│  ◎──── 12:00  점심식사                  │
│  │                                     │
│  ◎──── 14:00  레크리에이션              │
│  │                                     │
└────────────────────────────────────────┘

라인: w: 2px, bg: Slate 200
현재 라인: bg: gradient(primary → Slate 200)
```

### 7.4 Attendance Checker (출석 체크)

```
┌────────────────────────────────────────┐
│  ← 출석 체크             [전체 출석]    │
│  1일차 · 아침집회                       │
├────────────────────────────────────────┤
│                                        │
│  사랑조                   12명          │
│  ━━━━━━━━━━━━━━━━━━━━━░░  10/12 (83%) │
│  bg: primary, h: 6px, rounded-full     │
│                                        │
│  ┌────────────────────────────────────┐ │
│  │ ┌──┐                              │ │
│  │ │JM│  김민준            ✅ 출석    │ │  bg: emerald/10
│  │ └──┘  중등 2학년                   │ │  border-l: 3px emerald
│  └────────────────────────────────────┘ │
│                                        │
│  ┌────────────────────────────────────┐ │
│  │ ┌──┐                              │ │
│  │ │SY│  이서연            ✅ 출석    │ │
│  │ └──┘  중등 1학년                   │ │
│  └────────────────────────────────────┘ │
│                                        │
│  ┌────────────────────────────────────┐ │
│  │ ┌──┐                       ┌────┐ │ │
│  │ │SA│  최수아               │출석│ │ │  미체크: bg: white
│  │ └──┘  초등 6학년            └────┘ │ │  버튼: primary, rounded-lg
│  └────────────────────────────────────┘ │
│                                        │
│  스와이프: ◀ 지각 ┃ 사유 ▶             │
│                                        │
│  ┌────────────────────────────────────┐ │
│  │          [ 제출하기 ]              │ │  primary, h: 52px
│  │          full-width, rounded-12    │ │  font-weight: 600
│  └────────────────────────────────────┘ │
└────────────────────────────────────────┘

아바타: 이니셜 2글자, bg: 랜덤 파스텔, 36x36, rounded-full
체크 애니메이션: 체크마크 SVG path draw 200ms + 진동 50ms
```

### 7.5 Quiz Player (퀴즈)

```
┌────────────────────────────────────────┐
│  bg: gradient(Slate 900 → Slate 800)   │
│  전체화면, 몰입 모드                    │
│                                        │
│              Q 3 / 10                  │
│         ┌──────────────┐               │
│         │  ⏱️  12초    │               │  원형 타이머
│         │   (카운트다운) │               │  SVG circle
│         └──────────────┘               │  stroke-dasharray 애니메이션
│                                        │
│  ┌────────────────────────────────────┐ │
│  │                                    │ │  질문 카드
│  │      다윗이 골리앗을                │ │  bg: white/10
│  │      물리친 도구는?                 │ │  backdrop-blur
│  │                                    │ │  text: white
│  │      font: 22px, semibold          │ │  padding: 32px
│  └────────────────────────────────────┘ │
│                                        │
│  ┌────────────────────────────────────┐ │
│  │  🔴  칼                           │ │  h: 64px
│  └────────────────────────────────────┘ │  rounded-16
│  ┌────────────────────────────────────┐ │  hover: scale 1.02
│  │  🔵  물매                          │ │  active: scale 0.98
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │  선택 후:
│  │  🟡  창                           │ │  정답 → 초록 테두리
│  └────────────────────────────────────┘ │        + confetti 🎉
│  ┌────────────────────────────────────┐ │  오답 → 빨간 테두리
│  │  🟢  활                           │ │        + shake 효과
│  └────────────────────────────────────┘ │
│                                        │
│  현재 점수: 250pt     순위: 3위        │  하단 고정
└────────────────────────────────────────┘
```

### 7.6 Leaderboard (리더보드)

```
┌────────────────────────────────────────┐
│  조별 순위                   실시간 🔴  │  🔴: 빨간 점 펄스
│                                        │
│  ┌────────────────────────────────────┐ │
│  │  🥇  1위                          │ │  bg: amber/10
│  │  사랑조         1,250 pt          │ │  border: 2px amber
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ │  ring-glow: amber
│  │  리더: 김교사                      │ │  scale: 1.02
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  🥈  2위                          │ │  bg: slate/5
│  │  믿음조         1,100 pt          │ │  border: 1px slate-200
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━     │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  🥉  3위                          │ │
│  │  소망조           980 pt          │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━         │ │
│  └────────────────────────────────────┘ │
│                                        │
│  4위  은혜조  820pt                    │  4위부터 심플 리스트
│  5위  평화조  750pt                    │
└────────────────────────────────────────┘

순위 변동 시: 카드 slide-up/down 400ms + 숫자 count-up
```

---

## 8. 마이크로 인터랙션 상세

### 8.1 버튼 시스템

| 유형 | 스타일 | 호버 | 클릭 |
|------|--------|------|------|
| **Primary** | bg-primary text-white shadow-sm | shadow-md, brightness 110% | scale(0.97) 100ms |
| **Secondary** | bg-secondary text-white | shadow-md | scale(0.97) |
| **Outline** | border-primary text-primary bg-transparent | bg-primary/5 | scale(0.97) |
| **Ghost** | text-slate-600 bg-transparent | bg-slate-100 | scale(0.97) |
| **Destructive** | bg-red-500 text-white | bg-red-600 | scale(0.97) |
| **CTA (히어로)** | bg-white text-red-600 shadow-xl | scale(1.05) shadow-2xl glow | scale(0.98) |

### 8.2 카드 호버/터치

```css
.interactive-card {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.interactive-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
.interactive-card:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}
```

### 8.3 페이지 전환 (Framer Motion)

```typescript
// 모든 페이지 래퍼
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
}
const pageTransition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1]
}
```

### 8.4 CSS Scroll-Driven Animations (2026 표준)

JS 없이 GPU 가속으로 동작하는 CSS 네이티브 스크롤 애니메이션.
Framer Motion과 병용하되, 단순 스크롤 효과는 CSS로 처리하여 성능 최적화.

```css
/* 스크롤 진입 시 fade-up (CSS Scroll-Driven) */
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.scroll-reveal {
  animation: fade-up linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}

/* 스크롤 진행률 프로그레스 바 (랜딩 페이지 상단) */
.scroll-progress {
  animation: grow-width linear;
  animation-timeline: scroll();
}

@keyframes grow-width {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
```

**적용 전략**:
```
CSS Scroll-Driven (JS 불필요, GPU 가속):
  - 랜딩 페이지 섹션 fade-up 등장
  - 스크롤 프로그레스 바
  - 히어로 parallax 효과
  - 기능 카드 stagger 등장

Framer Motion (인터랙션 필요):
  - 페이지 전환 (AnimatePresence)
  - 드래그 제스처
  - 레이아웃 애니메이션 (리더보드 순위 변동)
  - 퀴즈 confetti / shake
  - 조건부 애니메이션 (데이터 로딩 완료 후)

폴백: @supports not (animation-timeline: view()) 시
      Intersection Observer + Framer Motion으로 대체
```

**랜딩 페이지 섹션별**:
```
각 섹션 진입 시:
  - CSS: animation-timeline: view(); animation-range: entry 0% entry 100%;
  - fade-up (y: 40 → 0, opacity: 0 → 1)

기능 카드:
  - 각 카드에 animation-delay 설정 (0ms, 100ms, 200ms, 300ms)
  - 좌측부터 순차 등장 효과

숫자 통계:
  - 뷰포트 진입 감지 → JS count-up (이것은 CSS로 대체 불가)
  - duration: 800ms, easeOut
```

### 8.5 로딩 상태

```
Skeleton Loading:
  bg: linear-gradient(90deg, Slate 100, Slate 50, Slate 100)
  background-size: 200% 100%
  animation: shimmer 1.5s infinite

  카드: rounded-16, h 맞춤
  텍스트: rounded-4, h: 16px
  아바타: rounded-full, 36x36
```

### 8.6 토스트 알림

```
위치: 우측 하단 (데스크톱), 상단 (모바일)
등장: 우측에서 slide-in 300ms
퇴장: fade-out 200ms (3초 후 자동)

유형:
  성공: 좌측 emerald 바 + 체크 아이콘
  오류: 좌측 red 바 + X 아이콘
  정보: 좌측 blue 바 + info 아이콘

bg: white, shadow-xl, rounded-12
```

---

## 9. 아이콘 시스템

**라이브러리**: Lucide Icons (크기 통일)

| 위치 | 아이콘 크기 | 스트로크 |
|------|------------|----------|
| 사이드바 메뉴 | 20px | 1.5px |
| 하단 네비게이션 | 22px | 1.5px |
| 통계 카드 아이콘 | 36px (배경 포함 48px) | 2px |
| 인라인 텍스트 옆 | 16px | 1.5px |
| 버튼 내부 | 16px | 2px |

아이콘 배경: `bg-{color}/10 rounded-12 p-2.5`

---

## 10. 간격(Spacing) 시스템

```
4px  (1)   → 아이콘-텍스트 사이
8px  (2)   → 같은 그룹 요소 사이
12px (3)   → 카드 내부 요소 사이
16px (4)   → 카드 패딩 (모바일), 리스트 간격
20px (5)   → 카드 패딩 (데스크톱 작은 카드)
24px (6)   → 카드 패딩 (데스크톱)
32px (8)   → 섹션 간격
48px (12)  → 페이지 섹션 간격
64px (16)  → 랜딩 페이지 섹션 간격
```

---

## 11. 반응형 브레이크포인트

| 이름 | 범위 | 그리드 | 카드 패딩 | 폰트 스케일 |
|------|------|--------|-----------|------------|
| `base` | 0~639px | 1열 | 16px | 100% |
| `sm` | 640px+ | 2열 | 16px | 100% |
| `md` | 768px+ | 2열 | 20px | 100% |
| `lg` | 1024px+ | 3~4열 | 24px | 105% |
| `xl` | 1280px+ | 4열 | 24px | 105% |

---

## 12. 다크 모드

밤 시간(저녁 집회, 새벽 기도) 사용을 위한 다크 모드:

```
전환 방식: 시스템 설정 자동 감지 + 수동 토글

배경: #0B1120 (깊은 네이비)
카드: #131C2E (약간 밝은 네이비)
텍스트: Slate 100~300
보더: rgba(255,255,255,0.08)

Primary, Secondary, Accent: 동일 (어두운 배경에서 더 돋보임)
글래스모피즘: rgba(30,41,59,0.7) + blur(20px)
```

---

## 13. 애니메이션 요약 (Framer Motion)

| 요소 | 효과 | 시간 | 이징 |
|------|------|------|------|
| 히어로 배경 | 그라디언트 메시 이동 | 15s loop | ease |
| 히어로 파티클 | 떠다니는 빛 | 20~40s loop | linear |
| 히어로 타이틀 | 글자별 stagger fade-up | 50ms/char | easeOut |
| 히어로 CTA | 글로우 펄스 | 2s loop | ease-in-out |
| 히어로 목업 | 부유 (float) | 6s loop | ease-in-out |
| 페이지 전환 | fade + slide-y | 250ms | [0.4,0,0.2,1] |
| 카드 등장 | fade-up + stagger | 400ms + 100ms | easeOut |
| 카드 호버 | translateY(-2px) + shadow | 200ms | ease |
| 스크롤 숫자 | count-up | 800ms | easeOut |
| 출석 체크 | checkmark draw + vibrate | 200ms | linear |
| 퀴즈 타이머 | circle stroke-dasharray | per-second | linear |
| 퀴즈 정답 | confetti burst | 1000ms | - |
| 퀴즈 오답 | shake x(-4,4,0) | 300ms | ease |
| 리더보드 순위 | layout animation slide | 400ms | spring |
| 점수 변동 | number rolling | 500ms | easeOut |
| 토스트 | slide-in-right | 300ms | [0.4,0,0.2,1] |
| 스켈레톤 | shimmer gradient | 1.5s loop | linear |
| 오프라인 배너 | slide-down | 300ms | ease |

`prefers-reduced-motion: reduce` 시 모든 애니메이션 duration → 0ms

---

## 14. 접근성 (WCAG 2.2 AA)

> **상세**: `docs/ACCESSIBILITY.md` 참조

- **WCAG 2.2 AA** (ISO/IEC 40500:2025) 전체 준수
- 최소 텍스트: **16px** (모바일 body, iOS 줌 방지)
- 최소 터치: **48x48px** (WCAG 2.5.8), 최소 간격 8px
- 색상 대비: 4.5:1 (일반), 3:1 (대형 텍스트). Slate 400은 장식용만 사용
- 색각 이상 대응: 색상만으로 정보 전달 금지, 아이콘/텍스트 병행
- 키보드 네비게이션: 모든 인터랙티브 요소 tab 접근 가능
- 스크린 리더: 시맨틱 HTML + ARIA 레이블
- 포커스 링: `ring-2 ring-primary ring-offset-2` (키보드 사용 시에만 표시)
- **Reduced Motion**: `prefers-reduced-motion: reduce` 시 모든 애니메이션 비활성화
- **한글 줄바꿈**: `word-break: keep-all` 전역 적용
- **한글 행간**: 본문 `line-height: 1.7` (CJK 문자 밀도 대응)
- **삼성 인터넷 브라우저**: 한국 시니어 사용자 지원 (테스트 필수)

---

## 15. Bento Grid 레이아웃 시스템

### 15.1 대시보드 Bento Grid

2026 SaaS 대시보드 표준인 Bento Grid 레이아웃. 불균등 셀 크기로 정보 중요도를 시각적으로 표현.

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(120px, auto);
  gap: 20px;
  padding: 24px;
}

/* Container Queries: 카드가 자신의 너비에 반응 */
.bento-grid > * {
  container-type: inline-size;
  container-name: bento-card;
}

@container bento-card (width < 200px) {
  .stat-label { display: none; }
  .stat-value { font-size: 1.5rem; }
}

@container bento-card (width >= 300px) {
  .stat-card { flex-direction: row; gap: 1rem; }
  .sparkline { display: block; }
}

/* 강조 카드: 2열 차지 */
.bento-wide  { grid-column: span 2; }

/* 타임라인 등 세로로 긴 카드 */
.bento-tall  { grid-row: span 2; }

/* 히어로/배너: 전체 너비 */
.bento-full  { grid-column: 1 / -1; }

/* 태블릿 (768px+) */
@media (max-width: 1023px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

/* 모바일 (< 768px) */
@media (max-width: 767px) {
  .bento-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .bento-wide, .bento-tall { grid-column: span 1; grid-row: span 1; }
}
```

### 15.2 대시보드 Bento 배치

```
Desktop (4열):
┌───────────┬───────────┬───────────────────────┐
│  출석률    │  참가자    │  D-Day Banner          │
│  StatCard  │  StatCard  │  (col-span-2)          │
│  120px     │  120px     │  liquid-glass          │
├───────────┼───────────┼───────────┬───────────┤
│           │           │  조 순위    │  포인트    │
│ Timeline  │           │  StatCard  │  StatCard  │
│ (col-2    │ 프로그램현황│  120px     │  120px     │
│  row-2)   │ (col-2    ├───────────┴───────────┤
│           │  row-2)   │  Announcement Card     │
│           │           │  (col-span-2)          │
├───────────┴───────────┴───────────────────────┤
│  Leaderboard (full-width, liquid-glass)        │
└───────────────────────────────────────────────┘

Tablet (2열):
┌───────────┬───────────┐
│  출석률    │  참가자    │
├───────────┴───────────┤
│  D-Day Banner         │
├───────────┬───────────┤
│  Timeline │  조 순위   │
│  (row-2)  ├───────────┤
│           │  포인트    │
├───────────┴───────────┤
│  Announcement         │
└───────────────────────┘

Mobile (1열): 모든 카드 세로 스택
```

---

## 16. AI 채팅 위젯

### 16.1 플로팅 채팅 버튼

```
위치: 우측 하단 고정
  right: 24px, bottom: 24px (모바일: right: 16px, bottom: 80px 네비 위)

버튼 스펙:
  크기: 56x56px
  bg: primary (Emerald 500)
  border-radius: 50%
  shadow: 0 8px 24px rgba(16,185,129,0.3)
  icon: Lucide "MessageCircle" 24px, white

  호버: scale(1.1), shadow 확대
  클릭: scale(0.95)

  알림 뱃지: 우상단 빨간 점 (새 대화 안내 시)

z-index: 40 (모달 아래, 네비 위)
```

### 16.2 채팅 패널

```
Desktop:
┌──────────────────────────────────┐
│  AI 도우미             [─] [✕]  │  h: 48px, bg: primary
│  Gemini 기반                     │  text: white, font: 14px
├──────────────────────────────────┤
│                                  │
│  ┌─ AI ──────────────────────┐  │  bg: slate-50
│  │ 안녕하세요! FLOWING에       │  │  padding: 16px
│  │ 대해 궁금한 점을            │  │
│  │ 물어보세요.                │  │  메시지 버블:
│  └───────────────────────────┘  │   AI: bg-white, rounded-16
│                                  │       rounded-tl-4
│        ┌─ 사용자 ────────────┐  │   사용자: bg-primary,
│        │ 출석체크는 어떻게   │  │          text-white,
│        │ 하나요?             │  │          rounded-16
│        └─────────────────────┘  │          rounded-tr-4
│                                  │
│  ┌─ AI ──────────────────────┐  │  스트리밍: 글자가 한글자씩
│  │ 출석 체크 방법:           │  │  타이핑되는 효과
│  │ 1. 대시보드 > 출석 메뉴   │  │
│  │ 2. 세션 선택             │  │  마크다운 렌더링 지원
│  │ 3. 조원 목록에서 체크     │  │
│  └───────────────────────────┘  │
│                                  │
├──────────────────────────────────┤
│  ┌────────────────────┐ [전송]  │  h: 56px
│  │ 질문을 입력하세요...│         │  input: rounded-12
│  └────────────────────┘         │  button: primary, 36x36
│                                  │  rounded-full
└──────────────────────────────────┘

크기: w: 380px, h: 520px
위치: right: 24px, bottom: 96px (버튼 위)
border-radius: 16px
shadow: 0 16px 48px rgba(0,0,0,0.15)
등장: scale(0.9) opacity(0) → scale(1) opacity(1) 200ms
최소화: 패널 숨김, 버튼만 표시
```

### 16.3 모바일 채팅

```
Mobile:
  전체화면 오버레이
  bg: white
  safe-area 적용

  상단 바: [← 닫기] AI 도우미
  하단 입력: safe-area-bottom padding

  버튼 위치: right: 16px, bottom: 80px
  (하단 네비바 위)
```

### 16.4 빠른 질문 칩

채팅 시작 시 자주 묻는 질문 제안:

```
┌──────────────────────────┐
│                          │
│  💡 이런 것들을 물어보세요: │
│                          │
│  ┌──────────┐ ┌────────┐ │
│  │ 출석 방법 │ │ 조편성 │ │
│  └──────────┘ └────────┘ │
│  ┌──────────┐ ┌────────┐ │
│  │ 프로그램   │ │ 사용법 │ │
│  └──────────┘ └────────┘ │
│                          │
│  칩: bg-slate-100,       │
│  rounded-full, px-12     │
│  hover: bg-primary/10    │
│  text-primary            │
└──────────────────────────┘
```

---

## 17. 모바일 UX 강화 패턴

### 17.1 바텀 시트 (모바일 상세 드릴다운)

모바일에서 대시보드 카드 탭 시 새 페이지가 아닌 **바텀 시트**로 상세 데이터 표시:
```
사용 라이브러리: react-modal-sheet
높이: 자동 (콘텐츠 기반), 최대 90vh
핸들: 상단 4x40px 회색 바
배경: white, border-radius: 20px 20px 0 0
오버레이: rgba(0,0,0,0.4)
제스처: 아래로 드래그하여 닫기
```

### 17.2 Pull-to-Refresh

대시보드, 출석 목록, 공지사항 페이지에서 지원:
```
임계값: 80px
피드백: 햅틱 50ms (Android)
인디케이터: 원형 스피너 (primary 색상)
새로고침 완료: TanStack Query invalidation
```

### 17.3 Safe Area CSS

```css
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
  height: calc(64px + env(safe-area-inset-bottom));
}

.modal-content {
  padding-top: env(safe-area-inset-top);
}

.chat-input {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 17.4 역할별 하단 네비게이션

```
관리자:  [홈] [일정] [출석] [관리] [더보기]
교사:    [홈] [일정] [출석] [내 조/반] [더보기]
참가자:  [홈] [일정] [프로그램] [내 조/반]
학부모:  [홈] [일정] [내 아이] [공지]
```

### 17.5 햅틱 피드백 확장

```
탭 전환:         5ms  (selection)
출석 체크 성공:   [30, 50, 30]ms (success)
퀴즈 정답:       [30, 50, 30]ms (success)
퀴즈 오답:       [50, 30, 50, 30, 50]ms (error)
폼 제출:         25ms (medium)
Pull-to-refresh: 50ms (threshold 도달 시)
※ iOS Safari 미지원 → 시각 피드백 항상 병행
```

---

## 18. 오프라인/네트워크 UX

> **상세**: `docs/UX-PATTERNS.md` 섹션 6, 8 참조

### 18.1 오프라인 인디케이터

```
오프라인 시:
  상단 배너 (slide-down, 300ms, amber-500)
  "오프라인 상태입니다. 일부 기능이 제한됩니다."
  아이콘: WifiOff

온라인 복귀 시:
  상단 배너 (green-500) 3초 후 자동 사라짐
  "다시 온라인입니다. 데이터를 동기화 중..."
  아이콘: Wifi
```

### 18.2 동기화 대기 표시

```
출석 체크 등 오프라인 저장 항목:
  체크 아이콘: amber-500 (green 대신)
  배지: "동기화 대기" (amber-100 bg, amber-700 text)
  온라인 복귀 시: 자동 동기화 → green으로 변경
  토스트: "3건의 데이터가 동기화되었습니다."
```

### 18.3 옵티미스틱 UI

```
출석 체크: 즉시 UI 반영 → 서버 확인 → 실패 시 롤백 + 에러 토스트
퀴즈 응답: 네트워크 필수 (오프라인 시 비활성)
공지 읽기: 캐시 데이터 표시 + "마지막 업데이트: N분 전" 표시
```

---

## 19. 한국형 UX 패턴

> **상세**: `docs/KOREAN-UX.md` 참조

### 19.1 핵심 적용 사항

```
폼 패턴:
  전화번호: 010-XXXX-XXXX 자동 하이픈 삽입, inputMode="tel"
  이름: 2~20자, 한글+영문, word-break: keep-all
  생년월일: 년/월/일 드롭다운 (과거 날짜는 캘린더보다 드롭다운 선호)

UX 텍스트:
  어체: 해요체 (존댓말이되 딱딱하지 않게)
  예) "출석이 완료됐어요" (O) / "출석 체크가 완료되었습니다" (X)
  예) "문제가 생겼어요. 다시 시도해 주세요" (O) / "Error occurred" (X)

검색:
  초성 검색 지원 (es-hangul 라이브러리)
  예) "ㅎㄱ" 입력 → "한길", "홍길동" 매칭
  200ms 디바운스 (한글 조합 고려)

소셜 로그인 순서:
  [카카오 로그인] → [구글 로그인] → [PIN 입력]
  카카오 버튼: #FEE500 배경, #000000 심볼, 12px radius (공식 가이드)

날짜 표시:
  상대 시간: "방금 전", "3분 전", "어제", "그저께"
  절대 시간: YYYY.MM.DD (HH:mm)
  달력: 일요일 시작 (한국 교회 관례)
```

---

## 20. 빈 상태 & 온보딩 UX

> **상세**: `docs/UX-PATTERNS.md` 참조

### 20.1 Empty State 필수 3요소

```
모든 빈 화면은 반드시:
  1. 아이콘/일러스트 (64x64, muted-foreground)
  2. 설명 텍스트 (한국어, 해요체)
  3. CTA 버튼 (primary, 다음 행동 유도)

예시 (참가자 없음):
  👥 아이콘
  "아직 참가자가 없어요"
  "참가 신청 링크를 공유하거나 직접 등록해 보세요"
  [참가자 등록하기] [초대 링크 복사]
```

### 20.2 역할별 첫 실행 경험

```
관리자: BYOS 위자드 → Zero-Data 대시보드 (단계별 설정 가이드)
교사:   환영 모달 → 3단계 코치마크 (하단 네비, 출석, AI 도우미)
참가자: 이름+생년월일 매칭 → 즉시 대시보드 (웰컴 카드 1회)
학부모: 즉시 읽기 전용 대시보드 (투어 불필요)
```

### 20.3 로딩 상태 전략

```
<100ms:  아무것도 표시하지 않음
<300ms:  작은 스피너
<1초:    스켈레톤 shimmer
>1초:    스켈레톤 + "불러오는 중..." 텍스트
>3초:    스켈레톤 + 진행률 + [취소] 버튼
```

---

## 21. 실시간 인터랙션 UX

> **상세**: `docs/REALTIME-UX-PATTERNS.md` 참조

### 21.1 라이브 퀴즈

```
타이머: SVG 원형 + 색상 단계 (green → amber → red)
정답: checkmark 애니메이션 + confetti + 햅틱 success
오답: shake x:[-4,4,-4,4,0] 300ms + 햅틱 error
결과 공개: 4단계 시퀀스 (0ms→300ms→600ms→800ms)
리더보드: layout 애니메이션으로 순위 변동
```

### 21.2 토스트 알림

```
라이브러리: Sonner (shadcn/ui 공식, 2-3KB)
위치: 데스크톱 우하단 (채팅 위젯 위), 모바일 상단 중앙
자동 닫힘: 성공 3초, 정보 4초, 경고 5초, 에러 수동
최대 스택: 4개, 연속 토스트 간 300ms 딜레이
```

### 21.3 애니메이션 성능 규칙

```
GPU 가속 속성만 애니메이션: transform, opacity
Spring 프리셋: gentle(120,14) / default(100,10) / responsive(300,20) / bouncy(400,10)
prefers-reduced-motion: reduce → 모든 애니메이션 비활성화
```
