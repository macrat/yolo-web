/**
 * トップページ（診断中心の着地面）のテスト — cycle-276 / B-545 決定(a)・B-542
 *
 * 検証観点:
 * - intro: h1 がページに1つ（サイト名）・一行コンセプト・AI 運営の明示
 *   （constitution rule 3）
 * - 主役セクション「自分を発見する」: 厳選した診断カードが /play/<slug> へ
 *   リンクし、「すべての診断・占い・ゲームを見る」→ /play の導線がある
 * - 二次導線: 辞典 /dictionary・ツール /tools・道具箱 /toolbox への控えめな導線
 * - DESIGN.md §3: ページ自身の chrome に新規の装飾絵文字を持ち込まない
 * - metadata: 診断中心の自己定義（description に「診断」・「無料オンライン
 *   ツールを集めた」自己定義をやめる）・OGP / twitter / canonical・noindex の不在
 */
import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Home, { metadata } from "../page";
import { SITE_NAME, BASE_URL } from "@/lib/constants";

// ===== intro（サイトの自己定義） =====

test("h1 はページに1つで、サイト名を表示する", () => {
  render(<Home />);
  const h1s = screen.getAllByRole("heading", { level: 1 });
  expect(h1s).toHaveLength(1);
  expect(h1s[0]).toHaveTextContent(SITE_NAME);
});

test("一行コンセプト（自分を知り、楽しむ）と AI 運営の明示（rule 3）がある", () => {
  render(<Home />);
  expect(
    screen.getByText(/自分を知り、楽しむ。そのための場所。/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/AIが企画・運営する実験的なサイトです/),
  ).toBeInTheDocument();
});

// ===== 主役セクション（自分を発見する体験への導線） =====

test("主役セクション見出し「自分を発見する」が h2 として存在する", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { level: 2, name: "自分を発見する" }),
  ).toBeInTheDocument();
});

test("厳選した診断カードが /play/<slug> へリンクする（最大の character-personality を含む）", () => {
  render(<Home />);
  const link = screen.getByRole("link", { name: /あなたに似たキャラ診断/ });
  expect(link).toHaveAttribute("href", "/play/character-personality");
});

test("診断カードの見出しは h3（h1/セクション h2 の下位）", () => {
  render(<Home />);
  const h3s = screen.getAllByRole("heading", { level: 3 });
  // 厳選カードぶんの h3 が存在する（全リストの複製ではない少数）
  expect(h3s.length).toBeGreaterThanOrEqual(3);
  expect(h3s.length).toBeLessThanOrEqual(8);
});

test("「すべての診断・占い・ゲームを見る」→ /play への明確な導線がある", () => {
  render(<Home />);
  const link = screen.getByRole("link", {
    name: "すべての診断・占い・ゲームを見る",
  });
  expect(link).toHaveAttribute("href", "/play");
});

// ===== 二次導線（実用・文化層。主役にしない） =====

test("辞典・ツール・道具箱への二次導線がある", () => {
  render(<Home />);
  expect(screen.getByRole("link", { name: "辞典" })).toHaveAttribute(
    "href",
    "/dictionary",
  );
  expect(screen.getByRole("link", { name: "ツール" })).toHaveAttribute(
    "href",
    "/tools",
  );
  expect(screen.getByRole("link", { name: "道具箱" })).toHaveAttribute(
    "href",
    "/toolbox",
  );
});

// ===== DESIGN.md 準拠（新規の装飾絵文字を持ち込まない） =====

test("ページに絵文字を含まない（DESIGN.md §3。カードに icon 絵文字を出さない）", () => {
  const { container } = render(<Home />);
  expect(container.textContent ?? "").not.toMatch(/\p{Extended_Pictographic}/u);
});

// ===== metadata（診断中心の自己定義へ刷新） =====

test("metadata title はサイト名そのもの", () => {
  expect(metadata.title).toBe(SITE_NAME);
});

test("metadata description は診断中心の自己定義で、「無料オンラインツールを集めた」自己定義を含まない", () => {
  const description = metadata.description as string;
  expect(description).toMatch(/診断/);
  expect(description).not.toMatch(/無料のオンラインツールを集めた/);
  expect(description).not.toMatch(/オンラインツールを集めたサイト/);
});

test("OGP / twitter description も診断中心で、canonical はサイトルート", () => {
  const og = metadata.openGraph as Record<string, unknown>;
  const twitter = metadata.twitter as Record<string, unknown>;
  for (const description of [og.description, twitter.description]) {
    expect(description).toBeDefined();
    expect(description as string).toMatch(/診断/);
  }
  expect(og.url).toBe(BASE_URL);
  expect(og.siteName).toBe(SITE_NAME);
  expect((twitter as { card?: string }).card).toBe("summary_large_image");
  expect(metadata.alternates?.canonical).toBe(BASE_URL);
});

test("noindex（robots）が紛れ込んでいない（トップは index 可能）", () => {
  // robots 指定なし = (new)/layout.tsx の sharedMetadata で index: true を継承
  expect(metadata.robots).toBeUndefined();
});
