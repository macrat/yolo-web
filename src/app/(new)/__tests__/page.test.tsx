/**
 * トップページ（道具箱）のテスト — cycle-232 T-3（Phase 10.3 本公開）
 *
 * 検証観点:
 * - intro: h1 がページに1つ（サイト名）・一行コンセプト・AI 運営の明示
 *   （constitution rule 3）・/tools への発見導線
 * - 道具箱本体: デフォルト構成（daily-life プリセット6枚）が描画される
 *   （空状態を見せない）。道具箱の操作系の網羅検証は
 *   toolbox/__tests__/ToolboxContent.test.tsx が担う
 * - DESIGN.md 準拠: 絵文字なし（旧トップの絵文字装飾を持ち込まない）
 * - metadata: 新コンセプトの description / OGP / twitter / canonical。
 *   旧コンセプト（占い・診断パーク）文言の根絶と noindex の不在
 */
import { beforeEach, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Home, { metadata } from "../page";
import { DEFAULT_TOOLBOX_ITEM_IDS } from "../toolbox/toolbox-presets";
import { SITE_NAME, BASE_URL } from "@/lib/constants";

beforeEach(() => {
  window.localStorage.clear();
});

// ===== intro（サイト説明） =====

test("h1 はページに1つで、サイト名を表示する", () => {
  render(<Home />);
  const h1s = screen.getAllByRole("heading", { level: 1 });
  expect(h1s).toHaveLength(1);
  expect(h1s[0]).toHaveTextContent(SITE_NAME);
});

test("一行コンセプト（日常の傍にある道具）と AI 運営の明示（rule 3）がある", () => {
  render(<Home />);
  expect(
    screen.getByText(/日常のちょっとした作業の傍で使える道具/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/AIが企画・運営する実験的なサイトです/),
  ).toBeInTheDocument();
});

test("/tools（すべての道具の一覧）への発見導線がある", () => {
  render(<Home />);
  const toolsLink = screen.getByRole("link", { name: "ツール一覧" });
  expect(toolsLink).toHaveAttribute("href", "/tools");
});

// ===== 道具箱本体（デフォルト構成） =====

test("初回来訪者（localStorage なし）はデフォルト構成（daily-life 6枚）の道具箱を見る", () => {
  const { container } = render(<Home />);
  const tiles = container.querySelectorAll("[class*='tileWrapper']");
  expect(tiles).toHaveLength(DEFAULT_TOOLBOX_ITEM_IDS.length);
  // 空状態の案内が出ていない（移行計画 10.3「初回来訪者に空状態を見せない」）
  expect(screen.queryByText(/道具箱が空です/)).not.toBeInTheDocument();
  // 道具箱のセクション（プリセット・追加）が h2 として存在し h1 と衝突しない
  expect(
    screen.getByRole("heading", { level: 2, name: "プリセットから始める" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 2, name: "タイルを追加" }),
  ).toBeInTheDocument();
});

// ===== DESIGN.md 準拠（旧トップの絵文字装飾を持ち込まない） =====

test("ページに絵文字を含まない（DESIGN.md §3）", () => {
  const { container } = render(<Home />);
  expect(container.textContent ?? "").not.toMatch(/\p{Extended_Pictographic}/u);
});

// ===== metadata（新コンセプトへの全面刷新） =====

test("metadata title はサイト名そのもの", () => {
  expect(metadata.title).toBe(SITE_NAME);
});

test("metadata description は新コンセプト（ツール・道具箱）で、占い・診断パーク文言を含まない", () => {
  const description = metadata.description as string;
  expect(description).toMatch(/ツール/);
  expect(description).toMatch(/道具箱/);
  expect(description).not.toMatch(/占い|診断/);
});

test("OGP / twitter description も新コンセプトで、占い・診断パーク文言を含まない", () => {
  const og = metadata.openGraph as Record<string, unknown>;
  const twitter = metadata.twitter as Record<string, unknown>;
  for (const description of [og.description, twitter.description]) {
    expect(description).toBeDefined();
    expect(description as string).toMatch(/ツール/);
    expect(description as string).not.toMatch(/占い|診断/);
  }
  expect(og.url).toBe(BASE_URL);
  expect(og.siteName).toBe(SITE_NAME);
  expect((twitter as { card?: string }).card).toBe("summary_large_image");
});

test("canonical はサイトルートで、noindex（robots）が紛れ込んでいない", () => {
  expect(metadata.alternates?.canonical).toBe(BASE_URL);
  // 旧 /toolbox プレビューの noindex はページごと消えた。トップは index 可能
  // （robots 指定なし = (new)/layout.tsx の sharedMetadata で index: true を継承）
  expect(metadata.robots).toBeUndefined();
});
