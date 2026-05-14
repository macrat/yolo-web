/**
 * Build-time syntax highlighter for markdown code blocks.
 *
 * Uses Shiki's `bundle/full` pack — every language Shiki ships is available
 * without a manual allow-list, so writers can use any fenced code language
 * (`go`, `rust`, `ruby`, ...) and it just works. Shiki is server-only here:
 * the highlighter and grammars never end up in the client JS bundle, so the
 * download cost to visitors is zero. The cost is paid in build artifact
 * size (within `.next/server/`), which we accept in exchange for removing
 * the maintenance burden of keeping a manual language list in sync with
 * what blog authors actually write.
 *
 * Dual-theme output:
 *   The light theme's colors are baked into inline `color` / `background-color`
 *   declarations, and the dark theme's colors are stored alongside as
 *   `--shiki-dark` / `--shiki-dark-bg` CSS variables. The blog page CSS swaps
 *   them in via `:root.dark .shiki { color: var(--shiki-dark) !important; }`.
 *
 * Async lazy init:
 *   Shiki's `createHighlighter` is async. Importing this module doesn't
 *   trigger highlighter creation — that only happens on first `highlight()`
 *   call. This matters because the prebuild search-index script transitively
 *   imports `blog.ts → markdown.ts → highlight.ts` in tsx's CJS loader,
 *   which would otherwise reject top-level await.
 */

import type { Highlighter } from "shiki/bundle/full";

let highlighterPromise: Promise<Highlighter> | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const { createHighlighter, bundledLanguages } =
        await import("shiki/bundle/full");
      return createHighlighter({
        themes: ["vitesse-light", "vitesse-dark"],
        langs: Object.keys(bundledLanguages),
      });
    })();
  }
  return highlighterPromise;
}

/**
 * Highlight a code string and return Shiki's dual-theme HTML.
 *
 * Unknown / unsupported `lang` values fall back to `text` so the code is
 * still safely HTML-escaped without throwing.
 */
export async function highlight(code: string, lang?: string): Promise<string> {
  const highlighter = await getHighlighter();
  const normalized = (lang || "").toLowerCase().trim();
  const loaded = new Set([
    ...highlighter.getLoadedLanguages(),
    // Shiki's "special" plaintext IDs are always accepted but not listed above.
    "text",
    "plain",
    "plaintext",
    "txt",
  ]);
  const useLang = loaded.has(normalized) ? normalized : "text";

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
