import { insertNewArticles } from "@/db/queries";
import { fetchRecentArticles } from "@/lib/rss";

export async function POST() {
  const { articles, failedSources } = await fetchRecentArticles();

  if (articles.length === 0 && failedSources.length > 0) {
    return Response.json(
      { error: "뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }

  try {
    const added = await insertNewArticles(articles);
    return Response.json({ added, fetched: articles.length, failedSources });
  } catch (error) {
    console.error("기사 저장 실패", error);
    return Response.json(
      { error: "뉴스를 저장하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
