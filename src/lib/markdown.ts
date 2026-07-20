/**
 * Shared markdown rendering utilities for the web application.
 *
 * This module parses frontmatter and renders markdown content for the web app's
 * build-time rendering.
 */

import { Marked, type MarkedExtension, type Tokens } from "marked";
// GFM Alert構文（> [!NOTE]等）をadmonitionのHTMLに変換するため追加
import markedAlert from "marked-alert";
// XSS防止のためmarked出力をホワイトリスト方式でサニタイズ
import { sanitize } from "@/lib/sanitize";
// ビルド時シンタックスハイライト（クライアントでチラつかせないため）
import { highlight } from "@/lib/highlight";

/**
 * Custom marked extension for fenced code blocks.
 *
 * - `mermaid` → client-side mermaid rendering target (`<div class="mermaid">`)
 * - その他 → Shiki でビルド時にシンタックスハイライト済みの `<pre class="shiki">`
 *   を返す。クライアント側でハイライトを掛け直さないのでチラつかない。
 *
 * Shiki の `highlight()` は async なので、walkTokens フックで code トークンを
 * 先読みしてハイライト結果を WeakMap に保存しておき、同期 renderer はそこから
 * 取り出すだけにする。marked 単体は同期 renderer しかサポートしないため。
 */
const highlightedCodeCache = new WeakMap<Tokens.Code, string>();

const codeExtension: MarkedExtension = {
  async: true,
  async walkTokens(token) {
    if (token.type !== "code") return;
    const code = token as Tokens.Code;
    if (code.lang === "mermaid") return;
    highlightedCodeCache.set(code, await highlight(code.text, code.lang));
  },
  renderer: {
    code(token: Tokens.Code) {
      if (token.lang === "mermaid") {
        const escaped = token.text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
        return `<div class="mermaid">${escaped}</div>\n`;
      }
      const cached = highlightedCodeCache.get(token);
      if (cached) return `${cached}\n`;
      // walkTokens は async なので markdownToHtml() を await した経路では必ず埋まる。
      // ここに来るのは per-call の instance.parse() を async モード経由で呼ばなかった
      // 場合の保険。素の <pre><code> にエスケープして渡す。
      const escaped = token.text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<pre><code>${escaped}</code></pre>\n`;
    },
  },
};

/**
 * Heading entry for the table of contents.
 *
 * Produced as a side-effect of rendering markdown to HTML so that the
 * `id` here is the *same string* assigned to the corresponding
 * `<h{level} id="...">` element — there is no second, independent id path.
 */
export interface Heading {
  level: number;
  text: string;
  id: string;
}

/**
 * Generate a URL-friendly heading ID from text.
 * Used by the heading renderer as the single source of truth for heading IDs.
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
 * Decode the HTML entities that marked emits when escaping inline content
 * (e.g. inline code containing angle brackets: `<body>` -> `&lt;body&gt;`).
 *
 * Applied to the tag-stripped heading text before it is used for both the
 * TOC display text and the id slug, so that code content like `<body>` is
 * preserved in the TOC instead of being dropped, and the id becomes a clean
 * slug ("body") rather than a mangled one ("ltbodygt").
 *
 * `&amp;` is decoded LAST to avoid double-decoding (so "&amp;lt;" does not
 * turn into "<").
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 * Create a heading renderer extension that assigns id attributes AND collects
 * the heading list for the table of contents in the same pass.
 *
 * This is the single source of truth for heading IDs: the id written to the
 * `<h{depth} id="...">` element and the id pushed into `headings` are produced
 * by the exact same code, so the TOC can never disagree with the DOM anchors.
 *
 * The duplicate-ID counter and the collected headings array are per-instance
 * closure state. A FRESH extension (and Marked instance) is created for every
 * markdownToHtml() call, so this state is never shared across concurrent
 * parses — see createMarkedInstance() / markdownToHtml().
 */
function createHeadingExtension(): {
  extension: MarkedExtension;
  getHeadings: () => Heading[];
} {
  const idCount = new Map<string, number>();
  const headings: Heading[] = [];

  const getHeadings = () => headings;

  const extension: MarkedExtension = {
    renderer: {
      heading({ tokens, depth }: Tokens.Heading) {
        // Use the built-in parser to render inline tokens to HTML.
        // This preserves marked's default HTML escaping behavior.
        const inner = this.parser.parseInline(tokens);
        // Strip HTML tags, then decode the entities marked produced so that
        // inline code content (e.g. `<body>`) survives in both text and id.
        // Trim surrounding whitespace left behind by removed tags (e.g. images).
        const text = decodeHtmlEntities(inner.replace(/<[^>]*>/g, "")).trim();
        const baseId = generateHeadingId(text);
        const count = idCount.get(baseId) || 0;
        idCount.set(baseId, count + 1);
        const id = count === 0 ? baseId : `${baseId}-${count}`;
        headings.push({ level: depth, text, id });
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
      },
    },
  };

  return { extension, getHeadings };
}

/**
 * Build a fresh Marked instance with code/highlight, heading, and alert
 * extensions, plus a getter for the headings that instance collects.
 *
 * A NEW instance is created per markdownToHtml() call rather than reusing a
 * module-level singleton. The heading extension carries mutable per-parse state
 * (the duplicate-ID counter and the collected headings), and markdownToHtml()
 * awaits Shiki between reset and collection. A shared instance would let two
 * concurrent parses push into the same arrays and return {html, headings} that
 * disagree — a real risk because getBlogPostBySlug() is not deduped and Next.js
 * runs generateMetadata, the page body and opengraph-image concurrently for the
 * same slug. Per-call instances isolate this state structurally.
 *
 * This is cheap: Shiki's highlighter is globally cached in highlight.ts and
 * codeExtension's cache is a per-token WeakMap, so nothing heavy is rebuilt.
 * markedAlert() is included to support GFM Alert syntax (> [!NOTE], etc.).
 */
function createMarkedInstance(): {
  instance: Marked;
  getHeadings: () => Heading[];
} {
  const { extension: headingExtension, getHeadings } = createHeadingExtension();
  const instance = new Marked(codeExtension, headingExtension, markedAlert());
  return { instance, getHeadings };
}

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
 * Convert markdown to HTML using the `marked` library, returning both the
 * sanitized HTML and the collected heading list for the table of contents.
 *
 * The headings are gathered by the heading renderer as it assigns element ids,
 * making this the single source of truth: `headings[i].id` is guaranteed to be
 * the id on the matching `<h{level}>` in `html`.
 *
 * Async because Shiki's syntax highlighter is async-initialised once per
 * process. Subsequent calls reuse the cached highlighter, so the per-call
 * cost is just tokenization.
 */
export async function markdownToHtml(
  md: string,
): Promise<{ html: string; headings: Heading[] }> {
  // A fresh Marked instance per call keeps heading-collection state local, so
  // concurrent calls never cross-pollute each other's html/headings.
  const { instance, getHeadings } = createMarkedInstance();
  // `async: true` enables async walkTokens (used by codeExtension to call Shiki).
  const result = await instance.parse(md, {
    gfm: true,
    breaks: false,
    async: true,
  });
  // Sanitize to strip dangerous tags/attributes (XSS prevention)
  const html = sanitize(result);
  return { html, headings: getHeadings() };
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
