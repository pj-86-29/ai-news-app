import {
  getCategories,
  getExistingUrls,
  insertNewArticles,
} from "@/db/queries";
import { MAX_BATCH_SIZE, processArticles } from "@/lib/claude";
import { fetchRecentArticles } from "@/lib/rss";

export const maxDuration = 60;

export async function POST() {
  const { articles, failedSources } = await fetchRecentArticles();

  if (articles.length === 0 && failedSources.length > 0) {
    return Response.json(
      { error: "뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }

  try {
    // 이미 저장된 기사는 Claude를 호출하기 전에 걸러낸다.
    const existing = await getExistingUrls(articles.map((a) => a.url));
    const fresh = [
      ...new Map(
        articles.filter((a) => !existing.has(a.url)).map((a) => [a.url, a]),
      ).values(),
    ]
      .sort(
        (a, b) =>
          (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
      )
      // 넘치는 기사는 다음 수집 때 처리된다.
      .slice(0, MAX_BATCH_SIZE);

    if (fresh.length === 0) {
      return Response.json({
        added: 0,
        fetched: articles.length,
        failedSources,
        failedArticles: 0,
      });
    }

    const categories = await getCategories();
    const categoryIds = new Map(categories.map((c) => [c.name, c.id]));

    let processed;
    try {
      processed = await processArticles(fresh, [...categoryIds.keys()]);
    } catch (error) {
      console.error("Claude 처리 실패", error);
      return Response.json(
        { error: "번역·요약에 실패했어요. 잠시 후 다시 시도해 주세요." },
        { status: 502 },
      );
    }

    const rows = fresh.flatMap((article) => {
      const result = processed.results.get(article.url);
      if (!result) return [];
      return [
        {
          url: article.url,
          source: article.source,
          titleOriginal: article.titleOriginal,
          author: article.author,
          thumbnailUrl: article.thumbnailUrl,
          publishedAt: article.publishedAt,
          titleKo: result.titleKo,
          summaryKo: result.summaryKo,
          categoryId: result.category
            ? (categoryIds.get(result.category) ?? null)
            : null,
        },
      ];
    });

    const added = await insertNewArticles(rows);
    return Response.json({
      added,
      fetched: articles.length,
      failedSources,
      failedArticles: processed.failedUrls.length,
    });
  } catch (error) {
    console.error("기사 저장 실패", error);
    return Response.json(
      { error: "뉴스를 저장하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
