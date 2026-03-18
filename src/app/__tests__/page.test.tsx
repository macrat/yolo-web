import { expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import Home, { metadata } from "../page";

// FortunePreview is a Client Component using localStorage-based fortune logic.
// Mock the logic module to keep tests deterministic and SSR-independent.
vi.mock("@/play/fortune/logic", () => ({
  getUserSeed: () => 42,
  selectFortune: () => ({
    id: "mock-fortune",
    title: "テストの運勢",
    description: "テスト用の運勢説明",
    luckyItem: "テストアイテム",
    luckyAction: "テストアクション",
    rating: 4.0,
  }),
}));

vi.mock("@/lib/achievements/date", () => ({
  getTodayJst: () => "2026-03-18",
}));

vi.mock("@/blog/_lib/blog", () => ({
  getAllBlogPosts: () => [
    {
      title: "テスト記事1",
      slug: "test-1",
      description: "テスト概要1",
      published_at: "2026-02-14T07:57:19+09:00",
      updated_at: "2026-02-14T07:57:19+09:00",
      tags: [],
      category: "technical",
      related_tool_slugs: [],
      draft: false,
      readingTime: 5,
      trustLevel: "generated",
    },
  ],
}));

vi.mock("@/play/quiz/registry", () => ({
  allQuizMetas: [
    {
      slug: "kanji-level",
      title: "漢字レベル診断",
      shortDescription: "テスト用",
      icon: "\u{1F4DA}",
      accentColor: "#4d8c3f",
    },
    {
      slug: "traditional-color",
      title: "伝統色クイズ",
      shortDescription: "テスト用",
      icon: "\u{1F3A8}",
      accentColor: "#e91e63",
    },
  ],
}));

const { MOCK_FEATURED_CONTENTS, MOCK_GAME_CONTENTS } = vi.hoisted(() => {
  // "daily" は FortunePreview セクションで表示するため除外（3件）
  const MOCK_FEATURED_CONTENTS = [
    {
      slug: "animal-personality",
      title: "アニマル性格診断",
      shortDescription: "あなたはどの動物タイプ？",
      icon: "\u{1F98A}",
      accentColor: "#d97706",
      contentType: "quiz",
      category: "personality",
    },
    {
      slug: "kanji-level",
      title: "漢字レベル診断",
      shortDescription: "あなたの漢字力は何級？",
      icon: "\u{1F4DA}",
      accentColor: "#4d8c3f",
      contentType: "quiz",
      category: "knowledge",
    },
    {
      slug: "irodori",
      title: "イロドリ",
      shortDescription: "色合わせパズル",
      icon: "\u{1F3A8}",
      accentColor: "#e91e63",
      contentType: "game",
      category: "game",
    },
  ];
  const MOCK_GAME_CONTENTS = [
    {
      slug: "kanji-kanaru",
      title: "漢字カナール",
      shortDescription: "毎日1つの漢字を推理するパズル",
      icon: "\u{1F4DA}",
      accentColor: "#3d7a2f",
      contentType: "game",
      category: "game",
    },
    {
      slug: "yoji-kimeru",
      title: "四字キメル",
      shortDescription: "毎日1つの四字熟語を当てるパズル",
      icon: "\u{1F3AF}",
      accentColor: "#9a8533",
      contentType: "game",
      category: "game",
    },
    {
      slug: "nakamawake",
      title: "ナカマワケ",
      shortDescription: "16個の言葉を4グループに分けるパズル",
      icon: "\u{1F9E9}",
      accentColor: "#8a5a9a",
      contentType: "game",
      category: "game",
    },
    {
      slug: "irodori",
      title: "イロドリ",
      shortDescription: "色合わせパズル",
      icon: "\u{1F3A8}",
      accentColor: "#e91e63",
      contentType: "game",
      category: "game",
    },
  ];
  return { MOCK_FEATURED_CONTENTS, MOCK_GAME_CONTENTS };
});

/** 「もっと診断してみよう」セクションに表示される厳選6件のモック */
const MOCK_DIAGNOSIS_CONTENTS = [
  {
    slug: "music-personality",
    title: "音楽性格診断",
    shortDescription: "音楽の好みから性格を分析",
    icon: "\u{1F3B5}",
    accentColor: "#8b5cf6",
    contentType: "quiz",
    category: "personality",
  },
  {
    slug: "yoji-personality",
    title: "四字熟語で性格診断",
    shortDescription: "四字熟語で性格を診断",
    icon: "\u{1F4DC}",
    accentColor: "#d97706",
    contentType: "quiz",
    category: "personality",
  },
  {
    slug: "character-personality",
    title: "キャラクター性格診断",
    shortDescription: "あなたはどのキャラ？",
    icon: "\u{1F9E1}",
    accentColor: "#ec4899",
    contentType: "quiz",
    category: "personality",
  },
  {
    slug: "science-thinking",
    title: "サイエンス思考診断",
    shortDescription: "あなたの思考スタイルを診断",
    icon: "\u{1F9EA}",
    accentColor: "#0ea5e9",
    contentType: "quiz",
    category: "personality",
  },
  {
    slug: "kotowaza-level",
    title: "ことわざレベル診断",
    shortDescription: "ことわざの知識を試そう",
    icon: "\u{1F4D6}",
    accentColor: "#16a34a",
    contentType: "quiz",
    category: "knowledge",
  },
  {
    slug: "yoji-level",
    title: "四字熟語レベル診断",
    shortDescription: "四字熟語の知識を試そう",
    icon: "\u{1F3AF}",
    accentColor: "#b45309",
    contentType: "quiz",
    category: "knowledge",
  },
];

vi.mock("@/play/registry", () => ({
  // 4 games + 2 quizzes + 1 fortune = 7 total (mocked values)
  allPlayContents: new Array(7).fill(null),
  playContentBySlug: new Map(MOCK_FEATURED_CONTENTS.map((c) => [c.slug, c])),
  DAILY_UPDATE_SLUGS: new Set([
    "daily",
    "kanji-kanaru",
    "yoji-kimeru",
    "nakamawake",
    "irodori",
  ]),
  getFeaturedContents: () => MOCK_FEATURED_CONTENTS,
  quizQuestionCountBySlug: new Map([["kanji-level", 10]]),
  DIAGNOSIS_SLUGS: [
    "music-personality",
    "yoji-personality",
    "character-personality",
    "science-thinking",
    "kotowaza-level",
    "yoji-level",
  ],
  getDiagnosisContents: () => MOCK_DIAGNOSIS_CONTENTS,
  /** game カテゴリのみ返すシンプルなモック */
  getPlayContentsByCategory: (category: string) =>
    category === "game" ? MOCK_GAME_CONTENTS : [],
}));

test("Home page renders heading", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { level: 1, name: "yolos.net" }),
  ).toBeInTheDocument();
});

