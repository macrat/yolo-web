/** Data access functions for traditional colors dictionary */

import colorData from "@/data/traditional-colors.json";
import type { ColorEntry, ColorCategory } from "./types";

const allColors: ColorEntry[] = colorData as ColorEntry[];

/** Returns all color entries */
export function getAllColors(): ColorEntry[] {
  return allColors;
}

/** Returns a single color entry by slug, or undefined if not found */
export function getColorBySlug(slug: string): ColorEntry | undefined {
  return allColors.find((c) => c.slug === slug);
}

/** Returns all color entries in a given category */
export function getColorsByCategory(category: ColorCategory): ColorEntry[] {
  return allColors.filter((c) => c.category === category);
}

/** Returns all unique color categories that have entries */
export function getColorCategories(): ColorCategory[] {
  const categories = new Set<ColorCategory>();
  for (const c of allColors) {
    categories.add(c.category);
  }
  return Array.from(categories).sort();
}

/** Returns all color slugs as an array of strings */
export function getAllColorSlugs(): string[] {
  return allColors.map((c) => c.slug);
}
