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
