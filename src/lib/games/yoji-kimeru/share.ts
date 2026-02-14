import type { CharFeedback, YojiGameState } from "./types";

/**
 * Map a CharFeedback to its emoji representation.
 */
function charFeedbackToEmoji(fb: CharFeedback): string {
  switch (fb) {
    case "correct":
      return "\u{1F7E9}"; // green square
    case "present":
      return "\u{1F7E8}"; // yellow square
    case "absent":
      return "\u2B1C"; // white square
  }
}

/**
 * Generate the share text for a completed game.
 *
 * Format:
 *   四字キメル #42 3/6
 *   🟩⬜🟨🟩
 *   🟩🟩🟨🟩
 *   🟩🟩🟩🟩
 *   https://.../games/yoji-kimeru
 */
export function generateShareText(state: YojiGameState): string {
  const result = state.status === "won" ? `${state.guesses.length}/6` : "X/6";

  const rows = state.guesses.map((g) =>
    g.charFeedbacks.map(charFeedbackToEmoji).join(""),
  );

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${baseUrl}/games/yoji-kimeru`;

  return `\u56DB\u5B57\u30AD\u30E1\u30EB #${state.puzzleNumber} ${result}\n${rows.join("\n")}\n${url}`;
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
 */
export function generateTwitterShareUrl(text: string): string {
  const encoded = encodeURIComponent(text);
  return `https://twitter.com/intent/tweet?text=${encoded}`;
}
