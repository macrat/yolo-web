/**
 * ブログ一覧ページの静的HTML回帰テスト
 *
 * ブログ一覧は 6 つのルート形すべてが同じ Server Component から描画され、
 * キーワード検索だけを Client Component が担う。検索状態は `useSearchParams`
 * に依存するため、一覧本体がクライアント描画へ退避すると記事リンクが
 * 静的HTMLから丸ごと消え、クローラからも JS 無効環境からも一覧が見えなくなる。
 * ここでは本番ビルドの生成物を直接読み、次の 2 点を検査する。
 *
 * 1. 一覧ルートのプリレンダリング済みHTMLすべてに記事リンクが載っていること
 * 2. 静的シェルの検索欄が `disabled` であること
 *    （ハイドレーション前に打った文字は黙って捨てられるため）
 *
 * 前提:
 * - `npm run build` 済みであること（`.next/` が存在すること）
 * - `.next/server/app/blog.html` が無い場合はスイート全体をスキップする
 *
 * データソース:
 * - `.next/server/app/blog**.html`（一覧ルートのプリレンダリング結果）
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, test } from "vitest";

// ---------------------------------------------------------------------------
// ビルド生成物のパス
// ---------------------------------------------------------------------------
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const SERVER_APP_DIR = path.join(PROJECT_ROOT, ".next", "server", "app");
const BLOG_DIR = path.join(SERVER_APP_DIR, "blog");
const BLOG_INDEX_HTML = path.join(SERVER_APP_DIR, "blog.html");

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
      return fs.existsSync(BLOG_INDEX_HTML)
        ? toPrerenderedPages([BLOG_INDEX_HTML])
        : [];
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
// ヘルパー: HTMLの検査
// ---------------------------------------------------------------------------

/** `/blog/<slug>` 形式のリンク（`/blog/page/2` などの階層つきURLは除く）。 */
const ARTICLE_LINK_PATTERN = /href="\/blog\/([^"/?#]+)"/g;

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

/** HTML内の、生成済み記事ページを指すリンクの slug 一覧。 */
function findArticleLinkSlugs(html: string): string[] {
  const slugs = new Set<string>();
  for (const match of html.matchAll(ARTICLE_LINK_PATTERN)) {
    const slug = decodeSlug(match[1]);
    if (isGeneratedArticle(slug)) {
      slugs.add(slug);
    }
  }
  return [...slugs];
}

const SEARCH_INPUT_PATTERN = /<input[^>]*type="search"[^>]*>/g;

function findSearchInputs(html: string): string[] {
  return [...html.matchAll(SEARCH_INPUT_PATTERN)].map((match) => match[0]);
}

function readHtml(page: PrerenderedPage): string {
  return fs.readFileSync(page.htmlPath, "utf8");
}

// ---------------------------------------------------------------------------
// テスト
// ---------------------------------------------------------------------------

const buildExists = fs.existsSync(BLOG_INDEX_HTML);

describe.skipIf(!buildExists)("ブログ一覧ページの静的HTML", () => {
  const pagesByShape = new Map<ListingShape, PrerenderedPage[]>(
    LISTING_SHAPES.map((shape) => [
      shape,
      buildExists ? collectPrerenderedPages(shape) : [],
    ]),
  );

  // ---- 検査 1: 6 ルート形すべてがプリレンダリングされている ----
  // ここが空だと、以降の全数走査が「対象ゼロ」で無条件に通ってしまう。
  test("一覧の 6 ルート形すべてがプリレンダリングされている", () => {
    const missing = LISTING_SHAPES.filter(
      (shape) => (pagesByShape.get(shape) ?? []).length === 0,
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
      const pages = pagesByShape.get(shape) ?? [];
      const pagesWithoutArticleLink = pages.filter(
        (page) => findArticleLinkSlugs(readHtml(page)).length === 0,
      );

      expect(
        pagesWithoutArticleLink.map((page) => page.url),
        `${shape} の静的HTMLに記事リンク（href="/blog/<slug>"）が 1 本も無い:\n` +
          pagesWithoutArticleLink.map((page) => `  ${page.url}`).join("\n") +
          `\n一覧本体がクライアント描画へ退避している。` +
          `記事リンクがクローラにも JS 無効環境にも届かなくなるため、` +
          `一覧はキーワード非依存の静的シェルとしてサーバーで描画すること。`,
      ).toEqual([]);
    });
  }

  // ---- 検査 3: 静的シェルの検索欄は操作不可 ----
  test("一覧の静的シェルの検索欄は disabled になっている", () => {
    const allPages = LISTING_SHAPES.flatMap(
      (shape) => pagesByShape.get(shape) ?? [],
    );

    const problems: string[] = [];
    for (const page of allPages) {
      const inputs = findSearchInputs(readHtml(page));
      if (inputs.length === 0) {
        problems.push(`  ${page.url}: 検索欄が静的HTMLに無い`);
        continue;
      }
      const enabled = inputs.filter((input) => !/\bdisabled\b/.test(input));
      if (enabled.length > 0) {
        problems.push(`  ${page.url}: 検索欄に disabled が付いていない`);
      }
    }

    expect(
      problems,
      `ハイドレーション前に操作できる検索欄がある:\n${problems.join("\n")}\n` +
        `入力してもキーワードが黙って捨てられるため、` +
        `静的シェルの検索欄は disabled にすること。`,
    ).toEqual([]);
  });
});
