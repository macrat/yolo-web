"use client";

import { useState, useCallback, useMemo } from "react";
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
  accentColor: string;
  onAnswer: (choiceId: string) => void;
  onNext: () => void;
};

export default function QuestionCard({
  question,
  quizType,
  accentColor,
  onAnswer,
  onNext,
}: QuestionCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

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

  return (
    <div className={styles.card} key={question.id}>
      <p className={styles.questionText}>{question.text}</p>
      <div className={styles.choices}>
        {shuffledChoices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className={getChoiceClassName(choice.id)}
            onClick={() => handleSelect(choice.id)}
            disabled={answered}
          >
            {choice.text}
          </button>
        ))}
      </div>
      {answered && quizType === "knowledge" && (
        <>
          {question.explanation && (
            <div className={styles.explanation}>{question.explanation}</div>
          )}
          <button
            type="button"
            className={styles.nextButton}
            style={{ backgroundColor: accentColor }}
            onClick={onNext}
          >
            次へ
          </button>
        </>
      )}
    </div>
  );
}
