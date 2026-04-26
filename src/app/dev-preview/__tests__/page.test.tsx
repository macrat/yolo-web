/**
 * dev-preview/page.tsx のメタデータ・SEO 遮断テスト
 *
 * このテストは T-5 の受け入れ基準の一部を自動化する:
 * - ページ単体の metadata.robots が noindex/nofollow であること
 * - dev-preview/ 配下のページが robots.ts で disallow されること
 * - sitemap に dev-preview/ が含まれないこと（sitemap.ts を直接チェック）
 *
 * ## なぜ dev-preview/ を使うか
 * Next.js App Router では `_` で始まるフォルダ（_dev/ 等）はプライベートフォルダとして
 * ルーティングから除外され、ビルド HTML が生成されない。
 * 受け入れ基準「ビルド出力 HTML に noindex が含まれること」を満たすため、
 * dev-preview/ をビルド対象ルートとして使用する（builder 判断）。
 */
import { expect, test } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

// ページのメタデータをインポートして robots 設定を確認する
import { metadata } from "../page";

test("dev-preview/page metadata.robots has index=false", () => {
  const robots = metadata.robots as Record<string, unknown> | undefined;
  expect(robots).toBeDefined();
  expect(robots?.["index"]).toBe(false);
});

test("dev-preview/page metadata.robots has follow=false", () => {
  const robots = metadata.robots as Record<string, unknown> | undefined;
  expect(robots).toBeDefined();
  expect(robots?.["follow"]).toBe(false);
});

test("robots.ts includes /dev-preview/ in disallow rules", () => {
  const robotsSource = readFileSync(
    resolve(__dirname, "../../../app/robots.ts"),
    "utf-8",
  );
  // /dev-preview/ が disallow に含まれていること
  expect(robotsSource).toMatch(/disallow[\s\S]*dev-preview/);
});

test("sitemap.ts does not contain dev-preview", () => {
  const sitemapSource = readFileSync(
    resolve(__dirname, "../../../app/sitemap.ts"),
    "utf-8",
  );
  // sitemap.ts のエントリ構築部分に dev-preview が含まれないこと
  expect(sitemapSource).not.toContain("dev-preview");
});

test("robots.ts does not include /_dev/ in disallow rules (removed as redundant)", () => {
  const robotsSource = readFileSync(
    resolve(__dirname, "../../../app/robots.ts"),
    "utf-8",
  );
  // /_dev/ は Next.js プライベートフォルダとして URL が存在しないため disallow は不要
  expect(robotsSource).not.toContain("/_dev/");
});
