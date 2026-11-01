import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const MODEL = "claude-haiku-5-5";
export const MAX_BATCH_SIZE = 20;

const client = new Anthropic();

export type ArticleInput = {
  url: string;
  titleOriginal: string;
  excerpt: string;
};

export type ProcessedArticle = {
  titleKo: string;
  summaryKo: string;
  // 허용 목록에 없으면 null("미분류")
  category: string | null;
};

export type ProcessResult = {
  results: Map<string, ProcessedArticle>;
  failedUrls: string[];
};

const itemSchema = z.object({
  id: z.number().int(),
  titleKo: z.string().trim().min(1),
  summaryKo: z.string().trim().min(1),
  category: z.string().nullable(),
});

const SYSTEM_PROMPT = `당신은 영문 AI 뉴스를 한국어로 옮기는 편집자입니다.
각 기사에 대해 다음을 만듭니다.
- titleKo: 제목의 자연스러운 한국어 번역
- summaryKo: 제목과 발췌문에 있는 내용만 바탕으로 한 한국어 요약 2~3문장. 발췌문에 없는 사실을 지어내지 않습니다.
- category: 사용자가 준 카테고리 목록 중 가장 알맞은 하나. 맞는 항목이 없으면 null.
회사명, 제품명, 모델명 같은 고유명사는 원문 표기를 유지해도 됩니다.`;

function buildSchema(categoryNames: string[]) {
  // enum은 빈 배열이 허용되지 않으므로, 카테고리가 없으면 null만 받는다.
  const category =
    categoryNames.length > 0
      ? { anyOf: [{ type: "string", enum: categoryNames }, { type: "null" }] }
      : { type: "null" };

  return {
    type: "object",
    properties: {
      articles: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "integer" },
            titleKo: { type: "string" },
            summaryKo: { type: "string" },
            category,
          },
          required: ["id", "titleKo", "summaryKo", "category"],
          additionalProperties: false,
        },
      },
    },
    required: ["articles"],
    additionalProperties: false,
  };
}

// 기사 여러 건을 Claude 한 번 호출로 번역·요약·분류한다.
// 응답이 잘못된 기사는 failedUrls에 담고, 호출 자체가 실패하면 예외를 던진다.
export async function processArticles(
  articles: ArticleInput[],
  categoryNames: string[],
): Promise<ProcessResult> {
  if (articles.length === 0) return { results: new Map(), failedUrls: [] };

  const input = articles.map((article, id) => ({
    id,
    title: article.titleOriginal,
    excerpt: article.excerpt,
  }));

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: buildSchema(categoryNames) },
    },
    messages: [
      {
        role: "user",
        content: `카테고리 목록: ${JSON.stringify(categoryNames)}\n\n기사 목록:\n${JSON.stringify(input)}`,
      },
    ],
  });

  const text = response.content.find((block) => block.type === "text")?.text;
  if (response.stop_reason !== "end_turn" || !text) {
    console.error("Claude 응답을 사용할 수 없음", response.stop_reason);
    return { results: new Map(), failedUrls: articles.map((a) => a.url) };
  }

  let rawItems: unknown[] = [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed?.articles)) rawItems = parsed.articles;
  } catch (error) {
    console.error("Claude 응답 JSON 파싱 실패", error);
  }

  const allowed = new Set(categoryNames);
  const results = new Map<string, ProcessedArticle>();
  for (const raw of rawItems) {
    const item = itemSchema.safeParse(raw);
    if (!item.success || !articles[item.data.id]) continue;
    const { id, titleKo, summaryKo, category } = item.data;
    results.set(articles[id].url, {
      titleKo,
      summaryKo,
      category: category && allowed.has(category) ? category : null,
    });
  }

  const failedUrls = articles
    .map((article) => article.url)
    .filter((url) => !results.has(url));
  return { results, failedUrls };
}
