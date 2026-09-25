import { describe, expect, test } from "vitest";
import { NextRequest } from "next/server";
import {
  DELETED_BLOG_SLUGS,
  isDeletedBlogSlug,
  build410Html,
  middleware,
} from "../middleware";

describe("DELETED_BLOG_SLUGS", () => {
  test("19件の削除済みスラッグが定義されている", () => {
    expect(DELETED_BLOG_SLUGS).toHaveLength(19);
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
    "web-developer-tools-guide",
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
  test("全19件の削除済みスラッグに対してtrueを返す", () => {
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

  // 410 ページの見た目を DESIGN.md の色（§2）・書体（§3）・持たないもの（§5）に固定する。
  describe("店構えデザイン契約", () => {
    const html = build410Html();

    test("青のアクセント（#2563eb / #1d4ed8）を含まない（§2）", () => {
      expect(html).not.toContain("#2563eb");
      expect(html).not.toContain("#1d4ed8");
    });

    test("冷色スレート地（#f8fafc / #1e293b）を含まない（§2）", () => {
      expect(html).not.toContain("#f8fafc");
      expect(html).not.toContain("#1e293b");
    });

    test("絵文字（📄）を含まない（§5）", () => {
      expect(html).not.toContain("📄");
    });

    test("紙と墨の無彩の色を使う（§2）", () => {
      expect(html).toContain("#fcfcfc"); // --paper
      expect(html).toContain("#0b0b0b"); // --ink
    });

    test("端末の設定が dark なら dark の紙と墨になる（§10）", () => {
      const dark = html.match(/@media \(prefers-color-scheme:dark\)\{[^}]*\}/);
      expect(dark).not.toBeNull();
      expect(dark![0]).toContain("#121212"); // dark の --paper
      expect(dark![0]).toContain("#f5f5f5"); // dark の --ink
    });

    test("Web フォントを読まないので、見出しは仮名が全角の端末の書体で組む（§3）", () => {
      expect(html).toContain("h1{font-family:'BIZ UDGothic',");
      expect(html).not.toContain("Zen Antique");
    });

    test("トップへの導線は墨の文字で表す（色ベタのボタンでない・§6）", () => {
      expect(html).toContain("href='/'");
      expect(html).toMatch(/a\.home\{[^}]*color:var\(--ink\)/);
    });

    test("角丸を持たない（0.5rem の角丸を含まない・§5）", () => {
      expect(html).not.toContain("border-radius:0.5rem");
    });
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

  test("削除済みスラッグ（web-developer-tools-guide）へのリクエストで410レスポンスが返る", async () => {
    const request = new NextRequest(
      new URL("/blog/web-developer-tools-guide", "http://localhost"),
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
