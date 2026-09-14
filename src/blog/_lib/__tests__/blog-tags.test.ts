import { describe, test, expect } from "vitest";
import {
  TAG_DESCRIPTIONS,
  getAllTags,
  getPostsByTag,
  MIN_POSTS_FOR_TAG_INDEX,
} from "@/blog/_lib/blog";

/**
 * 説明文はタグページの見出し下に出ると同時に meta description になる。
 * 長さに下限は置かない。掲載記事の薄いタグでは、字数を埋めようとすると
 * ページに無い内容まで書くことになり、読者を欺くため。
 */
const MAX_TAG_DESCRIPTION_LENGTH = 160;

describe("TAG_DESCRIPTIONS", () => {
  test("各タグ説明文が中身を持つこと", () => {
    for (const [tag, desc] of Object.entries(TAG_DESCRIPTIONS)) {
      expect(typeof desc, `タグ「${tag}」の説明文が文字列でない`).toBe(
        "string",
      );
      expect(desc.trim(), `タグ「${tag}」の説明文が空`).not.toBe("");
    }
  });

  test("各タグ説明文が検索結果で切り詰められない長さに収まること", () => {
    for (const [tag, desc] of Object.entries(TAG_DESCRIPTIONS)) {
      expect(
        desc.length,
        `タグ「${tag}」の説明文が長すぎる（${desc.length}文字）`,
      ).toBeLessThanOrEqual(MAX_TAG_DESCRIPTION_LENGTH);
    }
  });

  test("主要タグが定義されていること", () => {
    const majorTags = [
      "設計パターン",
      "Web開発",
      "SEO",
      "Next.js",
      "新機能",
      "オンラインツール",
      "UI改善",
      "TypeScript",
      "日本語",
      "サイト運営",
      "ゲーム",
      "AIエージェント",
      "ワークフロー",
    ];
    for (const tag of majorTags) {
      expect(
        TAG_DESCRIPTIONS[tag],
        `タグ「${tag}」の説明文が未定義`,
      ).toBeDefined();
    }
  });
});

describe("getAllTags", () => {
  test("重複なしのタグ一覧を返すこと", () => {
    const tags = getAllTags();
    const uniqueTags = new Set(tags);
    expect(uniqueTags.size).toBe(tags.length);
  });

  test("アルファベット順にソートされていること", () => {
    const tags = getAllTags();
    const sorted = [...tags].sort();
    expect(tags).toEqual(sorted);
  });
});

describe("getPostsByTag", () => {
  test("存在するタグに対して記事を返すこと", () => {
    // getAllTags で存在が確認できるタグを使う
    const allTags = getAllTags();
    if (allTags.length === 0) return; // 記事がない環境ではスキップ
    const firstTag = allTags[0];
    const posts = getPostsByTag(firstTag);
    expect(posts.length).toBeGreaterThan(0);
    // 全記事が指定タグを持つこと
    for (const post of posts) {
      expect(post.tags).toContain(firstTag);
    }
  });

  test("存在しないタグに対して空配列を返すこと", () => {
    const posts = getPostsByTag("__nonexistent_tag__");
    expect(posts).toEqual([]);
  });
});

describe("MIN_POSTS_FOR_TAG_INDEX", () => {
  test("定数が5であること", () => {
    expect(MIN_POSTS_FOR_TAG_INDEX).toBe(5);
  });
});