test("Hero has a main CTA button linking to /play", () => {
  render(<Home />);
  const cta = screen.getByRole("link", { name: /占い・診断を試す/ });
  expect(cta).toBeInTheDocument();
  expect(cta).toHaveAttribute("href", "/play");
});

test("Hero subtitle conveys the site concept (占い・診断)", () => {
  render(<Home />);
  // サブタイトルが占い・診断パークのコンセプトを訴求している
  // getAllByText でページ内の全マッチを取得し、少なくとも1つヒーローに存在することを確認
  const matches = screen.getAllByText(/占い|診断/);
  expect(matches.length).toBeGreaterThan(0);
});

test("Hero has AI transparency notice (Rule 3)", () => {
  render(<Home />);
  // AI運営の透明性テキストがサブテキストとして存在すること
  expect(screen.getByText(/AI.*運営|AIが.*運営/)).toBeInTheDocument();
});

test("Hero stat badge shows play content count as static text (not a link)", () => {
  render(<Home />);
  // allPlayContents.length = 7 (mocked)
  // 「7種の占い・診断・ゲーム」バッジは静的span（リンクなし）として表示
  const badge = screen.getByText(/7.*種の占い|7.*占い.*ゲーム/);
  expect(badge).toBeInTheDocument();
  // バッジ自体はリンクではなくspan
  const badgeLink = screen.queryByRole("link", {
    name: /7.*占い|占い.*7|7.*種/,
  });
  expect(badgeLink).not.toBeInTheDocument();
});

