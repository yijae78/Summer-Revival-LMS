# REALTIME-UX-PATTERNS.md
# 실시간 인터랙티브 UX 패턴 가이드

> **작성일**: 2026-03-13
> **기술 스택**: Next.js 15 + React 19 + Framer Motion 12 + Tailwind CSS v4 + Supabase Realtime
> **참조**: DESIGN.md, TRD.md, PRD.md

---

## 1. 라이브 퀴즈 UX (Kahoot 스타일)

### 1.1 카운트다운 타이머

**패턴**: SVG 원형 타이머 + 숫자 카운트다운

```tsx
// 원형 타이머 (SVG stroke-dasharray 애니메이션)
// 전체 원 둘레 = 2πr = 2 * π * 45 ≈ 283
const CIRCUMFERENCE = 2 * Math.PI * 45

// Framer Motion으로 stroke-dashoffset 애니메이션
<motion.circle
  cx="50" cy="50" r="45"
  stroke="currentColor"
  strokeWidth="6"
  fill="none"
  strokeDasharray={CIRCUMFERENCE}
  initial={{ strokeDashoffset: 0 }}
  animate={{ strokeDashoffset: CIRCUMFERENCE }}
  transition={{ duration: timeLimit, ease: "linear" }}
/>
```

**타이밍/이징 권장**:
- 타이머 진행: `linear` (정확한 시간 표현)
- 숫자 카운트다운: `ease-out` (자연스러운 숫자 전환)
- 5초 이하 남았을 때 색상 전환: `#EF4444` (destructive 색상)
- 5초 이하 경고: 숫자에 `scale` 펄스 애니메이션 추가

```tsx
// 긴급도 표현 (5초 이하)
<motion.span
  animate={timeLeft <= 5 ? {
    scale: [1, 1.3, 1],
    color: ['#EF4444', '#DC2626', '#EF4444']
  } : {}}
  transition={{ duration: 0.5, repeat: Infinity }}
>
  {timeLeft}
</motion.span>
```

**접근성**: `aria-live="assertive"` + `aria-label={`${timeLeft}초 남음`}`

### 1.2 답안 선택 애니메이션

**패턴**: 탭 → 선택 확인 → 정답 공개 → 결과 피드백

```
[미선택 상태]
bg: white/10, backdrop-blur
hover: scale(1.02), bg: white/15
transition: 150ms ease-out

[선택 시]
scale(0.97) → scale(1.0)    // 클릭 피드백, 100ms spring
border: 2px solid white      // 선택 표시
bg: white/20                 // 강조

[정답 공개 - 맞았을 때]
bg: emerald-500/30           // 초록 배경 fade-in, 300ms
border: 2px solid #10B981    // 초록 테두리
✓ 체크마크 SVG path draw     // 300ms linear

[정답 공개 - 틀렸을 때]
bg: red-500/30               // 빨간 배경 fade-in, 300ms
border: 2px solid #EF4444    // 빨간 테두리
shake: x → [-4, 4, -4, 4, 0] // 300ms ease
```

```tsx
// 답안 선택 Framer Motion
const answerVariants = {
  idle: { scale: 1, borderColor: 'transparent' },
  selected: {
    scale: [0.97, 1.0],
    borderColor: '#FFFFFF',
    transition: { type: 'spring', stiffness: 400, damping: 15 }
  },
  correct: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: '#10B981',
    transition: { duration: 0.3 }
  },
  incorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: '#EF4444',
    x: [0, -4, 4, -4, 4, 0],
    transition: { duration: 0.3, ease: 'easeOut' }
  }
}
```

### 1.3 결과 공개 패턴

**시퀀스** (각 단계 사이 지연):
1. 선택지 비활성화 (0ms)
2. 오답 선택지 어둡게 (300ms)
3. 정답 하이라이트 (300ms 후)
4. 정답 → confetti (600ms 후, 정답인 경우)
5. 점수 표시 (800ms 후)
6. 1.5초 대기 → 다음 문제 전환

```tsx
// 결과 공개 타임라인
const revealSequence = async () => {
  setPhase('locked')           // 0ms: 선택 불가
  await delay(300)
  setPhase('dimIncorrect')     // 300ms: 오답 어둡게
  await delay(300)
  setPhase('highlightCorrect') // 600ms: 정답 하이라이트
  if (isCorrect) {
    triggerConfetti()          // 정답이면 confetti
  }
  await delay(200)
  setPhase('showPoints')       // 800ms: 점수 표시
  await delay(1500)
  goToNextQuestion()           // 2300ms: 다음 문제
}
```

### 1.4 리더보드 공개 애니메이션

**퀴즈 중간/종료 후 리더보드 표시 패턴**:

```
[등장 애니메이션]
1. 배경 어둡게 (overlay fade-in, 200ms)
2. 리더보드 카드 scale(0.9, 1.0) + fade-in (300ms spring)
3. 순위 항목 stagger 등장 (50ms 간격, 아래에서 위로)
4. 숫자(점수) 카운트업 (500ms easeOut)
5. 1위 항목에 금색 glow 효과

[순위 변동 시]
- Framer Motion layout 애니메이션
- 위로 올라가는 항목: 초록색 화살표 fade-in
- 아래로 내려가는 항목: 빨간색 화살표 fade-in
- transition: { type: 'spring', stiffness: 200, damping: 25 }
```

