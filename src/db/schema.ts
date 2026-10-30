import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    url: text("url").notNull().unique(),
    source: text("source").notNull(),
    titleOriginal: text("title_original").notNull(),
    titleKo: text("title_ko").notNull(),
    summaryKo: text("summary_ko").notNull(),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    author: text("author"),
    thumbnailUrl: text("thumbnail_url"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    notionPageId: text("notion_page_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("articles_category_id_idx").on(t.categoryId),
    index("articles_published_at_idx").on(t.publishedAt),
  ],
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
