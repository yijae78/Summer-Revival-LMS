# ACCESSIBILITY.md
# FLOWING - 접근성 & 연령 포용 디자인 가이드

> **버전**: v1.0
> **작성일**: 2026-03-13
> **대상 사용자**: 초등학생(10세) ~ 시니어 봉사자(60세+)
> **기준**: WCAG 2.2 AA (ISO/IEC 40500:2025)

---

## 1. 폰트 크기 & 가독성

### 1.1 연령대별 최소 폰트 크기

WCAG 2.2는 특정 최소 폰트 크기를 규정하지 않으나, 텍스트를 200%까지 확대해도 기능 손실이 없어야 합니다 (Success Criterion 1.4.4). 아래는 연령 포용 설계를 위한 실무 권장 사항입니다.

| 용도 | 현재 DESIGN.md | 권장 수정 | 이유 |
|------|---------------|-----------|------|
| 본문 (`body`) | 14px / 0.875rem | **16px / 1rem** | 60대 사용자 가독성. 업계 표준 본문 크기 |
| 보조 본문 (`body-lg`) | 16px / 1rem | 16px 유지 (OK) | - |
| 캡션 (`caption`) | 12px / 0.75rem | **13px / 0.8125rem** | 12px는 시력 저하 사용자에게 너무 작음 |
| 오버라인 (`overline`) | 11px / 0.6875rem | **12px / 0.75rem** | 11px 이하는 시니어에게 판독 불가 |
| 하단 네비 레이블 | 10px | **12px / 0.75rem** | 10px는 WCAG AA에서 비권장 |
| 퀴즈 질문 | 22px | 22px 유지 (OK) | 몰입 모드 적합 |

**핵심 원칙**: 앱 전체에서 10px 이하 텍스트를 완전히 제거합니다.

### 1.2 한국어 타이포그래피 (Pretendard, Noto Sans KR)

한글은 CJK 문자 체계에 속하며, 라틴 문자보다 획이 복잡하고 em box를 더 많이 사용합니다.

**행간 (line-height) 권장**:

| 요소 | 현재 DESIGN.md | 권장 수정 | 이유 |
|------|---------------|-----------|------|
| 본문 | 1.5~1.6 | **1.7~1.8** | CJK 텍스트 밀도가 높아 1.7이 최적 가독성 |
| 제목 (h1~h3) | 1.2~1.3 | 1.3~1.4 | 한글 제목도 약간 넓은 행간 필요 |
| 캡션/레이블 | 1.4 | 1.5 | 작은 텍스트일수록 넓은 행간 필요 |

**글자간격 (letter-spacing)**:
- 한글 본문: `letter-spacing: 0` 또는 `-0.01em` (기본 유지)
- 한글 제목 (강조): `letter-spacing: -0.02em` ~ `-0.03em` (타이트하게)
- 영문/숫자 강조: `letter-spacing: -0.02em` (현재 설정 적절)

**폰트 로딩 최적화**:
```css
/* Pretendard Variable - 서브셋으로 로딩 (15MB+ 풀 CJK 폰트 방지) */
@font-face {
  font-family: 'Pretendard Variable';
  src: url('/fonts/PretendardVariable.subset.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap; /* FOUT 허용, 레이아웃 시프트 방지 */
  unicode-range: U+AC00-D7AF, U+0020-007E; /* 한글 음절 + 기본 라틴 */
}
```

### 1.3 rem 단위 기반 스케일링 시스템

`rem` 단위를 사용하면 사용자가 브라우저 설정에서 기본 글꼴 크기를 변경할 때 전체 UI가 비례적으로 확대됩니다. 이는 시니어 사용자의 접근성에 핵심적입니다.

```css
/* globals.css - 반응형 폰트 스케일링 */
:root {
  /* 기본 16px = 1rem */
  --font-scale: 1;
}

/* 사용자가 큰 글씨를 원할 때 (앱 내 설정) */
.font-scale-large {
  --font-scale: 1.15; /* 115% */
}
.font-scale-xlarge {
  --font-scale: 1.3; /* 130% - 시니어 모드 */
}

/* 모든 텍스트에 스케일 적용 */
body {
  font-size: calc(1rem * var(--font-scale));
  line-height: 1.7;
}
```

