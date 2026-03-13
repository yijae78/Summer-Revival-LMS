# DEPLOY.md
# FLOWING - 배포 가이드

> **버전**: v1.0
> **작성일**: 2026-03-13

---

## 1. 전제 조건

### 1.1 필요 계정

| 서비스 | 용도 | 비용 | 가입 URL |
|--------|------|------|----------|
| **GitHub** | 소스코드 저장 | 무료 | github.com |
| **Vercel** | 웹 호스팅/배포 | 무료 (Hobby) | vercel.com |
| **Supabase** | 데이터베이스 | 무료 (Free tier) | supabase.com |
| **Google Cloud** | 구글 로그인 OAuth (선택) | 무료 | console.cloud.google.com |
| **Kakao Developers** | 카카오 로그인 (선택) | 무료 | developers.kakao.com |
| **Google AI Studio** | AI 챗봇 Gemini API (선택) | 무료 | aistudio.google.com |
| **Groq** | AI 챗봇 fallback (선택) | 무료 | console.groq.com |

### 1.2 필요 도구 (개발자)

```bash
# Node.js 20+
node --version  # v20.x.x

# pnpm
npm install -g pnpm
pnpm --version  # 9.x.x

# Git
git --version
```

---

## 2. 로컬 개발 환경 설정

### Step 1: 저장소 클론

```bash
git clone https://github.com/[your-username]/church-summer-lms.git
cd church-summer-lms
```

### Step 2: 의존성 설치

```bash
pnpm install
```

### Step 3: 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열고 값을 입력:

```env
# === Supabase (필수) ===
# Supabase Dashboard > Settings > API에서 확인
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# === Google OAuth (선택) ===
# Google Cloud Console > Credentials에서 생성
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# === Kakao OAuth (선택) ===
# Kakao Developers > 내 애플리케이션에서 확인
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=

# === AI 챗봇 (선택) ===
# Google AI Studio에서 무료 발급: aistudio.google.com
GOOGLE_GENERATIVE_AI_API_KEY=
# Groq에서 무료 발급: console.groq.com
GROQ_API_KEY=

# === App ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: 데이터베이스 초기화

```bash
# Supabase CLI 설치 (선택 - 로컬 개발용)
pnpm add -g supabase

# 또는 Supabase Dashboard의 SQL Editor에서 직접 실행:
# supabase/migrations/ 폴더의 SQL 파일을 순서대로 실행
```

### Step 5: 개발 서버 실행

```bash
pnpm dev
# http://localhost:3000 에서 확인
```

---

## 3. 프로덕션 배포 (Vercel)

### Step 1: GitHub에 푸시

```bash
git add .
git commit -m "chore: 초기 프로젝트 설정"
git push origin main
```

### Step 2: Vercel 프로젝트 생성

1. [vercel.com](https://vercel.com) 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 선택 (church-summer-lms)
4. Framework Preset: **Next.js** (자동 감지)
5. Build Settings: 기본값 유지
6. Environment Variables 설정:

```
NEXT_PUBLIC_SUPABASE_URL     = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOi...
NEXT_PUBLIC_APP_URL          = https://your-domain.vercel.app
```

7. "Deploy" 클릭

### Step 3: 배포 확인

- 배포 URL: `https://church-summer-lms-xxx.vercel.app`
- 또는 커스텀 도메인 연결 가능

---

## 4. 다른 교회가 배포하는 방법

### 방법 A: 직접 배포 (IT 가능한 교회)

```
1. GitHub에서 이 저장소를 Fork
2. Vercel에서 Fork한 저장소로 프로젝트 생성
3. Supabase 프로젝트 생성
4. Vercel 환경변수에 Supabase URL/Key 설정
5. 배포 완료
```

### 방법 B: 앱 내 온보딩 (일반 교회, 권장)

```
1. 개발자가 배포한 앱 URL에 접속
   (환경변수에 Supabase 미설정 상태)
2. 온보딩 위자드가 자동 표시
3. 위자드 안내에 따라 Supabase 가입 + 프로젝트 생성
4. URL/Key를 앱에 입력
5. 자동으로 DB 설정 완료
6. 사용 시작
```

> 방법 B의 상세 플로우는 `docs/BYOS.md` 섹션 4를 참조하세요.

---

## 5. 환경변수 레퍼런스

### 5.1 필수 변수

| 변수명 | 설명 | 취득 방법 | 비고 |
|--------|------|-----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Dashboard > Settings > API > Project URL | 공개 가능 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 | Dashboard > Settings > API > anon public | 공개 가능 (RLS 보호) |

