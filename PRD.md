# PRD: AI 뉴스 수집기

## 1. 개요
해외 AI 뉴스를 RSS로 수집해 Claude가 한국어로 번역·요약·분류하고, 카드 형태로 보여주는 개인용 웹앱.
마음에 드는 뉴스는 Notion에 저장할 수 있다.

## 2. 배경 및 목표
- 문제: 해외 AI 뉴스를 여러 사이트에서 찾아 읽고 번역하는 데 시간이 든다.
- 목표
  - 버튼 한 번으로 최신 AI 뉴스를 한국어 요약 카드로 확인한다.
  - 카테고리별로 골라 볼 수 있다.
  - 필요한 뉴스는 한 번의 클릭으로 Notion에 보관한다.
- 비목표: 다중 사용자 지원, 원문 전문 크롤링, 자동 정기 수집, 모바일 앱

## 3. 사용자
- 본인 1인 (개인용). Clerk 로그인으로 허용된 계정만 접근한다.

## 4. 기능 요구사항

### 4.1 뉴스 가져오기
- 화면의 '뉴스 가져오기' 버튼을 누를 때만 수집한다 (수동 실행).
- 출처는 고정 2곳: TechCrunch AI 섹션, The Verge AI 섹션 (RSS).
- RSS의 제목과 발췌문만 사용하고 원문 페이지는 크롤링하지 않는다.
- 기사 URL을 고유 키로 사용해, 이미 저장된 기사는 다시 요약하지 않는다.
- 수집 중 로딩 상태를 표시하고, 완료 후 새로 추가된 기사 수를 알려준다.

### 4.2 번역·요약·분류 (Claude API)
- 기사 1건당 한국어 제목, 한국어 요약, 카테고리 1개를 JSON으로 받는다.
- 카테고리는 사용자가 정의한 목록 중에서 선택하며, 맞는 항목이 없으면 "미분류"로 처리한다.
- 여러 기사를 한 번의 호출로 묶어 처리해 비용을 줄인다.
- 응답 파싱에 실패한 기사는 건너뛰고 오류를 알려준다.

### 4.3 카드 표시
- 카드 항목: 한국어 제목, 한국어 요약, 출처, 발행일, 카테고리 배지, 원문 링크, 썸네일(있을 때)
- 최신순 정렬.

### 4.4 카테고리
- 카테고리별 필터링(전체 / 개별 카테고리 / 미분류).
- 카테고리 추가, 이름 수정, 삭제가 가능하다.
- 기본 카테고리: 모델/연구, 제품/서비스, 투자/비즈니스, 규제/정책, 오픈소스
- 뉴스당 카테고리는 1개.
- 카테고리를 삭제하면 해당 뉴스는 "미분류"로 이동한다.
- 카테고리 변경 시 기존 뉴스는 자동 재분류하지 않는다 (비용 절감).

### 4.5 Notion 저장
- 각 카드에 'Notion 저장' 버튼이 있다.
- 클릭하면 Notion 데이터베이스에 항목을 생성한다 (제목, 요약, 카테고리, 링크, 날짜, 출처).
- 저장 후 버튼은 "저장됨"으로 바뀌어 중복 저장을 막는다.
- 연동은 Notion 공식 API(SDK)를 서버에서 직접 호출한다 (MCP 미사용).

### 4.6 로그인
- Clerk로 로그인하며, 허용된 이메일 1개만 접근을 허용한다.
- 모든 페이지와 API는 인증을 요구한다.

## 5. 기술 스택
| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js (App Router, TypeScript, Tailwind) |
| 로그인 | Clerk |
| DB | Neon (Postgres) + Drizzle ORM |
| AI | Claude API (`@anthropic-ai/sdk`) |
| RSS | `rss-parser` |
| Notion | `@notionhq/client` |
| 배포 | Vercel |

## 6. 데이터 모델
- `categories`: id, name(unique), sortOrder, createdAt
- `articles`: id, url(unique), source, titleOriginal, titleKo, summaryKo, categoryId(nullable = 미분류), thumbnailUrl, publishedAt, notionPageId(nullable), createdAt

## 7. API
| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/api/news/fetch` | RSS 수집 → Claude 처리 → 저장, 추가 건수 반환 |
| GET | `/api/news?category=` | 카테고리별 기사 목록 |
| GET/POST | `/api/categories` | 카테고리 목록 / 추가 |
| PATCH/DELETE | `/api/categories/[id]` | 카테고리 수정 / 삭제 |
| POST | `/api/news/[id]/notion` | Notion에 저장 |

## 8. 화면
- 메인: '뉴스 가져오기' 버튼, 카테고리 필터 탭, 카드 그리드
- 카테고리 관리: 모달 또는 `/categories` 페이지

## 9. 환경 변수
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `ALLOWED_EMAIL`, `DATABASE_URL`, `ANTHROPIC_API_KEY`, `NOTION_TOKEN`, `NOTION_DATABASE_ID`

## 10. 비기능 요구사항
- 비밀 키는 서버에서만 사용하고 클라이언트에 노출하지 않는다.
- 중복 기사에는 Claude를 호출하지 않는다.
- 외부 서비스(RSS, Claude, Notion) 오류 시 사용자에게 이해할 수 있는 메시지를 보여준다.

## 11. 성공 기준
- 버튼 클릭 후 한국어 요약과 카테고리가 붙은 카드가 표시된다.
- 재수집해도 중복 기사가 생기지 않고 Claude도 다시 호출되지 않는다.
- 카테고리 필터와 추가/수정/삭제가 동작한다.
- 'Notion 저장'으로 Notion DB에 항목이 생기고 버튼이 "저장됨"으로 바뀐다.
- 허용되지 않은 계정은 접근할 수 없다.

## 12. 구현 순서
1. Next.js 프로젝트 생성, Clerk 연동 및 단일 계정 제한
2. Neon 연결, Drizzle 스키마/마이그레이션, 기본 카테고리 시드
3. RSS 수집 모듈 + Claude 처리 모듈
4. API 라우트, 카드/필터 UI
5. 카테고리 관리 UI
6. Notion 저장
7. Vercel 배포

## 13. 사용자 준비물
Clerk 앱, Neon 프로젝트, Anthropic API 키, Notion Integration 토큰, 저장용 Notion 데이터베이스(속성: 제목, 요약, 카테고리, 링크, 날짜, 출처)

## 14. 현재 진행 상황
- Next.js 프로젝트 생성 및 의존성 설치 완료
- 이후 단계는 위 구현 순서에 따라 진행 예정
