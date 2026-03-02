import type { CheatsheetMeta, CheatsheetDefinition } from "./types";

import { meta as regexMeta } from "./regex/meta";
import { meta as gitMeta } from "./git/meta";
import { meta as markdownMeta } from "./markdown/meta";
import { meta as httpStatusCodesMeta } from "./http-status-codes/meta";
import { meta as cronMeta } from "./cron/meta";
import { meta as htmlTagsMeta } from "./html-tags/meta";
import { meta as sqlMeta } from "./sql/meta";

const cheatsheetEntries: CheatsheetDefinition[] = [
  { meta: regexMeta },
  { meta: gitMeta },
  { meta: markdownMeta },
  { meta: httpStatusCodesMeta },
  { meta: cronMeta },
  { meta: htmlTagsMeta },
  { meta: sqlMeta },
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
