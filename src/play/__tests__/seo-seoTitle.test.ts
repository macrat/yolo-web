import { describe, test, expect } from "vitest";
import { generatePlayMetadata } from "../seo";
import type { PlayContentMeta } from "../types";

const baseQuizMeta: PlayContentMeta = {
  slug: "test-quiz",
  title: "テスト診断",
  description: "テスト用の説明文です。",
  shortDescription: "短い説明",
  icon: "🧪",
  accentColor: "#FF0000",
  keywords: ["テスト"],
  publishedAt: "2026-01-01T00:00:00+09:00",
  contentType: "quiz",
  category: "personality",
};

describe("generatePlayMetadata — seoTitle", () => {
  test("seoTitleがない場合は通常のtitleが使用される", () => {
    const metadata = generatePlayMetadata(baseQuizMeta);
    expect(metadata.title).toContain("テスト診断");
    expect(metadata.title).toContain("診断");
  });

  test("seoTitleがある場合はそれがtitleに使用される", () => {
    const metaWithSeoTitle: PlayContentMeta = {
      ...baseQuizMeta,
      seoTitle: "カスタムSEOタイトル",
    };
    const metadata = generatePlayMetadata(metaWithSeoTitle);
    expect(metadata.title).toContain("カスタムSEOタイトル");
  });

  test("seoTitleがある場合はOGタイトルにも使用される", () => {
    const metaWithSeoTitle: PlayContentMeta = {
      ...baseQuizMeta,
      seoTitle: "カスタムSEOタイトル",
    };
    const metadata = generatePlayMetadata(metaWithSeoTitle);
    const ogTitle = (metadata.openGraph as { title?: string } | undefined)
      ?.title;
    expect(ogTitle).toContain("カスタムSEOタイトル");
  });

  test("seoTitleがない場合はOGタイトルも通常通り", () => {
    const metadata = generatePlayMetadata(baseQuizMeta);
    const ogTitle = (metadata.openGraph as { title?: string } | undefined)
      ?.title;
    expect(ogTitle).toContain("テスト診断");
  });
});
