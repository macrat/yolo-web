import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RecommendedContent from "../RecommendedContent";

// getRecommendedContents をモックしてテストを安定させる
vi.mock("@/play/recommendation", () => ({
  getRecommendedContents: (slug: string) => {
    if (slug === "kanji-level") {
      return [
        {
          slug: "daily-fortune",
          title: "今日の運勢",
          shortTitle: "今日の運勢",
          shortDescription: "今日のあなたの運勢は？",
          icon: "🔮",
          category: "fortune",
          contentType: "fortune",
          description: "毎日の運勢を占います",
          accentColor: "#ff5733",
          keywords: ["運勢", "占い"],
          publishedAt: "2026-01-01T00:00:00+09:00",
          trustLevel: "ai-generated",
        },
        {
          slug: "personality-color",
          title: "あなたの色タイプ診断",
          shortTitle: "色タイプ診断",
          shortDescription: "あなたのパーソナリティカラーは？",
          icon: "🎨",
          category: "personality",
          contentType: "quiz",
          description: "個性を色で表現する診断",
          accentColor: "#33a1ff",
          keywords: ["個性", "色"],
          publishedAt: "2026-01-02T00:00:00+09:00",
          trustLevel: "verified",
        },
        {
          slug: "puzzle-game",
          title: "パズルゲーム",
          shortDescription: "頭を使うパズルゲーム",
          icon: "🧩",
          category: "game",
          contentType: "game",
          description: "楽しいパズルゲーム",
          accentColor: "#5733ff",
          keywords: ["パズル", "ゲーム"],
          publishedAt: "2026-01-03T00:00:00+09:00",
          trustLevel: "verified",
        },
      ];
    }
    return [];
  },
}));

// getContentPath をモックする
vi.mock("@/play/paths", () => ({
  getContentPath: (content: { contentType: string; slug: string }) => {
    if (content.contentType === "fortune") return "/play/daily";
    return `/play/${content.slug}`;
  },
  getPlayPath: (slug: string) => `/play/${slug}`,
  getDailyFortunePath: () => "/play/daily",
}));

// resolveDisplayCategory をモックする
vi.mock("@/play/seo", () => ({
  resolveDisplayCategory: (meta: { contentType: string; category: string }) => {
    if (meta.contentType === "fortune") return "運勢";
    if (meta.contentType === "quiz") {
      if (meta.category === "knowledge") return "クイズ";
      if (meta.category === "personality") return "診断";
    }
    return "パズル";
  },
}));

test("RecommendedContent renders 3 cards", () => {
  render(<RecommendedContent currentSlug="kanji-level" />);

  const links = screen.getAllByRole("link");
  expect(links.length).toBe(3);
});

test("RecommendedContent renders section heading", () => {
  render(<RecommendedContent currentSlug="kanji-level" />);

  expect(screen.getByText("こちらもおすすめ")).toBeInTheDocument();
});

test("RecommendedContent has nav with correct aria-label", () => {
  render(<RecommendedContent currentSlug="kanji-level" />);

  expect(
    screen.getByRole("navigation", { name: "おすすめコンテンツ" }),
  ).toBeInTheDocument();
});

test("RecommendedContent renders title, description, and category badge for each card", () => {
  render(<RecommendedContent currentSlug="kanji-level" />);

  // タイトル（shortTitle優先）
  expect(screen.getByText("今日の運勢")).toBeInTheDocument();
  expect(screen.getByText("色タイプ診断")).toBeInTheDocument();
  expect(screen.getByText("パズルゲーム")).toBeInTheDocument();

  // 説明
  expect(screen.getByText("今日のあなたの運勢は？")).toBeInTheDocument();
  expect(
    screen.getByText("あなたのパーソナリティカラーは？"),
  ).toBeInTheDocument();
  expect(screen.getByText("頭を使うパズルゲーム")).toBeInTheDocument();

  // カテゴリバッジ
  expect(screen.getByText("運勢")).toBeInTheDocument();
  expect(screen.getByText("診断")).toBeInTheDocument();
  expect(screen.getByText("パズル")).toBeInTheDocument();
});

test("RecommendedContent link URLs match getContentPath result", () => {
  render(<RecommendedContent currentSlug="kanji-level" />);

  const fortuneLink = screen.getByText("今日の運勢").closest("a");
  expect(fortuneLink).toHaveAttribute("href", "/play/daily");

  const personalityLink = screen.getByText("色タイプ診断").closest("a");
  expect(personalityLink).toHaveAttribute("href", "/play/personality-color");

  const gameLink = screen.getByText("パズルゲーム").closest("a");
  expect(gameLink).toHaveAttribute("href", "/play/puzzle-game");
});

test("RecommendedContent prefers shortTitle over title when set", () => {
  render(<RecommendedContent currentSlug="kanji-level" />);

  // personality-color には shortTitle: "色タイプ診断" が設定されているので
  // title: "あなたの色タイプ診断" ではなく shortTitle が表示される
  expect(screen.getByText("色タイプ診断")).toBeInTheDocument();
  expect(screen.queryByText("あなたの色タイプ診断")).not.toBeInTheDocument();
});

test("RecommendedContent returns null when no recommendations", () => {
  const { container } = render(
    <RecommendedContent currentSlug="unknown-slug" />,
  );

  expect(container.firstChild).toBeNull();
});
