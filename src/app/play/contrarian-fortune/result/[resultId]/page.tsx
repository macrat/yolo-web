/**
 * /play/contrarian-fortune/result/[resultId] 専用ルート。
 * Next.jsのファイルシステムルーティングにより、
 * 動的ルート /play/[slug]/result/[resultId] より優先される。
 *
 * contrarian-fortune variant のみを対象とするため、
 * variant dispatch ロジックが不要でシンプルな実装になる。
 *
 * 一人完結型（相性機能なし）:
 * - CompatibilityDisplay, InviteFriendButton, searchParams は一切使用しない。
 * - シェアリンク経由で第三者が見ることを主目的とするシンプルな結果ページ。
 *
 * impossible-advice パターンに準拠した再設計:
 * - colorHero: タイプカラー薄背景ヒーローエリア
 * - DescriptionExpander: 長いdescriptionは折りたたみ
 * - CTA1: アウトライン型ボタン（--type-color border）
 * - ContrarianFortuneContent: 共通コンポーネントでコアコンテンツを一括レンダリング
 */

import type React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ResultPageShell from "@/play/quiz/_components/ResultPageShell";
import DescriptionExpander from "@/app/play/[slug]/result/[resultId]/DescriptionExpander";
import ContrarianFortuneContent from "@/play/quiz/_components/ContrarianFortuneContent";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { countCharWidth } from "@/lib/countCharWidth";
import { getResultIdsForQuiz } from "@/play/quiz/registry";
import contrarianFortuneQuiz from "@/play/quiz/data/contrarian-fortune";
import type { ContrarianFortuneDetailedContent } from "@/play/quiz/types";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ resultId: string }>;
};

const SLUG = "contrarian-fortune";
const quiz = contrarianFortuneQuiz;

/** CTA1ボタンのテキスト。モバイル(375px)で1行に収まる長さに保つ。 */
export const CTA_TEXT = "あなたも診断してみよう";

export function generateStaticParams() {
  return getResultIdsForQuiz(SLUG).map((id) => ({ resultId: id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) return {};

  // contrarian-fortuneは常にdetailedContentありなので常にindex: true
  // searchParams処理不要（相性機能なし）
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

export default async function ContrarianFortuneResultPage({ params }: Props) {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) notFound();

  // detailedContent は contrarian-fortune では必ず存在する
  const dc = result.detailedContent;
  if (!dc || dc.variant !== "contrarian-fortune") notFound();
  // variant が確認できたので ContrarianFortuneDetailedContent として型アサーション
  const cfDc = dc as ContrarianFortuneDetailedContent;

  // result.color は OGP 画像でも使用するタイプ固有色。
  // フォールバックは quiz.meta.accentColor を使用する。
  const resultColor = result.color ?? quiz.meta.accentColor;

  const shareText = `${quiz.meta.title}の結果は「${result.title}」でした！あなたは? #逆張り運勢診断 #yolosnet`;
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
      {/* contrarian-fortune固有のJSX */}
      <div
        className={styles.detailedSection}
        style={{ "--type-color": resultColor } as React.CSSProperties}
      >
        {/*
         * キャッチコピーヒーローエリア:
         * タイプカラーを薄く敷いたヒーローセクション。
         * 負のmarginでカードのpadding分を打ち消し、カード上端まで背景色を広げる。
         * catchphraseをヒーロー内に配置して色と一体感を演出する。
         */}
        <div className={styles.colorHero}>
          {/* キャッチコピー: 結果のコアメッセージ */}
          <p className={styles.catchphrase}>{cfDc.catchphrase}</p>
        </div>

        {/* DescriptionExpander: 長いdescriptionは折りたたみ */}
        <DescriptionExpander
          description={result.description}
          isLong={isDescriptionLong}
        />

        {/* CTA1: --type-color CSS変数で制御（タイプごとに色が変わる） */}
        <div className={styles.trySection}>
          <Link href={`/play/${SLUG}`} className={styles.tryButton}>
            {ctaText}
          </Link>
          <p className={styles.tryCost}>
            全{quiz.meta.questionCount}問 / 登録不要
          </p>
        </div>

        {/* coreSentence〜全タイプ一覧: 共通コンポーネントで一括レンダリング */}
        <ContrarianFortuneContent
          quizSlug={SLUG}
          resultId={resultId}
          detailedContent={cfDc}
          allResults={quiz.results}
          headingLevel={2}
          allTypesLayout="pill"
          resultColor={resultColor}
          afterThirdPartyNote={
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
