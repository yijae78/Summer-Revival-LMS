# 청소년 설교 앱 — UI/UX 디자인 스펙 v2.0

> **"어둠 속에서 빛나는 말씀"** — Dark Premium Theme
> 작성일: 2026-03-10
> 대상: 청소년 사역자 (25~45세 목회자/전도사)

---

## 1. 디자인 철학

### 1.1 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **몰입형 다크** | 어두운 배경에서 콘텐츠가 빛나듯 떠오르는 경험. 긴 시간 설교 작성 시 눈의 피로를 줄임 |
| **성경적 경건함** | 화려하지 않되 품격 있는 톤. 교회 스테인드글라스에서 영감을 받은 Accent 컬러 |
| **즉각적 피드백** | 모든 인터랙션에 시각적 응답. 로딩, 전환, 저장 상태를 명확히 전달 |
| **3-클릭 목표** | 어떤 기능이든 최대 3번의 클릭/탭으로 도달 |
| **점진적 공개** | 초보자에겐 단순하게, 고급 사용자에겐 깊은 기능을 점진적으로 노출 |

### 1.2 디자인 무드

- **분위기**: 새벽기도회의 고요함 + 현대 앱의 세련됨
- **영감**: Notion의 깔끔함 × Spotify의 다크 우아함 × Arc Browser의 인터랙션
- **타겟 감성**: "전문적이지만 따뜻한", "기술적이지만 영적인"

---

## 2. 컬러 시스템

### 2.1 다크 테마 토큰

```css
:root {
  /* ── 기본 배경 ── */
  --color-bg:              #0f0f13;     /* 최심부 배경 (거의 검정, 약간 보라) */
  --color-bg-elevated:     #16161d;     /* 상승된 배경 (카드, 패널) */
  --color-bg-hover:        #1e1e28;     /* 호버 상태 배경 */
  --color-bg-active:       #252533;     /* 활성/선택 상태 배경 */

  /* ── 표면(Surface) ── */
  --color-surface:         #1a1a24;     /* 카드, 모달, 드롭다운 */
  --color-surface-raised:  #222230;     /* 카드 내부의 중첩 요소 */
  --color-surface-overlay: rgba(0,0,0,0.6); /* 모달 오버레이 */

  /* ── 텍스트 ── */
  --color-text:            #e8e6f0;     /* 기본 텍스트 (순백 아닌 따뜻한 밝음) */
  --color-text-strong:     #ffffff;     /* 강조 텍스트 (제목) */
  --color-text-secondary:  #9896a8;     /* 보조 텍스트 */
  --color-text-muted:      #5c5a6e;     /* 비활성/힌트 텍스트 */
  --color-text-inverse:    #0f0f13;     /* 밝은 배지 위 텍스트 */

  /* ── 브랜드 Primary (인디고-바이올렛) ── */
  --color-primary:         #7c6ef0;     /* 메인 액센트 (보라-인디고) */
  --color-primary-hover:   #9589f5;     /* 호버 (밝아짐) */
  --color-primary-active:  #6a5dd8;     /* 클릭 시 */
  --color-primary-subtle:  rgba(124,110,240,0.12); /* 배경 틴트 */
  --color-primary-glow:    rgba(124,110,240,0.25); /* 포커스 글로우 */

  /* ── 시맨틱 컬러 ── */
  --color-success:         #34d399;     /* 성공/완료 (에메랄드) */
  --color-success-subtle:  rgba(52,211,153,0.12);
  --color-warning:         #fbbf24;     /* 경고 (앰버) */
  --color-warning-subtle:  rgba(251,191,36,0.12);
  --color-error:           #f87171;     /* 에러 (코랄 레드) */
  --color-error-subtle:    rgba(248,113,113,0.12);
  --color-info:            #60a5fa;     /* 정보 (스카이 블루) */
  --color-info-subtle:     rgba(96,165,250,0.12);

  /* ── 보더 ── */
  --color-border:          #2a2a38;     /* 기본 보더 */
  --color-border-hover:    #3a3a4d;     /* 호버 시 보더 */
  --color-border-focus:    var(--color-primary); /* 포커스 보더 */
  --color-border-subtle:   #1f1f2b;     /* 미세한 구분선 */

  /* ── 교회력 시즌 컬러 ── */
  --season-advent:         #7c3aed;     /* 대림절 — 보라 */
  --season-christmas:      #fbbf24;     /* 성탄절 — 금색 */
  --season-epiphany:       #f0fdf4;     /* 현현절 — 밝은 녹백 */
  --season-lent:           #7c2d12;     /* 사순절 — 어두운 자주 */
  --season-easter:         #ffffff;     /* 부활절 — 백색 */
  --season-pentecost:      #dc2626;     /* 성령강림절 — 빨강 */
  --season-ordinary:       #16a34a;     /* 연중시기 — 녹색 */

  /* ── 간격/크기 ── */
  --radius-sm:             6px;
  --radius:                10px;
  --radius-lg:             16px;
  --radius-xl:             24px;
  --radius-full:           9999px;

  /* ── 그림자 (다크 테마용 미세 광원) ── */
  --shadow-sm:             0 1px 2px rgba(0,0,0,0.5);
  --shadow:                0 2px 8px rgba(0,0,0,0.4);
  --shadow-md:             0 4px 16px rgba(0,0,0,0.5);
  --shadow-lg:             0 8px 32px rgba(0,0,0,0.6);
  --shadow-glow:           0 0 20px var(--color-primary-glow);  /* 버튼 글로우 */
  --shadow-inner:          inset 0 1px 3px rgba(0,0,0,0.4);     /* 입력 필드 */

  /* ── 트랜지션 ── */
  --transition-fast:       150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition:            250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow:       400ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring:     500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 2.2 컬러 사용 규칙

| 요소 | 토큰 | 비고 |
|------|------|------|
| 페이지 배경 | `--color-bg` | 가장 어두운 레벨 |
| 카드/패널 | `--color-surface` | 배경보다 한 단계 밝음 |
| 카드 내 중첩 | `--color-surface-raised` | 2단계 상승 |
| 호버 | `--color-bg-hover` | 미세한 밝아짐 |
| 선택됨 | `--color-bg-active` + 좌측 `--color-primary` 보더 | 시각적 확인 |
| CTA 버튼 | `--color-primary` 배경 + `--color-text-inverse` 텍스트 | 가장 눈에 띄는 요소 |
| 보조 버튼 | `--color-surface-raised` 배경 + `--color-text` 텍스트 | 주 버튼보다 약함 |
| 위험 버튼 | `--color-error` 배경 + 흰 텍스트 | 삭제, 로그아웃 등 |

---

## 3. 타이포그래피

### 3.1 폰트 스택

```css
/* 본문: 가독성 최적화 */
--font-body: 'Pretendard Variable', 'Pretendard', -apple-system,
             'Noto Sans KR', sans-serif;

