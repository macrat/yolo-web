"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { QuizChoice, QuizQuestion, QuizType } from "@/play/quiz/types";
import { isCorrectChoice } from "@/play/quiz/scoring";
import Button from "@/components/Button";
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
  onAnswer: (choiceId: string) => void;
  onNext: () => void;
};

export default function QuestionCard({
  question,
  quizType,
  onAnswer,
  onNext,
}: QuestionCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  // F2（WCAG 2.4.3 / 4.1.3）: 設問切替時のフォーカス管理。
  // QuizContainer は playing phase で key={question.id} により QuestionCard を
  // 再マウントする。何もしないと前設問の回答ボタンにあった focus が <body> に
  // 落ち、キーボード/SR 利用者は「設問が変わったこと」も現在位置も失う。
  // マウント時（=設問切替時）に設問見出しへプログラム的にフォーカスを移すことで、
  // 新設問が読み上げられ、そこから操作を続けられる。
  // preventScroll: true は結果リビール（QuizContainer）の流儀に合わせる
  // （設問はページ上部で通常スクロール不要。focus() 既定スクロールの誤発火を抑止）。
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    questionHeadingRef.current?.focus({ preventScroll: true });
  }, []);

  // Shuffle choices when the question changes to prevent positional bias
  const shuffledChoices: QuizChoice[] = useMemo(
    () => shuffleArray(question.choices),
    [question.choices],
  );

  const handleSelect = useCallback(
    (choiceId: string) => {
      if (answered) return;

      setSelectedId(choiceId);
      onAnswer(choiceId);

      if (quizType === "knowledge") {
        // Show feedback, wait for "Next" button
        setAnswered(true);
      }
      // personality type: onAnswer triggers immediate transition via parent
    },
    [answered, onAnswer, quizType],
  );

  // 回答した選択肢は押せなくなるので、フォーカスは「次へ」に移し、キーボードでそのまま進めるようにする。
  const nextAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!answered) return;
    nextAreaRef.current
      ?.querySelector("button")
      ?.focus({ preventScroll: true });
  }, [answered]);

  // 正誤は文字で伝える（WCAG 1.4.1）。
  const getFeedbackTag = (choiceId: string): string | null => {
    if (!answered || quizType !== "knowledge") return null;
    const correct = isCorrectChoice(question, choiceId);
    if (correct) return "正解";
    if (choiceId === selectedId) return "あなたの回答";
    return null;
  };

  return (
    <div className={styles.card} key={question.id}>
      {/* 設問文は見出し（h2）。ページ h1 は QuizPlayPageLayout が持つため設問は h2。
       * SR の見出しナビで設問に到達でき、F2 のフォーカス移動先も兼ねる
       * （tabIndex={-1} でプログラム的フォーカスのみ受ける）。 */}
      <h2
        ref={questionHeadingRef}
        tabIndex={-1}
        className={styles.questionText}
      >
        {question.text}
      </h2>
      {/* 回答する前の選択肢は、押すと回答が決まるボタンの一覧（§7）。回答したあとは押せるものが無いので、
       * 無効のボタンを並べずに、正誤の文字を添えた一覧にする。 */}
      <ul className={styles.choices} data-text-box="rows">
        {shuffledChoices.map((choice) => {
          const feedbackTag = getFeedbackTag(choice.id);
          return (
            <li key={choice.id} className={styles.choice}>
              {answered ? (
                <span className={styles.choiceText}>{choice.text}</span>
              ) : (
                <button
                  type="button"
                  className={styles.choiceButton}
                  onClick={() => handleSelect(choice.id)}
                  data-hit-area="after"
                >
                  {choice.text}
                </button>
              )}
              {feedbackTag && (
                <span className={styles.feedbackTag}>{feedbackTag}</span>
              )}
            </li>
          );
        })}
      </ul>
      {answered && quizType === "knowledge" && (
        <>
          {question.explanation && (
            <div className={styles.explanation}>{question.explanation}</div>
          )}
          <div className={styles.next} ref={nextAreaRef}>
            <Button variant="primary" onClick={onNext}>
              次へ
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
