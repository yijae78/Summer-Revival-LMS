# KOREAN-UX.md
# 한국형 UX 컨벤션 & 패턴 가이드

> **버전**: v1.0
> **작성일**: 2026-03-13
> **대상**: FLOWING — 여름행사 Learning Management System
> **참고**: 이 문서는 한국 사용자 (초등생~60대 교역자/봉사자)를 위한 UX 패턴을 정리합니다.

---

## 1. 한국형 폼 패턴

### 1.1 전화번호 입력 (010-XXXX-XXXX)

한국 휴대폰 번호는 010으로 시작하며, 총 11자리입니다.
구형 번호 (011, 016, 017, 018, 019)도 드물게 존재합니다.

**포맷**: `010-XXXX-XXXX` (하이픈 자동 삽입)

```tsx
// Zod 스키마
const phoneSchema = z
  .string()
  .regex(
    /^(010|011|016|017|018|019)-\d{3,4}-\d{4}$/,
    '올바른 전화번호 형식이 아니에요'
  )

// 자동 하이픈 삽입 함수
function formatPhoneNumber(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
}

// React Hook Form + 자동 포맷
<input
  type="tel"
  inputMode="numeric"     // 모바일에서 숫자 키패드 표시
  placeholder="010-0000-0000"
  maxLength={13}           // 010-0000-0000 = 13자
  onChange={(e) => {
    const formatted = formatPhoneNumber(e.target.value)
    field.onChange(formatted)
  }}
/>
```

**UX 규칙**:
- `inputMode="numeric"` 필수 (모바일에서 숫자 키패드 호출)
- 하이픈은 자동 삽입, 사용자가 직접 입력할 필요 없음
- placeholder에 `010-0000-0000` 표시
- 검증 실패 시: "올바른 전화번호를 입력해 주세요"
- 비상연락처도 동일 포맷 적용

### 1.2 이름 입력

한국인 이름은 대부분 2~5글자 (성 포함).
외국인/다문화 가정 참가자를 고려하여 영문도 허용.

```tsx
const nameSchema = z
  .string()
  .min(2, '이름은 2글자 이상이에요')
  .max(20, '이름은 20글자 이하로 입력해 주세요')
  .regex(
    /^[가-힣a-zA-Z\s]+$/,
    '한글 또는 영문만 입력할 수 있어요'
  )

<input
  type="text"
  placeholder="이름을 입력하세요"
  autoComplete="name"
/>
```

**UX 규칙**:
- 성/이름 분리 불필요 (교회 행사 맥락에서는 풀네임 한 필드)
- max 20자로 여유 있게 설정 (외국인 이름 대응)
- 아바타 이니셜: 이름의 마지막 2글자 사용 (예: "김민준" -> "민준")

### 1.3 생년월일 입력

**권장 방식**: 3개 드롭다운(셀렉트) 조합 > 텍스트 입력 > 캘린더 피커

한국에서는 YYYY.MM.DD 또는 YYYY-MM-DD 형식을 사용합니다.
생년월일 입력 시 캘린더 피커보다 **연도/월/일 드롭다운** 또는 **직접 입력**이 더 빠릅니다.
(생년월일은 과거 날짜이므로 캘린더를 수십 년 뒤로 스크롤하는 UX가 불편)

```tsx
// 추천: 3개 셀렉트 조합
<div className="flex gap-2">
  <Select placeholder="년도">
    {/* 2020 ~ 1950 역순 */}
  </Select>
  <Select placeholder="월">
    {/* 1 ~ 12 */}
  </Select>
  <Select placeholder="일">
    {/* 1 ~ 31 (월에 따라 동적) */}
  </Select>
</div>

// 또는 직접 입력
<input
  type="text"
  inputMode="numeric"
  placeholder="2010.01.15"
  maxLength={10}
/>
```

**UX 규칙**:
- 연도 선택: 최근 연도를 기본 표시 (학생 대상이므로 2010~2018 범위 먼저)
- 날짜 표시 포맷: `YYYY.MM.DD` (한국 표준)
- "만 나이" 자동 계산 표시 (한국은 2023년부터 만 나이 통일)
- Zod 검증: 미래 날짜 방지, 합리적 연도 범위 체크

### 1.4 주소 입력

한국 주소 체계는 **도로명주소**가 표준입니다.
행정안전부의 도로명주소 API (juso.go.kr)를 사용합니다.

```
주소 입력 플로우:
1. [주소 검색] 버튼 클릭
2. 주소 검색 모달/팝업 열림
3. 도로명 또는 지번으로 검색
4. 검색 결과에서 선택
5. 상세주소 (동/호수) 직접 입력
```

