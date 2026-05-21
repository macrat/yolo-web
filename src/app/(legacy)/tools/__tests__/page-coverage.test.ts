/**
 * Page Coverage Test
 *
 * レジストリに登録された全ツールスラッグに対して、
 * 対応する個別ページファイル（page.tsx, opengraph-image.tsx, twitter-image.tsx）
 * が存在することを検証する。
 *
 * ツールを registry.ts に追加したが、個別ページの作成を忘れた場合に検出する。
 *
 * Phase 8.1 移行対応: ページが (legacy) か (new) のどちらか一方に存在すれば OK。
 * 移行済みツールは (new) 配下に、未移行ツールは (legacy) 配下に存在する。
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

// Phase 8.1 移行期間中は (legacy) と (new) の両方を探索する
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
      for (const file of REQUIRED_FILES) {
        const legacyPath = join(legacyToolsDir, slug, file);
        const newPath = join(newToolsDir, slug, file);
        const exists = existsSync(legacyPath) || existsSync(newPath);
        expect(
          exists,
          `${slug}/${file} が (legacy) または (new) 配下に存在すること`,
        ).toBe(true);
      }
    },
  );
});
