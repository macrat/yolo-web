/**
 * ブログ一覧ページの静的HTML検査
 *
 * ブログ一覧は 6 つのルート形すべてが同じ Server Component から描画され、
 * キーワード検索だけを Client Component が担う。検索状態は `useSearchParams`
 * に依存するため、一覧本体がクライアント描画へ退避すると記事リンクが
 * 静的HTMLから消え、クローラからも JS 無効環境からも記事へ辿り着けなくなる。
 * ここでは本番ビルドの生成物を直接読み、次の 7 点を検査する。
 *
 * 1. 一覧の 6 ルート形すべてがプリレンダリングされていること
 * 2. 一覧ルートのプリレンダリング済みHTMLすべてに記事リンクが載っていること
 * 3. 一覧が出す記事リンクの行き先がすべて生成されていること
 *    （行き先の無いリンクを踏んだ読者は 404 に落ちるため）
 * 4. 公開記事のすべてが、いずれかの一覧ページの静的HTMLからリンクされていること
 * 5. 静的シェルの検索欄が `disabled` であること
 *    （ハイドレーション前に打った文字は黙って捨てられるため）
 * 6. 絞り込み一覧（タグ・カテゴリ）のすべてのページがパンくずを出していること
 *    （絞り込んだ一覧から上位へ戻る経路であり、タグページでは本文内の唯一の脱出口になるため）
 * 7. 各ページが申告する BreadcrumbList が、そのページの可視の経路と一致すること
 *    （読者が見る経路と検索エンジンへ申告する経路を食い違わせないため）
 *
 * 実行経路:
 * - `npm run build` の後に `npm run test:build` で実行する
 * - 生成物が無いときはスキップせず失敗する（`requireBuildOutput`）
 *
 * データソース:
 * - `.next/prerender-manifest.json`（ビルドがプリレンダリングしたURLの一覧）
 * - `.next/server/app/blog**.html`（そのURLに対応する静的HTML）
 * - `getAllBlogPosts()`（公開記事の集合）
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, test } from "vitest";

import { getAllBlogPosts } from "@/blog/_lib/blog";
import { NEXT_DIR, SERVER_APP_DIR, requireBuildOutput } from "./build-output";

// ---------------------------------------------------------------------------
// ビルド生成物のパス
// ---------------------------------------------------------------------------
const PRERENDER_MANIFEST = path.join(NEXT_DIR, "prerender-manifest.json");

requireBuildOutput(PRERENDER_MANIFEST);

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

/** 絞り込みのある一覧のルート形。可視のパンくずを出すのはこの 4 つ。 */
const FILTERED_LISTING_SHAPES: readonly ListingShape[] = [
  "/blog/category/[category]",
  "/blog/category/[category]/page/[page]",
  "/blog/tag/[tag]",
  "/blog/tag/[tag]/page/[page]",
];

const ARTICLE_SHAPE = "/blog/[slug]";

interface PrerenderedPage {
  /** 生成されたHTMLの絶対パス */
  htmlPath: string;
  /** 対応する公開URL（失敗メッセージ用） */
  url: string;
}

// ---------------------------------------------------------------------------
// ヘルパー: 生成物の走査
// ---------------------------------------------------------------------------

/**
 * `prerender-manifest.json` の `routes`。
 * キーが生成されたURL、`srcRoute` がその元になったルート形。
 */
const prerenderedRoutes: Record<string, { srcRoute: string | null }> =
  JSON.parse(fs.readFileSync(PRERENDER_MANIFEST, "utf8")).routes;

/** ビルドが生成したURLのうち、指定のルート形から出たもの。 */
function urlsGeneratedFrom(shape: string): string[] {
  return Object.entries(prerenderedRoutes)
    .filter(([, route]) => route.srcRoute === shape)
    .map(([url]) => url)
    .sort();
}

/**
 * 指定したルート形でプリレンダリングされたページを集める。
 *
 * 出どころはビルドが書き出すマニフェストであり、生成物ディレクトリの走査ではない。
 * `next start` は未知のURLへのリクエストを受けると、その応答（404 ページを含む）を
 * `.next/server/app` 配下へHTMLとして書き出すため、ディレクトリを数えると
 * 「誰かがサイトを開いたかどうか」で検査対象が変わってしまう。
 */
function collectPrerenderedPages(shape: ListingShape): PrerenderedPage[] {
  return urlsGeneratedFrom(shape).map((url) => ({
    url,
    htmlPath: path.join(SERVER_APP_DIR, `${url}.html`),
  }));
}

/** ビルドが生成した記事ページの slug。 */
const generatedArticleSlugs = new Set(
  urlsGeneratedFrom(ARTICLE_SHAPE).map((url) => url.slice("/blog/".length)),
);

// ---------------------------------------------------------------------------
// ヘルパー: 静的HTMLの読み取り
// ---------------------------------------------------------------------------

