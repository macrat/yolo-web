import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * 結果ページ（page.tsx）に RelatedQuizzes が正しく組み込まれていることを確認するテスト。
 *
 * サーバーコンポーネントの非同期レンダリングはテスト環境でのセットアップが複雑なため、
 * ソースコードの静的解析でコンポーネントの組み込みを検証する。
 */
describe("play/[slug]/result/[resultId]/page.tsx", () => {
  const pageSource = readFileSync(resolve(__dirname, "../page.tsx"), "utf-8");

  it("imports RelatedQuizzes from @/play/quiz/_components/RelatedQuizzes", () => {
    expect(pageSource).toContain(
      'import RelatedQuizzes from "@/play/quiz/_components/RelatedQuizzes"',
    );
  });

  it("uses RelatedQuizzes with currentSlug and category props", () => {
    expect(pageSource).toContain(
      "<RelatedQuizzes currentSlug={slug} category={quiz.meta.category} />",
    );
  });

  it("renders RelatedQuizzes before RecommendedContent", () => {
    const relatedQuizzesPos = pageSource.indexOf("<RelatedQuizzes");
    const recommendedContentPos = pageSource.indexOf("<RecommendedContent");

    expect(relatedQuizzesPos).toBeGreaterThan(-1);
    expect(recommendedContentPos).toBeGreaterThan(-1);
    expect(relatedQuizzesPos).toBeLessThan(recommendedContentPos);
  });
});
