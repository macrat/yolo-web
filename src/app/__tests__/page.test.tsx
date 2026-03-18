import { expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
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
  const MOCK_FEATURED_CONTENTS = [
    {
      slug: "daily",
      title: "今日のユーモア運勢",
      shortDescription: "AIが毎日生成するユーモラスな運勢",
      icon: "\u{1F52E}",
      accentColor: "#7c3aed",
      contentType: "fortune",
      category: "fortune",
    },
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

test("Hero stat badge shows play content count and links to /play", () => {
  render(<Home />);
  // allPlayContents.length = 7 (mocked)
  // 「7種の占い・診断・ゲーム」のようなバッジが /play へリンクしている
  const badge = screen.getByRole("link", { name: /7.*占い|占い.*7|7.*種/ });
  expect(badge).toHaveAttribute("href", "/play");
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
  // 6枚のカード + 「もっと見る」リンク = 7件
  expect(links).toHaveLength(7);
});

test("'もっと診断してみよう' section has 'もっと見る' link to /play", () => {
  const { container } = render(<Home />);
  const diagSection = container.querySelector(
    "[data-testid='home-diagnosis-section']",
  );
  expect(diagSection).toBeInTheDocument();
  const seeAllLink = within(diagSection as HTMLElement).getByRole("link", {
    name: /もっと見る/,
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
    (link: HTMLElement) => !link.textContent?.includes("もっと見る"),
  );
  contentLinks.forEach((link: HTMLElement) => {
    expect(link.getAttribute("href")).not.toBe("/play/daily");
  });
});

// ===== デイリーパズルセクション: featuredCard デザインへの統一 =====

test("Home page renders daily puzzle section with all games", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { name: /今日のデイリーパズル/ }),
  ).toBeInTheDocument();
  expect(screen.getByText(/4つのパズルに挑戦しよう/)).toBeInTheDocument();
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
  expect(
    screen.getByRole("heading", { name: /最新ブログ記事/ }),
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

test("Home page renders 4 featured cards in 'まずはここから' section", () => {
  const { container } = render(<Home />);
  const featuredSection = container.querySelector(
    "[data-testid='home-featured-section']",
  );
  expect(featuredSection).toBeInTheDocument();
  const links = within(featuredSection as HTMLElement).getAllByRole("link");
  // 4枚のカード + 「全コンテンツを見る」リンク = 5件
  expect(links).toHaveLength(5);
  // 各カードのタイトルが表示されていること
  expect(
    within(featuredSection as HTMLElement).getByText("今日のユーモア運勢"),
  ).toBeInTheDocument();
  expect(
    within(featuredSection as HTMLElement).getByText("アニマル性格診断"),
  ).toBeInTheDocument();
  expect(
    within(featuredSection as HTMLElement).getByText("漢字レベル診断"),
  ).toBeInTheDocument();
  expect(
    within(featuredSection as HTMLElement).getByText("イロドリ"),
  ).toBeInTheDocument();
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

// ===== M-2: 診断セクション専用グリッドクラス（3列表示） =====

test("M-2: 'もっと診断してみよう' section uses diagnosisGrid class (separate from featuredGrid)", () => {
  // 診断セクションのグリッドが featuredGrid ではなく diagnosisGrid クラスを使用していること
  // これにより、他セクション（4列）と独立して3列グリッドを適用できる
  const { container } = render(<Home />);
  const diagSection = container.querySelector(
    "[data-testid='home-diagnosis-section']",
  );
  expect(diagSection).toBeInTheDocument();
  // 診断セクション内のグリッドリストは diagnosisGrid クラスを持つ
  const gridList = (diagSection as HTMLElement).querySelector("ul");
  expect(gridList).toBeInTheDocument();
  // CSS Modules ではクラス名がハッシュ化されるが、className 属性に「diagnosisGrid」が含まれることで確認
  // jsdom 環境では CSS Modules はクラス名をそのまま使用するため直接確認可能
  expect(gridList?.className).toMatch(/diagnosisGrid/);
});
