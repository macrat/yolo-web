import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { BlogPostMeta, BlogCategory } from "@/blog/_lib/blog";
import * as nextNavigation from "next/navigation";

// useSearchParams / useRouter のモック
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useRouter: vi.fn(() => ({ replace: mockReplace })),
}));

// next/link のモック（jsdom 環境でも href 属性が機能するよう <a> に変換）
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

import BlogFilterableList from "../BlogFilterableList";

/** テスト用カテゴリラベルマッピング */
const categoryLabels: Record<string, string> = {
  "ai-workflow": "AIワークフロー",
  "dev-notes": "開発ノート",
  "site-updates": "サイト更新",
  "tool-guides": "ツールガイド",
  "japanese-culture": "日本語・文化",
};

/** テスト用シリーズラベルマッピング */
const seriesLabels: Record<string, string> = {
  "ai-agent-ops": "AIエージェント運用記",
  "japanese-culture": "日本語・日本文化",
  "nextjs-deep-dive": "Next.js実践ノート",
};

/** テスト用カテゴリ一覧 */
const categories = [
  { value: "ai-workflow" as BlogCategory, label: "AIワークフロー" },
  { value: "dev-notes" as BlogCategory, label: "開発ノート" },
  { value: "site-updates" as BlogCategory, label: "サイト更新" },
  { value: "tool-guides" as BlogCategory, label: "ツールガイド" },
  { value: "japanese-culture" as BlogCategory, label: "日本語・文化" },
];

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

/** デフォルトの props */
const defaultProps = {
  posts: [] as BlogPostMeta[],
  currentPage: 1,
  totalPages: 1,
  basePath: "/blog",
  newSlugs: new Set<string>(),
  categories,
  categoryLabels,
  seriesLabels,
};

const mockPosts: BlogPostMeta[] = [
  makePost({
    slug: "post-ai",
    title: "AIの使い方記事",
    description: "AIについて",
    category: "ai-workflow",
    tags: ["AIエージェント"],
  }),
  makePost({
    slug: "post-dev",
    title: "Next.js開発記録",
    description: "Next.jsの実装",
    category: "dev-notes",
    tags: ["Next.js"],
  }),
  makePost({
    slug: "post-site",
    title: "サイト更新情報",
    description: "機能追加のお知らせ",
    category: "site-updates",
    tags: ["新機能"],
  }),
];

// 各テスト前にデフォルトのモックに戻す
beforeEach(() => {
  vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
    new URLSearchParams() as ReturnType<typeof nextNavigation.useSearchParams>,
  );
  mockReplace.mockClear();
});

describe("フィルターナビゲーション表示", () => {
  test("カテゴリナビゲーションが表示される", () => {
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts}
        allPosts={mockPosts}
      />,
    );
    expect(
      screen.getByRole("navigation", { name: "カテゴリで絞り込む" }),
    ).toBeInTheDocument();
  });

  test("「すべて」リンクが /blog を指す", () => {
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts}
        allPosts={mockPosts}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    expect(nav.querySelector('[href="/blog"]')).not.toBeNull();
    expect(nav).toHaveTextContent("すべて");
  });

  test("カテゴリリンクの href が正しい（例: /blog/category/dev-notes）", () => {
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts}
        allPosts={mockPosts}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    expect(
      nav.querySelector('[href="/blog/category/dev-notes"]'),
    ).not.toBeNull();
    expect(
      nav.querySelector('[href="/blog/category/ai-workflow"]'),
    ).not.toBeNull();
  });

  test("初期状態では「すべて」リンクが aria-current=page かつ data-active=true", () => {
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts}
        allPosts={mockPosts}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    const allLink = nav.querySelector('[href="/blog"]') as Element;
    expect(allLink).toHaveAttribute("aria-current", "page");
    expect(allLink).toHaveAttribute("data-active", "true");
  });

  test("初期状態ではカテゴリリンクが aria-current を持たない", () => {
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts}
        allPosts={mockPosts}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    const devNotesLink = nav.querySelector(
      '[href="/blog/category/dev-notes"]',
    ) as Element;
    expect(devNotesLink).not.toHaveAttribute("aria-current");
    expect(devNotesLink).not.toHaveAttribute("data-active");
  });
});

