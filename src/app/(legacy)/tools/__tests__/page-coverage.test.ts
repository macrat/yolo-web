/**
 * Page Coverage Test
 *
 * レジストリに登録された全ツールスラッグに対して、
 * 対応する個別ページファイル（page.tsx, opengraph-image.tsx, twitter-image.tsx）
 * が存在することを検証する。
 *
 * ツールを registry.ts に追加したが、個別ページの作成を忘れた場合に検出する。
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

// (legacy) Route Group 配下に移動済み
const toolsAppDir = join(process.cwd(), "src/app/(legacy)/tools");

describe("ツール個別ページの網羅性", () => {
  const slugs = getAllToolSlugs();

  test("レジストリにツールが登録されていること", () => {
    expect(slugs.length).toBeGreaterThan(0);
  });

  test.each(slugs)(
    "%s: page.tsx, opengraph-image.tsx, twitter-image.tsx が存在する",
    (slug) => {
      const dir = join(toolsAppDir, slug);
      for (const file of REQUIRED_FILES) {
        const filePath = join(dir, file);
        expect(existsSync(filePath), `${slug}/${file} が存在すること`).toBe(
          true,
        );
      }
    },
  );
});
