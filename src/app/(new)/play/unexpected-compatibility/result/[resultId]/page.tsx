/**
 * ⚠️ 重要 — このコードは「受検者本人には表示されない」第三者向け結果ページの一部です。
 *
 * ルート `/play/[slug]/result/[resultId]`（診断の result ページ）は【第三者向けの
 * シェア／検索ランディング専用】。診断を遊んだ本人は、完了時に `/play/[slug]` 上に
 * インライン描画される結果（ResultCard 経由）で見ており、この `/result/<id>` ページへは
 * 遷移しない（この URL はシェア用に生成される）。文言・構造・メタ・OGP は
 * 「診断をやっていない第三者が初めて見る」前提で設計すること。本人向け結果体験は
 * `src/play/quiz/_components/ResultCard.tsx` 側で編集する。
 */
/**
 * /play/unexpected-compatibility/result/[resultId] 専用ルート。
 * Next.jsのファイルシステムルーティングにより、
 * 動的ルート /play/[slug]/result/[resultId] より優先される。
 *
 * unexpected-compatibility variant のみを対象とするため、
 * variant dispatch ロジックが不要でシンプルな実装になる。
 *
 * 一人完結型（相性機能なし）:
 * - CompatibilityDisplay, InviteFriendButton, searchParams は一切使用しない。
 * - シェアリンク経由で第三者が見ることを主目的とするシンプルな結果ページ。
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ResultPageShell from "@/play/quiz/_components/ResultPageShell";
import DescriptionExpander from "@/app/(new)/play/[slug]/result/[resultId]/DescriptionExpander";
import UnexpectedCompatibilityContent from "@/play/quiz/_components/UnexpectedCompatibilityContent";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { countCharWidth } from "@/lib/countCharWidth";
import { getResultIdsForQuiz } from "@/play/quiz/registry";
import unexpectedCompatibilityQuiz from "@/play/quiz/data/unexpected-compatibility";
import type { UnexpectedCompatibilityDetailedContent } from "@/play/quiz/types";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ resultId: string }>;
};

const SLUG = "unexpected-compatibility";
const quiz = unexpectedCompatibilityQuiz;

/** CTA1ボタンのテキスト。モバイル(375px)で1行に収まる長さに保つ。 */
export const CTA_TEXT = "あなたの相性を診断してみよう";

export function generateStaticParams() {
  return getResultIdsForQuiz(SLUG).map((id) => ({ resultId: id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) return {};

  const FULL_WIDTH_LIMIT = 60;
  const candidateTitle = `${result.title} | ${quiz.meta.title}の結果`;
  const title =
    countCharWidth(`${candidateTitle} | ${SITE_NAME}`) > FULL_WIDTH_LIMIT
      ? result.title
      : candidateTitle;
  const description = result.description;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${BASE_URL}/play/${SLUG}/result/${resultId}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/play/${SLUG}/result/${resultId}`,
    },
  };
}

export default async function UnexpectedCompatibilityResultPage({
  params,
}: Props) {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) notFound();

  const dc = result.detailedContent;
  if (!dc || dc.variant !== "unexpected-compatibility") notFound();
  // variant が確認できたので UnexpectedCompatibilityDetailedContent として型アサーション
  const ucDc = dc as UnexpectedCompatibilityDetailedContent;

  // result.color はタイプ固有色（OGP 画像で使用）。
  // ページ本文では可視装飾に使わず（新デザインは共通アクセントに統一）、
  // UnexpectedCompatibilityContent の必須 prop 契約を満たす dead/compat 値として渡す（N3）。
  // フォールバックは quiz.meta.accentColor を使用する。
  const resultColor = result.color ?? quiz.meta.accentColor;

  const shareText = `${quiz.meta.title}の結果は「${result.title}」でした！あなたは? #斜め上の相性診断 #yolosnet`;
  const shareUrl = `${BASE_URL}/play/${SLUG}/result/${resultId}`;
  const ctaText = CTA_TEXT;

  // descriptionが4行を超えるかどうかの判定
  const DESCRIPTION_LONG_THRESHOLD = 128;
  const isDescriptionLong =
    countCharWidth(result.description) > DESCRIPTION_LONG_THRESHOLD;

  return (
    <ResultPageShell
      quiz={quiz}
      result={result}
      shareText={shareText}
      shareUrl={shareUrl}
    >
      {/* unexpected-compatibility固有のJSX */}
      <div className={styles.detailedSection}>
        {/*
         * キャッチコピーヒーローエリア:
         * 旧デザインのタイプ固有色（--type-color）注入は撤去し、共通アクセントの淡い面
         * （--accent-soft）に統一してインライン結果とトーンを揃える。
         * 負のmarginでカードのpadding分を打ち消し、カード上端まで背景色を広げる。
         */}
        <div className={styles.colorHero}>
          {/* キャッチコピー: 結果のコアメッセージ */}
          <p className={styles.catchphrase}>{ucDc.catchphrase}</p>
        </div>

        {/* DescriptionExpander: 長いdescriptionは折りたたみ */}
        <DescriptionExpander
          description={result.description}
          isLong={isDescriptionLong}
        />

        {/* CTA1: 共通トーン（--bg-invert primary ボタン語彙）。タイプ固有色は撤去済み */}
        <div className={styles.trySection}>
          <Link href={`/play/${SLUG}`} className={styles.tryButton}>
            {ctaText}
          </Link>
          <p className={styles.tryCost}>
            全{quiz.meta.questionCount}問 / 登録不要
          </p>
        </div>

        {/* 存在の本質〜全タイプ一覧: 共通コンポーネントで一括レンダリング */}
        <UnexpectedCompatibilityContent
          quizSlug={SLUG}
          resultId={resultId}
          detailedContent={ucDc}
          allResults={quiz.results}
          headingLevel={2}
          allTypesLayout="pill"
          resultColor={resultColor}
          afterLifeAdvice={
            /* CTA2: 全タイプ一覧の前に配置 — コンテンツを読み終えた時点での自然な誘導 */
            <div className={styles.cta2Section}>
              <Link href={`/play/${SLUG}`} className={styles.cta2Link}>
                {ctaText}
              </Link>
            </div>
          }
        />
      </div>
    </ResultPageShell>
  );
}
