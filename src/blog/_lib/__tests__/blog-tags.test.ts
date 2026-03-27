import { describe, test, expect } from "vitest";
import {
  TAG_DESCRIPTIONS,
  getAllTags,
  getPostsByTag,
  MIN_POSTS_FOR_TAG_INDEX,
} from "@/blog/_lib/blog";

describe("TAG_DESCRIPTIONS", () => {
  test("設計パターンの説明文が定義されていること", () => {
    expect(TAG_DESCRIPTIONS["設計パターン"]).toBeDefined();
    expect(typeof TAG_DESCRIPTIONS["設計パターン"]).toBe("string");
  });

  test("Next.jsの説明文が定義されていること", () => {
    expect(TAG_DESCRIPTIONS["Next.js"]).toBeDefined();
    expect(typeof TAG_DESCRIPTIONS["Next.js"]).toBe("string");
  });

  test("各タグ説明文が100文字以上であること", () => {
    for (const [tag, desc] of Object.entries(TAG_DESCRIPTIONS)) {
      expect(
        desc.length,
        `タグ「${tag}」の説明文が短すぎる（${desc.length}文字）`,
      ).toBeGreaterThanOrEqual(100);
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
  test("関数が存在すること", () => {
    expect(typeof getAllTags).toBe("function");
  });

  test("文字列の配列を返すこと", () => {
    // This function reads from the filesystem, so we just check the return type structure
    const tags = getAllTags();
    expect(Array.isArray(tags)).toBe(true);
  });
});

describe("getPostsByTag", () => {
  test("関数が存在すること", () => {
    expect(typeof getPostsByTag).toBe("function");
  });
});

describe("MIN_POSTS_FOR_TAG_INDEX", () => {
  test("定数が5であること", () => {
    expect(MIN_POSTS_FOR_TAG_INDEX).toBe(5);
  });
});
