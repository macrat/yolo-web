"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Data attribute used to store the original Mermaid source code.
 * mermaid.run() replaces the element's textContent with rendered SVG,
 * so we need to preserve the source for re-rendering on theme change.
 */
const ORIGINAL_CODE_ATTR = "data-original-code";

/** The site follows the device's color scheme (DESIGN.md §10). */
const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

function subscribeColorScheme(callback: () => void): () => void {
  const mq = window.matchMedia(DARK_SCHEME_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getIsDarkSnapshot(): boolean {
  return window.matchMedia(DARK_SCHEME_QUERY).matches;
}

// Diagrams render only on the client; this value only serves hydration.
function getIsDarkServerSnapshot(): boolean {
  return false;
}

/**
 * Client component that initializes Mermaid.js and renders
 * all `.mermaid` elements found on the page.
 *
 * Must be included in pages that may contain mermaid diagrams.
 * Uses dynamic import to avoid loading mermaid in SSR.
 *
 * When the device's color scheme changes, diagrams are re-rendered
 * with the appropriate Mermaid theme by restoring the original source
 * code and clearing the `data-processed` attribute.
 */
export default function MermaidRenderer() {
  const isDark = useSyncExternalStore(
    subscribeColorScheme,
    getIsDarkSnapshot,
    getIsDarkServerSnapshot,
  );

  useEffect(() => {
    const mermaidElements = document.querySelectorAll<HTMLElement>(".mermaid");
    if (mermaidElements.length === 0) return;

    // Preserve original source code before first render so we can
    // restore it when the theme changes (mermaid replaces textContent
    // with rendered SVG and marks elements as data-processed).
    mermaidElements.forEach((el) => {
      if (!el.getAttribute(ORIGINAL_CODE_ATTR)) {
        el.setAttribute(ORIGINAL_CODE_ATTR, el.textContent ?? "");
      }
    });

    let cancelled = false;

    async function renderDiagrams() {
      const mermaid = (await import("mermaid")).default;

      if (cancelled) return;

      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? "dark" : "default",
        fontFamily: "inherit",
      });

      // Restore original source and clear processed flag so
      // mermaid.run() will re-render with the new theme settings.
      mermaidElements.forEach((el) => {
        const code = el.getAttribute(ORIGINAL_CODE_ATTR);
        if (code) {
          el.removeAttribute("data-processed");
          el.textContent = code;
        }
      });

      await mermaid.run({ nodes: mermaidElements });
    }

    renderDiagrams();

    return () => {
      cancelled = true;
    };
  }, [isDark]);

  return null;
}
