import { diffLines, diffWords, diffChars, type Change } from "diff";

export type DiffMode = "line" | "word" | "char";

export interface DiffPart {
  value: string;
  added: boolean;
  removed: boolean;
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
  }));
}

export function hasDifferences(parts: DiffPart[]): boolean {
  return parts.some((p) => p.added || p.removed);
}
