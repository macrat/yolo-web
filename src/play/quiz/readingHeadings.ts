import type { QuizDefinition, QuizMeta } from "./types";

/**
 * 標準の形（variant を持たない）の詳しい読みものの、既定の小見出し。コードに書いた決まった文なので、文節の
 * 区切りも書き手が分けて持つ（PhrasedText の約束）。
 */
const DEFAULT_READING_HEADINGS = {
  traits: ["この", "タイプの", "特徴"],
  behaviors: ["この", "タイプの", "あるある"],
  advice: ["この", "タイプの", "人への", "アドバイス"],
} as const satisfies Record<string, readonly string[]>;

/** 既定の小見出しの文から、書き手が分けた区切りを引く。 */
export const DEFAULT_READING_HEADING_PHRASES: Readonly<
  Record<string, readonly string[]>
> = Object.fromEntries(
  Object.values(DEFAULT_READING_HEADINGS).map((phrases) => [
    phrases.join(""),
    phrases,
  ]),
);

/**
 * 標準の形の詳しい読みものの小見出しの文。診断が resultPageLabels で言い替えないときは、どの診断でも同じ文で
 * 言う。
 */
export function standardReadingHeadings(
  labels?: QuizMeta["resultPageLabels"],
): { traits: string; behaviors: string; advice: string } {
  return {
    traits: labels?.traitsHeading ?? DEFAULT_READING_HEADINGS.traits.join(""),
    behaviors:
      labels?.behaviorsHeading ?? DEFAULT_READING_HEADINGS.behaviors.join(""),
    advice: labels?.adviceHeading ?? DEFAULT_READING_HEADINGS.advice.join(""),
  };
}

/**
 * 解き終えた画面（ResultCard）が、診断のどのタイプの結果でも組みうる読みものの小見出しの文。文節の区切りを
 * サーバーで作ってクライアントの部品へ渡すために、描く前に全件を挙げる。
 */
export function solvedScreenReadingHeadings(quiz: QuizDefinition): string[] {
  const texts = new Set(
    Object.values(standardReadingHeadings(quiz.meta.resultPageLabels)),
  );
  for (const result of quiz.results) {
    const content = result.detailedContent;
    if (content?.variant === "character-fortune") {
      texts.add(content.behaviorsHeading);
      texts.add(content.characterMessageHeading);
    }
  }
  return [...texts];
}
