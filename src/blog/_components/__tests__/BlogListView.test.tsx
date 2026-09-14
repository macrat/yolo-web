import { describe, expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { BlogPostMeta } from "@/blog/_lib/blog";
import { BASE_URL } from "@/lib/constants";

// useSearchParams / useRouter のモック（BlogFilterableList が使用）
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
}));

// next/link のモック
vi.mock("next/link", () => ({
  default: ({
    href,
    className,
    children,
    "data-active": dataActive,
    "aria-current": ariaCurrent,
  }: {
    href: string;
    className?: string;
    children: React.ReactNode;
    "data-active"?: string;
    "aria-current"?: React.AriaAttributes["aria-current"];
  }) => (
    <a
      href={href}
      className={className}
      data-active={dataActive}
      aria-current={ariaCurrent}
    >
      {children}
    </a>
  ),
}));

// BlogListView は Server Component だが jsdom では同期的にレンダリングされる
import BlogListView from "../BlogListView";

/** 現在から days 日前の日付（YYYY-MM-DD）。 */
function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

/**
 * 「新着」マークは公開日が現在から 30 日以内かどうかで決まる。
 * 期間の内と外は固定日付ではなく現在からの相対で置き、いつ走らせても同じ側に落とす。
 */
const OUTSIDE_NEW_WINDOW = daysAgo(365);
const INSIDE_NEW_WINDOW = daysAgo(5);

/** テスト用 BlogPostMeta を生成するヘルパー */
function makePost(overrides: Partial<BlogPostMeta> = {}): BlogPostMeta {
  return {
    slug: "test-post",
    title: "テスト記事タイトル",
    description: "テスト記事の説明文",
    published_at: OUTSIDE_NEW_WINDOW,
    updated_at: OUTSIDE_NEW_WINDOW,
    tags: ["TypeScript"],
    category: "dev-notes",
    series: undefined,
    related_tool_slugs: [],
    draft: false,
    readingTime: 3,
    ...overrides,
  };
}

const mockPosts: BlogPostMeta[] = [
  makePost({ slug: "post-a", title: "記事A" }),
  makePost({ slug: "post-b", title: "記事B" }),
  makePost({ slug: "post-c", title: "記事C" }),
];

/** タグページとして描く（既定はタグ名「設計パターン」の 1 ページ目） */
const renderTagPage = ({ tag = "設計パターン", currentPage = 1 } = {}) =>
  render(
    <BlogListView
      posts={mockPosts}
      currentPage={currentPage}
      totalPages={2}
      basePath={`/blog/tag/${encodeURIComponent(tag)}`}
      allPosts={mockPosts}
      tagHeader={{
        tag,
        description: `${tag}の記事一覧`,
      }}
    />,
  );

/** カテゴリページとして描く（既定はカテゴリ「開発ノート」の 1 ページ目） */
const renderCategoryPage = ({
  category = "dev-notes" as const,
  currentPage = 1,
} = {}) =>
  render(
    <BlogListView
      posts={mockPosts}
      currentPage={currentPage}
      totalPages={2}
      basePath={`/blog/category/${category}`}
      activeCategory={category}
      allPosts={mockPosts}
    />,
  );

/** 絞り込みの無い全記事一覧として描く */
const renderAllPostsPage = () =>
  render(
    <BlogListView
      posts={mockPosts}
      currentPage={1}
      totalPages={1}
      basePath="/blog"
      allPosts={mockPosts}
    />,
  );

