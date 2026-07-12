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
import ShareButtons from "./ShareButtons";
import { pickResultWairoColor, pickResultSymbol } from "./resultVisual";
// EXPERIMENT: quiz_result_visual_v1
// OtherTypesNav の選択（current / retro）は OtherTypesNavAb 内部で行う。
// 実験終了時は import を `./OtherTypesNav` に戻し、`_experiments/` ディレクトリ
// ごと削除すれば原状復帰できる。撤去対象は本ファイル＋ QuizContainer.tsx 内の
// `EXPERIMENT: quiz_result_visual_v1` マーカーを grep で一括検索のこと:
//   grep -rn 'EXPERIMENT: quiz_result_visual_v1' src/
import OtherTypesNav from "./_experiments/legacy-result/OtherTypesNavAb";
import type { AbArm } from "@/lib/ab";
import styles from "./ResultCard.module.css";

// EXPERIMENT: quiz_result_visual_v1
//
// dynamic importにより、これらのコンポーネントとデータファイル（計120KB以上）を
// クイズページの初期バンドルから分離し、/play/[slug] の140KBバジェットを維持する。
//
// retro バリアントは `_experiments/legacy-result/*` から並走で読み込む。
// arm === "A" のとき retro、それ以外（"B" / null / undefined）は current。
// null（SSR/初期 render）は current を選ぶことで hydration mismatch を避ける
// （docs/visitor-value-measurement.md 論点1）。
//
// 実験終了時はこの section の `*Retro` 群と pickVariantComponent をすべて削除し、
// 各 switch case を「retro/current の分岐なし」に戻すだけで原状復帰できる。
const AnimalPersonalityContent = dynamic(
  () => import("./AnimalPersonalityContent"),
  { ssr: true },
);
const AnimalPersonalityContentRetro = dynamic(
  () => import("./_experiments/legacy-result/AnimalPersonalityContent"),
  { ssr: true },
);

const MusicPersonalityContent = dynamic(
  () => import("./MusicPersonalityContent"),
  { ssr: true },
);
const MusicPersonalityContentRetro = dynamic(
  () => import("./_experiments/legacy-result/MusicPersonalityContent"),
  { ssr: true },
);

const TraditionalColorContent = dynamic(
  () => import("./TraditionalColorContent"),
  { ssr: true },
);
const TraditionalColorContentRetro = dynamic(
  () => import("./_experiments/legacy-result/TraditionalColorContent"),
  { ssr: true },
);

const YojiPersonalityContent = dynamic(
  () => import("./YojiPersonalityContent"),
  { ssr: true },
);
const YojiPersonalityContentRetro = dynamic(
  () => import("./_experiments/legacy-result/YojiPersonalityContent"),
  { ssr: true },
);

const CharacterPersonalityContent = dynamic(
  () => import("./CharacterPersonalityContent"),
  { ssr: true },
);
const CharacterPersonalityContentRetro = dynamic(
  () => import("./_experiments/legacy-result/CharacterPersonalityContent"),
  { ssr: true },
);

const UnexpectedCompatibilityContent = dynamic(
  () => import("./UnexpectedCompatibilityContent"),
  { ssr: true },
);
const UnexpectedCompatibilityContentRetro = dynamic(
  () => import("./_experiments/legacy-result/UnexpectedCompatibilityContent"),
  { ssr: true },
);

const ImpossibleAdviceContent = dynamic(
  () => import("./ImpossibleAdviceContent"),
  { ssr: true },
);
const ImpossibleAdviceContentRetro = dynamic(
  () => import("./_experiments/legacy-result/ImpossibleAdviceContent"),
  { ssr: true },
);

const ContrarianFortuneContent = dynamic(
  () => import("./ContrarianFortuneContent"),
  { ssr: true },
);
const ContrarianFortuneContentRetro = dynamic(
  () => import("./_experiments/legacy-result/ContrarianFortuneContent"),
  { ssr: true },
);

/**
 * EXPERIMENT: quiz_result_visual_v1
 *
 * variant → {retro, current} の選択ヘルパ。
 *
 * 各 variant の case で `pickVariantComponent(arm, Retro, Current)` を呼び、
 * 同じ props で展開する（props 差のため完全な集約は不可だが、arm 分岐の
 * 「if 階段」を避けて switch 各 case の見通しを保つ）。
 *
 * 注: `character-fortune` は cycle-254 の剥ぎ落とし対象外（専用 *Content を持たず
 *      ResultCard 内 `renderCharacterFortuneContent` で描画）、retro/current の差分が
 *      存在しないためテーブルに含めない（設計書 論点2 除外規定）。
 */