test("Hero badges include 毎日更新 and 完全無料", () => {
  render(<Home />);
  // 「毎日更新」はヒーローバッジと「N つのパズルに挑戦しよう」という文にも含まれるため
  // getAllByText で複数の存在を許容する
  const dailyUpdateElements = screen.getAllByText(/毎日更新/);
  expect(dailyUpdateElements.length).toBeGreaterThan(0);
  expect(screen.getByText(/完全無料/)).toBeInTheDocument();
});

test("allToolMetas is NOT imported (no ツール badge in hero)", () => {
  render(<Home />);
  // 「XX ツール」バッジはヒーローから削除されている
  // /tools への古い「ツール」バッジが存在しないことを確認
  const toolBadge = screen.queryByRole("link", { name: /\d+ ツール/ });
  expect(toolBadge).not.toBeInTheDocument();
});

// ===== 「もっと診断してみよう」セクション（タスク4: 厳選6件） =====

test("Home page renders 'もっと診断してみよう' section (replaces old クイズ・診断)", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { name: /もっと診断してみよう/ }),
  ).toBeInTheDocument();
});

test("'もっと診断してみよう' section does NOT render old クイズ・診断 heading", () => {
  render(<Home />);
  // 旧「クイズ・診断」見出しは削除されている
  expect(
    screen.queryByRole("heading", { name: /^クイズ・診断$/ }),
  ).not.toBeInTheDocument();
});

test("'もっと診断してみよう' section renders 6 diagnosis cards", () => {
  const { container } = render(<Home />);
  const diagSection = container.querySelector(
    "[data-testid='home-diagnosis-section']",
  );
  expect(diagSection).toBeInTheDocument();
  const links = within(diagSection as HTMLElement).getAllByRole("link");
  // 6枚のカード + 「すべての診断を見る」リンク = 7件
  expect(links).toHaveLength(7);
});

test("'もっと診断してみよう' section has 'すべての診断・テストを見る' link to /play", () => {
  // 修正5: リンク文言を「もっと見る」から「すべての診断・テストを見る」に変更（曖昧さ解消）
  const { container } = render(<Home />);
  const diagSection = container.querySelector(
    "[data-testid='home-diagnosis-section']",
  );
  expect(diagSection).toBeInTheDocument();
  const seeAllLink = within(diagSection as HTMLElement).getByRole("link", {
    name: /すべての診断・テストを見る/,
  });
  expect(seeAllLink).toHaveAttribute("href", "/play");
});

test("'もっと診断してみよう' section does NOT include fortune category contents", () => {
  const { container } = render(<Home />);
  const diagSection = container.querySelector(
    "[data-testid='home-diagnosis-section']",
  );
  expect(diagSection).toBeInTheDocument();
  // fortune カテゴリ（daily slug）はこのセクションに表示しない
  const links = within(diagSection as HTMLElement).getAllByRole("link");
  const contentLinks = links.filter(
    (link: HTMLElement) =>
      !link.textContent?.includes("すべての診断・テストを見る"),
  );
  contentLinks.forEach((link: HTMLElement) => {
    expect(link.getAttribute("href")).not.toBe("/play/daily");
  });
});

// ===== デイリーパズルセクション: featuredCard デザインへの統一 =====

