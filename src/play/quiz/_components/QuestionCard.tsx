"use client";

import { useId, useMemo, type Ref } from "react";
import type { QuizChoice, QuizQuestion, QuizType } from "@/play/quiz/types";
import { isCorrectChoice } from "@/play/quiz/scoring";
import Button, {
  buttonFaceBoxClassName,
  buttonUnderlineClassName,
} from "@/components/Button";
import PhrasedText from "@/components/PhrasedText";
import styles from "./QuestionCard.module.css";

/** Fisher-Yates shuffle: returns a new array with elements in random order */
function shuffleArray<T>(array: readonly T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

type QuestionCardProps = {
  question: QuizQuestion;
  quizType: QuizType;
  /** この問に記録した答えの選択肢の id。まだ答えていなければ undefined。押した形はこの記録から描く。 */
  answeredChoiceId: string | undefined;
  onAnswer: (choiceId: string) => void;
  onNext: () => void;
  /** 問の見出し。問が出たとき、QuizContainer がここへフォーカスを移す。 */
  headingRef: Ref<HTMLHeadingElement>;
  /** 選択肢の並び。QuizContainer が、問のまとまりの下端（最後の行の下端）をここで測る。 */
  choicesRef: Ref<HTMLUListElement>;
  /** 押した行。答えたとき、QuizContainer がここへフォーカスを移す。 */
  pressedRowRef: Ref<HTMLLIElement>;
  /**
   * 知識クイズで答えたあとの、押していない正解の行。QuizContainer が、答えたあとに見せる範囲の上端を、押した行と
   * この行の上のほうで測る。
   */
  correctRowRef: Ref<HTMLLIElement>;
  /** 知識クイズの「次へ」。QuizContainer が、答えたあとに見せる範囲の下端をここで測る。 */
  nextButtonRef: Ref<HTMLButtonElement>;
};

/** 知識クイズで答えたあと、行の名前の下に添える正誤の字（DESIGN.md §8）。1つの行に1つの字だけを添える。 */
function feedbackOf(
  question: QuizQuestion,
  choiceId: string,
  pressed: boolean,
): string | undefined {
  const correct = isCorrectChoice(question, choiceId);
  if (pressed) return correct ? "あなたの回答は正解" : "あなたの回答は不正解";
  return correct ? "正解" : undefined;
}

/**
 * 1つの問。選択肢は押すと回答が決まるボタンで、答えたあとはどれもボタンでない字に替わる（DESIGN.md §6）。
 * 診断では、押した行の字は次の問か結果が出るまで押す前と同じ下線を持ったままでいて（実行のさいちゅう）、ほかの行は
 * 下線の無い字（答えた選択肢）になる。知識クイズでは、どの行も答えた選択肢になり、正誤の字と解説と「次へ」が出る。
 * 自分では画面を送らずフォーカスも動かさず、送りの範囲を測る要素とフォーカスを受ける要素を QuizContainer に渡す。
 */
export default function QuestionCard({
  question,
  quizType,
  answeredChoiceId,
  onAnswer,
  onNext,
  headingRef,
  choicesRef,
  pressedRowRef,
  correctRowRef,
  nextButtonRef,
}: QuestionCardProps) {
  const explanationId = useId();

  // 選択肢の位置で選ぶ偏りを避けるため、問ごとに並びを混ぜる。
  const shuffledChoices: QuizChoice[] = useMemo(
    () => shuffleArray(question.choices),
    [question.choices],
  );

  const answered = answeredChoiceId !== undefined;
  const isKnowledge = quizType === "knowledge";
  const explanation = isKnowledge && answered ? question.explanation : "";

  return (
    <div>
      {/* 問の見出し（h2。ページの h1 は頭が持つ）。プログラムからだけフォーカスを受ける。 */}
      <h2
        ref={headingRef}
        tabIndex={-1}
        className={styles.questionText}
        data-text-box="inline"
      >
        {question.text}
      </h2>
      <ul ref={choicesRef} className={styles.choices} data-text-box="rows">
        {shuffledChoices.map((choice) => {
          const pressed = choice.id === answeredChoiceId;
          const feedback =
            isKnowledge && answered
              ? feedbackOf(question, choice.id, pressed)
              : undefined;
          const unpressedCorrect =
            isKnowledge &&
            answered &&
            !pressed &&
            isCorrectChoice(question, choice.id);
          // 押した行は、押したボタンが字に替わってもフォーカスを body に落とさないよう、プログラムからフォーカスを
          // 受ける。知識クイズでは、着いたときに名前と正誤の字に続けて解説が読まれる。
          return (
            <li
              key={choice.id}
              ref={
                pressed
                  ? pressedRowRef
                  : unpressedCorrect
                    ? correctRowRef
                    : undefined
              }
              tabIndex={pressed ? -1 : undefined}
              aria-describedby={
                pressed && explanation ? explanationId : undefined
              }
              className={styles.choice}
            >
              {!answered ? (
                <Button
                  className={styles.choiceButton}
                  onClick={() => onAnswer(choice.id)}
                  data-hit-area="after"
                >
                  {choice.text}
                </Button>
              ) : pressed && !isKnowledge ? (
                <span
                  className={`${buttonFaceBoxClassName} ${buttonUnderlineClassName} ${styles.answeredFace} ${styles.pressedFace}`}
                  data-text-box="inline"
                  data-hit-area="after"
                >
                  <PhrasedText as="span" phrases={[choice.text]} />
                </span>
              ) : (
                <span
                  className={`${buttonFaceBoxClassName} ${styles.answeredFace}`}
                  data-text-box="inline"
                >
                  <PhrasedText as="span" phrases={[choice.text]} />
                </span>
              )}
              {feedback && <span className={styles.feedback}>{feedback}</span>}
            </li>
          );
        })}
      </ul>
      {isKnowledge && answered && (
        <>
          {explanation && (
            <p id={explanationId} className={styles.explanation}>
              {explanation}
            </p>
          )}
          <div className={styles.next}>
            <Button variant="primary" onClick={onNext} ref={nextButtonRef}>
              次へ
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