/** 可視のパンくずの表示順（区切りの「/」は除く） */
function visibleBreadcrumbTrail(): string[] {
  const nav = screen.getByRole("navigation", { name: "パンくずリスト" });
  return within(nav)
    .getAllByRole("listitem")
    .map((li) => li.textContent?.replace(/^\//, "") ?? "");
}

/** 描画された BreadcrumbList 構造化データ（1 ページに 1 つだけ） */
function breadcrumbJsonLd(container: HTMLElement): {
  script: HTMLScriptElement;
  parsed: { itemListElement: { name: string; item?: string }[] };
} {
  const scripts = [
    ...container.querySelectorAll<HTMLScriptElement>(
      'script[type="application/ld+json"]',
    ),
  ];
  expect(scripts).toHaveLength(1);
  return {
    script: scripts[0],
    parsed: JSON.parse(scripts[0].textContent ?? ""),
  };
}

describe("BlogListView 統合テスト", () => {
  test("ページタイトル（h1）が表示される", () => {
    render(
      <BlogListView
        posts={mockPosts}
        currentPage={1}
        totalPages={1}
        basePath="/blog"
        allPosts={mockPosts}
      />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  test("BlogFilterableList へ posts が渡され、カード（記事タイトル）が表示される", () => {
    render(
      <BlogListView
        posts={mockPosts}
        currentPage={1}
        totalPages={1}
        basePath="/blog"
        allPosts={mockPosts}
      />,
    );
    expect(screen.getByText("記事A")).toBeInTheDocument();
    expect(screen.getByText("記事B")).toBeInTheDocument();
    expect(screen.getByText("記事C")).toBeInTheDocument();
  });

  test("BlogFilterableList へ newSlugs が渡される（古い記事には「新着」マークなし）", () => {
    render(
      <BlogListView
        posts={mockPosts}
        currentPage={1}
        totalPages={1}
        basePath="/blog"
        allPosts={mockPosts}
      />,
    );
    expect(screen.queryByText("新着")).not.toBeInTheDocument();
  });

  test("BlogFilterableList へ newSlugs が渡される（直近 30 日の記事には「新着」マークあり）", () => {
    const recentPosts: BlogPostMeta[] = [
      makePost({
        slug: "recent-post",
        title: "最新記事",
        published_at: INSIDE_NEW_WINDOW,
      }),
    ];
    render(
      <BlogListView
        posts={recentPosts}
        currentPage={1}
        totalPages={1}
        basePath="/blog"
        allPosts={recentPosts}
      />,
    );
    expect(screen.getByText("新着")).toBeInTheDocument();
  });

  test("カテゴリナビゲーションが表示される（BlogFilterableList が正しく props を受け取っている）", () => {
    render(
      <BlogListView
        posts={mockPosts}
        currentPage={1}
        totalPages={1}
        basePath="/blog"
        allPosts={mockPosts}
      />,
    );
    expect(
      screen.getByRole("navigation", { name: "カテゴリで絞り込む" }),
    ).toBeInTheDocument();
  });

  test("tagHeader が指定された場合タグ名が表示される（タグページモード）", () => {
    renderTagPage();
    // タグ名が h1 として表示される（BlogListView 内でレンダリングされる）
    expect(
      screen.getByRole("heading", { level: 1, name: "設計パターン" }),
    ).toBeInTheDocument();
  });

  test("posts が空のとき記事カードが表示されない", () => {
    render(
      <BlogListView
        posts={[]}
        currentPage={1}
        totalPages={1}
        basePath="/blog"
        allPosts={[]}
      />,
    );
    // 記事タイトルが表示されない（エラーにはならない）
    expect(screen.queryByText("記事A")).not.toBeInTheDocument();
  });
});

describe("一覧ページのパンくず", () => {
  test("タグページはホーム・ブログへ戻るリンクを出し、現在地はタグ名になる", () => {
    renderTagPage();
    const nav = screen.getByRole("navigation", { name: "パンくずリスト" });
    expect(within(nav).getByRole("link", { name: "ホーム" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(within(nav).getByRole("link", { name: "ブログ" })).toHaveAttribute(
      "href",
      "/blog",
    );
    // 現在地はリンクにせず、汎用語ではなくタグ名そのものを出す
    const current = within(nav).getByText("設計パターン");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(
      within(nav).queryByRole("link", { name: "設計パターン" }),
    ).toBeNull();
  });

  test("カテゴリページはホーム・ブログへ戻るリンクを出し、現在地はカテゴリ名になる", () => {
    renderCategoryPage();
    const nav = screen.getByRole("navigation", { name: "パンくずリスト" });
    expect(within(nav).getByRole("link", { name: "ホーム" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(within(nav).getByRole("link", { name: "ブログ" })).toHaveAttribute(
      "href",
      "/blog",
    );
    const current = within(nav).getByText("開発ノート");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(within(nav).queryByRole("link", { name: "開発ノート" })).toBeNull();
  });

  test("絞り込みの無い全記事一覧ではパンくずを出さない", () => {
    renderAllPostsPage();
    expect(
      screen.queryByRole("navigation", { name: "パンくずリスト" }),
    ).toBeNull();
  });

  test("タグページの 2 ページ目では現在地がページ番号になり、1 ページ目へ戻れる", () => {
    renderTagPage({ currentPage: 2 });
    const nav = screen.getByRole("navigation", { name: "パンくずリスト" });

    expect(
      within(nav).getByRole("link", { name: "設計パターン" }),
    ).toHaveAttribute(
      "href",
      `/blog/tag/${encodeURIComponent("設計パターン")}`,
    );
    expect(within(nav).getByText("2ページ目")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(nav).queryByRole("link", { name: "2ページ目" })).toBeNull();
  });

  test("カテゴリページの 2 ページ目では現在地がページ番号になり、1 ページ目へ戻れる", () => {
    renderCategoryPage({ currentPage: 2 });
    const nav = screen.getByRole("navigation", { name: "パンくずリスト" });

    expect(
      within(nav).getByRole("link", { name: "開発ノート" }),
    ).toHaveAttribute("href", "/blog/category/dev-notes");
    expect(within(nav).getByText("2ページ目")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(nav).queryByRole("link", { name: "2ページ目" })).toBeNull();
  });
});

describe("一覧ページの構造化データ", () => {
  test("タグページの BreadcrumbList の経路が可視のパンくずと一致する（1 ページ目）", () => {
    const { container } = renderTagPage();
    const { parsed } = breadcrumbJsonLd(container);

    expect(parsed.itemListElement.map((entry) => entry.name)).toEqual(
      visibleBreadcrumbTrail(),
    );
    expect(parsed.itemListElement.map((entry) => entry.name)).toEqual([
      "ホーム",
      "ブログ",
      "設計パターン",
    ]);
  });

  test("タグページの BreadcrumbList の経路が可視のパンくずと一致する（2 ページ目）", () => {
    const { container } = renderTagPage({ currentPage: 2 });
    const { parsed } = breadcrumbJsonLd(container);

    expect(parsed.itemListElement.map((entry) => entry.name)).toEqual(
      visibleBreadcrumbTrail(),
    );
    // 1 ページ目へ戻る経路は URL 付きで申告し、現在地には URL を付けない
    expect(parsed.itemListElement[2].item).toBe(
      `${BASE_URL}/blog/tag/${encodeURIComponent("設計パターン")}`,
    );
    expect(parsed.itemListElement[3].item).toBeUndefined();
  });

  test("カテゴリページの BreadcrumbList の経路が可視のパンくずと一致する", () => {
    const { container } = renderCategoryPage();
    const { parsed } = breadcrumbJsonLd(container);

    expect(parsed.itemListElement.map((entry) => entry.name)).toEqual(
      visibleBreadcrumbTrail(),
    );
    expect(parsed.itemListElement.map((entry) => entry.name)).toEqual([
      "ホーム",
      "ブログ",
      "開発ノート",
    ]);
  });

  test("絞り込みの無い全記事一覧では BreadcrumbList を申告しない", () => {
    const { container } = renderAllPostsPage();

    expect(
      container.querySelectorAll('script[type="application/ld+json"]'),
    ).toHaveLength(0);
  });

  test("タグ名に < が含まれても script タグを閉じない", () => {
    const tag = "</script><b>壊れたタグ</b>";
    const { container } = renderTagPage({ tag });
    const { script, parsed } = breadcrumbJsonLd(container);

    expect(script.textContent).not.toContain("<");
    expect(parsed.itemListElement[2].name).toBe(tag);
  });
});
