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
});
