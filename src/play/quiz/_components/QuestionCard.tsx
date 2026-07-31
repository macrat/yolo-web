"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { QuizChoice, QuizQuestion, QuizType } from "@/play/quiz/types";
import { isCorrectChoice } from "@/play/quiz/scoring";
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

  const getChoiceClassName = (choiceId: string): string => {
    if (!answered || quizType !== "knowledge") {
      return styles.choiceButton;
    }
    const correct = isCorrectChoice(question, choiceId);
    if (correct) {
      return `${styles.choiceButton} ${styles.choiceCorrect}`;
    }
    if (choiceId === selectedId && !correct) {
      return `${styles.choiceButton} ${styles.choiceWrong}`;
    }
    return styles.choiceButton;
  };

  // 正誤は色だけで伝えない（WCAG 1.4.1）。色に加えて短い文字ラベルを添える。
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
      <div className={styles.choices}>
        {shuffledChoices.map((choice) => {
          const feedbackTag = getFeedbackTag(choice.id);
          return (
            <button
              key={choice.id}
              type="button"
              className={getChoiceClassName(choice.id)}
              onClick={() => handleSelect(choice.id)}
              disabled={answered}
            >
              <span>{choice.text}</span>
              {feedbackTag && (
                <span className={styles.feedbackTag}>{feedbackTag}</span>
              )}
            </button>
          );
        })}
      </div>
      {answered && quizType === "knowledge" && (
        <>
          {question.explanation && (
            <div className={styles.explanation}>{question.explanation}</div>
          )}
          <button type="button" className={styles.nextButton} onClick={onNext}>
            次へ
          </button>
        </>
      )}
    </div>
  );
}