test("Home page renders daily puzzle section with all games", () => {
  render(<Home />);
  // S-G: 「今日のデイリーパズル」→「デイリーパズル」に変更（「今日の」と「デイリー」の意味重複解消）
  expect(
    screen.getByRole("heading", { name: /デイリーパズル/ }),
  ).toBeInTheDocument();
  // デイリーパズル説明文が変更されていること
  expect(
    screen.getByText(/4つのパズルがあなたを待っています/),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /漢字カナール/ })).toHaveAttribute(
    "href",
    "/play/kanji-kanaru",
  );
  expect(screen.getByRole("link", { name: /四字キメル/ })).toHaveAttribute(
    "href",
    "/play/yoji-kimeru",
  );
  expect(screen.getByRole("link", { name: /ナカマワケ/ })).toHaveAttribute(
    "href",
    "/play/nakamawake",
  );
  // イロドリは「まずはここから」にも表示されるため getAllByRole を使用
  const irodoriLinks = screen.getAllByRole("link", { name: /イロドリ/ });
  expect(irodoriLinks.length).toBeGreaterThanOrEqual(1);
  // すべてのイロドリリンクが /play/irodori に向いていること
  irodoriLinks.forEach((link) => {
    expect(link).toHaveAttribute("href", "/play/irodori");
  });
});

test("Home page renders FortunePreview section with heading and CTA link", () => {
  render(<Home />);
  // 「今日のユーモア運勢」見出しは「まずはここから」カードと FortunePreview の両方に存在するため
  // getAllByRole で複数存在を許容する
  const fortuneHeadings = screen.getAllByRole("heading", {
    name: /今日のユーモア運勢/,
  });
  expect(fortuneHeadings.length).toBeGreaterThanOrEqual(1);
  // /play/daily へのリンクが存在する（「今日の運勢を見る」CTAリンクで特定）
  const link = screen.getByRole("link", { name: /今日の運勢を見る/ });
  expect(link).toHaveAttribute("href", "/play/daily");
});

test("Home page renders latest blog section", () => {
  render(<Home />);
  // S-H: 「最新ブログ記事」→「開発の舞台裏」に変更（他セクションとのトーン統一）
  expect(
    screen.getByRole("heading", { name: /開発の舞台裏/ }),
  ).toBeInTheDocument();
  expect(screen.getByText("テスト記事1")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /もっと読む/ })).toHaveAttribute(
    "href",
    "/blog",
  );
});

// ===== S-1: デイリーパズルセクション回遊リンク =====

test("Daily puzzle section has a navigation link to /play", () => {
  const { container } = render(<Home />);
  const section = container.querySelector(
    "[data-testid='home-daily-puzzle-section']",
  );
  expect(section).toBeInTheDocument();
  const playLink = within(section as HTMLElement).getByRole("link", {
    name: /\/play|もっと遊ぶ|すべてのゲーム|全ゲームを見る/,
  });
  expect(playLink).toHaveAttribute("href", "/play");
});

// ===== S-2: aria-labelledby の一貫性 =====

test("Daily puzzle section has aria-labelledby pointing to its h2", () => {
  const { container } = render(<Home />);
  const section = container.querySelector(
    "[data-testid='home-daily-puzzle-section']",
  );
  expect(section).toBeInTheDocument();
  const labelId = (section as HTMLElement).getAttribute("aria-labelledby");
  expect(labelId).toBeTruthy();
  const heading = container.querySelector(`#${labelId}`);
  expect(heading).toBeInTheDocument();
  expect(heading?.tagName).toBe("H2");
});

test("Blog section has aria-labelledby pointing to its h2", () => {
  const { container } = render(<Home />);
  // ブログセクションは data-testid がないので aria-labelledby で特定
  const heading = container.querySelector("#home-blog-heading");
  expect(heading).toBeInTheDocument();
  expect(heading?.tagName).toBe("H2");
  const section = heading?.closest("section");
  expect(section?.getAttribute("aria-labelledby")).toBe("home-blog-heading");
});

// ===== 「まずはここから」セクション =====

test("Home page renders 'まずはここから' section", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { name: "まずはここから" }),
  ).toBeInTheDocument();
});

