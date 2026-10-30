import { config } from "dotenv";
import { inArray } from "drizzle-orm";

config({ path: ".env.local" });

const categoryNames = ["모델·연구", "제품·서비스", "투자·비즈니스", "규제·정책"];

async function main() {
  // DATABASE_URL을 읽은 뒤에 db 클라이언트를 불러온다.
  const { db } = await import("./index");
  const { articles, categories } = await import("./schema");

  await db
    .insert(categories)
    .values(categoryNames.map((name, i) => ({ name, sortOrder: i + 1 })))
    .onConflictDoNothing();

  const rows = await db
    .select()
    .from(categories)
    .where(inArray(categories.name, categoryNames));
  const categoryId = (name: string) => rows.find((c) => c.name === name)!.id;

  const inserted = await db
    .insert(articles)
    .values([
      {
        url: "https://example.com/news/sample-1",
        source: "TechCrunch AI",
        titleOriginal:
          "Startup unveils open-weight model that rivals larger rivals on coding benchmarks",
        titleKo:
          "한 스타트업, 코딩 벤치마크에서 더 큰 경쟁 모델에 필적하는 오픈 웨이트 모델 공개",
        summaryKo:
          "신생 AI 기업이 가중치를 공개한 새 언어 모델을 내놓았다. 코딩 벤치마크에서 몇 배 큰 모델과 비슷한 점수를 기록했다고 밝혔다. 개발자들은 로컬 환경에서도 실행할 수 있다는 점에 주목하고 있다.",
        categoryId: categoryId("모델·연구"),
        author: "Example Reporter A",
        thumbnailUrl: "https://example.com/images/sample-1.jpg",
        publishedAt: new Date("2026-10-29T14:30:00Z"),
      },
      {
        url: "https://example.com/news/sample-2",
        source: "The Verge AI",
        titleOriginal: "Your phone's assistant is getting a long-term memory feature",
        titleKo: "스마트폰 어시스턴트에 장기 기억 기능 도입",
        summaryKo:
          "주요 스마트폰 어시스턴트가 사용자의 선호와 지난 대화를 기억하는 기능을 추가한다. 기억 내용은 설정에서 확인하고 삭제할 수 있다. 개인정보 보호 우려에 대해서는 기기 내 저장을 기본으로 한다고 설명했다.",
        categoryId: categoryId("제품·서비스"),
        author: "Example Reporter B",
        thumbnailUrl: "https://example.com/images/sample-2.jpg",
        publishedAt: new Date("2026-10-29T09:10:00Z"),
      },
      {
        url: "https://example.com/news/sample-3",
        source: "TechCrunch AI",
        titleOriginal: "AI inference chip maker raises $400M at a $3B valuation",
        titleKo: "AI 추론 칩 제조사, 기업가치 30억 달러에 4억 달러 투자 유치",
        summaryKo:
          "AI 추론용 반도체를 만드는 회사가 대규모 투자를 유치했다. 데이터센터의 전력 효율을 높이는 설계가 투자자들의 관심을 끌었다. 조달한 자금은 양산 확대와 소프트웨어 도구 개발에 쓰일 예정이다.",
        categoryId: categoryId("투자·비즈니스"),
        author: "Example Reporter A",
        thumbnailUrl: null,
        publishedAt: new Date("2026-10-28T18:45:00Z"),
      },
      {
        url: "https://example.com/news/sample-4",
        source: "The Verge AI",
        titleOriginal:
          "EU finalizes labeling rules for AI-generated images and video",
        titleKo: "EU, AI 생성 이미지·영상 표시 의무 규정 확정",
        summaryKo:
          "EU가 AI로 만든 이미지와 영상에 표시를 의무화하는 세부 규정을 확정했다. 서비스 제공자는 생성물에 식별 가능한 표식을 넣어야 한다. 시행은 단계적으로 이뤄지며 위반 시 과징금이 부과된다.",
        categoryId: categoryId("규제·정책"),
        author: "Example Reporter B",
        thumbnailUrl: "https://example.com/images/sample-4.jpg",
        publishedAt: new Date("2026-10-28T11:00:00Z"),
      },
      {
        url: "https://example.com/news/sample-5",
        source: "The Verge AI",
        titleOriginal: "Why chatbot answers keep getting longer",
        titleKo: "챗봇 답변은 왜 점점 길어질까",
        summaryKo:
          "챗봇의 답변이 갈수록 길어지는 이유를 짚은 기사다. 평가 방식이 긴 답변을 선호하는 경향이 한 원인으로 꼽힌다. 사용자는 간결한 답을 원하지만 모델은 이에 맞춰지지 않았다는 분석이다.",
        categoryId: null,
        author: null,
        thumbnailUrl: null,
        publishedAt: new Date("2026-10-27T16:20:00Z"),
      },
    ])
    .onConflictDoNothing()
    .returning({ id: articles.id });

  console.log(`카테고리 ${rows.length}개, 새로 삽입된 기사 ${inserted.length}개`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
