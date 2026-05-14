/**
 * Build-time syntax highlighter for markdown code blocks.
 *
 * Uses Shiki's synchronous core API (`createHighlighterCoreSync`) with the
 * JavaScript RegExp engine so highlighting can run inside marked's synchronous
 * renderer pipeline without making `markdownToHtml` async. All themes and
 * grammars are bundled at build time, so the resulting HTML ships fully
 * styled and the client never re-highlights (= no FOUC / color flicker).
 *
 * Dual-theme output:
 *   The light theme's colors are baked into inline `color` / `background-color`
 *   declarations, and the dark theme's colors are stored alongside as
 *   `--shiki-dark` / `--shiki-dark-bg` CSS variables. The blog page CSS swaps
 *   them in via `:root.dark .shiki { color: var(--shiki-dark) !important; }`.
 */

import { createHighlighterCoreSync, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

import vitesseLight from "@shikijs/themes/vitesse-light";
import vitesseDark from "@shikijs/themes/vitesse-dark";

import bash from "@shikijs/langs/bash";
import css from "@shikijs/langs/css";
import diff from "@shikijs/langs/diff";
import html from "@shikijs/langs/html";
import http from "@shikijs/langs/http";
import javascript from "@shikijs/langs/javascript";
import json from "@shikijs/langs/json";
import jsonc from "@shikijs/langs/jsonc";
import jsonl from "@shikijs/langs/jsonl";
import jsx from "@shikijs/langs/jsx";
import markdown from "@shikijs/langs/markdown";
import python from "@shikijs/langs/python";
import sql from "@shikijs/langs/sql";
import tsx from "@shikijs/langs/tsx";
import typescript from "@shikijs/langs/typescript";
import yaml from "@shikijs/langs/yaml";

/**
 * Languages bundled for highlighting. Matches what blog markdown actually uses
 * (`grep -h '^```[a-z]' src/blog/content/*.md | sort -u`). Each grammar can also
 * be referenced via Shiki's built-in aliases (e.g. `js`→`javascript`,
 * `ts`→`typescript`). `mermaid` is intentionally excluded — the mermaid marked
 * extension handles those blocks before they reach this highlighter.
 */
const SUPPORTED_LANGS: ReadonlySet<string> = new Set([
  "bash",
  "css",
  "diff",
  "html",
  "http",
  "javascript",
  "js",
  "json",
  "jsonc",
  "jsonl",
  "jsx",
  "markdown",
  "md",
  "python",
  "py",
  "sql",
  "tsx",
  "ts",
  "typescript",
  "yaml",
  "yml",
  // Shiki's special "no highlight" languages — bypass tokenization but still escape.
  "text",
  "plain",
  "plaintext",
  "txt",
]);

const highlighter: HighlighterCore = createHighlighterCoreSync({
  themes: [vitesseLight, vitesseDark],
  langs: [
    bash,
    css,
    diff,
    html,
    http,
    javascript,
    json,
    jsonc,
    jsonl,
    jsx,
    markdown,
    python,
    sql,
    tsx,
    typescript,
    yaml,
  ],
  engine: createJavaScriptRegexEngine(),
});

/**
 * Highlight a code string and return Shiki's dual-theme HTML.
 *
 * Unknown / unsupported `lang` values fall back to `text` so the code is
 * still safely HTML-escaped without throwing.
 */
export function highlight(code: string, lang?: string): string {
  const normalized = (lang || "").toLowerCase().trim();
  const useLang = SUPPORTED_LANGS.has(normalized) ? normalized : "text";

  return highlighter.codeToHtml(code, {
    lang: useLang,
    themes: {
      light: "vitesse-light",
      dark: "vitesse-dark",
    },
    // Light is the "default" — its colors go into plain `color` properties.
    // Dark goes into `--shiki-dark` CSS variables, swapped in by .dark CSS.
    defaultColor: "light",
  });
}
