import { describe, expect, test } from "vitest";
import { filterPostsByKeyword } from "../searchFilter";
import type { BlogPostMeta } from "@/blog/_lib/blog";

/** テスト用 BlogPostMeta を生成するヘルパー */
function makePost(overrides: Partial<BlogPostMeta> = {}): BlogPostMeta {
  return {
    slug: "test-post",
    title: "テスト記事タイトル",
    description: "テスト記事の説明文です。",
    published_at: "2026-01-01",
    updated_at: "2026-01-01",
    tags: ["テスト", "サンプル"],
    category: "dev-notes",
    series: undefined,
    related_tool_slugs: [],
    draft: false,
    readingTime: 3,
    trustLevel: "generated",
    ...overrides,
  };
}

/**
 * テスト用のラベルマッピング（実際の値と一致させる）
 */
const categoryLabels: Record<string, string> = {
  "ai-workflow": "AIワークフロー",
  "dev-notes": "開発ノート",
  "site-updates": "サイト更新",
  "tool-guides": "ツールガイド",
  "japanese-culture": "日本語・文化",
};

const seriesLabels: Record<string, string> = {
  "ai-agent-ops": "AIエージェント運用記",
  "japanese-culture": "日本語・日本文化",
  "nextjs-deep-dive": "Next.js実践ノート",
};

describe("filterPostsByKeyword", () => {
  // (i) タイトルに含まれる場合ヒット
  test("タイトルにキーワードが含まれる場合ヒットする", () => {
    const posts = [
      makePost({
        slug: "match",
        title: "Next.js ハイドレーションエラーの解消",
      }),
      makePost({ slug: "nomatch", title: "日本語・文化について" }),
    ];
    const result = filterPostsByKeyword(
      posts,
      "ハイドレーション",
      categoryLabels,
      seriesLabels,
    );
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("match");
  });

  // (ii) description に含まれる場合ヒット
  test("description にキーワードが含まれる場合ヒットする", () => {
    const posts = [
      makePost({ slug: "match", description: "Suspense を使った実装パターン" }),
      makePost({ slug: "nomatch", description: "四字熟語の学習サービス" }),
    ];
    const result = filterPostsByKeyword(
      posts,
      "Suspense",
      categoryLabels,
      seriesLabels,
    );
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("match");
  });

  // (iii) tags 配列のいずれかに含まれる場合ヒット
  test("tags 配列のいずれかにキーワードが含まれる場合ヒットする", () => {
    const posts = [
      makePost({ slug: "match", tags: ["Claude Code", "AIエージェント"] }),
      makePost({ slug: "nomatch", tags: ["TypeScript", "React"] }),
    ];
    const result = filterPostsByKeyword(
      posts,
      "Claude Code",
      categoryLabels,
      seriesLabels,
    );
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("match");
  });

  // (iv) カテゴリ表示名（CATEGORY_LABELS）に含まれる場合ヒット
  test("カテゴリ表示名にキーワードが含まれる場合ヒットする（例: 「開発」で dev-notes の記事がヒット）", () => {
    const posts = [
      makePost({ slug: "match", category: "dev-notes" }),
      makePost({ slug: "nomatch", category: "ai-workflow" }),
    ];
    const result = filterPostsByKeyword(
      posts,
      "開発",
      categoryLabels,
      seriesLabels,
    );
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("match");
  });

  // (v) シリーズ表示名（SERIES_LABELS）に含まれる場合ヒット
  test("シリーズ表示名にキーワードが含まれる場合ヒットする（例: 「実践ノート」で nextjs-deep-dive シリーズの記事がヒット）", () => {
    const posts = [
      makePost({ slug: "match", series: "nextjs-deep-dive" }),
      makePost({ slug: "nomatch", series: undefined }),
    ];
    const result = filterPostsByKeyword(
      posts,
      "実践ノート",
      categoryLabels,
      seriesLabels,
    );
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("match");
  });

  // (v) series が null の記事はシリーズ表示名でヒットしない
  test("series が null の記事はシリーズ表示名でヒットしない", () => {
    const posts = [
      makePost({
        slug: "noseries",
        series: undefined,
        title: "シリーズなし記事",
      }),
    ];
    // "AIエージェント運用記" は series なし記事のタイトルや他フィールドに含まれない
    const result = filterPostsByKeyword(
      posts,
      "AIエージェント運用記",
      categoryLabels,
      seriesLabels,
    );
    expect(result).toHaveLength(0);
  });

  // (vi) 大文字小文字不区別
  test("大文字小文字を区別しない（「next.js」と「Next.js」が等価）", () => {
    const posts = [
      makePost({ slug: "match", title: "Next.js の設計パターン" }),
    ];
    const resultLower = filterPostsByKeyword(
      posts,
      "next.js",
      categoryLabels,
      seriesLabels,
    );
    const resultUpper = filterPostsByKeyword(
      posts,
      "NEXT.JS",
      categoryLabels,
      seriesLabels,
    );
    expect(resultLower).toHaveLength(1);
    expect(resultUpper).toHaveLength(1);
  });

  // (vii) 空キーワードで全件返る
  test("空キーワードで全件返る", () => {
    const posts = [
      makePost({ slug: "post-1" }),
      makePost({ slug: "post-2" }),
      makePost({ slug: "post-3" }),
    ];
    const result = filterPostsByKeyword(
      posts,
      "",
      categoryLabels,
      seriesLabels,
    );
    expect(result).toHaveLength(3);
  });

  // (viii) どこにも含まれない場合 0 件
  test("どこにも含まれないキーワードでは 0 件返る", () => {
    const posts = [
      makePost({
        slug: "post-1",
        title: "普通の記事",
        description: "普通の説明",
        tags: ["TypeScript"],
      }),
    ];
    const result = filterPostsByKeyword(
      posts,
      "zzzzz存在しない語",
      categoryLabels,
      seriesLabels,
    );
    expect(result).toHaveLength(0);
  });
});
