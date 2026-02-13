import type { ToolMeta, ToolDefinition } from "./types";

// Tool entries will be added as tools are implemented.
// Each entry contains metadata and a dynamic import function.
const toolEntries: ToolDefinition[] = [];

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
