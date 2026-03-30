import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * 結果ページ（page.tsx）の構造・ロジックテスト。
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

  it("titleフォーマットが「result.title | quiz.meta.title の結果」形式になっている", () => {
    // 新しいtitle形式: ${result.title} | ${quiz.meta.title}の結果
    // 旧形式: ${quiz.meta.title}の結果: ${result.title}
    expect(pageSource).toContain("result.title} | ${quiz.meta.title}の結果");
    // 旧形式が残っていないことを確認
    expect(pageSource).not.toContain("quiz.meta.title}の結果: ${result.title}");
  });

  it("detailedContentがある場合のみ追加セクションを表示するロジックがある", () => {
    expect(pageSource).toContain("detailedContent");
  });

  describe("noindex条件分岐の全パターン", () => {
    it("detailedContent有り + 非相性ページ → index: true になるロジックがある", () => {
      // shouldIndex = hasDetailedContent && !compatFriendTypeId の形でロジックが実装されていること
      expect(pageSource).toContain("hasDetailedContent");
      expect(pageSource).toContain("!compatFriendTypeId");
      // index: true が存在すること
      expect(pageSource).toContain("index: true");
    });

    it("detailedContent有り + 相性ページ → index: false になるロジックがある", () => {
      // compatFriendTypeId が存在する場合は shouldIndex = false となること
      // shouldIndex = hasDetailedContent && !compatFriendTypeId なので、
      // compatFriendTypeId が truthy なら shouldIndex は false になる
      expect(pageSource).toContain("shouldIndex");
      expect(pageSource).toContain("index: false");
    });

    it("detailedContent無し → index: false になるロジックがある", () => {
      // hasDetailedContent が false なら shouldIndex は false になること
      expect(pageSource).toContain("Boolean(result.detailedContent)");
      expect(pageSource).toContain("index: false");
    });

    it("shouldIndexが単一のブーリアン変数で管理されている", () => {
      // shouldIndex 変数が定義されていること
      expect(pageSource).toContain("const shouldIndex =");
      // robots に shouldIndex が使われていること
      expect(pageSource).toContain("shouldIndex");
    });
  });

  describe("titleフォールバックのSITE_NAME考慮", () => {
    it("FULL_WIDTH_LIMIT定数が定義されている", () => {
      expect(pageSource).toContain("FULL_WIDTH_LIMIT");
    });

    it("SITE_NAMEサフィックス分の幅を差し引いたlimitでcandidateTitleを評価している", () => {
      // countCharWidth(" | " + SITE_NAME) のような計算、
      // または FULL_WIDTH_LIMIT_FOR_CANDIDATE のような変数でSITE_NAMEを考慮していること
      // 実装として、SITE_NAMEのサフィックス分を引いたlimit値でcandidateTitleを比較しているか、
      // もしくはcandidateTitle + サフィックスを含む完全なtitleで比較していることを確認
      const hasSiteNameConsideration =
        pageSource.includes("SITE_NAME_SUFFIX_WIDTH") ||
        pageSource.includes("FULL_WIDTH_LIMIT_FOR_CANDIDATE") ||
        pageSource.includes("countCharWidth(` | ${SITE_NAME}`)") ||
        pageSource.includes('countCharWidth(" | " + SITE_NAME)') ||
        pageSource.includes(
          "countCharWidth(`${candidateTitle} | ${SITE_NAME}`)",
        );
      expect(hasSiteNameConsideration).toBe(true);
    });
  });
});
