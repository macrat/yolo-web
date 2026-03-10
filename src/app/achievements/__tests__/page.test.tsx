import { expect, test, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock useAchievements before importing the component
vi.mock("@/lib/achievements/useAchievements", () => ({
  useAchievements: vi.fn(),
}));

// Mock date module
vi.mock("@/lib/achievements/date", () => ({
  getTodayJst: () => "2026-03-08",
}));

import { useAchievements } from "@/lib/achievements/useAchievements";
import AchievementsPage from "../page";

const mockedUseAchievements = vi.mocked(useAchievements);

function createMockStore() {
  return {
    schemaVersion: 1,
    streak: { current: 7, longest: 14, lastPlayDate: "2026-03-08" },
    totalStats: {
      totalDaysPlayed: 42,
      totalContentUsed: 5,
      perContent: {
        irodori: { count: 30, firstPlayedAt: "2026-01-01T00:00:00Z" },
        "kanji-kanaru": { count: 25, firstPlayedAt: "2026-01-02T00:00:00Z" },
        nakamawake: { count: 20, firstPlayedAt: "2026-01-03T00:00:00Z" },
        "yoji-kimeru": { count: 15, firstPlayedAt: "2026-01-04T00:00:00Z" },
        "quiz-traditional-color": {
          count: 10,
          firstPlayedAt: "2026-01-05T00:00:00Z",
        },
      },
    },
    achievements: {
      "first-use": { unlockedAt: "2026-01-01T00:00:00Z" },
      "streak-3": { unlockedAt: "2026-01-03T00:00:00Z" },
      "streak-7": { unlockedAt: "2026-01-07T00:00:00Z" },
      "quiz-first": { unlockedAt: "2026-01-05T00:00:00Z" },
      "total-50": { unlockedAt: "2026-02-15T00:00:00Z" },
    },
    dailyProgress: {
      "2026-03-08": {
        irodori: true,
        "kanji-kanaru": true,
        "quiz-traditional-color": true,
      },
    },
  };
}

beforeEach(() => {
  mockedUseAchievements.mockReset();
});

test("Achievements page renders heading", () => {
  mockedUseAchievements.mockReturnValue({
    store: createMockStore(),
    recordPlay: vi.fn(),
    newlyUnlocked: [],
    dismissNotifications: vi.fn(),
  });

  render(<AchievementsPage />);
  expect(
    screen.getByRole("heading", { level: 1, name: /実績ダッシュボード/ }),
  ).toBeInTheDocument();
});

test("Achievements page shows loading state when store is null", () => {
  mockedUseAchievements.mockReturnValue({
    store: null,
    recordPlay: vi.fn(),
    newlyUnlocked: [],
    dismissNotifications: vi.fn(),
  });

  render(<AchievementsPage />);
  expect(screen.getByText(/データを読み込み中/)).toBeInTheDocument();
});

test("Achievements page renders streak display", () => {
  mockedUseAchievements.mockReturnValue({
    store: createMockStore(),
    recordPlay: vi.fn(),
    newlyUnlocked: [],
    dismissNotifications: vi.fn(),
  });

  render(<AchievementsPage />);
  expect(
    screen.getByRole("heading", { level: 2, name: /ストリーク/ }),
  ).toBeInTheDocument();
  // Check streak values are present
  expect(screen.getByText("7")).toBeInTheDocument();
  expect(screen.getByText("14")).toBeInTheDocument();
});

test("Achievements page renders daily progress", () => {
  mockedUseAchievements.mockReturnValue({
    store: createMockStore(),
    recordPlay: vi.fn(),
    newlyUnlocked: [],
    dismissNotifications: vi.fn(),
  });

  render(<AchievementsPage />);
  expect(
    screen.getByRole("heading", { level: 2, name: /今日の進捗/ }),
  ).toBeInTheDocument();
  // Should show remaining count message
  expect(
    screen.getByText(/あと15つで今日の全コンプリート/),
  ).toBeInTheDocument();
});

test("Achievements page renders badge list", () => {
  mockedUseAchievements.mockReturnValue({
    store: createMockStore(),
    recordPlay: vi.fn(),
    newlyUnlocked: [],
    dismissNotifications: vi.fn(),
  });

  render(<AchievementsPage />);
  expect(
    screen.getByRole("heading", { level: 2, name: /バッジ一覧/ }),
  ).toBeInTheDocument();
  // Check badge counter
  expect(screen.getByText("5 / 14")).toBeInTheDocument();
});

test("Achievements page renders stats section", () => {
  mockedUseAchievements.mockReturnValue({
    store: createMockStore(),
    recordPlay: vi.fn(),
    newlyUnlocked: [],
    dismissNotifications: vi.fn(),
  });

  render(<AchievementsPage />);
  expect(
    screen.getByRole("heading", { level: 2, name: /統計/ }),
  ).toBeInTheDocument();
  expect(screen.getByText("42")).toBeInTheDocument(); // totalDaysPlayed
  expect(screen.getByText("100")).toBeInTheDocument(); // totalPlayCount (30+25+20+15+10)
});

test("Achievements page renders content display names in daily progress", () => {
  mockedUseAchievements.mockReturnValue({
    store: createMockStore(),
    recordPlay: vi.fn(),
    newlyUnlocked: [],
    dismissNotifications: vi.fn(),
  });

  render(<AchievementsPage />);
  // Check that content names are displayed in Japanese
  expect(screen.getByText("イロドリ")).toBeInTheDocument();
  expect(screen.getByText("漢字カナール")).toBeInTheDocument();
  expect(screen.getByText("四字キメル")).toBeInTheDocument();
});
