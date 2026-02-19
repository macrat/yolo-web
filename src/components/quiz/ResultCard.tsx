"use client";

import Link from "next/link";
import type { QuizResult, QuizType } from "@/lib/quiz/types";
import ShareButtons from "./ShareButtons";
import styles from "./ResultCard.module.css";

type ResultCardProps = {
  result: QuizResult;
  quizType: QuizType;
  quizTitle: string;
  quizSlug: string;
  /** knowledge type: number of correct answers */
  score?: number;
  /** knowledge type: total number of questions */
  totalQuestions?: number;
  onRetry: () => void;
};

export default function ResultCard({
  result,
  quizType,
  quizTitle,
  quizSlug,
  score,
  totalQuestions,
  onRetry,
}: ResultCardProps) {
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/quiz/${quizSlug}/result/${result.id}`
      : `/quiz/${quizSlug}/result/${result.id}`;

  const shareText = `${quizTitle}の結果は「${result.title}」でした! #yolosnet`;

  return (
    <div className={styles.card}>
      {result.icon && <div className={styles.icon}>{result.icon}</div>}
      <h2 className={styles.title}>{result.title}</h2>
      {quizType === "knowledge" &&
        score !== undefined &&
        totalQuestions !== undefined && (
          <p className={styles.score}>
            {totalQuestions}問中{score}問正解
          </p>
        )}
      <p className={styles.description}>{result.description}</p>
      {result.recommendation && result.recommendationLink && (
        <Link
          href={result.recommendationLink}
          className={styles.recommendation}
        >
          {result.recommendation}
        </Link>
      )}
      <ShareButtons
        shareText={shareText}
        shareUrl={shareUrl}
        quizTitle={quizTitle}
      />
      <button type="button" className={styles.retryButton} onClick={onRetry}>
        もう一度挑戦する
      </button>
    </div>
  );
}
