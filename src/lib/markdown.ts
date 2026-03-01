/**
 * Shared markdown rendering utilities for the web application.
 *
 * NOTE: Similar frontmatter parsing exists in scripts/memo/core/parser.ts (CLI tool).
 * Changes to memo frontmatter format must be reflected in both locations.
 * This module parses frontmatter for the web app's build-time rendering,
 * while scripts/memo/core/parser.ts parses it for the CLI memo management tool.
 */

import { Marked, type MarkedExtension, type Tokens } from "marked";
// GFM Alert構文（> [!NOTE]等）をadmonitionのHTMLに変換するため追加
import markedAlert from "marked-alert";

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

/**
 * Generate a URL-friendly heading ID from text.
 * Shared between extractHeadings() and the heading renderer to ensure
 * IDs are always consistent.
 */
export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Create a heading renderer extension that assigns id attributes
 * using the same logic as extractHeadings().
 *
 * A closure-based counter tracks duplicate IDs per parse call.
 * The returned resetCounter function MUST be called before each
 * marked.parse() invocation to reset state.
 */
function createHeadingExtension(): {
  extension: MarkedExtension;
  resetCounter: () => void;
} {
  let idCount = new Map<string, number>();

  const resetCounter = () => {
    idCount = new Map<string, number>();
  };

  const extension: MarkedExtension = {
    renderer: {
      heading({ tokens, depth }: Tokens.Heading) {
        // Use the built-in parser to render inline tokens to HTML.
        // This preserves marked's default HTML escaping behavior.
        const inner = this.parser.parseInline(tokens);
        // Extract plain text for ID generation (strip HTML tags)
        const plainText = inner.replace(/<[^>]*>/g, "");
        const baseId = generateHeadingId(plainText);
        const count = idCount.get(baseId) || 0;
        idCount.set(baseId, count + 1);
        const id = count === 0 ? baseId : `${baseId}-${count}`;
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
      },
    },
  };

  return { extension, resetCounter };
}

const { extension: headingExtension, resetCounter: resetHeadingCounter } =
  createHeadingExtension();

/**
 * Module-level Marked instance with mermaid, heading, and alert extensions.
 * Using a dedicated instance avoids polluting the global marked state
 * and keeps extensions isolated.
 * markedAlert() is included to support GFM Alert syntax (> [!NOTE], > [!WARNING], etc.).
 */
const markedInstance = new Marked(
  mermaidExtension,
  headingExtension,
  markedAlert(),
);

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
  // Reset the heading ID counter before each parse call so that
  // duplicate-ID suffixes start fresh for every document.
  resetHeadingCounter();
  const result = markedInstance.parse(md, {
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
  const idCount = new Map<string, number>();

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
        // Strip image syntax: ![alt](url) -> "" (must precede link strip;
        // matches markdownToHtml where <img> tags are fully removed)
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
        // Strip link syntax: [text](url) -> text
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        // Strip existing inline formatting
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/`/g, "")
        // Strip HTML tags: <tag> -> empty
        .replace(/<[^>]*>/g, "")
        .trim();
      const baseId = generateHeadingId(text);
      const count = idCount.get(baseId) || 0;
      idCount.set(baseId, count + 1);
      const id = count === 0 ? baseId : `${baseId}-${count}`;
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
