import type { CheatsheetMeta, CheatsheetDefinition } from "./types";

import { meta as regexMeta } from "./regex/meta";
import { meta as gitMeta } from "./git/meta";
import { meta as markdownMeta } from "./markdown/meta";

const cheatsheetEntries: CheatsheetDefinition[] = [
  {
    meta: regexMeta,
    componentImport: () => import("./regex/Component"),
  },
  {
    meta: gitMeta,
    componentImport: () => import("./git/Component"),
  },
  {
    meta: markdownMeta,
    componentImport: () => import("./markdown/Component"),
  },
];

export const cheatsheetsBySlug: Map<string, CheatsheetDefinition> = new Map(
  cheatsheetEntries.map((entry) => [entry.meta.slug, entry]),
);

export const allCheatsheetMetas: CheatsheetMeta[] = cheatsheetEntries.map(
  (e) => e.meta,
);

export function getAllCheatsheetSlugs(): string[] {
  return cheatsheetEntries.map((e) => e.meta.slug);
}