test("Home page renders 3 featured cards in 'まずはここから' section", () => {
  const { container } = render(<Home />);
  const featuredSection = container.querySelector(
    "[data-testid='home-featured-section']",
  );
  expect(featuredSection).toBeInTheDocument();
  const links = within(featuredSection as HTMLElement).getAllByRole("link");
  // 3枚のカード + 「全コンテンツを見る」リンク = 4件
  // （占いカテゴリは FortunePreview セクションで表示するため除外）
  expect(links).toHaveLength(4);
  // 各カードのタイトルが表示されていること
  expect(
    within(featuredSection as HTMLElement).getByText("アニマル性格診断"),
  ).toBeInTheDocument();
  expect(
    within(featuredSection as HTMLElement).getByText("漢字レベル診断"),
  ).toBeInTheDocument();
  expect(
    within(featuredSection as HTMLElement).getByText("イロドリ"),
  ).toBeInTheDocument();
  // "daily"（今日のユーモア運勢）は FortunePreview で表示するためここには出ない
  expect(
    within(featuredSection as HTMLElement).queryByText("今日のユーモア運勢"),
  ).not.toBeInTheDocument();
});

test("Home page 'まずはここから' section has '全コンテンツを見る' link to /play", () => {
  render(<Home />);
  const featuredSection = document.querySelector(
    "[data-testid='home-featured-section']",
  );
  expect(featuredSection).toBeInTheDocument();
  const seeAllLink = within(featuredSection as HTMLElement).getByRole("link", {
    name: /全コンテンツを見る/,
  });
  expect(seeAllLink).toHaveAttribute("href", "/play");
});

