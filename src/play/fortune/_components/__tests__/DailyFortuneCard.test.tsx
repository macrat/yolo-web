/**
 * Tests for DailyFortuneCard component.
 *
 * DailyFortuneCard is a Client Component that:
 * - Shows a loading state on SSR (state is null initially via server snapshot)
 * - Shows fortune data (title, description, luckyItem, luckyAction) after mount
 * - Records play via useAchievements after state is set
 *
 * Hydration Error prevention:
 * - useSyncExternalStore is used with a server snapshot that returns null
 * - This ensures SSR output and first client render output match (both null/loading)
 * - The client snapshot computes the actual fortune from localStorage
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { render, screen, act } from "@testing-library/react";
import DailyFortuneCard from "../DailyFortuneCard";

// Mock fortune logic to return deterministic values
vi.mock("@/play/fortune/logic", () => ({
  getUserSeed: () => 12345,
  selectFortune: () => ({
    id: "test-fortune",
    title: "テスト運勢タイトル",
    description: "テスト用の運勢説明文",
    luckyItem: "テストアイテム",
    luckyAction: "テストアクション",
    rating: 3.5,
  }),
}));

// Mock date utility
vi.mock("@/lib/achievements/date", () => ({
  getTodayJst: () => "2026-03-28",
}));

// Mock useAchievements
const mockRecordPlay = vi.fn();
vi.mock("@/lib/achievements/useAchievements", () => ({
  useAchievements: () => ({ recordPlay: mockRecordPlay }),
}));

// Mock ShareButtons to avoid complex dependencies
vi.mock("@/play/quiz/_components/ShareButtons", () => ({
  default: ({ shareText }: { shareText: string }) => (
    <div data-testid="share-buttons">{shareText}</div>
  ),
}));

// Import resetFortuneCache to ensure test isolation across date changes
import { resetFortuneCache } from "@/play/fortune/fortuneStore";

const SOURCE_PATH = resolve(__dirname, "../DailyFortuneCard.tsx");

describe("DailyFortuneCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module-scope cache so each test starts with a clean state.
    // Without this, a cache populated by a previous test (possibly with a
    // different date) would persist and cause flaky behavior.
    resetFortuneCache();
  });

  it("renders fortune title after mount", async () => {
    await act(async () => {
      render(<DailyFortuneCard />);
    });
    expect(screen.getByText("テスト運勢タイトル")).toBeInTheDocument();
  });

  it("renders fortune description after mount", async () => {
    await act(async () => {
      render(<DailyFortuneCard />);
    });
    expect(screen.getByText("テスト用の運勢説明文")).toBeInTheDocument();
  });

  it("renders lucky item after mount", async () => {
    await act(async () => {
      render(<DailyFortuneCard />);
    });
    expect(screen.getByText("テストアイテム")).toBeInTheDocument();
  });

  it("renders lucky action after mount", async () => {
    await act(async () => {
      render(<DailyFortuneCard />);
    });
    expect(screen.getByText("テストアクション")).toBeInTheDocument();
  });

  it("renders formatted date after mount", async () => {
    await act(async () => {
      render(<DailyFortuneCard />);
    });
    // "2026-03-28" should become "2026年3月28日の運勢"
    expect(screen.getByText("2026年3月28日の運勢")).toBeInTheDocument();
  });

  it("renders comeback message", async () => {
    await act(async () => {
      render(<DailyFortuneCard />);
    });
    expect(
      screen.getByText("明日も来てね! 毎日運勢が変わります"),
    ).toBeInTheDocument();
  });

  it("calls recordPlay after fortune state is set", async () => {
    await act(async () => {
      render(<DailyFortuneCard />);
    });
    expect(mockRecordPlay).toHaveBeenCalledWith("fortune-daily");
    expect(mockRecordPlay).toHaveBeenCalledTimes(1);
  });

  it("does not call recordPlay more than once on re-render", async () => {
    const { rerender } = await act(async () => render(<DailyFortuneCard />));
    await act(async () => {
      rerender(<DailyFortuneCard />);
    });
    expect(mockRecordPlay).toHaveBeenCalledTimes(1);
  });
});

describe("DailyFortuneCard Hydration Error prevention (source code verification)", () => {
  const sourceCode = readFileSync(SOURCE_PATH, "utf-8");

  it("does NOT use lazy initializer useState(computeInitialFortune)", () => {
    // Hydration Error の原因: useState(computeInitialFortune) の lazy initializer は
    // SSR では null を返すが、クライアント初回レンダリングでは window が存在するため
    // 実際の運勢データを返してしまい、SSR とクライアントの出力が不一致になる。
    // 修正後は useSyncExternalStore を使い、server snapshot で null を返す。
    expect(sourceCode).not.toMatch(/useState\(computeInitialFortune\)/);
  });

  it("uses useSyncExternalStore for hydration-safe fortune computation", () => {
    // useSyncExternalStore の server snapshot (第3引数) で null を返すことで
    // SSR とクライアントの初回レンダリング出力を一致させる。
    expect(sourceCode).toMatch(/useSyncExternalStore/);
  });

  it("provides a server snapshot function that returns null to prevent hydration mismatch", () => {
    // server snapshot 関数は SSR 時に null を返すこと。
    // DailyFortuneCard は fortuneStore から getFortuneServerSnapshot をインポートする。
    expect(sourceCode).toMatch(/getFortuneServerSnapshot/);
  });

  it("does NOT use setState(computeInitialFortune()) pattern", () => {
    // 旧パターン (useEffect + setState) は使われていないこと。
    expect(sourceCode).not.toMatch(/setState\(computeInitialFortune\(\)\)/);
  });

  it("imports store functions from fortuneStore module (no duplicate store implementation)", () => {
    // ストア実装が fortuneStore モジュールに集約されており、
    // DailyFortuneCard 内にストアのキャッシュ変数が定義されていないこと。
    expect(sourceCode).toMatch(/from "@\/play\/fortune\/fortuneStore"/);
    // モジュールスコープのキャッシュ変数が DailyFortuneCard 内に定義されていないこと
    expect(sourceCode).not.toMatch(/^let fortuneCache/m);
    expect(sourceCode).not.toMatch(/^let fortuneListeners/m);
  });
});
