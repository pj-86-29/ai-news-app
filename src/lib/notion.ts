import { Client } from "@notionhq/client";

// Notion rich_text 한 덩어리의 길이 제한
const MAX_TEXT = 2000;

const clip = (text: string) => text.slice(0, MAX_TEXT);

export type NotionArticle = {
  titleKo: string;
  summaryKo: string;
  categoryName: string | null;
  url: string;
  publishedAt: Date | null;
  createdAt: Date;
};

// 뉴스 1건을 Notion 데이터베이스에 페이지로 만들고 페이지 id를 반환한다.
export async function createNotionPage(article: NotionArticle) {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID?.trim();
  if (!token || !databaseId) {
    throw new Error("NOTION_TOKEN 또는 NOTION_DATABASE_ID가 설정되지 않았어요.");
  }

  const notion = new Client({ auth: token });
  const page = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      제목: { title: [{ text: { content: clip(article.titleKo) } }] },
      요약: { rich_text: [{ text: { content: clip(article.summaryKo) } }] },
      출처: { url: article.url },
      // 카테고리 옵션이 없으면 Notion이 새로 만든다. 미분류는 비워 둔다.
      ...(article.categoryName && {
        카테고리: { select: { name: article.categoryName.replaceAll(",", " ") } },
      }),
      날짜: {
        date: { start: (article.publishedAt ?? article.createdAt).toISOString() },
      },
    },
  });
  return page.id;
}
