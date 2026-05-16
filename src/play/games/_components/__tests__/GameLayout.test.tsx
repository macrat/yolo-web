import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import GameLayout from "../GameLayout";
import type { GameMeta } from "@/play/games/types";

// RecommendedContent をモックしてテストを安定させる
vi.mock("@/play/_components/RecommendedContent", () => ({
  default: ({ currentSlug }: { currentSlug: string }) => (
    <nav aria-label="おすすめコンテンツ">
      <span>RecommendedContent:{currentSlug}</span>
    </nav>
  ),
}));

const mockMeta: GameMeta = {
  slug: "test-game",
  title: "テストゲーム",
  shortDescription: "テスト用ゲーム",
  description: "テスト用のゲームの説明です。",
  icon: "\u{1F3AE}",
  accentColor: "#ff0000",
  difficulty: "初級",
  keywords: ["テスト"],
  statsKey: "test-game-stats",
  ogpSubtitle: "テスト",
  publishedAt: "2026-02-13",
  sitemap: { changeFrequency: "daily", priority: 0.8 },
  seo: {
    title: "テストゲーム",
    description: "テスト用のゲームの説明です。",
    keywords: ["テスト", "ゲーム"],
    ogTitle: "テストゲーム",
    ogDescription: "テスト用ゲーム",
  },
};

const mockMetaFull: GameMeta = {
  ...mockMeta,
  valueProposition: "テスト価値テキスト",
  usageExample: {
    input: "テスト入力",
    output: "テスト出力",
    description: "テスト補足説明",
  },
  faq: [
    {
      question: "テスト質問？",
      answer: "テスト回答です。",
    },
  ],
  relatedGameSlugs: [],
};

test("GameLayout renders breadcrumb with game title", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Game content</div>
    </GameLayout>,
  );
  expect(
    screen.getByRole("navigation", { name: "パンくずリスト" }),
  ).toBeInTheDocument();
  expect(screen.getByText("テストゲーム")).toBeInTheDocument();
});

test("GameLayout renders children", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Game content here</div>
    </GameLayout>,
  );
  expect(screen.getByText("Game content here")).toBeInTheDocument();
});

test("GameLayout does not render h1 heading (avoids duplicate with GameContainer)", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Content</div>
    </GameLayout>,
  );
  expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
});

test("GameLayout renders valueProposition when provided", () => {
  render(
    <GameLayout meta={mockMetaFull}>
      <div>Content</div>
    </GameLayout>,
  );
  expect(screen.getByText("テスト価値テキスト")).toBeInTheDocument();
});

test("GameLayout does not render valueProposition when not provided", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Content</div>
    </GameLayout>,
  );
  expect(screen.queryByText("テスト価値テキスト")).not.toBeInTheDocument();
});

test("GameLayout renders usageExample section with game-specific labels", () => {
  render(
    <GameLayout meta={mockMetaFull}>
      <div>Content</div>
    </GameLayout>,
  );
  expect(screen.getByText("こんなゲームです")).toBeInTheDocument();
  expect(screen.getByText("遊び方")).toBeInTheDocument();
  expect(screen.getByText("テスト入力")).toBeInTheDocument();
  expect(screen.getByText("体験")).toBeInTheDocument();
  expect(screen.getByText("テスト出力")).toBeInTheDocument();
  expect(screen.getByText("テスト補足説明")).toBeInTheDocument();
});

test("GameLayout usageExample arrow has aria-hidden", () => {
  render(
    <GameLayout meta={mockMetaFull}>
      <div>Content</div>
    </GameLayout>,
  );
  // The arrow character is \u2192
  const arrow = screen.getByText("\u2192");
  expect(arrow).toHaveAttribute("aria-hidden", "true");
});

test("GameLayout does not render usageExample when not provided", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Content</div>
    </GameLayout>,
  );
  expect(screen.queryByText("こんなゲームです")).not.toBeInTheDocument();
});

test("GameLayout renders FAQ section when provided", () => {
  render(
    <GameLayout meta={mockMetaFull}>
      <div>Content</div>
    </GameLayout>,
  );
  expect(screen.getByRole("region", { name: "FAQ" })).toBeInTheDocument();
  expect(screen.getByText("テスト質問？")).toBeInTheDocument();
});

test("GameLayout does not render FAQ when not provided", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Content</div>
    </GameLayout>,
  );
  expect(screen.queryByRole("region", { name: "FAQ" })).not.toBeInTheDocument();
});

test("GameLayout renders share section with game-specific text", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Content</div>
    </GameLayout>,
  );
  expect(
    screen.getByRole("heading", {
      level: 2,
      name: "このゲームが楽しかったらシェア",
    }),
  ).toBeInTheDocument();
});

test("GameLayout renders attribution when provided", () => {
  render(
    <GameLayout meta={mockMeta} attribution={<p>テスト帰属表示</p>}>
      <div>Content</div>
    </GameLayout>,
  );
  expect(screen.getByText("テスト帰属表示")).toBeInTheDocument();
});

test("GameLayout does not render attribution when not provided", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Content</div>
    </GameLayout>,
  );
  // No footer with attribution should exist
  const article = screen.getByRole("article");
  expect(article.querySelector("footer")).not.toBeInTheDocument();
});

test("GameLayout content section has aria-label 'Game'", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Content</div>
    </GameLayout>,
  );
  expect(screen.getByRole("region", { name: "Game" })).toBeInTheDocument();
});

test("GameLayout renders RecommendedContent with meta.slug", () => {
  render(
    <GameLayout meta={mockMeta}>
      <div>Content</div>
    </GameLayout>,
  );
  // RecommendedContent のモックが currentSlug=meta.slug で呼ばれることを確認
  expect(screen.getByText("RecommendedContent:test-game")).toBeInTheDocument();
});
