// 뉴스 카드와 같은 뼈대의 로딩 placeholder (ui.md 5절: animate-pulse 스켈레톤 카드)
export function NewsCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="aspect-video w-full bg-slate-100" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="h-5 w-16 rounded-full bg-slate-100" />
        <div className="h-5 w-full rounded bg-slate-200" />
        <div className="h-5 w-2/3 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-4/5 rounded bg-slate-100" />
        <div className="h-3 w-28 rounded bg-slate-100" />
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <div className="h-4 w-16 rounded bg-slate-100" />
        <div className="h-8 w-24 rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

export function NewsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="뉴스를 불러오는 중"
      className="grid animate-pulse grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}
