/**
 * 問の選択肢の文節の区切り。選択肢はボタンの面で、コントロールの名前として文節で折る（DESIGN.md §4・§6）。
 * 選択肢を描く QuestionCard はクライアントの部品なので、文節の区切りをサーバーで全件ぶん作って渡す。
 */
import "server-only";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import type { QuizDefinition } from "./types";

/** 選択肢の id ごとの、文節の区切り。選択肢の id は、1つのクイズ・診断の中で重ならない。 */
export type ChoicePhrases = Readonly<Record<string, readonly string[]>>;

export function choicePhrasesOf(quiz: QuizDefinition): ChoicePhrases {
  return Object.fromEntries(
    quiz.questions.flatMap((question) =>
      question.choices.map((choice) => [
        choice.id,
        splitIntoPhrases(choice.text),
      ]),
    ),
  );
}
