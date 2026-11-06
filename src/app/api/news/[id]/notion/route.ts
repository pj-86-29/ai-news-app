import { auth } from "@clerk/nextjs/server";
import { getArticleById, markNotionSaved } from "@/db/queries";
import { createNotionPage } from "@/lib/notion";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/news/[id]/notion">,
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

  const article = await getArticleById(id);
  if (!article) {
    return Response.json({ error: "뉴스를 찾을 수 없어요." }, { status: 404 });
  }
  // 이미 저장된 뉴스는 다시 만들지 않는다.
  if (article.notionPageId) {
    return Response.json({ notionPageId: article.notionPageId });
  }

  try {
    const notionPageId = await createNotionPage(article);
    await markNotionSaved(id, notionPageId);
    return Response.json({ notionPageId });
  } catch (error) {
    console.error("Notion 저장 실패", error);
    return Response.json(
      { error: "Notion에 저장하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }
}
