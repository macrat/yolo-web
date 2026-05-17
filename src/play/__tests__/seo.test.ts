import { describe, test, expect } from "vitest";
import { generatePlayMetadata, generatePlayJsonLd } from "../seo";
import type { PlayContentMeta } from "../types";

// テスト用の共通フィールド
const baseFields = {
  slug: "test-content",
  title: "テストコンテンツ",
  description: "テスト用の説明文です。",
  shortDescription: "短い説明",
  icon: "🎮",
  accentColor: "#FF0000",
  keywords: ["テスト", "コンテンツ"],
  publishedAt: "2025-01-01T00:00:00+09:00",
  trustLevel: "curated" as const,
} satisfies Omit<PlayContentMeta, "contentType" | "category">;

const gameMeta: PlayContentMeta = {
  ...baseFields,
  contentType: "game",
  category: "game",
};

const quizKnowledgeMeta: PlayContentMeta = {
  ...baseFields,
  slug: "test-quiz-knowledge",
  contentType: "quiz",
  category: "knowledge",
};

const quizPersonalityMeta: PlayContentMeta = {
  ...baseFields,
  slug: "test-quiz-personality",
  contentType: "quiz",
  category: "personality",
};

const fortuneMeta: PlayContentMeta = {
  ...baseFields,
  slug: "test-fortune",
  contentType: "fortune",
  category: "fortune",
};

// --------------------------------------------------------
// generatePlayJsonLd
// --------------------------------------------------------

describe("generatePlayJsonLd", () => {
  describe("contentType: game", () => {
    test("@type は VideoGame", () => {
      const jsonLd = generatePlayJsonLd(gameMeta) as Record<string, unknown>;
      expect(jsonLd["@type"]).toBe("VideoGame");
    });

    test("url は BASE_URL + /play/<slug> の完全 URL", () => {
      const jsonLd = generatePlayJsonLd(gameMeta) as Record<string, unknown>;
      expect(jsonLd.url).toBe(`https://yolos.net/play/${gameMeta.slug}`);
    });

    test("name と description が正しく設定される", () => {
      const jsonLd = generatePlayJsonLd(gameMeta) as Record<string, unknown>;
      expect(jsonLd.name).toBe(gameMeta.title);
      expect(jsonLd.description).toBe(gameMeta.description);
    });
  });

  describe("contentType: quiz", () => {
    test("@type は Quiz", () => {
      const jsonLd = generatePlayJsonLd(quizKnowledgeMeta) as Record<
        string,
        unknown
      >;
      expect(jsonLd["@type"]).toBe("Quiz");
    });

    test("url は BASE_URL + /play/<slug> の完全 URL", () => {
      const jsonLd = generatePlayJsonLd(quizKnowledgeMeta) as Record<
        string,
        unknown
      >;
      expect(jsonLd.url).toBe(
        `https://yolos.net/play/${quizKnowledgeMeta.slug}`,
      );
    });

    test("personality quiz も @type は Quiz", () => {
      const jsonLd = generatePlayJsonLd(quizPersonalityMeta) as Record<
        string,
        unknown
      >;
      expect(jsonLd["@type"]).toBe("Quiz");
    });
  });

  describe("contentType: fortune", () => {
    test("@type は WebApplication", () => {
      const jsonLd = generatePlayJsonLd(fortuneMeta) as Record<string, unknown>;
      expect(jsonLd["@type"]).toBe("WebApplication");
    });

    test("url は BASE_URL + /play/<slug> の完全 URL", () => {
      const jsonLd = generatePlayJsonLd(fortuneMeta) as Record<string, unknown>;
      expect(jsonLd.url).toBe(`https://yolos.net/play/${fortuneMeta.slug}`);
    });
  });
});

// --------------------------------------------------------
// generatePlayMetadata — カテゴリ名の出し分け
// --------------------------------------------------------

describe("generatePlayMetadata — displayCategory（カテゴリ名出し分け）", () => {
  test("game → タイトルに「パズル」が含まれる", () => {
    const metadata = generatePlayMetadata(gameMeta);
    expect(metadata.title).toContain("パズル");
  });

  test("quiz + knowledge → タイトルに「クイズ」が含まれる", () => {
    const metadata = generatePlayMetadata(quizKnowledgeMeta);
    expect(metadata.title).toContain("クイズ");
  });

  test("quiz + personality → タイトルに「診断」が含まれる", () => {
    const metadata = generatePlayMetadata(quizPersonalityMeta);
    expect(metadata.title).toContain("診断");
  });

  test("fortune → タイトルに「運勢」が含まれる", () => {
    const metadata = generatePlayMetadata(fortuneMeta);
    expect(metadata.title).toContain("運勢");
  });
});

// --------------------------------------------------------
// generatePlayMetadata — twitter.images
// --------------------------------------------------------

describe("generatePlayMetadata — twitter.images", () => {
  test("twitter.images[0] は /play/<slug>/opengraph-image の完全 URL", () => {
    const metadata = generatePlayMetadata(gameMeta);
    // Next.js の型では twitter.images は string[] として扱う
    const twitterImages = (
      metadata.twitter as { images?: string[] } | undefined
    )?.images;
    expect(twitterImages).toBeDefined();
    expect(twitterImages![0]).toBe(
      `https://yolos.net/play/${gameMeta.slug}/opengraph-image`,
    );
  });

  test("quiz コンテンツでも twitter.images が正しく設定される", () => {
    const metadata = generatePlayMetadata(quizKnowledgeMeta);
    const twitterImages = (
      metadata.twitter as { images?: string[] } | undefined
    )?.images;
    expect(twitterImages![0]).toBe(
      `https://yolos.net/play/${quizKnowledgeMeta.slug}/opengraph-image`,
    );
  });
});

// --------------------------------------------------------
// generatePlayMetadata — overrides
// --------------------------------------------------------

describe("generatePlayMetadata — overrides", () => {
  test("overrides の title が base の title を上書きする", () => {
    const overrideTitle = "カスタムタイトル";
    const metadata = generatePlayMetadata(gameMeta, { title: overrideTitle });
    expect(metadata.title).toBe(overrideTitle);
  });

  test("overrides の description が base の description を上書きする", () => {
    const overrideDescription = "カスタム説明文";
    const metadata = generatePlayMetadata(gameMeta, {
      description: overrideDescription,
    });
    expect(metadata.description).toBe(overrideDescription);
  });

  test("overrides なしの場合は base が保持される", () => {
    const metadata = generatePlayMetadata(gameMeta);
    expect(metadata.description).toBe(gameMeta.description);
  });
});
