import type { NakamawakePuzzle, NakamawakeGroup } from "./types";

/**
 * Check if the selected 4 words form a complete group.
 * Returns the matching group if found, null otherwise.
 */
export function checkGuess(
  selectedWords: string[],
  puzzle: NakamawakePuzzle,
  solvedGroups: NakamawakeGroup[],
): NakamawakeGroup | null {
  if (selectedWords.length !== 4) return null;
  const sorted = [...selectedWords].sort();

  for (const group of puzzle.groups) {
    // Skip already-solved groups
    if (solvedGroups.some((sg) => sg.name === group.name)) continue;

    const groupSorted = [...group.words].sort();
    if (
      sorted.length === groupSorted.length &&
      sorted.every((w, i) => w === groupSorted[i])
    ) {
      return group;
    }
  }
  return null;
}

/**
 * Check if selected words are "one away" from any unsolved group.
 * Returns true if exactly 3 of 4 selected words belong to the same group.
 */
export function isOneAway(
  selectedWords: string[],
  puzzle: NakamawakePuzzle,
  solvedGroups: NakamawakeGroup[],
): boolean {
  if (selectedWords.length !== 4) return false;

  for (const group of puzzle.groups) {
    if (solvedGroups.some((sg) => sg.name === group.name)) continue;
    const overlap = selectedWords.filter((w) => group.words.includes(w));
    if (overlap.length === 3) return true;
  }
  return false;
}

/**
 * Shuffle an array (Fisher-Yates) and return a new array.
 */
export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get all 16 words from a puzzle in a flat array.
 */
export function getAllWords(puzzle: NakamawakePuzzle): string[] {
  return puzzle.groups.flatMap((g) => g.words);
}

/**
 * 組の難易度を言う字（「難易度1」〜「難易度4」）。凡例・当てた組・結果・共有の文で同じ数を使う。
 */
export function difficultyLabel(
  difficulty: NakamawakeGroup["difficulty"],
): string {
  return `難易度${difficulty}`;
}