/** `/blog/<slug>` 形式のリンク先（`/blog/page/2` などの階層つきURLは除く）。 */
const ARTICLE_HREF_PATTERN = /^\/blog\/([^/?#]+)$/;

const parser = new DOMParser();

/** href の slug 部分をデコードした値。パーセントエンコードが壊れていれば slug は読めない。 */
function decodeSlug(rawSlug: string): string | null {
  try {
    return decodeURIComponent(rawSlug);
  } catch {
    return null;
  }
}

/** 静的HTMLに書き出された記事リンクを、行き先が生成されているかで振り分けたもの。 */
interface ArticleLinks {
  /** 生成済みの記事ページを指すリンクの slug */
  reachableSlugs: string[];
  /** 行き先のページが生成されていないリンクの href */
  deadHrefs: string[];
}

/**
 * 静的HTMLのアンカーから記事リンクを読み取る。
 *
 * slug が読めない href はどの生成済みページとも突き合わせられないため、行き先の無いリンクに数える。
 * 読めなかったものを生の文字列で代用すると、壊れたリンクが「読めた」ことになって検査を素通りする。
 */
function readArticleLinks(document: Document): ArticleLinks {
  const reachableSlugs = new Set<string>();
  const deadHrefs = new Set<string>();

  for (const anchor of document.querySelectorAll("a[href]")) {
    const href = anchor.getAttribute("href") ?? "";
    const match = ARTICLE_HREF_PATTERN.exec(href);
    if (!match) continue;

    const slug = decodeSlug(match[1]);
    if (slug !== null && generatedArticleSlugs.has(slug)) {
      reachableSlugs.add(slug);
    } else {
      deadHrefs.add(href);
    }
  }

  return { reachableSlugs: [...reachableSlugs], deadHrefs: [...deadHrefs] };
}

/** 可視のパンくずに並ぶ項目名（各項目の先頭に付く区切り「/」は除く）。 */
function findVisibleBreadcrumbTrail(document: Document): string[] {
  const nav = document.querySelector('nav[aria-label="パンくずリスト"]');
  if (!nav) return [];
  return [...nav.querySelectorAll("li")].map((item) =>
    (item.textContent ?? "").replace(/^\s*\/\s*/, "").trim(),
  );
}

/** 経路を失敗メッセージ用の 1 行にする。 */
function formatTrail(trail: string[]): string {
  return trail.length === 0 ? "（無し）" : trail.join(" > ");
}

/** ページが申告する BreadcrumbList の項目名（BreadcrumbList 1 つにつき 1 本）。 */
function findDeclaredBreadcrumbTrails(document: Document): string[][] {
  const trails: string[][] = [];
  for (const script of document.querySelectorAll(
    'script[type="application/ld+json"]',
  )) {
    const data = JSON.parse(script.textContent ?? "null");
    if (data?.["@type"] !== "BreadcrumbList") continue;
    trails.push(
      (data.itemListElement as { name: string }[]).map((entry) => entry.name),
    );
  }
  return trails;
}

/** 一覧ページ1枚の静的HTMLから読み取った検査対象の事実。 */
interface ListingPageFacts {
  /** 対応する公開URL */
  url: string;
  /** そのページの静的HTMLから辿れる記事の slug */
  reachableArticleSlugs: string[];
  /** そのページが出している、行き先のページが生成されていない記事リンクの href */
  deadArticleHrefs: string[];
  /** 静的HTMLに含まれる検索欄の数 */
  searchInputCount: number;
  /** そのうちハイドレーション前から操作できてしまう検索欄の数 */
  enabledSearchInputCount: number;
  /** 可視のパンくずに並ぶ項目名 */
  visibleBreadcrumbTrail: string[];
  /** 構造化データとして申告している経路 */
  declaredBreadcrumbTrails: string[][];
}

function readListingPageFacts(page: PrerenderedPage): ListingPageFacts {
  const document = parser.parseFromString(
    fs.readFileSync(page.htmlPath, "utf8"),
    "text/html",
  );
  const searchInputs = [
    ...document.querySelectorAll<HTMLInputElement>('input[type="search"]'),
  ];
  const articleLinks = readArticleLinks(document);

  return {
    url: page.url,
    reachableArticleSlugs: articleLinks.reachableSlugs,
    deadArticleHrefs: articleLinks.deadHrefs,
    searchInputCount: searchInputs.length,
    enabledSearchInputCount: searchInputs.filter((input) => !input.disabled)
      .length,
    visibleBreadcrumbTrail: findVisibleBreadcrumbTrail(document),
    declaredBreadcrumbTrails: findDeclaredBreadcrumbTrails(document),
  };
}

// ---------------------------------------------------------------------------
// テスト
// ---------------------------------------------------------------------------

describe("ブログ一覧ページの静的HTML", () => {
  const pagesByShape = new Map<ListingShape, PrerenderedPage[]>(
    LISTING_SHAPES.map((shape) => [shape, collectPrerenderedPages(shape)]),
  );

  requireBuildOutput(
    ...[...pagesByShape.values()].flat().map((page) => page.htmlPath),
  );

  const factsByShape = new Map<ListingShape, ListingPageFacts[]>(
    LISTING_SHAPES.map((shape) => [
      shape,
      (pagesByShape.get(shape) ?? []).map(readListingPageFacts),
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
        (facts) => facts.reachableArticleSlugs.length === 0,
      );

      expect(
        pagesWithoutArticleLink.map((facts) => facts.url),
        `${shape} の静的HTMLに記事リンク（href="/blog/<slug>"）が 1 本も無い:\n` +
          pagesWithoutArticleLink.map((facts) => `  ${facts.url}`).join("\n") +
          `\n一覧はキーワード非依存の静的シェルとしてサーバーで描画すること。` +
          `一覧本体がクライアント描画へ退避すると、記事リンクがクローラにも` +
          `JS 無効環境にも届かなくなる。`,
      ).toEqual([]);
    });
  }

  // ---- 検査 3: 一覧が出す記事リンクの行き先が生成されている ----
  // 検査 2 が数えるのは行き先のあるリンクだけなので、
  // 「読者が踏んで 404 に落ちるリンク」はここで別に拾う。
  test("一覧の静的HTMLに行き先の無い記事リンクが無い", () => {
    const problems = allFacts.flatMap((facts) =>
      facts.deadArticleHrefs.map((href) => `  ${facts.url}: ${href}`),
    );

    expect(
      problems,
      `行き先のページが生成されていない記事リンクが一覧に出ている:\n${problems.join("\n")}\n` +
        `一覧から進んだ読者はこのリンクで 404 に落ちる。` +
        `リンク先の記事が生成されているか、リンクの組み立てが正しいかを確認すること。`,
    ).toEqual([]);
  });

  // ---- 検査 4: 公開記事のすべてが一覧の静的HTMLから辿れる ----
  // 1 ページあたりの記事リンクが 1 本でもあれば検査 2 は通るため、
  // 「どの記事も取りこぼしていないこと」はここで全数を突き合わせて保証する。
  test("公開記事のすべてが一覧の静的HTMLからリンクされている", () => {
    const linkedSlugs = new Set(
      allFacts.flatMap((facts) => facts.reachableArticleSlugs),
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

  // ---- 検査 5: 静的シェルの検索欄は操作不可 ----
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

  // ---- 検査 6: 絞り込み一覧にはパンくずがある ----
  test("絞り込み一覧のすべてのページがパンくずを出している", () => {
    const pagesWithoutBreadcrumb = FILTERED_LISTING_SHAPES.flatMap(
      (shape) => factsByShape.get(shape) ?? [],
    ).filter((facts) => facts.visibleBreadcrumbTrail.length === 0);

    expect(
      pagesWithoutBreadcrumb.map((facts) => facts.url),
      `パンくずが静的HTMLに無い絞り込み一覧がある:\n` +
        pagesWithoutBreadcrumb.map((facts) => `  ${facts.url}`).join("\n") +
        `\nタグページではパンくずが本文内の唯一の脱出口になる。`,
    ).toEqual([]);
  });

  // ---- 検査 7: 申告する経路が見える経路と一致する ----
  // 経路を出さないページは BreadcrumbList も申告しないことを含めて突き合わせる。
  // 見えない経路を申告したページは、読者には無い脱出口を検索エンジンにだけ見せている。
  test("一覧ページの BreadcrumbList が可視の経路と一致する", () => {
    const problems = allFacts.flatMap((facts) => {
      const visible = formatTrail(facts.visibleBreadcrumbTrail);
      const declaredTrails = facts.declaredBreadcrumbTrails;
      // 経路を出すページは BreadcrumbList をちょうど 1 本、出さないページは 1 本も出さない
      const expectedTrailCount =
        facts.visibleBreadcrumbTrail.length === 0 ? 0 : 1;

      if (declaredTrails.length !== expectedTrailCount) {
        return [
          `  ${facts.url}: BreadcrumbList が ${declaredTrails.length} 件（見える経路は「${visible}」）`,
        ];
      }

      const mismatched = declaredTrails.filter(
        (trail) => formatTrail(trail) !== visible,
      );
      return mismatched.map(
        (trail) =>
          `  ${facts.url}: 見える経路「${visible}」／申告「${formatTrail(trail)}」`,
      );
    });

    expect(
      problems,
      `読者が見る経路と検索エンジンへ申告する経路が食い違っている:\n${problems.join("\n")}\n` +
        `パンくずと BreadcrumbList は同じ項目から組み立てること。`,
    ).toEqual([]);
  });
});
