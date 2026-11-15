"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteNewsButton({ articleId }: { articleId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!window.confirm("이 뉴스를 삭제할까요?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news/${articleId}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      // 이미 없는 뉴스(404)도 화면에서는 사라져야 하므로 새로고침한다.
      if (!res.ok && res.status !== 404) {
        setError(data?.error ?? "삭제하지 못했어요.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("삭제하지 못했어요.");
      setLoading(false);
    }
  }

  return (
    <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label="뉴스 삭제"
        className="flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm hover:bg-white hover:text-red-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="size-4"
          aria-hidden="true"
        >
          <path d="M5 5l10 10M15 5L5 15" />
        </svg>
      </button>
      {error && (
        <p
          role="alert"
          className="rounded bg-white px-2 py-0.5 text-xs text-red-600 shadow-sm"
        >
          {error}
        </p>
      )}
    </div>
  );
}