/* 제목: 약간의 세리프 느낌 (권위감) */
--font-heading: 'Pretendard Variable', 'Pretendard', -apple-system,
                sans-serif;

/* 코드/성경구절: 모노스페이스 */
--font-mono: 'JetBrains Mono', 'D2Coding', monospace;

/* 성경 인용: 구별되는 이탤릭 */
--font-scripture: 'Noto Serif KR', 'Batang', Georgia, serif;
```

### 3.2 타입 스케일

| 레벨 | 크기 | 무게 | 행간 | 용도 |
|------|------|------|------|------|
| **Display** | 2.5rem (40px) | 700 | 1.2 | 랜딩 히어로 |
| **H1** | 1.875rem (30px) | 700 | 1.3 | 페이지 제목 |
| **H2** | 1.5rem (24px) | 600 | 1.35 | 섹션 제목 |
| **H3** | 1.25rem (20px) | 600 | 1.4 | 카드 제목, 라벨 |
| **Body-lg** | 1.125rem (18px) | 400 | 1.7 | 설교 본문 편집 |
| **Body** | 1rem (16px) | 400 | 1.6 | 일반 텍스트 |
| **Body-sm** | 0.875rem (14px) | 400 | 1.5 | 보조 정보 |
| **Caption** | 0.75rem (12px) | 500 | 1.4 | 레이블, 배지 |
| **Overline** | 0.6875rem (11px) | 600 | 1.3 | 상위 카테고리 표시 (대문자) |

### 3.3 성경 구절 타이포그래피

```css
.bible-verse {
  font-family: var(--font-scripture);
  font-size: 1.125rem;
  line-height: 1.8;
  color: var(--color-text-strong);
  padding-left: 1.5rem;
  border-left: 3px solid var(--color-primary);
  font-style: italic;
}