```tsx
// 주소 입력 UI
<div className="space-y-2">
  <div className="flex gap-2">
    <input
      readOnly
      placeholder="주소를 검색하세요"
      value={address}
      className="flex-1"
    />
    <Button onClick={openAddressSearch}>
      주소 검색
    </Button>
  </div>
  <input
    placeholder="상세주소 (동, 호수 등)"
    value={detailAddress}
    onChange={handleDetailChange}
  />
</div>
```

**API 연동** (juso.go.kr):
- 팝업 API: `https://business.juso.go.kr/addrlink/addrLinkUrl.do`
- 검색 API: `https://business.juso.go.kr/addrlink/addrLinkApi.do`
- API 키 신청: `https://business.juso.go.kr/addrlink/openApi/apiReqst.do`
- 무료, 별도 신청 필요

> **참고**: 이 앱에서는 교회 주소를 입력받는 경우가 드물므로 (수련원 주소 등),
> 단순 텍스트 입력으로도 충분할 수 있습니다. 주소 검색 API는 P2 우선순위.

### 1.5 학년 선택

교회 교육부서 기준 학년 체계:

```tsx
const gradeOptions = [
  { label: '유치부', value: 'preschool' },
  { label: '유년부 (초1~3)', value: 'elementary-lower' },
  { label: '초등부 (초4~6)', value: 'elementary-upper' },
  { label: '중등부 (중1~3)', value: 'middle-school' },
  { label: '고등부 (고1~3)', value: 'high-school' },
  { label: '청년부', value: 'young-adult' },
  { label: '봉사자/교사', value: 'staff' },
]

// 세부 학년 (부서 선택 후 표시)
const detailGradeOptions = {
  'elementary-lower': ['초1', '초2', '초3'],
  'elementary-upper': ['초4', '초5', '초6'],
  'middle-school': ['중1', '중2', '중3'],
  'high-school': ['고1', '고2', '고3'],
}
```

---

## 2. 카카오 스타일 UI 패턴

한국 사용자의 95% 이상이 카카오톡을 사용하므로, 익숙한 UI 패턴을 참고합니다.

### 2.1 채팅 버블 스타일

카카오톡 스타일 채팅 버블 (AI 채팅 위젯에 적용):

```css
/* 상대방 (AI) 메시지 - 왼쪽 정렬 */
.bubble-incoming {
  background-color: #ffffff;
  color: #1e293b;              /* Slate 800 */
  border-radius: 4px 16px 16px 16px;  /* 좌상단만 각진 형태 */
  padding: 10px 14px;
  max-width: 280px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  font-size: 14px;
  line-height: 1.5;
  word-break: keep-all;        /* 한국어 단어 단위 줄바꿈 */
}

/* 내 메시지 - 오른쪽 정렬 */
.bubble-outgoing {
  background-color: var(--primary);  /* Emerald 500 */
  color: #ffffff;
  border-radius: 16px 4px 16px 16px;  /* 우상단만 각진 형태 */
  padding: 10px 14px;
  max-width: 280px;
  font-size: 14px;
  line-height: 1.5;
  word-break: keep-all;
}

/* 시간 표시 (버블 하단) */
.bubble-time {
  font-size: 11px;
  color: #94a3b8;              /* Slate 400 */
  margin-top: 4px;
}
```

