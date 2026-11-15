import { auth } from "@clerk/nextjs/server";
import { deleteArticle } from "@/db/queries";

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/news/[id]">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { id: rawId } = await ctx.params;
  const id = Number(rawId);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  try {
    const deleted = await deleteArticle(id);
    if (!deleted) {
      return Response.json({ error: "뉴스를 찾을 수 없어요." }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch {
    // 오류 로깅은 deleteArticle에서 한다.
    return Response.json(
      { error: "삭제하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