.bible-reference {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--color-primary);
  letter-spacing: 0.02em;
}
```

---

## 4. 레이아웃 시스템

### 4.1 그리드

```
최대 너비: 1280px (--max-width-content)
사이드바 너비: 280px (접힘 시 64px)
거터: 24px
패딩(모바일): 16px
패딩(데스크톱): 32px
```

### 4.2 간격 스케일 (8px 기반)

| 토큰 | 값 | 용도 |
|------|------|------|
| `--space-1` | 4px | 인라인 아이콘 간격 |
| `--space-2` | 8px | 밀접한 요소 간격 |
| `--space-3` | 12px | 관련 요소 간격 |
| `--space-4` | 16px | 컴포넌트 내부 패딩 |
| `--space-5` | 20px | 카드 패딩 |
| `--space-6` | 24px | 섹션 간격 |
| `--space-8` | 32px | 페이지 섹션 구분 |
| `--space-10` | 40px | 큰 섹션 구분 |
| `--space-12` | 48px | 페이지 상단/하단 여백 |
| `--space-16` | 64px | 히어로 영역 여백 |

---

## 5. 글로벌 내비게이션

### 5.1 상단 네비바 (AppBar)

```
┌─────────────────────────────────────────────────────────┐
│  ✝ 청소년설교 AI    [← 뒤로] [앞으로 →]    🔔  👤 김전도사  │
│                     현재 위치: 설교 작성                   │
└─────────────────────────────────────────────────────────┘
```

**구조:**
- **좌측**: 로고 + 앱 이름 (클릭 시 대시보드)
- **중앙**: 뒤로가기/앞으로가기 버튼 + 브레드크럼 (현재 위치 표시)
- **우측**: 알림 벨 아이콘 + 사용자 아바타/이름 (드롭다운 메뉴)

**스타일:**
```css
.app-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 56px;
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(12px);
  background: rgba(22, 22, 29, 0.85);
}
```

### 5.2 뒤로가기/앞으로가기

- React Router의 `useNavigate` 활용 (`navigate(-1)`, `navigate(1)`)
- 버튼은 히스토리가 없으면 `disabled` + `opacity: 0.3`
- 키보드 단축키: `Alt + ←` / `Alt + →`
- 호버 시 가려는 페이지 이름 툴팁 표시

### 5.3 브레드크럼

```
대시보드 > 새 설교 작성 > 입력
대시보드 > 요한복음 3:16 설교 > 편집
대시보드 > 시리즈 관리
```

- 각 단계 클릭 가능 (해당 페이지로 이동)
- 현재 단계는 `--color-text-strong` + 굵게
- 이전 단계는 `--color-text-secondary` + 밑줄

### 5.4 모바일 네비게이션

```
┌──────────────────────────┐
│  ☰  청소년설교 AI    👤   │  ← 햄버거 + 프로필
├──────────────────────────┤
│  ← 대시보드 > 설교 작성    │  ← 뒤로가기 통합 브레드크럼
└──────────────────────────┘
```

- 768px 이하: 햄버거 메뉴로 전환
- 뒤로가기 버튼이 브레드크럼 첫 항목에 통합

---

## 6. 컴포넌트 상세 디자인

### 6.1 버튼

#### Primary (CTA)
```css
.btn-primary {
  background: var(--color-primary);
  color: #ffffff;
  padding: 12px 24px;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 0.9375rem;
  border: none;
  box-shadow: var(--shadow-glow);
  transition: all var(--transition);
}
.btn-primary:hover {
  background: var(--color-primary-hover);
  box-shadow: 0 0 30px var(--color-primary-glow);
  transform: translateY(-1px);
}
.btn-primary:active {
  background: var(--color-primary-active);
  transform: translateY(0);
  box-shadow: none;
}
```

#### Secondary
```css
.btn-secondary {
  background: var(--color-surface-raised);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  /* 호버 시 보더가 밝아지며 미세한 상승 */
}
```

#### Ghost (텍스트 버튼)
```css
.btn-ghost {
  background: transparent;
  color: var(--color-primary);
  /* 호버 시 --color-primary-subtle 배경 */
}
```

#### Icon 버튼
```css
.btn-icon {
  width: 40px; height: 40px;
  border-radius: var(--radius);
  display: grid; place-items: center;
  /* 호버 시 배경 --color-bg-hover */
}
```

#### 버튼 크기

| 크기 | 높이 | 패딩 | 폰트 |
|------|------|------|------|
| sm | 32px | 8px 16px | 13px |
| md | 40px | 10px 20px | 15px |
| lg | 48px | 12px 28px | 16px |
| xl | 56px | 14px 32px | 18px (CTA only) |

### 6.2 카드

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  transition: all var(--transition);
}
.card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
.card.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
  background: var(--color-primary-subtle);
}
```

#### 선택형 카드 (설교 방법, 설교자 스타일 등)
```
┌─────────────────────────────┐
│  🎯 3대지 설교법              │
│                              │
│  서론-본론(3)-결론의 전통적     │
│  구조로 핵심 주제를 3가지       │
│  포인트로 전달합니다.           │
│                              │
│  ✓ 선택됨                     │
└─────────────────────────────┘
```

