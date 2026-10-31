import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { CategoryBar } from "@/components/category-bar";
import { NewsCard } from "@/components/news-card";
import {
  getArticles,
  getCategories,
  type CategoryFilter,
} from "@/db/queries";

export const metadata: Metadata = {
  title: "대시보드 · AI 뉴스 수집기",
};

function parseFilter(value: string | string[] | undefined): CategoryFilter {
  if (value === "uncategorized") return "uncategorized";
  if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
  return undefined;
}

export default function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight">
            AI 뉴스 수집기
          </Link>
          <UserButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard">["searchParams"];
}) {
  // 모든 페이지는 인증이 필요하다. 로그인 모달은 홈에 있다.
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="py-20 text-center text-slate-600">
        <p>로그인이 필요해요.</p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const filter = parseFilter((await searchParams).category);

  const [categories, articles] = await Promise.all([
    getCategories(),
    getArticles(filter),
  ]);

  return (
    <>
      <CategoryBar categories={categories} selected={filter} />
      {articles.length === 0 ? (
        <p className="py-20 text-center text-slate-500">
          {filter === undefined
            ? "아직 수집한 뉴스가 없어요. '뉴스 가져오기'를 눌러 시작해 보세요."
            : "이 카테고리에는 아직 뉴스가 없어요."}
        </p>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="h-[4.25rem]" />
      <div className="grid animate-pulse grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="h-72 rounded-xl border border-slate-200 bg-white"
          />
        ))}
      </div>
    </>
  );
}