**React 구현 - 폰트 크기 조절 컴포넌트**:
```tsx
// components/FontSizeControl.tsx
'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';

type FontScale = 'normal' | 'large' | 'xlarge';

export function FontSizeControl() {
  const [scale, setScale] = useLocalStorage<FontScale>('font-scale', 'normal');

  const scaleMap: Record<FontScale, string> = {
    normal: '',
    large: 'font-scale-large',
    xlarge: 'font-scale-xlarge',
  };

  // body에 클래스 적용
  useEffect(() => {
    document.documentElement.className =
      document.documentElement.className
        .replace(/font-scale-\w+/g, '')
        .trim() + ` ${scaleMap[scale]}`;
  }, [scale]);

  return (
    <div role="radiogroup" aria-label="글꼴 크기 설정">
      <button
        role="radio"
        aria-checked={scale === 'normal'}
        onClick={() => setScale('normal')}
        className="min-h-[48px] min-w-[48px] text-base"
      >
        가
      </button>
      <button
        role="radio"
        aria-checked={scale === 'large'}
        onClick={() => setScale('large')}
        className="min-h-[48px] min-w-[48px] text-lg"
      >
        가
      </button>
      <button
        role="radio"
        aria-checked={scale === 'xlarge'}
        onClick={() => setScale('xlarge')}
        className="min-h-[48px] min-w-[48px] text-xl"
      >
        가
      </button>
    </div>
  );
}
```

---

## 2. 색상 대비 & 색각 이상 대응

### 2.1 WCAG 2.2 대비 요구사항

| 수준 | 일반 텍스트 | 대형 텍스트 (18pt+ 또는 14pt Bold+) |
|------|------------|-----------------------------------|
| **AA (필수)** | 4.5:1 | 3:1 |
| **AAA (권장)** | 7:1 | 4.5:1 |

**현재 DESIGN.md 컬러 감사 결과 및 개선 권고**:

