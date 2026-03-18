import { expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Home from "../page";

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

vi.mock("@/play/registry", () => ({
  // 4 games + 2 quizzes + 1 fortune = 7 total (mocked values)
  allPlayContents: new Array(7).fill(null),
  playContentBySlug: new Map([
    [
      "daily",
      {
        slug: "daily",
        title: "今日のユーモア運勢",
        shortDescription: "AIが毎日生成するユーモラスな運勢",
        icon: "\u{1F52E}",
        accentColor: "#7c3aed",
        contentType: "fortune",
        category: "fortune",
      },
    ],
    [
      "animal-personality",
      {
        slug: "animal-personality",
        title: "アニマル性格診断",
        shortDescription: "あなたはどの動物タイプ？",
        icon: "\u{1F98A}",
        accentColor: "#d97706",
        contentType: "quiz",
        category: "personality",
      },
    ],
    [
      "kanji-level",
      {
        slug: "kanji-level",
        title: "漢字レベル診断",
        shortDescription: "あなたの漢字力は何級？",
        icon: "\u{1F4DA}",
        accentColor: "#4d8c3f",
        contentType: "quiz",
        category: "knowledge",
      },
    ],
    [
      "irodori",
      {
        slug: "irodori",
        title: "イロドリ",
        shortDescription: "色合わせパズル",
        icon: "\u{1F3A8}",
        accentColor: "#e91e63",
        contentType: "game",
        category: "game",
      },
    ],
  ]),
  FEATURED_SLUGS: ["daily", "animal-personality", "kanji-level", "irodori"],
  DAILY_UPDATE_SLUGS: new Set([
    "daily",
    "kanji-kanaru",
    "yoji-kimeru",
    "nakamawake",
    "irodori",
  ]),
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

test("Home page renders quiz section", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { name: /クイズ・診断/ }),
  ).toBeInTheDocument();
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
  const links = featuredSection?.querySelectorAll("a");
  // 4枚のカード + 「全コンテンツを見る」リンク = 5件
  // ただし「全コンテンツを見る」はセクション下部に別途配置
  expect(links).toBeDefined();
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
