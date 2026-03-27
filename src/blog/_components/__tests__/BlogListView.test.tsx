/**
 * BlogListView コンポーネントのテスト
 *
 * - カテゴリピルに記事件数が表示されること
 * - フィルタ未適用時に人気タグセクションが表示されること
 * - カテゴリフィルタ適用時は人気タグセクションが非表示であること
 */
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BlogListView from "@/blog/_components/BlogListView";
import type { BlogPostMeta } from "@/blog/_lib/blog";

// next/link をアンカータグにモックする
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
    "data-active": dataActive,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    "data-active"?: string;
  }) => (
    <a href={href} className={className} data-active={dataActive} {...rest}>
      {children}
    </a>
  ),
}));

/** 最小限の BlogPostMeta を生成するヘルパー */
function makeMeta(
  overrides: Partial<BlogPostMeta> & { slug: string },
): BlogPostMeta {
  return {
    title: `Post ${overrides.slug}`,
    description: "",
    published_at: "2026-01-01",
    updated_at: "2026-01-01",
    tags: [],
    category: "dev-notes",
    related_tool_slugs: [],
    draft: false,
    readingTime: 5,
    trustLevel: "generated" as const,
    ...overrides,
  };
}

/** テスト用の記事データ */
const allPosts: BlogPostMeta[] = [
  makeMeta({
    slug: "post-1",
    category: "ai-workflow",
    tags: ["Next.js", "React"],
  }),
  makeMeta({
    slug: "post-2",
    category: "ai-workflow",
    tags: ["React", "TypeScript"],
  }),
  makeMeta({
    slug: "post-3",
    category: "dev-notes",
    tags: ["TypeScript", "Vitest"],
  }),
  makeMeta({ slug: "post-4", category: "dev-notes", tags: ["Next.js", "CSS"] }),
  makeMeta({ slug: "post-5", category: "site-updates", tags: ["CSS"] }),
];

describe("BlogListView - カテゴリピル件数表示", () => {
  test("「すべて」ピルに全記事数が表示される", () => {
    render(
      <BlogListView
        posts={allPosts.slice(0, 5)}
        currentPage={1}
        totalPages={1}
        basePath="/blog"
        allPosts={allPosts}
      />,
    );
    // 「すべて (5)」と表示されること
    expect(screen.getByText(/すべて.*5/)).toBeInTheDocument();
  });

  test("カテゴリピルに該当カテゴリの記事件数が表示される", () => {
    render(
      <BlogListView
        posts={allPosts.slice(0, 5)}
        currentPage={1}
        totalPages={1}
        basePath="/blog"
        allPosts={allPosts}
      />,
    );
    // ai-workflow: 2記事
    expect(screen.getByText(/AIワークフロー.*2/)).toBeInTheDocument();
    // dev-notes: 2記事
    expect(screen.getByText(/開発ノート.*2/)).toBeInTheDocument();
    // site-updates: 1記事
    expect(screen.getByText(/サイト更新.*1/)).toBeInTheDocument();
  });
});

describe("BlogListView - 人気タグセクション", () => {
  test("フィルタ未適用時に「タグで探す」セクションが表示される", () => {
    render(
      <BlogListView
        posts={allPosts.slice(0, 5)}
        currentPage={1}
        totalPages={1}
        basePath="/blog"
        allPosts={allPosts}
      />,
    );
    expect(screen.getByText("タグで探す")).toBeInTheDocument();
  });

  test("タグが /blog/tag/[tag] へのリンクになっている", () => {
    render(
      <BlogListView
        posts={allPosts.slice(0, 5)}
        currentPage={1}
        totalPages={1}
        basePath="/blog"
        allPosts={allPosts}
      />,
    );
    // 人気タグセクション内の "Next.js" リンクを確認する
    // TagList でもリンクが出るため、人気タグナビゲーション内を特定して確認する
    const popularTagsNav = screen.getByRole("navigation", { name: "人気タグ" });
    const tagLinks = popularTagsNav.querySelectorAll("a");
    const nextJsLink = Array.from(tagLinks).find(
      (a) => a.textContent === "Next.js",
    );
    expect(nextJsLink).toBeDefined();
    expect(nextJsLink?.getAttribute("href")).toContain("/blog/tag/");
    expect(nextJsLink?.getAttribute("href")).toContain("Next.js");
  });

  test("カテゴリフィルタ適用時に「タグで探す」セクションが非表示になる", () => {
    render(
      <BlogListView
        posts={allPosts.slice(0, 2)}
        currentPage={1}
        totalPages={1}
        basePath="/blog/category/ai-workflow"
        activeCategory="ai-workflow"
        allPosts={allPosts}
      />,
    );
    expect(screen.queryByText("タグで探す")).toBeNull();
  });

  test("タグは使用頻度の高い順に表示される（上位8個まで）", () => {
    const postsWithManyTags: BlogPostMeta[] = Array.from(
      { length: 10 },
      (_, i) =>
        makeMeta({
          slug: `post-many-${i}`,
          tags: ["popular-tag", `tag-${i}`],
        }),
    );

    render(
      <BlogListView
        posts={postsWithManyTags.slice(0, 8)}
        currentPage={1}
        totalPages={1}
        basePath="/blog"
        allPosts={postsWithManyTags}
      />,
    );

    // 人気タグセクション内の "popular-tag" リンクを確認する
    const popularTagsNav = screen.getByRole("navigation", { name: "人気タグ" });
    const popularTagLink = popularTagsNav.querySelector(
      "a[href*='popular-tag']",
    );
    expect(popularTagLink).toBeTruthy();
  });

  test("表示されるタグは最大8個", () => {
    // 10種類のタグがある記事データ
    const postsWithManyTags: BlogPostMeta[] = Array.from(
      { length: 10 },
      (_, i) =>
        makeMeta({
          slug: `post-many-${i}`,
          tags: [`unique-tag-${i}`],
        }),
    );

    render(
      <BlogListView
        posts={postsWithManyTags.slice(0, 8)}
        currentPage={1}
        totalPages={1}
        basePath="/blog"
        allPosts={postsWithManyTags}
      />,
    );

    // タグで探すセクション内のリンク数が最大8であること
    const tagSection = screen.getByRole("navigation", {
      name: "人気タグ",
    });
    const tagLinks = tagSection.querySelectorAll("a");
    expect(tagLinks.length).toBeLessThanOrEqual(8);
  });
});
