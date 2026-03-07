import { beforeEach, describe, expect, test, vi } from "vitest";
import type { BlogPostMeta } from "@/blog/_lib/blog";
import type { PublicMemo } from "@/memos/_lib/memos";

const mockGetAllBlogPosts = vi.fn<() => BlogPostMeta[]>();
const mockGetPublicMemoById = vi.fn<(id: string) => PublicMemo | null>();

vi.mock("@/blog/_lib/blog", () => ({
  getAllBlogPosts: mockGetAllBlogPosts,
}));

vi.mock("@/memos/_lib/memos", () => ({
  getPublicMemoById: mockGetPublicMemoById,
}));

const FIXED_POSTS: BlogPostMeta[] = [
  {
    title: "Memo Link Post",
    slug: "memo-link-post",
    description: "links memo-1",
    published_at: "2026-01-01T00:00:00+09:00",
    updated_at: "2026-01-01T00:00:00+09:00",
    tags: ["memo"],
    category: "technical",
    related_memo_ids: ["memo-1"],
    related_tool_slugs: ["json-formatter"],
    draft: false,
    readingTime: 1,
    trustLevel: "generated",
  },
  {
    title: "Shared Link Post",
    slug: "shared-link-post",
    description: "links memo-2 and kanji-kanaru",
    published_at: "2026-01-02T00:00:00+09:00",
    updated_at: "2026-01-02T00:00:00+09:00",
    tags: ["cross-link"],
    category: "guide",
    related_memo_ids: ["memo-2"],
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
    category: "release",
    related_memo_ids: [],
    related_tool_slugs: ["json-formatter", "kanji-kanaru"],
    draft: false,
    readingTime: 1,
    trustLevel: "generated",
  },
];

const FIXED_MEMOS: Record<string, PublicMemo> = {
  "memo-1": {
    id: "memo-1",
    subject: "公開メモ",
    from: "owner",
    to: "builder",
    created_at: "2026-01-01T10:00:00+09:00",
    tags: ["public"],
    reply_to: null,
    contentHtml: "<p>public</p>",
    threadRootId: "memo-1",
    replyCount: 0,
  },
  "memo-2": {
    id: "memo-2",
    subject: "別の公開メモ",
    from: "owner",
    to: "reviewer",
    created_at: "2026-01-02T10:00:00+09:00",
    tags: ["public"],
    reply_to: null,
    contentHtml: "<p>public-2</p>",
    threadRootId: "memo-2",
    replyCount: 0,
  },
};

describe("cross-links", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    mockGetAllBlogPosts.mockReturnValue(FIXED_POSTS);
    mockGetPublicMemoById.mockImplementation(
      (id: string) => FIXED_MEMOS[id] ?? null,
    );
  });

  test("memo ID参照を正しく逆引きできる", async () => {
    const { getRelatedBlogPostsForMemo } = await import("../cross-links");

    expect(
      getRelatedBlogPostsForMemo("memo-1").map((post) => post.slug),
    ).toEqual(["memo-link-post"]);
    expect(
      getRelatedBlogPostsForMemo("memo-2").map((post) => post.slug),
    ).toEqual(["shared-link-post"]);
    expect(getRelatedBlogPostsForMemo("memo-missing")).toEqual([]);
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

  test("非公開・不存在memoは null を返し、並び順を維持する", async () => {
    const { getRelatedMemosForBlogPost } = await import("../cross-links");

    expect(
      getRelatedMemosForBlogPost(["memo-1", "memo-private", "memo-missing"]),
    ).toEqual([FIXED_MEMOS["memo-1"], null, null]);
  });

  test("ブログ参照インデックスはモジュール内で1回だけ構築される", async () => {
    const {
      getRelatedBlogPostsForMemo,
      getRelatedBlogPostsForTool,
      getRelatedBlogPostsForGame,
    } = await import("../cross-links");

    getRelatedBlogPostsForMemo("memo-1");
    getRelatedBlogPostsForTool("json-formatter");
    getRelatedBlogPostsForGame("kanji-kanaru");

    expect(mockGetAllBlogPosts).toHaveBeenCalledTimes(1);
  });
});
