import type { NakamawakeGameState } from "./types";

/**
 * 解き終えた回の共有の文。1行目は画面の結果の見出しと同じ語で言い、次の行に、当てた組の難易度の数（画面の
 * 「難易度1」〜「難易度4」と同じ数）を当てた順に並べる。答えの語を明かさずに、どの順に解いたかを見せる。
 * 当てた組が無い回は、並びの行を持たない。ページの URL は文に入れず、ShareButtons が共有先ごとの形で付ける。
 *
 * 例:
 *   ナカマワケ #42 4組すべて正解（間違い2回）
 *   当てた順（難易度）: 1→3→2→4
 *   #ナカマワケ #yolosnet
 */
export function generateShareText(state: NakamawakeGameState): string {
  const result =
    state.status === "won"
      ? `4組すべて正解（間違い${state.mistakes}回）`
      : `4回間違えて終了（${state.solvedGroups.length}組正解）`;
  const order = state.solvedGroups.map((group) => group.difficulty).join("→");

  return [
    `ナカマワケ #${state.puzzleNumber} ${result}`,
    ...(order ? [`当てた順（難易度）: ${order}`] : []),
    "#ナカマワケ #yolosnet",
  ].join("\n");
}
