/**
 * Page Coverage Test
 *
 * レジストリに登録された全ツールスラッグに対して、
 * 対応する個別ページファイル（page.tsx, opengraph-image.tsx, twitter-image.tsx）
 * が存在することを検証する。
 *
 * ツールを registry.ts に追加したが、個別ページの作成を忘れた場合に検出する。
 *
 * ツールは段階的に (legacy) から (new) Route Group へ移行中（design-migration-plan.md 参照）。
 * 各ツールは (legacy) か (new) のどちらか一方に存在する必要がある。
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

const legacyToolsDir = join(process.cwd(), "src/app/(legacy)/tools");
const newToolsDir = join(process.cwd(), "src/app/(new)/tools");

describe("ツール個別ページの網羅性", () => {
  const slugs = getAllToolSlugs();

  test("レジストリにツールが登録されていること", () => {
    expect(slugs.length).toBeGreaterThan(0);
  });

  test.each(slugs)(
    "%s: page.tsx, opengraph-image.tsx, twitter-image.tsx が存在する",
    (slug) => {
      // (legacy) か (new) のどちらか一方にページファイルが存在すればよい
      const legacyDir = join(legacyToolsDir, slug);
      const newDir = join(newToolsDir, slug);
      for (const file of REQUIRED_FILES) {
        const legacyPath = join(legacyDir, file);
        const newPath = join(newDir, file);
        expect(
          existsSync(legacyPath) || existsSync(newPath),
          `${slug}/${file} が (legacy) または (new) に存在すること`,
        ).toBe(true);
      }
    },
  );
});
