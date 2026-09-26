import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// `getRelatedBlogPostsForTool` をモックする
vi.mock("@/lib/cross-links", () => ({
  getRelatedBlogPostsForTool: vi.fn(),
}));

// `formatDate` をモックする
vi.mock("@/lib/date", () => ({
  formatDate: vi.fn((isoString: string) => isoString.slice(0, 10)),
}));

import { getRelatedBlogPostsForTool } from "@/lib/cross-links";
import RelatedBlogPosts from "@/components/RelatedBlogPosts";

const mockGetRelatedBlogPostsForTool = vi.mocked(getRelatedBlogPostsForTool);

describe("RelatedBlogPosts", () => {
  it("関連記事がある場合にセクションが描画される", () => {
    mockGetRelatedBlogPostsForTool.mockReturnValue([
      {
        slug: "test-post",
        title: "テスト記事",
        published_at: "2026-01-15T10:00:00+09:00",
        updated_at: "2026-01-15T10:00:00+09:00",
        description: "テスト説明",
        tags: [],
        category: "tool-guides",
        related_tool_slugs: ["test-tool"],
        draft: false,
        readingTime: 5,
      },
    ]);

    render(<RelatedBlogPosts toolSlug="test-tool" />);
    expect(screen.getByRole("region")).toBeInTheDocument();
  });

  it("関連記事のタイトルが表示される", () => {
    mockGetRelatedBlogPostsForTool.mockReturnValue([
      {
        slug: "test-post",
        title: "テスト記事タイトル",
        published_at: "2026-01-15T10:00:00+09:00",
        updated_at: "2026-01-15T10:00:00+09:00",
        description: "テスト説明",
        tags: [],
        category: "tool-guides",
        related_tool_slugs: ["test-tool"],
        draft: false,
        readingTime: 5,
      },
    ]);

    render(<RelatedBlogPosts toolSlug="test-tool" />);
    expect(screen.getByText("テスト記事タイトル")).toBeInTheDocument();
  });

  it("関連記事の日付（published_at）が表示される", () => {
    mockGetRelatedBlogPostsForTool.mockReturnValue([
      {
        slug: "test-post",
        title: "日付テスト記事",
        published_at: "2026-03-20T10:00:00+09:00",
        updated_at: "2026-03-20T10:00:00+09:00",
        description: "テスト説明",
        tags: [],
        category: "tool-guides",
        related_tool_slugs: ["test-tool"],
        draft: false,
        readingTime: 5,
      },
    ]);

    render(<RelatedBlogPosts toolSlug="test-tool" />);
    // formatDate のモックは先頭10文字を返す
    const timeEl = screen.getByText("2026-03-20");
    expect(timeEl).toBeInTheDocument();
    expect(timeEl.tagName.toLowerCase()).toBe("time");
    expect(timeEl).toHaveAttribute("dateTime", "2026-03-20T10:00:00+09:00");
  });

  it("関連記事が 0 件のとき null を返す", () => {
    mockGetRelatedBlogPostsForTool.mockReturnValue([]);

    const { container } = render(<RelatedBlogPosts toolSlug="no-posts-tool" />);
    expect(container.firstChild).toBeNull();
  });

  it("関連記事のリンクが /blog/<slug> を向いている", () => {
    mockGetRelatedBlogPostsForTool.mockReturnValue([
      {
        slug: "linked-post",
        title: "リンクテスト記事",
        published_at: "2026-02-10T10:00:00+09:00",
        updated_at: "2026-02-10T10:00:00+09:00",
        description: "テスト説明",
        tags: [],
        category: "tool-guides",
        related_tool_slugs: ["test-tool"],
        draft: false,
        readingTime: 5,
      },
    ]);

    render(<RelatedBlogPosts toolSlug="test-tool" />);
    const link = screen.getByRole("link", { name: /リンクテスト記事/ });
    expect(link).toHaveAttribute("href", "/blog/linked-post");
  });

  it("複数の記事が存在するとき全件描画される", () => {
    mockGetRelatedBlogPostsForTool.mockReturnValue([
      {
        slug: "post-1",
        title: "記事1",
        published_at: "2026-01-01T10:00:00+09:00",
        updated_at: "2026-01-01T10:00:00+09:00",
        description: "説明1",
        tags: [],
        category: "tool-guides",
        related_tool_slugs: ["test-tool"],
        draft: false,
        readingTime: 3,
      },
      {
        slug: "post-2",
        title: "記事2",
        published_at: "2026-02-01T10:00:00+09:00",
        updated_at: "2026-02-01T10:00:00+09:00",
        description: "説明2",
        tags: [],
        category: "tool-guides",
        related_tool_slugs: ["test-tool"],
        draft: false,
        readingTime: 4,
      },
    ]);

    render(<RelatedBlogPosts toolSlug="test-tool" />);
    expect(screen.getByText("記事1")).toBeInTheDocument();
    expect(screen.getByText("記事2")).toBeInTheDocument();
  });

  it("行は説明と分類を持ち、リンクの読み上げの名前は題名だけである", () => {
    mockGetRelatedBlogPostsForTool.mockReturnValue([
      {
        slug: "name-post",
        title: "名前テスト記事",
        published_at: "2026-02-10T10:00:00+09:00",
        updated_at: "2026-02-10T10:00:00+09:00",
        description: "名前テストの説明",
        tags: [],
        category: "tool-guides",
        related_tool_slugs: ["test-tool"],
        draft: false,
        readingTime: 5,
      },
    ]);

    render(<RelatedBlogPosts toolSlug="test-tool" />);
    expect(screen.getByText("名前テストの説明")).toBeInTheDocument();
    expect(screen.getByText("ツールガイド")).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "関連ブログ記事" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAccessibleName("名前テスト記事");
  });
});
