/**
 * Shared share utilities for all game modals.
 *
 * Contains clipboard copy, Twitter/X share URL generation, and helpers
 * that were previously duplicated across 4 game-specific share.ts files.
 */

/**
 * Copy text to the clipboard using the Clipboard API.
 * Falls back to a hidden textarea approach when the API is unavailable.
 * Returns true if the copy succeeded, false otherwise.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return fallbackCopy(text);
    }
  }
  return fallbackCopy(text);
}

/**
 * Fallback clipboard copy using a hidden textarea.
 * Used when the Clipboard API is not available.
 */
function fallbackCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

/**
 * Generate a Twitter/X share URL with pre-filled text.
 * Separates the page URL into the `url` parameter so that
 * Twitter/X can generate a proper card preview.
 */
export function generateTwitterShareUrl(
  text: string,
  pageUrl?: string,
): string {
  if (pageUrl) {
    const textWithoutUrl = text.replace(
      new RegExp(`\\n?${escapeRegExp(pageUrl)}$`),
      "",
    );
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(textWithoutUrl)}&url=${encodeURIComponent(pageUrl)}`;
  }
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
