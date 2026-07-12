/**
 * トップページ（よろず屋の店構え）のテスト — DESIGN.md フェーズ R・C2 変換版
 *
 * 検証観点:
 * - 自己紹介: h1 がページに1つ（サイト名）・site-concept の軸「やってみるサイト」・
 *   AI 運営の明示（constitution rule 3）
 * - 棚（品書き）: 診断・占い・あそびの入口（レジストリ由来のタイトルで実在パスへ・
 *   先頭 character-personality）と /play への全リンク導線
 * - 辞典棚・道具棚（+ /tools 全リンク）・読みもの棚（/blog）の入口が実在ルートを指す
 * - DESIGN.md §3: 絵文字を持ち込まない（象徴絵文字は診断結果面の専用）
 * - metadata: 店構えの description / OGP / twitter / canonical・noindex の不在
 */
import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Home, { metadata } from "../page";
import { playContentBySlug } from "@/play/registry";
import { getContentPath } from "@/play/paths";
import { SITE_NAME, BASE_URL } from "@/lib/constants";

/** 「診断・占い・あそび」棚に並ぶ品書きの slug（page.tsx の FEATURED_PLAY と同期）。 */
const EXPECTED_FEATURED_SLUGS = [
  "character-personality",
  "word-sense-personality",
  "animal-personality",
  "traditional-color",
  "unexpected-compatibility",
  "contrarian-fortune",
  "nakamawake",
];

// ===== 自己紹介（店の名乗り） =====

test("h1 はページに1つで、サイト名を表示する", () => {
  render(<Home />);
  const h1s = screen.getAllByRole("heading", { level: 1 });
  expect(h1s).toHaveLength(1);
  expect(h1s[0]).toHaveTextContent(SITE_NAME);
});

test("site-concept の軸（やってみるサイト）と AI 運営の明示（rule 3）がある", () => {
  render(<Home />);
  expect(
    screen.getByText(/読むだけのサイトではなく、やってみるサイト/),
  ).toBeInTheDocument();
  expect(screen.getByText(/店主は人ではなくAIです/)).toBeInTheDocument();
  expect(
    screen.getByText(/内容に誤りがあるかもしれません/),
  ).toBeInTheDocument();
});

// ===== 診断・占い・あそび棚（品書き） =====

test("診断・占い・あそび棚の品書きは想定の slug がレジストリに実在する", () => {
  // page.tsx が参照する slug がすべてレジストリ（単一情報源）に存在することを保証する
  // （存在しない slug は描画時に除外され、静かに欠落するため）。
  for (const slug of EXPECTED_FEATURED_SLUGS) {
    expect(
      playContentBySlug.get(slug),
      `"${slug}" がレジストリに存在しない`,
    ).toBeDefined();
  }
  // 先頭は実測集客首位の character-personality（cycle-277 時点の実測）。
  expect(EXPECTED_FEATURED_SLUGS[0]).toBe("character-personality");
});

test("各品書きの品名は正規パスへのリンクで、レジストリ由来のタイトルを持つ", () => {
  const { container } = render(<Home />);
  for (const slug of EXPECTED_FEATURED_SLUGS) {
    const content = playContentBySlug.get(slug);
    if (content === undefined) continue;
    // href（正規パス = 単一情報源 paths.ts 由来）でリンクを特定し、
    // タイトルがレジストリ由来で描画されていることを確認する。
    const link = container.querySelector<HTMLAnchorElement>(
      `a[href="${getContentPath(content)}"]`,
    );
    expect(link, `"${slug}" の品名リンクが見つからない`).not.toBeNull();
    expect(link?.textContent ?? "").toContain(content.title);
  }
});

test("「すべての診断・占い・ゲームを見る」→ /play への導線がある", () => {
  render(<Home />);
  const allLink = screen.getByRole("link", {
    name: "すべての診断・占い・ゲームを見る",
  });
  expect(allLink).toHaveAttribute("href", "/play");
});

// ===== 辞典棚・道具棚・読みもの棚（実在ルートへの入口） =====

test("辞典棚は漢字・四字熟語・伝統色・ユーモアの実在ルートを指す", () => {
  render(<Home />);
  const cases: [string, string][] = [
    ["漢字辞典", "/dictionary/kanji"],
    ["四字熟語辞典", "/dictionary/yoji"],
    ["日本の伝統色", "/dictionary/colors"],
    ["ユーモア辞典", "/dictionary/humor"],
  ];
  for (const [label, href] of cases) {
    const link = screen.getByRole("link", { name: label });
    expect(link).toHaveAttribute("href", href);
  }
});

test("道具棚は代表的なツールの入口と /tools への全リンクを持つ", () => {
  render(<Home />);
  const cases: [string, string][] = [
    ["文字数カウント", "/tools/char-count"],
    ["単位換算", "/tools/unit-converter"],
    ["JSON整形", "/tools/json-formatter"],
    ["QRコード作成", "/tools/qr-code"],
  ];
  for (const [label, href] of cases) {
    const link = screen.getByRole("link", { name: label });
    expect(link).toHaveAttribute("href", href);
  }
  const allTools = screen.getByRole("link", { name: "すべての道具を見る" });
  expect(allTools).toHaveAttribute("href", "/tools");
});

test("読みもの棚はブログ（/blog）への入口を持つ", () => {
  render(<Home />);
  const blog = screen.getByRole("link", { name: "ブログ" });
  expect(blog).toHaveAttribute("href", "/blog");
});

// ===== DESIGN.md 準拠（トップに絵文字を持ち込まない） =====

test("ページに絵文字を含まない（DESIGN.md §3）", () => {
  const { container } = render(<Home />);
  expect(container.textContent ?? "").not.toMatch(/\p{Extended_Pictographic}/u);
});

// ===== metadata（店構え） =====

test("metadata title はサイト名そのもの", () => {
  expect(metadata.title).toBe(SITE_NAME);
});

test("metadata description は店構え（よろず屋・やってみる）で、旧・道具箱中心ではない", () => {
  const description = metadata.description as string;
  expect(description).toMatch(/よろず屋/);
  expect(description).toMatch(/ためして/);
  // 旧トップの「無料のオンラインツールを集めたサイト」型の自己定義に戻っていない
  expect(description).not.toMatch(/ツールを集めたサイト/);
});

test("OGP / twitter description も店構えで、canonical はサイトルート", () => {
  const og = metadata.openGraph as Record<string, unknown>;
  const twitter = metadata.twitter as Record<string, unknown>;
  for (const description of [og.description, twitter.description]) {
    expect(description).toBeDefined();
    expect(description as string).toMatch(/よろず屋/);
  }
  expect(og.url).toBe(BASE_URL);
  expect(og.siteName).toBe(SITE_NAME);
  expect((twitter as { card?: string }).card).toBe("summary_large_image");
});

test("canonical はサイトルートで、noindex（robots）が紛れ込んでいない", () => {
  expect(metadata.alternates?.canonical).toBe(BASE_URL);
  expect(metadata.robots).toBeUndefined();
});
