"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { QuizDefinition, QuizAnswer, QuizPhase } from "@/quiz/types";
import { determineResult, calculateKnowledgeScore } from "@/quiz/scoring";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import ResultCard from "./ResultCard";
import styles from "./QuizContainer.module.css";

type QuizContainerProps = {
  quiz: QuizDefinition;
};

/**
 * Client-side quiz container that manages the entire quiz lifecycle:
 * intro -> playing -> result.
 */
export default function QuizContainer({ quiz }: QuizContainerProps) {
  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  const handleStart = useCallback(() => {
    setPhase("playing");
    setCurrentIndex(0);
    setAnswers([]);
  }, []);

  const handleAnswer = useCallback(
    (choiceId: string) => {
      const question = quiz.questions[currentIndex];
      const newAnswer: QuizAnswer = {
        questionId: question.id,
        choiceId,
      };
      const newAnswers = [...answers, newAnswer];
      setAnswers(newAnswers);

      // personality type: advance immediately
      if (quiz.meta.type === "personality") {
        if (currentIndex + 1 >= quiz.questions.length) {
          setPhase("result");
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      }
    },
    [answers, currentIndex, quiz],
  );

  const handleNext = useCallback(() => {
    // knowledge type: advance to next question or show result
    if (currentIndex + 1 >= quiz.questions.length) {
      setPhase("result");
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, quiz.questions.length]);

  const handleRetry = useCallback(() => {
    setPhase("intro");
    setCurrentIndex(0);
    setAnswers([]);
  }, []);

  if (phase === "intro") {
    return (
      <div className={styles.container}>
        <div className={styles.intro}>
          <div className={styles.introIcon}>{quiz.meta.icon}</div>
          <h1 className={styles.introTitle}>{quiz.meta.title}</h1>
          <p className={styles.introDescription}>{quiz.meta.description}</p>
          <p className={styles.introMeta}>
            全{quiz.meta.questionCount}問 /{" "}
            {quiz.meta.type === "knowledge" ? "知識テスト" : "診断テスト"}
          </p>
          <button
            type="button"
            className={styles.startButton}
            style={{ backgroundColor: quiz.meta.accentColor }}
            onClick={handleStart}
          >
            スタート
          </button>
          {quiz.meta.relatedLinks && quiz.meta.relatedLinks.length > 0 && (
            <div className={styles.relatedLinks}>
              {quiz.meta.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={styles.relatedLink}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === "playing") {
    const question = quiz.questions[currentIndex];
    return (
      <div className={styles.container}>
        <ProgressBar
          current={currentIndex + 1}
          total={quiz.questions.length}
          accentColor={quiz.meta.accentColor}
        />
        <QuestionCard
          key={question.id}
          question={question}
          quizType={quiz.meta.type}
          accentColor={quiz.meta.accentColor}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      </div>
    );
  }

  // result phase
  const result = determineResult(quiz, answers);
  const score =
    quiz.meta.type === "knowledge"
      ? calculateKnowledgeScore(quiz.questions, answers)
      : undefined;

  return (
    <div className={styles.container}>
      <ResultCard
        result={result}
        quizType={quiz.meta.type}
        quizTitle={quiz.meta.title}
        quizSlug={quiz.meta.slug}
        score={score}
        totalQuestions={
          quiz.meta.type === "knowledge" ? quiz.questions.length : undefined
        }
        onRetry={handleRetry}
      />
    </div>
  );
}