| 조합 | 대비율 | AA | AAA | 조치 |
|------|--------|-----|-----|------|
| Slate 700 (#334155) on Slate 50 (#F8FAFC) | ~8.5:1 | Pass | Pass | OK |
| Slate 400 (#94A3B8) on White | ~3.3:1 | Fail (일반), Pass (대형) | Fail | **보조 텍스트를 Slate 500 (#64748B)로 변경** (대비 4.6:1) |
| Emerald 500 (#10B981) on White | ~3.0:1 | Fail | Fail | **버튼 텍스트는 White-on-Emerald 700 (#047857)로** (대비 5.2:1) |
| White on Hero Red (#DC2626) | ~4.6:1 | Pass | Fail | OK for AA |
| Footer Slate 400 on Slate 900 | ~4.1:1 | Fail (barely) | Fail | **Slate 300 (#CBD5E1) 사용** (대비 6.5:1) |
| 하단 네비 Slate 400 (비활성) | ~3.3:1 | Fail | Fail | **Slate 500 이상 사용** |

### 2.2 색각 이상 안전 팔레트

약 8%의 남성, 0.5%의 여성이 색각 이상을 가집니다. 적녹 색맹(전체 색각 이상의 ~98%)에 대응해야 합니다.

**위험한 조합 (피해야 함)**:
- 빨강 vs 초록 (출석 상태: 출석/결석을 색상만으로 구분)
- 초록 vs 갈색, 초록 vs 노랑, 빨강 vs 주황

**안전한 대안**:
- 파랑 + 주황 (가장 안전한 2색 조합)
- 파랑 + 빨강
- 진한 파랑 + 밝은 노랑

**DESIGN.md 적용 권고**:

```
시맨틱 색상 개선:
  Success: #10B981 (Emerald) → 유지, 단 반드시 체크 아이콘(✓) 병행
  Error:   #EF4444 (Red)     → 유지, 단 반드시 X 아이콘(✕) 병행
  Warning: #F59E0B (Amber)   → 유지, 단 반드시 경고 아이콘(⚠) 병행
  Info:    #3B82F6 (Blue)    → 유지, 단 반드시 정보 아이콘(ℹ) 병행
```

**핵심 원칙**: 색상만으로 정보를 전달하지 않습니다. 모든 상태 표시에 아이콘 + 텍스트 레이블을 병행합니다.

```tsx
// 잘못된 예: 색상만으로 상태 표시
<span className="text-green-500">출석</span>
<span className="text-red-500">결석</span>

// 올바른 예: 아이콘 + 텍스트 + 색상
<span className="text-emerald-700 flex items-center gap-1">
  <CheckCircle className="w-4 h-4" aria-hidden="true" />
  출석
</span>
<span className="text-red-600 flex items-center gap-1">
  <XCircle className="w-4 h-4" aria-hidden="true" />
  결석
</span>
```

### 2.3 다크 모드 대비 검증

다크 모드에서도 동일한 대비 기준을 준수해야 합니다.

```css
.dark {
  /* 본문 텍스트: Slate 200 (#E2E8F0) on #0B1120 → 약 12:1 (AAA Pass) */
  --foreground: oklch(0.916 0.007 264);

  /* 보조 텍스트: 최소 Slate 400 (#94A3B8) on #0B1120 → 약 5.2:1 (AA Pass) */
  --muted-foreground: oklch(0.6 0.02 260);

  /* Slate 500 (#64748B) on #0B1120 → 약 3.7:1 (AA Fail for body text) */
  /* → 보조 텍스트도 Slate 400 이상 사용 */
}
```

---

## 3. 인지 부하 감소 & 점진적 공개

### 3.1 연령대별 인지 특성

| 특성 | 초등학생 (10세) | 청소년 (13~18세) | 성인 봉사자 (30~50대) | 시니어 (60세+) |
|------|-----------------|-------------------|----------------------|----------------|
| 주의 집중 | 짧음, 시각 자극 선호 | 보통, 게이미피케이션 반응 | 목적 지향적 | 느린 전환, 차분한 UI 선호 |
| 디지털 경험 | 중~고 (게임/유튜브) | 높음 | 중~높음 | 낮음~중 |
| 터치 정확도 | 중 | 높음 | 높음 | 낮음 (떨림, 시력) |
| 읽기 수준 | 기본 한자어 어려움 | 보통 | 높음 | 보통 (작은 글씨 어려움) |

### 3.2 점진적 공개 (Progressive Disclosure) 전략

핵심 원칙: **모든 사용자에게 동일한 UI를 제공하되, 복잡한 기능은 숨기고 필요할 때만 드러냅니다.**

```
계층 1 (항상 노출): 출석 확인, 오늘 일정, 공지사항
계층 2 (한 번 탭): 조별 점수, 프로그램 참여, 갤러리
계층 3 (설정/더보기): 상세 통계, 데이터 내보내기, 고급 필터
```

**역할별 UI 분기 (코드 레벨)**:

```tsx
// 역할에 따라 보이는 메뉴가 다름 (progressive disclosure)
const navigationItems = {
  participant: [
    { label: '홈', icon: Home, href: '/dashboard' },
    { label: '일정', icon: Calendar, href: '/schedule' },
    { label: '프로그램', icon: Gamepad2, href: '/quiz' },
    { label: '갤러리', icon: Image, href: '/gallery' },
  ],
  teacher: [
    // participant 메뉴 + 출석, 조원관리
    { label: '출석', icon: CheckSquare, href: '/attendance' },
    { label: '조원', icon: Users, href: '/groups' },
  ],
  admin: [
    // teacher 메뉴 + 통계, 설정
    { label: '통계', icon: BarChart3, href: '/analytics' },
    { label: '설정', icon: Settings, href: '/settings' },
  ],
};
```

### 3.3 화면당 정보량 제한

시니어 사용자를 위한 인지 부하 감소 원칙:

1. **화면당 하나의 주요 작업(primary action)만 강조**
2. **카드 그룹은 한 화면에 최대 6개** (벤토 그리드)
3. **설정 화면은 카테고리별 분리** (한 화면에 모든 옵션 나열 금지)
4. **모달은 하나의 결정만 요구** (여러 입력 필드가 있는 모달 지양)

### 3.4 단계별 온보딩 (초등학생 + 시니어 공통)

```tsx
// 첫 로그인 시 단계별 안내 (최대 3단계)
const onboardingSteps = [
  {
    target: '[data-tour="schedule"]',
    title: '오늘의 일정',
    description: '여기서 오늘 할 일을 확인하세요',
    position: 'bottom',
  },
  {
    target: '[data-tour="attendance"]',
    title: '출석 체크',
    description: '선생님이 여러분의 출석을 확인해요',
    position: 'bottom',
  },
  {
    target: '[data-tour="quiz"]',
    title: '퀴즈 대회',
    description: '퀴즈에 참여하고 점수를 얻으세요!',
    position: 'left',
  },
];
```

---

## 4. 터치 타겟 크기

### 4.1 WCAG 2.2 요구사항

- **WCAG 2.5.8 Target Size (Minimum)** - Level AA: 최소 **24x24 CSS px**
- **WCAG 2.5.5 Target Size (Enhanced)** - Level AAA: 최소 **44x44 CSS px**
- **Google Material Design**: 권장 **48x48 dp**
- **Apple HIG**: 권장 **44x44 pt**

### 4.2 본 프로젝트 권장 크기

초등학생(손이 작음)과 시니어(떨림, 정확도 저하) 모두를 고려하여 **최소 48x48px**을 채택합니다.

| 요소 | 최소 크기 | 간격 | 현재 DESIGN.md | 조치 |
|------|-----------|------|---------------|------|
| 버튼 (Primary) | 48px 높이 | 12px | 미지정 | **min-h-[48px] 추가** |
| 사이드바 메뉴 항목 | 48px 높이 | 4px | padding: 10px 16px (약 40px) | **py-3 (48px)로 변경** |
| 하단 네비 아이콘 | 48x48px | 8px | 64px 높이 바 (OK) | 아이콘 터치 영역 48px 확보 |
| 출석 체크 버튼 | 48x48px | 8px | 미지정 | **min-w-[48px] min-h-[48px]** |
| 퀴즈 선택지 | 64px 높이 | 12px | 64px (OK) | OK |
| 체크박스/라디오 | 24x24px 시각 + 48x48px 터치 | 12px | 미지정 | 패딩으로 터치 영역 확보 |
| AI 챗봇 버튼 | 56x56px | - | 56px (OK) | OK |

### 4.3 CSS 구현

```css
/* 터치 타겟 기본 클래스 */
.touch-target {
  min-height: 48px;
  min-width: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 인접 터치 타겟 간 최소 간격 */
.touch-target + .touch-target {
  margin-left: 8px;
}

/* 시각적으로 작은 요소도 터치 영역 확보 (체크박스 등) */
.touch-target-expanded {
  position: relative;
}
.touch-target-expanded::before {
  content: '';
  position: absolute;
  inset: -12px; /* 시각 요소 주변 12px 패딩 */
}
```

**React 컴포넌트 패턴**:
```tsx
// 모든 인터랙티브 컴포넌트의 기본 props
interface TouchTargetProps {
  className?: string;
  children: React.ReactNode;
}

function TouchTarget({ className, children, ...props }: TouchTargetProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'min-h-[48px] min-w-[48px] inline-flex items-center justify-center',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

---

## 5. 쉬운 언어 & UX 라이팅

### 5.1 한국어 UX 라이팅 원칙

초등학생(10세)부터 시니어(60세+)까지 이해할 수 있는 언어를 사용합니다.

**핵심 규칙**:

1. **한자어 최소화**: "참석" → "출석", "수정" → "고치기/바꾸기", "삭제" → "지우기"
2. **외래어/영어 최소화**: "로그인" → "로그인" (이미 보편적), "대시보드" → "메인 화면"
3. **짧은 문장**: 한 문장에 하나의 정보만
4. **해요체 통일**: "~합니다" (딱딱함) 대신 "~해요" (친근함, 교회 분위기 적합)
5. **능동태**: "출석이 확인되었습니다" → "출석을 확인했어요"

### 5.2 용어 표준화

| 기술/영어 용어 | 앱 표시 용어 | 이유 |
|---------------|-------------|------|
| Dashboard | 메인 화면 | 초등학생 이해 가능 |
| Login | 로그인 | 이미 보편적 |
| Submit | 보내기 / 제출하기 | 상황에 따라 선택 |
| Delete | 지우기 | "삭제"보다 직관적 |
| Cancel | 취소 | 이미 보편적 |
| Confirm | 확인 | 이미 보편적 |
| Settings | 설정 | 이미 보편적 |
| Notification | 알림 | 이미 보편적 |
| Upload | 올리기 | 직관적 |
| Download | 내려받기 | 직관적 |
| Error | 문제가 생겼어요 | "오류"보다 부드러움 |
| Loading | 불러오는 중이에요... | 동적, 진행 중 느낌 |
| Required field | 꼭 입력해 주세요 | 명확한 지시 |
| Session expired | 다시 로그인해 주세요 | 원인보다 행동 안내 |

### 5.3 UX 라이팅 예시

```
// 빈 상태 (Empty State)
잘못된 예: "데이터가 없습니다."
올바른 예: "아직 등록된 일정이 없어요. 새 일정을 만들어 볼까요?"

// 에러 메시지
잘못된 예: "Error 403: Forbidden"
올바른 예: "이 페이지를 볼 수 있는 권한이 없어요. 관리자에게 문의해 주세요."

// 성공 메시지
잘못된 예: "Successfully submitted."
올바른 예: "출석을 확인했어요! ✓"

// 확인 다이얼로그
잘못된 예: "삭제하시겠습니까?"
올바른 예: "이 공지를 정말 지울까요? 지우면 되돌릴 수 없어요."

// 로딩 상태
잘못된 예: "Loading..."
올바른 예: "일정을 불러오고 있어요..."
```

---

## 6. 오류 예방 & 복구

### 6.1 확인 다이얼로그 패턴

파괴적 행동(삭제, 초기화)에는 반드시 확인 단계를 둡니다.

```tsx
// components/ConfirmDialog.tsx
interface ConfirmDialogProps {
  title: string;        // "공지를 지울까요?"
  description: string;  // "지우면 되돌릴 수 없어요."
  confirmLabel: string; // "지우기"
  cancelLabel?: string; // "취소" (기본값)
  variant?: 'destructive' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = '취소',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-muted-foreground leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel
            onClick={onCancel}
            className="min-h-[48px] text-base"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              'min-h-[48px] text-base',
              variant === 'destructive' && 'bg-destructive text-destructive-foreground'
            )}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 6.2 관용적 입력 형식 (Forgiving Formats)

사용자가 어떤 형식으로 입력하든 시스템이 이해합니다.

**전화번호**:
```tsx
// 모든 형식 허용 후 자동 포맷팅
function formatPhoneNumber(input: string): string {
  // 숫자만 추출
  const digits = input.replace(/\D/g, '');

  // 한국 휴대폰 번호 포맷팅
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return input; // 포맷 불가 시 원본 반환
}

// 허용되는 입력 예시:
// "01012345678" → "010-1234-5678"
// "010 1234 5678" → "010-1234-5678"
// "010.1234.5678" → "010-1234-5678"
```

**생년월일**:
```tsx
// Zod 스키마 - 유연한 날짜 파싱
const birthDateSchema = z.string().transform((val) => {
  // 다양한 형식 허용
  const cleaned = val.replace(/[\s./-]/g, '');
  // YYYYMMDD
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6)}`;
  }
  return val;
}).pipe(z.string().date());

// 허용되는 입력 예시:
// "2015.03.21" → "2015-03-21"
// "2015/03/21" → "2015-03-21"
// "20150321"   → "2015-03-21"
// "2015-03-21" → "2015-03-21"
```

### 6.3 실시간 입력 안내

시니어 사용자에게 특히 중요한 인라인 유효성 검사:

```tsx
// React Hook Form + 실시간 에러 표시
<FormField
  control={form.control}
  name="phone"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel className="text-base font-medium">
        전화번호
      </FormLabel>
      <FormControl>
        <Input
          {...field}
          type="tel"
          inputMode="tel"
          placeholder="010-0000-0000"
          aria-invalid={fieldState.invalid}
          aria-describedby={
            fieldState.error ? 'phone-error' : 'phone-hint'
          }
          className="min-h-[48px] text-base"
        />
      </FormControl>
      {!fieldState.error && (
        <FormDescription id="phone-hint" className="text-sm">
          숫자만 입력해도 돼요 (예: 01012345678)
        </FormDescription>
      )}
      {fieldState.error && (
        <FormMessage
          id="phone-error"
          role="alert"
          className="text-sm text-destructive"
        >
          {fieldState.error.message}
        </FormMessage>
      )}
    </FormItem>
  )}