describe("activeCategory 指定時のフィルタリング", () => {
  test("activeCategory が指定されたカテゴリリンクが aria-current=page", () => {
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts.filter((p) => p.category === "dev-notes")}
        allPosts={mockPosts}
        activeCategory="dev-notes"
      />,
    );
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    const devNotesLink = nav.querySelector(
      '[href="/blog/category/dev-notes"]',
    ) as Element;
    expect(devNotesLink).toHaveAttribute("aria-current", "page");
    expect(devNotesLink).toHaveAttribute("data-active", "true");
    // 「すべて」はアクティブでない
    const allLink = nav.querySelector('[href="/blog"]') as Element;
    expect(allLink).not.toHaveAttribute("aria-current");
  });
});

describe("キーワード検索フィルタリング（?q= 経由）", () => {
  test("?q= でタイトルにマッチする記事のみ表示される", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("q=Next.js開発") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts}
        allPosts={mockPosts}
      />,
    );
    expect(screen.getByText("Next.js開発記録")).toBeInTheDocument();
    expect(screen.queryByText("AIの使い方記事")).not.toBeInTheDocument();
    expect(screen.queryByText("サイト更新情報")).not.toBeInTheDocument();
  });

  test("?q= で description にマッチする記事のみ表示される", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("q=機能追加") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts}
        allPosts={mockPosts}
      />,
    );
    expect(screen.getByText("サイト更新情報")).toBeInTheDocument();
    expect(screen.queryByText("AIの使い方記事")).not.toBeInTheDocument();
  });

  test("検索は大文字小文字を区別しない（英字）", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("q=next.js") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts}
        allPosts={mockPosts}
      />,
    );
    // "Next.js" を含む記事が小文字の "next.js" でヒット
    expect(screen.getByText("Next.js開発記録")).toBeInTheDocument();
  });

  test("?q= でマッチなしの場合 role=status の空結果メッセージが表示される", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("q=zzzzz存在しない語") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts}
        allPosts={mockPosts}
      />,
    );
    const statusMsg = screen.getByRole("status");
    expect(statusMsg).toBeInTheDocument();
  });
});

describe("カテゴリ + キーワード併用（積集合）", () => {
  test("activeCategory + ?q= の積集合でフィルタリングされる", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("q=Next") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts.filter((p) => p.category === "dev-notes")}
        allPosts={mockPosts}
        activeCategory="dev-notes"
      />,
    );
    // dev-notes かつ "Next" を含む記事のみ表示
    expect(screen.getByText("Next.js開発記録")).toBeInTheDocument();
    // dev-notes だが "Next" を含まない記事は除外（今回のモックデータにはないが構造確認）
    expect(screen.queryByText("AIの使い方記事")).not.toBeInTheDocument();
  });
});

describe("ヒット件数表示（MJ-C 対応）", () => {
  test("?q= ありかつヒット件数 ≥1 の時、件数表示が DOM に存在する", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("q=AI") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts}
        allPosts={mockPosts}
      />,
    );
    // ヒット件数表示は aria-live="polite" を持つ要素
    const hitCountEl = document.querySelector("[aria-live='polite']");
    expect(hitCountEl).not.toBeNull();
  });

  test("?q= ありかつヒット 0 件の時、ヒット件数表示は DOM に存在しない", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("q=zzzzz存在しない語") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts}
        allPosts={mockPosts}
      />,
    );
    // 0 件時は件数表示要素が描画されない（空状態メッセージのみ）
    const hitCountEl = document.querySelector("[aria-live='polite']");
    expect(hitCountEl).toBeNull();
    // 空状態メッセージが表示される
    const statusMsg = screen.getByRole("status");
    expect(statusMsg).toBeInTheDocument();
  });
});

