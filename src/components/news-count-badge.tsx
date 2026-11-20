export function NewsCountBadge({ count }: { count: number }) {
  return (
    <p className="pt-4">
      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
        총 {count.toLocaleString("ko-KR")}개의 뉴스
      </span>
    </p>
  );
}
