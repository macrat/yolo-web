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
 * 新デザイン体系（DESIGN.md）でインライン結果（ResultCard）とトーン統一:
 * - catchphrase: 共通アクセントの淡い面に置く（旧タイプカラー薄背景ヒーローは撤去）
 * - DescriptionExpander: 長いdescriptionは折りたたみ
 * - CTA1: 共通 --accent / --bg-invert ベースの主要ボタン（タイプカラー注入は撤去）
 * - ContrarianFortuneContent: 共通コンポーネントでコアコンテンツを一括レンダリング
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ResultPageShell from "@/play/quiz/_components/ResultPageShell";
import DescriptionExpander from "@/app/(new)/play/[slug]/result/[resultId]/DescriptionExpander";
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
      {/* contrarian-fortune固有のJSX。
       * 可視の per-quiz 色注入（旧 --type-color ヒーロー）は撤去し、インライン結果
       * （ResultCard）とトーン統一する（共通 --accent ベース・無彩左寄せ）。 */}
      <div className={styles.detailedSection}>
        {/*
         * キャッチコピー: 結果のコアメッセージ。
         * 旧デザインのタイプカラー薄背景ヒーローは撤去し、共通アクセントの淡い面に置く。
         */}
        <div className={styles.catchphraseCard}>
          <p className={styles.catchphrase}>{cfDc.catchphrase}</p>
        </div>

        {/* DescriptionExpander: 長いdescriptionは折りたたみ */}
        <DescriptionExpander
          description={result.description}
          isLong={isDescriptionLong}
        />

        {/* CTA1: 共通 --accent / --bg-invert ベースの主要 CTA（インライン結果とトーン統一） */}
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
