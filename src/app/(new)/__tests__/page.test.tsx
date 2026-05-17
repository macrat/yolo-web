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

const { MOCK_HERO_PICKUP_CONTENTS, MOCK_ALL_CONTENTS, MOCK_DEFAULT_CONTENTS } =
  vi.hoisted(() => {
    /** ヒーローピックアップコンテンツ（3件） */
    const MOCK_HERO_PICKUP_CONTENTS = [
      {
        slug: "animal-personality",
        title: "アニマル性格診断",
        shortDescription: "あなたはどの動物タイプ？",
        icon: "\u{1F98A}",
        accentColor: "#d97706",
        contentType: "quiz",
        category: "personality",
        publishedAt: "2025-01-01",
      },
      {
        slug: "kanji-level",
        title: "漢字レベル診断",
        shortDescription: "あなたの漢字力は何級？",
        icon: "\u{1F4DA}",
        accentColor: "#4d8c3f",
        contentType: "quiz",
        category: "knowledge",
        publishedAt: "2025-01-02",
      },
      {
        slug: "irodori",
        title: "イロドリ",
        shortDescription: "色合わせパズル",
        icon: "\u{1F3A8}",
        accentColor: "#e91e63",
        contentType: "game",
        category: "game",
        publishedAt: "2025-01-03",
      },
    ];

    /** おすすめタブのデフォルト表示コンテンツ（6件） */
    const MOCK_DEFAULT_CONTENTS = [
      {
        slug: "animal-personality",
        title: "アニマル性格診断",
        shortDescription: "あなたはどの動物タイプ？",
        icon: "\u{1F98A}",
        accentColor: "#d97706",
        contentType: "quiz",
        category: "personality",
        publishedAt: "2025-01-01",
      },
      {
        slug: "kanji-level",
        title: "漢字レベル診断",
        shortDescription: "あなたの漢字力は何級？",
        icon: "\u{1F4DA}",
        accentColor: "#4d8c3f",
        contentType: "quiz",
        category: "knowledge",
        publishedAt: "2025-01-02",
      },
      {
        slug: "irodori",
        title: "イロドリ",
        shortDescription: "色合わせパズル",
        icon: "\u{1F3A8}",
        accentColor: "#e91e63",
        contentType: "game",
        category: "game",
        publishedAt: "2025-01-03",
      },
      {
        slug: "music-personality",
        title: "音楽性格診断",
        shortDescription: "音楽の好みから性格を分析",
        icon: "\u{1F3B5}",
        accentColor: "#8b5cf6",
        contentType: "quiz",
        category: "personality",
        publishedAt: "2025-01-04",
      },
      {
        slug: "yoji-personality",
        title: "四字熟語で性格診断",
        shortDescription: "四字熟語で性格を診断",
        icon: "\u{1F4DC}",
        accentColor: "#d97706",
        contentType: "quiz",
        category: "personality",
        publishedAt: "2025-01-05",
      },
      {
        slug: "kotowaza-level",
        title: "ことわざレベル診断",
        shortDescription: "ことわざの知識を試そう",
        icon: "\u{1F4D6}",
        accentColor: "#16a34a",
        contentType: "quiz",
        category: "knowledge",
        publishedAt: "2025-01-06",
      },
    ];

    /** fortune 除外の全コンテンツ（8件） */
    const MOCK_ALL_CONTENTS = [
      ...MOCK_DEFAULT_CONTENTS,
      {
        slug: "kanji-kanaru",
        title: "漢字カナール",
        shortDescription: "毎日1つの漢字を推理するパズル",
        icon: "\u{1F4DA}",
        accentColor: "#3d7a2f",
        contentType: "game",
        category: "game",
        publishedAt: "2025-01-07",
      },
      {
        slug: "yoji-kimeru",
        title: "四字キメル",
        shortDescription: "毎日1つの四字熟語を当てるパズル",
        icon: "\u{1F3AF}",
        accentColor: "#9a8533",
        contentType: "game",
        category: "game",
        publishedAt: "2025-01-08",
      },
    ];

    return {
      MOCK_HERO_PICKUP_CONTENTS,
      MOCK_ALL_CONTENTS,
      MOCK_DEFAULT_CONTENTS,
    };
  });

