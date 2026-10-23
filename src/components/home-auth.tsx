"use client";

import { SignInButton, UserButton, useSession } from "@clerk/nextjs";

// 서버가 아니라 브라우저의 Clerk 세션을 기준으로 화면을 나눈다.
// 세션이 있는데 로그인 모달을 열면 Clerk가 거부하기 때문이다.
export function HomeAuth() {
  const { isLoaded, session } = useSession();

  if (!isLoaded) return null;

  if (!session) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          AI 뉴스 수집기
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          계속하려면 로그인하세요.
        </p>
        <SignInButton mode="modal">
          <button className="h-12 rounded-full bg-foreground px-6 font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]">
            로그인
          </button>
        </SignInButton>
      </main>
    );
  }

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4">
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">
          AI 뉴스 수집기
        </h1>
        <UserButton />
      </header>
      <main className="flex flex-1 items-center justify-center text-zinc-600 dark:text-zinc-400">
        {session.status === "pending"
          ? "추가 설정이 필요한 세션입니다. Clerk 대시보드의 세션 작업 설정을 확인하세요."
          : "로그인되었습니다."}
      </main>
    </>
  );
}
