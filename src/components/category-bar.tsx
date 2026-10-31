import Link from "next/link";
import type { Category } from "@/db/schema";
import type { CategoryFilter } from "@/db/queries";

const chip =
  "rounded-full px-3.5 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none";
const chipIdle = `${chip} border border-slate-200 bg-white text-slate-700 hover:bg-slate-100`;
const chipActive = `${chip} bg-indigo-600 font-medium text-white`;

function Chip({
  href,
  selected,
  children,
}: {
  href: string;
  selected: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={selected ? "true" : undefined}
      className={selected ? chipActive : chipIdle}
    >
      {children}
    </Link>
  );
}

export function CategoryBar({
  categories,
  selected,
}: {
  categories: Category[];
  selected: CategoryFilter;
}) {
  return (
    <nav aria-label="카테고리" className="flex flex-wrap items-center gap-2 py-4">
      <Chip href="/dashboard" selected={selected === undefined}>
        전체
      </Chip>
      {categories.map((c) => (
        <Chip
          key={c.id}
          href={`/dashboard?category=${c.id}`}
          selected={selected === c.id}
        >
          {c.name}
        </Chip>
      ))}
      <Chip
        href="/dashboard?category=uncategorized"
        selected={selected === "uncategorized"}
      >
        미분류
      </Chip>
      {/* 카테고리 추가 API가 생기면 인라인 입력창으로 연결한다. */}
      <button
        type="button"
        disabled
        title="준비 중입니다"
        className="cursor-not-allowed rounded-full border border-dashed border-slate-300 px-3.5 py-1.5 text-sm text-slate-500 opacity-70"
      >
        + 카테고리 추가
      </button>
    </nav>
  );
}
