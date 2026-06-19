"use client";

/**
 * ResultCard は「受検者本人向け」のインライン結果表示です。
 *
 * 診断を完了した本人は、`/play/[slug]` 上でこの ResultCard を通して結果を見ます
 * （`QuizContainer` の intro→playing→result フェーズ遷移。variant ごとの結果コンポーネント
 *  への dispatch もここで行う）。本人はこの後 `/play/[slug]/result/[resultId]` へは遷移せず、
 *  その `/result/<id>` URL はシェア用にここで生成される（→ 第三者が開く静的ページ）。
 *
 * つまり「本人向け = ResultCard（このファイル）」「第三者向けシェア/検索ランディング =
 *  /play/[slug]/result/[resultId] ルート（ResultPageShell 側）」と役割が分かれている。
 * 本人向けの結果体験を変えたいときは必ずこちら（ResultCard）を編集すること。
 */
import type React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type {
  QuizResult,
  QuizType,
  DetailedContent,
  QuizMeta,
  QuizResultDetailedContent,
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
import OtherTypesNav from "./OtherTypesNav";
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

const CharacterPersonalityContent = dynamic(
  () => import("./CharacterPersonalityContent"),
  { ssr: true },
);

const UnexpectedCompatibilityContent = dynamic(
  () => import("./UnexpectedCompatibilityContent"),
  { ssr: true },
);

const ImpossibleAdviceContent = dynamic(
  () => import("./ImpossibleAdviceContent"),
  { ssr: true },
);

const ContrarianFortuneContent = dynamic(
  () => import("./ContrarianFortuneContent"),
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
  /**
   * 全タイプの結果配列（unexpected-compatibility / impossible-advice variant で使用）。
   * 親コンポーネント（QuizContainer）から quiz.results を受け取ることで、
   * ResultCard 内で個別クイズデータをインポートする必要をなくし、バンドルサイズを削減する。
   */
  allResults?: QuizResult[];
};

function renderStandardContent(
  content: QuizResultDetailedContent,
  labels?: QuizMeta["resultPageLabels"],
  accentColor?: string,
  allResults?: QuizResult[],
  quizSlug?: string,
  resultId?: string,
): React.ReactNode {
  const traitsHeading = labels?.traitsHeading ?? "このタイプの特徴";
  const behaviorsHeading = labels?.behaviorsHeading ?? "このタイプのあるある";
  const adviceHeading = labels?.adviceHeading ?? "このタイプの人へのアドバイス";

  // 標準 variant の見出し・アドバイスは新デザイン体系の共通アクセント（--accent）に
  // 統一する（クイズごとの派手色を使わない）。accentColor は variant 別サブ
  // コンポーネント（legacy 結果コンテンツ）でのみ引き続き使用する。
  void accentColor;

  return (
    <>
      {/* traits（持ち味）。診断を遊んだ本人にも持ち味を届けるため、
          静的結果ページと同じく behaviors の前に表示する（cycle-250）。 */}
      <h3 className={styles.detailedHeading}>{traitsHeading}</h3>
      <ul className={styles.traitsList}>
        {content.traits.map((t, i) => (
          <li key={i} className={styles.traitsItem}>
            {t}
          </li>
        ))}
      </ul>
      <h3 className={styles.detailedHeading}>{behaviorsHeading}</h3>
      <ul className={styles.behaviorsList}>
        {content.behaviors.map((b, i) => (
          <li key={i} className={styles.behaviorsItem}>
            {b}
          </li>
        ))}
      </ul>
      <h3 className={styles.detailedHeading}>{adviceHeading}</h3>
      <div className={styles.adviceCard}>{content.advice}</div>
      {allResults && quizSlug && resultId && (
        <OtherTypesNav
          quizSlug={quizSlug}
          currentResultId={resultId}
          results={allResults}
        />
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
  quizSlug: string,
  labels?: QuizMeta["resultPageLabels"],
  accentColor?: string,
  referrerTypeId?: string,
  resultColor?: string,
  allResults?: QuizResult[],
): React.ReactNode {
  // Standard variant (variant === undefined)
  if (!content.variant) {
    return renderStandardContent(
      content,
      labels,
      accentColor,
      allResults,
      quizSlug,
      resultId,
    );
  }
  switch (content.variant) {
    case "contrarian-fortune":
      return (
        <ContrarianFortuneContent
          quizSlug={quizSlug}
          resultId={resultId}
          detailedContent={content}
          allResults={allResults ?? []}
          headingLevel={3}
          allTypesLayout="pill"
          resultColor={resultColor ?? ""}
        />
      );
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
    case "character-personality":
      return (
        <CharacterPersonalityContent
          content={content}
          resultId={resultId}
          resultColor={resultColor ?? ""}
          headingLevel={3}
          allTypesLayout="list"
          referrerTypeId={referrerTypeId}
        />
      );
    case "unexpected-compatibility":
      return (
        <UnexpectedCompatibilityContent
          quizSlug={quizSlug}
          resultId={resultId}
          detailedContent={content}
          allResults={allResults ?? []}
          headingLevel={3}
          allTypesLayout="pill"
          resultColor={resultColor ?? ""}
          // ResultCard内では afterLifeAdvice スロットは不要（一人完結型のため）
        />
      );
    case "impossible-advice":
      return (
        <ImpossibleAdviceContent
          quizSlug={quizSlug}
          resultId={resultId}
          detailedContent={content}
          allResults={allResults ?? []}
          headingLevel={3}
          allTypesLayout="pill"
          resultColor={resultColor ?? ""}
          // ResultCard内では afterPracticalTip スロットは不要
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
  allResults,
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
    "character-personality",
    "unexpected-compatibility",
    "impossible-advice",
    "contrarian-fortune",
  ] as const;

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

  return (
    <div className={styles.card}>
      {/* 結果ラベル（小見出し）。絵文字アイコンは新デザイン体系で撤去（DESIGN.md §3） */}
      <p className={styles.resultLabel}>あなたの結果</p>
      <h2 className={styles.title}>{result.title}</h2>
      {quizType === "knowledge" &&
        score !== undefined &&
        totalQuestions !== undefined && (
          <p className={styles.score}>
            {totalQuestions}問中{score}問正解
          </p>
        )}
      {/* catchphrase を description の前に静かなリード文として表示する。
          新デザイン体系では variant 別の派手な装飾色は使わない（DESIGN.md §2.4）。 */}
      {catchphrase && (
        <p className={styles.catchphraseBeforeDescription}>{catchphrase}</p>
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
            quizSlug,
            resultPageLabels,
            accentColor,
            referrerTypeId,
            result.color,
            allResults,
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
