import { difficultyNames } from "./constants";
import type { Difficulty } from "./types";

/**
 * 入力欄の名前（「中級の四字熟語を入力（あと6回）」）を、文節で分けた区切りの並びで返す（DESIGN.md §4 の
 * コントロールの名前の折り方）。差し込む難易度と残りの回数は、それを含む文節に入れ、括弧で添えた回数は
 * 1つの文節にする。
 */
export function guessLabel(
  difficulty: Difficulty,
  remaining: number,
): readonly string[] {
  return [
    `${difficultyNames[difficulty]}の`,
    "四字熟語を",
    "入力",
    `（あと${remaining}回）`,
  ];
}
