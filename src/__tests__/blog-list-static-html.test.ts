/**
 * ブログ一覧ページの静的HTML検査
 *
 * ブログ一覧は 6 つのルート形すべてが同じ Server Component から描画され、
 * キーワード検索だけを Client Component が担う。検索状態は `useSearchParams`
 * に依存するため、一覧本体がクライアント描画へ退避すると記事リンクが
 * 静的HTMLから消え、クローラからも JS 無効環境からも記事へ辿り着けなくなる。
 * ここでは本番ビルドの生成物を直接読み、次の 4 点を検査する。
 *
 * 1. 一覧の 6 ルート形すべてがプリレンダリングされていること
 * 2. 一覧ルートのプリレンダリング済みHTMLすべてに記事リンクが載っていること
 * 3. 公開記事のすべてが、いずれかの一覧ページの静的HTMLからリンクされていること
 * 4. 静的シェルの検索欄が `disabled` であること
 *    （ハイドレーション前に打った文字は黙って捨てられるため）
 *
 * 実行経路:
 * - `npm run build` の後に `npm run test:build` で実行する
 * - 生成物が無いときはスキップせず失敗する（`requireBuildOutput`）
 *
 * データソース:
 * - `.next/server/app/blog**.html`（一覧ルートと記事ページのプリレンダリング結果）
 * - `getAllBlogPosts()`（公開記事の集合）
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, test } from "vitest";

import { getAllBlogPosts } from "@/blog/_lib/blog";
import { SERVER_APP_DIR, requireBuildOutput } from "./build-output";

// ---------------------------------------------------------------------------
// ビルド生成物のパス
// ---------------------------------------------------------------------------
const BLOG_DIR = path.join(SERVER_APP_DIR, "blog");
const BLOG_INDEX_HTML = path.join(SERVER_APP_DIR, "blog.html");

requireBuildOutput(BLOG_INDEX_HTML);

// ---------------------------------------------------------------------------
// 一覧ルートの形
// ---------------------------------------------------------------------------

/**
 * 一覧を描画するルートの形。
 * いずれも BlogListView を経由するため、1 つでも静的HTMLから記事リンクが
 * 消えていれば同じ原因で他も壊れている可能性が高い。
 */
type ListingShape =
  | "/blog"
  | "/blog/page/[page]"
  | "/blog/category/[category]"
  | "/blog/category/[category]/page/[page]"
  | "/blog/tag/[tag]"
  | "/blog/tag/[tag]/page/[page]";

const LISTING_SHAPES: readonly ListingShape[] = [
  "/blog",
  "/blog/page/[page]",
  "/blog/category/[category]",
  "/blog/category/[category]/page/[page]",
  "/blog/tag/[tag]",
  "/blog/tag/[tag]/page/[page]",
];

interface PrerenderedPage {
  /** 生成されたHTMLの絶対パス */
  htmlPath: string;
  /** 対応する公開URL（失敗メッセージ用） */
  url: string;
}

// ---------------------------------------------------------------------------
// ヘルパー: 生成物の走査
// ---------------------------------------------------------------------------