- 선택 시: 좌상단 체크 아이콘 + 보라색 보더 + 미세 글로우
- 미선택: 회색 보더, 호버 시 밝아짐
- 비활성: `opacity: 0.4`, 커서 `not-allowed`

### 6.3 입력 필드

```css
.input {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px 16px;
  color: var(--color-text);
  font-size: 1rem;
  box-shadow: var(--shadow-inner);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-inner), 0 0 0 3px var(--color-primary-glow);
}
.input::placeholder {
  color: var(--color-text-muted);
}
.input.error {
  border-color: var(--color-error);
  box-shadow: var(--shadow-inner), 0 0 0 3px var(--color-error-subtle);
}
```

### 6.4 슬라이더 (설교 길이)

```css
.slider {
  -webkit-appearance: none;
  height: 6px;
  background: var(--color-border);
  border-radius: var(--radius-full);
}
.slider::-webkit-slider-thumb {
  width: 20px; height: 20px;
  background: var(--color-primary);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--color-primary-glow);
  cursor: grab;
}
/* 트랙 채움 영역: --color-primary gradient */
```

### 6.5 프로그레스 바

```css
.progress-bar {
  background: var(--color-border);
  border-radius: var(--radius-full);
  height: 8px;
  overflow: hidden;
}
.progress-bar-fill {
  background: linear-gradient(90deg, var(--color-primary), #a78bfa);
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
  /* 애니메이션: 빛나는 반사광이 왼→오 이동 */
  animation: shimmer 2s infinite;
}
```

### 6.6 탭

```css
.tab-group {
  display: flex;
  gap: 2px;
  background: var(--color-bg);
  padding: 4px;
  border-radius: var(--radius);
}
.tab {
  padding: 8px 16px;
  border-radius: calc(var(--radius) - 2px);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}
.tab.active {
  background: var(--color-surface);
  color: var(--color-text-strong);
  box-shadow: var(--shadow-sm);
}
.tab:hover:not(.active) {
  color: var(--color-text);
  background: var(--color-bg-hover);
}
```

### 6.7 모달

```css
.modal-overlay {
  background: var(--color-surface-overlay);
  backdrop-filter: blur(4px);
  animation: fadeIn 200ms ease-out;
}
.modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  max-width: 560px;
  width: 90vw;
  animation: slideUp 300ms var(--transition-spring);
}
```

### 6.8 토스트 알림

```
┌─────────────────────────────────┐
│  ✓ 설교가 자동 저장되었습니다.    │  → 3초 후 페이드아웃
│     12:34:56                    │
└─────────────────────────────────┘
```

- 우하단 고정 (bottom: 24px, right: 24px)
- 성공: 좌측 `--color-success` 보더
- 에러: 좌측 `--color-error` 보더
- 정보: 좌측 `--color-info` 보더
- 진입: `slideInRight` 300ms, 퇴장: `fadeOut` 200ms

### 6.9 배지 (Badge)

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.badge-primary { background: var(--color-primary-subtle); color: var(--color-primary); }
.badge-success { background: var(--color-success-subtle); color: var(--color-success); }
.badge-warning { background: var(--color-warning-subtle); color: var(--color-warning); }
.badge-error   { background: var(--color-error-subtle);   color: var(--color-error);   }
```

### 6.10 툴팁

```css
.tooltip {
  background: var(--color-surface-raised);
  color: var(--color-text);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  box-shadow: var(--shadow-md);
  animation: fadeIn 150ms;
  max-width: 240px;
}
```

---

## 7. 페이지별 디자인

### 7.1 랜딩 페이지 (LandingPage)

```
┌──────────────────────────────────────────────────────┐
│  [AppBar - 로그인/시작하기 버튼]                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│         ✝                                            │
│     AI와 함께하는                                     │
│     청소년 설교 작성                                   │
│                                                      │
│     말씀을 청소년의 언어로 전합니다                      │
│                                                      │
│     [ 설교 작성 시작 →]  [둘러보기]                     │
│                                                      │
├──────────────────────────────────────────────────────┤
│  ── 주요 기능 ──                                      │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ 📖 16가지  │ │ 🎤 12 설교│ │ 🎨 시각자료│             │
│  │ 설교 방법  │ │ 자 스타일 │ │ 자동 생성  │             │
│  │           │ │          │ │          │             │
│  │ 3대지부터  │ │ 옥한흠부터│ │ PPT, 이미│             │
│  │ 내러티브   │ │ 김남국까지│ │ 지 자동    │             │
│  └──────────┘ └──────────┘ └──────────┘             │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ 👥 청소년  │ │ 📅 교회력  │ │ ⚡ 실시간  │             │
│  │ 맞춤 변환  │ │ 시즌 연동  │ │ AI 진행률  │             │
│  └──────────┘ └──────────┘ └──────────┘             │
├──────────────────────────────────────────────────────┤
│                                                      │
│  "설교 준비 시간을 50% 줄이고,                          │
│   청소년이 집중하는 설교를 만드세요"                      │
│                                                      │
│            [ 무료로 시작하기 ]                          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**특징:**
- 히어로: 미묘한 그라디언트 배경 (`--color-bg` → `--color-bg-elevated`)
- 십자가 아이콘: `--color-primary`로 은은한 글로우
- 기능 카드: 호버 시 아이콘 스케일 1.1 + 글로우
- CTA 버튼: `xl` 크기, 글로우 효과

