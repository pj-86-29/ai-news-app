# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 현재 상태

초기 단계입니다. Next.js 스캐폴드와 의존성만 설치되어 있고 앱 코드는 아직 없습니다. 요구사항, 데이터 모델, API 라우트, 구현 순서는 `PRD.md`(한국어)가 기준입니다. 무언가를 만들기 전에 반드시 읽으세요. 작업은 PRD 12절의 순서대로 한 단계씩 진행하며, 사용자가 말하기 전에는 앱 코드를 작성하지 않기로 했습니다.

## 명령어

- `npm run dev` – 개발 서버
- `npm run build` / `npm start` – 프로덕션 빌드 / 실행
- `npm run lint` – ESLint (flat config, `eslint.config.mjs`)
- `npx tsc --noEmit` – 타입 검사
- 테스트 러너는 아직 설정되어 있지 않습니다.
- Drizzle(예정): `drizzle-kit`과 `tsx`가 devDependencies로 설치되어 있지만, `drizzle.config.ts`와 DB 스크립트는 아직 없습니다.

## Next.js 버전 주의

`AGENTS.md`에 따르면 이 Next.js(16.x, React 19)는 이전 버전과 호환되지 않는 변경이 있습니다. Next.js 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 관련 가이드를 읽고, deprecation 안내를 따르세요. 예를 들어 스캐폴드의 `layout.tsx`는 전역 `LayoutProps<"/">` 타입 헬퍼를 사용합니다. `AGENTS.md`의 해당 블록은 `next dev`가 자동으로 작성하므로 그대로 두세요.

## 아키텍처 (PRD.md 기준 계획)

1인 전용 개인 앱입니다. 버튼을 누르면 고정된 RSS 두 곳(TechCrunch AI, The Verge AI)에서 기사를 수집하고, Claude API를 한 번 묶음 호출해 한국어 번역, 요약, 기사당 카테고리 1개 분류를 처리합니다. 결과는 카드로 보여주며 카테고리 필터와 카드별 "Notion 저장" 버튼을 제공합니다.

여러 파일에 걸친 핵심 설계 결정:
- **인증**: Clerk를 쓰고 허용 이메일 1개(`ALLOWED_EMAIL`)만 통과시킵니다. 모든 페이지와 API 라우트는 인증이 필요합니다. DB에 `userId` 컬럼은 두지 않습니다.
- **중복 방지**: `articles.url`은 unique입니다. 이미 저장된 URL은 Claude를 호출하기 *전에* 걸러내서 토큰을 쓰지 않아야 합니다.
- **카테고리**: 사용자가 편집하는 목록을 Claude에 허용 집합으로 전달합니다. 맞는 항목이 없으면 `categoryId = null`("미분류")입니다. 카테고리를 삭제하면 소속 기사는 null로 바뀝니다. 카테고리를 수정해도 기존 기사를 재분류하지 않습니다.
- **Notion**: 서버에서 공식 `@notionhq/client` SDK로 저장합니다(MCP 아님). `articles.notionPageId`가 저장 완료 여부를 나타내며 "저장됨" 버튼 상태를 결정합니다.
- **Claude 입력**: RSS의 제목과 발췌문만 사용하며 기사 원문 페이지는 크롤링하지 않습니다.
- **데이터 계층**: Neon(서버리스 Postgres)과 Drizzle ORM을 쓰며 테이블은 `categories`, `articles`입니다.

예정된 환경 변수: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `ALLOWED_EMAIL`, `DATABASE_URL`, `ANTHROPIC_API_KEY`, `NOTION_TOKEN`, `NOTION_DATABASE_ID`.

## 규칙

- import 별칭 `@/*`는 `src/*`를 가리킵니다. 코드는 `src/` 아래에 App Router(`src/app`) 방식으로 작성합니다.
- 스타일은 Tailwind v4(`globals.css`)를 씁니다.
- 사용자에게 보이는 UI 텍스트는 한국어입니다.