**카카오톡 차별점**:
- 카카오톡: 내 메시지 = 노란색 (#FEE500), 상대방 = 흰색
- 우리 앱: 내 메시지 = Primary (Emerald), AI 메시지 = 흰색
- `word-break: keep-all` 필수 (한국어는 단어 단위 줄바꿈이 자연스러움)
- 시간 표시: 버블 옆 또는 하단에 "오후 3:42" 형식

### 2.2 읽음 확인 패턴

카카오톡에서 사용자가 매우 익숙한 패턴:

```
읽음 확인 표시:
  ✓  = 전송 완료 (서버 도달)
  ✓✓ = 읽음 (상대방 확인)

  또는 숫자 표시: 읽지 않은 사람 수
  "1" = 1명이 아직 안 읽음
  숫자 없음 = 모두 읽음
```

공지사항에 적용 가능:
- 공지 제목 옆에 "읽지 않음" 뱃지
- 읽은 후 뱃지 제거
- 관리자 화면: "12명 중 8명 읽음" 표시

### 2.3 친구 목록 스타일 (참가자/조원 목록)

카카오톡 친구 목록 패턴을 참가자 목록에 적용:

```
┌────────────────────────────────────────┐
│  ┌──────────────────────────────────┐  │
│  │  프로필 영역 (내 정보)            │  │
│  │  ┌──┐  김민준                    │  │
│  │  │  │  사랑조 · 중등 2학년        │  │
│  │  └──┘  "지금 활동 중"            │  │
│  └──────────────────────────────────┘  │
│                                        │
│  조원 8명                              │  ← 카운트 표시
│  ────────────────────────────────────  │
│  ┌──┐  이서연         📞             │  ← 전화 아이콘
│  └──┘  초등 6학년                     │
│                                        │
│  ┌──┐  박지호         📞             │
│  └──┘  중등 1학년                     │
│                                        │
│  ┌──┐  최수아         📞             │
│  └──┘  초등 5학년                     │
│                                        │
└────────────────────────────────────────┘

아바타: 40x40px, rounded-full
이름: 15px, font-weight 600
부가정보: 13px, Slate 400
리스트 아이템 높이: 64px
구분선: 1px Slate 100
```

### 2.4 공유 패턴

카카오톡 공유하기는 한국에서 가장 보편적인 공유 방식:

```tsx
// 카카오 공유 SDK (참가 신청 URL 공유)
// Kakao.Share.sendDefault()
const shareConfig = {
  objectType: 'feed',
  content: {
    title: '2026 여름수련회 참가 신청',
    description: '○○교회 중고등부 여름수련회에 참가 신청하세요!',
    imageUrl: 'https://...',
    link: {
      webUrl: registrationUrl,
      mobileWebUrl: registrationUrl,
    },
  },
  buttons: [
    {
      title: '신청하기',
      link: {
        webUrl: registrationUrl,
        mobileWebUrl: registrationUrl,
      },
    },
  ],
}

// 공유 버튼 순서 (한국 사용자 우선순위)
// 1. 카카오톡 공유
// 2. 링크 복사
// 3. QR 코드
```

---

## 3. 한국형 알림 컨벤션

### 3.1 인앱 알림 패턴

```
알림 드롭다운:
┌────────────────────────────────────────┐
│  알림                    [모두 읽음]    │
│  ────────────────────────────────────  │
│                                        │
│  🔴 긴급 공지가 등록되었어요           │  ← 빨간 점 = 안 읽음
│     일정이 변경되었습니다               │
│     3분 전                             │
│                                        │
│  ● 사랑조 출석이 완료되었어요          │  ← 파란 점 = 일반
│     10/12명 출석                        │
│     1시간 전                           │
│                                        │
│     퀴즈 대회가 곧 시작됩니다          │  ← 점 없음 = 읽음
│     오후 2시 본당                       │
│     어제                               │
│                                        │
└────────────────────────────────────────┘
```

### 3.2 뱃지 패턴

```
알림 뱃지 규칙:
- 1~99: 숫자 그대로 표시
- 100+: "99+" 표시
- 빨간색 원 (#EF4444), 흰색 숫자
- 크기: min-width 20px, height 20px
- 위치: 아이콘 우상단 (-4px, -4px 오프셋)
- 폰트: 11px, font-weight 700

CSS:
.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #EF4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;  /* 배경과 분리 */
}
```

### 3.3 PWA 푸시 알림 메시지 톤

```
긴급 공지:
  제목: "📢 긴급 공지"
  본문: "일정이 변경되었어요. 확인해 주세요."

일정 알림:
  제목: "⏰ 곧 시작해요"
  본문: "아침 집회가 10분 후 시작돼요."

출석 리마인더:
  제목: "✅ 출석 체크"
  본문: "아침 집회 출석 체크를 해주세요."

퀴즈 시작:
  제목: "❓ 퀴즈 대회"
  본문: "성경 퀴즈 대회가 시작되었어요!"
```

**톤 규칙**:
- 해요체 사용 (존댓말이면서 부담 없는 톤)
- 짧고 명확하게 (2줄 이내)
- 이모지는 제목에만 1개 사용 (본문은 텍스트만)

---

## 4. 한국어 날짜/시간 표시

### 4.1 상대 시간 표시 (Relative Time)

사용자에게 친숙한 상대 시간 표현:

```typescript
// date-fns 한국어 로케일 사용
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

formatDistanceToNow(date, { addSuffix: true, locale: ko })
// => "3분 전", "1시간 전", "2일 전"

// 커스텀 상대 시간 함수 (더 자연스러운 한국어)
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHour < 24) return `${diffHour}시간 전`
  if (diffDay === 1) return '어제'
  if (diffDay === 2) return '그저께'
  if (diffDay < 7) return `${diffDay}일 전`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}주 전`

  // 30일 이상: 절대 날짜 표시
  return formatDate(date)
}
```

### 4.2 날짜 포맷 규칙

```typescript
// 한국 표준 날짜 포맷
const dateFormats = {
  full:      '2026년 7월 15일 (화)',     // 요일 포함
  standard:  '2026.07.15',              // 점(.) 구분 (한국 관습)
  short:     '7월 15일',                 // 월/일만
  monthDay:  '7/15',                    // 숫자만
  yearMonth: '2026년 7월',              // 연/월
  time12:    '오후 3:42',               // 12시간제 (오전/오후)
  time24:    '15:42',                   // 24시간제
  dateTime:  '7월 15일 오후 3:42',       // 날짜+시간
}

