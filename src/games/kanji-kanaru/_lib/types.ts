export interface KanjiEntry {
  character: string;
  radical: string;
  radicalGroup: number;
  strokeCount: number;
  grade: number; // 1-6, 7=secondary
  onYomi: string[];
  kunYomi: string[];
  meanings: string[];
  category: RadicalGroup;
  examples: string[];
}

/** Radical group ID (1-20), used for category-based feedback. */
export type RadicalGroup = number;

/** Difficulty level for the game. */
export type Difficulty = "beginner" | "intermediate" | "advanced";

/** Maximum grade included for each difficulty level. */
export const DIFFICULTY_GRADE_MAX: Record<Difficulty, number> = {
  beginner: 2,
  intermediate: 6,
  advanced: 7,
};

export type FeedbackLevel = "correct" | "close" | "wrong";

export interface GuessFeedback {
  guess: string;
  radical: FeedbackLevel;
  strokeCount: FeedbackLevel;
  grade: FeedbackLevel;
  gradeDirection: "up" | "down" | "equal";
  onYomi: FeedbackLevel;
  category: FeedbackLevel;
  kunYomiCount: FeedbackLevel;
}

export interface GameState {
  puzzleDate: string; // "YYYY-MM-DD"
  puzzleNumber: number;
  targetKanji: KanjiEntry | null;
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
    feedbacks?: GuessFeedback[];
    status: "won" | "lost" | "playing";
    guessCount: number;
  };
}

export interface PuzzleScheduleEntry {
  date: string;
  kanjiIndex: number;
}

/** Maximum number of guesses allowed per game. */
export const MAX_GUESSES = 6;

/** Request body for POST /api/kanji-kanaru/evaluate */
export interface EvaluateRequest {
  guess: string;
  puzzleDate: string;
  difficulty: Difficulty;
  guessNumber: number;
}

/** Response from POST /api/kanji-kanaru/evaluate */
export interface EvaluateResponse {
  feedback: GuessFeedback;
  isCorrect: boolean;
  targetKanji?: {
    character: string;
    onYomi: string[];
    kunYomi: string[];
    meanings: string[];
    examples: string[];
  };
}

/** Response from GET /api/kanji-kanaru/hints */
export interface HintsResponse {
  puzzleNumber: number;
  hints: {
    strokeCount: number;
    onYomiCount: number;
    kunYomiCount: number;
  };
}
