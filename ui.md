# UI 가이드: AI 뉴스 수집기

메인 화면(대시보드)을 중심으로 한 UI 기준 문서입니다. 기능 요구사항은 `PRD.md`를 따르고, 이 문서는 화면 구성과 스타일 규칙만 다룹니다.

## 1. 디자인 원칙

- **깔끔함**: 흰 배경, 얇은 테두리, 약한 그림자만 씁니다. 장식 요소는 넣지 않습니다.
- **읽기 편함**: 본문은 충분한 줄 간격(`leading-relaxed`)과 여백을 둡니다. 한 카드에서 가장 눈에 띄는 것은 한국어 제목입니다.
- **일관성**: 색, 간격, 둥근 모서리는 아래 토큰만 사용합니다. 임의 값(`w-[137px]` 등)은 피합니다.
- **한국어 UI**: 화면에 보이는 모든 텍스트는 한국어입니다.
- 1인용 데스크톱 우선 앱이지만, 모바일 폭에서도 깨지지 않게 반응형으로 작성합니다.

## 2. 디자인 토큰 (Tailwind v4)

스타일은 Tailwind 유틸리티 클래스로 작성하고, 전역 값만 `globals.css`의 `@theme`에 둡니다.

### 색상

| 용도 | 라이트 | Tailwind 클래스 |
|---|---|---|
| 페이지 배경 | 연한 회색 | `bg-slate-50` |
| 카드/헤더 배경 | 흰색 | `bg-white` |
| 기본 텍스트 | 진한 회색 | `text-slate-900` |
| 보조 텍스트 | 중간 회색 | `text-slate-600` |
| 메타 정보(출처, 날짜) | 연한 회색 | `text-slate-500` |
| 테두리 | 아주 연한 회색 | `border-slate-200` |
| 강조(주요 버튼, 선택된 카테고리) | 인디고 | `bg-indigo-600` / `text-indigo-600` |
| 오류 | 빨강 | `text-red-600` / `bg-red-50` |
| 성공/저장됨 | 초록 | `text-emerald-700` / `bg-emerald-50` |

강조색은 인디고 하나만 씁니다. 다크 모드는 현재 범위에 포함하지 않으며, 스캐폴드의 `prefers-color-scheme: dark` 블록은 UI 구현 시 제거해 라이트 테마로 통일합니다.

### 타이포그래피

- 폰트: `font-sans` (Geist). 한글은 시스템 폰트로 대체됩니다.
- 앱 이름: `text-xl font-bold tracking-tight`
- 카드 제목: `text-lg font-semibold leading-snug`
- 본문/요약: `text-sm leading-relaxed text-slate-600`
- 메타 정보: `text-xs text-slate-500`

### 간격과 모양

- 페이지 좌우 여백: `px-4 sm:px-6`, 콘텐츠 최대 너비 `max-w-6xl mx-auto`
- 카드 내부 여백: `p-5`, 카드 간 간격: `gap-5`
- 둥근 모서리: 카드 `rounded-xl`, 버튼/입력 `rounded-lg`, 배지/카테고리 칩 `rounded-full`
- 그림자: 카드 기본 `shadow-sm`, 호버 시 `hover:shadow-md` (`transition-shadow`)

## 3. 메인 화면 레이아웃

```
┌──────────────────────────────────────────────────────────┐
│ AI 뉴스 수집기                      [뉴스 가져오기] [계정] │  ← 헤더
├──────────────────────────────────────────────────────────┤
│ (전체) 모델/연구 제품/서비스 투자/비즈니스 … 미분류  [+ 추가] │  ← 카테고리 바
│                                                          │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│ │ 썸네일      │ │ 썸네일      │ │ 썸네일      │             │
│ │ [카테고리]  │ │ [카테고리]  │ │ [카테고리]  │             │  ← 카드 그리드
│ │ 제목        │ │ 제목        │ │ 제목        │             │
│ │ 요약        │ │ 요약        │ │ 요약        │             │
│ │ 출처·날짜   │ │ 출처·날짜   │ │ 출처·날짜   │             │
│ │ [원문][저장]│ │ [원문][저장]│ │ [원문][저장]│             │
│ └────────────┘ └────────────┘ └────────────┘             │
└──────────────────────────────────────────────────────────┘
```

위에서 아래로 헤더 → 카테고리 바 → 카드 그리드 순서입니다. 카테고리 바는 항상 카드 목록 바로 위에 둡니다.

## 4. 컴포넌트 명세

### 4.1 헤더

- 흰 배경, 하단 테두리: `sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur`
- 높이 `h-16`, 좌우 양 끝 정렬(`flex items-center justify-between`)
- 왼쪽: 앱 이름 **AI 뉴스 수집기** (`text-xl font-bold`)
- 오른쪽: **뉴스 가져오기** 버튼(주요 버튼), 그 옆에 Clerk `UserButton`

### 4.2 버튼

| 종류 | 용도 | 클래스 |
|---|---|---|
| 주요 | 뉴스 가져오기 | `rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50` |
| 보조 | Notion 저장 | `rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50` |
| 완료 | 저장됨 | `rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700` (`disabled`) |
| 텍스트 링크 | 원문 보기 | `text-sm font-medium text-indigo-600 hover:underline` |

