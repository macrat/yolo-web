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
};

/** Quiz metadata used in the registry */
export interface QuizMeta {
  slug: string;
  title: string;
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
