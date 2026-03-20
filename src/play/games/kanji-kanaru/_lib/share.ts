import type { Difficulty, FeedbackLevel, GameState } from "./types";

/** Japanese display labels for each difficulty. */
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "\u521D\u7D1A",
  intermediate: "\u4E2D\u7D1A",
  advanced: "\u4E0A\u7D1A",
};

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
 *   漢字カナール #42 (中級) 3/6
 *   🟩⬜🟨🟩⬜🟩
 *   🟩🟩🟨🟩🟨🟩
 *   🟩🟩🟩🟩🟩🟩
 *   #漢字カナール #yolosnet
 *   https://...
 *
 * Column order (6 columns): 部首 | 画数 | 学年 | 音読み | 意味 | 訓読み数
 * Note: gradeDirection is NOT included in the emoji grid.
 */
export function generateShareText(
  state: GameState,
  difficulty: Difficulty = "intermediate",
): string {
  const result = state.status === "won" ? `${state.guesses.length}/6` : "X/6";
  const diffLabel = DIFFICULTY_LABELS[difficulty];

  const rows = state.guesses.map((g) =>
    [g.radical, g.strokeCount, g.grade, g.onYomi, g.category, g.kunYomiCount]
      .map(feedbackToEmoji)
      .join(""),
  );

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${baseUrl}/play/kanji-kanaru`;

  return `\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB #${state.puzzleNumber} (${diffLabel}) ${result}\n${rows.join("\n")}\n#\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB #yolosnet\n${url}`;
}