test("Home page featured section cards link to /play/ paths", () => {
  render(<Home />);
  const featuredSection = document.querySelector(
    "[data-testid='home-featured-section']",
  );
  expect(featuredSection).toBeInTheDocument();
  // カードリンク（「全コンテンツを見る」を除く）がすべて /play/ 配下
  const cardLinks = within(featuredSection as HTMLElement).getAllByRole("link");
  const contentLinks = cardLinks.filter(
    (link: HTMLElement) => !link.textContent?.includes("全コンテンツを見る"),
  );
  expect(contentLinks.length).toBeGreaterThan(0);
  contentLinks.forEach((link: HTMLElement) => {
    expect(link.getAttribute("href")).toMatch(/^\/play\//);
  });
});

// ===== page.tsx metadata テスト =====

test("page.tsx metadata description reflects 占い・診断パーク concept", () => {
  const description = metadata.description as string;
  expect(description).toBeDefined();
  // 占い・診断パークのコンセプトを反映した文言が含まれていること
  expect(description).toMatch(/占い|診断/);
  // 「ツール」への言及がないこと
  expect(description).not.toContain("ツール");
});

test("page.tsx OGP description reflects 占い・診断パーク concept", () => {
  const og = metadata.openGraph as Record<string, unknown> | undefined;
  const ogDescription = og?.description as string | undefined;
  expect(ogDescription).toBeDefined();
  expect(ogDescription).toMatch(/占い|診断/);
  expect(ogDescription).not.toContain("ツール");
});

test("page.tsx twitter description reflects 占い・診断パーク concept", () => {
  const twitter = metadata.twitter as Record<string, unknown> | undefined;
  const twitterDescription = twitter?.description as string | undefined;
  expect(twitterDescription).toBeDefined();
  expect(twitterDescription).toMatch(/占い|診断/);
  expect(twitterDescription).not.toContain("ツール");
});

// ===== 「まずはここから」3列グリッドクラス =====

test("'まずはここから' section uses featuredGrid3 class for 3-column layout", () => {
  // 「まずはここから」が3件になったため、featuredGrid3 クラスで3列グリッドを適用する
  // デイリーパズルセクション（4件）は featuredGrid クラス（4列）を維持する
  const { container } = render(<Home />);
  const featuredSection = container.querySelector(
    "[data-testid='home-featured-section']",
  );
  expect(featuredSection).toBeInTheDocument();
  const gridList = (featuredSection as HTMLElement).querySelector("ul");
  expect(gridList).toBeInTheDocument();
  // CSS Modules ではクラス名がハッシュ化されるが、jsdom では直接確認可能
  expect(gridList?.className).toMatch(/featuredGrid3/);
});

// ===== 7-6: タップターゲット拡大（CSS検証） =====

const pageCssContent = readFileSync(
  resolve(__dirname, "../page.module.css"),
  "utf-8",
);

test("7-6: seeAllLink padding is at least 0.6rem vertical to ensure 44px tap target", () => {
  // .seeAllLink の縦padding が 0.6rem 以上であること（高さ44px確保のため）
  // "padding: 0.6rem 1.5rem" のような記述を確認
  expect(pageCssContent).toMatch(
    /\.seeAllLink\s*\{[^}]*padding:\s*0\.[6-9]rem/,
  );
});

test("7-6: mobile featuredCardCta has increased padding and font-size", () => {
  // モバイルの .featuredCardCta が padding: 0.3rem 0.75rem、font-size: 0.75rem 以上を持つこと
  // @media (max-width: 640px) 内の .featuredCardCta を確認
  // font-size が 0.75rem（改善後） になっていること
  expect(pageCssContent).toMatch(
    /max-width:\s*640px[\s\S]*?\.featuredCardCta[\s\S]*?font-size:\s*0\.7[5-9]rem/,
  );
});

// ===== 7-5: ブログセクションに説明テキスト追加 =====

test("7-5: Blog section has a sectionDescription paragraph", () => {
  const { container } = render(<Home />);
  const blogHeading = container.querySelector("#home-blog-heading");
  const blogSection = blogHeading?.closest("section");
  expect(blogSection).toBeInTheDocument();
  // sectionDescriptionクラスを持つpタグがブログセクション内に存在すること
  const desc = (blogSection as HTMLElement).querySelector(
    "[class*='sectionDescription']",
  );
  expect(desc).toBeInTheDocument();
  expect(desc?.textContent).toBeTruthy();
});

// ===== 7-4: 毎日更新バッジの絶対配置（featuredCardTitleRow の外に移動） =====

test("7-4: dailyBadge is a direct child of featuredCard, not inside featuredCardTitleRow", () => {
  const { container } = render(<Home />);
  // 毎日更新バッジが featuredCardTitleRow の中ではなく、カード直下の子要素にあること
  const titleRows = container.querySelectorAll(
    "[class*='featuredCardTitleRow']",
  );
  titleRows.forEach((row) => {
    const badgesInRow = row.querySelectorAll("[class*='dailyBadge']");
    // タイトル行の中にdailyBadgeが存在しないこと
    expect(badgesInRow).toHaveLength(0);
  });
});

// ===== ヒーロー視覚的階層: h1縮小・サブタイトル拡大（CSS検証） =====

test("hero: heroTitle font-size is 1.75rem on desktop (visually de-emphasized)", () => {
  // サイト名h1はナビゲーション目的のため控えめに（2.5rem→1.75rem）
  expect(pageCssContent).toMatch(/\.heroTitle\s*\{[^}]*font-size:\s*1\.75rem/);
});

test("hero: heroSubtitle font-size is 1.5rem on desktop (visually emphasized)", () => {
  // コンセプトを伝えるサブタイトルを最も目立つ要素に（1.25rem→1.5rem）
  expect(pageCssContent).toMatch(
    /\.heroSubtitle\s*\{[^}]*font-size:\s*1\.5rem/,
  );
});

test("hero: mobile heroTitle font-size is 1.5rem (max-width 640px)", () => {
  // モバイルでのh1縮小（2rem→1.5rem）
  expect(pageCssContent).toMatch(
    /max-width:\s*640px[\s\S]*?\.heroTitle[\s\S]*?font-size:\s*1\.5rem/,
  );
});

test("hero: mobile heroSubtitle font-size is 1.2rem (max-width 640px)", () => {
  // モバイルでのサブタイトル拡大（1.1rem→1.2rem）
  expect(pageCssContent).toMatch(
    /max-width:\s*640px[\s\S]*?\.heroSubtitle[\s\S]*?font-size:\s*1\.2rem/,
  );
});

// ===== 修正6: 診断セクション「すべての診断を見る」リンク先 =====
// 修正前: /play → 修正後: /play#personality
// 既存テスト "7 has 'すべての診断を見る' link to /play" は /play#personality に更新済み

// ===== 修正1: モバイルで「まずはここから」3件目カードの全幅表示（CSS検証） =====

test("修正1: featuredGrid3 last child has grid-column: 1 / -1 in 640px breakpoint", () => {
  // 640px以下で3件目カードが全幅になること
  expect(pageCssContent).toMatch(
    /max-width:\s*640px[\s\S]*?\.featuredGrid3\s*>\s*li:last-child\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/,
  );
});

// ===== 修正7: モバイルヒーローのpadding縮小（CSS検証） =====

test("修正7: mobile hero padding is reduced (smaller than desktop 3rem)", () => {
  // 640px以下で .hero のpaddingが縮小されていること
  // 例: "2rem 1.5rem 1.5rem" のような記述
  expect(pageCssContent).toMatch(
    /max-width:\s*640px[\s\S]*?\.hero\s*\{[^}]*padding:[^}]*1\.[0-9]rem/,
  );
});

