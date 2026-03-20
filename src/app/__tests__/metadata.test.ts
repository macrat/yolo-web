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

test("layout.tsx keywords reflect 占い・診断パーク concept (no tool-related keywords)", () => {
  const keywords = metadata.keywords as string[];
  expect(keywords).toBeDefined();
  // 旧コンセプトのキーワードが含まれていないこと
  expect(keywords).not.toContain("JSON整形");
  expect(keywords).not.toContain("Base64変換");
  expect(keywords).not.toContain("パスワード生成");
  expect(keywords).not.toContain("オンラインツール");
  expect(keywords).not.toContain("Web開発ツール");
  // 新コンセプトのキーワードが含まれていること
  expect(keywords).toContain("占い");
  expect(keywords).toContain("性格診断");
  expect(keywords).toContain("無料診断");
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
