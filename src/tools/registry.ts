import type { ToolMeta, ToolDefinition } from "./types";

import { meta as charCountMeta } from "./char-count/meta";
import { meta as jsonFormatterMeta } from "./json-formatter/meta";
import { meta as base64Meta } from "./base64/meta";

const toolEntries: ToolDefinition[] = [
  {
    meta: charCountMeta,
    componentImport: () => import("./char-count/Component"),
  },
  {
    meta: jsonFormatterMeta,
    componentImport: () => import("./json-formatter/Component"),
  },
  {
    meta: base64Meta,
    componentImport: () => import("./base64/Component"),
  },
];

// Indexed by slug for O(1) lookup
export const toolsBySlug: Map<string, ToolDefinition> = new Map(
  toolEntries.map((entry) => [entry.meta.slug, entry]),
);

// All tool metadata (no component code loaded)
export const allToolMetas: ToolMeta[] = toolEntries.map((e) => e.meta);

// Get slugs for generateStaticParams
export function getAllToolSlugs(): string[] {
  return toolEntries.map((e) => e.meta.slug);
}
