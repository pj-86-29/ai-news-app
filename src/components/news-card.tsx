import type { ArticleWithCategory } from "@/db/queries";
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
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {article.thumbnailUrl && (
        // RSS 썸네일은 출처가 제각각이라 next/image 대신 일반 img를 쓴다.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.thumbnailUrl}
          alt=""
          loading="lazy"
          className="aspect-video w-full bg-slate-100 object-cover"
        />
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <span
          className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${
            article.categoryName
              ? "bg-indigo-50 text-indigo-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {article.categoryName ?? "미분류"}
        </span>
        <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-slate-900">
          {article.titleKo}
        </h2>
        <p className="line-clamp-4 text-sm leading-relaxed text-slate-600">
          {article.summaryKo}
        </p>
        <p className="text-xs text-slate-500">
          {article.source}
          {publishedAt && (
            <>
              {" · "}
              <time dateTime={publishedAt.toISOString()}>
                {formatDate(publishedAt)}
              </time>
            </>
          )}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded text-sm font-medium text-indigo-600 hover:underline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          원문 보기
        </a>
        <SaveNewsButton
          articleId={article.id}
          saved={!!article.notionPageId}
        />
      </div>
    </article>
  );
}
