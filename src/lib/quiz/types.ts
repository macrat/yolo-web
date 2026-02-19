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
export type QuizMeta = {
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  type: QuizType;
  questionCount: number;
  icon: string;
  accentColor: string;
  keywords: string[];
  publishedAt: string;
  relatedLinks?: Array<{ label: string; href: string }>;
};

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
