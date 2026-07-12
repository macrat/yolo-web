/**
 * Page Coverage Test
 *
 * レジストリに登録された全ツールスラッグに対して、
 * 対応する個別ページファイル（page.tsx, opengraph-image.tsx, twitter-image.tsx）
 * が存在することを検証する。
 *
 * ツールを registry.ts に追加したが、個別ページの作成を忘れた場合に検出する。
 *
 * 全36ツールが src/app/tools 配下に存在する
 * （cycle-279 C1 で (legacy) 撤去・フェーズ R・C1 で旧 Route Group (new) も平坦化済み）。
 */
import { describe, test, expect } from "vitest";
import { getAllToolSlugs } from "@/tools/registry";
import { existsSync } from "fs";
import { join } from "path";

const REQUIRED_FILES = [
  "page.tsx",
  "opengraph-image.tsx",
  "twitter-image.tsx",
] as const;

const toolsDir = join(process.cwd(), "src/app/tools");

describe("ツール個別ページの網羅性", () => {
  const slugs = getAllToolSlugs();

  test("レジストリにツールが登録されていること", () => {
    expect(slugs.length).toBeGreaterThan(0);
  });

  test.each(slugs)(
    "%s: page.tsx, opengraph-image.tsx, twitter-image.tsx が存在する",
    (slug) => {
      for (const file of REQUIRED_FILES) {
        const filePath = join(toolsDir, slug, file);
        expect(
          existsSync(filePath),
          `${slug}/${file} が src/app/tools 配下に存在すること`,
        ).toBe(true);
      }
    },
  );
});
