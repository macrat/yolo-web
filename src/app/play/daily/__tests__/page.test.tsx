import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import DailyFortunePage from "../page";

// DailyFortuneCard uses useAchievements which requires AchievementProvider.
// Mock the hook to avoid the provider requirement in unit tests.
vi.mock("@/lib/achievements/useAchievements", () => ({
  useAchievements: () => ({
    store: null,
    recordPlay: vi.fn(),
    newlyUnlocked: [],
    dismissNotifications: vi.fn(),
  }),
}));

// RecommendedContent uses getRecommendedContents.
// Mock it to avoid dependency on full registry in unit tests.
vi.mock("@/play/recommendation", () => ({
  getRecommendedContents: () => [
    {
      slug: "kanji-level",
      title: "漢字力診断",
      shortTitle: "漢字力診断",
      shortDescription: "あなたの漢字力は？",
      icon: "📝",
      category: "knowledge",
      contentType: "quiz",
      description: "漢字の実力を測る診断",
      accentColor: "#ff5733",
      keywords: ["漢字", "知識"],
      publishedAt: "2026-01-01T00:00:00+09:00",
      trustLevel: "verified",
    },
  ],
}));

vi.mock("@/play/paths", () => ({
  getContentPath: (content: { contentType: string; slug: string }) =>
    `/play/${content.slug}`,
  getPlayPath: (slug: string) => `/play/${slug}`,
  getDailyFortunePath: () => "/play/daily",
}));

vi.mock("@/play/seo", () => ({
  resolveDisplayCategory: () => "クイズ",
}));

describe("DailyFortunePage (/play/daily)", () => {
  it("renders the page wrapper", () => {
    render(<DailyFortunePage />);
    const main = document.querySelector('[class*="wrapper"]');
    expect(main).toBeInTheDocument();
  });

  it("renders breadcrumb navigation", () => {
    render(<DailyFortunePage />);
    expect(
      screen.getByRole("navigation", { name: "パンくずリスト" }),
    ).toBeInTheDocument();
  });

  it("renders breadcrumb with 3 items (ホーム > 遊ぶ > 今日のユーモア運勢)", () => {
    render(<DailyFortunePage />);
    const breadcrumb = screen.getByRole("navigation", {
      name: "パンくずリスト",
    });
    const homeLink = within(breadcrumb).getByRole("link", { name: "ホーム" });
    const playLink = within(breadcrumb).getByRole("link", { name: "遊ぶ" });
    expect(homeLink).toHaveAttribute("href", "/");
    expect(playLink).toHaveAttribute("href", "/play");
  });

  it("renders the TrustLevelBadge", () => {
    render(<DailyFortunePage />);
    // TrustLevelBadge with "generated" level renders a badge element
    const badge = document.querySelector('[class*="badge"]');
    expect(badge).toBeInTheDocument();
  });

  it("renders RecommendedContent navigation for exit links", () => {
    render(<DailyFortunePage />);
    expect(
      screen.getByRole("navigation", { name: "おすすめコンテンツ" }),
    ).toBeInTheDocument();
  });

  it("renders recommended content heading", () => {
    render(<DailyFortunePage />);
    expect(screen.getByText("こちらもおすすめ")).toBeInTheDocument();
  });
});
