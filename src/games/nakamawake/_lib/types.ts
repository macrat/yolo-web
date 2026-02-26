export interface NakamawakeGroup {
  name: string; // Group theme name in Japanese
  words: string[]; // Exactly 4 words
  difficulty: 1 | 2 | 3 | 4; // 1=yellow(easy), 2=green, 3=blue, 4=purple(hard)
}

export interface NakamawakePuzzle {
  groups: [NakamawakeGroup, NakamawakeGroup, NakamawakeGroup, NakamawakeGroup];
}

export interface NakamawakeScheduleEntry {
  date: string; // "YYYY-MM-DD"
  puzzleIndex: number; // index into puzzle data array
}

export type GroupResult = "correct" | "incorrect";

export interface NakamawakeGameState {
  puzzleDate: string;
  puzzleNumber: number;
  puzzle: NakamawakePuzzle;
  solvedGroups: NakamawakeGroup[]; // Groups that have been correctly guessed
  mistakes: number; // Max 4
  status: "playing" | "won" | "lost";
  selectedWords: string[]; // Currently selected words (0-4)
  remainingWords: string[]; // Words not yet in a solved group
  guessHistory: { words: string[]; correct: boolean }[]; // All guess attempts
}

export interface NakamawakeGameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  mistakeDistribution: number[]; // [0mistakes, 1mistake, 2mistakes, 3mistakes, 4mistakes]
  lastPlayedDate: string | null;
}

export interface NakamawakeGameHistory {
  [date: string]: {
    solvedGroups: number[]; // difficulty levels in order solved
    mistakes: number;
    status: "won" | "lost";
  };
}
