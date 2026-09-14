import { describe, expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { BlogPostMeta } from "@/blog/_lib/blog";

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

/** テスト用 BlogPostMeta を生成するヘルパー */
function makePost(overrides: Partial<BlogPostMeta> = {}): BlogPostMeta {
  return {
    slug: "test-post",
    title: "テスト記事タイトル",
    description: "テスト記事の説明文",
    published_at: "2026-01-01",
    updated_at: "2026-01-01",
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

/** タグページとして描く（タグ名「設計パターン」） */
const renderTagPage = () =>
  render(
    <BlogListView
      posts={mockPosts}
      currentPage={1}
      totalPages={1}
      basePath={`/blog/tag/${encodeURIComponent("設計パターン")}`}
      allPosts={mockPosts}
      tagHeader={{
        tag: "設計パターン",
        description: "設計パターンの記事一覧",
      }}
    />,
  );

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
    // published_at が 2026-01-01（現在から約 126 日前）なので「新着」マークなし
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
    const recentDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const recentPosts: BlogPostMeta[] = [
      makePost({
        slug: "recent-post",
        title: "最新記事",
        published_at: recentDate,
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

describe("タグページのパンくず", () => {
  test("ホーム・ブログへ戻るリンクを出し、現在地はタグ名になる", () => {
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

  test("タグページ以外ではパンくずを出さない", () => {
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
      screen.queryByRole("navigation", { name: "パンくずリスト" }),
    ).toBeNull();
  });

  test("BreadcrumbList の構造化データは重ねて出さない（経路はルートが宣言する）", () => {
    const { container } = renderTagPage();
    expect(
      container.querySelector('script[type="application/ld+json"]'),
    ).toBeNull();
  });
});