### 1.5 청중 응답 시각화

**실시간 응답률 바 차트 패턴**:

```tsx
// 각 선택지의 응답 비율 바
<motion.div
  className="h-8 rounded-full bg-primary"
  initial={{ width: 0 }}
  animate={{ width: `${percentage}%` }}
  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
/>

// 실시간으로 바가 늘어나는 효과
// Supabase Realtime으로 응답 수 구독 → percentage 업데이트
```

---

## 2. 실시간 출석 UX

### 2.1 체크인 확인 애니메이션

**패턴**: 탭 → 체크마크 draw → 진동 → 상태 변경

```tsx
// 체크마크 SVG path draw 애니메이션
<motion.path
  d="M5 13l4 4L19 7"
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  transition={{ duration: 0.2, ease: 'linear' }}
  stroke="#10B981"
  strokeWidth={2.5}
  fill="none"
/>

// 체크 시 햅틱 피드백 (모바일)
if ('vibrate' in navigator) {
  navigator.vibrate(50) // 50ms 진동
}
```

**카드 상태 전환**:
```
[미체크]
bg: white
border-left: 3px transparent
→ 출석 버튼 표시 (primary, rounded-lg)

[체크 완료] (200ms transition)
bg: emerald-50 (bg-primary/5)
border-left: 3px solid emerald-500
→ ✅ 출석 표시 + 시간 텍스트
→ 체크마크 draw 애니메이션 200ms
→ 진동 50ms (모바일)
```

### 2.2 실시간 출석 카운터

**패턴**: 숫자 롤링 + 프로그레스 바 동시 애니메이션

```tsx
// react-slot-counter 또는 커스텀 카운트업
// 새로운 출석 체크 시 숫자가 slot-machine 방식으로 변경

// 프로그레스 바
<motion.div
  className="h-1.5 rounded-full bg-primary"
  animate={{ width: `${(checkedCount / totalCount) * 100}%` }}
  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
/>

// 상단 텍스트: "10/12 (83%)" → 숫자만 animate
```

**Supabase Realtime 연동**:
```tsx
// 출석 테이블 변경 구독
supabase
  .channel('attendance-live')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'attendance',
    filter: `schedule_id=eq.${scheduleId}`
  }, (payload) => {
    // TanStack Query 캐시 무효화 → UI 자동 업데이트
    queryClient.invalidateQueries({ queryKey: ['attendance', scheduleId] })
  })
  .subscribe()
```

### 2.3 교사용 일괄 출석 체크 UI

**패턴**: 조원 목록 + 전체 선택 + 스와이프 제스처

```
┌────────────────────────────────────┐
│ ← 출석 체크          [전체 출석]   │  전체 출석 버튼:
│ 1일차 · 아침집회                   │  탭 시 모든 미체크 학생 일괄 체크
├────────────────────────────────────┤  → confetti 효과 (전원 출석 시)
│                                    │
│ ┌─ 사랑조 ──────── 10/12 (83%) ─┐ │  조별 섹션 헤더
│ │ ━━━━━━━━━━━━━━━━━━░░░░       │ │  프로그레스 바
│ └──────────────────────────────┘ │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ [JM] 김민준        ✅ 출석   │   │  체크 완료 상태
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │ [SA] 최수아        [출석]    │   │  미체크 상태
│ └──────────────────────────────┘   │
│                                    │
│ ← 스와이프: 지각 │ 사유 →         │  Framer Motion drag 제스처
│                                    │
│ ┌──────────────────────────────┐   │
│ │        [ 제출하기 ]          │   │  Optimistic update 적용
│ └──────────────────────────────┘   │
└────────────────────────────────────┘
```

**스와이프 제스처 (지각/사유 처리)**:
```tsx
<motion.div
  drag="x"
  dragConstraints={{ left: -100, right: 100 }}
  onDragEnd={(_, info) => {
    if (info.offset.x < -50) setStatus('late')    // 왼쪽: 지각
    if (info.offset.x > 50) setStatus('excused')   // 오른쪽: 사유
  }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
```

---

## 3. 라이브 리더보드 UX

### 3.1 순위 변동 애니메이션

**핵심 기술**: Framer Motion `layout` 애니메이션

```tsx
// 리더보드 아이템
<AnimatePresence>
  {sortedGroups.map((group, index) => (
    <motion.div
      key={group.id}
      layout                    // 위치 변경 자동 애니메이션
      layoutId={group.id}       // 고유 식별
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        layout: {
          type: 'spring',
          stiffness: 200,       // 적당한 탄성
          damping: 25,          // 오버슈트 억제
          mass: 0.8             // 가벼운 느낌
        },
        opacity: { duration: 0.2 }
      }}
    >
      <LeaderboardItem group={group} rank={index + 1} />
    </motion.div>
  ))}
</AnimatePresence>
```

