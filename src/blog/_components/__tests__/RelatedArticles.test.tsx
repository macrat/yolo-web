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
    trustLevel: "generated" as const,
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

// DESIGN.md フェーズ R: RelatedArticles は共有の Shinagaki（品書き）へ統合された。
// 品名=タイトル・値札=カテゴリ名・右端メタ=公開日という Shinagaki の型で検証する。
describe("RelatedArticles", () => {
  test("「関連記事」見出しが表示されること", () => {
    render(<RelatedArticles posts={mockPosts} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "関連記事" }),
    ).toBeInTheDocument();
  });

  test("各記事タイトルがリンクとして表示されること", () => {
    render(<RelatedArticles posts={mockPosts} />);
    const firstPostLink = screen.getByRole("link", { name: "First Post" });
    expect(firstPostLink).toHaveAttribute("href", "/blog/post-1");
  });

  test("各記事のカテゴリ値札が表示されること", () => {
    render(<RelatedArticles posts={mockPosts} />);
    expect(screen.getByText("開発ノート")).toBeInTheDocument();
    expect(screen.getByText("AIワークフロー")).toBeInTheDocument();
    expect(screen.getByText("ツールガイド")).toBeInTheDocument();
  });

  test("各記事の公開日（右端メタ）が表示されること", () => {
    render(<RelatedArticles posts={mockPosts} />);
    // formatDate("2026-01-10T00:00:00Z") -> "2026-01-10"（JST基準）
    expect(screen.getByText("2026-01-10")).toBeInTheDocument();
    expect(screen.getByText("2026-01-20")).toBeInTheDocument();
    expect(screen.getByText("2026-01-30")).toBeInTheDocument();
  });

  test("公開日が機械可読な <time dateTime> 要素として描画されること（意味的日付の退行防止）", () => {
    render(<RelatedArticles posts={mockPosts} />);
    // Shinagaki 統合後も各記事の日付は <time> で包まれ dateTime に生の値を持つこと。
    const timeElements = Array.from(document.querySelectorAll("time"));
    expect(timeElements.length).toBeGreaterThanOrEqual(3);
    const dateTimes = timeElements.map((el) => el.getAttribute("dateTime"));
    expect(dateTimes).toContain("2026-01-10T00:00:00Z");
    expect(dateTimes).toContain("2026-01-20T00:00:00Z");
    expect(dateTimes).toContain("2026-01-30T00:00:00Z");
  });

  test("posts が空配列のとき何も描画されないこと", () => {
    const { container } = render(<RelatedArticles posts={[]} />);
    expect(container.innerHTML).toBe("");
  });

  test("全記事へのリンクが正しいhrefを持つこと", () => {
    render(<RelatedArticles posts={mockPosts} />);
    expect(screen.getByRole("link", { name: "Second Post" })).toHaveAttribute(
      "href",
      "/blog/post-2",
    );
    expect(screen.getByRole("link", { name: "Third Post" })).toHaveAttribute(
      "href",
      "/blog/post-3",
    );
  });
});
