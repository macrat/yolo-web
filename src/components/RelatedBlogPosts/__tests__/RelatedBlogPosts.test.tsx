import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";

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
        trustLevel: "generated",
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
        trustLevel: "generated",
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
        trustLevel: "generated",
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
        trustLevel: "generated",
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
        trustLevel: "generated",
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
        trustLevel: "generated",
      },
    ]);

    render(<RelatedBlogPosts toolSlug="test-tool" />);
    expect(screen.getByText("記事1")).toBeInTheDocument();
    expect(screen.getByText("記事2")).toBeInTheDocument();
  });

  // CSS規約チェック: 旧トークン（--color-*）を使っていないこと
  it("CSS が旧トークン --color-* を使っていない", () => {
    const cssPath = resolve(__dirname, "../RelatedBlogPosts.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/--color-/);
  });

  // CSS規約チェック: 新トークンを使っていること
  it("CSS が新トークン（--fg / --border / --accent 等）を使っている", () => {
    const cssPath = resolve(__dirname, "../RelatedBlogPosts.module.css");
    const css = readFileSync(cssPath, "utf-8");
    // --fg, --border, --accent, --bg のいずれか一つ以上を参照していること
    expect(css).toMatch(/var\(--(fg|border|accent|bg)/);
  });

  // CSS規約チェック: フォーカススタイルが DESIGN.md 準拠
  it("CSS が DESIGN.md 準拠のフォーカススタイル（outline: 2px solid var(--accent)）を持つ", () => {
    const cssPath = resolve(__dirname, "../RelatedBlogPosts.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toContain("outline: 2px solid var(--accent)");
    expect(css).toContain("outline-offset: 2px");
  });

  // CSS規約チェック: 角丸が DESIGN.md 準拠（--r-normal または --r-interactive）
  it("CSS が DESIGN.md 準拠の角丸トークンを使っている", () => {
    const cssPath = resolve(__dirname, "../RelatedBlogPosts.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toMatch(/var\(--r-(normal|interactive)\)/);
  });
});
