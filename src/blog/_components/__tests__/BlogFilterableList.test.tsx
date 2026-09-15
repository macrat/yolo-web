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

/** 全記事を母集合に取り、絞り込みのない一覧として描くときの props */
const defaultProps = {
  posts: mockPosts,
  allPosts: mockPosts,
  currentPage: 1,
  totalPages: 1,
  basePath: "/blog",
  newSlugs: new Set<string>(),
  categories,
  categoryLabels,
  seriesLabels,
};

/** `?q=` の値を差し替える。 */
function setUrlKeyword(query: string): void {
  vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
    new URLSearchParams(query) as ReturnType<
      typeof nextNavigation.useSearchParams
    >,
  );
}

/** 検索欄の input。aria-label で引く。 */
const searchInput = () =>
  screen.getByRole("searchbox", { name: "ブログ記事をキーワードで検索" });

beforeEach(() => {
  setUrlKeyword("");
  mockReplace.mockClear();
});

describe("URL からキーワードを取り込む", () => {
  test("?q= の値が検索欄と一覧の絞り込みに反映される", () => {
    setUrlKeyword("q=Next.js開発");
    render(<BlogFilterableList {...defaultProps} />);
    expect(searchInput()).toHaveValue("Next.js開発");
    expect(screen.getByText("Next.js開発記録")).toBeInTheDocument();
    expect(screen.queryByText("AIの使い方記事")).not.toBeInTheDocument();
  });

  test("?q= が変われば検索欄がその値に追従する", () => {
    const { rerender } = render(<BlogFilterableList {...defaultProps} />);
    expect(searchInput()).toHaveValue("");

    setUrlKeyword("q=AI");
    rerender(<BlogFilterableList {...defaultProps} />);

    expect(searchInput()).toHaveValue("AI");
    expect(screen.getByText("AIの使い方記事")).toBeInTheDocument();
    expect(screen.queryByText("Next.js開発記録")).not.toBeInTheDocument();
  });
});

