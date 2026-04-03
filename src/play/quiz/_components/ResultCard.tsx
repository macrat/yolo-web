"use client";

import type React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type {
  QuizResult,
  QuizType,
  DetailedContent,
  QuizMeta,
  QuizResultDetailedContent,
  ContrarianFortuneDetailedContent,
  CharacterFortuneDetailedContent,
} from "@/play/quiz/types";
import {
  getCompatibility,
  isValidAnimalTypeId,
} from "@/play/quiz/data/animal-personality";
import animalPersonalityQuiz from "@/play/quiz/data/animal-personality";
import CompatibilitySection from "./CompatibilitySection";
import InviteFriendButton from "./InviteFriendButton";
import ShareButtons from "./ShareButtons";
import styles from "./ResultCard.module.css";

// dynamic importにより、これらのコンポーネントとデータファイル（計120KB以上）を
// クイズページの初期バンドルから分離し、/play/[slug] の140KBバジェットを維持する
const AnimalPersonalityContent = dynamic(
  () => import("./AnimalPersonalityContent"),
  { ssr: true },
);

const MusicPersonalityContent = dynamic(
  () => import("./MusicPersonalityContent"),
  { ssr: true },
);

const TraditionalColorContent = dynamic(
  () => import("./TraditionalColorContent"),
  { ssr: true },
);

const YojiPersonalityContent = dynamic(
  () => import("./YojiPersonalityContent"),
  { ssr: true },
);

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
  /** 相性診断用の referrer タイプID（animal-personality variantで使用） */
  referrerTypeId?: string;
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

function buildAnimalPersonalityAfterTodayAction(
  resultId: string,
  referrerTypeId?: string,
): React.ReactNode {
  const quiz = animalPersonalityQuiz;

  // 相性セクション: referrerTypeIdが有効な場合は相性表示、なければ招待ボタン
  if (referrerTypeId && isValidAnimalTypeId(referrerTypeId)) {
    const myResult = quiz.results.find((r) => r.id === resultId);
    const friendResult = quiz.results.find((r) => r.id === referrerTypeId);
    const compatibility = getCompatibility(resultId, referrerTypeId);

    if (myResult && friendResult && compatibility) {
      return (
        <>
          <CompatibilitySection
            myType={{
              id: myResult.id,
              title: myResult.title,
              icon: myResult.icon,
            }}
            friendType={{
              id: friendResult.id,
              title: friendResult.title,
              icon: friendResult.icon,
            }}
            compatibility={compatibility}
            quizTitle={quiz.meta.title}
            quizSlug={quiz.meta.slug}
          />
          <InviteFriendButton
            quizSlug={quiz.meta.slug}
            resultTypeId={resultId}
            inviteText="日本の固有種診断で相性を調べよう!"
          />
        </>
      );
    }
  }

  return (
    <InviteFriendButton
      quizSlug={quiz.meta.slug}
      resultTypeId={resultId}
      inviteText="日本の固有種診断で相性を調べよう!"
    />
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
  resultId: string,
  labels?: QuizMeta["resultPageLabels"],
  accentColor?: string,
  referrerTypeId?: string,
  resultColor?: string,
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
    case "animal-personality":
      return (
        <AnimalPersonalityContent
          content={content}
          resultId={resultId}
          headingLevel={3}
          allTypesLayout="list"
          afterTodayAction={buildAnimalPersonalityAfterTodayAction(
            resultId,
            referrerTypeId,
          )}
        />
      );
    case "music-personality":
      return (
        <MusicPersonalityContent
          content={content}
          resultId={resultId}
          headingLevel={3}
          allTypesLayout="pill"
          referrerTypeId={referrerTypeId}
        />
      );
    case "traditional-color":
      return (
        <TraditionalColorContent
          content={content}
          resultId={resultId}
          resultColor={resultColor ?? ""}
          headingLevel={3}
          allTypesLayout="list"
          // ResultCard内では相性データがないため afterColorAdvice は省略
        />
      );
    case "yoji-personality":
      return (
        <YojiPersonalityContent
          content={content}
          resultId={resultId}
          resultColor={resultColor ?? ""}
          headingLevel={3}
          allTypesLayout="pill"
        />
      );
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
  referrerTypeId,
}: ResultCardProps) {
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/play/${quizSlug}/result/${result.id}`
      : `/play/${quizSlug}/result/${result.id}`;

  const shareText = `${quizTitle}の結果は「${result.title}」でした! #${quizTitle.replace(/\s/g, "")} #yolosnet`;

  // catchphrase を description の前に表示する variant のリスト。
  // このリストに含まれる variant は detailedContent.catchphrase を持つことが保証される。
  const CATCHPHRASE_VARIANTS = [
    "animal-personality",
    "music-personality",
    "traditional-color",
    "yoji-personality",
  ] as const;

  // catchphrase 装飾線の色（--catchphrase-accent-color）を variant ごとに宣言的に管理する。
  // - animal-personality: CSSファイルのフォールバック値（緑）を使用するため null
  // - music-personality: 紫固定色（クイズのブランドカラー）
  // - traditional-color / yoji-personality: タイプ固有の色（result.color）
  const CATCHPHRASE_ACCENT_COLOR: Record<
    (typeof CATCHPHRASE_VARIANTS)[number],
    string | null
  > = {
    "animal-personality": null,
    "music-personality": "#7c3aed",
    "traditional-color": result.color ?? null,
    "yoji-personality": result.color ?? null,
  };

  const catchphrase =
    detailedContent &&
    CATCHPHRASE_VARIANTS.includes(
      detailedContent.variant as (typeof CATCHPHRASE_VARIANTS)[number],
    )
      ? (
          detailedContent as {
            catchphrase: string;
            variant: (typeof CATCHPHRASE_VARIANTS)[number];
          }
        ).catchphrase
      : null;

  const catchphraseAccentColor =
    detailedContent?.variant &&
    CATCHPHRASE_VARIANTS.includes(
      detailedContent.variant as (typeof CATCHPHRASE_VARIANTS)[number],
    )
      ? CATCHPHRASE_ACCENT_COLOR[
          detailedContent.variant as (typeof CATCHPHRASE_VARIANTS)[number]
        ]
      : null;

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
      {/* catchphrase を description の前に表示する。
          装飾線の色は CSS変数 --catchphrase-accent-color で制御する。
          各 variant の色は CATCHPHRASE_ACCENT_COLOR で宣言的に管理している。 */}
      {catchphrase && (
        <p
          className={styles.catchphraseBeforeDescription}
          style={
            catchphraseAccentColor
              ? ({
                  "--catchphrase-accent-color": catchphraseAccentColor,
                } as React.CSSProperties)
              : undefined
          }
        >
          {catchphrase}
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
            result.id,
            resultPageLabels,
            accentColor,
            referrerTypeId,
            result.color,
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
