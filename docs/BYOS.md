# BYOS.md (Bring Your Own Supabase)
# FLOWING - 자체 Supabase 연결 아키텍처

> **버전**: v2.0 (DDL 제약 반영)
> **작성일**: 2026-03-13

---

## 1. 개요

### 1.1 BYOS란?
사용자(교회 관리자)가 **자신의 Supabase 계정/프로젝트**를 생성하고, 앱에 연결하여 사용하는 모델입니다. 앱 제공자(개발자)의 Supabase를 공유하지 않습니다.

### 1.2 이 모델을 선택한 이유
- 앱 제공자에게 **비용 부담 없음**
- 교회별 **데이터 완전 분리** (보안/프라이버시)
- 교회가 자기 데이터의 **소유권**을 가짐
- 무료 티어(50,000 MAU)를 교회 단독으로 사용

### 1.3 사용자가 해야 할 일 (3단계)
```
1. Supabase 가입 (구글 로그인 한 번)
2. 프로젝트 생성 (버튼 한 번)
3. URL + Key 복사 → 앱에 붙여넣기
```
나머지(DB 테이블, 스키마, 권한)는 **앱이 제공하는 SQL 스크립트를 복사-붙여넣기**로 설정합니다.

---

## 2. 아키텍처

### 2.1 전체 흐름

```
┌──────────────────────────────────────────────────────┐
│                   Vercel (프론트엔드)                  │
│                                                      │
│  ┌─────────────┐     ┌──────────────────────────┐   │
│  │ 온보딩 위자드 │────▶│ Supabase 연결 설정 저장   │   │
│  │ (Step 1~5)  │     │ (localStorage + cookie)  │   │
│  └─────────────┘     └──────────┬───────────────┘   │
│                                  │                   │
│  ┌──────────────────────────────▼───────────────┐   │
│  │          동적 Supabase 클라이언트              │   │
│  │   getSupabaseClient() → 저장된 URL/Key 사용   │   │
│  └──────────────────────────────┬───────────────┘   │
└──────────────────────────────────┼───────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │  사용자의 Supabase 프로젝트 │
                    │  (교회 A의 DB)             │
                    │                          │
                    │  PostgreSQL + Auth +      │
                    │  Storage + Realtime       │
                    └──────────────────────────┘
```

### 2.2 앱 인스턴스 : Supabase 프로젝트 = 1:1

하나의 앱 배포(Vercel URL)는 **하나의 Supabase 프로젝트**에 연결됩니다.
다른 교회가 사용하려면 **별도로 앱을 배포(fork/clone)**하거나, 같은 앱에서 Supabase 설정을 변경해야 합니다.

```
교회 A: church-a-lms.vercel.app → Supabase 프로젝트 A
교회 B: church-b-lms.vercel.app → Supabase 프로젝트 B
```

---

## 3. Supabase 자격증명 관리

### 3.1 저장 위치 및 방식

```
┌──────────────────────────────────────┐
│ 자격증명 저장 전략                     │
├──────────────────────────────────────┤
│                                      │
│  [개발 모드]                          │
│  .env.local 파일                     │
│  NEXT_PUBLIC_SUPABASE_URL=xxx        │
│  NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx   │
│                                      │
│  [프로덕션 - 방법 1: Vercel 환경변수]  │
│  Vercel Dashboard에서 설정            │
│  → 가장 안전, 권장                    │
│                                      │
│  [프로덕션 - 방법 2: 온보딩 위자드]    │
│  사용자 입력 → localStorage 저장      │
│  → Vercel 환경변수 미설정 시 폴백     │
│                                      │
└──────────────────────────────────────┘
```

### 3.2 우선순위 로직

```typescript
// lib/supabase/config.ts
function getSupabaseConfig() {
  // 1순위: 환경변수 (Vercel에 설정된 경우)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  }

  // 2순위: localStorage (온보딩 위자드에서 저장한 경우)
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('supabase_config')
    if (saved) return JSON.parse(saved)
  }

  // 미설정: 온보딩 위자드로 리다이렉트
  return null
}
```

### 3.3 보안 고려사항

| 키 | 노출 범위 | 안전성 |
|----|-----------|--------|
| `SUPABASE_URL` | 공개 가능 | 안전 (프로젝트 식별자일 뿐) |
| `ANON_KEY` | 공개 가능 | 안전 (RLS가 데이터를 보호) |
| `SERVICE_ROLE_KEY` | 서버 전용 | **절대 브라우저 노출 금지** |

- anon key는 브라우저에서 사용해도 안전합니다 (Supabase 공식 권장)
- **RLS(Row Level Security)가 반드시 활성화**되어 있어야 anon key가 안전합니다
- 온보딩 위자드에서 제공하는 SQL 스크립트에 RLS 정책이 포함되어 있습니다

---

