import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import DailyFortunePage from "../page";
import { fortunePlayContentMeta } from "@/play/registry";
import { generatePlayMetadata, generatePlayJsonLd } from "@/play/seo";

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
  generatePlayMetadata: vi.fn(() => ({
    title: "今日のユーモア運勢 - 運勢 | yolos.net",
    description:
      "AIが毎日生成するユーモラスな運勢診断。今日のあなたの運勢は一体どんな形?",
  })),
  generatePlayJsonLd: vi.fn(() => ({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "今日のユーモア運勢",
    description:
      "AIが毎日生成するユーモラスな運勢診断。今日のあなたの運勢は一体どんな形?",
    url: "https://yolos.net/play/daily",
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "All",
    inLanguage: "ja",
    datePublished: "2026-02-01T00:00:00+09:00",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    creator: {
      "@type": "Organization",
      name: "yolos.net (AI Experiment)",
    },
  })),
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
    expect(screen.getByText("他のジャンルも試してみよう")).toBeInTheDocument();
  });

  it("renders JSON-LD script tag with WebApplication type", () => {
    render(<DailyFortunePage />);
    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    expect(scripts.length).toBeGreaterThan(0);
    // At least one script should contain WebApplication type
    const hasWebApp = Array.from(scripts).some((s) => {
      const text = s.textContent ?? "";
      return text.includes("WebApplication");
    });
    expect(hasWebApp).toBe(true);
  });

  it("calls generatePlayJsonLd with fortunePlayContentMeta", () => {
    render(<DailyFortunePage />);
    expect(generatePlayJsonLd).toHaveBeenCalledWith(fortunePlayContentMeta);
  });

  it("calls generatePlayMetadata with fortunePlayContentMeta", () => {
    // generatePlayMetadata is called at module level (export const metadata),
    // so we verify the function was called with the correct argument.
    expect(generatePlayMetadata).toHaveBeenCalledWith(fortunePlayContentMeta);
  });
});