vi.mock("@/play/registry", () => ({
  // 8 non-fortune contents + 1 fortune = 9 total (mocked values)
  allPlayContents: new Array(9).fill(null),
  playContentBySlug: new Map(MOCK_ALL_CONTENTS.map((c) => [c.slug, c])),
  DAILY_UPDATE_SLUGS: new Set([
    "daily",
    "kanji-kanaru",
    "yoji-kimeru",
    "nakamawake",
    "irodori",
  ]),
  getHeroPickupContents: () => MOCK_HERO_PICKUP_CONTENTS,
  getDefaultTabContents: () => MOCK_DEFAULT_CONTENTS,
  getNonFortuneContents: () => MOCK_ALL_CONTENTS,
  quizQuestionCountBySlug: new Map([["kanji-level", 10]]),
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
  // allPlayContents.length = 9 (mocked)
  const badge = screen.getByText(/9.*種の占い|9.*占い.*ゲーム/);
  expect(badge).toBeInTheDocument();
  // バッジ自体はリンクではなくspan
  const badgeLink = screen.queryByRole("link", {
    name: /9.*占い|占い.*9|9.*種/,
  });
  expect(badgeLink).not.toBeInTheDocument();
});

test("Hero badges include 毎日更新 and 完全無料", () => {
  render(<Home />);
  const dailyUpdateElements = screen.getAllByText(/毎日更新/);
  expect(dailyUpdateElements.length).toBeGreaterThan(0);
  expect(screen.getByText(/完全無料/)).toBeInTheDocument();
});

test("allToolMetas is NOT imported (no ツール badge in hero)", () => {
  render(<Home />);
  const toolBadge = screen.queryByRole("link", { name: /\d+ ツール/ });
  expect(toolBadge).not.toBeInTheDocument();
});

// ===== 「もっと診断してみよう」セクションが削除されていること =====

test("'もっと診断してみよう' section does NOT exist (removed in cycle-135)", () => {
  const { container } = render(<Home />);
  // cycle-135 でセクション削除。data-testid="home-diagnosis-section" は存在しない
  const diagSection = container.querySelector(
    "[data-testid='home-diagnosis-section']",
  );
  expect(diagSection).not.toBeInTheDocument();
});

// ===== デイリーパズルセクションが削除されていること =====

test("Daily puzzle section does NOT exist (removed in cycle-135)", () => {
  const { container } = render(<Home />);
  // cycle-135 でセクション削除。data-testid="home-daily-puzzle-section" は存在しない
  const dailyPuzzleSection = container.querySelector(
    "[data-testid='home-daily-puzzle-section']",
  );
  expect(dailyPuzzleSection).not.toBeInTheDocument();
});

test("'デイリーパズル' heading does NOT exist (removed in cycle-135)", () => {
  render(<Home />);
  // デイリーパズルセクションが削除されたので見出しも存在しない
  expect(
    screen.queryByRole("heading", { name: /^デイリーパズル$/ }),
  ).not.toBeInTheDocument();
});

// ===== 「おすすめ」セクション（cycle-135: PlayContentTabs 統合） =====

test("Home page renders 'おすすめ' section with PlayContentTabs", () => {
  const { container } = render(<Home />);
  // data-testid が home-recommended-section に変更
  const recommendedSection = container.querySelector(
    "[data-testid='home-recommended-section']",
  );
  expect(recommendedSection).toBeInTheDocument();
  // 見出しが「おすすめ」
  const heading = within(recommendedSection as HTMLElement).getByRole(
    "heading",
    { name: "おすすめ" },
  );
  expect(heading).toBeInTheDocument();
});

test("'おすすめ' section has description 'カテゴリ別にコンテンツを探せます'", () => {
  const { container } = render(<Home />);
  const recommendedSection = container.querySelector(
    "[data-testid='home-recommended-section']",
  );
  expect(recommendedSection).toBeInTheDocument();
  const desc = within(recommendedSection as HTMLElement).getByText(
    /カテゴリ別にコンテンツを探せます/,
  );
  expect(desc).toBeInTheDocument();
});

test("'おすすめ' section has tablist (PlayContentTabs rendered)", () => {
  const { container } = render(<Home />);
  const recommendedSection = container.querySelector(
    "[data-testid='home-recommended-section']",
  );
  expect(recommendedSection).toBeInTheDocument();
  // PlayContentTabs はタブリストを持つ
  const tablist = within(recommendedSection as HTMLElement).getByRole(
    "tablist",
  );
  expect(tablist).toBeInTheDocument();
});

test("'おすすめ' section has '全コンテンツを見る' link to /play", () => {
  const { container } = render(<Home />);
  const recommendedSection = container.querySelector(
    "[data-testid='home-recommended-section']",
  );
  expect(recommendedSection).toBeInTheDocument();
  const seeAllLink = within(recommendedSection as HTMLElement).getByRole(
    "link",
    { name: /全コンテンツを見る/ },
  );
  expect(seeAllLink).toHaveAttribute("href", "/play");
});

test("'おすすめ' section aria-labelledby points to its h2", () => {
  const { container } = render(<Home />);
  const section = container.querySelector(
    "[data-testid='home-recommended-section']",
  );
  expect(section).toBeInTheDocument();
  const labelId = (section as HTMLElement).getAttribute("aria-labelledby");
  expect(labelId).toBe("home-recommended-heading");
  const heading = container.querySelector(`#${labelId}`);
  expect(heading).toBeInTheDocument();
  expect(heading?.tagName).toBe("H2");
});

test("'まずはここから' section does NOT exist (replaced by 'おすすめ' in cycle-135)", () => {
  render(<Home />);
  // 旧セクション「まずはここから」は削除されて「おすすめ」に変わっている
  expect(
    screen.queryByRole("heading", { name: "まずはここから" }),
  ).not.toBeInTheDocument();
});

// ===== Hero ピックアップリスト（heroFeaturedList）は getHeroPickupContents から取得 =====

test("Hero pickup list renders items from getHeroPickupContents", () => {
  render(<Home />);
  // ヒーロー内のピックアップリストが getHeroPickupContents の結果（3件）を表示
  const pickupList = screen.getByRole("list", {
    name: /ピックアップコンテンツ/,
  });
  expect(pickupList).toBeInTheDocument();
  const items = within(pickupList).getAllByRole("listitem");
  expect(items).toHaveLength(3);
});

// ===== FortunePreview セクション =====

test("Home page renders FortunePreview section with heading and CTA link", () => {
  render(<Home />);
  const fortuneHeadings = screen.getAllByRole("heading", {
    name: /今日のユーモア運勢/,
  });
  expect(fortuneHeadings.length).toBeGreaterThanOrEqual(1);
  const link = screen.getByRole("link", { name: /今日の運勢を見る/ });
  expect(link).toHaveAttribute("href", "/play/daily");
});

// ===== 「開発の舞台裏」ブログセクション =====

test("Home page renders latest blog section", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { name: /開発の舞台裏/ }),
  ).toBeInTheDocument();
  expect(screen.getByText("テスト記事1")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /もっと読む/ })).toHaveAttribute(
    "href",
    "/blog",
  );
});

