/**
 * Page Coverage Test
 *
 * レジストリに登録された全ツールスラッグに対して、
 * 対応する個別ページファイル（page.tsx, opengraph-image.tsx, twitter-image.tsx）
 * が存在することを検証する。
 *
 * ツールを registry.ts に追加したが、個別ページの作成を忘れた場合に検出する。
 *
 * 注意: (new) デザインシステムへの移行が進むにつれ、ツールは
 * (legacy)/tools/ から (new)/tools/ に git mv で移動される。
 * このテストは両方のディレクトリを検索して、どちらかに存在すれば OK とする。
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

// (legacy) Route Group 配下（移行前のデフォルト）
const legacyToolsDir = join(process.cwd(), "src/app/(legacy)/tools");
// (new) Route Group 配下（移行済みツールはこちら）
const newToolsDir = join(process.cwd(), "src/app/(new)/tools");

describe("ツール個別ページの網羅性", () => {
  const slugs = getAllToolSlugs();

  test("レジストリにツールが登録されていること", () => {
    expect(slugs.length).toBeGreaterThan(0);
  });

  test.each(slugs)(
    "%s: page.tsx, opengraph-image.tsx, twitter-image.tsx が存在する",
    (slug) => {
      // (legacy) または (new) のどちらかにページが存在すれば OK
      const legacyDir = join(legacyToolsDir, slug);
      const newDir = join(newToolsDir, slug);
      for (const file of REQUIRED_FILES) {
        const legacyPath = join(legacyDir, file);
        const newPath = join(newDir, file);
        const exists = existsSync(legacyPath) || existsSync(newPath);
        expect(
          exists,
          `${slug}/${file} が (legacy) または (new) に存在すること`,
        ).toBe(true);
      }
    },
  );
});
