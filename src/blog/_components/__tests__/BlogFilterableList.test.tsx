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