## 4. 온보딩 위자드 상세 설계

### 4.1 진입 조건

```
앱 접속 시:
  Supabase 설정 존재? ──── Yes → 대시보드
                     └── No  → 온보딩 위자드
```

### 4.2 위자드 단계

#### Step 1: 환영 & 안내
```
┌─────────────────────────────────┐
│ 🏕️ FLOWING                      │
│                                 │
│ 시작하기 전에 데이터 저장소를     │
│ 연결해야 합니다.                 │
│                                 │
│ Supabase라는 무료 서비스를       │
│ 사용합니다.                      │
│                                 │
│ 📎 약 5분 소요                   │
│ 💰 완전 무료                     │
│ 🔒 교회 데이터는 교회 계정에 저장 │
│                                 │
│        [시작하기 →]              │
└─────────────────────────────────┘
```

#### Step 2: Supabase 가입
```
┌─────────────────────────────────┐
│ Step 1/4 — Supabase 가입        │
│ ━━━━━━━━━━░░░░░░░░░░ 25%       │
│                                 │
│ ① 아래 버튼으로 Supabase에      │
│    가입하세요                    │
│                                 │
│    [Supabase 가입 페이지 열기 ↗] │
│                                 │
│ ② "Continue with Google"을      │
│    누르면 구글 계정으로          │
│    바로 가입됩니다               │
│                                 │
│ ┌─────────────────────────────┐ │
│ │  [📸 가입 화면 스크린샷]     │ │
│ │  빨간 화살표로 버튼 위치 표시 │ │
│ └─────────────────────────────┘ │
│                                 │
│ ✅ 가입을 완료했습니다           │
│                                 │
│        [← 이전] [다음 →]        │
└─────────────────────────────────┘
```

#### Step 3: 프로젝트 생성
```
┌─────────────────────────────────┐
│ Step 2/4 — 프로젝트 만들기       │
│ ━━━━━━━━━━━━━━━░░░░░ 50%       │
│                                 │
│ ① Dashboard에서 "New Project"   │
│    버튼을 누르세요               │
│                                 │
│ ② 아래 정보를 입력하세요:        │
│                                 │
│    Project name:                │
│    ┌────────────────────┐       │
│    │ church-lms  [복사]  │       │
│    └────────────────────┘       │
│                                 │
│    Database Password:           │
│    (원하는 비밀번호 자유 설정)    │
│                                 │
│    Region:                      │
│    ┌────────────────────┐       │
│    │ Northeast Asia     │       │
│    │ (Tokyo) 선택 [복사] │       │
│    └────────────────────┘       │
│                                 │
│ ③ "Create new project" 클릭     │
│                                 │
│ ┌─────────────────────────────┐ │
│ │  [📸 프로젝트 생성 스크린샷]  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ⏳ 프로젝트 생성에 1~2분 걸립니다│
│                                 │
│        [← 이전] [다음 →]        │
└─────────────────────────────────┘
```

#### Step 4: 연결 정보 입력
```
┌─────────────────────────────────┐
│ Step 3/4 — 연결 정보 복사        │
│ ━━━━━━━━━━━━━━━━━━━░░ 75%      │
│                                 │
│ ① Supabase Dashboard 좌측에서   │
│    ⚙️ Project Settings 클릭     │
│                                 │
│ ② 상단 "API" 탭 클릭            │
│                                 │
│ ③ 아래 두 값을 복사해서          │
│    붙여넣으세요:                 │
│                                 │
│ Project URL:                    │
│ ┌────────────────────────────┐  │
│ │ https://xxx.supabase.co    │  │
│ └────────────────────────────┘  │
│                                 │
│ anon public key:                │
│ ┌────────────────────────────┐  │
│ │ eyJhbGciOi...              │  │
│ └────────────────────────────┘  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │  [📸 API 설정 스크린샷]      │ │
│ │  복사할 위치 빨간 화살표 표시  │ │
│ └─────────────────────────────┘ │
│                                 │
│        [← 이전] [연결 확인 →]    │
└─────────────────────────────────┘
```

#### Step 5: SQL 실행 안내
```
┌─────────────────────────────────┐
│ Step 4/5 — 데이터베이스 설정     │
│ ━━━━━━━━━━━━━━━━━━━░░░ 80%     │
│                                 │
│ 마지막 단계입니다!               │
│ 데이터베이스 테이블을 만들어야    │
│ 합니다.                         │
│                                 │
│ ① 아래 SQL을 복사하세요         │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ -- FLOWING 스키마   │ │
│ │ CREATE TABLE IF NOT EXISTS  │ │
│ │   _app_meta ( ...           │ │
│ │              [전체 복사 📋]  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ② Supabase Dashboard에서       │
│    SQL Editor를 여세요          │
│    [SQL Editor 열기 ↗]          │
│                                 │
│ ③ 복사한 SQL을 붙여넣고        │
│    [Run] 버튼을 누르세요        │
│                                 │
│ ┌─────────────────────────────┐ │
│ │  [📸 SQL Editor 스크린샷]    │ │
│ │  붙여넣기 → Run 위치 표시    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ④ "Success" 나오면 완료!       │
│                                 │
│        [← 이전] [설정 확인 →]    │
└─────────────────────────────────┘
```

