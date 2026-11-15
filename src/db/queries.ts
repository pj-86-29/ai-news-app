import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  inArray,
  isNull,
  or,
  sql,
} from "drizzle-orm";
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
export const PAGE_SIZE = 6;

function buildWhere(filter: CategoryFilter, keyword?: string) {
  const categoryWhere =
    filter === undefined
      ? undefined
      : filter === "uncategorized"
        ? isNull(articles.categoryId)
        : eq(articles.categoryId, filter);

  // 한국어 제목·요약과 영어 원제에서 대소문자 구분 없이 찾는다. LIKE 와일드카드는 이스케이프한다.
  const pattern = keyword
    ? `%${keyword.replace(/[\\%_]/g, "\\$&")}%`
    : undefined;
  const keywordWhere = pattern
    ? or(
        ilike(articles.titleKo, pattern),
        ilike(articles.summaryKo, pattern),
        ilike(articles.titleOriginal, pattern),
      )
    : undefined;
  return and(categoryWhere, keywordWhere);
}

// 페이지는 1부터 시작한다. id를 마지막 정렬 기준으로 두어 페이지 경계가 흔들리지 않게 한다.
export async function getArticles(
  filter: CategoryFilter,
  keyword?: string,
  page = 1,
) {
  return db
    .select({ ...getTableColumns(articles), categoryName: categories.name })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(buildWhere(filter, keyword))
    .orderBy(
      sql`${articles.publishedAt} desc nulls last`,
      desc(articles.createdAt),
      desc(articles.id),
    )
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);
}

export async function countArticles(filter: CategoryFilter, keyword?: string) {
  const [row] = await db
    .select({ count: count() })
    .from(articles)
    .where(buildWhere(filter, keyword));
  return row.count;
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

export async function getArticleById(id: number) {
  const [row] = await db
    .select({ ...getTableColumns(articles), categoryName: categories.name })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.id, id));
  return row;
}

// 아직 Notion에 저장되지 않은 기사에만 페이지 id를 기록한다. 기록됐으면 true.
export async function markNotionSaved(id: number, notionPageId: string) {
  const rows = await db
    .update(articles)
    .set({ notionPageId })
    .where(and(eq(articles.id, id), isNull(articles.notionPageId)))
    .returning({ id: articles.id });
  return rows.length > 0;
}

export async function deleteArticle(id: number) {
  try {
    const rows = await db
      .delete(articles)
      .where(eq(articles.id, id))
      .returning({ id: articles.id });
    return rows.length > 0;
  } catch (error) {
    console.error("뉴스 삭제 실패", error);
    throw error;
  }
}