test("Blog section has aria-labelledby pointing to its h2", () => {
  const { container } = render(<Home />);
  const heading = container.querySelector("#home-blog-heading");
  expect(heading).toBeInTheDocument();
  expect(heading?.tagName).toBe("H2");
  const section = heading?.closest("section");
  expect(section?.getAttribute("aria-labelledby")).toBe("home-blog-heading");
});

// ===== 7-5: ブログセクションに説明テキスト追加 =====

test("7-5: Blog section has a sectionDescription paragraph", () => {
  const { container } = render(<Home />);
  const blogHeading = container.querySelector("#home-blog-heading");
  const blogSection = blogHeading?.closest("section");
  expect(blogSection).toBeInTheDocument();
  const desc = (blogSection as HTMLElement).querySelector(
    "[class*='sectionDescription']",
  );
  expect(desc).toBeInTheDocument();
  expect(desc?.textContent).toBeTruthy();
});

// ===== page.tsx metadata テスト =====

test("page.tsx metadata description reflects 占い・診断パーク concept", () => {
  const description = metadata.description as string;
  expect(description).toBeDefined();
  expect(description).toMatch(/占い|診断/);
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

// ===== 7-6: タップターゲット拡大（CSS検証） =====

const pageCssContent = readFileSync(
  resolve(__dirname, "../page.module.css"),
  "utf-8",
);

// B-334-4-2: featuredCardCta は PlayContentTabs.module.css へ移送済み
const playTabsCssContent = readFileSync(
  resolve(__dirname, "../../../play/_components/PlayContentTabs.module.css"),
  "utf-8",
);

test("7-6: seeAllLink padding is at least 0.6rem vertical to ensure 44px tap target", () => {
  expect(pageCssContent).toMatch(
    /\.seeAllLink\s*\{[^}]*padding:\s*0\.[6-9]rem/,
  );
});

test("7-6: mobile featuredCardCta has increased padding and font-size", () => {
  // B-334-4-2: featuredCardCta は PlayContentTabs.module.css へ移送済み
  // モバイルタップ領域確保（font-size 0.75rem 以上）を PlayContentTabs 側の CSS で検証
  expect(playTabsCssContent).toMatch(
    /max-width:\s*640px[\s\S]*?\.featuredCardCta[\s\S]*?font-size:\s*0\.7[5-9]rem/,
  );
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
    expect(badgesInRow).toHaveLength(0);
  });
});