### 7.2 인증 페이지 (AuthPage)

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│                  ✝ 청소년설교 AI                      │
│                                                      │
│           ┌──────────────────────┐                   │
│           │  [로그인] [회원가입]   │ ← 탭 전환          │
│           │                      │                   │
│           │  이메일               │                   │
│           │  ┌──────────────────┐│                   │
│           │  │                  ││                   │
│           │  └──────────────────┘│                   │
│           │  비밀번호             │                   │
│           │  ┌──────────────────┐│                   │
│           │  │            👁    ││ ← 비번 보기 토글   │
│           │  └──────────────────┘│                   │
│           │                      │                   │
│           │  [     로그인     ]   │                   │
│           │                      │                   │
│           └──────────────────────┘                   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- 중앙 정렬 카드, 최대 너비 420px
- 로그인↔회원가입 탭 전환 애니메이션 (슬라이드)
- 입력 필드 포커스 시 라벨이 위로 이동 (floating label)
- 비밀번호 강도 표시 바 (회원가입 시)

### 7.3 온보딩 페이지 (OnboardingPage)

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  단계: ●━━●━━●━━○━━○  (3/5)                          │
│                                                      │
│  선호하는 설교자 스타일을 선택하세요                      │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ 옥한흠     │ │ 이동원    │ │ 하용조    │             │
│  │ 강해/제자훈│ │ 은혜로운  │ │ 열정적    │             │
│  └──────────┘ └──────────┘ └──────────┘             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ 송태근     │ │ 이찬수    │ │ 유기성    │             │
│  └──────────┘ └──────────┘ └──────────┘             │
│  ...                                                 │
│                                                      │
│  [← 이전]                        [다음 →]             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**특징:**
- 프로그레스 바: 연결된 도트 형태, 완료 단계 `--color-primary`
- 카드 전환: 좌→우 슬라이드 애니메이션
- "건너뛰기" 링크: 우상단에 작게 표시
- 완료 시: 체크마크 애니메이션 + "설정 완료!" 메시지

### 7.4 대시보드 (DashboardPage)

