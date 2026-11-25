import type { ArticleWithCategory } from "@/db/queries";
import { DeleteNewsButton } from "./delete-news-button";
import { SaveNewsButton } from "./save-news-button";

const dateParts = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// "2026.10.31" 형식
function formatDate(date: Date) {
  const part = (type: string) =>
    dateParts.formatToParts(date).find((p) => p.type === type)?.value;
  return `${part("year")}.${part("month")}.${part("day")}`;
}

export function NewsCard({ article }: { article: ArticleWithCategory }) {
  const { publishedAt } = article;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-200 ease-out hover:border-indigo-200 hover:shadow-md motion-safe:hover:-translate-y-0.5">
      <DeleteNewsButton articleId={article.id} />

      {article.thumbnailUrl && (
        <div className="overflow-hidden bg-slate-100">
          {/* RSS 썸네일은 출처가 제각각이라 next/image 대신 일반 img를 쓴다. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.thumbnailUrl}
            alt=""
            loading="lazy"
            className="aspect-video w-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <span
          className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${
            article.categoryName
              ? "bg-indigo-50 text-indigo-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {article.categoryName ?? "미분류"}
        </span>
        <h2 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight break-keep text-slate-900">
          {article.titleKo}
        </h2>
        <p className="line-clamp-4 text-sm leading-relaxed break-keep text-slate-600">
          {article.summaryKo}
        </p>
        <p className="mt-auto flex items-center gap-2 pt-2 text-xs text-slate-500">
          <span className="font-medium text-slate-700">{article.source}</span>
          {publishedAt && (
            <>
              <span
                aria-hidden="true"
                className="size-0.5 rounded-full bg-slate-300"
              />
              <time dateTime={publishedAt.toISOString()}>
                {formatDate(publishedAt)}
              </time>
            </>
          )}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3 transition-colors group-hover:bg-slate-50">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          원문 보기
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
            aria-hidden="true"
          >
            <path d="M6 14L14 6M7 6h7v7" />
          </svg>
        </a>
        <SaveNewsButton articleId={article.id} saved={!!article.notionPageId} />
      </div>
    </article>
  );
}
