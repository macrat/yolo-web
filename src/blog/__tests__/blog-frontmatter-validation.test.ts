/**
 * Frontmatter validation for every post in `src/blog/content`.
 *
 * Two guarantees are checked across all posts at once.
 *
 * **Fidelity** — every value written between the `---` delimiters reaches the
 * parsed result. This is the guarantee nothing else in the pipeline can give:
 * a reader that drops a key hands back a type-correct empty array, so a post
 * can lose its tags without a single error anywhere. The tests below read the
 * frontmatter text as written and compare it against what `parseFrontmatter`
 * returns, so the loss surfaces here instead of on the live site.
 *
 * **Validity** — the parsed values obey the rules in
 * `.claude/rules/blog-writing.md`: a known category, a known series, and ISO
 * 8601 timestamps that are unique to the second.
 */

import { describe, test, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "@/lib/markdown";
import { ALL_CATEGORIES, SERIES_LABELS } from "@/blog/_lib/blog";

const BLOG_DIR = path.join(process.cwd(), "src/blog/content");

/** Frontmatter keys whose value is a list of strings. */
const ARRAY_KEYS = ["tags", "related_tool_slugs"] as const;

/** A key and its value, written at the start of a line. */
const KEY_LINE = /^([A-Za-z_][A-Za-z0-9_]*):(.*)$/;
/** One entry of a block sequence: `  - "value"`. */
const BLOCK_ITEM_LINE = /^ {2}- \S/;
const COMMENT_LINE = /^\s*#/;
const QUOTED_STRING = /"([^"]*)"/g;

/**
 * ISO 8601 datetime with a time component and a timezone offset.
 * Matches `YYYY-MM-DDTHH:MM:SS+HH:MM` and `YYYY-MM-DDTHH:MM:SS+HHMM`.
 * Does not match a bare `YYYY-MM-DD`.
 */
const ISO_DATETIME_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:?\d{2}$/;

const isString = (value: unknown): value is string => typeof value === "string";
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);
const isStringOrNull = (value: unknown): boolean =>
  isString(value) || value === null;

interface KeyRule {
  /** Human-readable type, used in the failure message. */
  expected: string;
  check: (value: unknown) => boolean;
  required: boolean;
}

/**
 * The type each key must hold once parsed.
 *
 * The timestamps are required to be *strings*. A YAML reader is free to turn an
 * unquoted timestamp into a `Date`, and it does so for some spellings and not
 * others — `2026-07-16T12:00:00+09:00` becomes a `Date` while the same instant
 * written `+0900` stays a string. Asserting the type directly covers both.
 */
const KEY_RULES: Record<string, KeyRule> = {
  title: { expected: "a string", check: isString, required: true },
  slug: { expected: "a string", check: isString, required: true },
  description: { expected: "a string", check: isString, required: true },
  published_at: { expected: "a string", check: isString, required: true },
  updated_at: {
    expected: "a string or null",
    check: isStringOrNull,
    required: true,
  },
  category: { expected: "a string", check: isString, required: true },
  series: {
    expected: "a string or null",
    check: isStringOrNull,
    required: false,
  },
  series_order: {
    expected: "a number",
    check: (value) => typeof value === "number",
    required: false,
  },
  tags: {
    expected: "an array of strings",
    check: isStringArray,
    required: true,
  },
  related_tool_slugs: {
    expected: "an array of strings",
    check: isStringArray,
    required: true,
  },
  draft: {
    expected: "a boolean",
    check: (value) => typeof value === "boolean",
    required: true,
  },
  trust_level: { expected: "a string", check: isString, required: false },
};

interface Post {
  file: string;
  /** Text between the `---` delimiters, exactly as written. */
  frontmatter: string;
  /** The same frontmatter as the site itself reads it. */
  data: Record<string, unknown>;
}

function loadAllPosts(): Post[] {
  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  return files.map((file) => {
    const raw = fs
      .readFileSync(path.join(BLOG_DIR, file), "utf-8")
      .replace(/\r\n/g, "\n");
    const { data } = parseFrontmatter<Record<string, unknown>>(raw);
    return {
      file,
      frontmatter: raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "",
      data,
    };
  });
}

/**
 * Map each key to the text of its value: the rest of the key line plus every
 * line that follows it up to the next key. Whole-line comments carry no value
 * and are left out.
 */
function collectValueText(frontmatter: string): Map<string, string> {
  const values = new Map<string, string>();
  let current: string | null = null;

  for (const line of frontmatter.split("\n")) {
    if (COMMENT_LINE.test(line)) continue;

    const keyMatch = line.match(KEY_LINE);
    if (keyMatch) {
      current = keyMatch[1];
      values.set(current, keyMatch[2]);
    } else if (current !== null) {
      values.set(current, `${values.get(current)}\n${line}`);
    }
  }

  return values;
}

/** The quoted strings written in a value, in the order they appear. */
function writtenStrings(valueText: string): string[] {
  return [...valueText.matchAll(QUOTED_STRING)].map((m) => m[1]);
}

/**
 * The frontmatter lines that belong to no key.
 *
 * A key line that carries its value on the same line is complete — nothing may
 * follow it but the next key. A key line with an empty value opens a block, and
 * only `  - value` entries may follow. Every other line is text that no reader
 * can attribute to a key: a stray sequence, or a list wrapped onto lines of its
 * own where a line break can swallow entries without anyone noticing.
 */
