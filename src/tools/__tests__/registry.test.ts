import fs from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { allToolMetas, getAllToolSlugs, toolsBySlug } from "../registry";

const TOOLS_DIR = path.resolve(__dirname, "..");

/** `src/tools/{slug}/meta.ts` を持つディレクトリの名前（= slug）の一覧 */
function slugsWithMetaFile(): string[] {
  return fs
    .readdirSync(TOOLS_DIR, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        fs.existsSync(path.join(TOOLS_DIR, entry.name, "meta.ts")),
    )
    .map((entry) => entry.name)
    .sort();
}

test("登録簿のツールと src/tools/*/meta.ts のツールが一致する", () => {
  const registered = [...getAllToolSlugs()].sort();
  expect(registered).toEqual(slugsWithMetaFile());
  expect(registered).toHaveLength(36);
});

test("登録簿の slug が重複しない", () => {
  const slugs = allToolMetas.map((meta) => meta.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
  expect(toolsBySlug.size).toBe(slugs.length);
});
