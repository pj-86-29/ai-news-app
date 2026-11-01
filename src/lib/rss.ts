import Parser from "rss-parser";
import type { NewArticle } from "@/db/schema";

const FEEDS = [
  {
    source: "TechCrunch",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    source: "The Verge",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
] as const;

const WINDOW_MS = 24 * 60 * 60 * 1000;
const EXCERPT_MAX_LENGTH = 500;

type CustomItem = {
  mediaContent?: { $?: { url?: string } };
  mediaThumbnail?: { $?: { url?: string } };
};

const parser = new Parser<Record<string, never>, CustomItem>({
  timeout: 10_000,
  headers: { "User-Agent": "Mozilla/5.0 (ai-news-collector)" },
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
    ],
  },
});

export type FeedArticle = Pick<
  NewArticle,
  | "url"
  | "source"
  | "titleOriginal"
  | "titleKo"
  | "summaryKo"
  | "author"
  | "thumbnailUrl"
  | "publishedAt"
>;

export type FetchResult = {
  articles: FeedArticle[];
  failedSources: string[];
};

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&#8230;|&hellip;/g, "…")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

function findThumbnail(
  item: Parser.Item & CustomItem,
  html: string,
): string | null {
  return (
    item.mediaContent?.$?.url ??
    item.mediaThumbnail?.$?.url ??
    item.enclosure?.url ??
    html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]?.replace(/&#038;/g, "&") ??
    null
  );
}

async function fetchFeed(
  feed: (typeof FEEDS)[number],
  since: number,
): Promise<FeedArticle[]> {
  const parsed = await parser.parseURL(feed.url);
  const articles: FeedArticle[] = [];

  for (const item of parsed.items) {
    const url = item.link?.trim();
    const title = item.title?.trim();
    const published = item.isoDate ? new Date(item.isoDate) : null;
    // 발행일이 없거나 24시간보다 오래된 기사는 건너뛴다.
    if (!url || !title || !published) continue;
    if (Number.isNaN(published.getTime()) || published.getTime() < since) continue;

    const html = item.content ?? "";
    const excerpt = stripHtml(item.summary ?? item.contentSnippet ?? html);

    articles.push({
      url,
      source: feed.source,
      titleOriginal: title,
      // 번역·요약 단계(Claude)가 붙기 전까지는 원문을 임시로 채운다.
      titleKo: title,
      summaryKo: truncate(excerpt, EXCERPT_MAX_LENGTH),
      author: item.creator ?? null,
      thumbnailUrl: findThumbnail(item, html),
      publishedAt: published,
    });
  }

  return articles;
}

// 한쪽 피드가 실패해도 다른 쪽 결과는 살린다.
export async function fetchRecentArticles(): Promise<FetchResult> {
  const since = Date.now() - WINDOW_MS;
  const results = await Promise.allSettled(
    FEEDS.map((feed) => fetchFeed(feed, since)),
  );

  const articles: FeedArticle[] = [];
  const failedSources: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    } else {
      console.error(`RSS 수집 실패 (${FEEDS[i].source})`, result.reason);
      failedSources.push(FEEDS[i].source);
    }
  });

  return { articles, failedSources };
}
