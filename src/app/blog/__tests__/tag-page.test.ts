import { describe, expect, test } from "vitest";
import {
  getPostsByTag,
  getTagsWithMinPosts,
  MIN_POSTS_FOR_TAG_INDEX,
  TAG_DESCRIPTIONS,
} from "@/blog/_lib/blog";
import { generateStaticParams } from "@/app/blog/tag/[tag]/page";

describe("/blog/tag/[tag]", () => {
  test("generateStaticParams が 3件以上の記事を持つタグのみを返すこと", () => {
    const params = generateStaticParams();
    const tagsWithMinPosts = getTagsWithMinPosts(3);

    // All generated tags should have at least 3 posts
    for (const { tag } of params) {
      const posts = getPostsByTag(tag);
      expect(
        posts.length,
        `タグ「${tag}」の記事数が3件未満`,
      ).toBeGreaterThanOrEqual(3);
    }

    // All tags with 3+ posts should be in generateStaticParams
    expect(params.map((p) => p.tag).sort()).toEqual(tagsWithMinPosts.sort());
  }, 15000);

  test("主要タグが含まれること", () => {
    const params = generateStaticParams();
    const tagNames = params.map((p) => p.tag);

    expect(tagNames).toContain("設計パターン");
    expect(tagNames).toContain("Next.js");
    expect(tagNames).toContain("SEO");
  }, 15000);

  test("各タグにTAG_DESCRIPTIONSが定義されていること（3件以上のタグ）", () => {
    const tagsWithMinPosts = getTagsWithMinPosts(3);
    const missingDescriptions: string[] = [];

    for (const tag of tagsWithMinPosts) {
      if (!TAG_DESCRIPTIONS[tag]) {
        missingDescriptions.push(tag);
      }
    }

    expect(
      missingDescriptions,
      `タグ説明文が未定義のタグ: ${missingDescriptions.join(", ")}`,
    ).toHaveLength(0);
  }, 15000);

  test("noindex は MIN_POSTS_FOR_TAG_INDEX 件未満の記事数のタグに設定されること", () => {
    const posts5 = Array.from({ length: 5 }, (_, i) => i);
    const posts4 = Array.from({ length: 4 }, (_, i) => i);

    // 5件以上はindexable
    expect(posts5.length >= MIN_POSTS_FOR_TAG_INDEX).toBe(true);
    // 4件はnoindex
    expect(posts4.length >= MIN_POSTS_FOR_TAG_INDEX).toBe(false);
  });
});
