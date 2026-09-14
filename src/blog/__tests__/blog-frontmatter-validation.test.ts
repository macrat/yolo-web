/**
 * Frontmatter validation for every post in `src/blog/content`.
 *
 * Two guarantees are checked across all posts at once.
 *
 * **Fidelity** — every value written between the `---` delimiters reaches the
 * parsed result unchanged. This is the guarantee nothing else in the pipeline
 * can give: a reader that drops a key hands back a type-correct empty array and
 * a YAML scalar left unquoted can come back as another type entirely, so a post
 * can lose its tags or its title without a single error anywhere. The check
 * reads the frontmatter text as written and compares it against what
 * `parseFrontmatter` — the reader the site itself renders from — returns, so
 * the loss surfaces here instead of on the live site.
 *
 * The comparison runs in the writing direction: every parsed value is encoded
 * back into frontmatter text, and that text must be what stands in the file.
 * Every string is written quoted — quoting is what keeps YAML's implicit typing
 * from reading a title as a boolean or a timestamp as a `Date` — while `null`,
 * numbers and booleans stay bare and a list becomes a block sequence. A value
 * the parser silently reshaped, or a quote left off, fails to match.
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

/** A key and the value written on its line. */
const KEY_LINE = /^([A-Za-z_][A-Za-z0-9_]*):(.*)$/;
/** One entry of a block sequence: `  - "value"`. */
const BLOCK_ITEM_LINE = /^ {2}- (.*)$/;
const COMMENT_LINE = /^\s*#/;

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

type ValueForm =
  "string" | "nullableString" | "stringList" | "number" | "boolean";

/** The shape each form takes once parsed, and how it reads in a failure. */
const FORMS: Record<
  ValueForm,
  { label: string; check: (value: unknown) => boolean }
> = {
  string: { label: "a string", check: isString },
  nullableString: {
    label: "a string or null",
    check: (value) => isString(value) || value === null,
  },
  stringList: { label: "an array of strings", check: isStringArray },
  number: { label: "a number", check: (value) => typeof value === "number" },
  boolean: { label: "a boolean", check: (value) => typeof value === "boolean" },
};

/**
 * The form each key must hold once parsed, and whether it may be left out.
 *
 * The timestamps are required to be *strings*. A YAML reader is free to turn an
 * unquoted timestamp into a `Date`, and it does so for some spellings and not
 * others — `2026-07-16T12:00:00+09:00` becomes a `Date` while the same instant
 * written `+0900` stays a string. Asserting the form directly covers both.
 */
const KEY_RULES: Record<string, { form: ValueForm; required: boolean }> = {
  title: { form: "string", required: true },
  slug: { form: "string", required: true },
  description: { form: "string", required: true },
  published_at: { form: "string", required: true },
  updated_at: { form: "nullableString", required: true },
  category: { form: "string", required: true },
  series: { form: "nullableString", required: false },
  series_order: { form: "number", required: false },
  tags: { form: "stringList", required: true },
  related_tool_slugs: { form: "stringList", required: true },
  draft: { form: "boolean", required: true },
  trust_level: { form: "string", required: false },
};

/** A value as it stands in the file: the key-line text and the entries below. */
interface Writing {
  /** Text written after the colon on the key line. */
  inline: string;
  /** Text of each `  - value` entry written under the key. */
  items: string[];
}

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
 * Map each key to the text written for it: the rest of the key line, plus the
 * block sequence entries that follow. Whole-line comments carry no value and
 * are left out.
 */
function collectWritings(frontmatter: string): Map<string, Writing> {
  const writings = new Map<string, Writing>();
  let current: Writing | null = null;

  for (const line of frontmatter.split("\n")) {
    if (COMMENT_LINE.test(line)) continue;

    const keyMatch = line.match(KEY_LINE);
    if (keyMatch) {
      current = { inline: keyMatch[2].trim(), items: [] };
      writings.set(keyMatch[1], current);
      continue;
    }

    const itemMatch = line.match(BLOCK_ITEM_LINE);
    if (itemMatch && current !== null) current.items.push(itemMatch[1].trim());
  }

  return writings;
}

/**
 * Re-encode one parsed value as frontmatter text, in the quote style it is
 * already written in.
 *
 * Which quote character a string carries is Prettier's call — it prefers `'…'`
 * for a value holding a `"` — so both styles are accepted and only the text
 * inside is pinned: a string re-encoded in its own style has to come back
 * character for character. An unquoted string matches neither style and is
 * reported against the double-quoted form. `null`, numbers and booleans are
 * written bare, which is also their JSON spelling.
 */
function rewriteValue(value: unknown, style: string): string {
  if (typeof value !== "string") return JSON.stringify(value);
  if (style.startsWith("'")) return `'${value.replace(/'/g, "''")}'`;
  return JSON.stringify(value);
}

/**
 * How a parsed value must stand in the file. A non-empty list is written as a
 * block sequence; every other value — an empty list included — is a single
 * scalar on the key line.
 */
function canonicalWriting(value: unknown, written: Writing): Writing {
  if (Array.isArray(value) && value.length > 0) {
    return {
      inline: "",
      items: value.map((entry, index) =>
        rewriteValue(entry, written.items[index] ?? ""),
      ),
    };
  }
  return { inline: rewriteValue(value, written.inline), items: [] };
}

function sameWriting(a: Writing, b: Writing): boolean {
  return (
    a.inline === b.inline &&
    a.items.length === b.items.length &&
    a.items.every((item, index) => item === b.items[index])
  );
}

function formatWriting({ inline, items }: Writing): string {
  const parts = [inline, ...items.map((item) => `- ${item}`)].filter(
    (part) => part !== "",
  );
  return parts.length === 0 ? "(nothing)" : parts.join(" ");
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
  let insideBlock = false;

  for (const [index, line] of lines.entries()) {
    if (line.trim() === "" || COMMENT_LINE.test(line)) continue;

    const keyMatch = line.match(KEY_LINE);
    if (keyMatch) {
      insideBlock = keyMatch[2].trim() === "";
      continue;
    }

    const itemMatch = line.match(BLOCK_ITEM_LINE);
    if (insideBlock && itemMatch && itemMatch[1].trim() !== "") continue;

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

  test("every value is written exactly as it parses", () => {
    const violations: string[] = [];

    for (const { file, frontmatter, data } of posts) {
      const writings = collectWritings(frontmatter);

      for (const [key, value] of Object.entries(data)) {
        const written = writings.get(key) ?? { inline: "", items: [] };
        const expected = canonicalWriting(value, written);
        if (!sameWriting(written, expected)) {
          violations.push(
            `${file}: ${key} is written as ${formatWriting(written)} but must be written as ${formatWriting(expected)} to parse to ${JSON.stringify(value)}`,
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
        const form = FORMS[rule.form];
        if (!form.check(value)) {
          violations.push(
            `${file}: ${key} must be ${form.label} but is ${JSON.stringify(value)} (${value === null ? "null" : typeof value})`,
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
