/**
 * 解き終えた画面（ResultCard）の見出しの区切り。タイプ名と詳しい読みものの小見出しは、クライアントの部品が描く
 * データから作る見出しなので、文節の区切りをサーバーで全件ぶん作って渡す（DESIGN.md §4）。解き終えた画面を描く
 * ページと、storybook の見本の両方がこれを使い、見本が本物の画面と同じ組み方になるようにする。
 */
import "server-only";
import type { ResultHeading } from "@/components/ResultBox";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import { solvedScreenReadingHeadings } from "./readingHeadings";
import type { QuizDefinition } from "./types";

export interface SolvedScreenHeadings {
  /** 結果の id ごとの、タイプ名の見出しの区切りと書体の属性。 */
  resultHeadings: Record<string, ResultHeading>;
  /** 小見出しの文ごとの、文節の区切り。 */
  readingHeadings: Record<string, string[]>;
}

export function solvedScreenHeadings(
  quiz: QuizDefinition,
): SolvedScreenHeadings {
  return {
    // 見出しは名前だけで組み、読みは解き終えた画面が見出しのすぐ下に添える。
    resultHeadings: Object.fromEntries(
      quiz.results.map((result) => {
        const name = result.nameParts?.name ?? result.title;
        return [
          result.id,
          { phrases: splitIntoPhrases(name), ...headingFontAttr(name) },
        ];
      }),
    ),
    readingHeadings: Object.fromEntries(
      solvedScreenReadingHeadings(quiz).map((text) => [
        text,
        splitIntoPhrases(text),
      ]),
    ),
  };
}
