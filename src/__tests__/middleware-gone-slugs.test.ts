import { describe, expect, test } from "vitest";
import { NextRequest } from "next/server";
import {
  DELETED_BLOG_SLUGS,
  isDeletedBlogSlug,
  build410Html,
  middleware,
} from "../middleware";

describe("DELETED_BLOG_SLUGS", () => {
  test("18件の削除済みスラッグが定義されている", () => {
    expect(DELETED_BLOG_SLUGS).toHaveLength(18);
  });

  const expectedSlugs = [
    "ai-agent-site-strategy-formulation",
    "ai-agent-bias-and-context-engineering",
    "forced-ideation-1728-combinations",
    "ai-agent-workflow-limits-when-4-skills-break",
    "nextjs-static-page-split-for-tools",
    "achievement-system-multi-agent-incidents",
    "character-fortune-text-art",
    "music-personality-design",
    "q43-humor-fortune-portal",
    "password-security-guide",
    "hash-generator-guide",
    "unit-converter-guide",
    "rss-feed",
    "html-sql-cheatsheets",
    "quality-improvement-and-restructure-design",
    "site-name-yolos-net",
    "tools-expansion-27",
    "traditional-colors-dictionary",
  ];

  test.each(expectedSlugs)("スラッグ '%s' が含まれている", (slug) => {
    expect(DELETED_BLOG_SLUGS).toContain(slug);
  });
});

describe("isDeletedBlogSlug", () => {
  test("全18件の削除済みスラッグに対してtrueを返す", () => {
    for (const slug of DELETED_BLOG_SLUGS) {
      expect(isDeletedBlogSlug(slug)).toBe(true);
    }
  });

  test("存在するブログスラッグ（some-valid-slug）に対してfalseを返す", () => {
    expect(isDeletedBlogSlug("some-valid-slug")).toBe(false);
  });

  test("空文字に対してfalseを返す", () => {
    expect(isDeletedBlogSlug("")).toBe(false);
  });
});

describe("build410Html", () => {
  test("「このコンテンツは終了しました」というメッセージを含む", () => {
    const html = build410Html();
    expect(html).toContain("このコンテンツは終了しました");
  });

  test("トップページへのリンク（href='/'）を含む", () => {
    const html = build410Html();
    expect(html).toContain("href='/'");
  });

  test("有効なHTML文字列を返す", () => {
    const html = build410Html();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html");
    expect(html).toContain("</html>");
  });
});

describe("middleware（統合テスト）", () => {
  test("削除済みスラッグ（password-security-guide）へのリクエストで410レスポンスが返る", async () => {
    const request = new NextRequest(
      new URL("/blog/password-security-guide", "http://localhost"),
    );
    const response = middleware(request);
    expect(response.status).toBe(410);
    const body = await response.text();
    expect(body).toContain("このコンテンツは終了しました");
  });

  test("通常スラッグ（cron-parser-guide）へのリクエストでNextResponse.next()相当が返る", () => {
    const request = new NextRequest(
      new URL("/blog/cron-parser-guide", "http://localhost"),
    );
    const response = middleware(request);
    // NextResponse.next() は status 200 を返す
    expect(response.status).toBe(200);
  });
});
