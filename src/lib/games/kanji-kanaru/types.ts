export interface KanjiEntry {
  character: string;
  radical: string;
  radicalGroup: number;
  strokeCount: number;
  grade: number; // 1-6, 7=secondary, 8=jinmeiyo
  onYomi: string[];
  kunYomi: string[];
  meanings: string[];
  category: SemanticCategory;
  examples: string[];
}

export type SemanticCategory =
  | "nature"
  | "body"
  | "action"
  | "emotion"
  | "number"
  | "time"
  | "direction"
  | "building"
  | "tool"
  | "animal"
  | "plant"
  | "weather"
  | "water"
  | "fire"
  | "earth"
  | "person"
  | "society"
  | "language"
  | "abstract"
  | "measurement";

export type FeedbackLevel = "correct" | "close" | "wrong";

export interface GuessFeedback {
  guess: string;
  radical: FeedbackLevel;
  strokeCount: FeedbackLevel;
  grade: FeedbackLevel;
  onYomi: FeedbackLevel;
  category: FeedbackLevel;
}

export interface GameState {
  puzzleDate: string; // "YYYY-MM-DD"
  puzzleNumber: number;
  targetKanji: KanjiEntry;
  guesses: GuessFeedback[];
  status: "playing" | "won" | "lost";
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: [number, number, number, number, number, number]; // index 0 = solved in 1, etc.
  lastPlayedDate: string | null;
}

export interface GameHistory {
  [date: string]: {
    guesses: string[];
    status: "won" | "lost";
    guessCount: number;
  };
}

export interface PuzzleScheduleEntry {
  date: string;
  kanjiIndex: number;
}
