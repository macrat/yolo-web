/**
 * トップページ（診断中心の着地面）のテスト — cycle-277 T6-c / B-545 決定(a)
 *
 * 検証観点:
 * - intro: h1 がページに1つ（サイト名）・自己定義「自分を知り、楽しむ」・
 *   AI 運営の明示（constitution rule 3）
 * - 主役セクション: 厳選診断カード（件数・先頭 character-personality・
 *   全 slug がレジストリに実在・personality/fortune 系に絞る・href が正規パス）と
 *   /play への全リンク導線
 * - 二次セクション: 辞典 /dictionary・ツール /tools の控えめな導線
 * - DESIGN.md §3: 絵文字を持ち込まない（象徴絵文字は診断結果面の専用）
 * - metadata: 診断中心の description / OGP / twitter / canonical・noindex の不在
 */
import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Home, { metadata } from "../page";
import { playContentBySlug } from "@/play/registry";
import { getContentPath } from "@/play/paths";
import { SITE_NAME, BASE_URL } from "@/lib/constants";

/** 主役セクションに並ぶ厳選診断の slug（page.tsx の FEATURED_SLUGS と同期）。 */
const EXPECTED_FEATURED_SLUGS = [
  "character-personality",
  "word-sense-personality",
  "animal-personality",
  "traditional-color",
  "unexpected-compatibility",
  "contrarian-fortune",
];

// ===== intro（サイト説明） =====

test("h1 はページに1つで、サイト名を表示する", () => {
  render(<Home />);
  const h1s = screen.getAllByRole("heading", { level: 1 });
  expect(h1s).toHaveLength(1);
  expect(h1s[0]).toHaveTextContent(SITE_NAME);
});

test("自己定義（自分を知り、楽しむ）と AI 運営の明示（rule 3）がある", () => {
  render(<Home />);
  expect(
    screen.getByText(/自分を知り、楽しむ。そのための場所。/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/AIが企画・運営する実験的なサイトです/),
  ).toBeInTheDocument();
});

// ===== 主役セクション（厳選診断カード） =====

test("厳選診断カードは想定した件数・順序で、全 slug がレジストリに実在する", () => {
  // page.tsx が参照する EXPECTED_FEATURED_SLUGS がレジストリ（単一情報源）に
  // すべて存在することを保証する（存在しない slug は描画時に静かに脱落するため）。
  for (const slug of EXPECTED_FEATURED_SLUGS) {
    expect(
      playContentBySlug.get(slug),
      `"${slug}" がレジストリに存在しない`,
    ).toBeDefined();
  }
  // 先頭は実測集客首位の character-personality（cycle-277 時点の実測。rebuild-plan フェーズ R で再設計予定）。
  expect(EXPECTED_FEATURED_SLUGS[0]).toBe("character-personality");
  expect(EXPECTED_FEATURED_SLUGS).toHaveLength(6);
});

test("厳選診断はすべて personality/fortune 系（知識クイズを混ぜない・§7）", () => {
  // §7: 固有色・象徴を主役にする表現は性格・キャラ診断系で最も効き、知識
  // クイズ系には一律適用しない。主役カードは診断系に絞る。
  for (const slug of EXPECTED_FEATURED_SLUGS) {
    const content = playContentBySlug.get(slug);
    expect(content?.category).not.toBe("knowledge");
    expect(content?.category).not.toBe("game");
  }
});

test("主役セクションのカードは厳選 slug とちょうど同数（勝手な増減の回帰検出）", () => {
  const { container } = render(<Home />);
  // カードは「自分を発見する」セクションのリスト項目として描画される。
  // page.tsx 側で厳選外のカードを足しても素通りしないよう件数を完全一致で縛る。
  const cards = container.querySelectorAll(
    'section[aria-labelledby="featured-heading"] ul > li',
  );
  expect(cards).toHaveLength(EXPECTED_FEATURED_SLUGS.length);
});

test("各診断カードは正規パスへのリンクと、レジストリ由来のタイトルを持つ", () => {
  const { container } = render(<Home />);
  for (const slug of EXPECTED_FEATURED_SLUGS) {
    const content = playContentBySlug.get(slug);
    if (content === undefined) continue;
    // href（正規パス = 単一情報源 paths.ts 由来）でカードリンクを特定し、
    // タイトルがレジストリ由来で描画されていることを併せて確認する。
    const link = container.querySelector<HTMLAnchorElement>(
      `a[href="${getContentPath(content)}"]`,
    );
    expect(link, `"${slug}" のカードリンクが見つからない`).not.toBeNull();
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

// ===== 二次セクション（支え層・道具層への控えめな導線） =====

test("辞典・ツールへの二次導線がある", () => {
  render(<Home />);
  const cases: [string, string][] = [
    ["辞典", "/dictionary"],
    ["ツール", "/tools"],
  ];
  for (const [label, href] of cases) {
    const link = screen.getByRole("link", { name: label });
    expect(link).toHaveAttribute("href", href);
  }
});

// ===== DESIGN.md 準拠（トップに絵文字を持ち込まない） =====

test("ページに絵文字を含まない（DESIGN.md §3）", () => {
  const { container } = render(<Home />);
  expect(container.textContent ?? "").not.toMatch(/\p{Extended_Pictographic}/u);
});

// ===== metadata（診断中心） =====

test("metadata title はサイト名そのもの", () => {
  expect(metadata.title).toBe(SITE_NAME);
});

test("metadata description は診断中心で、旧・道具箱中心の自己定義ではない", () => {
  const description = metadata.description as string;
  expect(description).toMatch(/診断/);
  expect(description).toMatch(/自分を知り、楽しむ/);
  // 旧トップの「無料のオンラインツールを集めたサイト」型の自己定義に戻っていない
  expect(description).not.toMatch(/ツールを集めたサイト/);
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
});

test("canonical はサイトルートで、noindex（robots）が紛れ込んでいない", () => {
  expect(metadata.alternates?.canonical).toBe(BASE_URL);
  expect(metadata.robots).toBeUndefined();
});