/>
```

### 6.4 되돌리기 (Undo) 패턴

출석 체크 등 빈번한 행동은 즉시 실행 + 되돌리기 토스트를 제공합니다:

```tsx
// 출석 체크 후 되돌리기 토스트
function handleAttendanceCheck(studentId: string) {
  // 즉시 UI 업데이트 (낙관적 업데이트)
  markAttendance(studentId);

  toast({
    title: '출석을 확인했어요',
    description: '실수였다면 되돌릴 수 있어요',
    action: (
      <ToastAction
        altText="출석 되돌리기"
        onClick={() => undoAttendance(studentId)}
        className="min-h-[44px] min-w-[44px]"
      >
        되돌리기
      </ToastAction>
    ),
    duration: 5000, // 5초간 표시 (시니어에게 충분한 시간)
  });
}
```

---

## 7. 시각적 계층 구조

### 7.1 연령 포용 시각 계층 원칙

모든 연령대가 중요한 정보를 즉시 인식할 수 있어야 합니다.

**3단계 시각 계층**:

| 계층 | 시각 처리 | 용도 | 예시 |
|------|-----------|------|------|
| **L1 (최상위)** | 크기 대비 극대화, Bold, Primary 색상 | 현재 해야 할 일 | D-day 배너, 출석 체크 CTA |
| **L2 (중간)** | 카드 분리, 중간 크기, Semibold | 주요 정보 | 일정 카드, 통계 카드 |
| **L3 (보조)** | 작은 크기, Regular, Muted 색상 | 참고 정보 | 타임스탬프, 부가 설명 |

### 7.2 정보 위치 전략

시니어 사용자 연구에 따르면, 중요한 정보는 **화면 중앙 상단**에 배치해야 합니다.

```
모바일 시각 우선순위:
┌────────────────────────┐
│   ★★★ 최고 주의   ★★★  │ ← 상단 1/3: D-day, 오늘의 일정
│                        │
├────────────────────────┤
│   ★★ 중간 주의 ★★     │ ← 중단: 출석 현황, 통계
│                        │
├────────────────────────┤
│   ★ 보조 정보 ★        │ ← 하단: 공지, 갤러리 링크
│                        │
└────────────────────────┘
```

### 7.3 빈 공간(White Space) 활용

- 카드 내부 패딩: 최소 `16px` (모바일), `24px` (데스크톱)
- 섹션 간 간격: 최소 `32px`
- 텍스트 블록 사이: 최소 `12px`
- 빈 공간은 "낭비"가 아니라 **시각적 호흡**입니다. 특히 시니어 사용자의 인지 부하를 줄입니다.

### 7.4 아이콘 + 텍스트 이중 레이블

시니어 사용자는 아이콘만으로 기능을 파악하기 어려울 수 있고, 초등학생은 텍스트만으로 지루함을 느낄 수 있습니다. 항상 아이콘과 텍스트를 함께 사용합니다.

```tsx
// 하단 네비게이션 - 아이콘 + 텍스트 필수
<nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t">
  <div className="flex justify-around items-center h-16">
    {items.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex flex-col items-center justify-center',
          'min-w-[48px] min-h-[48px] gap-1',
          'text-slate-400',
          isActive && 'text-primary'
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        <item.icon className="w-[22px] h-[22px]" aria-hidden="true" />
        <span className="text-xs font-medium">{item.label}</span>
        {/* ↑ 10px → 12px로 변경 권장 */}
      </Link>
    ))}
  </div>
