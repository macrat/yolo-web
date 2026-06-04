import { diffLines, diffWords, diffChars, type Change } from "diff";

export type DiffMode = "line" | "word" | "char";

export interface DiffPart {
  value: string;
  added: boolean;
  removed: boolean;
  /** diff ライブラリが返す要素数（単語数・文字数・行数）。
   *  word/char モードでの正確なカウント計算に使用（①-2 件数・ラベル一致）。
   *  undefined の場合は value から計算する。 */
  count?: number;
}

export function computeDiff(
  oldText: string,
  newText: string,
  mode: DiffMode,
): DiffPart[] {
  let changes: Change[];
  switch (mode) {
    case "line":
      changes = diffLines(oldText, newText);
      break;
    case "word":
      changes = diffWords(oldText, newText);
      break;
    case "char":
      changes = diffChars(oldText, newText);
      break;
  }

  return changes.map((change) => ({
    value: change.value,
    added: change.added ?? false,
    removed: change.removed ?? false,
    // diff ライブラリの count を保持する（word/char モードの正確なカウントに使用）
    count: change.count,
  }));
}

export function hasDifferences(parts: DiffPart[]): boolean {
  return parts.some((p) => p.added || p.removed);
}
