import { describe, expect, test } from "vitest";
import { NextRequest } from "next/server";
import { readFileSync } from "fs";
import { resolve } from "path";
import postcss, { type AtRule, type Container } from "postcss";
import {
  DELETED_BLOG_SLUGS,
  isDeletedBlogSlug,
  build410Html,
  middleware,
  GONE_PAGE_TOKENS,
  GONE_PAGE_FALLBACK_FONT_FACE,
} from "../middleware";
import { SITE_NAME } from "@/lib/constants";
import {
  FOOTER_LINKS,
  HEADER_NAV_ITEMS,
  MAIN_CONTENT_ID,
} from "@/lib/site-frame";

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

    test("端末の設定が dark なら dark のトークンに切り替わる（§10）", () => {
      expect(html).toMatch(
        /@media \(prefers-color-scheme: dark\)\{:root\{color-scheme:dark;--paper:/,
      );
    });

    test("theme-color はテーマごとの紙の色（§10）", () => {
      expect(html).toContain(
        "<meta name='theme-color' media='(prefers-color-scheme: light)' content='#fcfcfc' />",
      );
      expect(html).toContain(
        "<meta name='theme-color' media='(prefers-color-scheme: dark)' content='#121212' />",
      );
    });

    test("Web フォントを読まないので、Zen Antique を名指ししない（§3）", () => {
      expect(html).not.toContain("Zen Antique");
    });

    test("リンクは墨の文字と下線で表す（色ベタのボタンでない・§6）", () => {
      expect(html).toMatch(/a\{color:var\(--ink\);text-decoration:underline;/);
    });

    test("角丸を持たない（0.5rem の角丸を含まない・§5）", () => {
      expect(html).not.toContain("border-radius:0.5rem");
    });
  });
});

describe("build410Html の枠（DESIGN.md §5 レイアウト）", () => {
  const html = build410Html();
  const header = html.match(/<header>[\s\S]*<\/header>/)?.[0] ?? "";
  const footer = html.match(/<footer>[\s\S]*<\/footer>/)?.[0] ?? "";

  /** FrameLink と同じ形のリンク。字を data-label にも持たせ、太字の幅を先に取る。 */
  const frameLink = (href: string, label: string, extraClass = "") =>
    `<a class='link${extraClass}' href='${href}' data-text-box='inline'><span class='label' data-label='${label}'>${label}</span></a>`;

  test("上端にサイト名のトップへのリンクと、ほかのページと同じナビの項目を置く", () => {
    expect(header).toContain(frameLink("/", SITE_NAME, " site-name"));
    for (const item of HEADER_NAV_ITEMS) {
      expect(header).toContain(frameLink(item.href, item.label));
    }
  });

  test("下端にほかのページと同じリンクを置く", () => {
    for (const link of FOOTER_LINKS) {
      expect(footer).toContain(frameLink(link.href, link.label));
    }
  });

  test("中間の main にはフォーカスの輪を出さない", () => {
    expect(html).toContain("main:focus{outline:none;box-shadow:none}");
  });

  test("スキップのリンクが中間の main を指す", () => {
    expect(html).toContain(`href='#${MAIN_CONTENT_ID}'`);
    expect(html).toContain(`<main id='${MAIN_CONTENT_ID}' tabindex='-1'`);
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

/**
 * 410 のページのトークンが globals.css と同じ名前・同じ値であることの検査。
 * middleware は globals.css を読めないので、globals.css だけを変えたときに 410 が古い値のまま残らないようにする。
 */
describe("build410Html のトークンは globals.css と一致する", () => {
  const globals = postcss.parse(
    readFileSync(resolve(__dirname, "../app/globals.css"), "utf-8"),
  );

  /** 宣言の値の空白を1つにそろえる（globals.css は長い値を折り返して書く）。 */
  const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

  /** ブロックの直下の :root の宣言を集める。 */
  function rootDeclarations(block: Container): Map<string, string> {
    const decls = new Map<string, string>();
    block.each((node) => {
      if (node.type !== "rule" || node.selector !== ":root") return;
      node.walkDecls((decl) => {
        decls.set(decl.prop, normalize(decl.value));
      });
    });
    return decls;
  }

  function mediaBlock(query: string): AtRule {
    const found = globals.nodes.find(
      (node): node is AtRule =>
        node.type === "atrule" &&
        node.name === "media" &&
        node.params === query,
    );
    if (!found) throw new Error(`globals.css に @media ${query} が無い`);
    return found;
  }

  /** Web フォントを除いた書体の並び。410 は Web フォントを読み込まない。 */
  const withoutWebFonts = (value: string) =>
    value.replace(/var\(--font-(plex-sans|zen-antique)\), /g, "");

  test.each(Object.entries(GONE_PAGE_TOKENS))("%s", (scope, tokens) => {
    const expected = rootDeclarations(
      scope === "root" ? globals : mediaBlock(scope),
    );
    for (const [prop, value] of Object.entries(tokens)) {
      expect(expected.has(prop), `${prop} が globals.css に無い`).toBe(true);
      expect(value, prop).toBe(withoutWebFonts(expected.get(prop)!));
    }
  });

  test("IBM Plex Sans の代わりの書体の @font-face", () => {
    const fontFace = globals.nodes.find(
      (node): node is AtRule =>
        node.type === "atrule" && node.name === "font-face",
    );
    const expected = new Map<string, string>();
    fontFace!.walkDecls((decl) => {
      expected.set(decl.prop, decl.value);
    });
    expect(Object.fromEntries(expected)).toEqual(GONE_PAGE_FALLBACK_FONT_FACE);
  });
});