describe("キーワードを URL へ書き戻す", () => {
  test("入力は即座に反映され、URL への書き戻しは遅延する", async () => {
    render(<BlogFilterableList {...defaultProps} />);
    await userEvent.type(searchInput(), "A");

    expect(searchInput()).toHaveValue("A");
    expect(mockReplace).not.toHaveBeenCalled();

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith("/blog?q=A", {
          scroll: false,
        });
      },
      { timeout: 1000 },
    );
  });

  test("書き戻し先は basePath なのでカテゴリページから外れない", async () => {
    render(
      <BlogFilterableList
        {...defaultProps}
        basePath="/blog/category/dev-notes"
        activeCategory="dev-notes"
      />,
    );
    await userEvent.type(searchInput(), "A");

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith(
          "/blog/category/dev-notes?q=A",
          { scroll: false },
        );
      },
      { timeout: 1000 },
    );
  });

  test("キーワードを消すと URL から q= が落ちる", async () => {
    setUrlKeyword("q=AI");
    render(<BlogFilterableList {...defaultProps} />);
    await userEvent.clear(searchInput());

    expect(searchInput()).toHaveValue("");

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith("/blog", { scroll: false });
      },
      { timeout: 1000 },
    );
  });

  test("URL 由来のキーワードをそのまま表示しているだけなら書き戻さない", async () => {
    setUrlKeyword("q=AI");
    render(<BlogFilterableList {...defaultProps} />);

    await waitFor(
      () => {
        expect(searchInput()).toHaveValue("AI");
      },
      { timeout: 1000 },
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

describe("カテゴリナビゲーション", () => {
  test("カテゴリナビゲーションが表示される", () => {
    render(<BlogFilterableList {...defaultProps} />);
    expect(
      screen.getByRole("navigation", { name: "カテゴリで絞り込む" }),
    ).toBeInTheDocument();
  });

  test("「すべて」リンクが /blog を指す", () => {
    render(<BlogFilterableList {...defaultProps} />);
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    expect(nav.querySelector('[href="/blog"]')).not.toBeNull();
    expect(nav).toHaveTextContent("すべて");
  });

  test("カテゴリリンクの href が各カテゴリページを指す", () => {
    render(<BlogFilterableList {...defaultProps} />);
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    expect(
      nav.querySelector('[href="/blog/category/dev-notes"]'),
    ).not.toBeNull();
    expect(
      nav.querySelector('[href="/blog/category/ai-workflow"]'),
    ).not.toBeNull();
  });

  test("activeCategory が無いとき「すべて」が現在地として示される", () => {
    render(<BlogFilterableList {...defaultProps} />);
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    const allLink = nav.querySelector('[href="/blog"]') as Element;
    expect(allLink).toHaveAttribute("aria-current", "page");
    expect(allLink).toHaveAttribute("data-active", "true");
    const devNotesLink = nav.querySelector(
      '[href="/blog/category/dev-notes"]',
    ) as Element;
    expect(devNotesLink).not.toHaveAttribute("aria-current");
    expect(devNotesLink).not.toHaveAttribute("data-active");
  });

  test("activeCategory のカテゴリが現在地として示される", () => {
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts.filter((p) => p.category === "dev-notes")}
        activeCategory="dev-notes"
      />,
    );
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    const devNotesLink = nav.querySelector(
      '[href="/blog/category/dev-notes"]',
    ) as Element;
    expect(devNotesLink).toHaveAttribute("aria-current", "page");
    expect(devNotesLink).toHaveAttribute("data-active", "true");
    const allLink = nav.querySelector('[href="/blog"]') as Element;
    expect(allLink).not.toHaveAttribute("aria-current");
  });

  test("tagHeader が指定されたときカテゴリナビは表示されない", () => {
    render(
      <BlogFilterableList
        {...defaultProps}
        tagHeader={{
          tag: "設計パターン",
          description: "設計パターンの記事一覧",
        }}
      />,
    );
    expect(
      screen.queryByRole("navigation", { name: "カテゴリで絞り込む" }),
    ).not.toBeInTheDocument();
  });
});

describe("キーワードによる絞り込み", () => {
  test("タイトルにマッチする記事のみ表示される", () => {
    setUrlKeyword("q=Next.js開発");
    render(<BlogFilterableList {...defaultProps} />);
    expect(screen.getByText("Next.js開発記録")).toBeInTheDocument();
    expect(screen.queryByText("AIの使い方記事")).not.toBeInTheDocument();
    expect(screen.queryByText("サイト更新情報")).not.toBeInTheDocument();
  });

  test("description にマッチする記事のみ表示される", () => {
    setUrlKeyword("q=機能追加");
    render(<BlogFilterableList {...defaultProps} />);
    expect(screen.getByText("サイト更新情報")).toBeInTheDocument();
    expect(screen.queryByText("AIの使い方記事")).not.toBeInTheDocument();
  });

  test("英字の大文字小文字を区別しない", () => {
    setUrlKeyword("q=next.js");
    render(<BlogFilterableList {...defaultProps} />);
    expect(screen.getByText("Next.js開発記録")).toBeInTheDocument();
  });

  test("カテゴリとキーワードは積集合で効く", () => {
    setUrlKeyword("q=Next");
    render(
      <BlogFilterableList
        {...defaultProps}
        posts={mockPosts.filter((p) => p.category === "dev-notes")}
        activeCategory="dev-notes"
      />,
    );
    expect(screen.getByText("Next.js開発記録")).toBeInTheDocument();
    expect(screen.queryByText("AIの使い方記事")).not.toBeInTheDocument();
  });

  test("マッチなしのとき role=status の空結果メッセージが表示される", () => {
    setUrlKeyword("q=zzzzz存在しない語");
    render(<BlogFilterableList {...defaultProps} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

describe("ヒット件数表示", () => {
  test("ヒット件数 1 件以上のとき件数が読み上げ対象として出る", () => {
    setUrlKeyword("q=AI");
    const { container } = render(<BlogFilterableList {...defaultProps} />);
    expect(container.querySelector("[aria-live='polite']")).not.toBeNull();
  });

  test("ヒット 0 件のとき件数は出さず空状態メッセージだけを出す", () => {
    setUrlKeyword("q=zzzzz存在しない語");
    const { container } = render(<BlogFilterableList {...defaultProps} />);
    expect(container.querySelector("[aria-live='polite']")).toBeNull();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

describe("リンクへのキーワード引き継ぎ", () => {
  test("キーワードがあるときカテゴリリンクの href に q= が載る", () => {
    setUrlKeyword("q=Next.js");
    render(<BlogFilterableList {...defaultProps} />);
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    const devNotesLink = nav.querySelector(
      '[href*="/blog/category/dev-notes"]',
    ) as HTMLAnchorElement;
    expect(devNotesLink.getAttribute("href")).toContain(
      "/blog/category/dev-notes",
    );
    expect(devNotesLink.getAttribute("href")).toContain("q=");
  });

  test("キーワードが無いときカテゴリリンクの href に q= は載らない", () => {
    render(<BlogFilterableList {...defaultProps} />);
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    const devNotesLink = nav.querySelector(
      '[href="/blog/category/dev-notes"]',
    ) as HTMLAnchorElement;
    expect(devNotesLink.getAttribute("href")).not.toContain("q=");
  });

  test("キーワードがあるとき人気タグリンクの href に q= が載る", () => {
    setUrlKeyword("q=AI");
    render(<BlogFilterableList {...defaultProps} />);
    const popularTagsNav = screen.getByRole("navigation", { name: "人気タグ" });
    const tagLinks = popularTagsNav.querySelectorAll("a");
    expect(tagLinks.length).toBeGreaterThan(0);
    tagLinks.forEach((link) => {
      expect(link.getAttribute("href")).toContain("q=");
    });
  });
});

describe("人気タグのリンク先", () => {
  const trickyTags = ["C#", "CI/CD", "Claude Code"];
  const trickyPosts = trickyTags.map((tag, index) =>
    makePost({ slug: `post-${index}`, title: `記事${index}`, tags: [tag] }),
  );
  const trickyProps = {
    ...defaultProps,
    posts: trickyPosts,
    allPosts: trickyPosts,
  };

  /** 人気タグナビの href を集める */
  const popularTagHrefs = () =>
    Array.from(
      screen
        .getByRole("navigation", { name: "人気タグ" })
        .querySelectorAll("a"),
    ).map((link) => link.getAttribute("href") ?? "");

  test("URL で意味を持つ文字を含むタグでも、リンク先がそのタグのページを指す", () => {
    render(<BlogFilterableList {...trickyProps} />);
    const prefix = "/blog/tag/";
    const hrefs = popularTagHrefs();
    expect(hrefs).toHaveLength(trickyTags.length);
    expect(
      hrefs.map((href) => decodeURIComponent(href.slice(prefix.length))),
    ).toEqual(trickyTags);
    hrefs.forEach((href) => {
      expect(href.slice(prefix.length)).not.toMatch(/[ #?/]/);
    });
  });

  test("キーワードを引き継ぐときもタグ名の部分はエンコードされたまま", () => {
    setUrlKeyword("q=記事");
    render(<BlogFilterableList {...trickyProps} />);
    popularTagHrefs().forEach((href) => {
      const [path, query] = href.split("?");
      expect(path.slice("/blog/tag/".length)).not.toMatch(/[ #/]/);
      expect(query).toContain("q=");
    });
  });
});

describe("人気タグの出現条件", () => {
  test("カテゴリ絞り込みが無く、タグページでもないとき表示される", () => {
    render(<BlogFilterableList {...defaultProps} />);
    expect(
      screen.getByRole("navigation", { name: "人気タグ" }),
    ).toBeInTheDocument();
  });

  test("activeCategory が指定されたときは表示されない", () => {
    render(<BlogFilterableList {...defaultProps} activeCategory="dev-notes" />);
    expect(
      screen.queryByRole("navigation", { name: "人気タグ" }),
    ).not.toBeInTheDocument();
  });

  test("tagHeader が指定されたとき（タグページ）は表示されない", () => {
    render(
      <BlogFilterableList
        {...defaultProps}
        tagHeader={{ tag: "TypeScript", description: "TypeScriptの記事一覧" }}
      />,
    );
    expect(
      screen.queryByRole("navigation", { name: "人気タグ" }),
    ).not.toBeInTheDocument();
  });
});