```
┌──────────────────────────────────────────────────────┐
│  [AppBar]                                            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  안녕하세요, 김전도사님 👋                              │
│                                                      │
│  ┌─ 빠른 작업 ─────────────────────────────────────┐  │
│  │  [+ 새 설교 작성]  [📋 시리즈 관리]  [📊 통계]   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                      │
│  내 설교  [리스트 뷰 | 달력 뷰]  정렬: 최신순 ▼        │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │ 📖 요한복음 3:16 — 하나님의 사랑              │    │
│  │ 3대지 설교법 · 옥한흠 스타일 · 중고등부        │    │
│  │ 2026.03.08 · ✓ 완료  [편집] [복제] [···]     │    │
│  └──────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────┐    │
│  │ 📖 시편 23편 — 선한 목자                      │    │
│  │ 내러티브 · 하용조 스타일 · 고등부              │    │
│  │ 2026.03.05 · ⏳ 작성중  [편집] [···]          │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**특징:**
- 설교 카드: 좌측에 `--color-primary` 세로 바 (완료 시 `--color-success`)
- 상태 배지: 완료(초록), 작성중(파랑), 초안(회색)
- 빠른 작업 버튼: 아이콘 + 텍스트, 호버 시 글로우
- 빈 상태: 십자가 일러스트 + "첫 설교를 작성해보세요" 메시지 + CTA
- 달력 뷰: 월 달력, 설교가 있는 날짜에 점 표시, 클릭 시 설교 카드 팝업

### 7.5 설교 입력 페이지 (SermonInputPage)

```
┌──────────────────────────────────────────────────────┐
│  [AppBar: ← 대시보드 > 새 설교 작성]                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─ 필수 입력 ──────────────────────────────────────┐ │
│  │                                                   │ │
│  │  📖 성경 본문                                     │ │
│  │  ┌─────────────────────────────────────────────┐ │ │
│  │  │  요한복음 3:16-18                            │ │ │
│  │  └─────────────────────────────────────────────┘ │ │
│  │  ✓ 요한복음 3장 16-18절                          │ │
│  │                                                   │ │
│  │  📚 병행본문 / 관련구절                            │ │
│  │  ┌─────────────────────────────────────────────┐ │ │
│  │  │ 🔵 병행  로마서 5:8    "그리스도께서..."       │ │ │
│  │  │ 🟡 인용  이사야 53:5   "그가 찔림은..."       │ │ │
│  │  │ 🟢 주제  에베소서 2:8  "너희는 그 은혜에..."   │ │ │
│  │  └─────────────────────────────────────────────┘ │ │
│  │                                                   │ │
│  │  📅 교회력 시즌 (선택)                             │ │
│  │  [대림절] [성탄절] [현현절] [사순절] [부활절]       │ │
│  │  [성령강림] [연중시기]   현재: 🟢 사순절            │ │
│  │                                                   │ │
│  └──────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─ 설교 설정 ──────────────────────────────────────┐ │
│  │                                                   │ │
│  │  🎯 설교 방법                                     │ │
│  │  [구조형] [전개형] [내러티브] [본문중심] [특수]     │ │
│  │                                                   │ │
│  │  ┌──────┐ ┌──────┐ ┌──────┐                     │ │
│  │  │✓ 3대지│ │ 2대지 │ │ 1대지 │                     │ │
│  │  └──────┘ └──────┘ └──────┘                     │ │
│  │                                                   │ │
│  │  🎤 설교자 스타일                                  │ │
│  │  (12명 그리드 - 3x4)                              │ │
│  │                                                   │ │
│  │  👥 청소년 사역자 스타일                            │ │
│  │  (6명 그리드 - 3x2)                               │ │
│  │                                                   │ │
│  │  🎯 대상 연령대                                    │ │
│  │  [초등 고학년] [중등부] [고등부] [대학 청년]        │ │
│  │                                                   │ │
│  │  ⏱ 설교 길이: ████████░░ 15분                     │ │
│  │  💡 중등부에 적합한 길이입니다                       │ │
│  │                                                   │ │
│  └──────────────────────────────────────────────────┘ │
│                                                      │
│  ┌──────────────────────────────────────────────────┐ │
│  │     [          ✨ 설교 생성하기          ]         │ │
│  └──────────────────────────────────────────────────┘ │
│                                                      │
│  ── AI 생성 진행률 (생성 중에만 표시) ──                │
│  ┌──────────────────────────────────────────────────┐ │
│  │  설교를 작성하고 있습니다...                        │ │
│  │  ████████████████░░░░░░░░░░░░ 58%                │ │
│  │                                                   │ │
│  │  ✓ 본문 분석 완료                                 │ │
│  │  ✓ 설교 방법 선택 완료                             │ │
│  │  → 설교 원고 생성 중...                            │ │
│  │  ○ 신학적 검증                                    │ │
│  │  ○ 청소년 적응                                    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**특징:**
- 필수/선택 영역 시각적 구분 (필수: `--color-primary` 좌측 바)
- 성경 본문 입력: 실시간 파싱 결과 미리보기
- 교회력 시즌: 각 시즌 색상 반영, 현재 시즌 자동 감지 배지
- 생성 버튼: `xl` 크기, 전체 너비, 펄스 애니메이션
- 진행률: 단계별 아이콘 (✓ 완료, → 진행 중, ○ 대기)

### 7.6 설교 편집 페이지 (SermonEditPage)

