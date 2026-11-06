"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SaveNewsButton({
  articleId,
  saved,
}: {
  articleId: number;
  saved: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(saved);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news/${articleId}/notion`, {
        method: "POST",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "저장하지 못했어요. 다시 시도해 주세요.");
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("저장하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <button
        type="button"
        disabled
        className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700"
      >
        저장된
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
      >
        {loading ? "저장 중…" : "뉴스 저장"}
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