// date-fns 포맷 패턴 (ko 로케일)
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

format(date, 'yyyy년 M월 d일 (eee)', { locale: ko })  // 2026년 7월 15일 (화)
format(date, 'yyyy.MM.dd', { locale: ko })             // 2026.07.15
format(date, 'M월 d일', { locale: ko })                // 7월 15일
format(date, 'a h:mm', { locale: ko })                 // 오후 3:42
```

### 4.3 시간 표시 상세

```
오늘 표시:
  같은 날: "오후 3:42" (시간만)
  어제:    "어제"
  이번 주: "수요일" (요일)
  올해:    "7월 15일"
  작년~:   "2025.07.15"

일정 시간:
  "오전 9:00 ~ 오전 10:30"  (12시간제, 오전/오후 표기)
  "09:00 ~ 10:30"           (24시간제 - 간략)

D-day:
  "D-7"   (행사 7일 전)
  "D-Day" (당일)
  "D+1"   (행사 시작 후)
  "Day 2/3" (3일 중 2일차)
```

### 4.4 달력 고려사항

- 한국은 일요일 시작 달력이 일반적 (교회 맥락에서는 특히)
- `startOfWeek: 0` (0 = Sunday)
- 공휴일 표시: 빨간색 (일요일, 공휴일)
- 토요일: 파란색 (관습적)

---

## 5. 한국어 검색/필터 UX

### 5.1 초성 검색 (Cho-sung Search)

한국 사용자에게 매우 익숙한 검색 방식.
참가자 이름 검색에 필수적입니다.

```
초성 검색 예시:
  "ㄱㅁㅈ" → "김민준" 매칭
  "ㅂㅈㅎ" → "박지호" 매칭
  "ㅎㄱ"  → "한글", "홍길동" 매칭
  "사"    → "사랑조" (부분 매칭도 지원)
```

**추천 라이브러리**: `es-hangul` (Toss에서 개발한 한글 처리 라이브러리)

```bash
pnpm add es-hangul
```

```typescript
import { getChoseong, disassembleHangul } from 'es-hangul'

// 초성 추출
getChoseong('김민준')  // => 'ㄱㅁㅈ'
getChoseong('사랑조')  // => 'ㅅㄹㅈ'

// 초성 검색 함수
function chosungSearch(query: string, target: string): boolean {
  // 입력값이 모두 초성인지 확인
  const isAllChoseong = /^[ㄱ-ㅎ]+$/.test(query)

  if (isAllChoseong) {
    const targetChoseong = getChoseong(target)
    return targetChoseong.includes(query)
  }

  // 일반 검색 (부분 매칭)
  return target.toLowerCase().includes(query.toLowerCase())
}

// 사용 예시
const participants = ['김민준', '이서연', '박지호', '최수아']
const query = 'ㄱㅁ'
const results = participants.filter(name => chosungSearch(query, name))
// => ['김민준']
```

### 5.2 검색 자동완성

```
┌────────────────────────────────────────┐
│  🔍 ㄱㅁ                        [✕]   │  입력 중
│  ────────────────────────────────────  │
│                                        │
│  참가자                                │  카테고리 헤더
│  ┌──┐  김민준  중등 2학년 · 사랑조     │
│  └──┘                                  │
│  ┌──┐  김민서  초등 5학년 · 믿음조     │
│  └──┘                                  │
│                                        │
│  조                                    │
│  👥  감사조  (8명)                     │
│                                        │
└────────────────────────────────────────┘

규칙:
- 최소 1글자부터 검색 시작 (한글 특성상 1글자도 유의미)
- 초성 검색 자동 감지
- 카테고리별 그룹핑 (참가자, 조, 일정 등)
- 최근 검색어 표시 (검색창 포커스 시)
- 디바운스: 200ms (한글 조합 중 입력 고려)
```

### 5.3 필터 태그 패턴

```
┌────────────────────────────────────────┐
│  필터                          [초기화] │
│                                        │
│  부서:  [전체] [중등부] [고등부]        │  ← 토글 버튼 그룹
│                                        │
│  조:    [전체] [사랑] [믿음] [소망]...  │  ← 가로 스크롤
│                                        │
│  상태:  [전체] [출석] [결석] [지각]     │
│                                        │
│  적용된 필터:                           │
│  ┌──────┐ ┌──────┐                     │
│  │중등부 ✕│ │사랑조 ✕│                   │  ← 제거 가능한 칩
│  └──────┘ └──────┘                     │
│                                        │
│  12명 검색됨                           │
└────────────────────────────────────────┘