**순위 변동 인디케이터**:
```tsx
// 순위 변화 화살표
{rankChange > 0 && (
  <motion.span
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-emerald-500 text-xs font-semibold"
  >
    ▲ {rankChange}
  </motion.span>
)}
{rankChange < 0 && (
  <motion.span
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-red-500 text-xs font-semibold"
  >
    ▼ {Math.abs(rankChange)}
  </motion.span>
)}
```

### 3.2 포인트 증가 시각화

**패턴**: 숫자 카운트업 + 플로팅 "+점수" 텍스트

```tsx
// 포인트 카운트업 (Geist Mono 폰트)
<motion.span
  key={points}                   // 값 변경 시 재마운트
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  className="font-mono text-2xl font-bold tabular-nums"
>
  {points.toLocaleString()} pt
</motion.span>

// 플로팅 포인트 텍스트 (추가된 점수 표시)
<motion.div
  initial={{ opacity: 1, y: 0 }}
  animate={{ opacity: 0, y: -30 }}
  transition={{ duration: 1.2, ease: 'easeOut' }}
  className="absolute text-emerald-500 font-bold text-sm"
>
  +{addedPoints}
</motion.div>
```

### 3.3 1위~3위 특별 처리

```
1위: border-2 border-amber-400 + ring-glow amber + scale(1.02)
     🥇 아이콘 + bg-amber-50

2위: border border-slate-300 + bg-slate-50
     🥈 아이콘

3위: border border-amber-700/30 + bg-amber-50/50
     🥉 아이콘

4위~: 심플 리스트 형태, border-b border-slate-100
```

### 3.4 실시간 구독 (Supabase Realtime)

```tsx
// points 테이블 변경 감지 → 리더보드 갱신
useEffect(() => {
  const channel = supabase
    .channel('leaderboard')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'points',
      filter: `event_id=eq.${eventId}`
    }, () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard', eventId] })
    })
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [eventId])
```

---

## 4. 실시간 알림(Toast) UX

### 4.1 라이브러리 선택: Sonner

**선정 이유**:
- shadcn/ui 공식 toast 컴포넌트로 채택
- 2-3KB 압축 크기
- 스태킹 애니메이션이 내장
- TypeScript-first 설계
- swipe dismiss 지원

### 4.2 포지셔닝 전략

```
데스크톱: 우측 하단 (bottom-right)
  → AI 챗봇 위젯(right: 24px, bottom: 24px)과 겹치지 않도록
  → toast 위치: right: 24px, bottom: 96px (챗봇 버튼 위)

모바일: 상단 중앙 (top-center)
  → 하단 네비게이션(h: 64px)과 충돌 방지
  → 엄지 영역에서 벗어나 실수 터치 방지
```

### 4.3 스태킹 규칙

```
최대 4개 동시 표시
  → 5개째부터는 가장 오래된 것 자동 dismiss
  → 새 toast 등장 시 기존 toast 위로 밀림 (gap: 8px)
  → Sonner 기본 스태킹 애니메이션 사용

연속 알림 시:
  → 300ms 딜레이 후 다음 toast 표시 (연속 등장 시 사용자 과부하 방지)
  → 동일 유형 알림은 카운트 합산 ("출석 3건 완료" 형태)
```

### 4.4 자동 dismiss 타이밍

```
Success (성공): 3000ms (짧은 확인만 필요)
  예: "출석이 완료되었습니다"

Info (정보): 4000ms
  예: "새로운 공지가 등록되었습니다"

Warning (경고): 5000ms (주의 필요)
  예: "네트워크 연결이 불안정합니다"

Error (오류): 자동 dismiss 없음 (수동 닫기)
  예: "출석 저장에 실패했습니다. 다시 시도해주세요"
  → action 버튼 포함: "다시 시도"

Loading (로딩): 작업 완료까지 유지
  예: toast.promise(submitAttendance(), {
    loading: '출석 저장 중...',
    success: '출석이 완료되었습니다',
    error: '출석 저장에 실패했습니다'
  })
```

### 4.5 우선순위 레벨

```
Critical (긴급):  z-index 최상위, 진동 피드백, auto-dismiss 없음
  예: "퀴즈가 시작되었습니다!", "일정이 변경되었습니다"
  → 빨간 좌측 바 + 진동 패턴 [100, 50, 100]

High (높음): 기본 위치, 사운드 없음
  예: "출석 시간입니다", "새 공지"

Normal (보통): 기본 동작
  예: "저장되었습니다", "업로드 완료"

Low (낮음): 묶음 처리 가능
  예: "포인트 +10", "순위 변동"
```

### 4.6 Toast 애니메이션

```tsx
// Sonner 기본 설정 (globals.css가 아닌 컴포넌트에서)
<Toaster
  position="bottom-right"       // 데스크톱
  toastOptions={{
    duration: 4000,
    className: 'rounded-xl shadow-xl',
  }}
  richColors                    // semantic 색상 자동 적용
  closeButton                   // 닫기 버튼
  expand={false}                // 스태킹 모드
/>

// 등장: 우측에서 slide-in (Sonner 내장)
// 퇴장: 우측으로 swipe 또는 fade-out
// 타이밍: 등장 300ms [0.4, 0, 0.2, 1], 퇴장 200ms
```