function findOrphanLines(frontmatter: string): string[] {
  const lines = frontmatter.split("\n");
  const orphans: string[] = [];
  let openBlockKey: string | null = null;

  for (const [index, line] of lines.entries()) {
    if (line.trim() === "" || COMMENT_LINE.test(line)) continue;

    const keyMatch = line.match(KEY_LINE);
    if (keyMatch) {
      openBlockKey = keyMatch[2].trim() === "" ? keyMatch[1] : null;
      continue;
    }

    if (openBlockKey !== null && BLOCK_ITEM_LINE.test(line)) continue;

    orphans.push(`line ${index + 1}: ${line}`);
  }

  return orphans;
}

describe("blog frontmatter validation", () => {
  const posts = loadAllPosts();

  test("every post has a frontmatter block", () => {
    const violations = posts
      .filter(({ frontmatter }) => frontmatter === "")
      .map(({ file }) => `${file}: no frontmatter between --- delimiters`);

    expect(violations).toEqual([]);
  });

  test("every string written under an array key survives parsing", () => {
    const violations: string[] = [];

    for (const { file, frontmatter, data } of posts) {
      const values = collectValueText(frontmatter);

      for (const key of ARRAY_KEYS) {
        const valueText = values.get(key);
        if (valueText === undefined) continue;

        const written = writtenStrings(valueText);
        const parsed = data[key];
        if (
          !isStringArray(parsed) ||
          parsed.length !== written.length ||
          parsed.some((entry, index) => entry !== written[index])
        ) {
          violations.push(
            `${file}: ${key} is written as ${JSON.stringify(written)} but parses to ${JSON.stringify(parsed)}`,
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });

  test("every frontmatter line belongs to a key", () => {
    const violations: string[] = [];

    for (const { file, frontmatter } of posts) {
      for (const orphan of findOrphanLines(frontmatter)) {
        violations.push(`${file}: ${orphan}`);
      }
    }

    expect(violations).toEqual([]);
  });

  test("every frontmatter key parses to its expected type", () => {
    const violations: string[] = [];

    for (const { file, data } of posts) {
      for (const key of Object.keys(data)) {
        if (!(key in KEY_RULES)) {
          violations.push(`${file}: ${key} is not a known frontmatter key`);
        }
      }

      for (const [key, rule] of Object.entries(KEY_RULES)) {
        const value = data[key];
        if (value === undefined) {
          if (rule.required) violations.push(`${file}: ${key} is missing`);
          continue;
        }
        if (!rule.check(value)) {
          violations.push(
            `${file}: ${key} must be ${rule.expected} but is ${JSON.stringify(value)} (${value === null ? "null" : typeof value})`,
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });

  test("all posts have published_at in ISO 8601 datetime format (with time component)", () => {
    const violations: string[] = [];

    for (const { file, data } of posts) {
      const published = data.published_at;
      if (!isString(published)) continue;
      if (!ISO_DATETIME_REGEX.test(published)) {
        violations.push(
          `${file}: published_at "${published}" is not a valid ISO 8601 datetime (time component required, e.g. YYYY-MM-DDTHH:MM:SS+09:00)`,
        );
      }
    }

    expect(violations).toEqual([]);
  });

  test("all posts with updated_at have it in ISO 8601 datetime format (with time component)", () => {
    const violations: string[] = [];

    for (const { file, data } of posts) {
      // null means "never updated" — the canonical initial state
      const updated = data.updated_at;
      if (!isString(updated) || updated === "") continue;
      if (!ISO_DATETIME_REGEX.test(updated)) {
        violations.push(
          `${file}: updated_at "${updated}" is not a valid ISO 8601 datetime (time component required, e.g. YYYY-MM-DDTHH:MM:SS+09:00)`,
        );
      }
    }

    expect(violations).toEqual([]);
  });

  test("all posts have unique published_at timestamps (no duplicate to the second)", () => {
    const seen = new Map<string, string[]>();

    for (const { file, data } of posts) {
      const published = data.published_at;
      if (!isString(published)) continue;
      seen.set(published, [...(seen.get(published) ?? []), file]);
    }

    const duplicates = [...seen.entries()]
      .filter(([, files]) => files.length > 1)
      .map(
        ([timestamp, files]) => `"${timestamp}" shared by: ${files.join(", ")}`,
      );

    expect(duplicates).toEqual([]);
  });

  test("all posts have a valid category (must be in ALL_CATEGORIES)", () => {
    const violations: string[] = [];
    const validCategories = new Set<string>(ALL_CATEGORIES);

    for (const { file, data } of posts) {
      const category = data.category;
      if (!isString(category)) continue;
      if (!validCategories.has(category)) {
        violations.push(
          `${file}: category "${category}" is not in ALL_CATEGORIES (${ALL_CATEGORIES.join(", ")})`,
        );
      }
    }

    expect(violations).toEqual([]);
  });

  test("all posts with a series field use a valid series ID (must be in SERIES_LABELS)", () => {
    const violations: string[] = [];
    const validSeriesIds = new Set<string>(Object.keys(SERIES_LABELS));

    for (const { file, data } of posts) {
      // series absent or null means no series — that is valid
      const series = data.series;
      if (!isString(series) || series === "") continue;
      if (!validSeriesIds.has(series)) {
        violations.push(
          `${file}: series "${series}" is not in SERIES_LABELS (${Object.keys(SERIES_LABELS).join(", ")})`,
        );
      }
    }

    expect(violations).toEqual([]);
  });
});
