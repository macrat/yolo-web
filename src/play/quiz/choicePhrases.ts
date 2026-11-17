/**
 * 問の選択肢の文節の区切り。選択肢はボタンの面で、コントロールの名前として文節で折る（DESIGN.md §4・§6）。
 * 選択肢を描く QuestionCard はクライアントの部品なので、文節の区切りをサーバーで全件ぶん作って渡す。
 */
import "server-only";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import type { QuizDefinition } from "./types";

/** 選択肢の id ごとの、文節の区切り。選択肢の id は、1つのクイズ・診断の中で重ならない。 */
export type ChoicePhrases = Readonly<Record<string, readonly string[]>>;

/** 定義ごとに作った区切り。定義は変わらないので、ページを描くたびに分け直さない。 */
const phrasesByQuiz = new WeakMap<QuizDefinition, ChoicePhrases>();

export function choicePhrasesOf(quiz: QuizDefinition): ChoicePhrases {
  let phrases = phrasesByQuiz.get(quiz);
  if (phrases === undefined) {
    phrases = Object.fromEntries(
      quiz.questions.flatMap((question) =>
        question.choices.map((choice) => [
          choice.id,
          splitIntoPhrases(choice.text),
        ]),
      ),
    );
    phrasesByQuiz.set(quiz, phrases);
  }
  return phrases;
}