---

## 5. Optimistic UI 업데이트

### 5.1 React 19 useOptimistic 패턴

```tsx
// 출석 체크 Optimistic Update
import { useOptimistic } from 'react'
import { useActionState } from 'react'

function AttendanceChecker({ participants, scheduleId }) {
  const [optimisticRecords, addOptimistic] = useOptimistic(
    participants,
    (currentList, updatedId: string) =>
      currentList.map(p =>
        p.id === updatedId ? { ...p, status: 'present' } : p
      )
  )

  async function handleCheck(participantId: string) {
    // 1. 즉시 UI 업데이트 (optimistic)
    addOptimistic(participantId)

    // 2. 서버에 전송
    const result = await checkAttendance(scheduleId, participantId, 'present')

    // 3. 실패 시 자동 롤백 (useOptimistic이 처리)
    if (result.error) {
      toast.error(result.error)
    }
  }
}
```

### 5.2 TanStack Query Optimistic Update

```tsx
// 포인트 추가 Optimistic Update
const addPointsMutation = useMutation({
  mutationFn: addPoints,
  onMutate: async (newPoints) => {
    // 기존 쿼리 취소 (충돌 방지)
    await queryClient.cancelQueries({ queryKey: ['leaderboard', eventId] })

    // 이전 데이터 스냅샷
    const previousData = queryClient.getQueryData(['leaderboard', eventId])

    // Optimistic 업데이트
    queryClient.setQueryData(['leaderboard', eventId], (old) =>
      old.map(group =>
        group.id === newPoints.groupId
          ? { ...group, totalPoints: group.totalPoints + newPoints.amount }
          : group
      ).sort((a, b) => b.totalPoints - a.totalPoints)
    )

    return { previousData }
  },
  onError: (err, newPoints, context) => {
    // 실패 시 롤백
    queryClient.setQueryData(['leaderboard', eventId], context.previousData)
    toast.error('포인트 저장에 실패했습니다')
  },
  onSettled: () => {
    // 성공/실패 모두 서버 데이터로 재검증
    queryClient.invalidateQueries({ queryKey: ['leaderboard', eventId] })
  }
})
```

### 5.3 실패 시 롤백 UX

```
[Optimistic 성공 흐름]
1. 사용자 액션 → 즉시 UI 반영 (0ms)
2. 서버 요청 (백그라운드)
3. 서버 확인 → 조용히 완료 (toast 불필요)

[Optimistic 실패 흐름]
1. 사용자 액션 → 즉시 UI 반영 (0ms)
2. 서버 요청 실패
3. UI 롤백 (300ms fade transition)
4. 오류 toast 표시 + "다시 시도" 버튼
5. 실패한 항목에 빨간 점선 border (시각적 표시)
```

```tsx
// 롤백 시 시각 피드백
<motion.div
  animate={isRolledBack ? {
    borderColor: '#EF4444',
    borderStyle: 'dashed',
    opacity: [1, 0.5, 1],
  } : {}}
  transition={{ duration: 0.3 }}
/>
```

### 5.4 네트워크 상태 표시

```tsx
// 오프라인 감지 배너 (PWA 환경)
const isOnline = useOnlineStatus()

{!isOnline && (
  <motion.div
    initial={{ y: -48 }}
    animate={{ y: 0 }}
    exit={{ y: -48 }}
    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    className="fixed top-0 inset-x-0 z-50 bg-amber-500 text-white text-center py-2 text-sm"
  >
    오프라인 상태입니다. 연결 복구 시 자동으로 동기화됩니다.
  </motion.div>
)}
```

---

## 6. 협업 기능 UX

### 6.1 실시간 접속 표시 (Presence)

**적용 위치**: 출석 체크 화면, 퀴즈 대기실

```tsx
// Supabase Presence를 사용한 실시간 접속자 표시
const channel = supabase.channel('quiz-room', {
  config: { presence: { key: participantId } }
})

channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState()
  setOnlineUsers(Object.keys(state).length)
})

channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await channel.track({
      name: participant.name,
      avatarColor: participant.avatarColor,
      joinedAt: new Date().toISOString()
    })
  }
})
```

**UI 패턴**:
```
접속자 아바타 스택 (최대 5개 표시):
┌──────────────────────────────┐
│ 🟢 12명 접속 중               │
│ [JM][SY][SA][EJ][+8]         │  아바타 overlap: -8px
│                              │  각 아바타: 28x28, ring-2 ring-white
│                              │  +N 뱃지: bg-slate-200, text-xs
└──────────────────────────────┘

새 접속자 등장: scale(0) → scale(1), 200ms spring
퇴장: scale(1) → scale(0), 150ms ease-in
```

### 6.2 동시 편집 표시 (출석 체크)

여러 교사가 동시에 출석을 체크하는 경우:

```
[다른 교사가 체크 중인 항목]
border-left: 3px solid blue-400 (파란색)
"김교사님이 편집 중" 라벨 (text-xs, text-blue-500)
해당 행 약간 비활성화 (opacity: 0.7)

[충돌 방지]
→ last-write-wins 전략 (Supabase upsert)
→ 충돌 시 toast: "다른 교사가 이미 체크했습니다"
→ 서버 데이터로 자동 갱신
```

