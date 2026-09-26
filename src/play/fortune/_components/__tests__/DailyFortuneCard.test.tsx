/**
 * DailyFortuneCard のテスト。サーバーの描画と最初の描画では占っていることを字で言い、読み込んだあとに
 * 端末の種で選んだ運勢を結果のボックスに出す。
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { render, screen, act, within } from "@testing-library/react";
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

// Mock date utility (fortuneStore reads getTodayJst from crossGameProgress)
vi.mock("@/play/games/shared/_lib/crossGameProgress", () => ({
  getTodayJst: () => "2026-03-28",
}));

// Mock ShareButtons to avoid complex dependencies
vi.mock("@/components/ShareButtons", () => ({
  default: ({ text }: { text: string }) => (
    <div data-testid="share-buttons">{text}</div>
  ),
}));

// Import resetFortuneCache to ensure test isolation across date changes
import { resetFortuneCache } from "@/play/fortune/fortuneStore";

const HEADINGS = {
  "test-fortune": { phrases: ["テスト運勢", "タイトル"] },
};

const SOURCE_PATH = resolve(__dirname, "../DailyFortuneCard.tsx");

describe("DailyFortuneCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module-scope cache so each test starts with a clean state.
    // Without this, a cache populated by a previous test (possibly with a
    // different date) would persist and cause flaky behavior.
    resetFortuneCache();
  });

  it("renders the fortune name as the heading of the result box", async () => {
    await act(async () => {
      render(<DailyFortuneCard headings={HEADINGS} />);
    });
    const heading = screen.getByRole("heading", {
      level: 2,
      name: "テスト運勢タイトル",
    });
    expect(heading.querySelectorAll("wbr")).toHaveLength(1);
    expect(
      screen.getByRole("region", { name: "テスト運勢タイトル" }),
    ).toContainElement(heading);
  });

  it("renders the stars inside the result box with the rating as one name", async () => {
    await act(async () => {
      render(<DailyFortuneCard headings={HEADINGS} />);
    });
    const region = screen.getByRole("region", { name: "テスト運勢タイトル" });
    expect(
      within(region).getByRole("img", { name: "5つ星のうち3.5" }),
    ).toBeInTheDocument();
  });

  it("puts the share buttons right after the result box under a heading", async () => {
    await act(async () => {
      render(<DailyFortuneCard headings={HEADINGS} />);
    });
    const region = screen.getByRole("region", { name: "テスト運勢タイトル" });
    const share = screen.getByRole("region", { name: "この結果を共有" });
    expect(region.nextElementSibling).toBe(share);
    expect(within(share).getByTestId("share-buttons")).toBeInTheDocument();
  });

  it("does not animate the result box, since it appears on opening the page", async () => {
    await act(async () => {
      render(<DailyFortuneCard headings={HEADINGS} />);
    });
    const region = screen.getByRole("region", { name: "テスト運勢タイトル" });
    expect(region.className).not.toMatch(/appears/);
  });

  it("renders fortune description after mount", async () => {
    await act(async () => {
      render(<DailyFortuneCard headings={HEADINGS} />);
    });
    expect(screen.getByText("テスト用の運勢説明文")).toBeInTheDocument();
  });

  it("renders lucky item after mount", async () => {
    await act(async () => {
      render(<DailyFortuneCard headings={HEADINGS} />);
    });
    expect(screen.getByText("テストアイテム")).toBeInTheDocument();
  });

  it("renders lucky action after mount", async () => {
    await act(async () => {
      render(<DailyFortuneCard headings={HEADINGS} />);
    });
    expect(screen.getByText("テストアクション")).toBeInTheDocument();
  });

  it("renders the date as the caption of the result box", async () => {
    await act(async () => {
      render(<DailyFortuneCard headings={HEADINGS} />);
    });
    expect(screen.getByText("2026年3月28日のユーモア運勢")).toBeInTheDocument();
  });

  it("renders comeback message", async () => {
    await act(async () => {
      render(<DailyFortuneCard headings={HEADINGS} />);
    });
    expect(
      screen.getByText("明日も来てね! 毎日運勢が変わります"),
    ).toBeInTheDocument();
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
