/**
 * Frontmatter validation tests for all blog posts.
 *
 * These tests ensure that blog post frontmatter values meet the rules defined
 * in .claude/rules/blog-writing.md. They are designed to catch data quality
 * issues early, before they cause runtime bugs or mislead other developers.
 *
 * Background (Accident Report 3, cycle-122):
 * A test that assumed identical published_at timestamps ("defensive code for
 * duplicate timestamps") led PM to falsely believe published_at was date-only
 * (YYYY-MM-DD). The actual data uses full ISO 8601 datetime with time and
 * timezone. The defensive test was removed, and these validation tests were
 * added to verify the data is actually correct.
 */

import { describe, test, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ALL_CATEGORIES, SERIES_LABELS } from "@/blog/_lib/blog";

const BLOG_DIR = path.join(process.cwd(), "src/blog/content");

interface RawFrontmatter {
  published_at?: string;
  updated_at?: string;
  category?: string;
  /** undefined = field absent; null = explicitly set to YAML null */
  series?: string | null;
  slug?: string;
}

/** Parse only frontmatter fields (YAML between --- delimiters). */
function parseRawFrontmatter(content: string): RawFrontmatter {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = match[1];
  const result: RawFrontmatter = {};

  for (const line of yaml.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const rawVal = line.slice(colonIdx + 1).trim();

    if (
      key === "published_at" ||
      key === "updated_at" ||
      key === "category" ||
      key === "series" ||
      key === "slug"
    ) {
      if (rawVal === "" || rawVal === "null") {
        // YAML null or empty value — treat as explicitly null
        result[key as keyof RawFrontmatter] = null as unknown as string;
      } else {
        // Remove surrounding quotes if present
        const val = rawVal.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
        result[key as keyof RawFrontmatter] = val;
      }
    }
  }

  return result;
}

/**
 * ISO 8601 datetime with time component regex.
 * Matches: YYYY-MM-DDTHH:MM:SS+HH:MM or YYYY-MM-DDTHH:MM:SS+HHMM
 * Does NOT match: YYYY-MM-DD (date-only)
 */
const ISO_DATETIME_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:?\d{2}$/;

/** Load all blog post files with their raw frontmatter. */
function loadAllPosts(): Array<{ file: string; fm: RawFrontmatter }> {
  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  return files.map((file) => {
    const content = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    return { file, fm: parseRawFrontmatter(content) };
  });
}

describe("blog frontmatter validation", () => {
  const posts = loadAllPosts();

  test("all posts have published_at in ISO 8601 datetime format (with time component)", () => {
    const violations: string[] = [];

    for (const { file, fm } of posts) {
      if (!fm.published_at) {
        violations.push(`${file}: published_at is missing`);
        continue;
      }
      if (!ISO_DATETIME_REGEX.test(fm.published_at)) {
        violations.push(
          `${file}: published_at "${fm.published_at}" is not a valid ISO 8601 datetime (time component required, e.g. YYYY-MM-DDTHH:MM:SS+09:00)`,
        );
      }
    }

    expect(violations).toEqual([]);
  });

  test("all posts with updated_at have it in ISO 8601 datetime format (with time component)", () => {
    const violations: string[] = [];

    for (const { file, fm } of posts) {
      // Skip posts without updated_at or with YAML null
      if (fm.updated_at == null || fm.updated_at === "") continue;
      if (!ISO_DATETIME_REGEX.test(fm.updated_at)) {
        violations.push(
          `${file}: updated_at "${fm.updated_at}" is not a valid ISO 8601 datetime (time component required, e.g. YYYY-MM-DDTHH:MM:SS+09:00)`,
        );
      }
    }

    expect(violations).toEqual([]);
  });

  test("all posts have unique published_at timestamps (no duplicate to the second)", () => {
    const seen = new Map<string, string[]>();

    for (const { file, fm } of posts) {
      if (!fm.published_at) continue;
      const existing = seen.get(fm.published_at) ?? [];
      existing.push(file);
      seen.set(fm.published_at, existing);
    }

    const duplicates: string[] = [];
    for (const [ts, files] of seen.entries()) {
      if (files.length > 1) {
        duplicates.push(`"${ts}" shared by: ${files.join(", ")}`);
      }
    }

    expect(duplicates).toEqual([]);
  });

  test("all posts have a valid category (must be in ALL_CATEGORIES)", () => {
    const violations: string[] = [];
    const validCategories = new Set<string>(ALL_CATEGORIES);

    for (const { file, fm } of posts) {
      if (!fm.category) {
        violations.push(`${file}: category is missing`);
        continue;
      }
      if (!validCategories.has(fm.category)) {
        violations.push(
          `${file}: category "${fm.category}" is not in ALL_CATEGORIES (${ALL_CATEGORIES.join(", ")})`,
        );
      }
    }

    expect(violations).toEqual([]);
  });

  test("all posts with a series field use a valid series ID (must be in SERIES_LABELS)", () => {
    const violations: string[] = [];
    const validSeriesIds = new Set<string>(Object.keys(SERIES_LABELS));

    for (const { file, fm } of posts) {
      // series absent or YAML null means no series — that is valid
      if (fm.series == null || fm.series === "") continue;
      if (!validSeriesIds.has(fm.series)) {
        violations.push(
          `${file}: series "${fm.series}" is not in SERIES_LABELS (${Object.keys(SERIES_LABELS).join(", ")})`,
        );
      }
    }

    expect(violations).toEqual([]);
  });
});