### 6.3 퀴즈 대기실 Presence

```
┌────────────────────────────────────┐
│          성경 퀴즈 대회             │
│          Q 준비 중...              │
│                                    │
│  🟢 참가자 42명 / 50명 접속 중     │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ [아바타들이 점점 채워지는     │  │  실시간으로 아바타 등장
│  │  그리드 or 원형 배치]         │  │  stagger: 100ms
│  │                              │  │  scale spring
│  └──────────────────────────────┘  │
│                                    │
│  대기 중... 관리자가 시작합니다    │
│  ● ● ● (로딩 dots 애니메이션)    │
│                                    │
└────────────────────────────────────┘
```

---

## 7. 카운트다운/타이머 UX

### 7.1 이벤트 D-Day 카운트다운

**적용 위치**: 대시보드 D-Day 배너 (liquid-glass 카드)

```tsx
// D-Day 카운트다운 (일/시/분/초)
<div className="flex gap-4">
  {[
    { value: days, label: '일' },
    { value: hours, label: '시간' },
    { value: minutes, label: '분' },
    { value: seconds, label: '초' },
  ].map(({ value, label }) => (
    <div key={label} className="text-center">
      <motion.div
        key={value}                    // 값 변경 시 재마운트
        initial={{ rotateX: -90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        exit={{ rotateX: 90, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="font-mono text-3xl font-bold tabular-nums"
      >
        {String(value).padStart(2, '0')}
      </motion.div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  ))}
</div>
```

**flip-clock 효과 (CSS)**:
```css
/* 플립 시계 스타일 카운트다운 카드 */
.flip-card {
  perspective: 300px;
  background: var(--card);
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* rotateX 변환으로 위에서 아래로 플립 */
```

### 7.2 퀴즈 세션 타이머

```
[전체 진행률 바 (상단)]
━━━━━━━━━━━━━━━░░░░░░  문제 3/10
height: 3px
bg: primary → 진행에 따라 scaleX 증가
transition: width 300ms ease-out

[문제별 원형 타이머]
○ SVG circle, stroke-dasharray 애니메이션
○ 중앙에 남은 초 표시 (font-mono, bold)
○ 색상 단계:
  15초~6초: primary (emerald)
  5초~3초: amber-500 (경고)
  2초~0초: red-500 (위험) + scale 펄스

[5초 이하 긴급 패턴]
- 타이머 숫자 scale 펄스: [1, 1.2, 1] 매초
- 배경 미세한 빨간 flash
- 선택적: 긴장감 사운드 효과 (음소거 가능)
```

### 7.3 세션 시간 표시

현재 진행 중인 세션의 남은 시간:

```tsx
// 타임라인 뷰의 현재 세션 표시
<div className="relative">
  {/* NOW 뱃지: primary 색, 깜빡임 */}
  <motion.span
    animate={{ opacity: [1, 0.4, 1] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full"
  >
    NOW
  </motion.span>

  {/* 프로그레스 바: 세션 경과 시간 */}
  <div className="h-1 bg-slate-100 rounded-full mt-2">
    <motion.div
      className="h-full bg-primary rounded-full"
      animate={{ width: `${sessionProgress}%` }}
      transition={{ duration: 1, ease: 'linear' }}
    />
  </div>
</div>
```

---

## 8. 축하/게이미피케이션 UX

### 8.1 Confetti 효과

**라이브러리**: `react-confetti-explosion` (CSS 기반, canvas 불필요, 가벼움)

```tsx
import { ConfettiExplosion } from 'react-confetti-explosion'

// 트리거 조건:
// - 퀴즈 정답
// - 전원 출석 달성
// - 1위 달성
// - 포인트 마일스톤 도달 (500, 1000, 2000pt)

{showConfetti && (
  <ConfettiExplosion
    force={0.6}           // 폭발 강도 (0-1)
    duration={2500}       // 지속 시간 ms
    particleCount={80}    // 파티클 수 (모바일: 40)
    width={400}           // 퍼짐 범위 px
    colors={['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6']}
  />
)}
```

**사용 원칙**:
- 과도한 사용 금지 (사용자가 면역될 수 있음)
- 진정한 성취 순간에만 사용
- `prefers-reduced-motion: reduce` 시 비활성화
- 모바일에서 파티클 수 50% 줄임 (성능)

### 8.2 성취 배지 시스템

**배지 유형**:
```
출석 배지:
  🌅 "개근상" - 모든 세션 출석
  ⏰ "얼리버드" - 매번 정시 출석

퀴즈 배지:
  🧠 "퀴즈왕" - 퀴즈 1위
  ✅ "전문가" - 5문제 연속 정답
  ⚡ "번개" - 3초 내 정답

포인트 배지:
  ⭐ "500점 달성"
  ⭐⭐ "1,000점 달성"
  ⭐⭐⭐ "2,000점 달성"

활동 배지:
  🤝 "팀플레이어" - 조별 활동 모두 참여
  📸 "포토그래퍼" - 사진 5장 이상 업로드
```

