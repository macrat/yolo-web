import { FEEDBACK_MARKS } from "./marks";
import { DIFFICULTY_LABELS, MAX_GUESSES } from "./types";
import type { Difficulty, GameState } from "./types";

/**
 * 解き終えた回の共有の文。推測ごとに1行、盤と同じ印（◯・△・×）を並べ、答えを明かさずにどう解いたかを
 * 見せる。URL は含めない（共有先ごとの形で ShareButtons が付ける）。
 *
 * 形:
 *   漢字カナール #42 (中級) 3/6
 *   ×◯◯◯△◯
 *   ◯◯△◯△◯
 *   ◯◯◯◯◯◯
 *   #漢字カナール #yolosnet
 *
 * 列の順は盤と同じ（部首・画数・学年・音読み・意味・訓読みの数）。学年の向きは並べない。
 */
export function generateShareText(
  state: GameState,
  difficulty: Difficulty = "intermediate",
): string {
  const result =
    state.status === "won"
      ? `${state.guesses.length}/${MAX_GUESSES}`
      : `X/${MAX_GUESSES}`;

  const rows = state.guesses.map((g) =>
    [g.radical, g.strokeCount, g.grade, g.onYomi, g.category, g.kunYomiCount]
      .map((level) => FEEDBACK_MARKS[level].mark)
      .join(""),
  );

  return `漢字カナール #${state.puzzleNumber} (${DIFFICULTY_LABELS[difficulty]}) ${result}\n${rows.join("\n")}\n#漢字カナール #yolosnet`;
}
