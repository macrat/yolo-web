import { expect, test } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { metadata } from "../layout";

const layoutSource = readFileSync(resolve(__dirname, "../layout.tsx"), "utf-8");

test("metadata includes twitter card configuration", () => {
  expect(metadata.twitter).toEqual(
    expect.objectContaining({ card: "summary_large_image" }),
  );
});

test("layout.tsx keywords reflect 新コンセプト「日常の傍にある道具」(占い・診断系キーワードの根絶)", () => {
  // cycle-232 T-2 決定: サイト共通 keywords は全ページに継承される自己定義で
  // あり、トップの道具箱化（Phase 10.3）と同時にツール系へ刷新した。
  // (legacy) Route Group も sharedMetadata を共有するため同じ keywords になる
  const keywords = metadata.keywords as string[];
  expect(keywords).toBeDefined();
  // 旧コンセプト（占い・診断パーク）のキーワードが含まれていないこと
  expect(keywords).not.toContain("占い");
  expect(keywords).not.toContain("性格診断");
  expect(keywords).not.toContain("無料診断");
  expect(keywords).not.toContain("AI占い");
  // 新コンセプト（ツール）のキーワードが含まれていること
  expect(keywords).toContain("オンラインツール");
  expect(keywords).toContain("道具箱");
});

test("metadata includes openGraph configuration", () => {
  expect(metadata.openGraph).toEqual(
    expect.objectContaining({ siteName: "yolos.net" }),
  );
});

test("metadata includes metadataBase", () => {
  expect(metadata.metadataBase).toBeInstanceOf(URL);
});

test("metadata includes RSS feed in alternates", () => {
  const types = (metadata.alternates as { types?: Record<string, string> })
    ?.types;
  expect(types).toBeDefined();
  expect(types?.["application/rss+xml"]).toBe("/feed");
});

test("metadata includes Atom feed in alternates", () => {
  const types = (metadata.alternates as { types?: Record<string, string> })
    ?.types;
  expect(types).toBeDefined();
  expect(types?.["application/atom+xml"]).toBe("/feed/atom");
});

test("layout.tsx does not define a local playLinks constant (no duplicate with Footer.tsx)", () => {
  // playLinks定数がlayout.tsxに二重定義されていないことを確認する
  // Footer.tsxのDEFAULT_PLAY_LINKSをデフォルト値として使うため、layout側の定義は不要
  expect(layoutSource).not.toMatch(/const\s+playLinks\s*=/);
});

test("layout.tsx passes no playLinks prop to Footer (uses Footer default)", () => {
  // <Footer playLinks={...}> の形式でpropが渡されていないことを確認する
  expect(layoutSource).not.toMatch(/<Footer\s[^>]*playLinks=/);
});

test("metadata includes robots with max-image-preview:large", () => {
  // 検索エンジンが大きな画像プレビューを表示できるよう robots に max-image-preview:large を設定する
  const robots = metadata.robots as Record<string, unknown> | undefined;
  expect(robots).toBeDefined();
  expect(robots?.["index"]).toBe(true);
  expect(robots?.["follow"]).toBe(true);
  expect(robots?.["max-image-preview"]).toBe("large");
});