**배지 획득 애니메이션**:
```tsx
// 배지 획득 모달
<motion.div
  initial={{ scale: 0, rotate: -180 }}
  animate={{ scale: 1, rotate: 0 }}
  transition={{
    type: 'spring',
    stiffness: 260,
    damping: 20,
    duration: 0.6
  }}
>
  {/* 배지 아이콘 */}
  <motion.div
    animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
    transition={{ delay: 0.6, duration: 0.5 }}
  >
    🏆
  </motion.div>

  {/* 텍스트 fade-in */}
  <motion.p
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.8, duration: 0.3 }}
  >
    축하합니다! "퀴즈왕" 배지를 획득했습니다!
  </motion.p>
</motion.div>

{/* confetti 동시 발사 */}
```

### 8.3 포인트 애니메이션

```tsx
// 포인트 획득 시 플로팅 텍스트
<AnimatePresence>
  {pointAnimations.map((anim) => (
    <motion.div
      key={anim.id}
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -60, scale: 1.5 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="absolute text-primary font-bold text-lg pointer-events-none"
    >
      +{anim.points}pt
    </motion.div>
  ))}
</AnimatePresence>
```

### 8.4 연속 기록(Streak) 표시

```tsx
// 출석 연속 기록
<div className="flex items-center gap-2">
  <motion.div
    animate={{ scale: [1, 1.1, 1] }}
    transition={{ duration: 1.5, repeat: Infinity }}
    className="text-amber-500"
  >
    🔥
  </motion.div>
  <span className="font-semibold">{streakDays}일 연속 출석!</span>

  {/* 연속 기록 바 */}
  <div className="flex gap-1">
    {Array.from({ length: totalDays }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: i * 0.1, type: 'spring', stiffness: 500 }}
        className={cn(
          'w-3 h-3 rounded-full',
          i < streakDays ? 'bg-amber-500' : 'bg-slate-200'
        )}
      />
    ))}
  </div>
</div>
```

### 8.5 프로그레스 바

```tsx
// 조별 포인트 프로그레스 바 (목표 대비)
<div className="space-y-1">
  <div className="flex justify-between text-xs">
    <span>사랑조</span>
    <span className="font-mono">{points}/{targetPoints}pt</span>
  </div>
  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
    <motion.div
      className="h-full rounded-full"
      style={{
        background: 'linear-gradient(90deg, #10B981, #34D399)'
      }}
      initial={{ width: 0 }}
      animate={{ width: `${Math.min((points / targetPoints) * 100, 100)}%` }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    />
  </div>
</div>

// 100% 도달 시:
// → 프로그레스 바 glow 효과
// → confetti burst
// → "목표 달성!" toast
```

### 8.6 레벨업 효과

```tsx
// 레벨업 시 전체화면 오버레이
<AnimatePresence>
  {showLevelUp && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: [0, 1.2, 1], rotate: [−45, 10, 0] }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center"
      >
        {/* 별 효과 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="text-6xl"
        >
          ⭐
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold text-white mt-4"
        >
          레벨 업!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-amber-400 font-mono text-lg"
        >
          Lv.{level - 1} → Lv.{level}
        </motion.p>
      </motion.div>

      <ConfettiExplosion />
    </motion.div>
  )}
</AnimatePresence>
```

---

## 9. 애니메이션 타이밍/이징 표준

### 9.1 Framer Motion 표준 설정

```typescript
// lib/animations.ts - 프로젝트 전체 애니메이션 상수

// === 이징 함수 ===
export const EASING = {
  // Material Design 3 표준 이징
  standard: [0.4, 0, 0.2, 1] as const,       // 대부분의 UI 전환
  decelerate: [0, 0, 0.2, 1] as const,       // 등장 애니메이션 (화면에 들어올 때)
  accelerate: [0.4, 0, 1, 1] as const,       // 퇴장 애니메이션 (화면에서 나갈 때)

  // 커스텀 이징
  bounce: [0.68, -0.55, 0.265, 1.55] as const, // 바운스 효과
  smooth: [0.25, 0.1, 0.25, 1] as const,       // 부드러운 전환
} as const

// === Spring 프리셋 ===
export const SPRING = {
  // 부드러운 (카드 호버, 페이지 전환)
  gentle: { type: 'spring', stiffness: 120, damping: 14 } as const,

  // 표준 (리더보드 순위 변동, 리스트 재정렬)
  default: { type: 'spring', stiffness: 200, damping: 25 } as const,

  // 반응적 (버튼 클릭, 선택 피드백)
  responsive: { type: 'spring', stiffness: 400, damping: 15 } as const,

  // 탄성 (배지 획득, 축하 효과)
  bouncy: { type: 'spring', stiffness: 260, damping: 20 } as const,

  // 빠른 (체크마크, 토글)
  snappy: { type: 'spring', stiffness: 500, damping: 30 } as const,
} as const

// === Duration 프리셋 (ms) ===
export const DURATION = {
  instant: 0.1,     // 100ms - 토글, 체크박스
  fast: 0.15,       // 150ms - 호버 피드백
  normal: 0.25,     // 250ms - 페이지 전환, 카드 등장
  slow: 0.4,        // 400ms - 리더보드 순위 변동
  slower: 0.6,      // 600ms - 모달 등장
  deliberate: 0.8,  // 800ms - 카운트업 숫자
} as const

// === Stagger 프리셋 ===
export const STAGGER = {
  fast: 0.03,       // 30ms  - 글자별 타이핑 효과
  normal: 0.05,     // 50ms  - 리스트 아이템 등장
  slow: 0.1,        // 100ms - 카드 등장
  deliberate: 0.15, // 150ms - 섹션별 등장
} as const
```