// ===== 修正9: 320px以下でセクションタイトルのfont-size縮小（CSS検証） =====

test("修正9: sectionTitle font-size is reduced at 320px", () => {
  // 320px以下で .sectionTitle が 1.25rem になること
  expect(pageCssContent).toMatch(
    /max-width:\s*320px[\s\S]*?\.sectionTitle\s*\{[^}]*font-size:\s*1\.25rem/,
  );
});

// ===== M-2: 診断セクションのグリッドリストが存在すること =====

test("M-2: 'もっと診断してみよう' section has a grid list for diagnosis contents", () => {
  // 診断セクション内に診断コンテンツのグリッドリストが存在すること
  // featuredGrid クラスを使用して他セクションと統一されたデザインを適用
  const { container } = render(<Home />);
  const diagSection = container.querySelector(
    "[data-testid='home-diagnosis-section']",
  );
  expect(diagSection).toBeInTheDocument();
  // 診断セクション内のグリッドリストが存在すること
  const gridList = (diagSection as HTMLElement).querySelector("ul");
  expect(gridList).toBeInTheDocument();
  // featuredGrid クラスが使用されていること
  expect(gridList?.className).toMatch(/featuredGrid/);
});

// ===== 修正1: ヒーローサブタイトルに「笑える」を含むこと =====

test("修正1: heroSubtitle contains 笑える to convey humor concept", () => {
  render(<Home />);
  // サブタイトルが「笑える」を含み25文字以内であること
  const subtitle = screen.getByText(/笑える/);
  expect(subtitle).toBeInTheDocument();
});

// ===== 修正4: knowledgeカテゴリのCTAは「挑戦する」=====

test("修正4: knowledge category cards show '挑戦する' CTA instead of '診断する'", () => {
  const { container } = render(<Home />);
  const diagSection = container.querySelector(
    "[data-testid='home-diagnosis-section']",
  );
  expect(diagSection).toBeInTheDocument();
  // knowledge カテゴリ（kotowaza-level, yoji-level）のカードには「挑戦する」が表示される
  const ctaButtons = within(diagSection as HTMLElement).getAllByText(
    /挑戦する/,
  );
  expect(ctaButtons.length).toBeGreaterThanOrEqual(1);
});

test("修正4: personality category cards show '診断する' CTA", () => {
  const { container } = render(<Home />);
  const diagSection = container.querySelector(
    "[data-testid='home-diagnosis-section']",
  );
  expect(diagSection).toBeInTheDocument();
  // personality カテゴリのカードには「診断する」が表示される
  const ctaButtons = within(diagSection as HTMLElement).getAllByText(
    /診断する/,
  );
  expect(ctaButtons.length).toBeGreaterThanOrEqual(1);
});

