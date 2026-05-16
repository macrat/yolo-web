import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RelatedArticles from "@/blog/_components/RelatedArticles";
import type { BlogPostMeta } from "@/blog/_lib/blog";

/** Helper to create a minimal BlogPostMeta for testing. */
function makeMeta(
  overrides: Partial<BlogPostMeta> & { slug: string; title: string },
): BlogPostMeta {
  return {
    description: "テスト記事の説明文",
    published_at: "2026-01-15T00:00:00Z",
    updated_at: "2026-01-15T00:00:00Z",
    tags: [],
    category: "dev-notes",
    related_tool_slugs: [],
    draft: false,
    readingTime: 5,
    ...overrides,
  };
}

const mockPosts: BlogPostMeta[] = [
  makeMeta({
    slug: "post-1",
    title: "First Post",
    category: "dev-notes",
    published_at: "2026-01-10T00:00:00Z",
  }),
  makeMeta({
    slug: "post-2",
    title: "Second Post",
    category: "ai-workflow",
    published_at: "2026-01-20T00:00:00Z",
  }),
  makeMeta({
    slug: "post-3",
    title: "Third Post",
    category: "tool-guides",
    published_at: "2026-01-30T00:00:00Z",
  }),
];

describe("RelatedArticles", () => {
  test("「関連記事」見出しが表示されること", () => {
    render(<RelatedArticles posts={mockPosts} />);
    expect(screen.getByText("関連記事")).toBeInTheDocument();
  });

  test("各記事タイトルがリンクとして表示されること", () => {
    render(<RelatedArticles posts={mockPosts} />);
    const firstPostLinks = screen.getAllByRole("link", { name: /First Post/ });
    expect(firstPostLinks.length).toBeGreaterThanOrEqual(1);
    // リンクが正しいパスに向いていること
    expect(firstPostLinks[0]).toHaveAttribute("href", "/blog/post-1");
  });

  test("各記事のカテゴリバッジが表示されること", () => {
    render(<RelatedArticles posts={mockPosts} />);
    expect(screen.getByText("開発ノート")).toBeInTheDocument();
    expect(screen.getByText("AIワークフロー")).toBeInTheDocument();
    expect(screen.getByText("ツールガイド")).toBeInTheDocument();
  });

  test("各記事の公開日が表示されること", () => {
    render(<RelatedArticles posts={mockPosts} />);
    // formatDate で変換された日付が存在すること（time要素のdateTime属性で確認）
    const timeElements = document.querySelectorAll("time");
    expect(timeElements.length).toBeGreaterThanOrEqual(3);
  });

  test("posts が空配列のとき何も描画されないこと", () => {
    const { container } = render(<RelatedArticles posts={[]} />);
    expect(container.innerHTML).toBe("");
  });

  test("全記事へのリンクが正しいhrefを持つこと", () => {
    render(<RelatedArticles posts={mockPosts} />);
    expect(screen.getByRole("link", { name: /Second Post/ })).toHaveAttribute(
      "href",
      "/blog/post-2",
    );
    expect(screen.getByRole("link", { name: /Third Post/ })).toHaveAttribute(
      "href",
      "/blog/post-3",
    );
  });
});