### 9.2 CSS 애니메이션 표준

```css
/* globals.css에 정의할 CSS 애니메이션 변수 */

/* Transition 표준 */
:root {
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Keyframe 애니메이션 */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

@keyframes count-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

/* 접근성: 모션 감소 설정 시 모든 애니메이션 비활성화 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 9.3 애니메이션 사용 가이드라인

```
[성능 최적화]
✅ transform, opacity만 애니메이션 (GPU 가속, compositing만 발생)
❌ width, height, margin, padding 애니메이션 (layout reflow 발생)
❌ box-shadow 애니메이션 (paint 발생, filter: drop-shadow 대안)

[CSS vs Framer Motion 선택 기준]
CSS Scroll-Driven:
  → 스크롤 트리거 등장 효과 (fade-up, reveal)
  → 스크롤 프로그레스 바
  → 패럴랙스 효과
  → JS 불필요, GPU 가속 최적

Framer Motion:
  → 사용자 인터랙션 기반 (클릭, 드래그)
  → 레이아웃 애니메이션 (리스트 재정렬, 리더보드)
  → AnimatePresence (조건부 등장/퇴장)
  → 제스처 (drag, swipe, pinch)
  → 복잡한 시퀀스 (퀴즈 결과 공개)

CSS @keyframes:
  → 반복 루프 (shimmer, pulse, bounce)
  → 단순 호버 효과
  → 로딩 인디케이터

[Spring vs Tween 선택 기준]
Spring (물리 기반):
  → 위치 이동 (x, y, layout)
  → 크기 변환 (scale)
  → 제스처 응답
  → 자연스러운 물리적 움직임이 필요한 곳

Tween (시간 기반):
  → opacity 전환
  → 색상 변경
  → 정확한 타이밍이 필요한 곳 (타이머)
  → 시퀀스 애니메이션
```

---

## 10. 이 프로젝트 적용 요약

### 10.1 기능별 애니메이션 매핑

| 기능 | 패턴 | 라이브러리 | Spring/Duration |
|------|------|-----------|-----------------|
| 퀴즈 타이머 | SVG circle stroke | Framer Motion | linear, per-second |
| 퀴즈 답 선택 | scale + border | Framer Motion | spring: responsive |
| 퀴즈 정답 | confetti + fade | react-confetti-explosion | 2500ms |
| 퀴즈 오답 | shake + red flash | Framer Motion | 300ms ease |
| 출석 체크 | checkmark draw | Framer Motion | 200ms linear |
| 출석 카운터 | 숫자 roll + bar | CSS + Framer Motion | 500ms easeOut |
| 리더보드 순위 | layout animation | Framer Motion | spring: default |
| 리더보드 점수 | count-up + float | Framer Motion | 500ms easeOut |
| Toast 등장 | slide-in-right | Sonner (내장) | 300ms [0.4,0,0.2,1] |
| Toast 퇴장 | fade-out / swipe | Sonner (내장) | 200ms |
| D-Day 카운트 | flip-clock rotate | Framer Motion | 300ms easeOut |
| 배지 획득 | scale + rotate | Framer Motion | spring: bouncy |
| 포인트 획득 | float-up + fade | Framer Motion | 1200ms easeOut |
| Streak 표시 | dot stagger scale | Framer Motion | spring: snappy, stagger: 100ms |
| 프로그레스 바 | width grow | Framer Motion | 800ms [0.4,0,0.2,1] |
| 페이지 전환 | fade + slide-y | Framer Motion | 250ms [0.4,0,0.2,1] |
| 카드 호버 | translateY + shadow | CSS | 200ms ease |
| 스켈레톤 로딩 | shimmer gradient | CSS @keyframes | 1.5s loop |
| 스크롤 등장 | fade-up | CSS Scroll-Driven | view() timeline |
| 오프라인 배너 | slide-down | Framer Motion | 300ms [0.4,0,0.2,1] |
| NOW 뱃지 | opacity pulse | Framer Motion | 2s easeInOut loop |

### 10.2 추천 npm 패키지

```json
{
  "dependencies": {
    "motion": "^12.x",                        // Framer Motion (이름 변경됨)
    "sonner": "^2.x",                         // Toast 알림
    "react-confetti-explosion": "^2.x",       // Confetti 효과 (CSS 기반, 가벼움)
    "react-slot-counter": "^3.x"              // 숫자 슬롯머신 애니메이션 (선택)
  }
}
```

### 10.3 Supabase Realtime 채널 설계 (200 커넥션 제한 주의)

```
채널 전략: 기능별 단일 채널 + 필터링

