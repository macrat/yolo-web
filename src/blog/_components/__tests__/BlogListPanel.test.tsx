import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import userEvent from "@testing-library/user-event";
import type { BlogPostMeta, BlogCategory } from "@/blog/_lib/blog";

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

import BlogListPanel from "../BlogListPanel";

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

/** 全記事を母集合に取り、キーワード未入力で描くときの props */
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
  keyword: "",
};

/** 検索欄の input。aria-label で引く。 */
const searchInput = () =>
  screen.getByRole("searchbox", { name: "ブログ記事をキーワードで検索" });

/**
 * ハンドラを持たない静的シェルを、サーバー描画のマークアップとして読む。
 *
 * `<noscript>` の中身が要素になるのはサーバー描画とブラウザの解析だけで、
 * React のクライアント描画は noscript の子をテキストとして扱う。
 * 読者に届くのはサーバーが書き出したHTMLなので、案内はそちらから読む。
 */
function parseStaticShell(): Document {
  return new DOMParser().parseFromString(
    renderToStaticMarkup(<BlogListPanel {...defaultProps} />),
    "text/html",
  );
}

describe("検索欄の操作可否（onKeywordChange の有無）", () => {
  test("ハンドラが無いとき検索欄は操作できない", () => {
    render(<BlogListPanel {...defaultProps} />);
    expect(searchInput()).toBeDisabled();
  });

  test("ハンドラが無いとき JavaScript が要る旨の案内を noscript で出す", () => {
    const note = parseStaticShell().querySelector("noscript");
    expect(note).not.toBeNull();
    expect(note?.textContent).toContain("検索には JavaScript が必要です");
  });

  test("ハンドラが無いとき検索欄が案内を自分の説明として指す", () => {
    const shell = parseStaticShell();
    const noteId = shell
      .querySelector('input[type="search"]')
      ?.getAttribute("aria-describedby");

    expect(noteId).toBeTruthy();
    expect(shell.getElementById(noteId ?? "")?.textContent).toContain(
      "検索には JavaScript が必要です",
    );
  });

  test("ハンドラがあるとき検索欄は操作できる", () => {
    render(<BlogListPanel {...defaultProps} onKeywordChange={vi.fn()} />);
    expect(searchInput()).toBeEnabled();
  });

  test("ハンドラがあるとき入力した値でハンドラが呼ばれる", async () => {
    const onKeywordChange = vi.fn();
    render(
      <BlogListPanel {...defaultProps} onKeywordChange={onKeywordChange} />,
    );
    await userEvent.type(searchInput(), "A");
    expect(onKeywordChange).toHaveBeenCalledWith("A");
  });

  test("ハンドラがあるとき noscript の案内は出さない", () => {
    const { container } = render(
      <BlogListPanel {...defaultProps} onKeywordChange={vi.fn()} />,
    );
    expect(container.querySelector("noscript")).toBeNull();
  });
});

