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

  describe("シェアテキストの変更", () => {
    it("シェアテキストの末尾に「あなたは?」が含まれている", () => {
      expect(pageSource).toContain("あなたは?");
    });
  });

  describe("detailedContent見出しのデータ駆動化", () => {
    it("quiz.meta.resultPageLabelsから見出しを取得するロジックがある", () => {
      expect(pageSource).toContain("resultPageLabels");
    });

    it("traitsHeadingのデフォルト値「このタイプの特徴」が設定されている", () => {
      expect(pageSource).toContain("このタイプの特徴");
    });

    it("behaviorsHeadingのデフォルト値「このタイプのあるある」が設定されている", () => {
      expect(pageSource).toContain("このタイプのあるある");
    });

    it("adviceHeadingのデフォルト値「このタイプの人へのアドバイス」が設定されている", () => {
      expect(pageSource).toContain("このタイプの人へのアドバイス");
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
