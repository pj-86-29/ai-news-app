import Link from "next/link";
import type { CategoryFilter } from "@/db/queries";

// GET 폼이라 검색 버튼 클릭과 Enter 키 모두 /dashboard?q=... 로 이동한다.
// 선택된 카테고리는 hidden 입력으로 함께 보낸다.
export function SearchBar({
  keyword,
  category,
}: {
  keyword: string;
  category: CategoryFilter;
}) {
  return (
    <form
      action="/dashboard"
      role="search"
      className="ml-auto flex items-center gap-2 pb-4 sm:py-4"
    >
      {category !== undefined && (
        <input type="hidden" name="category" value={String(category)} />
      )}
      <input
        type="search"
        name="q"
        defaultValue={keyword}
        maxLength={100}
        placeholder="키워드로 뉴스 검색"
        aria-label="키워드 검색"
        className="w-56 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
      />
      <button
        type="submit"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        검색
      </button>
      {keyword && (
        <Link
          href={
            category === undefined
              ? "/dashboard"
              : `/dashboard?category=${category}`
          }
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          초기화
        </Link>
      )}
    </form>
  );
}
