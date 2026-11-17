import type { Difficulty, YojiGameState } from "./types";
import { difficultyNames } from "./constants";
import { FEEDBACK_MARKS } from "./feedbackMarks";

/**
 * 解き終えた回の共有の文。推測ごとに1行、盤と同じ印（◯・△・×）を並べ、答えを明かさずにどう解いたかを
 * 見せる。ページの URL は含めない（共有先ごとの形で ShareButtons が付ける）。
 *
 *   四字キメル #42 (中級) 3/6
 *   ◯×△◯
 *   ◯◯△◯
 *   ◯◯◯◯
 *   #四字キメル #yolosnet
 */
export function generateShareText(
  state: YojiGameState,
  difficulty: Difficulty,
): string {
  const result = state.status === "won" ? `${state.guesses.length}/6` : "X/6";
  const rows = state.guesses.map((g) =>
    g.charFeedbacks.map((feedback) => FEEDBACK_MARKS[feedback].mark).join(""),
  );
  return [
    `四字キメル #${state.puzzleNumber} (${difficultyNames[difficulty]}) ${result}`,
    ...rows,
    "#四字キメル #yolosnet",
  ].join("\n");
}
