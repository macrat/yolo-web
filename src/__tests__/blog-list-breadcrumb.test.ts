/**
 * ブログ一覧ページのパンくず検査
 *
 * ブログ一覧は 6 つのルート形すべてが同じ Server Component から描画される。
 * 絞り込みのある一覧（タグ・カテゴリ）は掲載記事が少ないことがあり、本文内の
 * パンくずがそこから上位へ戻る唯一の脱出口になる。可視のパンくずと
 * BreadcrumbList の構造化データは同じ項目から組み立てるため、食い違えば
 * 読者には無い経路を検索エンジンにだけ見せていることになる。
 * ここでは本番ビルドの生成物を直接読み、次の 3 点を検査する。
 *
 * 1. 一覧の 6 ルート形すべてがプリレンダリングされていること
 * 2. 絞り込み一覧（タグ・カテゴリ）のすべてのページがパンくずを出していること
 * 3. 各ページが申告する BreadcrumbList が、そのページの可視の経路と一致すること
 *
 * 実行経路:
 * - `npm run build` の後に `npm run test:build` で実行する
 * - 生成物が無いときはスキップせず失敗する（`requireBuildOutput`）
 *
 * データソース:
 * - `.next/prerender-manifest.json`（ビルドがプリレンダリングしたURLの一覧）
 * - `.next/server/app/blog**.html`（そのURLに対応する静的HTML）
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, test } from "vitest";

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
 * いずれも BlogListView を経由するため、1 つでも経路が壊れていれば
 * 同じ原因で他も壊れている可能性が高い。
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

// ---------------------------------------------------------------------------
// ヘルパー: 静的HTMLの読み取り
// ---------------------------------------------------------------------------

const parser = new DOMParser();

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

  return {
    url: page.url,
    visibleBreadcrumbTrail: findVisibleBreadcrumbTrail(document),
    declaredBreadcrumbTrails: findDeclaredBreadcrumbTrails(document),
  };
}

// ---------------------------------------------------------------------------
// テスト
// ---------------------------------------------------------------------------

describe("ブログ一覧ページのパンくず", () => {
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

  // ---- 検査 2: 絞り込み一覧にはパンくずがある ----
  test("絞り込み一覧のすべてのページがパンくずを出している", () => {
    const pagesWithoutBreadcrumb = FILTERED_LISTING_SHAPES.flatMap(
      (shape) => factsByShape.get(shape) ?? [],
    ).filter((facts) => facts.visibleBreadcrumbTrail.length === 0);

    expect(
      pagesWithoutBreadcrumb.map((facts) => facts.url),
      `パンくずが静的HTMLに無い絞り込み一覧がある:\n` +
        pagesWithoutBreadcrumb.map((facts) => `  ${facts.url}`).join("\n") +
        `\n絞り込んだ一覧から上位へ戻る経路を本文内に置くため、` +
        `絞り込みのある一覧にはパンくずを出すこと。`,
    ).toEqual([]);
  });

  // ---- 検査 3: 申告する経路が見える経路と一致する ----
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
