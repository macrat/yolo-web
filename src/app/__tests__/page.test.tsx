/**
 * トップページ（よろず屋の店先）のテスト — DESIGN.md フェーズ R・作り直し版
 *
 * 検証観点:
 * - 名乗り: h1 がページに1つ（サイト名）・site-concept の軸「やってみるサイト」・
 *   AI 運営の明示（constitution rule 3）
 * - 目玉（今日のためしどころ）: 成長エンジンの診断 character-personality を単一区画で立て、
 *   レジストリ由来のタイトルで実在パスへ／持ち帰れることの伝達（§7）／朱の入口／
 *   値札「24タイプ」。コピーの数値（12問・24タイプ）は診断データの出どころ値と一致する（ガード）。
 * - 棚（品書き）: 診断・占い・あそびの入口（目玉の character-personality は品書きから外す）と
 *   /play への全リンク導線
 * - 辞典・ツール（+ /tools 全リンク）・ブログ（/blog）の入口が実在ルートを指す
 * - DESIGN.md §3: 絵文字を持ち込まない（象徴絵文字は診断結果面の専用）
 * - metadata: 店先の description / OGP / twitter / canonical・noindex の不在
 */
import { expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Home, { metadata } from "../page";
import { playContentBySlug } from "@/play/registry";
import { quizBySlug, getResultIdsForQuiz } from "@/play/quiz/registry";
import { getContentPath } from "@/play/paths";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { getAllBlogPosts } from "@/blog/_lib/blog";

/** 目玉（今日のためしどころ）に立てる診断の slug（page.tsx の HERO_SLUG と同期）。 */
const HERO_SLUG = "character-personality";

/**
 * 「診断・占い・あそび」棚に並ぶ品書きの slug（page.tsx の FEATURED_PLAY と同期）。
 * 目玉に立てた character-personality は品書きから外す（同一診断を同じページで二度立てない）。
 */
const EXPECTED_FEATURED_SLUGS = [
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
  // 一言は文節ごとの span（inline-block）で組んでいるため、各文節を個別に検証する
  // （§3 の組版: 折り返しを文節境界だけで起こす。site-concept の軸「やってみるサイト」を含む）。
  expect(screen.getByText("読むだけのサイトではなく、")).toBeInTheDocument();
  expect(screen.getByText("やってみるサイト。")).toBeInTheDocument();
  // AI 運営の明示は平明な言葉で組む（内部の設計語彙を来訪者に見せない・DESIGN §6）。
  expect(
    screen.getByText(/運営しているのは人ではなくAIです/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/内容に誤りがあるかもしれません/),
  ).toBeInTheDocument();
});

// ===== 目玉（今日のためしどころ・焦点） =====

test("目玉は成長エンジンの診断を単一区画で立て、レジストリ由来のタイトルで実在パスへ向かう", () => {
  render(<Home />);
  const hero = screen.getByRole("region", { name: "あなたに似たキャラ診断" });
  const content = playContentBySlug.get(HERO_SLUG);
  expect(content, `"${HERO_SLUG}" がレジストリに存在しない`).toBeDefined();
  // 目玉の見出しはレジストリ由来のタイトル
  const heading = within(hero).getByRole("heading", { level: 2 });
  expect(heading).toHaveTextContent(content!.title);
  // 朱の入口「やってみる」は診断の正規パスへ
  const cta = within(hero).getByRole("link", { name: /やってみる/ });
  expect(cta).toHaveAttribute("href", getContentPath(content!));
});

test("目玉は持ち帰れることと結果タイプ数をトップで伝える（§7）", () => {
  render(<Home />);
  const hero = screen.getByRole("region", { name: "あなたに似たキャラ診断" });
  // §7 の増幅器: 持ち帰れることをトップで明示する。文言は平明な言葉で書く——
  // 内部の設計語彙（札）を来訪者に届く文へ出さない（§6）。
  expect(within(hero).getByText(/画像で保存できます/)).toBeInTheDocument();
  // 結果タイプ数の値札（実情報）
  expect(within(hero).getByText("24タイプ")).toBeInTheDocument();
});

test("目玉のコピーの数値は診断データの出どころ値と一致する（12問・24タイプ）", () => {
  // トップに書いた「12の問い」「24タイプ」が診断データの実値とずれないことを機械ガードする
  // （データが変わればこのテストが落ち、店先コピーの更新を強制する）。
  const quiz = quizBySlug.get(HERO_SLUG);
  expect(quiz?.meta.questionCount).toBe(12);
  expect(getResultIdsForQuiz(HERO_SLUG)).toHaveLength(24);
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
  // 目玉に立てた診断は品書きから外す（同じページで同一診断を二度立てない）。
  expect(EXPECTED_FEATURED_SLUGS).not.toContain(HERO_SLUG);
});

test("各品書きの品名は正規パスへのリンクで、レジストリ由来の表示名を持つ", () => {
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
    // 表示名は一覧・推薦と同じ shortTitle（DESIGN §6-4「行き先の名前を揃える」）。
    expect(link?.textContent ?? "").toContain(
      content.shortTitle ?? content.title,
    );
  }
});

test("「すべての診断・占い・ゲームを見る」→ /play への導線がある", () => {
  render(<Home />);
  const allLink = screen.getByRole("link", {
    name: "すべての診断・占い・ゲームを見る",
  });
  expect(allLink).toHaveAttribute("href", "/play");
});

// ===== 辞典・ツール・ブログ（実在ルートへの入口） =====

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

test("ツールの棚は代表的な入口と /tools への全リンクを持つ", () => {
  render(<Home />);
  const cases: [string, string][] = [
    ["文字数カウント", "/tools/char-count"],
    ["単位変換", "/tools/unit-converter"],
    ["JSON整形", "/tools/json-formatter"],
    ["QRコード生成", "/tools/qr-code"],
  ];
  for (const [label, href] of cases) {
    const link = screen.getByRole("link", { name: label });
    expect(link).toHaveAttribute("href", href);
  }
  const allTools = screen.getByRole("link", { name: "ツールをすべて見る" });
  expect(allTools).toHaveAttribute("href", "/tools");
});

test("ブログ棚は新しい記事と、/blog への入口を持つ", () => {
  render(<Home />);
  const posts = getAllBlogPosts().slice(0, 3);
  expect(posts.length).toBeGreaterThan(0);
  for (const post of posts) {
    const link = screen.getByRole("link", { name: post.title });
    expect(link).toHaveAttribute("href", `/blog/${post.slug}`);
  }
  const allPosts = screen.getByRole("link", { name: "ブログをすべて見る" });
  expect(allPosts).toHaveAttribute("href", "/blog");
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