#### Step 6: 설정 완료 & 관리자 계정
```
┌─────────────────────────────────┐
│ Step 5/5 — 설정 완료             │
│ ━━━━━━━━━━━━━━━━━━━━━━━ 100%   │
│                                 │
│ ✅ Supabase 연결 성공            │
│ ✅ 데이터베이스 스키마 확인 완료   │
│                                 │
│ 🎉 모든 준비가 완료되었습니다!    │
│                                 │
│    관리자 계정을 설정하세요:      │
│                                 │
│    교회명:                       │
│    [____________________]       │
│                                 │
│    관리자 이름:                   │
│    [____________________]       │
│                                 │
│    관리자 비밀번호:               │
│    [____________________]       │
│                                 │
│      [행사 만들기 시작 →]        │
└─────────────────────────────────┘
```

---

## 5. DB 초기화 (수동 SQL 실행)

### 5.1 기술적 제약사항

> **중요**: Supabase JS 클라이언트(`@supabase/supabase-js`)는 **DDL(CREATE TABLE, ALTER TABLE 등)을 실행할 수 없습니다.**
> REST API(PostgREST)는 DML(SELECT, INSERT, UPDATE, DELETE)만 지원하며, `supabase.rpc()`도 미리 생성된 함수만 호출 가능합니다.
> 따라서 **자동 스키마 생성은 기술적으로 불가능**하며, 사용자가 직접 SQL을 실행해야 합니다.

### 5.2 스키마 적용 방식: 복사-붙여넣기

온보딩 위자드에서 Supabase 연결 확인 후, **SQL 스크립트를 Supabase SQL Editor에 복사-붙여넣기**하는 방식으로 진행합니다.

```
연결 확인 성공
  ↓
온보딩 Step 5: SQL 설정 안내
  ├── 1. "아래 SQL을 복사하세요" + [전체 복사] 버튼
  ├── 2. "Supabase Dashboard → SQL Editor를 여세요" + [SQL Editor 열기 ↗] 링크
  ├── 3. "복사한 SQL을 붙여넣고 [Run] 버튼을 누르세요"
  ├── 4. 📸 스크린샷으로 위치 안내
  └── 5. 앱에서 [설정 완료 확인] 클릭 → _app_meta 테이블 존재 확인
  ↓
스키마 확인 성공 → 관리자 프로필 생성 → 대시보드 이동
```

#### Step 5 UI (수정)

```
┌─────────────────────────────────┐
│ Step 4/4 — 데이터베이스 설정     │
│ ━━━━━━━━━━━━━━━━━━━━━━━ 100%   │
│                                 │
│ 마지막 단계입니다!               │
│ 아래 SQL을 Supabase에 실행하면   │
│ 모든 준비가 완료됩니다.          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ -- FLOWING 스키마   │ │
│ │ CREATE TABLE IF NOT EXISTS  │ │
│ │   _app_meta ( ...           │ │
│ │ -- (이하 전체 SQL)           │ │
│ │                    [전체 복사]│ │
│ └─────────────────────────────┘ │
│                                 │
│ ① 위 SQL을 복사하세요           │
│                                 │
│ ② Supabase Dashboard에서       │
│    SQL Editor를 여세요          │
│    [SQL Editor 열기 ↗]          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │  [📸 SQL Editor 스크린샷]    │ │
│ │  붙여넣기 → Run 버튼 위치    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ③ 복사한 SQL을 붙여넣고        │
│    [Run] 버튼을 누르세요        │
│                                 │
│ ④ "Success" 메시지가 나오면     │
│    아래 버튼을 눌러주세요       │
│                                 │
│      [설정 완료 확인 →]         │
└─────────────────────────────────┘
```

### 5.3 스키마 버전 확인

```typescript
// lib/supabase/schema.ts
export const SCHEMA_VERSION = '1.0.0'

// 앱 시작 시 _app_meta 테이블 존재 여부로 스키마 적용 확인
// DDL 실행은 불가하므로, DML(SELECT)로 확인만 수행
export async function checkSchemaInitialized(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('_app_meta')
    .select('value')
    .eq('key', 'schema_version')
    .single()

  if (error || !data) {
    // 테이블이 없거나 데이터가 없음 → 스키마 미적용
    return { initialized: false, version: null }
  }

  return {
    initialized: true,
    version: data.value,
    needsMigration: data.value !== SCHEMA_VERSION,
  }
}
```