- 모든 버튼에 `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2`를 붙입니다.
- 진행 중 상태: 버튼을 `disabled`로 바꾸고 라벨을 "가져오는 중…"처럼 바꿉니다. 스피너는 작은 `animate-spin` 아이콘 하나만 씁니다.

### 4.3 카테고리 바 (카드 목록 바로 위)

카테고리를 한 줄의 칩으로 나열하고, **맨 끝에 카테고리 추가 버튼**을 둡니다.

- 컨테이너: `flex flex-wrap items-center gap-2 py-4` (좁은 화면에서는 줄바꿈)
- 순서: **전체** → 사용자 카테고리(`sortOrder` 순) → **미분류** → **+ 카테고리 추가**
- 일반 칩(선택 안 됨): `rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-700 hover:bg-slate-100`
- 선택된 칩: `rounded-full bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white`
- 선택 상태는 `aria-pressed`로도 표시합니다.
- **+ 카테고리 추가** 버튼: 점선 테두리로 칩과 구분합니다.
  `rounded-full border border-dashed border-slate-300 px-3.5 py-1.5 text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600`
  라벨은 "+ 카테고리 추가"입니다.
- 추가 버튼을 누르면 버튼 자리에 인라인 입력창이 열립니다(`rounded-full border border-slate-300 px-3.5 py-1.5 text-sm`). Enter로 저장, Esc로 취소합니다.
- 칩 이름 수정과 삭제는 PRD의 카테고리 관리 UI(5단계)에서 다룹니다. 이 문서의 범위는 표시, 선택, 추가까지입니다.

### 4.4 뉴스 카드

```
<article class="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
```

위에서 아래로 다음 순서로 배치합니다.

1. **썸네일**(있을 때만): `aspect-video w-full object-cover`. 없으면 영역 자체를 그리지 않습니다.
2. **본문 영역** `flex flex-1 flex-col gap-3 p-5`
   - 카테고리 배지: `w-fit rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700`. 미분류는 `bg-slate-100 text-slate-600`으로 표시합니다.
   - 한국어 제목: `text-lg font-semibold leading-snug text-slate-900`, 최대 2줄(`line-clamp-2`)
   - 한국어 요약: `text-sm leading-relaxed text-slate-600`, 최대 4줄(`line-clamp-4`)
   - 메타 정보: `text-xs text-slate-500`, 형식 "TechCrunch · 2026.10.31"
3. **하단 액션 영역** `mt-auto flex items-center justify-between border-t border-slate-100 px-5 py-3`
   - 왼쪽: **원문 보기** 링크(`target="_blank" rel="noopener noreferrer"`)
   - 오른쪽: **Notion 저장** 버튼. 저장 후에는 **저장됨**(비활성)으로 바뀝니다.

### 4.5 카드 그리드

- `grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3`
- 최신순(`publishedAt` 내림차순)으로 정렬합니다.
- 카드 높이는 내용에 맞추되, 같은 행의 카드는 `items-stretch`로 높이를 맞춰 하단 액션 영역이 가지런히 정렬되게 합니다.

## 5. 상태별 화면

| 상태 | 표시 |
|---|---|
| 첫 방문 / 기사 없음 | 가운데 정렬 안내: "아직 수집한 뉴스가 없어요. '뉴스 가져오기'를 눌러 시작해 보세요." (`text-slate-500`, 위아래 `py-20`) |
| 선택한 카테고리에 기사 없음 | "이 카테고리에는 아직 뉴스가 없어요." |
| 수집 중 | 헤더 버튼 비활성화 + "가져오는 중…". 목록은 `animate-pulse` 스켈레톤 카드 6개 |
| 수집 완료 | 카테고리 바 위에 토스트/배너로 "새 뉴스 N건을 추가했어요." (`bg-emerald-50 text-emerald-700`). 새 기사가 0건이면 "새로운 뉴스가 없어요." |
| 오류 | `rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700`로 이해할 수 있는 메시지를 표시합니다. 예: "뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요." |
| Notion 저장 중 | 해당 카드 버튼만 비활성화하고 "저장 중…" 표시. 실패 시 카드 안에 짧은 오류 문구를 표시합니다. |

## 6. 접근성

- 텍스트 대비는 위 색상 표 조합(`slate-600` 이상, 흰 배경)을 유지합니다.
- 아이콘만 있는 버튼에는 `aria-label`을 붙입니다.
- 카테고리 칩은 `button`이며 키보드(Tab, Enter)로 선택할 수 있어야 합니다.
- 포커스 링을 숨기지 않습니다.

## 7. 구현 메모

- 파일 위치: 페이지는 `src/app`, 재사용 컴포넌트는 `src/components`에 둡니다 (예: `Header`, `CategoryBar`, `NewsCard`, `NewsGrid`).
- 서버 컴포넌트를 기본으로 하고, 선택/입력/버튼 상태가 필요한 `CategoryBar`, `NewsCard`의 저장 버튼만 클라이언트 컴포넌트(`"use client"`)로 둡니다.
- 클래스가 길어지면 컴포넌트로 분리하고, 같은 문자열을 복사하지 않습니다.
- Next.js 16 / Tailwind v4 기준이므로 구현 전에 `node_modules/next/dist/docs/`의 관련 가이드를 확인합니다.
