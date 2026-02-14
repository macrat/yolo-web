import type { NakamawakeGameState } from "./types";
import { getDifficultyEmoji } from "./engine";

/**
 * Generate the share text for a completed game.
 *
 * Format:
 *   ナカマワケ #42 ミス2回
 *   🟨🟨🟨🟨
 *   🟩🟩🟩🟩
 *   🟦🟦🟦🟦
 *   🟪🟪🟪🟪
 *   https://.../games/nakamawake
 */
export function generateShareText(state: NakamawakeGameState): string {
  const result =
    state.status === "won"
      ? `${state.mistakes === 0 ? "\u30D1\u30FC\u30D5\u30A7\u30AF\u30C8!" : `\u30DF\u30B9${state.mistakes}\u56DE`}`
      : "X";

  // Show each guess as a row of difficulty emojis
  const rows = state.guessHistory
    .filter((g) => g.correct)
    .map((g) => {
      // Find which group this guess matched
      const group = state.puzzle.groups.find((grp) => {
        const sorted = [...grp.words].sort();
        const gSorted = [...g.words].sort();
        return sorted.every((w, i) => w === gSorted[i]);
      });
      return group ? getDifficultyEmoji(group.difficulty).repeat(4) : "";
    })
    .filter(Boolean);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${baseUrl}/games/nakamawake`;

  return `\u30CA\u30AB\u30DE\u30EF\u30B1 #${state.puzzleNumber} ${result}\n${rows.join("\n")}\n${url}`;
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