// ===== ARIA tab パターンの完全性（role="tab" + aria-selected） =====

test("ARIA: tablist contains role='tab' buttons with aria-selected", () => {
  const { container } = render(<Home />);
  // PlayContentTabs が tablist / tab / aria-selected を正しく実装していること
  const tablist = container.querySelector("[role='tablist']");
  expect(tablist).toBeInTheDocument();

  const tabs = container.querySelectorAll("[role='tab']");
  expect(tabs.length).toBeGreaterThan(0);

  // 少なくとも 1 つのタブが aria-selected="true" であること（初期状態: 「すべて」タブが選択）
  const selectedTabs = Array.from(tabs).filter(
    (tab) => tab.getAttribute("aria-selected") === "true",
  );
  expect(selectedTabs.length).toBeGreaterThanOrEqual(1);

  // aria-selected="true" でないタブは aria-selected="false" を持つこと（明示的設定）
  const unselectedTabs = Array.from(tabs).filter(
    (tab) => tab.getAttribute("aria-selected") === "false",
  );
  expect(unselectedTabs.length).toBeGreaterThan(0);
});

test("ARIA: tabpanel is present and linked to active tab via aria-labelledby", () => {
  const { container } = render(<Home />);
  const tabpanel = container.querySelector("[role='tabpanel']");
  expect(tabpanel).toBeInTheDocument();
  // aria-labelledby が存在し、対応するタブ id を指していること
  const labelledBy = tabpanel?.getAttribute("aria-labelledby");
  expect(labelledBy).toBeTruthy();
  const linkedTab = container.querySelector(`#${labelledBy}`);
  expect(linkedTab).toBeInTheDocument();
  expect(linkedTab?.getAttribute("role")).toBe("tab");
});

// ===== FortunePreview Panel-in-Panel 解消の保証 =====

const fortuneCssContent = readFileSync(
  resolve(
    __dirname,
    "../../../play/fortune/_components/FortunePreview.module.css",
  ),
  "utf-8",
);

test("FortunePreview: .card has no border-left / border-right / border-bottom (Panel provides outer border)", () => {
  // Panel-in-Panel 解消: .card の border は border-top のみで、
  // border-left / border-right / border-bottom / border-radius は Panel コンポーネントが提供する。
  // .card ブロックを抽出して余計な border プロパティがないことを確認する。
  // ※ border-top: 5px のアクセント帯は意図的に残存
  // 注: この regex は `.card { ... }` ブロックがネスト宣言を含まないことを前提とする。
  // 将来 `.card` 内に `@supports` などのネスト構造が追加されたら本マッチは破綻するため、
  // 同時に `.card:hover` / `.card:focus-visible` 等の派生ブロックは検証範囲外。
  const cardBlockMatch = fortuneCssContent.match(/\.card\s*\{([^}]*)\}/);
  expect(cardBlockMatch).not.toBeNull();
  const cardBlock = cardBlockMatch![1];

  // border-left / border-right / border-bottom が card ブロック内に定義されていないこと
  expect(cardBlock).not.toMatch(/border-left\s*:/);
  expect(cardBlock).not.toMatch(/border-right\s*:/);
  expect(cardBlock).not.toMatch(/border-bottom\s*:/);
  expect(cardBlock).not.toMatch(/border-radius\s*:/);
});
