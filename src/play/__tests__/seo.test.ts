import { describe, test, expect } from "vitest";
import { shareOpenGraphImage } from "@/lib/share-image";
import { generatePlayMetadata, generatePlayJsonLd } from "../seo";
import { playShareImageContent } from "../share-image-content";
import type { PlayContentMeta } from "../types";

// テスト用の共通フィールド
const baseFields = {
  slug: "test-content",
  title: "テストコンテンツ",
  description: "テスト用の説明文です。",
  shortDescription: "短い説明",
  keywords: ["テスト", "コンテンツ"],
  publishedAt: "2025-01-01T00:00:00+09:00",
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
// generatePlayMetadata — 画像
// --------------------------------------------------------

describe("generatePlayMetadata — 画像", () => {
  test("渡された画像を openGraph.images に入れ、twitter は画像を持たない（Next.js が openGraph から補う）", () => {
    const shareImage = shareOpenGraphImage(
      `/play/${quizKnowledgeMeta.slug}`,
      playShareImageContent(quizKnowledgeMeta),
    );
    const metadata = generatePlayMetadata(quizKnowledgeMeta, shareImage);
    const og = metadata.openGraph as Record<string, unknown> | undefined;
    expect(og?.images).toEqual([shareImage]);
    expect(
      (metadata.twitter as Record<string, unknown> | undefined)?.images,
    ).toBeUndefined();
  });

  test("画像を渡さないページ（占い）は openGraph.images も twitter の画像も持たず、自分の画像のファイルを使う", () => {
    const metadata = generatePlayMetadata(fortuneMeta);
    const og = metadata.openGraph as Record<string, unknown> | undefined;
    expect(og).not.toHaveProperty("images");
    expect(
      (metadata.twitter as Record<string, unknown> | undefined)?.images,
    ).toBeUndefined();
  });
});
