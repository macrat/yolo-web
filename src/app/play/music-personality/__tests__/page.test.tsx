/**
 * /play/music-personality 専用プレイページのテスト。
 */

import { describe, it, expect, vi } from "vitest";
import { generateStaticParams, generateMetadata } from "../page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

// Mock registry
vi.mock("@/play/quiz/registry", () => ({
  quizBySlug: new Map([
    [
      "music-personality",
      {
        meta: {
          title: "音楽性格診断",
          slug: "music-personality",
          type: "personality",
          questionCount: 10,
          accentColor: "#7c3aed",
          category: "personality",
          trustLevel: "medium",
        },
        results: [
          {
            id: "festival-pioneer",
            title: "フェスの先駆者",
            description: "テスト説明",
          },
        ],
        questions: [],
      },
    ],
  ]),
  getAllQuizSlugs: vi.fn(() => [
    "kanji-level",
    "kotowaza-level",
    "traditional-color",
    "yoji-level",
    "yoji-personality",
    "impossible-advice",
    "contrarian-fortune",
    "unexpected-compatibility",
    "music-personality",
    "character-fortune",
    "animal-personality",
    "science-thinking",
    "japanese-culture",
    "character-personality",
    "word-sense-personality",
  ]),
}));

// Mock music-personality quiz data
vi.mock("@/play/quiz/data/music-personality", () => ({
  default: {
    meta: {
      title: "音楽性格診断",
      slug: "music-personality",
      type: "personality",
      questionCount: 10,
      accentColor: "#7c3aed",
      category: "personality",
      trustLevel: "medium",
    },
    results: [
      {
        id: "festival-pioneer",
        title: "フェスの先駆者",
        description: "テスト説明",
      },
    ],
    questions: [],
  },
  getCompatibility: vi.fn(),
  isValidMusicTypeId: vi.fn(),
}));

// Mock play registry
vi.mock("@/play/registry", () => ({
  playContentBySlug: new Map([
    [
      "music-personality",
      {
        slug: "music-personality",
        title: "音楽性格診断",
        shortTitle: "音楽性格診断",
        category: "personality",
        contentType: "quiz",
      },
    ],
  ]),
  quizQuestionCountBySlug: new Map([["music-personality", 10]]),
  DAILY_UPDATE_SLUGS: new Set(),
}));

// Mock seo
vi.mock("@/play/seo", () => ({
  generatePlayMetadata: vi.fn(() => ({ title: "音楽性格診断 | yolos.net" })),
  generatePlayJsonLd: vi.fn(() => null),
  resolveDisplayCategory: vi.fn(() => "性格診断"),
}));

// Mock recommendation
vi.mock("@/play/recommendation", () => ({
  getResultNextContents: vi.fn(() => []),
}));

// Mock paths
vi.mock("@/play/paths", () => ({
  getPlayPath: vi.fn((slug) => `/play/${slug}`),
  getContentPath: vi.fn((content) => `/play/${content.slug}`),
}));

describe("music-personality 専用プレイページ: generateStaticParams", () => {
  it("空の配列を返す（slugパラメータ不要のため）", async () => {
    const params = await generateStaticParams();
    // 専用ルートは静的なので generateStaticParams は不要だが、
    // 互換性のため空配列または何も返さないことを確認
    expect(Array.isArray(params)).toBe(true);
    expect(params).toHaveLength(0);
  });
});

describe("music-personality 専用プレイページ: generateMetadata", () => {
  it("music-personality のメタデータを返す", async () => {
    const metadata = await generateMetadata();
    expect(metadata).toBeDefined();
    expect(metadata.title).toBeTruthy();
  });
});

describe("music-personality 専用プレイページ: 動的ルートから除外", () => {
  it("動的ルートの generateStaticParams に music-personality が含まれないこと", async () => {
    const { generateStaticParams: dynamicGenerateStaticParams } =
      await import("@/app/play/[slug]/page");
    const params = await dynamicGenerateStaticParams();
    const slugs = params.map((p: { slug: string }) => p.slug);
    expect(slugs).not.toContain("music-personality");
  });
});
