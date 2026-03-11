/** 難易度レベル: ゲームの難易度選択に使用 */
export type Difficulty = "beginner" | "intermediate" | "advanced";

/** 出典区分: 四字熟語の由来を分類する */
export type YojiOrigin =
  | "漢籍"
  | "仏典"
  | "日本語由来"
  | "故事"
  | "その他"
  | "不明";

/** 構造パターン: 四字熟語の内部構造を分類する */
export type YojiStructure =
  | "対義"
  | "類義"
  | "因果"
  | "修飾"
  | "並列"
  | "主述"
  | "その他"
  | "不明";

export interface YojiEntry {
  yoji: string; // 四字熟語 (例: "一期一会")
  reading: string; // 読み (例: "いちごいちえ")
  meaning: string; // 意味 (例: "一生に一度の出会いを大切にすること")
  difficulty: number; // 難易度 1-3 (1=基本, 2=中級, 3=上級)
  category: YojiCategory; // 意味カテゴリ
  origin: YojiOrigin; // 出典区分
  structure: YojiStructure; // 構造パターン
  sourceUrl: string; // 出典辞書URL（検証・説明充実用）
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
    status: "won" | "lost" | "playing";
    guessCount: number;
  };
}

/** Maximum number of guesses allowed per game. */
export const MAX_GUESSES = 6;

export interface YojiPuzzleScheduleEntry {
  date: string;
  yojiIndex: number;
}
