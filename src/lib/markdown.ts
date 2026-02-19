/**
 * Shared markdown rendering utilities for the web application.
 *
 * NOTE: Similar frontmatter parsing exists in scripts/memo/core/parser.ts (CLI tool).
 * Changes to memo frontmatter format must be reflected in both locations.
 * This module parses frontmatter for the web app's build-time rendering,
 * while scripts/memo/core/parser.ts parses it for the CLI memo management tool.
 */

import { marked, type MarkedExtension } from "marked";

/**
 * Custom marked extension to convert mermaid code blocks into
 * `<div class="mermaid">` elements for client-side rendering.
 */
const mermaidExtension: MarkedExtension = {
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      if (lang === "mermaid") {
        const escaped = text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
        return `<div class="mermaid">${escaped}</div>\n`;
      }
      return false; // fallback to default renderer
    },
  },
};

marked.use(mermaidExtension);

/** Parse YAML frontmatter from a markdown string. Returns { data, content }. */
export function parseFrontmatter<T>(raw: string): { data: T; content: string } {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { data: {} as T, content: normalized };
  }

  const yamlBlock = match[1];
  const content = match[2];
  const data = parseYamlBlock(yamlBlock) as T;

  return { data, content };
}

/**
 * Minimal YAML parser for frontmatter blocks.
 * Handles: quoted strings, unquoted strings, booleans, nulls, numbers,
 * inline arrays, and block arrays.
 */
function parseYamlBlock(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yaml.split("\n");

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const keyMatch = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)/);
    if (!keyMatch) {
      i++;
      continue;
    }

    const key = keyMatch[1];
    const value = keyMatch[2].trim();

    // Inline array: ["a", "b"]
    if (value.startsWith("[")) {
      const arrayContent = value.slice(1, value.lastIndexOf("]"));
      if (arrayContent.trim() === "") {
        result[key] = [];
      } else {
        result[key] = arrayContent.split(",").map((s) =>
          s
            .trim()
            .replace(/^"(.*)"$/, "$1")
            .replace(/^'(.*)'$/, "$1"),
        );
      }
      i++;
      continue;
    }

    // Check for block array on following lines
    if (value === "" || value === "") {
      const items: string[] = [];
      let j = i + 1;
      while (j < lines.length) {
        const itemMatch = lines[j].match(/^\s+-\s+(.*)/);
        if (itemMatch) {
          items.push(
            itemMatch[1]
              .trim()
              .replace(/^"(.*)"$/, "$1")
              .replace(/^'(.*)'$/, "$1"),
          );
          j++;
        } else {
          break;
        }
      }
      if (items.length > 0) {
        result[key] = items;
        i = j;
        continue;
      }
    }

    // Scalar values
    result[key] = parseYamlScalar(value);
    i++;
  }

  return result;
}

function parseYamlScalar(value: string): unknown {
  // Quoted string
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }

  // null
  if (value === "null" || value === "~" || value === "") {
    return null;
  }

  // boolean
  if (value === "true") return true;
  if (value === "false") return false;

  // number
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }

  // Unquoted string
  return value;
}

/**
 * Convert markdown to HTML using the `marked` library.
 * Configured for GFM (GitHub Flavored Markdown) support.
 */
export function markdownToHtml(md: string): string {
  const result = marked.parse(md, {
    gfm: true,
    breaks: false,
  });
  // marked.parse can return string | Promise<string>; we use sync mode
  if (typeof result !== "string") {
    throw new Error("Unexpected async result from marked.parse");
  }
  return result;
}

/**
 * Extract heading structure for table of contents.
 * Returns array of { level, text, id } objects.
 */
export function extractHeadings(
  md: string,
): { level: number; text: string; id: string }[] {
  const headings: { level: number; text: string; id: string }[] = [];
  const lines = md.split("\n");

  let inCodeBlock = false;
  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2]
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/`/g, "")
        .trim();
      const id = text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      headings.push({ level, text, id });
    }
  }

  return headings;
}

/**
 * Estimate reading time in minutes.
 * Japanese: ~500 chars/min. English: ~200 words/min.
 * Uses a blended approach based on content composition.
 */
export function estimateReadingTime(text: string): number {
  // Count Japanese characters (CJK Unified Ideographs + Hiragana + Katakana)
  const japaneseChars = (
    text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g) || []
  ).length;
  // Count English words (sequences of Latin characters)
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;

  const japaneseMinutes = japaneseChars / 500;
  const englishMinutes = englishWords / 200;

  return Math.max(1, Math.ceil(japaneseMinutes + englishMinutes));
}