규칙:
- 필터 칩은 bg-primary/10, text-primary, rounded-full
- 제거 버튼(✕) 포함
- [초기화] 버튼으로 전체 필터 리셋
- 필터 결과 카운트 실시간 표시
- 모바일: 바텀 시트로 필터 옵션 표시
```

---

## 6. 온보딩 패턴 (BYOS 설정 위자드)

### 6.1 단계별 위자드 구조

한국 사용자가 익숙한 스텝 진행 패턴:

```
┌────────────────────────────────────────┐
│                                        │
│  Supabase 연결 설정                    │
│                                        │
│  ● ─── ○ ─── ○ ─── ○                  │  스텝 인디케이터
│  가입    프로젝트  연결    완료          │  (원형, 라인 연결)
│                                        │
│  ┌────────────────────────────────────┐│
│  │                                    ││
│  │  1단계: Supabase 가입하기           ││  단계 번호 + 제목
│  │                                    ││
│  │  ┌──────────────────────────────┐  ││
│  │  │                              │  ││
│  │  │  [스크린샷 이미지]             │  ││  시각 가이드
│  │  │  가입 화면 예시                │  ││
│  │  │                              │  ││
│  │  └──────────────────────────────┘  ││
│  │                                    ││
│  │  1. supabase.com에 접속하세요       ││  번호 매긴 단계별 설명
│  │  2. [Start your project] 클릭      ││
│  │  3. GitHub 계정으로 가입           ││
│  │                                    ││
│  │  💡 GitHub 계정이 없으시면         ││  도움말 팁
│  │     이메일로도 가입할 수 있어요     ││
│  │                                    ││
│  └────────────────────────────────────┘│
│                                        │
│        [이전]            [다음 단계]    │
│                                        │
│  도움이 필요하신가요?                   │
│  [AI 도우미에게 물어보기]               │
│                                        │
└────────────────────────────────────────┘
```

### 6.2 스텝 인디케이터 스타일

```css
/* 활성 스텝 */
.step-active {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary);      /* Emerald 500 */
  color: white;
  font-weight: 700;
  font-size: 14px;
}

/* 완료 스텝 */
.step-completed {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  /* 체크마크 아이콘 표시 */
}

/* 미완료 스텝 */
.step-pending {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;            /* Slate 200 */
  color: #94a3b8;                 /* Slate 400 */
}

/* 연결 라인 */
.step-line {
  height: 2px;
  flex: 1;
  background: #e2e8f0;            /* 미완료 */
}
.step-line-completed {
  background: var(--primary);      /* 완료 */
}
```

### 6.3 도움말 툴팁

```
인라인 도움말:
  💡 아이콘 + 연한 배경(primary/5) 박스
  텍스트: 14px, Slate 600
  border-left: 3px solid primary

팝오버 도움말:
  [?] 아이콘 클릭/호버 시 말풍선 표시
  최대 너비: 280px
  화살표 방향: 아이콘 위치 기준

진행률 표시:
  "2/4 단계" 텍스트 + 프로그레스 바
  프로그레스 바: h-2, rounded-full, bg-primary
```

### 6.4 한국어 온보딩 문구 예시

```
환영 화면:
  "환영해요! 🎉"
  "교회 여름행사를 쉽게 관리할 수 있도록 도와드릴게요."
  "설정은 5분이면 충분해요."

진행 중:
  "거의 다 됐어요! 조금만 더 힘내주세요."
  "이 단계만 완료하면 바로 사용할 수 있어요."

완료:
  "설정이 완료되었어요! 🎊"
  "이제 행사를 만들어 볼까요?"

오류 시:
  "연결에 실패했어요. 😢"
  "URL과 키를 다시 확인해 주세요."
  "그래도 안 되면 AI 도우미에게 물어보세요."
```

---

## 7. 소셜 로그인 UX

### 7.1 카카오 로그인 버튼 (공식 가이드라인)

**출처**: [Kakao Developers 디자인 가이드](https://developers.kakao.com/docs/latest/ko/kakaologin/design-guide)

```
필수 규격:
  컨테이너 색상: #FEE500 (카카오 노란색)
  심볼 색상:    #000000 (검정)
  레이블 색상:  #000000 85% 불투명도
  폰트 크기:   16px (웹 기준)
  코너 반경:   12px
  심볼:        카카오 말풍선 아이콘 (변형 금지)

