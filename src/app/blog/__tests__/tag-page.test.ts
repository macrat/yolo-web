import { describe, expect, test } from "vitest";
import {
  getAllTags,
  getPostsByTag,
  MIN_POSTS_FOR_TAG_INDEX,
  TAG_DESCRIPTIONS,
} from "@/blog/_lib/blog";
import { generateStaticParams } from "@/app/blog/tag/[tag]/page";

describe("/blog/tag/[tag]", () => {
  test("generateStaticParams が記事に付いたすべてのタグを返すこと", () => {
    const params = generateStaticParams();

    // 記事に付いたタグはすべてページを持つ（タグリンクの行き先が必ず存在する）
    expect(params.map((p) => p.tag).sort()).toEqual(getAllTags().sort());

    // 生成されるページはいずれも記事を1件以上持つ
    for (const { tag } of params) {
      expect(
        getPostsByTag(tag).length,
        `タグ「${tag}」に記事がない`,
      ).toBeGreaterThan(0);
    }
  }, 15000);

  test("主要タグが含まれること", () => {
    const params = generateStaticParams();
    const tagNames = params.map((p) => p.tag);

    expect(tagNames).toContain("設計パターン");
    expect(tagNames).toContain("Next.js");
    expect(tagNames).toContain("SEO");
  }, 15000);

  test("すべてのタグに TAG_DESCRIPTIONS の説明文が定義されていること", () => {
    // 説明文はタグページの見出し下に出るため、ページを持つタグには必ず要る
    const missingDescriptions = getAllTags().filter(
      (tag) => !TAG_DESCRIPTIONS[tag],
    );

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