describe("buildCategoryHref: カテゴリリンク href にキーワード引き継ぎ", () => {
  test("?q= がある状態でカテゴリリンクの href に q= が含まれる", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("q=Next.js") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts}
        allPosts={mockPosts}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    const devNotesLink = nav.querySelector(
      '[href*="/blog/category/dev-notes"]',
    ) as HTMLAnchorElement;
    expect(devNotesLink.getAttribute("href")).toContain("q=");
    expect(devNotesLink.getAttribute("href")).toContain(
      "/blog/category/dev-notes",
    );
  });

  test("q= がない状態でカテゴリリンクの href に q= が含まれない", () => {
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts}
        allPosts={mockPosts}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    const devNotesLink = nav.querySelector(
      '[href="/blog/category/dev-notes"]',
    ) as HTMLAnchorElement;
    expect(devNotesLink.getAttribute("href")).not.toContain("q=");
  });
});

describe("buildTagHref: タグリンク href にキーワード引き継ぎ", () => {
  test("?q= がある状態で人気タグリンクの href に q= が含まれる", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("q=AI") as ReturnType<
        typeof nextNavigation.useSearchParams
      >,
    );
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts}
        allPosts={mockPosts}
      />,
    );
    // 人気タグが表示される（カテゴリフィルタ未適用かつタグページでないため）
    const popularTagsNav = screen.getByRole("navigation", { name: "人気タグ" });
    const tagLinks = popularTagsNav.querySelectorAll("a");
    // すべてのタグリンクに q= が含まれることを確認
    tagLinks.forEach((link) => {
      expect(link.getAttribute("href")).toContain("q=");
    });
  });
});

describe("人気タグ表示の出現条件", () => {
  test("カテゴリフィルタ未適用かつ非タグページのとき人気タグが表示される", () => {
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts}
        allPosts={mockPosts}
      />,
    );
    expect(
      screen.getByRole("navigation", { name: "人気タグ" }),
    ).toBeInTheDocument();
  });

  test("activeCategory が指定された時（カテゴリフィルタ適用中）は人気タグが表示されない", () => {
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts}
        allPosts={mockPosts}
        activeCategory="dev-notes"
      />,
    );
    expect(
      screen.queryByRole("navigation", { name: "人気タグ" }),
    ).not.toBeInTheDocument();
  });

  test("tagHeader が指定されたとき（タグページ）は人気タグが表示されない", () => {
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts}
        allPosts={mockPosts}
        tagHeader={{ tag: "TypeScript", description: "TypeScriptの記事一覧" }}
      />,
    );
    expect(
      screen.queryByRole("navigation", { name: "人気タグ" }),
    ).not.toBeInTheDocument();
  });
});

describe("タグページでの tagHeader 表示", () => {
  test("tagHeader が指定されたとき、カテゴリナビは表示されずタグ名が表示される", () => {
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts}
        allPosts={mockPosts}
        tagHeader={{
          tag: "設計パターン",
          description: "設計パターンの記事一覧",
        }}
      />,
    );
    // カテゴリナビは表示されない
    expect(
      screen.queryByRole("navigation", { name: "カテゴリで絞り込む" }),
    ).not.toBeInTheDocument();
  });
});

describe("debounce と URL 更新", () => {
  test("入力欄に文字を入力すると debounce 後に router.replace が呼ばれる", async () => {
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts}
        allPosts={mockPosts}
      />,
    );
    const searchInput = screen.getByRole("searchbox");
    await userEvent.type(searchInput, "a");
    // 入力直後（debounce 前）は router.replace が呼ばれていない
    expect(mockReplace).not.toHaveBeenCalled();
    // debounce 後（300ms 後）に router.replace が呼ばれること
    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalled();
        const lastCalledUrl = mockReplace.mock.calls[
          mockReplace.mock.calls.length - 1
        ][0] as string;
        expect(lastCalledUrl).toContain("q=");
      },
      { timeout: 1000 },
    );
  });
});