레이블 옵션:
  완성형: "카카오 로그인"
  축약형: "카카오로 시작하기"
```

```tsx
// 카카오 로그인 버튼 구현
<button
  className={cn(
    'flex items-center justify-center gap-2',
    'w-full h-12 rounded-xl',
    'bg-[#FEE500] text-[#000000]/85',
    'font-medium text-base',
    'hover:bg-[#FDD835] active:scale-[0.98]',
    'transition-all duration-150'
  )}
>
  <KakaoSymbol className="w-5 h-5" />  {/* 공식 말풍선 심볼 */}
  카카오 로그인
</button>
```

**금지 사항**:
- 심볼의 형태, 비율, 색상 변경 금지
- 카카오톡 아이콘, 카카오 CI를 심볼 대신 사용 금지
- 심볼 없이 버튼 구성 금지
- 버튼을 흑백으로 변환하여 다른 버튼 대비 약화 금지

### 7.2 구글 로그인 버튼

```tsx
<button
  className={cn(
    'flex items-center justify-center gap-2',
    'w-full h-12 rounded-xl',
    'bg-white text-slate-700',
    'border border-slate-300',
    'font-medium text-base',
    'hover:bg-slate-50 active:scale-[0.98]',
    'transition-all duration-150'
  )}
>
  <GoogleLogo className="w-5 h-5" />
  Google로 로그인
</button>
```

### 7.3 소셜 로그인 버튼 배치 순서

한국 서비스에서의 우선순위 (시장 점유율 기반):

```
┌────────────────────────────────────────┐
│                                        │
│  로그인                                │
│                                        │
│  ┌────────────────────────────────────┐│
│  │  🟡  카카오 로그인                  ││  1순위 (카카오: 한국 95%+)
│  └────────────────────────────────────┘│
│                                        │
│  ┌────────────────────────────────────┐│
│  │  🔵  Google로 로그인               ││  2순위 (구글)
│  └────────────────────────────────────┘│
│                                        │
│  ── 또는 ──────────────────────────── │
│                                        │
│  ┌──────────────────────────┐         │
│  │  🔑 PIN으로 입장          │         │  간편 입장 (참가자용)
│  └──────────────────────────┘         │
│                                        │
└────────────────────────────────────────┘

배치 규칙:
1. 카카오 로그인 → 최상단, 가장 눈에 띄게
2. Google 로그인 → 차선
3. PIN 입장     → 구분선 아래 (참가자 전용 간편 접근)

네이버 로그인은 이 앱에서 불필요 (Supabase Auth에서 카카오+구글 지원).
```

### 7.4 Supabase + 카카오 로그인 연동

```typescript
// Supabase에서 카카오 로그인
import { getSupabaseClient } from '@/lib/supabase/client'

async function signInWithKakao() {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
}
```

---

## 8. 토스트/알림 메시지 컨벤션

### 8.1 해요체 원칙

한국 앱의 표준 톤인 **해요체**를 사용합니다.
토스(Toss)의 UX Writing 원칙을 참고합니다.

```
해요체 사용 규칙:
  ✅ "저장되었어요"         (○ 해요체)
  ❌ "저장되었습니다"       (✕ 합�다체 - 너무 딱딱)
  ❌ "저장됨"              (✕ 체언 종결 - 너무 건조)
  ❌ "저장했어"             (✕ 반말 - 부적절)

  ✅ "출석 체크가 완료되었어요"
  ❌ "출석 체크가 완료되었습니다"

  ✅ "입력한 정보를 확인해 주세요"
  ❌ "입력한 정보를 확인하십시오"
```

> **교회 맥락 특이사항**: 일반 앱보다 약간 높은 존칭 레벨이 필요할 수 있음.
> 교역자(목사님, 전도사님) 대상 메시지는 "~되었습니다"도 가능.
> 기본은 해요체로 통일하되, 공식 안내문에 한해 합쇼체 허용.

### 8.2 토스트 메시지 패턴

```typescript
// 성공 메시지
const successMessages = {
  save:       '저장되었어요',
  delete:     '삭제되었어요',
  attendance: '출석 체크가 완료되었어요',
  register:   '참가 신청이 완료되었어요',
  copy:       '복사되었어요',
  upload:     '업로드가 완료되었어요',
  send:       '전송되었어요',
  update:     '수정되었어요',
}

// 오류 메시지
const errorMessages = {
  network:    '네트워크 연결을 확인해 주세요',
  save:       '저장에 실패했어요. 다시 시도해 주세요',
  auth:       '로그인이 필요해요',
  permission: '접근 권한이 없어요',
  notFound:   '요청한 정보를 찾을 수 없어요',
  validation: '입력한 정보를 확인해 주세요',
  server:     '잠시 문제가 생겼어요. 잠시 후 다시 시도해 주세요',
  upload:     '파일 업로드에 실패했어요',
  duplicate:  '이미 등록된 정보예요',
}

