"use client";

import { useEffect } from "react";

/**
 * Client component that initializes Mermaid.js and renders
 * all `.mermaid` elements found on the page.
 *
 * Must be included in pages that may contain mermaid diagrams.
 * Uses dynamic import to avoid loading mermaid in SSR.
 */
export default function MermaidRenderer() {
  useEffect(() => {
    const mermaidElements = document.querySelectorAll<HTMLElement>(".mermaid");
    if (mermaidElements.length === 0) return;

    let cancelled = false;

    async function renderDiagrams() {
      const mermaid = (await import("mermaid")).default;

      if (cancelled) return;

      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? "dark" : "default",
        fontFamily: "inherit",
      });

      // mermaid.run() renders all elements matching the selector
      await mermaid.run({ nodes: mermaidElements });
    }

    renderDiagrams();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
