"use client";

import type React from "react";
import Link from "next/link";
import type {
  QuizResult,
  QuizType,
  DetailedContent,
  QuizMeta,
  QuizResultDetailedContent,
  ContrarianFortuneDetailedContent,
  CharacterFortuneDetailedContent,
} from "@/play/quiz/types";
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
  /** 結果の追加コンテンツ（variant別） */
  detailedContent?: DetailedContent;
  /** 結果ページのセクション見出しカスタマイズ */
  resultPageLabels?: QuizMeta["resultPageLabels"];
  /** クイズのアクセントカラー（見出し色やcharacterIntro背景に使用） */
  accentColor?: string;
};

function renderStandardContent(
  content: QuizResultDetailedContent,
  labels?: QuizMeta["resultPageLabels"],
  accentColor?: string,
): React.ReactNode {
  const behaviorsHeading = labels?.behaviorsHeading ?? "このタイプのあるある";
  const adviceHeading = labels?.adviceHeading ?? "このタイプの人へのアドバイス";

  return (
    <>
      <h3
        className={styles.detailedHeading}
        style={accentColor ? { color: accentColor } : undefined}
      >
        {behaviorsHeading}
      </h3>
      <ul className={styles.behaviorsList}>
        {content.behaviors.map((b, i) => (
          <li key={i} className={styles.behaviorsItem}>
            {b}
          </li>
        ))}
      </ul>
      <h3
        className={styles.detailedHeading}
        style={accentColor ? { color: accentColor } : undefined}
      >
        {adviceHeading}
      </h3>
      <div
        className={styles.adviceCard}
        style={
          accentColor ? { backgroundColor: `${accentColor}18` } : undefined
        }
      >
        {content.advice}
      </div>
    </>
  );
}

function renderContrarianFortuneContent(
  content: ContrarianFortuneDetailedContent,
  accentColor?: string,
): React.ReactNode {
  return (
    <>
      <p className={styles.catchphrase}>{content.catchphrase}</p>
      <h3
        className={styles.detailedHeading}
        style={accentColor ? { color: accentColor } : undefined}
      >
        このタイプのあるある
      </h3>
      <ul className={styles.behaviorsList}>
        {content.behaviors.map((b, i) => (
          <li key={i} className={styles.behaviorsItem}>
            {b}
          </li>
        ))}
      </ul>
      {content.humorMetrics && content.humorMetrics.length > 0 && (
        <table className={styles.humorMetricsTable}>
          <tbody>
            {content.humorMetrics.map((m, i) => (
              <tr key={i}>
                <th>{m.label}</th>
                <td>{m.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function renderCharacterFortuneContent(
  content: CharacterFortuneDetailedContent,
  accentColor?: string,
): React.ReactNode {
  return (
    <>
      <p
        className={styles.characterIntro}
        style={
          accentColor ? { backgroundColor: `${accentColor}18` } : undefined
        }
      >
        {content.characterIntro}
      </p>
      <h3
        className={styles.detailedHeading}
        style={accentColor ? { color: accentColor } : undefined}
      >
        {content.behaviorsHeading}
      </h3>
      <ul className={styles.behaviorsList}>
        {content.behaviors.map((b, i) => (
          <li key={i} className={styles.behaviorsItem}>
            {b}
          </li>
        ))}
      </ul>
      <h3
        className={styles.detailedHeading}
        style={accentColor ? { color: accentColor } : undefined}
      >
        {content.characterMessageHeading}
      </h3>
      <p className={styles.characterMessage}>{content.characterMessage}</p>
    </>
  );
}

function renderDetailedContent(
  content: DetailedContent,
  labels?: QuizMeta["resultPageLabels"],
  accentColor?: string,
): React.ReactNode {
  // Standard variant (variant === undefined)
  if (!content.variant) {
    return renderStandardContent(content, labels, accentColor);
  }
  switch (content.variant) {
    case "contrarian-fortune":
      return renderContrarianFortuneContent(content, accentColor);
    case "character-fortune":
      return renderCharacterFortuneContent(content, accentColor);
    default: {
      // exhaustive check: 新variant追加時にコンパイルエラーで検出
      void (content satisfies never);
      return null;
    }
  }
}

export default function ResultCard({
  result,
  quizType,
  quizTitle,
  quizSlug,
  score,
  totalQuestions,
  onRetry,
  detailedContent,
  resultPageLabels,
  accentColor,
}: ResultCardProps) {
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/play/${quizSlug}/result/${result.id}`
      : `/play/${quizSlug}/result/${result.id}`;

  const shareText = `${quizTitle}の結果は「${result.title}」でした! #${quizTitle.replace(/\s/g, "")} #yolosnet`;

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
      {detailedContent && (
        <div className={styles.detailedSection}>
          {renderDetailedContent(
            detailedContent,
            resultPageLabels,
            accentColor,
          )}
        </div>
      )}
      <ShareButtons
        shareText={shareText}
        shareUrl={shareUrl}
        quizTitle={quizTitle}
        contentType={quizType === "personality" ? "diagnosis" : "quiz"}
        contentId={`quiz-${quizSlug}`}
      />
      <button type="button" className={styles.retryButton} onClick={onRetry}>
        もう一度挑戦する
      </button>
    </div>
  );
}