// 확인 메시지 (삭제 등 위험한 동작)
const confirmMessages = {
  delete:     '정말 삭제할까요? 되돌릴 수 없어요.',
  leave:      '변경사항이 저장되지 않았어요. 나갈까요?',
  reset:      '초기화하면 모든 내용이 지워져요. 계속할까요?',
  submit:     '제출하면 수정할 수 없어요. 제출할까요?',
}

// 정보 메시지
const infoMessages = {
  offline:    '오프라인 상태예요. 일부 기능이 제한될 수 있어요.',
  updating:   '업데이트 중이에요. 잠시만 기다려 주세요.',
  autoSave:   '자동 저장되었어요',
}
```

### 8.3 UX Writing 원칙 (토스 참고)

```
1. 한 문장에 하나의 메시지만 담기
   ✅ "출석 체크가 완료되었어요"
   ❌ "출석 체크가 완료되었으며, 결과는 대시보드에서 확인할 수 있습니다"

2. 능동형 문장 사용하기
   ✅ "사진을 업로드하세요"
   ❌ "사진이 업로드되어야 합니다"

3. 긍정형으로 안내하기
   ✅ "2글자 이상 입력해 주세요"
   ❌ "2글자 미만은 입력할 수 없어요"

4. 핵심에 집중하기
   ✅ "저장되었어요"
   ❌ "입력하신 모든 데이터가 성공적으로 저장 처리되었어요"

5. 사용자 탓하지 않기
   ✅ "전화번호 형식을 확인해 주세요"
   ❌ "잘못된 전화번호를 입력했어요"

6. 이모지 사용 규칙
   - 토스트 메시지: 이모지 사용 안 함 (아이콘으로 대체)
   - 공지사항 제목: 1개 허용 (예: "📢 일정 변경 안내")
   - 빈 상태(Empty State): 1개 허용 (예: "📝 아직 공지가 없어요")
   - PWA 푸시 알림: 제목에 1개 허용
   - 버튼/레이블: 이모지 사용 안 함
```

### 8.4 폼 검증 메시지

```typescript
// Zod 스키마 한국어 메시지
const participantSchema = z.object({
  name: z
    .string()
    .min(2, '이름은 2글자 이상이에요')
    .max(20, '이름은 20글자 이하로 입력해 주세요'),

  phone: z
    .string()
    .regex(/^010-\d{4}-\d{4}$/, '올바른 전화번호 형식이 아니에요'),

  birthDate: z
    .string()
    .regex(/^\d{4}\.\d{2}\.\d{2}$/, '생년월일은 YYYY.MM.DD 형식이에요'),

  email: z
    .string()
    .email('올바른 이메일 주소를 입력해 주세요')
    .optional(),

  grade: z
    .string()
    .min(1, '학년을 선택해 주세요'),

  emergencyContact: z
    .string()
    .regex(/^01[016789]-\d{3,4}-\d{4}$/, '비상연락처를 확인해 주세요'),
})
```

### 8.5 빈 상태(Empty State) 메시지

```
참가자 없음:
  "아직 등록된 참가자가 없어요"
  "참가 신청 링크를 공유해 보세요"
  [참가 신청 링크 복사]

공지 없음:
  "📝 아직 공지가 없어요"
  "첫 공지를 작성해 보세요"
  [공지 작성하기]

검색 결과 없음:
  "검색 결과가 없어요"
  "다른 검색어로 다시 시도해 보세요"

오프라인:
  "인터넷 연결이 끊어졌어요"
  "연결이 복구되면 자동으로 동기화돼요"
```

---

## 9. 추가 한국형 UX 디테일

### 9.1 word-break 처리

한국어 텍스트에서 단어 단위 줄바꿈은 필수:

```css
/* 한국어 텍스트 기본 스타일 */
body {
  word-break: keep-all;       /* 한국어 단어 단위 줄바꿈 */
  overflow-wrap: break-word;  /* 긴 URL 등은 강제 줄바꿈 */
}

/* 예외: 좁은 영역 (뱃지, 태그 등) */
.text-break {
  word-break: break-all;      /* 글자 단위 줄바꿈 허용 */
}
```

### 9.2 숫자 포맷

```typescript
// 천 단위 콤마
function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR')
}
// 1234567 => "1,234,567"