### 5.2 선택 변수

| 변수명 | 설명 | 취득 방법 | 비고 |
|--------|------|-----------|------|
| `NEXT_PUBLIC_APP_URL` | 앱 기본 URL | Vercel 배포 URL 또는 커스텀 도메인 | PWA, 공유링크에 사용 |
| `GOOGLE_CLIENT_ID` | 구글 OAuth 클라이언트 ID | Google Cloud Console > Credentials | 구글 로그인 시 필요 |
| `GOOGLE_CLIENT_SECRET` | 구글 OAuth 시크릿 | Google Cloud Console > Credentials | 서버 전용 |
| `KAKAO_CLIENT_ID` | 카카오 REST API 키 | Kakao Developers > 앱 키 | 카카오 로그인 시 필요 |
| `KAKAO_CLIENT_SECRET` | 카카오 클라이언트 시크릿 | Kakao Developers > 보안 | 서버 전용 |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini AI API 키 | Google AI Studio > API Keys | 서버 전용, AI 챗봇용 |
| `GROQ_API_KEY` | Groq AI API 키 | console.groq.com > API Keys | 서버 전용, AI fallback |

### 5.3 BYOS 모드 (환경변수 없이 운영)

`NEXT_PUBLIC_SUPABASE_URL`이 설정되지 않으면 앱은 **BYOS 모드**로 동작합니다:
- 온보딩 위자드 자동 표시
- 사용자가 입력한 값을 localStorage에 저장
- 이후 접속 시 저장된 값 자동 사용

---

## 6. Supabase 프로젝트 설정 가이드

### 6.1 프로젝트 생성

1. supabase.com 로그인
2. Dashboard > "New Project"
3. 설정:
   - **Organization**: 기본값 또는 새로 생성
   - **Project name**: `church-lms` (자유)
   - **Database Password**: 안전한 비밀번호 설정 (기록해두세요)
   - **Region**: `Northeast Asia (Tokyo)` 권장
4. "Create new project" 클릭 (1~2분 소요)

### 6.2 Auth 설정 (구글 로그인)

1. Dashboard > Authentication > Providers
2. Google 활성화:
   - Client ID: Google Cloud Console에서 생성
   - Client Secret: Google Cloud Console에서 생성
3. Redirect URL 복사 → Google Cloud Console의 Authorized redirect URIs에 추가

### 6.3 Storage 버킷 (앱이 자동 생성하지만, 수동 시)

1. Dashboard > Storage
2. "New bucket" 클릭
3. 생성할 버킷:
   - `photos` (사진, public)
   - `materials` (자료, public)

### 6.4 RLS 활성화 확인

모든 테이블에서 RLS가 활성화되어야 합니다:
1. Dashboard > Table Editor
2. 각 테이블 선택 > "RLS Enabled" 확인
3. 앱의 자동 초기화가 이를 처리하지만, 수동 확인 권장

---

## 7. 커스텀 도메인 연결

### Vercel에서 도메인 연결

1. Vercel Dashboard > Project > Settings > Domains
2. 도메인 입력 (예: `lms.우리교회.kr`)
3. DNS 설정:
   - **A 레코드**: `76.76.21.21`
   - 또는 **CNAME**: `cname.vercel-dns.com`
4. SSL 자동 발급 (약 5분)

---

## 8. 업데이트 방법

### 방법 A: Fork한 교회

```bash
# 원본 저장소의 업데이트를 가져오기
git remote add upstream https://github.com/[original]/church-summer-lms.git
git fetch upstream
git merge upstream/main
git push origin main
# → Vercel이 자동 재배포
```

### 방법 B: BYOS 모드

앱이 자동으로 스키마 버전을 확인하고 필요 시 마이그레이션을 실행합니다.
프론트엔드 업데이트는 개발자가 Vercel에 배포하면 자동 반영됩니다.

---

## 9. 문제 해결 (FAQ)

| 문제 | 해결 |
|------|------|
| 빌드 실패 | Vercel Dashboard > Deployments에서 로그 확인 |
| Supabase 연결 오류 | URL/Key 확인, Supabase 프로젝트 상태 확인 (일시정지?) |
| 구글 로그인 안 됨 | Redirect URL이 Supabase Auth 설정과 일치하는지 확인 |
| 이미지 업로드 실패 | Supabase Storage 버킷 존재 여부, RLS 정책 확인 |
| 느린 로딩 | Vercel 리전 확인 (한국 사용자 → Tokyo Edge), 이미지 최적화 확인 |
| 환경변수 미적용 | Vercel에서 환경변수 설정 후 **재배포** 필요 |
