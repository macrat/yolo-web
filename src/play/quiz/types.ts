import type { TrustLevel } from "@/lib/trust-levels";

/** Quiz type: knowledge test or personality diagnosis */
export type QuizType = "knowledge" | "personality";

/** A single choice within a question */
export type QuizChoice = {
  id: string;
  text: string;
  /** personality type: point map for result types */
  points?: Record<string, number>;
  /** knowledge type: whether this choice is correct */
  isCorrect?: boolean;
};

/** A single question */
export type QuizQuestion = {
  id: string;
  text: string;
  choices: QuizChoice[];
  /** knowledge type: explanation shown after answering */
  explanation?: string;
};

/**
 * 結果ページに表示する追加コンテンツセクション（標準形式）。
 * personalityカテゴリのクイズ結果で「わかる!」「シェアしたい」感を高めるために使用する。
 * knowledgeカテゴリ（スコアベース）には使用しない。
 */
export interface QuizResultDetailedContent {
  /**
   * バリアント識別子。ContrarianFortuneDetailedContent との union型で
   * 型の絞り込みに使用する。標準形式では常に undefined。
   */
  variant?: undefined;
  /** あなたの特徴（箇条書き3-5項目、各1-2文） */
  traits: string[];
  /** あるある・日常での行動パターン（箇条書き3-5項目、共感を呼ぶ具体的シーン） */
  behaviors: string[];
  /** ひとことアドバイスまたはメッセージ（ポジティブな1-2文） */
  advice: string;
}

/**
 * contrarian-fortune クイズ専用の追加コンテンツセクション。
 * 逆張り占い系クイズの結果ページで笑えるトーンのタイプ解説を提供する。
 * variant フィールドで QuizResultDetailedContent と区別する。
 */
export interface ContrarianFortuneDetailedContent {
  /** バリアント識別子。型の絞り込みに使用する。 */
  variant: "contrarian-fortune";
  /** タイプのキャッチコピー（一行、10-50字） */
  catchphrase: string;
  /** 逆張りコンセプトの核心を伝える1-2文（20-100字） */
  coreSentence: string;
  /** あるある箇条書き（3-5項目、具体的シーンで笑えるトーン） */
  behaviors: string[];
  /** タイプの人物像（散文150-250字、内面・動機の解説、ユーモアトーンの締め含む） */
  persona: string;
  /** 「このタイプの人と一緒にいると」第三者視点のシーン描写（散文） */
  thirdPartyNote: string;
  /** タイプ固有の笑い指標（省略可、面白い指標が作れるタイプのみ） */
  humorMetrics?: Array<{ label: string; value: string }>;
}

/**
 * detailedContent の union型。
 * variant フィールドで型を絞り込む discriminated union。
 * - variant が undefined または未設定: QuizResultDetailedContent（標準形式）
 * - variant が "contrarian-fortune": ContrarianFortuneDetailedContent
 */
export type DetailedContent =
  | QuizResultDetailedContent
  | ContrarianFortuneDetailedContent;

/** A result pattern */
export type QuizResult = {
  /** URL-safe ID (e.g. 'master', 'ai-iro') */
  id: string;
  title: string;
  description: string;
  /** Theme color hex (used for personality type) */
  color?: string;
  /** Icon emoji */
  icon?: string;
  /** knowledge type: minimum score to get this result */
  minScore?: number;
  /** Recommendation text for related content */
  recommendation?: string;
  /** Recommendation link URL */
  recommendationLink?: string;
  /**
   * 結果ページに表示する追加コンテンツ（オプショナル）。
   * 設定されている場合のみ結果ページに追加セクションが表示され、SEOインデックス対象になる。
   * personalityカテゴリのクイズのみで使用する。
   * variant フィールドでコンテンツ形式を識別する discriminated union。
   */
  detailedContent?: DetailedContent;
};

/** Quiz metadata used in the registry */
export interface QuizMeta {
  slug: string;
  title: string;
  /**
   * カード表示用の短縮タイトル（全角15文字超のタイトルで使用）。
   * 未設定の場合は title をそのまま使用する。
   */
  shortTitle?: string;
  description: string;
  shortDescription: string;
  type: QuizType;
  /** PlayContentMeta のカテゴリへの変換に使用する明示的フィールド。"knowledge" | "personality" に限定（クイズに fortune は存在しない） */
  category: "knowledge" | "personality";
  questionCount: number;
  icon: string;
  accentColor: string;
  keywords: string[];
  /** ISO 8601 date-time with timezone (e.g. '2026-02-19T09:25:57+09:00') */
  publishedAt: string;
  /** ISO 8601 date-time with timezone. Set when main content is updated. */
  updatedAt?: string;
  relatedLinks?: Array<{ label: string; href: string }>;
  /** Content trust level */
  trustLevel: TrustLevel;
  /** Optional supplementary note about trust level details */
  trustNote?: string;

  /**
   * FAQ: Q&A形式の配列
   * B-024で実装済みのFAQPage JSON-LDのデータソースである。
   * answerはプレーンテキストのみ（HTML・特殊記法不可）。
   */
  faq?: Array<{
    question: string;
    answer: string;
  }>;

  /**
   * 検索エンジン向けの最適化されたページタイトル（オプショナル）。
   * 設定されている場合、generatePlayMetadata で title タグと OG タイトルに使用される。
   * 未設定の場合は title + displayCategory の組み合わせが使用される。
   */
  seoTitle?: string;

  /**
   * 結果ページのセクション見出しをカスタマイズするためのラベル（オプショナル）。
   * 各クイズの世界観に合った見出しを設定することで、第三者向けタイプ解説ページとして
   * より魅力的なコンテンツになる。未設定の場合はデフォルト値が使用される。
   * - traitsHeading デフォルト: 「このタイプの特徴」
   * - behaviorsHeading デフォルト: 「このタイプのあるある」
   * - adviceHeading デフォルト: 「このタイプの人へのアドバイス」
   */
  resultPageLabels?: {
    traitsHeading?: string;
    behaviorsHeading?: string;
    adviceHeading?: string;
  };
}

/** Complete quiz definition including questions and results */
export type QuizDefinition = {
  meta: QuizMeta;
  questions: QuizQuestion[];
  results: QuizResult[];
};

/** User answer for a single question */
export type QuizAnswer = {
  questionId: string;
  choiceId: string;
};

/** Phase of the quiz UI */
export type QuizPhase = "intro" | "playing" | "result";

/** A single compatibility entry between two personality types */
export interface CompatibilityEntry {
  /** Relationship label (e.g. "最強の拡散装置") */
  label: string;
  /** Scenario description text */
  description: string;
}
