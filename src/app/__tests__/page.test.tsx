/**
 * トップページのテスト。
 *
 * - 名乗り: h1 はページに1つでサイト名。「やってみるサイト」と AI が運営していることの明示（constitution rule 3）
 * - 目玉（今日のためしどころ）: character-personality をセクションで立て、レジストリの名前で実在のパスへ向かう。
 *   目玉の文の数（12問・24タイプ）は診断データの値と一致する
 * - 分野ごとのセクション: 診断・占い・あそび（目玉の診断は並べない）・辞典・道具・読みものの入口が実在のルートを指す
 * - ページはセクションを並べ、どの見出しも文節の区切りで組む（DESIGN.md §4・§5）
 * - 絵文字を持たない（§5）
 * - metadata: description・OGP・twitter・canonical と、noindex を持たないこと
 */
import { expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import phrasedStyles from "@/components/PhrasedText/PhrasedText.module.css";
import sectionStyles from "@/components/Section/Section.module.css";
import Home, { metadata } from "../page";
import { playContentBySlug } from "@/play/registry";
import { quizBySlug, getResultIdsForQuiz } from "@/play/quiz/registry";
import { getContentPath } from "@/play/paths";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { followsPhraseRules, splitIntoPhrases } from "@/lib/phrase-breaks";

/** 目玉（今日のためしどころ）に立てる診断の slug（page.tsx の HERO_SLUG）。 */
const HERO_SLUG = "character-personality";

/** 「診断・占い・あそび」のセクションに並ぶ slug（page.tsx の FEATURED_PLAY）。目玉の診断は入らない。 */
const EXPECTED_FEATURED_SLUGS = [
  "word-sense-personality",
  "animal-personality",
  "traditional-color",
  "unexpected-compatibility",
  "contrarian-fortune",
  "nakamawake",
];

// ===== 名乗り =====

test("h1 はページに1つで、サイト名を表示する", () => {
  render(<Home />);
  const h1s = screen.getAllByRole("heading", { level: 1 });
  expect(h1s).toHaveLength(1);
  expect(h1s[0]).toHaveTextContent(SITE_NAME);
});

test("site-concept の軸（やってみるサイト）と AI 運営の明示（rule 3）がある", () => {
  render(<Home />);
  // 一言は文節ごとの span で組むので、文節ごとに確かめる。
  expect(screen.getByText("読むだけのサイトではなく、")).toBeInTheDocument();
  expect(screen.getByText("やってみるサイト。")).toBeInTheDocument();
  expect(
    screen.getByText(/運営しているのは人ではなくAIです/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/内容に誤りがあるかもしれません/),
  ).toBeInTheDocument();
});

// ===== 目玉（今日のためしどころ） =====

test("目玉は診断をセクションで立て、レジストリの名前の見出しと、実在のパスへの入口を持つ", () => {
  render(<Home />);
  const hero = screen.getByRole("region", { name: "あなたに似たキャラ診断" });
  const content = playContentBySlug.get(HERO_SLUG);
  expect(content, `"${HERO_SLUG}" がレジストリに存在しない`).toBeDefined();
  const heading = within(hero).getByRole("heading", { level: 2 });
  expect(heading).toHaveTextContent(content!.title);
  const cta = within(hero).getByRole("link", { name: /やってみる/ });
  expect(cta).toHaveAttribute("href", getContentPath(content!));
});

test("目玉は、結果を札にして持ち帰れることと、結果のタイプ数を言う", () => {
  render(<Home />);
  const hero = screen.getByRole("region", { name: "あなたに似たキャラ診断" });
  expect(within(hero).getByText(/札にして持ち帰れます/)).toBeInTheDocument();
  expect(within(hero).getByText("24タイプ")).toBeInTheDocument();
});

test("目玉のコピーの数値は診断データの正典値と一致する（12問・24タイプ）", () => {
  // データが変わればこのテストが落ち、目玉の文を直すことになる。
  const quiz = quizBySlug.get(HERO_SLUG);
  expect(quiz?.meta.questionCount).toBe(12);
  expect(getResultIdsForQuiz(HERO_SLUG)).toHaveLength(24);
});

// ===== 分野ごとのセクション =====

test("「診断・占い・あそび」の slug はどれもレジストリにあり、目玉の診断を含まない", () => {
  // レジストリに無い slug は page.tsx が並べないので、ここで欠けていないことを確かめる。
  for (const slug of EXPECTED_FEATURED_SLUGS) {
    expect(
      playContentBySlug.get(slug),
      `"${slug}" がレジストリに存在しない`,
    ).toBeDefined();
  }
  expect(EXPECTED_FEATURED_SLUGS).not.toContain(HERO_SLUG);
});

test("「診断・占い・あそび」の行の名前は、レジストリの名前で実在のパスへのリンク", () => {
  const { container } = render(<Home />);
  for (const slug of EXPECTED_FEATURED_SLUGS) {
    const content = playContentBySlug.get(slug);
    if (content === undefined) continue;
    const link = container.querySelector<HTMLAnchorElement>(
      `a[href="${getContentPath(content)}"]`,
    );
    expect(link, `"${slug}" の行のリンクが見つからない`).not.toBeNull();
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

test("辞典のセクションは漢字・四字熟語・伝統色・ユーモアの実在ルートを指す", () => {
  render(<Home />);
  const cases: [string, string][] = [
    ["漢字辞典", "/dictionary/kanji"],
    ["四字熟語辞典", "/dictionary/yoji"],
    ["伝統色辞典", "/dictionary/colors"],
    ["ユーモア辞典", "/dictionary/humor"],
  ];
  for (const [label, href] of cases) {
    const link = screen.getByRole("link", { name: label });
    expect(link).toHaveAttribute("href", href);
  }
});

test("道具のセクションは代表的な道具の入口と /tools への全リンクを持つ", () => {
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

test("読みもののセクションはブログ（/blog）への入口を持つ", () => {
  render(<Home />);
  const blog = screen.getByRole("link", { name: "ブログ" });
  expect(blog).toHaveAttribute("href", "/blog");
});

// ===== 絵文字（DESIGN.md §5） =====

test("ページに絵文字を含まない（DESIGN.md §5）", () => {
  const { container } = render(<Home />);
  expect(container.textContent ?? "").not.toMatch(/\p{Extended_Pictographic}/u);
});

// ===== metadata =====

test("metadata title はサイト名そのもの", () => {
  expect(metadata.title).toBe(SITE_NAME);
});

test("metadata description はよろず屋として名乗り、ツールを集めたサイトとは言わない", () => {
  const description = metadata.description as string;
  expect(description).toMatch(/よろず屋/);
  expect(description).toMatch(/ためして/);
  expect(description).not.toMatch(/ツールを集めたサイト/);
});

test("OGP と twitter の description もよろず屋として名乗り、URL はサイトのルート", () => {
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

// ===== ページの割り方と見出しの折り方（DESIGN.md §4・§5） =====

test("ページはセクションを並べ、名乗り・目玉・分野ごとの4つの順に置く", () => {
  const { container } = render(<Home />);
  const sections = Array.from(container.children);
  expect(sections).toHaveLength(6);
  for (const section of sections) {
    expect(section.tagName).toBe("SECTION");
    expect(section).toHaveClass(sectionStyles.section);
  }
  expect(
    within(sections[0] as HTMLElement).getByRole("heading", { level: 1 }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("region", {
      name: playContentBySlug.get(HERO_SLUG)!.title,
    }),
  ).toBe(sections[1]);
});

test("どの見出しも文節の区切りで組み、auto-phrase に任せない", () => {
  render(<Home />);
  const headings = screen.getAllByRole("heading");
  expect(headings).toHaveLength(6);
  for (const heading of headings) {
    expect(heading, heading.textContent ?? "").toHaveClass(
      phrasedStyles.phrased,
    );
  }
});

test("データから作る目玉の見出しは splitIntoPhrases の区切りで折れる", () => {
  render(<Home />);
  const title = playContentBySlug.get(HERO_SLUG)!.title;
  const heading = screen.getByRole("heading", { level: 2, name: title });
  expect(heading.innerHTML).toBe(splitIntoPhrases(title).join("<wbr>"));
});

test("手で分けた見出しは、書き手が分けた文節の切れ目でだけ折れる", () => {
  render(<Home />);
  const headings: string[][] = [
    ["yolos.", "net"],
    ["診断・", "占い・", "あそび"],
    ["辞典"],
    ["道具"],
    ["読みもの"],
  ];
  for (const phrases of headings) {
    expect(followsPhraseRules(phrases), phrases.join("|")).toBe(true);
    const heading = screen.getByRole("heading", { name: phrases.join("") });
    expect(heading.innerHTML).toBe(phrases.join("<wbr>"));
  }
});
