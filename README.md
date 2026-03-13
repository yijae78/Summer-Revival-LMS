# 🏕️ FLOWING — 여름행사 Learning Management System

교회 여름행사(수련회, 성경학교, 캠프)를 위한 올인원 웹 관리 시스템

---

## 이 앱은 무엇인가요?

교회 여름행사를 운영할 때 필요한 모든 기능을 **하나의 웹사이트**에서 관리할 수 있는 도구입니다.

기존에는 이렇게 했습니다:
- 참가 신청 → 구글 폼
- 명단 관리 → 엑셀
- 연락/공지 → 카카오톡 단체방
- 자료 배포 → 이메일 또는 카톡
- 출석 체크 → 종이 출석부

**FLOWING 하나로 전부 해결됩니다.**

### 랜딩 페이지

Direction C "Living Water" 디자인을 채택했습니다. 바다 배경 caustics + 다층 물결 애니메이션 위에 "FLOWING" 워터플로우 그라디언트 로고가 표시되며, 피처 바와 글래스모피즘 UI로 구성됩니다. 우측 상단에는 반응형 뷰포트 토글(데스크톱/태블릿/모바일)이 배치되어 있습니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **참가자 등록** | 온라인 신청 폼, 명단 관리, 참가비 확인 |
| **일정 관리** | 일차별 타임라인, 현재 진행 세션 표시 |
| **출석 체크** | 모바일에서 터치 한 번으로 출석 체크 |
| **조/반 관리** | 조 편성, 조원 배정, 조별 점수 |
| **공지사항** | 전체/조별 공지, 긴급 알림 |
| **프로그램** | 성경 퀴즈, 실시간 대회 모드 |
| **리더보드** | 조별 순위, 포인트 시스템 |
| **자료실** | 교재, 찬양 악보, 활동지 배포 |
| **갤러리** | 행사 사진 업로드/공유 |
| **숙소 배정** | 방별 인원 배정 관리 |
| **AI 도우미** | 앱 사용법, 기능 안내 AI 챗봇 (무료) |

---

## 사용자 역할

| 역할 | 할 수 있는 것 |
|------|--------------|
| **관리자** (목사/전도사) | 전체 관리, 통계, 설정 |
| **교사** (조장/리더) | 담당 조 출석 체크, 점수 입력 |
| **참가자** (학생) | 일정 확인, 프로그램 참여, 갤러리 보기 |
| **학부모** | 자녀 신청, 일정/공지 확인 |

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, Pretendard Variable |
| 데이터베이스 | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| 인증 | 구글/카카오 로그인 + PIN 코드 |
| AI 챗봇 | Google Gemini + Groq (Vercel AI SDK, 무료) |
| 애니메이션 | Framer Motion + CSS Scroll-Driven Animations |
| 배포 | Vercel |
| 오프라인 | PWA (Serwist, themeColor: `#0c0e14`, userScalable: true) |

---

## 시작하기

### 교회 관리자 (코딩 없이 사용)

1. 앱 URL에 접속합니다
2. 화면 안내에 따라 Supabase를 연결합니다 (약 5분)
3. 행사를 만들고 참가자를 등록합니다

> 자세한 가이드는 앱 내 온보딩 위자드에서 안내됩니다.

### 개발자

```bash
# 1. 저장소 클론
git clone https://github.com/[username]/church-summer-lms.git
cd church-summer-lms

# 2. 의존성 설치
pnpm install

# 3. 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일에 Supabase URL/Key 입력

# 4. 개발 서버 실행
pnpm dev
```

> 상세한 배포 가이드는 [docs/DEPLOY.md](docs/DEPLOY.md)를 참조하세요.

---

## 프로젝트 구조

```
church-summer-lms/
├── docs/                   # 설계 문서
│   ├── PRD.md              # 제품 요구사항
│   ├── TRD.md              # 기술 요구사항
│   ├── DESIGN.md           # 디자인 시스템
│   ├── ARCHITECTURE.md     # 시스템 아키텍처
│   ├── BYOS.md             # Supabase 연결 아키텍처
│   ├── SECURITY.md         # 보안/개인정보 정책
│   ├── DEPLOY.md           # 배포 가이드
│   ├── AGENTS.md           # 개발 에이전트 설계
│   └── ROADMAP.md          # 개발 로드맵
├── src/                    # 소스코드
│   ├── app/                # 페이지 (Next.js App Router)
│   ├── components/         # UI 컴포넌트 (chat/, dashboard/, forms/, layout/, shared/)
│   ├── lib/                # 라이브러리 (Supabase, AI 등)
│   ├── hooks/              # 커스텀 훅
│   ├── stores/             # 상태 관리
│   ├── types/              # TypeScript 타입
│   ├── actions/            # Server Actions
│   └── validators/         # Zod 스키마
├── supabase/               # DB 마이그레이션
├── CLAUDE.md               # 개발 규칙
└── README.md               # 이 파일
```

---

## 설계 문서 안내

프로젝트의 전체 설계는 `docs/` 폴더에 있습니다:

| 문서 | 내용 | 언제 읽나요? |
|------|------|-------------|
| [PRD.md](docs/PRD.md) | 어떤 기능을 만드는지 | 프로젝트 이해할 때 |
| [TRD.md](docs/TRD.md) | 어떤 기술로 만드는지 | 개발 시작할 때 |
| [DESIGN.md](docs/DESIGN.md) | 어떻게 생겼는지 | UI 만들 때 |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | 시스템 구조가 어떤지 | 전체 구조 파악할 때 |
| [BYOS.md](docs/BYOS.md) | Supabase 연결 방식 | 배포/온보딩 작업할 때 |
| [SECURITY.md](docs/SECURITY.md) | 개인정보/보안 정책 | 데이터 다룰 때 |
| [DEPLOY.md](docs/DEPLOY.md) | 배포하는 방법 | 배포할 때 |
| [AGENTS.md](docs/AGENTS.md) | 개발 에이전트 구성 | 개발 진행할 때 |
| [ROADMAP.md](docs/ROADMAP.md) | 개발 일정 | 진행 상황 확인할 때 |

---

## 비용

**완전 무료**로 운영 가능합니다.

| 서비스 | 무료 한도 | 200명 교회 사용량 |
|--------|-----------|-------------------|
| Vercel | 100GB 대역폭/월 | ~5GB |
| Supabase | 500MB DB, 1GB 저장소 | ~50MB DB, ~300MB 사진 |
| Gemini AI | 1,000 요청/일 | ~100 요청/일 |
| Groq AI | 6,000 요청/일 | fallback 전용 |

---

## 라이선스

MIT License

---

## 문의

프로젝트 관련 문의는 GitHub Issues를 이용해주세요.

---

<div align="center">

**TRINITY AI FORUM**

Developed by Yijae Shin

</div>
