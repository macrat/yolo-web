"use client";

import Link from "next/link";
import type {
  DetailedContent,
  QuizMeta,
  QuizResult,
  QuizType,
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
  /** personality type: optional detailed content for the result page */
  detailedContent?: DetailedContent;
  /** optional labels to customize section headings on the result page */
  resultPageLabels?: QuizMeta["resultPageLabels"];
};

/**
 * detailedContentのバリアントに応じたbehaviorsの見出しを決定する。
 * - 標準形式: resultPageLabels.behaviorsHeading ?? "あなたのあるある"
 * - contrarian-fortune: 固定で "あなたのあるある"
 * - character-fortune: detailedContent.behaviorsHeading を使用
 */
function getBehaviorsHeading(
  detailedContent: DetailedContent,
  resultPageLabels: QuizMeta["resultPageLabels"] | undefined,
): string {
  if (detailedContent.variant === "character-fortune") {
    return detailedContent.behaviorsHeading;
  }
  return resultPageLabels?.behaviorsHeading ?? "あなたのあるある";
}

/**
 * 標準形式のdetailedContent用の折りたたみセクションを描画する。
 * traits（特徴）とadvice（アドバイス）を表示する。
 */
function StandardDetailsSection({
  detailedContent,
  resultPageLabels,
}: {
  detailedContent: Extract<DetailedContent, { variant?: undefined }>;
  resultPageLabels: QuizMeta["resultPageLabels"] | undefined;
}) {
  const traitsHeading = resultPageLabels?.traitsHeading ?? "あなたの特徴";
  const adviceHeading =
    resultPageLabels?.adviceHeading ?? "あなたへのアドバイス";

  return (
    <details className={styles.detailsSection}>
      <summary className={styles.detailsSummary}>もっと詳しく見る</summary>
      <div className={styles.detailsContent}>
        <p className={styles.detailsSubHeading}>{traitsHeading}</p>
        <ul className={styles.detailsList}>
          {detailedContent.traits.map((trait) => (
            <li key={trait} className={styles.detailsListItem}>
              {trait}
            </li>
          ))}
        </ul>
        <p className={styles.detailsSubHeading}>{adviceHeading}</p>
        <p className={styles.detailsText}>{detailedContent.advice}</p>
      </div>
    </details>
  );
}

/**
 * contrarian-fortune用の折りたたみセクションを描画する。
 * catchphrase、coreSentence、personaを表示する。
 * thirdPartyNoteとhumorMetricsは受検者向け画面では非表示。
 */
function ContrarianFortuneDetailsSection({
  detailedContent,
}: {
  detailedContent: Extract<DetailedContent, { variant: "contrarian-fortune" }>;
}) {
  return (
    <details className={styles.detailsSection}>
      <summary className={styles.detailsSummary}>
        あなたの深層プロファイル
      </summary>
      <div className={styles.detailsContent}>
        <p className={styles.detailsText}>{detailedContent.catchphrase}</p>
        <p className={styles.detailsText}>{detailedContent.coreSentence}</p>
        <p className={styles.detailsText}>{detailedContent.persona}</p>
      </div>
    </details>
  );
}

/**
 * character-fortune用の折りたたみセクションを描画する。
 * characterIntroとcharacterMessageを表示する。
 * thirdPartyNoteとcompatibilityPromptは受検者向け画面では非表示。
 */
function CharacterFortuneDetailsSection({
  detailedContent,
}: {
  detailedContent: Extract<DetailedContent, { variant: "character-fortune" }>;
}) {
  return (
    <details className={styles.detailsSection}>
      <summary className={styles.detailsSummary}>
        {detailedContent.characterMessageHeading}
      </summary>
      <div className={styles.detailsContent}>
        <p className={styles.detailsText}>{detailedContent.characterIntro}</p>
        <p className={styles.detailsText}>{detailedContent.characterMessage}</p>
      </div>
    </details>
  );
}

/**
 * detailedContentのバリアントに応じた折りたたみセクションを描画する。
 */
function DetailsSection({
  detailedContent,
  resultPageLabels,
}: {
  detailedContent: DetailedContent;
  resultPageLabels: QuizMeta["resultPageLabels"] | undefined;
}) {
  if (detailedContent.variant === "contrarian-fortune") {
    return (
      <ContrarianFortuneDetailsSection detailedContent={detailedContent} />
    );
  }
  if (detailedContent.variant === "character-fortune") {
    return <CharacterFortuneDetailsSection detailedContent={detailedContent} />;
  }
  return (
    <StandardDetailsSection
      detailedContent={detailedContent}
      resultPageLabels={resultPageLabels}
    />
  );
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
      <ShareButtons
        shareText={shareText}
        shareUrl={shareUrl}
        quizTitle={quizTitle}
        contentType={quizType === "personality" ? "diagnosis" : "quiz"}
        contentId={`quiz-${quizSlug}`}
      />
      {detailedContent && (
        <div className={styles.behaviorsSection}>
          <p className={styles.behaviorsHeading}>
            {getBehaviorsHeading(detailedContent, resultPageLabels)}
          </p>
          <ul className={styles.behaviorsList}>
            {detailedContent.behaviors.map((behavior) => (
              <li key={behavior} className={styles.behaviorsItem}>
                {behavior}
              </li>
            ))}
          </ul>
          <DetailsSection
            detailedContent={detailedContent}
            resultPageLabels={resultPageLabels}
          />
        </div>
      )}
      <button type="button" className={styles.retryButton} onClick={onRetry}>
        もう一度挑戦する
      </button>
    </div>
  );
}
