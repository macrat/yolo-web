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

  it("ResultPageShellをimportしている（RelatedQuizzes・RecommendedContentはShell内で管理）", () => {
    // RelatedQuizzes/RecommendedContentはResultPageShell内で管理されるため、
    // page.tsxからはResultPageShellをimportしていることで間接的に保証される。
    expect(pageSource).toContain("ResultPageShell");
  });

  it("detailedContentがある場合のみ追加セクションを表示するロジックがある", () => {
    expect(pageSource).toContain("detailedContent");
  });

  it("詳しい読みものを持つタイプだけを検索に載せるロジックがある", () => {
    expect(pageSource).toContain(
      "const shouldIndex = Boolean(result.detailedContent)",
    );
    expect(pageSource).toContain("index: true");
    expect(pageSource).toContain("index: false");
  });

  describe("シェアテキストの変更", () => {
    it("シェアテキストの末尾に「あなたは?」が含まれている", () => {
      expect(pageSource).toContain("あなたは?");
    });
  });

  describe("detailedContent見出しのデータ駆動化", () => {
    it("quiz.meta.resultPageLabelsから見出しを取得するロジックがある", () => {
      expect(pageSource).toContain("resultPageLabels");
    });
  });

  it("ResultPageShellを使用している", () => {
    expect(pageSource).toContain("ResultPageShell");
  });

  describe("読み終えた人への2つ目の誘い", () => {
    it("詳しい読みもののあとに2つ目の誘いを置くロジックがある", () => {
      expect(pageSource).toContain("cta2");
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
