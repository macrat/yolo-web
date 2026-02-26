"use client";

import { useState, useCallback } from "react";
import type { QuizQuestion, QuizType } from "@/quiz/types";
import { isCorrectChoice } from "@/quiz/scoring";
import styles from "./QuestionCard.module.css";

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
        {question.choices.map((choice) => (
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
