/**
 * Color represented in HSL values.
 * h: 0-360, s: 0-100, l: 0-100
 */
export interface IrodoriColor {
  h: number;
  s: number;
  l: number;
  hex: string;
  /** Set only when the target is a traditional color. */
  name?: string;
  /** Slug for linking to the traditional color dictionary page. */
  slug?: string;
}

export interface IrodoriRound {
  target: IrodoriColor;
  answer: { h: number; s: number; l: number } | null;
  deltaE: number | null;
  score: number | null;
}

export interface IrodoriGameState {
  puzzleDate: string;
  puzzleNumber: number;
  rounds: IrodoriRound[];
  currentRound: number; // 0-4
  status: "playing" | "completed";
  /** Deterministic initial slider values for each round (h, s, l). */
  initialSliderValues: Array<{ h: number; s: number; l: number }>;
}

export interface IrodoriScheduleEntry {
  date: string;
  /**
   * Array of 5 color indices.
   * Non-negative: index into traditional-colors.json
   * Negative: flag for deterministic random color generation
   */
  colorIndices: number[];
}

export interface IrodoriGameStats {
  gamesPlayed: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string | null;
  /** Distribution buckets: [0-9, 10-19, 20-29, ..., 90-100] */
  scoreDistribution: number[];
}

export interface IrodoriGameHistory {
  [date: string]: {
    scores: number[];
    totalScore: number;
  };
}