```
┌──────────────────────────────────────────────────────┐
│  [AppBar: ← 대시보드 > 요한복음 3:16 > 편집]           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─ 좌측: 에디터 (70%) ──────────┐ ┌─ 우측 패널 ──┐  │
│  │                                │ │              │  │
│  │  요한복음 3:16-18 설교          │ │  [AI제안]    │  │
│  │  ─────────────────             │ │  [시간추정]  │  │
│  │  [편집] [구조] [내보내기] [피드백]│ │  [버전]     │  │
│  │                                │ │  [시각자료]  │  │
│  │  서론                          │ │              │  │
│  │  ┌────────────────────────┐   │ │  ── AI 제안 ─│  │
│  │  │ TipTap 에디터 영역      │   │ │  💡 서론에서  │  │
│  │  │                        │   │ │  청소년 사례   │  │
│  │  │ 하나님이 세상을 이처럼   │   │ │  를 추가하면  │  │
│  │  │ 사랑하사...             │   │ │  좋겠습니다.  │  │
│  │  │                        │   │ │              │  │
│  │  │                        │   │ │  [적용] [무시]│  │
│  │  └────────────────────────┘   │ │              │  │
│  │                                │ │              │  │
│  │  본론 1                        │ │              │  │
│  │  ┌────────────────────────┐   │ │              │  │
│  │  │ ...                    │   │ │              │  │
│  │  └────────────────────────┘   │ │              │  │
│  │                                │ │              │  │
│  │  ─────────────────             │ │              │  │
│  │  자동 저장: 12:34:56 ✓         │ │              │  │
│  │                                │ │              │  │
│  └────────────────────────────────┘ └──────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**특징:**
- 2패널 레이아웃: 에디터(좌) 70% + 사이드바(우) 30%
- 사이드바 토글: 모바일에서는 바텀시트로 전환
- 자동저장 표시: 하단에 타임스탬프 + 체크 아이콘
- 에디터 툴바: 서식 지정 (볼드, 이탤릭, 제목, 성경구절 블록)
- 성경구절: `--font-scripture` + 좌측 보라 보더 + 다른 배경색
- 내보내기 탭: Word, PDF, TXT, MD, PPT 버튼 (아이콘 + 텍스트)
- 버전 히스토리: 타임라인 UI (세로 라인 + 버전 노드)

### 7.7 시리즈 페이지 (SeriesPage)

```
┌──────────────────────────────────────────────────────┐
│  [AppBar: ← 대시보드 > 시리즈 관리]                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  설교 시리즈                    [+ 새 시리즈 만들기]    │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  📚 사순절 시리즈: 십자가의 길                  │    │
│  │  마가복음 · 7주 · 2026.02.18 ~ 04.05          │    │
│  │  ██████████████░░░░░░░ 5/7 완료                │    │
│  │  [이어서 작성] [편집] [···]                     │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 8. 마이크로 인터랙션 & 애니메이션

### 8.1 페이지 전환

```css
@keyframes pageEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.page-enter { animation: pageEnter 300ms ease-out; }
```

### 8.2 카드 로딩 (스켈레톤)

```css
@keyframes skeleton-pulse {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    var(--color-surface) 25%,
    var(--color-surface-raised) 50%,
    var(--color-surface) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s infinite;
  border-radius: var(--radius);
}
```

### 8.3 버튼 로딩 스피너

```css
.btn-loading::after {
  content: '';
  width: 18px; height: 18px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 600ms linear infinite;
}
```

### 8.4 AI 생성 진행률

```css
/* 단계 완료 시 체크마크 애니메이션 */
@keyframes checkmark {
  from { stroke-dashoffset: 24; }
  to   { stroke-dashoffset: 0; }
}

/* 진행 바: 빛나는 하이라이트 이동 */
@keyframes shimmer {
  from { background-position: -100% 0; }
  to   { background-position: 200% 0; }
}
```

### 8.5 선택 카드 전환

```css
.selectable-card {
  transition: all var(--transition);
}
.selectable-card.selected {
  animation: selectBounce 400ms var(--transition-spring);
}
@keyframes selectBounce {
  0%   { transform: scale(1); }
  50%  { transform: scale(0.97); }
  100% { transform: scale(1); }
}
```

### 8.6 토스트 알림

```css
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
@keyframes fadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}
```

### 8.7 자동 저장 인디케이터

```css
/* 저장 중: 점 3개 순차 깜빡 */
@keyframes savingDots {
  0%, 20%  { opacity: 0.2; }
  50%      { opacity: 1; }
  100%     { opacity: 0.2; }
}
.saving-dot:nth-child(1) { animation-delay: 0ms; }
.saving-dot:nth-child(2) { animation-delay: 200ms; }
.saving-dot:nth-child(3) { animation-delay: 400ms; }

/* 저장 완료: 체크 → 페이드 */
.saved-check {
  color: var(--color-success);
  animation: fadeIn 200ms, fadeOut 200ms 2s forwards;
}
```

---

## 9. 반응형 디자인

### 9.1 브레이크포인트

| 이름 | 범위 | 레이아웃 |
|------|------|---------|
| **Mobile** | 0 ~ 639px | 1열, 바텀시트 |
| **Tablet** | 640 ~ 1023px | 2열 그리드, 축소 사이드바 |
| **Desktop** | 1024 ~ 1439px | 2패널 레이아웃 |
| **Wide** | 1440px+ | 최대 너비 1280px 중앙 정렬 |

### 9.2 모바일 우선 변경사항

| 컴포넌트 | 모바일 | 데스크톱 |
|----------|--------|---------|
| 네비바 | 햄버거 + 로고 + 프로필 | 풀 네비게이션 |
| 설교 카드 그리드 | 1열 | 2열 |
| 설교 편집 | 전체 너비 에디터 + 바텀시트 사이드바 | 70/30 분할 |
| 선택 카드 그리드 | 2열 (축소) | 3열 |
| 버튼 | 전체 너비 | 자동 너비 |
| 모달 | 전체 화면 바텀시트 | 중앙 모달 |

