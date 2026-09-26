/**
 * /play/traditional-color/result/[resultId] 専用ルート。
 * Next.jsのファイルシステムルーティングにより、
 * 動的ルート /play/[slug]/result/[resultId] より優先される。
 *
 * traditional-color variant のみを対象とするため、
 * variant dispatch ロジックが不要でシンプルな実装になる。
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ResultPageShell from "@/play/quiz/_components/ResultPageShell";
import DescriptionExpander from "@/app/play/[slug]/result/[resultId]/DescriptionExpander";
import TraditionalColorContent from "@/play/quiz/_components/TraditionalColorContent";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { countCharWidth } from "@/lib/countCharWidth";
import { getResultIdsForQuiz } from "@/play/quiz/registry";
import traditionalColorQuiz from "@/play/quiz/data/traditional-color";
import type { TraditionalColorDetailedContent } from "@/play/quiz/types";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ resultId: string }>;
};

const SLUG = "traditional-color";
const quiz = traditionalColorQuiz;

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

export default async function TraditionalColorResultPage({ params }: Props) {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) notFound();

  const dc = result.detailedContent;
  if (!dc || dc.variant !== "traditional-color") notFound();
  // variant が確認できたので TraditionalColorDetailedContent として型アサーション
  const colorDc = dc as TraditionalColorDetailedContent;

  const shareText = `${quiz.meta.title}の結果は「${result.title}」でした！あなたは? #伝統色診断 #yolosnet`;
  const shareUrl = `${BASE_URL}/play/${SLUG}/result/${resultId}`;
  const ctaText = "あなたはどの伝統色? 診断してみよう";

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
      {/* traditional-color固有のJSX。解き終えた画面（ResultCard）と同じく、無彩で左に揃える。
       * 伝統色そのものは、TraditionalColorContent のすべてのタイプの行が色見本で見せる。 */}
      <div className={styles.detailedSection}>
        {/* キャッチコピー: 結果のコアメッセージ。--paper-2 の地に置く。 */}
        <div className={styles.catchphraseCard}>
          <p className={styles.catchphrase}>{colorDc.catchphrase}</p>
        </div>

        {/* DescriptionExpander: 長いdescriptionは折りたたみ */}
        <DescriptionExpander
          description={result.description}
          isLong={isDescriptionLong}
        />

        {/* CTA1 */}
        <div className={styles.trySection}>
          <Link
            href={`/play/${SLUG}`}
            className={styles.tryButton}
            data-inverted
          >
            {ctaText}
          </Link>
          <p className={styles.tryCost}>
            全{quiz.meta.questionCount}問 / 登録不要
          </p>
        </div>

        {/* 色の物語〜すべてのタイプ: 共通コンポーネントで一括レンダリング */}
        <TraditionalColorContent
          content={colorDc}
          resultId={resultId}
          placement="resultPage"
          afterColorAdvice={
            /* CTA2: すべてのタイプの前に配置 — コンテンツを読み終えた時点での自然な誘導 */
            <div className={styles.cta2Section}>
              <Link
                href={`/play/${SLUG}`}
                className={styles.cta2Link}
                data-text-box="inline"
              >
                {ctaText}
              </Link>
            </div>
          }
        />
      </div>
    </ResultPageShell>
  );
}
