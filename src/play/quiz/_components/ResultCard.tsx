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
  AnimalPersonalityDetailedContent,
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

function renderAnimalPersonalityContent(
  content: AnimalPersonalityDetailedContent,
  resultId: string,
  accentColor?: string,
  referrerTypeId?: string,
): React.ReactNode {
  const quiz = animalPersonalityQuiz;

  // 相性セクション: referrerTypeIdが有効な場合は相性表示、なければ招待ボタン
  let compatibilitySection: React.ReactNode;
  if (referrerTypeId && isValidAnimalTypeId(referrerTypeId)) {
    const myResult = quiz.results.find((r) => r.id === resultId);
    const friendResult = quiz.results.find((r) => r.id === referrerTypeId);
    const compatibility = getCompatibility(resultId, referrerTypeId);

    if (myResult && friendResult && compatibility) {
      compatibilitySection = (
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
    } else {
      compatibilitySection = (
        <InviteFriendButton
          quizSlug={quiz.meta.slug}
          resultTypeId={resultId}
          inviteText="日本の固有種診断で相性を調べよう!"
        />
      );
    }
  } else {
    compatibilitySection = (
      <InviteFriendButton
        quizSlug={quiz.meta.slug}
        resultTypeId={resultId}
        inviteText="日本の固有種診断で相性を調べよう!"
      />
    );
  }

  return (
    <>
      {/* strengths セクション */}
      <h3
        className={styles.detailedHeading}
        style={accentColor ? { color: accentColor } : undefined}
      >
        このタイプの強み
      </h3>
      <ul className={styles.strengthsList}>
        {content.strengths.map((s, i) => (
          <li key={i} className={styles.strengthsItem}>
            {s}
          </li>
        ))}
      </ul>

      {/* weaknesses セクション */}
      <h3
        className={styles.detailedHeading}
        style={accentColor ? { color: accentColor } : undefined}
      >
        このタイプの弱み
      </h3>
      <ul className={styles.weaknessesList}>
        {content.weaknesses.map((w, i) => (
          <li key={i} className={styles.weaknessesItem}>
            {w}
          </li>
        ))}
      </ul>

      {/* behaviors セクション */}
      <h3
        className={styles.detailedHeading}
        style={accentColor ? { color: accentColor } : undefined}
      >
        この動物に似た行動パターン
      </h3>
      <ul className={styles.behaviorsList}>
        {content.behaviors.map((b, i) => (
          <li key={i} className={styles.behaviorsItem}>
            {b}
          </li>
        ))}
      </ul>

      {/* todayAction セクション */}
      <h3
        className={styles.detailedHeading}
        style={accentColor ? { color: accentColor } : undefined}
      >
        今日試してほしいこと
      </h3>
      <div
        className={styles.todayActionCard}
        style={
          accentColor ? { backgroundColor: `${accentColor}18` } : undefined
        }
      >
        {content.todayAction}
      </div>

      {/* 相性セクション */}
      {compatibilitySection}

      {/* 全タイプ一覧セクション */}
      <div className={styles.allTypesSection}>
        <h3
          className={styles.detailedHeading}
          style={accentColor ? { color: accentColor } : undefined}
        >
          他の動物タイプも見てみよう
        </h3>
        <ul className={styles.allTypesList}>
          {quiz.results.map((r) => (
            <li
              key={r.id}
              className={
                r.id === resultId
                  ? styles.allTypesItemCurrent
                  : styles.allTypesItem
              }
            >
              <Link href={`/play/${quiz.meta.slug}/result/${r.id}`}>
                {r.icon && <span>{r.icon}</span>}
                <span>{r.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
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
  resultId: string,
  labels?: QuizMeta["resultPageLabels"],
  accentColor?: string,
  referrerTypeId?: string,
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
      return renderAnimalPersonalityContent(
        content,
        resultId,
        accentColor,
        referrerTypeId,
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

  // animal-personality variant では catchphrase を description の前に表示する
  const catchphrase =
    detailedContent?.variant === "animal-personality"
      ? detailedContent.catchphrase
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
      {/* animal-personality: catchphraseをdescriptionの前に表示 */}
      {catchphrase && (
        <p
          className={styles.catchphraseBeforeDescription}
          style={
            accentColor
              ? ({
                  "--catchphrase-accent-color": accentColor,
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
