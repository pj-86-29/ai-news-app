import { clerkMiddleware } from "@clerk/nextjs/server";

// 페이지는 로그인 모달을 띄우기 위해 통과시키고, API는 인증 없이는 막는다.
export default clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname.startsWith("/api")) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Next.js 내부 경로와 정적 파일은 건너뛴다.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
