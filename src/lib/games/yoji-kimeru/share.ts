import type { CharFeedback, YojiGameState } from "./types";

// Re-export shared utilities for backward compatibility
export { copyToClipboard, generateTwitterShareUrl } from "../shared/share";

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