1. attendance-{scheduleId}
   → 출석 변경 감지
   → 교사 화면에서만 구독

2. leaderboard-{eventId}
   → points 테이블 INSERT 감지
   → 대시보드/리더보드 페이지에서만 구독

3. quiz-{quizId}
   → 퀴즈 상태 변경 (시작/종료/다음 문제)
   → Presence: 참가자 접속 현황
   → 200명 제한: 동시 퀴즈 참가자 최대 ~180명 (여유 20)

4. announcements-{eventId}
   → 새 공지 INSERT 감지
   → 전체 사용자 구독

페이지 이탈 시 반드시 채널 해제 (useEffect cleanup)
불필요한 채널 중복 구독 방지
```

---

## 참고 자료

### 연구에 참조한 자료

**Framer Motion / Animation**:
- [Motion (Framer Motion) 공식 문서](https://motion.dev/docs/react)
- [Motion React Animation Guide](https://motion.dev/docs/react-animation)
- [Layout Animation Guide - Maxime Heckel](https://blog.maximeheckel.com/posts/framer-motion-layout-animations/)
- [AnimatePresence - Motion](https://motion.dev/docs/react-animate-presence)
- [React Transitions - Motion](https://motion.dev/docs/react-transitions)
- [Framer Motion + Tailwind 2025 Stack](https://dev.to/manukumar07/framer-motion-tailwind-the-2025-animation-stack-1801)
- [Framer Motion Complete Guide 2026](https://inhaq.com/blog/framer-motion-complete-guide-react-nextjs-developers)
- [Web Animation Performance Tier List](https://motion.dev/magazine/web-animation-performance-tier-list)
- [Spring Animation Physics](https://blog.maximeheckel.com/posts/the-physics-behind-spring-animations/)

**Toast / Notification**:
- [Toast Notification Best Practices - LogRocket](https://blog.logrocket.com/ux-design/toast-notifications/)
- [React Toast Libraries Compared 2025 - LogRocket](https://blog.logrocket.com/react-toast-libraries-compared-2025/)
- [Sonner - GitHub](https://github.com/emilkowalski/sonner)
- [Building a Toast Component - Emil Kowalski](https://emilkowal.ski/ui/building-a-toast-component)
- [Notification Pattern - Carbon Design System](https://carbondesignsystem.com/patterns/notification-pattern/)
- [Toast Notifications UX - UX Files](https://benrajalu.net/articles/ui-of-notification-toasts)

**Optimistic UI**:
- [useOptimistic - React Official Docs](https://react.dev/reference/react/useOptimistic)
- [useOptimistic Hook Guide - FreeCodeCamp](https://www.freecodecamp.org/news/how-to-use-the-optimistic-ui-pattern-with-the-useoptimistic-hook-in-react/)
- [Optimistic Updates - TanStack Query](https://tanstack.com/query/v4/docs/framework/react/guides/optimistic-updates)
- [React 19 useOptimistic Deep Dive](https://dev.to/a1guy/react-19-useoptimistic-deep-dive-building-instant-resilient-and-user-friendly-uis-49fp)

**Collaborative / Presence**:
- [Collaborative UX Best Practices - Ably](https://ably.com/blog/collaborative-ux-best-practices)
- [Presence Indicators - SuperViz](https://dev.to/superviz/how-to-use-presence-indicators-like-live-cursors-to-enhance-user-experience-38jn)
- [Awareness & Presence - Yjs Docs](https://docs.yjs.dev/getting-started/adding-awareness)
- [Collaborative Presence Features - Flexum](https://flexum.io/features/collaborative-presence-features)

**Gamification / Celebration**:
- [Gamification in Web Design - PixelFree Studio](https://blog.pixelfreestudio.com/how-to-use-micro-interactions-for-gamification-in-web-design/)
- [Confetti Effects with JavaScript - OpenReplay](https://blog.openreplay.com/adding-confetti-effects-javascript-fun-walkthrough/)
- [Over-Confetti-ing of Digital Experiences - UX Collective](https://uxdesign.cc/the-over-confetti-ing-of-digital-experiences-af523745db19)
- [react-confetti-explosion - npm](https://www.npmjs.com/package/react-confetti-explosion)
- [Gamification Trends 2025 - StudioKrew](https://studiokrew.com/blog/app-gamification-strategies-2025/)

**CSS / Easing**:
- [Easing Functions Cheat Sheet](https://easings.net/)
- [Springs and Bounces in Native CSS - Josh W. Comeau](https://www.joshwcomeau.com/animation/linear-timing-function/)
- [CSS/JS Animation Trends 2026 - WebPeak](https://webpeak.org/blog/css-js-animation-trends/)
- [Framer Blog: Animation Techniques for UX](https://www.framer.com/blog/website-animation-examples/)

**Counter / Timer**:
- [react-countup - npm](https://www.npmjs.com/package/react-countup)
- [react-slot-counter - npm](https://www.npmjs.com/package/react-slot-counter)
- [Countdown Timer Widget Guide 2026 - Embeddable](https://embeddable.co/blog/how-to-build-countdown-timer-for-your-website)
