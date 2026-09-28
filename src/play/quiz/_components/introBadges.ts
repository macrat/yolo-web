import type { QuizDefinition } from "@/play/quiz/types";

/**
 * 開始の画面の事実の行と FAQ に出す、所要時間の目安。
 *
 * 1問の字数はクイズごとに大きく違うので、問題数ではなく、来訪者が読む字数から見積もる。
 * 読む字は設問と選択肢で、知識クイズでは答えたあとに出る解説も読む。見積もりより短く言うと、
 * 終わらないうちに離れる人が出るので、分に切り上げる。
 */

/** 日本語の黙読の速さ（字/分）。 */
export const READING_CHARS_PER_MINUTE = 500;

/** 1問ごとに、選んで押すのにかかる時間（秒）。 */
export const ANSWER_SECONDS_PER_QUESTION = 3;

/** 来訪者が1回解くあいだに読む字数。 */
export function countReadingChars(quiz: QuizDefinition): number {
  const readsExplanation = quiz.meta.type === "knowledge";
  return quiz.questions.reduce((total, question) => {
    const texts = [
      question.text,
      ...question.choices.map((choice) => choice.text),
      readsExplanation ? (question.explanation ?? "") : "",
    ];
    return total + texts.reduce((sum, text) => sum + [...text].length, 0);
  }, 0);
}

/** 所要時間の目安の分数。 */
export function getEstimatedMinutes(quiz: QuizDefinition): number {
  const seconds =
    (countReadingChars(quiz) * 60) / READING_CHARS_PER_MINUTE +
    quiz.questions.length * ANSWER_SECONDS_PER_QUESTION;
  return Math.ceil(seconds / 60);
}

/** 所要時間の目安の文（「約3分」）。 */
export function getEstimatedTime(quiz: QuizDefinition): string {
  return `約${getEstimatedMinutes(quiz)}分`;
}
