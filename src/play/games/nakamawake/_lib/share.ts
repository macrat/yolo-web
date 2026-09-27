import type { NakamawakeGameState } from "./types";

/**
 * 解き終えた回の共有の文。当てた組を当てた順に1行ずつ、その4語が属する組の難易度の数（画面の「難易度1」〜
 * 「難易度4」と同じ数）を空白でつないで並べる。答えの語を明かさずに、どの順に解いたかを見せる。
 * ページの URL は文に入れず、ShareButtons が共有先ごとの形で付ける。
 *
 * 例:
 *   ナカマワケ #42 ミス2回
 *   1 1 1 1
 *   3 3 3 3
 *   2 2 2 2
 *   4 4 4 4
 *   #ナカマワケ #yolosnet
 */
export function generateShareText(state: NakamawakeGameState): string {
  const result =
    state.status === "won"
      ? state.mistakes === 0
        ? "パーフェクト!"
        : `ミス${state.mistakes}回`
      : "X";

  const rows = state.guessHistory
    .filter((guess) => guess.correct)
    .map((guess) => {
      const group = state.puzzle.groups.find((candidate) =>
        guess.words.every((word) => candidate.words.includes(word)),
      );
      return group ? Array(4).fill(group.difficulty).join(" ") : "";
    })
    .filter(Boolean);

  return [
    `ナカマワケ #${state.puzzleNumber} ${result}`,
    ...rows,
    "#ナカマワケ #yolosnet",
  ].join("\n");
}