### 5.4 초기화 SQL 스크립트 (전체)

앱 내에서 표시되는 SQL 스크립트입니다. 사용자가 이 전체를 복사하여 SQL Editor에서 실행합니다.

```sql
-- ============================================
-- FLOWING - 초기 스키마 설정
-- 이 SQL을 Supabase SQL Editor에 붙여넣고
-- [Run] 버튼을 눌러주세요.
-- ============================================

-- 1. 앱 메타데이터
CREATE TABLE IF NOT EXISTS _app_meta (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO _app_meta (key, value)
VALUES ('schema_version', '1.0.0')
ON CONFLICT (key) DO NOTHING;

-- 2. 이후 TRD.md의 전체 스키마 (events, profiles, participants, groups, ...)
-- 3. RLS 정책
-- 4. 인덱스
-- 5. Storage 버킷 (SQL Editor에서 실행 가능)

-- Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', false),
       ('materials', 'materials', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS 정책
CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Authenticated users can view photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload materials"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'materials');

CREATE POLICY "Authenticated users can view materials"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'materials');
```

### 5.5 마이그레이션 안내

스키마 버전이 변경된 경우 (앱 업데이트 후):

```
앱 접속 시 스키마 버전 불일치 감지
  ↓
알림: "앱이 업데이트되어 데이터베이스도 업데이트가 필요합니다."
  ↓
마이그레이션 SQL 표시 + [복사] 버튼
  ↓
사용자가 SQL Editor에서 실행
  ↓
[확인] → 새 버전 확인 → 정상 사용
```

---

## 6. 연결 해제 / 재설정

### 6.1 설정 초기화
```
설정 > 데이터 관리 > Supabase 연결 초기화
  ↓
확인 다이얼로그: "연결 정보가 삭제됩니다. 데이터는 Supabase에 그대로 남아있습니다."
  ↓
localStorage 삭제 → 온보딩 위자드로 이동
```

### 6.2 다른 Supabase로 전환
```
설정 > 데이터 관리 > Supabase 연결 변경
  ↓
새 URL/Key 입력 → 연결 확인 → 스키마 확인/적용
```

---

## 7. 개발 vs 프로덕션

| 환경 | Supabase 연결 방식 |
|------|-------------------|
| **개발 (localhost)** | `.env.local` 환경변수 (개발자 Supabase) |
| **프로덕션 (Vercel) - 방법 A** | Vercel 환경변수에 설정 (IT 능숙한 교회) |
| **프로덕션 (Vercel) - 방법 B** | 온보딩 위자드로 설정 (일반 교회) |

### 7.1 환경변수 감지 로직

```
앱 시작
  ├── NEXT_PUBLIC_SUPABASE_URL 있음?
  │     ├── Yes → 환경변수 사용 (온보딩 건너뛰기)
  │     └── No  → localStorage 확인
  │               ├── 있음 → 저장된 설정 사용
  │               └── 없음 → 온보딩 위자드 시작
  └── 연결 후 스키마 버전 확인 → 필요 시 마이그레이션
```

---

## 8. 에러 핸들링

| 상황 | 대응 |
|------|------|
| 잘못된 URL/Key 입력 | "연결에 실패했습니다. URL과 Key를 다시 확인해주세요." |
| Supabase 프로젝트 일시정지 | "데이터베이스가 일시정지 상태입니다. Supabase Dashboard에서 활성화해주세요." |
| 무료 한도 초과 | "무료 사용 한도에 도달했습니다. Supabase Dashboard에서 플랜을 확인해주세요." |
| 스키마 생성 실패 | "데이터베이스 설정 중 오류가 발생했습니다. 다시 시도해주세요." + 수동 SQL 가이드 링크 |
| 네트워크 오류 | "인터넷 연결을 확인해주세요." |

---

## 9. 제약사항 및 한계

1. **anon key 기반**: 브라우저에서 anon key를 사용하므로 RLS가 반드시 필요
2. **Service Role Key 미사용**: 서버사이드에서도 anon key + 사용자 JWT로 동작
   - 관리자 전용 작업은 RLS 정책으로 해결
3. **스키마 수동 적용 필요**: Supabase JS 클라이언트(PostgREST)는 DDL을 실행할 수 없으므로, 사용자가 SQL Editor에서 직접 SQL을 실행해야 함
   - 앱 내 온보딩 위자드에서 SQL 복사-붙여넣기 가이드 + 스크린샷 제공
   - 향후 개선: Supabase Edge Function에서 `pg` 드라이버로 직접 연결하여 자동화 (DB 비밀번호 필요)
4. **멀티테넌시 미지원**: 하나의 앱 배포 = 하나의 Supabase. 여러 교회가 같은 URL에서 각자 DB를 쓰는 구조는 v1에서 미지원
