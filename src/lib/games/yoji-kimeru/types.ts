export interface YojiEntry {
  yoji: string; // 四字熟語 (例: "一期一会")
  reading: string; // 読み (例: "いちごいちえ")
  meaning: string; // 意味 (例: "一生に一度の出会いを大切にすること")
  difficulty: number; // 難易度 1-3 (1=基本, 2=中級, 3=上級)
  category: YojiCategory; // 意味カテゴリ
}

export type YojiCategory =
  | "life" // 人生・生き方
  | "effort" // 努力・根性
  | "nature" // 自然・風景
  | "emotion" // 感情・心理
  | "society" // 社会・人間関係
  | "knowledge" // 知識・学問
  | "conflict" // 対立・戦い
  | "change" // 変化・転換
  | "virtue" // 道徳・美徳
  | "negative"; // 否定的・戒め

// Wordle型フィードバック: 各文字の位置判定
export type CharFeedback = "correct" | "present" | "absent";

export interface YojiGuessFeedback {
  guess: string; // 推測した四字熟語 (4文字)
  charFeedbacks: [CharFeedback, CharFeedback, CharFeedback, CharFeedback];
}

export interface YojiGameState {
  puzzleDate: string; // "YYYY-MM-DD"
  puzzleNumber: number;
  targetYoji: YojiEntry;
  guesses: YojiGuessFeedback[];
  status: "playing" | "won" | "lost";
}

export interface YojiGameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: [number, number, number, number, number, number];
  lastPlayedDate: string | null;
}

export interface YojiGameHistory {
  [date: string]: {
    guesses: string[]; // 各推測の4文字文字列
    status: "won" | "lost";
    guessCount: number;
  };
}

export interface YojiPuzzleScheduleEntry {
  date: string;
  yojiIndex: number;
}