// 금액 표시
function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`
}
// 50000 => "50,000원"

// 축약 표시 (큰 숫자)
function formatCompactNumber(num: number): string {
  if (num >= 10000) return `${(num / 10000).toFixed(1)}만`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}천`
  return num.toString()
}
// 15000 => "1.5만"
```

### 9.3 한국어 조사 처리

```typescript
// es-hangul 라이브러리 활용
import { josa } from 'es-hangul'

// 받침 유무에 따른 조사 자동 처리
josa('사랑조', '이/가')   // => "사랑조가"
josa('믿음조', '이/가')   // => "믿음조가"
josa('김민준', '은/는')   // => "김민준은"
josa('이서연', '은/는')   // => "이서연은"
josa('출석', '을/를')     // => "출석을"
josa('퀴즈', '을/를')     // => "퀴즈를"

// 사용 예시 (동적 메시지)
const message = `${josa(groupName, '이/가')} 1위를 차지했어요!`
// "사랑조가 1위를 차지했어요!" 또는 "믿음조가 1위를 차지했어요!"
```

### 9.4 모바일 키보드 최적화

```html
<!-- 전화번호 -->
<input type="tel" inputMode="numeric" />

<!-- 이메일 -->
<input type="email" inputMode="email" />

<!-- 숫자만 (참가비 금액, PIN 등) -->
<input type="text" inputMode="numeric" pattern="[0-9]*" />

<!-- 일반 텍스트 (한국어 입력) -->
<input type="text" inputMode="text" />

<!-- URL 입력 (Supabase URL 등) -->
<input type="url" inputMode="url" />
```

### 9.5 안내문 경어 수준 (교회 맥락)

```
대상별 톤 조절:

학생 참가자 대상:
  "출석 체크 완료! 👏"
  "퀴즈 정답이에요!"
  해요체 + 약간 캐주얼

교사/봉사자 대상:
  "출석 체크가 완료되었어요"
  "3명이 아직 체크되지 않았어요"
  해요체 기본

교역자/관리자 대상:
  "설정이 저장되었어요"
  "총 50명이 등록되었어요"
  해요체 기본

공식 안내 (개인정보 동의 등):
  "개인정보 수집 및 이용에 동의합니다"
  "만 14세 미만은 법정대리인의 동의가 필요합니다"
  합쇼체 (법적 문서)
```

---

## 10. 구현 체크리스트

### 폼 컴포넌트
- [ ] 전화번호 자동 하이픈 입력 (010-XXXX-XXXX)
- [ ] 이름 검증 (한글/영문, 2~20자)
- [ ] 생년월일 드롭다운 (연/월/일)
- [ ] 학년 2단계 선택 (부서 > 세부학년)
- [ ] 모바일 키보드 타입 최적화 (inputMode)

### 검색/필터
- [ ] es-hangul 초성 검색 통합
- [ ] 검색 디바운스 200ms
- [ ] 필터 칩 UI
- [ ] 검색 자동완성

### 날짜/시간
- [ ] date-fns ko 로케일 설정
- [ ] 상대 시간 표시 유틸 함수
- [ ] 날짜 포맷 유틸 함수 (YYYY.MM.DD)
- [ ] 일요일 시작 달력

### 인증/소셜 로그인
- [ ] 카카오 로그인 버튼 (공식 가이드 준수)
- [ ] Google 로그인 버튼
- [ ] PIN 입장 UI
- [ ] 로그인 버튼 순서: 카카오 > Google > PIN

### 메시지/알림
- [ ] 해요체 통일 토스트 메시지
- [ ] 한국어 폼 검증 메시지 (Zod)
- [ ] 빈 상태 메시지
- [ ] 알림 뱃지 (99+ 처리)
- [ ] 읽음/안읽음 상태

### 텍스트 처리
- [ ] word-break: keep-all 전역 적용
- [ ] 숫자 천단위 콤마 유틸
- [ ] 금액 포맷 (원화)
- [ ] 한국어 조사 처리 (es-hangul josa)

### 공유
- [ ] 카카오톡 공유 SDK 연동
- [ ] 링크 복사 기능
- [ ] QR 코드 생성

---

## 참고 리소스

- [Kakao Developers 디자인 가이드](https://developers.kakao.com/docs/latest/ko/kakaologin/design-guide)
- [토스 UX Writing 원칙](https://toss.tech/article/8-writing-principles-of-toss)
- [KRDS 입력폼 가이드](https://www.krds.go.kr/html/site/global/global_08.html)
- [es-hangul (Toss)](https://github.com/toss/es-hangul)
- [도로명주소 API](https://business.juso.go.kr/)
- [date-fns 한국어 로케일](https://github.com/date-fns/date-fns/blob/main/src/locale/ko/snapshot.md)
- [Supabase 카카오 로그인](https://supabase.com/docs/guides/auth/social-login/auth-kakao)
