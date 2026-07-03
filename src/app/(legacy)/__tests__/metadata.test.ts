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

test("layout.tsx keywords reflect 診断中心コンセプト (cycle-277 決定(a))", () => {
  // cycle-277 決定(a): サイト共通 keywords は全ページに継承される自己定義であり、
  // 道具箱中心から診断中心（自分を知り、楽しむ）へ刷新した。
  // (legacy) Route Group も sharedMetadata を共有するため同じ keywords になる。
  const keywords = metadata.keywords as string[];
  expect(keywords).toBeDefined();
  // 新コンセプト（自己発見系）のキーワードが上位に含まれていること
  expect(keywords).toContain("性格診断");
  expect(keywords).toContain("占い");
  // 辞典系（文化コンテンツ）のキーワードも含まれていること
  expect(keywords).toContain("漢字");
  // 実用層のオンライン道具にも少数だけ触れていること
  expect(keywords).toContain("オンラインツール");
  // 旧自己定義の核（道具箱-as-core）を象徴する語は上位から降ろしたこと
  expect(keywords).not.toContain("道具箱");
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