describe("カテゴリナビゲーション", () => {
  test("カテゴリナビゲーションが表示される", () => {
    render(<BlogListPanel {...defaultProps} />);
    expect(
      screen.getByRole("navigation", { name: "カテゴリで絞り込む" }),
    ).toBeInTheDocument();
  });

  test("「すべて」リンクが /blog を指す", () => {
    render(<BlogListPanel {...defaultProps} />);
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    expect(nav.querySelector('[href="/blog"]')).not.toBeNull();
    expect(nav).toHaveTextContent("すべて");
  });

  test("カテゴリリンクの href が各カテゴリページを指す", () => {
    render(<BlogListPanel {...defaultProps} />);
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    expect(
      nav.querySelector('[href="/blog/category/dev-notes"]'),
    ).not.toBeNull();
    expect(
      nav.querySelector('[href="/blog/category/ai-workflow"]'),
    ).not.toBeNull();
  });

  test("activeCategory が無いとき「すべて」が現在地として示される", () => {
    render(<BlogListPanel {...defaultProps} />);
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
      <BlogListPanel
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
      <BlogListPanel
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
    render(<BlogListPanel {...defaultProps} keyword="Next.js開発" />);
    expect(screen.getByText("Next.js開発記録")).toBeInTheDocument();
    expect(screen.queryByText("AIの使い方記事")).not.toBeInTheDocument();
    expect(screen.queryByText("サイト更新情報")).not.toBeInTheDocument();
  });

  test("description にマッチする記事のみ表示される", () => {
    render(<BlogListPanel {...defaultProps} keyword="機能追加" />);
    expect(screen.getByText("サイト更新情報")).toBeInTheDocument();
    expect(screen.queryByText("AIの使い方記事")).not.toBeInTheDocument();
  });

  test("英字の大文字小文字を区別しない", () => {
    render(<BlogListPanel {...defaultProps} keyword="next.js" />);
    expect(screen.getByText("Next.js開発記録")).toBeInTheDocument();
  });

  test("カテゴリとキーワードは積集合で効く", () => {
    render(
      <BlogListPanel
        {...defaultProps}
        posts={mockPosts.filter((p) => p.category === "dev-notes")}
        activeCategory="dev-notes"
        keyword="Next"
      />,
    );
    expect(screen.getByText("Next.js開発記録")).toBeInTheDocument();
    expect(screen.queryByText("AIの使い方記事")).not.toBeInTheDocument();
  });

  test("マッチなしのとき role=status の空結果メッセージが表示される", () => {
    render(<BlogListPanel {...defaultProps} keyword="zzzzz存在しない語" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

describe("ヒット件数表示", () => {
  test("ヒット件数 1 件以上のとき件数が読み上げ対象として出る", () => {
    const { container } = render(
      <BlogListPanel {...defaultProps} keyword="AI" />,
    );
    expect(container.querySelector("[aria-live='polite']")).not.toBeNull();
  });

  test("ヒット 0 件のとき件数は出さず空状態メッセージだけを出す", () => {
    const { container } = render(
      <BlogListPanel {...defaultProps} keyword="zzzzz存在しない語" />,
    );
    expect(container.querySelector("[aria-live='polite']")).toBeNull();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

describe("リンクへのキーワード引き継ぎ", () => {
  test("キーワードがあるときカテゴリリンクの href に q= が載る", () => {
    render(<BlogListPanel {...defaultProps} keyword="Next.js" />);
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
    render(<BlogListPanel {...defaultProps} />);
    const nav = screen.getByRole("navigation", { name: "カテゴリで絞り込む" });
    const devNotesLink = nav.querySelector(
      '[href="/blog/category/dev-notes"]',
    ) as HTMLAnchorElement;
    expect(devNotesLink.getAttribute("href")).not.toContain("q=");
  });

  test("キーワードがあるとき人気タグリンクの href に q= が載る", () => {
    render(<BlogListPanel {...defaultProps} keyword="AI" />);
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
    render(<BlogListPanel {...trickyProps} />);
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
    render(<BlogListPanel {...trickyProps} keyword="記事" />);
    popularTagHrefs().forEach((href) => {
      const [path, query] = href.split("?");
      expect(path.slice("/blog/tag/".length)).not.toMatch(/[ #/]/);
      expect(query).toContain("q=");
    });
  });
});

describe("人気タグの出現条件", () => {
  test("カテゴリ絞り込みが無く、タグページでもないとき表示される", () => {
    render(<BlogListPanel {...defaultProps} />);
    expect(
      screen.getByRole("navigation", { name: "人気タグ" }),
    ).toBeInTheDocument();
  });

  test("activeCategory が指定されたときは表示されない", () => {
    render(<BlogListPanel {...defaultProps} activeCategory="dev-notes" />);
    expect(
      screen.queryByRole("navigation", { name: "人気タグ" }),
    ).not.toBeInTheDocument();
  });

  test("tagHeader が指定されたとき（タグページ）は表示されない", () => {
    render(
      <BlogListPanel
        {...defaultProps}
        tagHeader={{ tag: "TypeScript", description: "TypeScriptの記事一覧" }}
      />,
    );
    expect(
      screen.queryByRole("navigation", { name: "人気タグ" }),
    ).not.toBeInTheDocument();
  });
});
