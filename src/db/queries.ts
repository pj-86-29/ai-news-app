import { asc, desc, eq, getTableColumns, isNull, sql } from "drizzle-orm";
import { db } from "./index";
import { articles, categories } from "./schema";

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

export type ArticleWithCategory = Awaited<ReturnType<typeof getArticles>>[number];
