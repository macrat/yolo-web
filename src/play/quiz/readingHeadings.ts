import type { QuizDefinition, QuizMeta } from "./types";

/**
 * 標準の形（variant を持たない）の詳しい読みものの小見出しの文。診断が resultPageLabels で言い替えないときは、
 * どの診断でも同じ文で言う。
 */
export function standardReadingHeadings(
  labels?: QuizMeta["resultPageLabels"],
): { traits: string; behaviors: string; advice: string } {
  return {
    traits: labels?.traitsHeading ?? "このタイプの特徴",
    behaviors: labels?.behaviorsHeading ?? "このタイプのあるある",
    advice: labels?.adviceHeading ?? "このタイプの人へのアドバイス",
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
