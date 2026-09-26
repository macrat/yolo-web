"use client";

/**
 * 解き終えた画面（`/play/[slug]`）に出す結果。
 *
 * `QuizContainer` が intro→playing→result と進んだあとに描き、variant ごとの結果コンポーネントへの
 * 振り分けもここで行う。各タイプの結果のページ（`/play/[slug]/result/[resultId]`。枠は ResultPageShell）は、
 * ここからシェアする URL であり、ここに並ぶタイプの行から移る先でもある。
 */
import type React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Tsutsumi from "@/components/Tsutsumi";
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
import ShareButtons from "@/components/ShareButtons";
import FudaActions from "./FudaActions";
import { pickResultWairoColor, pickResultSymbol } from "./resultVisual";
import { contentIdForQuiz } from "@/play/quiz/contentId";
import OtherTypesNav from "./OtherTypesNav";
import Button from "@/components/Button";
import styles from "./ResultCard.module.css";

// dynamic importにより、これらのコンポーネントとデータファイル（計120KB以上）を
// クイズページの初期バンドルから分離し、/play/[slug] の140KBバジェットを維持する。
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
  /** 相性診断用の referrer タイプID（animal-personality variantで使用） */
  referrerTypeId?: string;
  /**
   * 全タイプの結果配列（unexpected-compatibility / impossible-advice variant で使用）。
   * 親コンポーネント（QuizContainer）から quiz.results を受け取ることで、
   * ResultCard 内で個別クイズデータをインポートする必要をなくし、バンドルサイズを削減する。
   */
  allResults?: QuizResult[];
  /**
   * 真の残余同点（最高得点を主タイプと分け合う副タイプ）。
   * word-sense-personality の同点時のみ QuizContainer から渡される（他診断は常に空/未指定）。
   * 1件以上あるとき、主タイプと同格に「同じくらい強く出た型」を開示するブロックを描画する。
   * 空/未指定なら開示ブロックは出さない（＝単独勝者）。
   */
  coTypes?: QuizResult[];
};

/**
 * 真の同点の開示ブロック。
 *
 * 診断が構造的に残す残余同点（本当に複数タイプの声を等しく持つ人）を、恣意的・不可視に
 * 配列順で割らず、**同格**として正直に開示する。主タイプ（determineResult の決定的勝者）と
 * co-types を上下つけず同じ強さの声として列挙し、「主に X」のような X>Y を暗示するコピーには
 * しない。各 co-type にはその結果のページ（/play/[slug]/result/[id]）への
 * リンクを添える。
 *
 * --paper-2 の地＋罫（--rule）の静かな区画。装飾線・絵文字・
 * 禁止色は使わない。型名の強調は 墨（--ink）と【】括弧の組版のみ。
 */