function pickVariantComponent<TRetro, TCurrent>(
  arm: AbArm | null,
  retro: TRetro,
  current: TCurrent,
): TRetro | TCurrent {
  return arm === "A" ? retro : current;
}

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
  /**
   * EXPERIMENT: quiz_result_visual_v1
   *
   * A/B 実験 quiz_result_visual_v1 の arm（親 QuizContainer が `useAbVariant`
   * で解決した結果を渡す）。`null` は SSR / 初期 render（未確定）を表す。
   *
   * 未指定（undefined）の場合は current 描画にフォールバックする。これは
   * ResultCard 単体テストや静的結果ページ（実験対象外）からの呼び出しが
   * arm を渡さずに済むようにするための後方互換動作。
   *
   * 実験終了時はこの prop ごと削除し、`renderDetailedContent` の arm 引数と
   * `OtherTypesNavAb` 経由 import も外して原状復帰する。
   */
  resultVisualArm?: AbArm | null;
};

function renderStandardContent(
  content: QuizResultDetailedContent,
  labels?: QuizMeta["resultPageLabels"],
  accentColor?: string,
  allResults?: QuizResult[],
  quizSlug?: string,
  resultId?: string,
  // EXPERIMENT: quiz_result_visual_v1
  // arm を OtherTypesNavAb へ伝播するために受け取る。
  arm?: AbArm | null,
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
        // EXPERIMENT: quiz_result_visual_v1 — OtherTypesNavAb は arm を prop で受け、
        // QuizContainer で解決した arm を1か所からそのまま渡す（関心の分離・原則#3）。
        <OtherTypesNav
          quizSlug={quizSlug}
          currentResultId={resultId}
          results={allResults}
          arm={arm}
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
): React.ReactNode {
  // 新デザイン体系ではクイズごとの任意 hex（accentColor）を器/成果物の色に使わない
  // （DESIGN.md §2「成果物パレットは和色8色に限る・直書き禁止」）。見出し・面はすべて
  // 標準トークン（--accent・--paper-2）に統一する。
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
  accentColor?: string,
  referrerTypeId?: string,
  resultColor?: string,
  allResults?: QuizResult[],
  // EXPERIMENT: quiz_result_visual_v1
  // arm の意味: "A" → retro / "B" | null | undefined → current。
  // null（SSR/初期 render）で current にフォールバックして hydration mismatch を
  // 回避する（docs/visitor-value-measurement.md 論点1）。
  arm?: AbArm | null,
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
      arm,
    );
  }
  // EXPERIMENT: quiz_result_visual_v1
  // 各 variant の case で `pickVariantComponent(arm, Retro, Current)` により
  // retro / current の出し分けを行う（character-fortune は剥ぎ落とし対象外で
  // 分岐なし）。実験終了時はこの switch を「分岐なし」に戻すだけで済む。
  switch (content.variant) {
    case "contrarian-fortune": {
      // EXPERIMENT: quiz_result_visual_v1
      // ResultCard（インライン）経路は 8 variant 共通で縦リスト統一。
      //
      // `allTypesLayout` の pill/list 差は独立変数（絵文字/カラフル vs ミニマル）
      // の外側にあるので、両 arm 共通で "list" を渡し A/B の効果量に layout 差を
      // 混入させない。retro 側は当時 (d804b5d1) "pill" 単一だったが、
      // `_experiments/legacy-result/ContrarianFortuneContent.module.css` に
      // `.allTypesListVertical` を追加して "list" を許容している
      // （docs/visitor-value-measurement.md 論点2 例外規定）。
      const Comp = pickVariantComponent(
        arm ?? null,
        ContrarianFortuneContentRetro,
        ContrarianFortuneContent,
      );
      return (
        <Comp
          quizSlug={quizSlug}
          resultId={resultId}
          detailedContent={content}
          allResults={allResults ?? []}
          headingLevel={3}
          allTypesLayout="list"
          resultColor={resultColor ?? ""}
        />
      );
    }
    case "character-fortune":
      // character-fortune は cycle-254 の剥ぎ落とし対象外（専用 *Content を持たない）。
      // arm に関係なく同じ renderCharacterFortuneContent を描画する
      // （docs/visitor-value-measurement.md 論点2 除外規定）。
      return renderCharacterFortuneContent(content);
    case "animal-personality": {
      const Comp = pickVariantComponent(
        arm ?? null,
        AnimalPersonalityContentRetro,
        AnimalPersonalityContent,
      );
      return (
        <Comp
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
    }
    case "music-personality": {
      const Comp = pickVariantComponent(
        arm ?? null,
        MusicPersonalityContentRetro,
        MusicPersonalityContent,
      );
      return (
        <Comp
          content={content}
          resultId={resultId}
          headingLevel={3}
          // インライン経路は縦リスト統一（surface 内の質感を揃えるため）
          allTypesLayout="list"
          referrerTypeId={referrerTypeId}
        />
      );
    }
    case "traditional-color": {
      const Comp = pickVariantComponent(
        arm ?? null,
        TraditionalColorContentRetro,
        TraditionalColorContent,
      );
      return (
        <Comp
          content={content}
          resultId={resultId}
          resultColor={resultColor ?? ""}
          headingLevel={3}
          allTypesLayout="list"
          // ResultCard内では相性データがないため afterColorAdvice は省略
          //
          // 色見本（r.color の色ドット）は retro/current 両方で同一仕様。
          // resultColor は arm によらず常に同じ値を渡している（設計書論点2 例外）。
        />
      );
    }
    case "yoji-personality": {
      const Comp = pickVariantComponent(
        arm ?? null,
        YojiPersonalityContentRetro,
        YojiPersonalityContent,
      );
      return (
        <Comp
          content={content}
          resultId={resultId}
          resultColor={resultColor ?? ""}
          headingLevel={3}
          // インライン経路は縦リスト統一（surface 内の質感を揃えるため）
          allTypesLayout="list"
        />
      );
    }
    case "character-personality": {
      const Comp = pickVariantComponent(
        arm ?? null,
        CharacterPersonalityContentRetro,
        CharacterPersonalityContent,
      );
      // retro 版は allTypesLayout が "list" | "grid"、current 版は "list" | "grid"
      // で互換。インライン経路は "list" 統一で問題ない。
      return (
        <Comp
          content={content}
          resultId={resultId}
          resultColor={resultColor ?? ""}
          headingLevel={3}
          allTypesLayout="list"
          referrerTypeId={referrerTypeId}
        />
      );
    }
    case "unexpected-compatibility": {
      const Comp = pickVariantComponent(
        arm ?? null,
        UnexpectedCompatibilityContentRetro,
        UnexpectedCompatibilityContent,
      );
      return (
        <Comp
          quizSlug={quizSlug}
          resultId={resultId}
          detailedContent={content}
          allResults={allResults ?? []}
          headingLevel={3}
          // インライン経路は縦リスト統一（surface 内の質感を揃えるため）
          allTypesLayout="list"
          resultColor={resultColor ?? ""}
          // ResultCard内では afterLifeAdvice スロットは不要（一人完結型のため）
        />
      );
    }
    case "impossible-advice": {
      // EXPERIMENT: quiz_result_visual_v1
      // contrarian-fortune と同じく、両 arm 共通で "list" を渡して独立変数
      // （絵文字/カラフル vs ミニマル）に layout 差を混入させない。
      const Comp = pickVariantComponent(
        arm ?? null,
        ImpossibleAdviceContentRetro,
        ImpossibleAdviceContent,
      );
      return (
        <Comp
          quizSlug={quizSlug}
          resultId={resultId}
          detailedContent={content}
          allResults={allResults ?? []}
          headingLevel={3}
          allTypesLayout="list"
          resultColor={resultColor ?? ""}
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
  accentColor,
  referrerTypeId,
  allResults,
  resultVisualArm,
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

  // 勲章 first-view（B：§7 / personality 型のみ）。
  // 適用条件は「personality 型 かつ 結果自身の象徴 icon と固有色 color が両方存在」。
  // これ以外（knowledge 型、icon/color 欠落）は現行の抑制ヘッダにフォールバックする
  // （§7 は knowledge 系に勲章を一律適用しない方針。ResultCard は複数の personality
  //  診断で共有されるため、特定診断に依存しない汎用の文言・構造にする）。
  const showMedal =
    quizType === "personality" && Boolean(result.icon) && Boolean(result.color);

  return (
    <div className={styles.card}>
      {showMedal ? (
        // 結果を包み（Tsutsumi）で見せる（DESIGN.md §4「包み」/§7「見せたくなる結果」）。
        // 器（この見出し部）は静かな到達ラベルだけを持ち、結果そのものは罫で明確に
        // 包まれた独立ビジュアル（Tsutsumi）が主役になる。固有色は quiz データの任意
        // hex を捨て、id から和色8色へ決定的に写像する（§2「成果物パレットは8色に限る」）。
        // symbol は絵文字（result.icon）ではなくタイプ名の先頭1字（§8-6 絵文字禁止）。
        <div className={styles.medalWrap}>
          {/* 到達の承認を兼ねた静かなラベル（煽らない・けばけばしくしない） */}
          <p className={styles.medalLabel}>
            <span className={styles.medalLabelDone}>診断完了</span>
            あなたの結果
          </p>
          <Tsutsumi
            typeName={result.title}
            word={catchphrase ?? undefined}
            symbol={pickResultSymbol(result.title)}
            color={pickResultWairoColor(result.id)}
            productName={quizTitle}
            seal="診"
          />
        </div>
      ) : (
        <>
          {/* 抑制ヘッダ（フォールバック）。絵文字アイコンは新デザイン体系で撤去（DESIGN.md §3） */}
          <p className={styles.resultLabel}>あなたの結果</p>
          <h2 className={styles.title}>{result.title}</h2>
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
            // EXPERIMENT: quiz_result_visual_v1
            resultVisualArm,
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
