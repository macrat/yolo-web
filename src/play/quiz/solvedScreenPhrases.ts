/**
 * 解き終えた画面（ResultCard）の見出しと表のセルの区切り。タイプ名・詳しい読みものの小見出し・読みものの表のセルは、
 * クライアントの部品が描くデータから作る字なので、区切りをサーバーで全件ぶん作って渡す（DESIGN.md §4）。解き終えた
 * 画面を描くページと、storybook の見本の両方がこれを使い、見本が本物の画面と同じ組み方になるようにする。
 */
import "server-only";
import type { ResultHeading } from "@/components/ResultBox";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import {
  DEFAULT_READING_HEADING_PHRASES,
  solvedScreenReadingHeadings,
} from "./readingHeadings";
import { readingTableCells, type TableCellPhrases } from "./readingTableCells";
import { resultHeadingName } from "./resultName";
import type { QuizDefinition } from "./types";

export interface SolvedScreenPhrases {
  /** 結果の id ごとの、タイプ名の見出しの区切りと書体の属性。 */
  resultHeadings: Record<string, ResultHeading>;
  /** 小見出しの文ごとの、文節の区切り。 */
  readingHeadings: Record<string, readonly string[]>;
  /** 読みものの表のセルの字ごとの、表のセルの区切り。 */
  tableCells: TableCellPhrases;
}

export function solvedScreenPhrases(quiz: QuizDefinition): SolvedScreenPhrases {
  return {
    // 見出しは名前だけで組み、読みは解き終えた画面が見出しのすぐ下に添える。
    resultHeadings: Object.fromEntries(
      quiz.results.map((result) => {
        const { name } = resultHeadingName(result);
        return [
          result.id,
          { phrases: splitIntoPhrases(name), ...headingFontAttr(name) },
        ];
      }),
    ),
    // 既定の小見出しは書き手が分けた区切りを使い、データから来る小見出しだけをここで分ける。
    readingHeadings: Object.fromEntries(
      solvedScreenReadingHeadings(quiz).map((text) => [
        text,
        DEFAULT_READING_HEADING_PHRASES[text] ?? splitIntoPhrases(text),
      ]),
    ),
    tableCells: readingTableCells(
      quiz.results.map((result) => result.detailedContent),
    ),
  };
}