</nav>
```

---

## 8. 모션 감소 (Reduced Motion)

### 8.1 prefers-reduced-motion 지원

전정 기관 장애, 편두통, 또는 단순한 선호에 의해 사용자가 모션 감소를 설정할 수 있습니다. 시니어 사용자 중 모션에 불편을 느끼는 비율이 높습니다.

**CSS 전역 감소**:

```css
/* globals.css - 모션 감소 전역 설정 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* 개별 요소에서 motion-safe 패턴 사용 */
.scroll-reveal {
  animation: fade-up linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}

@media (prefers-reduced-motion: reduce) {
  .scroll-reveal {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

### 8.2 React Hook: usePrefersReducedMotion

```tsx
// hooks/usePrefersReducedMotion.ts
'use client';

import { useState, useEffect } from 'react';

const QUERY = '(prefers-reduced-motion: no-preference)';

export function usePrefersReducedMotion(): boolean {
  // 기본값: 모션 감소 (SSR 안전)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(QUERY);
    // no-preference = false → 모션 허용, reduce → true
    setPrefersReducedMotion(!mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(!event.matches);
    };

    mediaQueryList.addEventListener('change', listener);
    return () => mediaQueryList.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
}
```

### 8.3 Framer Motion 연동

```tsx
// 모든 페이지 래퍼에 적용
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

function PageWrapper({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const variants = prefersReducedMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
      }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}
```

### 8.4 애니메이션 비활성화 대상 목록

현재 DESIGN.md의 애니메이션 중 `prefers-reduced-motion: reduce` 시 처리 방안:

| 애니메이션 | 감소 모드 동작 | 이유 |
|-----------|---------------|------|
| 히어로 배경 그라디언트 메시 | 정적 그라디언트 | 전정 자극 유발 가능 |
| 히어로 파티클 | 숨김 | 불필요한 시각 자극 |
| 히어로 타이틀 stagger | 즉시 표시 | 정보 접근 지연 제거 |
| 히어로 CTA 글로우 펄스 | 정적 글로우 | 반복 깜빡임 방지 |
| 히어로 목업 부유 | 정적 위치 | 전정 자극 유발 가능 |
| 페이지 전환 fade | **즉시 전환 (duration: 0)** | 필수 |
| 카드 등장 fade-up | 즉시 표시 | 정보 접근 지연 제거 |
| 카드 호버 translateY | **유지 (매우 짧음, 사용자 트리거)** | 사용자 의도된 상호작용 |
| 출석 체크 애니메이션 | 즉시 체크 표시 | 기능 피드백은 색상으로 |
| 퀴즈 타이머 원형 | **유지 (기능적)** | 정보 전달 목적 |
| 퀴즈 정답 confetti | 숨김 | 과도한 시각 자극 |
| 퀴즈 오답 shake | 색상 변경만 | 전정 자극 방지 |
| 리더보드 순위 이동 | 즉시 이동 | 레이아웃 변경 최소화 |
| 토스트 slide-in | 즉시 표시 | 정보 즉시 접근 |
| 스켈레톤 shimmer | 정적 회색 배경 | 반복 애니메이션 제거 |

### 8.5 앱 내 모션 설정 토글

OS 설정 외에도 앱 내부에서 직접 모션을 제어할 수 있게 합니다:

```tsx
// 설정 페이지에 포함
function MotionPreference() {
  const [reduceMotion, setReduceMotion] = useLocalStorage('reduce-motion', false);

  useEffect(() => {
    if (reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [reduceMotion]);

  return (
    <div className="flex items-center justify-between min-h-[48px]">
      <div>
        <Label htmlFor="reduce-motion" className="text-base font-medium">
          움직임 줄이기
        </Label>
        <p className="text-sm text-muted-foreground">
          화면의 움직이는 효과를 줄여요
        </p>
      </div>
      <Switch
        id="reduce-motion"
        checked={reduceMotion}
        onCheckedChange={setReduceMotion}
        className="scale-125" /* 시니어를 위해 약간 크게 */
      />
    </div>
  );
}
```

```css
/* 앱 내 설정과 OS 설정 모두 지원 */
@media (prefers-reduced-motion: reduce), .reduce-motion {
  /* ... 모든 모션 감소 규칙 ... */
}

/* Tailwind v4에서 사용 가능한 패턴 */
.reduce-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}
```

---

## 9. 키보드 네비게이션 & 포커스 관리

### 9.1 포커스 표시기

키보드 사용자(시니어 중 터치 어려움)를 위한 명확한 포커스 링:

```css
/* 키보드 사용 시에만 포커스 링 표시 */
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* 마우스/터치 사용 시 포커스 링 숨김 */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 9.2 논리적 탭 순서

```tsx
// 모달/다이얼로그에서 포커스 트래핑
// shadcn/ui Dialog는 이를 자동으로 처리하지만,
// 커스텀 UI에서는 반드시 구현 필요

// 대시보드 탭 순서: Header → Main Content → Sidebar → Footer
// 모바일: Header → Main Content → Bottom Nav
```

### 9.3 스킵 네비게이션

```tsx
// layout.tsx 최상단에 추가
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50
             focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2
             focus:rounded-lg focus:text-base"
>
  본문으로 바로가기
</a>

// main 영역
<main id="main-content" tabIndex={-1}>
  {children}
</main>
```

---

## 10. ARIA & 시맨틱 HTML 체크리스트

### 10.1 컴포넌트별 ARIA 요구사항

| 컴포넌트 | 시맨틱 HTML | ARIA | 비고 |
|---------|-------------|------|------|
| 네비게이션 | `<nav>` | `aria-label="메인 메뉴"` | |
| 대시보드 | `<main>` | `aria-label="대시보드"` | |
| 통계 카드 | `<article>` 또는 `<section>` | `aria-label="출석률 통계"` | |
| 프로그레스 바 | `<div role="progressbar">` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label` | |
| 출석 목록 | `<ul>` / `<li>` | `aria-label="출석 체크 목록"` | |
| 출석 버튼 | `<button>` | `aria-pressed="true/false"` | 토글 상태 |
| 퀴즈 선택지 | `<fieldset>` + `<legend>` | `role="radiogroup"`, `aria-label` | |
| 퀴즈 타이머 | `<div>` | `aria-live="polite"`, `aria-label="남은 시간: N초"` | |
| 토스트 | `<div>` | `role="alert"`, `aria-live="assertive"` | |
| 로딩 스켈레톤 | `<div>` | `aria-busy="true"`, `aria-label="불러오는 중"` | |
| 모달 | `<dialog>` | `aria-modal="true"`, `aria-labelledby` | |
| 탭 | `<div role="tablist">` | `role="tab"`, `aria-selected`, `aria-controls` | |
| 리더보드 | `<ol>` | `aria-label="조별 순위"` | 순서 있는 목록 |

### 10.2 동적 콘텐츠 알림

```tsx
// 실시간 업데이트 알림 (리더보드 순위 변동 등)
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {`${teamName}조가 ${newRank}위로 올라갔어요`}
</div>

// 에러 메시지 즉시 알림
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

---

## 11. DESIGN.md 수정 권고 사항 요약

현재 DESIGN.md에 대한 접근성 관점 수정 권고:

### 11.1 타이포그래피 (섹션 3.2)

| 변경 항목 | 현재 값 | 권장 값 | 이유 |
|----------|---------|---------|------|
| `body` 크기 | 14px / 0.875rem | **16px / 1rem** | 시니어 가독성 |
| `body` 행간 | 1.5 | **1.7** | 한글 최적 행간 |
| `body-lg` 행간 | 1.6 | **1.7~1.8** | 한글 본문 최적 |
| `caption` 크기 | 12px | **13px** | 시력 저하 대응 |
| `overline` 크기 | 11px | **12px** | 최소 크기 준수 |
| 하단 네비 레이블 | 10px | **12px** | 최소 크기 준수 |

### 11.2 색상 대비 (섹션 2, 14)

| 변경 항목 | 현재 | 권장 | 이유 |
|----------|------|------|------|
| 보조 텍스트 색상 | Slate 400 (#94A3B8) | **Slate 500 (#64748B)** | AA 대비 미달 |
| 푸터 텍스트 | Slate 400 on Slate 900 | **Slate 300 (#CBD5E1)** | AA 대비 미달 |
| 푸터 브랜드 | Slate 500 on Slate 900 | **Slate 400 (#94A3B8)** | AA 대비 미달 |
| Primary 버튼 | Emerald 500 | 텍스트 on Emerald: White 유지, 링크용은 **Emerald 700** | AA 대비 |

### 11.3 터치 타겟 (섹션 6, 7)

| 변경 항목 | 현재 | 권장 | 이유 |
|----------|------|------|------|
| 사이드바 메뉴 높이 | ~40px (padding 10px) | **48px (padding 14px 16px)** | WCAG 2.5.5 |
| 버튼 최소 높이 | 미지정 | **min-h-[48px]** | 시니어/아동 |
| 체크박스 터치 영역 | 미지정 | **48x48px 터치 영역** | 떨림 대응 |

### 11.4 접근성 섹션 (섹션 14) 확장

현재 8줄의 요약을 본 문서 수준으로 확장하고, 특히 다음 항목을 추가:
- `prefers-reduced-motion` 전체 전략
- 폰트 크기 조절 기능
- 관용적 입력 형식
- ARIA 레이블 체크리스트
- 한국어 UX 라이팅 가이드

---

## 12. 테스트 체크리스트

### 12.1 자동화 테스트

```bash
# axe-core 기반 접근성 자동 검사 (CI에 추가)
pnpm add -D @axe-core/react axe-core

# Lighthouse CI
pnpm add -D @lhci/cli
```

```tsx
// 개발 환경에서 axe-core 자동 실행
// app/layout.tsx (개발 시에만)
if (process.env.NODE_ENV === 'development') {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

### 12.2 수동 테스트 체크리스트

- [ ] 브라우저 글꼴 크기 200% 확대 시 콘텐츠 겹침/잘림 없음
- [ ] 키보드만으로 모든 기능 사용 가능 (Tab, Enter, Space, Esc)
- [ ] 포커스 순서가 시각적 순서와 일치
- [ ] 모든 이미지에 alt 텍스트
- [ ] 색상 없이도(흑백) 모든 정보 이해 가능
- [ ] 모바일에서 세로/가로 방향 모두 사용 가능
- [ ] 느린 네트워크(3G)에서 로딩 상태 표시됨
- [ ] 오프라인 시 안내 메시지 표시됨
- [ ] 실제 60대 사용자 테스트 (교회 봉사자 2~3명)
- [ ] 실제 초등학생 사용자 테스트 (2~3명)

### 12.3 크로스 브라우저 테스트 우선순위

대상 사용자의 예상 브라우저 분포:

| 브라우저 | 우선순위 | 비고 |
|---------|---------|------|
| Chrome Mobile (Android) | 최우선 | 한국 시장 점유율 1위 |
| Safari Mobile (iOS) | 최우선 | iPhone 사용자 |
| Samsung Internet | 높음 | 삼성 기본 브라우저 (시니어 다수 사용) |
| Chrome Desktop | 보통 | 관리자 사용 |
| Naver Whale | 낮음 | 일부 사용자 |

---

## 참고 자료

- [WCAG 2.2 전문](https://w3c.github.io/wcag/guidelines/22/)
- [WCAG 2.2 Target Size Minimum (2.5.8)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [WCAG 2.2 Contrast Minimum (1.4.3)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [W3C Cognitive Accessibility - Forgiving Input Formats](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o4p08-input-formats/)
- [prefers-reduced-motion (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
- [Accessible Animations in React (Josh Comeau)](https://www.joshwcomeau.com/react/prefers-reduced-motion/)
- [prefers-reduced-motion React Hook (Josh Comeau)](https://www.joshwcomeau.com/snippets/react-hooks/use-prefers-reduced-motion/)
- [UI Design for Older Adults (Toptal)](https://www.toptal.com/designers/ui/ui-design-for-older-adults)
- [Age-Inclusive Design for Web Interfaces (LogRocket)](https://blog.logrocket.com/ux-design/age-inclusive-design-web-interfaces/)
- [Progressive Disclosure (NN/g)](https://www.nngroup.com/articles/progressive-disclosure/)
- [Colorblind-Friendly Palettes (Venngage)](https://venngage.com/blog/color-blind-friendly-palette/)
- [Target Size Cheatsheet (Smashing Magazine)](https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/)
- [Samsung UX Writing Guide](https://design.samsung.com/kr/contents/ux-writing/)
- [CJK Typesetting Best Practices](https://www.typotheque.com/articles/typesetting-cjk-text)
- [Using Rems for Font Size](https://www.aleksandrhovhannisyan.com/blog/use-rems-for-font-size/)
- [WCAG 2.2 ISO Standard (2025)](https://adaquickscan.com/blog/wcag-2-2-iso-standard-2025)
- [Font Size Requirements Guide (WCAG 2.1)](https://font-converters.com/accessibility/font-size-requirements)
- [Accessible Form Validation (UXPin)](https://www.uxpin.com/studio/blog/accessible-form-validation-best-practices/)
- [InclusiveColors - WCAG Palette Creator](https://www.inclusivecolors.com/)
