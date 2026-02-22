import type { NakamawakeGameState } from "./types";
import { getDifficultyEmoji } from "./engine";

// Re-export shared utilities for backward compatibility
export { copyToClipboard, generateTwitterShareUrl } from "../shared/share";

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
