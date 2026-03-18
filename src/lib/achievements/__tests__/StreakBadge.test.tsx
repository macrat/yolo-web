import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import StreakBadge from "../StreakBadge";
import type { AchievementStore } from "../types";
import { createDefaultStore } from "../storage";

// Mock useAchievements hook
const mockStore: { current: AchievementStore | null } = { current: null };
vi.mock("../useAchievements", () => ({
  useAchievements: () => ({
    store: mockStore.current,
    recordPlay: vi.fn(),
    newlyUnlocked: [],
    dismissNotifications: vi.fn(),
  }),
}));

function makeStoreWithStreak(
  current: number,
  longest?: number,
): AchievementStore {
  const store = createDefaultStore();
  store.streak.current = current;
  store.streak.longest = longest ?? current;
  if (current > 0) {
    store.streak.lastPlayDate = "2026-03-08";
  }
  return store;
}

describe("StreakBadge", () => {
  beforeEach(() => {
    mockStore.current = null;
  });

  it("renders nothing when store is null (SSR)", () => {
    mockStore.current = null;
    const { container } = render(<StreakBadge />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when streak is 0", () => {
    mockStore.current = makeStoreWithStreak(0);
    const { container } = render(<StreakBadge />);
    expect(container.innerHTML).toBe("");
  });

  it("renders streak count when streak is 1 or more", () => {
    mockStore.current = makeStoreWithStreak(7);
    render(<StreakBadge />);
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("links to /achievements", () => {
    mockStore.current = makeStoreWithStreak(3);
    render(<StreakBadge />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/achievements");
  });

  it("has accessible aria-label with streak count", () => {
    mockStore.current = makeStoreWithStreak(5);
    render(<StreakBadge />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "aria-label",
      expect.stringContaining("5日連続利用中"),
    );
  });

  it("renders fire icon as decorative (aria-hidden)", () => {
    mockStore.current = makeStoreWithStreak(1);
    render(<StreakBadge />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("displays large streak numbers correctly", () => {
    mockStore.current = makeStoreWithStreak(365);
    render(<StreakBadge />);
    expect(screen.getByText("365")).toBeInTheDocument();
  });

  // WCAG タップターゲット44px保証
  it(".badge has min-height: 44px for WCAG tap target", () => {
    const cssPath = resolve(__dirname, "../StreakBadge.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const badgeBlock = css.match(/\.badge\s*\{[^}]+\}/)?.[0] ?? "";
    expect(badgeBlock).toContain("min-height: 44px");
  });

  it(".badge has min-width: 44px for WCAG tap target", () => {
    const cssPath = resolve(__dirname, "../StreakBadge.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const badgeBlock = css.match(/\.badge\s*\{[^}]+\}/)?.[0] ?? "";
    expect(badgeBlock).toContain("min-width: 44px");
  });
});
