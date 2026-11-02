/**
 * 問の区画（QuestionCard）の区切り。問の見出しと選択肢の面は、クライアントの部品が描くデータの文なので、文節の
 * 区切りをサーバーで全問ぶん作って渡す（DESIGN.md §4）。選択肢の区切りは、押す前のボタンの面と答えたあとの字の
 * 両方が使い、押しても折り返しが変わらない。
 */
import "server-only";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import {
  headingFontAttr,
  type HeadingFontAttr,
} from "@/lib/zen-antique-charset";
import type { QuizDefinition } from "./types";

/** 問の見出しの区切りと書体の属性。 */
export type QuestionHeading = HeadingFontAttr & {
  phrases: readonly string[];
};

/** 1つの問の区切り。 */
export interface QuestionPhrases {
  heading: QuestionHeading;
  /** 選択肢の id ごとの、面の字の区切り。 */
  choices: Readonly<Record<string, readonly string[]>>;
}

/** 問の id ごとの区切り。 */
export function questionPhrases(
  quiz: QuizDefinition,
): Record<string, QuestionPhrases> {
  return Object.fromEntries(
    quiz.questions.map((question) => [
      question.id,
      {
        heading: {
          phrases: splitIntoPhrases(question.text),
          ...headingFontAttr(question.text),
        },
        choices: Object.fromEntries(
          question.choices.map((choice) => [
            choice.id,
            splitIntoPhrases(choice.text),
          ]),
        ),
      },
    ]),
  );
}