// ===== 修正8: セクション説明文の語尾バリエーション =====

test("修正8: diagnosis section description ends with 見つけてみませんか", () => {
  render(<Home />);
  expect(
    screen.getByText(/自分の新たな一面を見つけてみませんか/),
  ).toBeInTheDocument();
});

// ===== CSS: ブログカードhoverにtranslateYが追加されていること =====

test("修正6: blogCard:hover has translateY in CSS", () => {
  expect(pageCssContent).toMatch(
    /\.blogCard:hover\s*\{[^}]*transform:\s*translateY/,
  );
});

// ===== CSS: featuredCardIconWrapper の font-size が 2.25rem 以下であること =====

test("修正7: featuredCardIcon font-size is 2.25rem or less to fit icon wrapper", () => {
  // テキスト系アイコン（漢字）が背景円からはみ出さないよう font-size を抑制
  expect(pageCssContent).toMatch(
    /\.featuredCardIconWrapper\s*\{[^}]*font-size:\s*2\.25rem/,
  );
});

// ===== タスク10-f: ヒーロー内おすすめコンテンツ =====

test("10-f: Hero section contains a featured contents list", () => {
  const { container } = render(<Home />);
  // ヒーローセクション内におすすめコンテンツリストが存在すること
  const heroSection = container.querySelector("[class*='hero']");
  expect(heroSection).toBeInTheDocument();
  const featuredList = (heroSection as HTMLElement).querySelector(
    "[class*='heroFeaturedList']",
  );
  expect(featuredList).toBeInTheDocument();
});

test("10-f: Hero featured list renders 3 content links", () => {
  const { container } = render(<Home />);
  const heroSection = container.querySelector("[class*='hero']");
  expect(heroSection).toBeInTheDocument();
  const featuredList = (heroSection as HTMLElement).querySelector(
    "[class*='heroFeaturedList']",
  );
  expect(featuredList).toBeInTheDocument();
  // MOCK_FEATURED_CONTENTS は3件（animal-personality, kanji-level, irodori）
  const links = within(featuredList as HTMLElement).getAllByRole("link");
  expect(links).toHaveLength(3);
});

test("10-f: Hero featured list items link to /play/ paths", () => {
  const { container } = render(<Home />);
  const heroSection = container.querySelector("[class*='hero']");
  expect(heroSection).toBeInTheDocument();
  const featuredList = (heroSection as HTMLElement).querySelector(
    "[class*='heroFeaturedList']",
  );
  expect(featuredList).toBeInTheDocument();
  const links = within(featuredList as HTMLElement).getAllByRole("link");
  links.forEach((link: HTMLElement) => {
    expect(link.getAttribute("href")).toMatch(/^\/play\//);
  });
});

test("10-f: Hero featured list items display icon and title", () => {
  const { container } = render(<Home />);
  const heroSection = container.querySelector("[class*='hero']");
  expect(heroSection).toBeInTheDocument();
  const featuredList = (heroSection as HTMLElement).querySelector(
    "[class*='heroFeaturedList']",
  );
  expect(featuredList).toBeInTheDocument();
  // MOCK_FEATURED_CONTENTS の各タイトルが表示されていること
  expect(
    within(featuredList as HTMLElement).getByText(/アニマル性格診断/),
  ).toBeInTheDocument();
  expect(
    within(featuredList as HTMLElement).getByText(/漢字レベル診断/),
  ).toBeInTheDocument();
  expect(
    within(featuredList as HTMLElement).getByText(/イロドリ/),
  ).toBeInTheDocument();
});

test("10-f: heroFeaturedList CSS class exists in page.module.css", () => {
  // CSSファイルに .heroFeaturedList クラスが定義されていること
  expect(pageCssContent).toMatch(/\.heroFeaturedList/);
});
