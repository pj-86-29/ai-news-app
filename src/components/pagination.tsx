import Link from "next/link";
import type { CategoryFilter } from "@/db/queries";

const base =
  "min-w-9 rounded-lg px-3 py-1.5 text-center text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none";
const idle = `${base} border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50`;
const active = `${base} bg-indigo-600 font-medium text-white`;
const disabled = `${base} border border-slate-200 bg-white text-slate-500 opacity-50`;

const SIBLINGS = 2;

// 항상 첫/마지막 페이지를 넣고, 현재 페이지 앞뒤 2개씩을 보여준다.
// 첫/마지막 페이지와 번호가 이어지지 않는 쪽에만 생략 표시를 둔다.
function pageItems(page: number, total: number): (number | "ellipsis")[] {
  // 전체가 5페이지 이하면 생략 없이 숫자만 모두 보여준다.
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const start = Math.max(2, page - SIBLINGS);
  const end = Math.min(total - 1, page + SIBLINGS);
  const items: (number | "ellipsis")[] = [1];
  if (start > 2) items.push("ellipsis");
  for (let n = start; n <= end; n++) items.push(n);
  if (end < total - 1) items.push("ellipsis");
  if (total > 1) items.push(total);
  return items;
}

function NavButton({
  href,
  enabled,
  children,
}: {
  href: string;
  enabled: boolean;
  children: React.ReactNode;
}) {
  return enabled ? (
    <Link href={href} className={idle}>
      {children}
    </Link>
  ) : (
    <span aria-disabled="true" className={disabled}>
      {children}
    </span>
  );
}

export function Pagination({
  page,
  totalPages,
  category,
  keyword,
}: {
  page: number;
  totalPages: number;
  category: CategoryFilter;
  keyword: string;
}) {
  if (totalPages <= 1) return null;

  // 5페이지 이하면 번호로 이동하고, 다음/끝 버튼은 비활성화한다.
  const canJump = totalPages > 5;

  // 카테고리와 검색어를 유지한 채 페이지만 바꾼다.
  const href = (target: number) => {
    const params = new URLSearchParams();
    if (category !== undefined) params.set("category", String(category));
    if (keyword) params.set("q", keyword);
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `/dashboard?${qs}` : "/dashboard";
  };

  return (
    <nav
      aria-label="페이지"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      <NavButton href={href(1)} enabled={page > 1}>
        처음
      </NavButton>
      <NavButton href={href(page - 1)} enabled={page > 1}>
        이전
      </NavButton>
      {pageItems(page, totalPages).map((item, i) =>
        item === "ellipsis" ? (
          <span key={`e${i}`} aria-hidden="true" className="px-1 text-slate-500">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={href(item)}
            aria-current={item === page ? "page" : undefined}
            className={item === page ? active : idle}
          >
            {item}
          </Link>
        ),
      )}
      <NavButton href={href(page + 1)} enabled={canJump && page < totalPages}>
        다음
      </NavButton>
      <NavButton href={href(totalPages)} enabled={canJump && page < totalPages}>
        끝
      </NavButton>
    </nav>
  );
}
