# AI 뉴스 수집기

해외 AI 뉴스를 RSS로 수집하고, Claude가 한국어로 번역·요약·분류해 카드로 보여주는 개인용 웹앱입니다. 마음에 드는 뉴스는 버튼 한 번으로 Notion에 저장할 수 있습니다.

## 주요 기능

- **뉴스 가져오기**: 버튼을 누르면 TechCrunch AI, The Verge AI 두 곳의 RSS를 수집합니다.
- **한국어 번역·요약·분류**: RSS의 제목과 발췌문을 Claude API 한 번 호출로 묶어 처리하고, 기사마다 카테고리 1개를 붙입니다. 맞는 카테고리가 없으면 "미분류"입니다.
- **중복 방지**: 기사 URL이 고유 키입니다. 이미 저장된 기사는 Claude를 호출하기 전에 걸러내서 토큰을 쓰지 않습니다.
- **카드와 카테고리 필터**: 최신순 카드 목록을 카테고리별로 걸러 볼 수 있습니다.
- **Notion 저장**: 카드의 '뉴스 저장' 버튼을 누르면 Notion 데이터베이스에 저장되고, 버튼이 '저장된'으로 바뀝니다.
- **단일 계정 접근**: Clerk 로그인 후 허용된 이메일 1개만 사용할 수 있습니다.

## 기술 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, React 19, TypeScript) |
| 스타일 | Tailwind CSS v4 |
| 로그인 | Clerk |
| DB | Neon (Postgres) + Drizzle ORM |
| AI | Claude API (`@anthropic-ai/sdk`) |
| RSS | `rss-parser` |
| Notion | `@notionhq/client` |

## 시작하기

### 1. 준비물

- Clerk 앱
- Neon 프로젝트
- Anthropic API 키
- Notion Integration 토큰
- 저장용 Notion 데이터베이스. 속성은 다음과 같고, Integration을 이 데이터베이스에 연결(공유)해야 합니다.

| 속성 | 타입 | 저장되는 값 |
|---|---|---|
| 제목 | 제목 | 한국어 제목 |
| 요약 | 텍스트 | 한국어 요약 |
| 출처 | URL | 원문 링크 |
| 카테고리 | 선택 | 카테고리 이름 (미분류는 비움) |
| 날짜 | 날짜 | 발행일 (없으면 수집일) |

### 2. 설치

```bash
npm install
```

### 3. 환경 변수

프로젝트 루트에 `.env.local`을 만들고 아래 값을 채웁니다. 이 파일은 `.gitignore`에 포함되어 있어 커밋되지 않습니다.

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
ALLOWED_EMAIL=           # 접근을 허용할 이메일 1개
DATABASE_URL=            # Neon 연결 문자열
ANTHROPIC_API_KEY=
NOTION_TOKEN=
NOTION_DATABASE_ID=
```

### 4. 데이터베이스

```bash
npm run db:migrate
```

예제 카테고리와 기사를 넣는 시드 스크립트(`src/db/seed.ts`)도 있습니다.

```bash
npx tsx src/db/seed.ts
```

### 5. 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 로그인한 뒤 `/dashboard`에서 사용합니다.

## 명령어

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` / `npm start` | 프로덕션 빌드 / 실행 |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | 타입 검사 |
| `npm run db:generate` | 스키마 변경으로 마이그레이션 SQL 생성 |
| `npm run db:migrate` | 마이그레이션 적용 |

## API

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/api/news/fetch` | RSS 수집 → Claude 처리 → 저장, 추가된 건수 반환 |
| POST | `/api/news/[id]/notion` | 뉴스를 Notion에 저장 |

모든 페이지와 API는 로그인이 필요합니다.

## 프로젝트 구조

```
src/
├── app/
│   ├── dashboard/         # 카테고리 바와 뉴스 카드 목록
│   └── api/news/          # 수집, Notion 저장 라우트
├── components/            # 뉴스 카드, 저장 버튼, 카테고리 바 등
├── db/                    # Drizzle 스키마, 쿼리, 시드
└── lib/
    ├── rss.ts             # RSS 수집
    ├── claude.ts          # 번역·요약·분류
    └── notion.ts          # Notion 페이지 생성
```

## 진행 상황

`PRD.md`의 구현 순서 기준으로 Clerk 연동, DB 스키마, RSS·Claude 처리, 카드 UI, Notion 저장까지 구현되어 있습니다. 카테고리 추가·수정·삭제 화면과 Vercel 배포는 아직 남아 있습니다.

## 문서

- `PRD.md`: 요구사항, 데이터 모델, API, 구현 순서
- `ui.md`: 화면 구성과 Tailwind 스타일 가이드
