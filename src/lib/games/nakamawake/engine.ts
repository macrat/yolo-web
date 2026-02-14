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
 * Get the difficulty color name for a group.
 */
export function getDifficultyColor(difficulty: 1 | 2 | 3 | 4): string {
  switch (difficulty) {
    case 1:
      return "yellow";
    case 2:
      return "green";
    case 3:
      return "blue";
    case 4:
      return "purple";
  }
}

/**
 * Get the difficulty emoji for sharing.
 */
export function getDifficultyEmoji(difficulty: 1 | 2 | 3 | 4): string {
  switch (difficulty) {
    case 1:
      return "\u{1F7E8}"; // yellow
    case 2:
      return "\u{1F7E9}"; // green
    case 3:
      return "\u{1F7E6}"; // blue
    case 4:
      return "\u{1F7EA}"; // purple
  }
}