function listHtmlFilesIn(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

function listSubdirectoriesIn(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

/** 生成物の絶対パスから公開URLを復元する。 */
function toUrl(htmlPath: string): string {
  const relative = path
    .relative(SERVER_APP_DIR, htmlPath)
    .replace(/\.html$/, "");
  return `/${relative.split(path.sep).join("/")}`;
}

function toPrerenderedPages(htmlPaths: string[]): PrerenderedPage[] {
  return htmlPaths.map((htmlPath) => ({ htmlPath, url: toUrl(htmlPath) }));
}

/**
 * 指定したルート形でプリレンダリングされたページを集める。
 * 動的セグメントのプレースホルダディレクトリ（`[page]` など）にHTMLは出力
 * されないため、ディレクトリ直下のHTMLを拾うだけで実ページだけが集まる。
 */
function collectPrerenderedPages(shape: ListingShape): PrerenderedPage[] {
  switch (shape) {
    case "/blog":
      return toPrerenderedPages([BLOG_INDEX_HTML]);
    case "/blog/page/[page]":
      return toPrerenderedPages(listHtmlFilesIn(path.join(BLOG_DIR, "page")));
    case "/blog/category/[category]":
      return toPrerenderedPages(
        listHtmlFilesIn(path.join(BLOG_DIR, "category")),
      );
    case "/blog/tag/[tag]":
      return toPrerenderedPages(listHtmlFilesIn(path.join(BLOG_DIR, "tag")));
    case "/blog/category/[category]/page/[page]":
      return toPrerenderedPages(
        listSubdirectoriesIn(path.join(BLOG_DIR, "category")).flatMap((dir) =>
          listHtmlFilesIn(path.join(dir, "page")),
        ),
      );
    case "/blog/tag/[tag]/page/[page]":
      return toPrerenderedPages(
        listSubdirectoriesIn(path.join(BLOG_DIR, "tag")).flatMap((dir) =>
          listHtmlFilesIn(path.join(dir, "page")),
        ),
      );
  }
}

// ---------------------------------------------------------------------------
// ヘルパー: 静的HTMLの読み取り
// ---------------------------------------------------------------------------

/** `/blog/<slug>` 形式のリンク先（`/blog/page/2` などの階層つきURLは除く）。 */
const ARTICLE_HREF_PATTERN = /^\/blog\/([^/?#]+)$/;

const parser = new DOMParser();

function decodeSlug(rawSlug: string): string {
  try {
    return decodeURIComponent(rawSlug);
  } catch {
    return rawSlug;
  }
}

/** その slug の記事ページが実際に生成されているか。 */
function isGeneratedArticle(slug: string): boolean {
  return fs.existsSync(path.join(BLOG_DIR, `${slug}.html`));
}

/** 静的HTMLに書き出されたアンカーのうち、生成済み記事ページを指すものの slug。 */
function findArticleLinkSlugs(document: Document): string[] {
  const slugs = new Set<string>();
  for (const anchor of document.querySelectorAll("a[href]")) {
    const match = ARTICLE_HREF_PATTERN.exec(anchor.getAttribute("href") ?? "");
    if (!match) continue;
    const slug = decodeSlug(match[1]);
    if (isGeneratedArticle(slug)) {
      slugs.add(slug);
    }
  }
  return [...slugs];
}

/** 一覧ページ1枚の静的HTMLから読み取った検査対象の事実。 */
interface ListingPageFacts {
  /** 対応する公開URL */
  url: string;
  /** そのページの静的HTMLから辿れる記事の slug */
  articleSlugs: string[];
  /** 静的HTMLに含まれる検索欄の数 */
  searchInputCount: number;
  /** そのうちハイドレーション前から操作できてしまう検索欄の数 */
  enabledSearchInputCount: number;
}

function readListingPageFacts(page: PrerenderedPage): ListingPageFacts {
  const document = parser.parseFromString(
    fs.readFileSync(page.htmlPath, "utf8"),
    "text/html",
  );
  const searchInputs = [
    ...document.querySelectorAll<HTMLInputElement>('input[type="search"]'),
  ];

  return {
    url: page.url,
    articleSlugs: findArticleLinkSlugs(document),
    searchInputCount: searchInputs.length,
    enabledSearchInputCount: searchInputs.filter((input) => !input.disabled)
      .length,
  };
}

// ---------------------------------------------------------------------------
// テスト
// ---------------------------------------------------------------------------

describe("ブログ一覧ページの静的HTML", () => {
  const factsByShape = new Map<ListingShape, ListingPageFacts[]>(
    LISTING_SHAPES.map((shape) => [
      shape,
      collectPrerenderedPages(shape).map(readListingPageFacts),
    ]),
  );
  const allFacts = LISTING_SHAPES.flatMap(
    (shape) => factsByShape.get(shape) ?? [],
  );

  // ---- 検査 1: 6 ルート形すべてがプリレンダリングされている ----
  // ここが空だと、以降の全数走査が「対象ゼロ」で無条件に通ってしまう。
  test("一覧の 6 ルート形すべてがプリレンダリングされている", () => {
    const missing = LISTING_SHAPES.filter(
      (shape) => (factsByShape.get(shape) ?? []).length === 0,
    );

    expect(
      missing,
      `一覧ルートの静的HTMLが生成されていない形がある: ${missing.join(", ")}\n` +
        `動的レンダリングへ切り替わった可能性がある。` +
        `generateStaticParams と dynamic 設定を確認すること。`,
    ).toEqual([]);
  });

  // ---- 検査 2: 一覧の静的HTMLに記事リンクが載っている ----
  for (const shape of LISTING_SHAPES) {
    test(`${shape} の静的HTMLに記事リンクが載っている`, () => {
      const pagesWithoutArticleLink = (factsByShape.get(shape) ?? []).filter(
        (facts) => facts.articleSlugs.length === 0,
      );

      expect(
        pagesWithoutArticleLink.map((facts) => facts.url),
        `${shape} の静的HTMLに記事リンク（href="/blog/<slug>"）が 1 本も無い:\n` +
          pagesWithoutArticleLink.map((facts) => `  ${facts.url}`).join("\n") +
          `\n一覧本体がクライアント描画へ退避している。` +
          `記事リンクがクローラにも JS 無効環境にも届かなくなるため、` +
          `一覧はキーワード非依存の静的シェルとしてサーバーで描画すること。`,
      ).toEqual([]);
    });
  }

  // ---- 検査 3: 公開記事のすべてが一覧の静的HTMLから辿れる ----
  // 1 ページあたりの記事リンクが 1 本でもあれば検査 2 は通るため、
  // 「どの記事も取りこぼしていないこと」はここで全数を突き合わせて保証する。
  test("公開記事のすべてが一覧の静的HTMLからリンクされている", () => {
    const linkedSlugs = new Set(
      allFacts.flatMap((facts) => facts.articleSlugs),
    );
    const unreachableSlugs = getAllBlogPosts()
      .map((post) => post.slug)
      .filter((slug) => !linkedSlugs.has(slug));

    expect(
      unreachableSlugs,
      `一覧の静的HTMLからリンクされていない公開記事がある（${unreachableSlugs.length} 件）:\n` +
        unreachableSlugs.map((slug) => `  /blog/${slug}`).join("\n") +
        `\n一覧の静的HTMLに載っていない記事はクローラにも JS 無効環境にも届かない。` +
        `ページネーションを含むすべての一覧ページが、` +
        `公開記事の全件をサーバー描画で出し切っていることを確認すること。`,
    ).toEqual([]);
  });

  // ---- 検査 4: 静的シェルの検索欄は操作不可 ----
  test("一覧の静的シェルの検索欄は disabled になっている", () => {
    const problems = allFacts.flatMap((facts) => {
      if (facts.searchInputCount === 0) {
        return [`  ${facts.url}: 検索欄が静的HTMLに無い`];
      }
      if (facts.enabledSearchInputCount > 0) {
        return [`  ${facts.url}: 検索欄に disabled が付いていない`];
      }
      return [];
    });

    expect(
      problems,
      `ハイドレーション前に操作できる検索欄がある:\n${problems.join("\n")}\n` +
        `入力してもキーワードが黙って捨てられるため、` +
        `静的シェルの検索欄は disabled にすること。`,
    ).toEqual([]);
  });
});
