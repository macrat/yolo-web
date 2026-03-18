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

describe("FortunePreview", () => {
  beforeEach(() => {
    // Ensure localStorage is available in tests (jsdom provides window)
    vi.clearAllMocks();
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
});
