/**
 * Tests for FortunePreview component.
 *
 * FortunePreview is a Client Component that:
 * - Shows a loading state on SSR (window === undefined)
 * - Shows fortune title, star rating teaser, and CTA link after mount
 * - Displays a "毎日更新" badge
 * - Links to /play/daily
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { render, screen } from "@testing-library/react";
import FortunePreview from "../FortunePreview";

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
  getTodayJst: () => "2026-03-18",
}));

// Import resetFortuneCache to ensure test isolation across date changes
import { resetFortuneCache } from "@/play/fortune/fortuneStore";

const SOURCE_PATH = resolve(__dirname, "../FortunePreview.tsx");

describe("FortunePreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module-scope cache so each test starts with a clean state.
    // Without this, a cache populated by a previous test (possibly with a
    // different date) would persist and cause flaky behavior.
    resetFortuneCache();
  });

  it("renders the section heading", () => {
    render(<FortunePreview />);
    expect(
      screen.getByRole("heading", { name: /今日のユーモア運勢/ }),
    ).toBeInTheDocument();
  });

  it("renders the 毎日更新 badge", () => {
    render(<FortunePreview />);
    expect(screen.getByText("毎日更新")).toBeInTheDocument();
  });

  it("renders a link to /play/daily", () => {
    render(<FortunePreview />);
    const link = screen.getByRole("link", { name: /今日の運勢を見る/ });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/play/daily");
  });

  it("renders fortune title when mounted (window available)", () => {
    render(<FortunePreview />);
    // After mount, fortune title should be visible (not loading state)
    expect(screen.getByText("テスト運勢タイトル")).toBeInTheDocument();
  });

  it("renders star rating display", () => {
    render(<FortunePreview />);
    // Rating value 3.5 should appear somewhere in the component
    expect(screen.getByText(/3\.5/)).toBeInTheDocument();
  });
});

describe("FortunePreview.module.css", () => {
  const cssPath = resolve(__dirname, "../FortunePreview.module.css");
  const cssContent = readFileSync(cssPath, "utf-8");

  it(".card has :focus-visible style for keyboard accessibility", () => {
    // カード全体が <Link> なのでキーボード操作時にフォーカスが見えるよう
    // .card:focus-visible にアウトラインスタイルが必要
    expect(cssContent).toMatch(/\.card:focus-visible\s*\{/);
  });

  it(".card:focus-visible has outline property", () => {
    // outline プロパティでフォーカスリングを描画する
    const focusVisibleBlock = cssContent.match(
      /\.card:focus-visible\s*\{([^}]*)\}/,
    );
    expect(focusVisibleBlock).not.toBeNull();
    expect(focusVisibleBlock![1]).toMatch(/outline\s*:/);
  });

  it("StarRating.module.css has .emptyStar class for gray empty stars", () => {
    // B-334-4-2: .emptyStar は StarRating コンポーネント固有のクラス。
    // FortunePreview.module.css では不要（StarRating.module.css で管理）。
    // empty star と filled star の視覚的区別が StarRating 側で保証されることを検証する。
    const starRatingCssPath = resolve(__dirname, "../StarRating.module.css");
    const starRatingCssContent = readFileSync(starRatingCssPath, "utf-8");
    expect(starRatingCssContent).toMatch(/\.emptyStar\s*\{/);
  });

  it("StarRating.module.css .emptyStar has color property set to gray tone", () => {
    // empty star はグレー系の色で filled star と区別する
    const starRatingCssPath = resolve(__dirname, "../StarRating.module.css");
    const starRatingCssContent = readFileSync(starRatingCssPath, "utf-8");
    const emptyStarBlock = starRatingCssContent.match(
      /\.emptyStar\s*\{([^}]*)\}/,
    );
    expect(emptyStarBlock).not.toBeNull();
    expect(emptyStarBlock![1]).toMatch(/color\s*:/);
  });

  it(".section has margin-top (Panel 化により section 間余白は margin で管理)", () => {
    // B-334-4-2: FortunePreview は Panel に入れたため、Panel 自体の
    // border/padding がセクションの外枠を提供する。
    // section 間の余白は margin-top で管理する（padding は Panel が担当）。
    const sectionBlock = cssContent.match(/\.section\s*\{([^}]*)\}/);
    expect(sectionBlock).not.toBeNull();
    expect(sectionBlock![1]).toMatch(/margin-top\s*:/);
  });

  it(".card has min-height to prevent CLS during SSR-to-client transition", () => {
    // SSR 時のローディング状態とクライアントマウント後の表示状態で
    // カード高さが変わることによる CLS を防ぐため、min-height が必要
    const cardBlock = cssContent.match(/\.card\s*\{([^}]*)\}/);
    expect(cardBlock).not.toBeNull();
    expect(cardBlock![1]).toMatch(/min-height\s*:/);
  });
});

describe("StarRatingTeaser empty star markup", () => {
  beforeEach(() => {
    resetFortuneCache();
  });

  it("renders empty stars wrapped in span with emptyStar class", () => {
    render(<FortunePreview />);
    // rating=3.5 のとき: filled=3★, half=1☆, empty=1☆
    // empty stars は .emptyStar クラスの span で囲まれていること
    const starsContainer = screen.getByLabelText("3.5 / 5");
    const emptyStarSpan = starsContainer.querySelector('[class*="emptyStar"]');
    expect(emptyStarSpan).not.toBeNull();
    // empty star の文字が含まれていること
    expect(emptyStarSpan!.textContent).toMatch(/☆/);
  });
});

describe("FortunePreview useSyncExternalStore pattern (source code verification)", () => {
  const sourceCode = readFileSync(SOURCE_PATH, "utf-8");

  it("uses useSyncExternalStore for hydration-safe fortune computation", () => {
    // useSyncExternalStore の server snapshot (第3引数) で null を返すことで
    // SSR とクライアントの初回レンダリング出力を一致させる。
    expect(sourceCode).toMatch(/useSyncExternalStore/);
  });

  it("imports store functions from fortuneStore module (no duplicate store implementation)", () => {
    // ストア実装が fortuneStore モジュールに集約されており、
    // FortunePreview 内にストアのキャッシュ変数が定義されていないこと。
    expect(sourceCode).toMatch(/from "@\/play\/fortune\/fortuneStore"/);
    // モジュールスコープのキャッシュ変数が FortunePreview 内に定義されていないこと
    expect(sourceCode).not.toMatch(/^let fortuneCache/m);
    expect(sourceCode).not.toMatch(/^let fortuneListeners/m);
  });

  it("imports getFortuneServerSnapshot from fortuneStore", () => {
    // server snapshot は fortuneStore から提供されること
    expect(sourceCode).toMatch(/getFortuneServerSnapshot/);
  });

  it("imports subscribeFortuneStore from fortuneStore", () => {
    // subscribe 関数も fortuneStore から提供されること
    expect(sourceCode).toMatch(/subscribeFortuneStore/);
  });
});
