import { asc, desc, eq, getTableColumns, inArray, isNull, sql } from "drizzle-orm";
import { db } from "./index";
import { articles, categories, type NewArticle } from "./schema";

// undefined = 전체, "uncategorized" = 미분류, number = 카테고리 id
export type CategoryFilter = number | "uncategorized" | undefined;

export async function getCategories() {
  return db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.id));
}

// 최신순: 발행일 내림차순(발행일이 없으면 뒤로), 같으면 수집일 내림차순
export async function getArticles(filter: CategoryFilter) {
  const where =
    filter === undefined
      ? undefined
      : filter === "uncategorized"
        ? isNull(articles.categoryId)
        : eq(articles.categoryId, filter);

  return db
    .select({ ...getTableColumns(articles), categoryName: categories.name })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(where)
    .orderBy(sql`${articles.publishedAt} desc nulls last`, desc(articles.createdAt));
}

// 이미 저장된 url만 골라낸다. Claude 호출 전에 중복을 걸러내는 데 쓴다.
export async function getExistingUrls(urls: string[]) {
  if (urls.length === 0) return new Set<string>();
  const rows = await db
    .select({ url: articles.url })
    .from(articles)
    .where(inArray(articles.url, urls));
  return new Set(rows.map((row) => row.url));
}

// url이 이미 있는 기사는 건너뛰고, 실제로 추가된 건수를 반환한다.
export async function insertNewArticles(rows: NewArticle[]) {
  // 같은 요청 안에서 URL이 겹치면 한 건만 남긴다.
  const unique = [...new Map(rows.map((row) => [row.url, row])).values()];
  if (unique.length === 0) return 0;

  const inserted = await db
    .insert(articles)
    .values(unique)
    .onConflictDoNothing({ target: articles.url })
    .returning({ id: articles.id });
  return inserted.length;
}

export type ArticleWithCategory = Awaited<ReturnType<typeof getArticles>>[number];
