"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type Notice = { kind: "success" | "error"; text: string };

export function FetchNewsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  async function handleClick() {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/news/fetch", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setNotice({
          kind: "error",
          text:
            data?.error ??
            "뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.",
        });
        return;
      }
      setNotice({
        kind: "success",
        text:
          data.added > 0
            ? `새 뉴스 ${data.added}건을 추가했어요.`
            : "새로운 뉴스가 없어요.",
      });
      startRefresh(() => router.refresh());
    } catch {
      setNotice({
        kind: "error",
        text: "뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.",
      });
    } finally {
      setLoading(false);
    }
  }

  const busy = loading || refreshing;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
      >
        {busy && (
          <svg
            className="size-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="4"
            />
            <path
              d="M22 12a10 10 0 0 0-10-10"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        )}
        {busy ? "가져오는 중…" : "뉴스 가져오기"}
      </button>

      {notice && (
        <div
          role={notice.kind === "error" ? "alert" : "status"}
          className={`fixed top-20 left-1/2 z-20 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg px-4 py-3 text-sm shadow-md ${
            notice.kind === "error"
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {notice.text}
        </div>
      )}
    </>
  );
}
