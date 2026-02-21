import type { FeedbackLevel, GameState } from "./types";

/**
 * Map a FeedbackLevel to its emoji representation.
 */
function feedbackToEmoji(level: FeedbackLevel): string {
  switch (level) {
    case "correct":
      return "\u{1F7E9}"; // green square
    case "close":
      return "\u{1F7E8}"; // yellow square
    case "wrong":
      return "\u2B1C"; // white square
  }
}

/**
 * Generate the share text for a completed game.
 *
 * Format:
 *   漢字カナール #42 3/6
 *   🟩⬜🟨🟩⬜
 *   🟩🟩🟨🟩🟨
 *   🟩🟩🟩🟩🟩
 *   https://...
 *
 * Column order: 部首 | 画数 | 学年 | 音読み | 意味
 */
export function generateShareText(state: GameState): string {
  const result = state.status === "won" ? `${state.guesses.length}/6` : "X/6";

  const rows = state.guesses.map((g) =>
    [g.radical, g.strokeCount, g.grade, g.onYomi, g.category]
      .map(feedbackToEmoji)
      .join(""),
  );

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${baseUrl}/games/kanji-kanaru`;

  return `\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB #${state.puzzleNumber} ${result}\n${rows.join("\n")}\n${url}`;
}

/**
 * Copy text to the clipboard using the Clipboard API.
 * Returns true if successful, false otherwise.
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
    // Remove the pageUrl from the text if it appears at the end
    const textWithoutUrl = text.replace(
      new RegExp(`\\n?${escapeRegExp(pageUrl)}$`),
      "",
    );
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(textWithoutUrl)}&url=${encodeURIComponent(pageUrl)}`;
  }
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
