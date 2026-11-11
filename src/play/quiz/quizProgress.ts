import type { QuizAnswer, QuizPhase } from "@/play/quiz/types";

/**
 * 診断・クイズを解く進み。段階・いまの問の番号・答えの並びを1つの値として持ち、reduceQuizProgress だけが
 * 更新する。
 *
 * 二度押しの2打目は別の task で届き、部品のマウントごとの ref では止められない
 * （docs/knowledge/input-events-and-guards.md §1）。そこで「1つの問に答えは1つ」「進むのは名指した問から1問だけ」
 * という不変条件を更新そのものに持たせ、どの経路から何回届いても進みが壊れないようにする。
 */
export interface QuizProgress {
  readonly phase: QuizPhase;
  /** いま出ている問の番号（0 から）。 */
  readonly currentIndex: number;
  /** 記録した答え。更新は新しい並びを作り、並びを書き換えない。 */
  readonly answers: QuizAnswer[];
  /**
   * 切り替わりの番号。受け付けた更新ごとに1つ増え、捨てた更新では変わらない。やり直したあとは、段階・いまの問の
   * 番号・答えが開いた直後と同じになるので、来訪者の操作で画面が切り替わったか（マウントでないか）を、この番号で
   * 見分ける。
   */
  readonly transition: number;
}

export type QuizProgressAction =
  /** 「はじめる」。 */
  | { readonly type: "start" }
  /** 問に答える。答えを記録するのは押した時で、押した形はこの記録から描く。 */
  | {
      readonly type: "answer";
      readonly questionId: string;
      readonly choiceId: string;
    }
  /** 答えた問から次の問へ進む（診断は答えを見せたあとのタイマー、知識クイズは「次へ」）。 */
  | { readonly type: "advance"; readonly questionId: string }
  /** 「もう一度挑戦する」。 */
  | { readonly type: "retry" };

export const initialQuizProgress: QuizProgress = {
  phase: "intro",
  currentIndex: 0,
  answers: [],
  transition: 0,
};

/** いま出ている問の id。回答の段階でなければ undefined。 */
export function currentQuestionId(
  progress: QuizProgress,
  questionIds: readonly string[],
): string | undefined {
  return progress.phase === "playing"
    ? questionIds[progress.currentIndex]
    : undefined;
}

/** その問に記録した答えの選択肢の id。まだ答えていなければ undefined。 */
export function answeredChoiceId(
  progress: QuizProgress,
  questionId: string,
): string | undefined {
  return progress.answers.find((answer) => answer.questionId === questionId)
    ?.choiceId;
}

/**
 * 進みを更新する。画面に見えている形がすでに「押せない」「もう移った」ことを言っている更新（いま出ていない問への
 * 答え・答えのある問への答え・答えの無い問の進む・開始でない段階の始める・結果でない段階のやり直す）は、状態を
 * 変えずに捨て、同じ値を返す。
 */
export function reduceQuizProgress(
  progress: QuizProgress,
  action: QuizProgressAction,
  questionIds: readonly string[],
): QuizProgress {
  const accept = (next: Omit<QuizProgress, "transition">): QuizProgress => ({
    ...next,
    transition: progress.transition + 1,
  });
  const current = currentQuestionId(progress, questionIds);

  switch (action.type) {
    case "start":
      if (progress.phase !== "intro") return progress;
      return accept({ phase: "playing", currentIndex: 0, answers: [] });
    case "answer":
      if (
        action.questionId !== current ||
        answeredChoiceId(progress, current) !== undefined
      ) {
        return progress;
      }
      return accept({
        ...progress,
        answers: [
          ...progress.answers,
          { questionId: action.questionId, choiceId: action.choiceId },
        ],
      });
    case "advance":
      if (
        action.questionId !== current ||
        answeredChoiceId(progress, current) === undefined
      ) {
        return progress;
      }
      return progress.currentIndex + 1 >= questionIds.length
        ? accept({ ...progress, phase: "result" })
        : accept({ ...progress, currentIndex: progress.currentIndex + 1 });
    case "retry":
      if (progress.phase !== "result") return progress;
      return accept({ phase: "intro", currentIndex: 0, answers: [] });
  }
}
