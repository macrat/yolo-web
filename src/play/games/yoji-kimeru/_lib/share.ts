import type { CharFeedback, Difficulty, YojiGameState } from "./types";

/** Map difficulty to a Japanese label for share text. */
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

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
 *   四字キメル #42 (中級) 3/6
 *   🟩⬜🟨🟩
 *   🟩🟩🟨🟩
 *   🟩🟩🟩🟩
 *   #四字キメル #yolosnet
 *   https://.../play/yoji-kimeru
 */
export function generateShareText(
  state: YojiGameState,
  difficulty: Difficulty,
): string {
  const result = state.status === "won" ? `${state.guesses.length}/6` : "X/6";
  const diffLabel = DIFFICULTY_LABELS[difficulty];

  const rows = state.guesses.map((g) =>
    g.charFeedbacks.map(charFeedbackToEmoji).join(""),
  );

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${baseUrl}/play/yoji-kimeru`;

  return `\u56DB\u5B57\u30AD\u30E1\u30EB #${state.puzzleNumber} (${diffLabel}) ${result}\n${rows.join("\n")}\n#\u56DB\u5B57\u30AD\u30E1\u30EB #yolosnet\n${url}`;
}
