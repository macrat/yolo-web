import { expect, test } from "vitest";
import { sharedMetadata } from "../site-metadata";

/**
 * サイト共通のメタデータ sharedMetadata（site-metadata.ts が唯一の真実の源）を
 * layout.tsx を経由せず直接検証する。
 */

test("sharedMetadata includes twitter card configuration", () => {
  expect(sharedMetadata.twitter).toEqual(
    expect.objectContaining({ card: "summary_large_image" }),
  );
});

test("sharedMetadata keywords reflect 診断中心コンセプト", () => {
  // サイト共通 keywords は全ページに継承される自己定義であり、
  // 診断中心（自分を知り、楽しむ）のサイトであることを表す。
  const keywords = sharedMetadata.keywords as string[];
  expect(keywords).toBeDefined();
  // 自己発見系のキーワードが含まれていること
  expect(keywords).toContain("性格診断");
  expect(keywords).toContain("占い");
  // 辞典系（文化コンテンツ）のキーワードも含まれていること
  expect(keywords).toContain("漢字");
  // 実用層のオンライン道具にも少数だけ触れていること
  expect(keywords).toContain("オンラインツール");
  // 道具を中心とするサイトと読まれる「道具箱」は含まないこと
  expect(keywords).not.toContain("道具箱");
});

test("sharedMetadata includes openGraph configuration", () => {
  expect(sharedMetadata.openGraph).toEqual(
    expect.objectContaining({ siteName: "yolos.net" }),
  );
});

test("sharedMetadata includes metadataBase", () => {
  expect(sharedMetadata.metadataBase).toBeInstanceOf(URL);
});

test("sharedMetadata includes RSS feed in alternates", () => {
  const types = (
    sharedMetadata.alternates as { types?: Record<string, string> }
  )?.types;
  expect(types).toBeDefined();
  expect(types?.["application/rss+xml"]).toBe("/feed");
});

test("sharedMetadata includes Atom feed in alternates", () => {
  const types = (
    sharedMetadata.alternates as { types?: Record<string, string> }
  )?.types;
  expect(types).toBeDefined();
  expect(types?.["application/atom+xml"]).toBe("/feed/atom");
});

test("sharedMetadata includes robots with max-image-preview:large", () => {
  // 検索エンジンが大きな画像プレビューを表示できるよう robots に
  // max-image-preview:large を設定する
  const robots = sharedMetadata.robots as Record<string, unknown> | undefined;
  expect(robots).toBeDefined();
  expect(robots?.["index"]).toBe(true);
  expect(robots?.["follow"]).toBe(true);
  expect(robots?.["max-image-preview"]).toBe("large");
});
