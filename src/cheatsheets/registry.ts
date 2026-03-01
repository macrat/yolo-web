import type { CheatsheetMeta, CheatsheetDefinition } from "./types";

import { meta as regexMeta } from "./regex/meta";
import { meta as gitMeta } from "./git/meta";
import { meta as markdownMeta } from "./markdown/meta";
import { meta as httpStatusCodesMeta } from "./http-status-codes/meta";
import { meta as cronMeta } from "./cron/meta";

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
  {
    meta: httpStatusCodesMeta,
    componentImport: () => import("./http-status-codes/Component"),
  },
  {
    meta: cronMeta,
    componentImport: () => import("./cron/Component"),
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