### 9.3 터치 최적화

- 최소 터치 타겟: 44px × 44px
- 스와이프: 온보딩 카드 좌우 넘김
- 풀 투 리프레시: 대시보드 설교 목록

---

## 10. 접근성 (A11y)

### 10.1 WCAG 2.1 AA 준수 항목

| 항목 | 기준 |
|------|------|
| 텍스트 대비 | 최소 4.5:1 (일반), 3:1 (큰 텍스트) |
| 포커스 표시 | 모든 인터랙티브 요소에 포커스 링 (`--color-primary` 3px) |
| 키보드 탐색 | Tab 순서 논리적, Enter/Space로 활성화, Esc로 닫기 |
| ARIA 라벨 | 모든 아이콘 버튼에 `aria-label` |
| 스크린 리더 | 생성 진행률 `aria-live="polite"` |
| 색 외 정보 | 색상만으로 정보 전달 X (아이콘/텍스트 병행) |
| 애니메이션 | `prefers-reduced-motion` 대응 |

### 10.2 포커스 스타일

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
/* prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. 아이콘 시스템

### 11.1 아이콘 라이브러리

**Lucide React** 사용 (MIT 라이선스, React 네이티브 지원)

### 11.2 주요 아이콘 매핑

| 기능 | 아이콘 | 크기 |
|------|--------|------|
| 뒤로 가기 | `ArrowLeft` | 20px |
| 앞으로 가기 | `ArrowRight` | 20px |
| 새 설교 | `Plus` / `FilePlus` | 20px |
| 설교 편집 | `Pencil` | 16px |
| 삭제 | `Trash2` | 16px |
| 내보내기 | `Download` | 20px |
| 저장됨 | `Check` | 16px |
| 저장 중 | `Loader2` (스핀) | 16px |
| 성경 | `BookOpen` | 20px |
| 사용자 | `User` | 20px |
| 시리즈 | `Library` | 20px |
| AI/생성 | `Sparkles` | 20px |
| 설정 | `Settings` | 20px |
| 로그아웃 | `LogOut` | 16px |
| 달력 | `Calendar` | 20px |
| 시계 | `Clock` | 16px |
| PPT | `Presentation` | 20px |
| Word | `FileText` | 20px |
| PDF | `FileDown` | 20px |
| 피드백 | `MessageSquare` | 20px |
| 버전 | `GitBranch` | 20px |

---

## 12. 구현 우선순위

### Phase 1: 기반 (즉시)
1. CSS 변수 교체 (라이트 → 다크)
2. AppBar 컴포넌트 신규 생성 (뒤로가기/앞으로가기/브레드크럼)
3. 버튼 컴포넌트 리디자인
4. 입력 필드 리디자인
5. 카드 컴포넌트 리디자인

### Phase 2: 페이지별 적용
6. LandingPage 다크 테마 적용
7. AuthPage 중앙 정렬 + 다크
8. OnboardingPage 프로그레스 개선
9. DashboardPage 카드 리디자인
10. SermonInputPage 섹션 구분 + 다크

### Phase 3: 에디터 & 고급
11. SermonEditPage 2패널 레이아웃
12. 토스트 알림 시스템
13. 스켈레톤 로딩
14. 페이지 전환 애니메이션
15. 모바일 반응형 최적화

### Phase 4: 완성도
16. 접근성 검수
17. 아이콘 시스템 통합 (Lucide)
18. 마이크로 인터랙션 완성
19. 퍼포먼스 최적화 (CSS 크기)
20. 크로스 브라우저 테스트

---

## 13. 파일 구조 변경 계획

```
src/
├── components/
│   ├── layout/            ← 신규
│   │   ├── AppBar.tsx     ← 글로벌 상단바
│   │   ├── Breadcrumb.tsx ← 브레드크럼
│   │   └── Layout.tsx     ← 공통 레이아웃 래퍼
│   ├── ui/                ← 신규 (재사용 UI)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Toast.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Modal.tsx
│   │   ├── Skeleton.tsx
│   │   └── Tabs.tsx
│   └── ... (기존 유지)
├── styles/
│   ├── globals.css        ← 전면 수정 (다크 테마)
│   ├── animations.css     ← 신규 (애니메이션 모음)
│   └── components.css     ← 신규 (컴포넌트 스타일 분리)
```

---

> **다음 단계**: 이 문서를 기반으로 globals.css 다크 테마 적용 → AppBar 컴포넌트 생성 → 페이지별 적용 순서로 구현합니다.
