import { beforeEach, describe, expect, test, vi } from "vitest";
import type { BlogPostMeta } from "@/blog/_lib/blog";

const mockGetAllBlogPosts = vi.fn<() => BlogPostMeta[]>();

vi.mock("@/blog/_lib/blog", () => ({
  getAllBlogPosts: mockGetAllBlogPosts,
}));

const FIXED_POSTS: BlogPostMeta[] = [
  {
    title: "Memo Link Post",
    slug: "memo-link-post",
    description: "links json-formatter",
    published_at: "2026-01-01T00:00:00+09:00",
    updated_at: "2026-01-01T00:00:00+09:00",
    tags: ["tool"],
    category: "dev-notes",
    related_tool_slugs: ["json-formatter"],
    draft: false,
    readingTime: 1,
    trustLevel: "generated",
  },
  {
    title: "Shared Link Post",
    slug: "shared-link-post",
    description: "links kanji-kanaru",
    published_at: "2026-01-02T00:00:00+09:00",
    updated_at: "2026-01-02T00:00:00+09:00",
    tags: ["cross-link"],
    category: "tool-guides",
    related_tool_slugs: ["kanji-kanaru"],
    draft: false,
    readingTime: 1,
    trustLevel: "generated",
  },
  {
    title: "Tool Link Post",
    slug: "tool-link-post",
    description: "links json-formatter and kanji-kanaru",
    published_at: "2026-01-03T00:00:00+09:00",
    updated_at: "2026-01-03T00:00:00+09:00",
    tags: ["tool"],
    category: "site-updates",
    related_tool_slugs: ["json-formatter", "kanji-kanaru"],
    draft: false,
    readingTime: 1,
    trustLevel: "generated",
  },
];

describe("cross-links", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    mockGetAllBlogPosts.mockReturnValue(FIXED_POSTS);
  });

  test("tool/game slug参照を正しく逆引きできる", async () => {
    const { getRelatedBlogPostsForTool, getRelatedBlogPostsForGame } =
      await import("../cross-links");

    expect(
      getRelatedBlogPostsForTool("json-formatter").map((post) => post.slug),
    ).toEqual(["memo-link-post", "tool-link-post"]);
    expect(
      getRelatedBlogPostsForGame("kanji-kanaru").map((post) => post.slug),
    ).toEqual(["shared-link-post", "tool-link-post"]);
    expect(getRelatedBlogPostsForTool("missing-tool")).toEqual([]);
  });

  test("ブログ参照インデックスはモジュール内で1回だけ構築される", async () => {
    const { getRelatedBlogPostsForTool, getRelatedBlogPostsForGame } =
      await import("../cross-links");

    getRelatedBlogPostsForTool("json-formatter");
    getRelatedBlogPostsForGame("kanji-kanaru");

    expect(mockGetAllBlogPosts).toHaveBeenCalledTimes(1);
  });
});