function renderTiedTypesDisclosure(
  mainResult: QuizResult,
  coTypes: QuizResult[],
  quizSlug: string,
): React.ReactNode {
  // 主タイプ＋副タイプを同格に並べる（配列順で上下をつけない）。主タイプが先頭なのは
  // 「今表示している結果カード＝主タイプ」という所在を保つためで、優劣の含意ではない。
  const tiedTitles = [mainResult, ...coTypes]
    .map((type) => `【${type.title}】`)
    .join("と");

  return (
    <section
      className={styles.tiedDisclosure}
      aria-label="同じくらい強く出た型"
    >
      <p className={styles.tiedDisclosureText}>
        あなたの言葉の感覚は、{tiedTitles}
        が同じくらい強く出ています。いずれも同じ強さの、あなたの声です。
      </p>
      <ul className={styles.tiedTypeLinks}>
        {coTypes.map((coType) => (
          <li key={coType.id}>
            <Link
              href={`/play/${quizSlug}/result/${coType.id}`}
              className={styles.tiedTypeLink}
              data-text-box="inline"
            >
              {coType.title}の解説を見る
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function renderStandardContent(
  content: QuizResultDetailedContent,
  labels?: QuizMeta["resultPageLabels"],
  allResults?: QuizResult[],
  quizSlug?: string,
  resultId?: string,
): React.ReactNode {
  const traitsHeading = labels?.traitsHeading ?? "このタイプの特徴";
  const behaviorsHeading = labels?.behaviorsHeading ?? "このタイプのあるある";
  const adviceHeading = labels?.adviceHeading ?? "このタイプの人へのアドバイス";

  return (
    <>
      {/* traits（持ち味）。診断を遊んだ本人にも持ち味を届けるため、
          静的結果ページと同じく behaviors の前に表示する。 */}
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
          placement="solvedScreen"
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
            contentId={contentIdForQuiz(quiz.meta.slug)}
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
      contentId={contentIdForQuiz(quiz.meta.slug)}
    />
  );
}

function renderCharacterFortuneContent(
  content: CharacterFortuneDetailedContent,
): React.ReactNode {
  return (
    <>
      <p className={styles.characterIntro}>{content.characterIntro}</p>
      <h3 className={styles.detailedHeading}>{content.behaviorsHeading}</h3>
      <ul className={styles.behaviorsList}>
        {content.behaviors.map((b, i) => (
          <li key={i} className={styles.behaviorsItem}>
            {b}
          </li>
        ))}
      </ul>
      <h3 className={styles.detailedHeading}>
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
  referrerTypeId?: string,
  allResults?: QuizResult[],
): React.ReactNode {
  // Standard variant (variant === undefined)
  if (!content.variant) {
    return renderStandardContent(
      content,
      labels,
      allResults,
      quizSlug,
      resultId,
    );
  }
  switch (content.variant) {
    case "contrarian-fortune": {
      const Comp = ContrarianFortuneContent;
      return (
        <Comp
          quizSlug={quizSlug}
          resultId={resultId}
          detailedContent={content}
          allResults={allResults ?? []}
          placement="solvedScreen"
        />
      );
    }
    case "character-fortune":
      // character-fortune は専用 *Content を持たず、常に
      // renderCharacterFortuneContent で描画する。
      return renderCharacterFortuneContent(content);
    case "animal-personality": {
      const Comp = AnimalPersonalityContent;
      return (
        <Comp
          content={content}
          resultId={resultId}
          placement="solvedScreen"
          afterTodayAction={buildAnimalPersonalityAfterTodayAction(
            resultId,
            referrerTypeId,
          )}
        />
      );
    }
    case "music-personality": {
      const Comp = MusicPersonalityContent;
      return (
        <Comp
          content={content}
          resultId={resultId}
          placement="solvedScreen"
          referrerTypeId={referrerTypeId}
        />
      );
    }
    case "traditional-color": {
      const Comp = TraditionalColorContent;
      return (
        <Comp
          content={content}
          resultId={resultId}
          placement="solvedScreen"
          // ResultCard内では相性データがないため afterColorAdvice は省略
        />
      );
    }
    case "yoji-personality": {
      const Comp = YojiPersonalityContent;
      return (
        <Comp content={content} resultId={resultId} placement="solvedScreen" />
      );
    }
    case "character-personality": {
      const Comp = CharacterPersonalityContent;
      return (
        <Comp
          content={content}
          resultId={resultId}
          placement="solvedScreen"
          referrerTypeId={referrerTypeId}
        />
      );
    }
    case "unexpected-compatibility": {
      const Comp = UnexpectedCompatibilityContent;
      return (
        <Comp
          quizSlug={quizSlug}
          resultId={resultId}
          detailedContent={content}
          allResults={allResults ?? []}
          placement="solvedScreen"
          // ResultCard内では afterLifeAdvice スロットは不要（一人完結型のため）
        />
      );
    }
    case "impossible-advice": {
      const Comp = ImpossibleAdviceContent;
      return (
        <Comp
          quizSlug={quizSlug}
          resultId={resultId}
          detailedContent={content}
          allResults={allResults ?? []}
          placement="solvedScreen"
          // ResultCard内では afterPracticalTip スロットは不要
        />
      );
    }
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
  referrerTypeId,
  allResults,
  coTypes,
}: ResultCardProps) {
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

  // 結果の包み（personality 型のみ）。
  // 適用条件は「personality 型 かつ 結果自身の象徴 icon と固有色 color が両方存在」。
  // これ以外（knowledge 型、icon/color 欠落）は抑制ヘッダにフォールバックする
  // （knowledge 系には包みを一律に適用しない。ResultCard は複数の personality
  //  診断で共有されるため、特定診断に依存しない汎用の文言・構造にする）。
  const showMedal =
    quizType === "personality" && Boolean(result.icon) && Boolean(result.color);

  return (
    <div className={styles.card}>
      {showMedal ? (
        // 結果を包み（Tsutsumi）で見せる。
        // 器（この見出し部）は静かな到達ラベルだけを持ち、結果そのものは罫で明確に
        // 包まれた独立ビジュアル（Tsutsumi）が主役になる。固有色は quiz データの任意
        // hex を使わず、id から和色8色へ決定的に写像する。
        // symbol は絵文字（result.icon）ではなくタイプ名の先頭1字（絵文字を持たない・§5）。
        <div className={styles.medalWrap}>
          {/* 到達の承認を兼ねた静かなラベル（煽らない・けばけばしくしない） */}
          <p className={styles.medalLabel}>
            <span>診断完了</span>
            <span>あなたの結果</span>
          </p>
          <Tsutsumi
            typeName={result.title}
            // 診断結果の主タイトル（クライマックス）を見出し(h2)にし、SRの見出しナビで
            // 結果へ到達できるようにする（WCAG 1.3.1）。ページ h1 は
            // QuizPlayPageLayout、結果内の詳細見出しは h3 のため h2 が階層上妥当。
            typeNameAs="h2"
            reading={result.reading}
            word={catchphrase ?? undefined}
            symbol={pickResultSymbol(result.title)}
            color={pickResultWairoColor(result.id)}
            productName={quizTitle}
            seal="診"
          />
          {/* 「札を持ち帰る」保存/共有アクション。
              character-personality に限る。固定 URL の札画像 Route Handler
              （/play/character-personality/result/<id>/fuda-image）が存在する面のみ。 */}
          {detailedContent?.variant === "character-personality" && (
            <FudaActions
              resultId={result.id}
              resultTitle={result.title}
              quizTitle={quizTitle}
              quizSlug={quizSlug}
            />
          )}
        </div>
      ) : (
        <>
          {/* 抑制ヘッダ（フォールバック）。絵文字アイコンは出さない（DESIGN.md §5） */}
          <p className={styles.resultLabel}>あなたの結果</p>
          <h2 className={styles.title}>{result.title}</h2>
          {result.reading && <p className={styles.reading}>{result.reading}</p>}
          {quizType === "knowledge" &&
            score !== undefined &&
            totalQuestions !== undefined && (
              <p className={styles.score}>
                {totalQuestions}問中{score}問正解
              </p>
            )}
          {/* catchphrase を description の前に静かなリード文として表示する。Tsutsumi 内に
              既に word として表示している場合（showMedal=true）はここでは重複させない。 */}
          {catchphrase && (
            <p className={styles.catchphraseBeforeDescription}>{catchphrase}</p>
          )}
        </>
      )}
      <p className={styles.description}>{result.description}</p>
      {/* 真の残余同点の開示。co-types が1件以上あるときのみ描画。
          単独勝者（約8割）には出さない。判定は変えず表示のみの加算ブロック。 */}
      {coTypes &&
        coTypes.length > 0 &&
        renderTiedTypesDisclosure(result, coTypes, quizSlug)}
      {result.recommendation && result.recommendationLink && (
        <Link
          href={result.recommendationLink}
          className={styles.recommendation}
          data-text-box="inline"
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
            referrerTypeId,
            allResults,
          )}
        </div>
      )}
      <div className={styles.share}>
        <ShareButtons
          url={`/play/${quizSlug}/result/${result.id}`}
          title={quizTitle}
          text={shareText}
          sns={["x", "line", "copy"]}
          contentType={quizType === "personality" ? "diagnosis" : "quiz"}
          contentId={contentIdForQuiz(quizSlug)}
          surface="text"
        />
      </div>
      <div className={styles.retry}>
        <Button onClick={onRetry}>もう一度挑戦する</Button>
      </div>
    </div>
  );
}
