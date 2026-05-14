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
    "%s: page.tsx, opengraph-image.tsx, twitter-image.tsx が (legacy) か (new) の片方のみに存在する",
    (slug) => {
      // (legacy) か (new) のどちらか一方のみにページファイルが存在すること（XOR）。
      // 両方に存在すると「どちらが正規か」が曖昧になり、移行管理が破綻する。
      const legacyDir = join(legacyToolsDir, slug);
      const newDir = join(newToolsDir, slug);
      for (const file of REQUIRED_FILES) {
        const legacyPath = join(legacyDir, file);
        const newPath = join(newDir, file);
        const inLegacy = existsSync(legacyPath);
        const inNew = existsSync(newPath);
        expect(
          inLegacy || inNew,
          `${slug}/${file} が (legacy) または (new) のどちらかに存在すること（現状: 両方なし）`,
        ).toBe(true);
        expect(
          inLegacy && inNew,
          `${slug}/${file} が (legacy) と (new) の両方に存在している（XOR 違反: 片方のみにすること）`,
        ).toBe(false);
      }
    },
  );
});
