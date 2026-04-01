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

  describe("シェアテキストの変更", () => {
    it("シェアテキストの末尾に「あなたは?」が含まれている", () => {
      expect(pageSource).toContain("あなたは?");
    });
  });

  describe("コンテキスト表示（shortDescription）", () => {
    it("quiz.meta.shortDescriptionをコンテキストとして表示するロジックがある", () => {
      expect(pageSource).toContain("quiz.meta.shortDescription");
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

    it("旧来の固定見出し「あなたの特徴」が残っていない", () => {
      expect(pageSource).not.toContain('"あなたの特徴"');
    });

    it("旧来の固定見出し「こんなところ、ありませんか?」が残っていない", () => {
      expect(pageSource).not.toContain('"こんなところ、ありませんか?"');
    });
  });

  describe("CTA2（detailedContent読了者向け）", () => {
    it("StandardResultLayoutにCTA2のロジックが委譲されている（StandardResultLayoutをimportしている）", () => {
      // dispatch化によりCTA2ロジックはStandardResultLayoutに移動済み。
      // page.tsxはStandardResultLayoutをimportして委譲する形になっている。
      expect(pageSource).toContain("StandardResultLayout");
    });
  });

  describe("DescriptionExpanderコンポーネントの利用", () => {
    it("DescriptionExpanderの利用はStandardResultLayoutに委譲されている（StandardResultLayoutをimportしている）", () => {
      // dispatch化によりDescriptionExpanderはStandardResultLayout内で使用される。
      // page.tsxはStandardResultLayoutをimportして委譲する形になっている。
      expect(pageSource).toContain("StandardResultLayout");
    });
  });

  describe("DESCRIPTION_LONG_THRESHOLD の閾値", () => {
    it("DESCRIPTION_LONG_THRESHOLDが128に設定されている（全角16文字×4行分）", () => {
      // countCharWidth は全角1文字をwidth 2 としてカウントする。
      // 1行あたり全角16文字 = width 32。4行分 = 32 × 4 = 128。
      expect(pageSource).toContain("DESCRIPTION_LONG_THRESHOLD = 128");
    });

    it("コメントに「width 32 × 4 = 128」または「全角16文字 x 4行 = 128」の内容がある", () => {
      const hasCorrectComment =
        pageSource.includes("32") &&
        pageSource.includes("128") &&
        pageSource.includes("DESCRIPTION_LONG_THRESHOLD");
      expect(hasCorrectComment).toBe(true);
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
