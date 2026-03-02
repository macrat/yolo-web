/**
 * Page Coverage Test
 *
 * レジストリに登録された全チートシートスラッグに対して、
 * 対応する個別ページファイル（page.tsx, opengraph-image.tsx, twitter-image.tsx）
 * が存在することを検証する。
 *
 * チートシートを registry.ts に追加したが、個別ページの作成を忘れた場合に検出する。
 */
import { describe, test, expect } from "vitest";
import { getAllCheatsheetSlugs } from "@/cheatsheets/registry";
import { existsSync } from "fs";
import { join } from "path";

const REQUIRED_FILES = [
  "page.tsx",
  "opengraph-image.tsx",
  "twitter-image.tsx",
] as const;

const cheatsheetsAppDir = join(process.cwd(), "src/app/cheatsheets");

describe("チートシート個別ページの網羅性", () => {
  const slugs = getAllCheatsheetSlugs();

  test("レジストリにチートシートが登録されていること", () => {
    expect(slugs.length).toBeGreaterThan(0);
  });

  test.each(slugs)(
    "%s: page.tsx, opengraph-image.tsx, twitter-image.tsx が存在する",
    (slug) => {
      const dir = join(cheatsheetsAppDir, slug);
      for (const file of REQUIRED_FILES) {
        const filePath = join(dir, file);
        expect(existsSync(filePath), `${slug}/${file} が存在すること`).toBe(
          true,
        );
      }
    },
  );
});
