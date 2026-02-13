import type { SemanticCategory } from "./types";

/**
 * Super-groups define which semantic categories are "related" (close)
 * for the feedback system. If two categories share a super-group,
 * the category feedback is "close" (yellow).
 */
export const categorySuperGroups: Record<string, SemanticCategory[]> = {
  elements: ["water", "fire", "earth", "weather", "nature"],
  living: ["animal", "plant", "body", "person"],
  human: ["emotion", "action", "language", "society"],
  abstract: ["number", "time", "direction", "measurement", "abstract"],
  objects: ["building", "tool"],
};

/**
 * Check if two semantic categories are in the same super-group.
 * Returns true if they share at least one super-group.
 */
export function areCategoriesRelated(
  a: SemanticCategory,
  b: SemanticCategory,
): boolean {
  if (a === b) return true;
  for (const group of Object.values(categorySuperGroups)) {
    if (group.includes(a) && group.includes(b)) {
      return true;
    }
  }
  return false;
}
