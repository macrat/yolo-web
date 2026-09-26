/**
 * /play/yoji-personality/result/[resultId] 専用ルート。
 * Next.jsのファイルシステムルーティングにより、
 * 動的ルート /play/[slug]/result/[resultId] より優先される。
 *
 * yoji-personality variant のみを対象とするため、
 * variant dispatch ロジックが不要でシンプルな実装になる。
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ResultPageShell from "@/play/quiz/_components/ResultPageShell";
import DescriptionExpander from "@/app/play/[slug]/result/[resultId]/DescriptionExpander";
import YojiPersonalityContent from "@/play/quiz/_components/YojiPersonalityContent";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { countCharWidth } from "@/lib/countCharWidth";
import { getResultIdsForQuiz } from "@/play/quiz/registry";
import yojiPersonalityQuiz from "@/play/quiz/data/yoji-personality";
import type { YojiPersonalityDetailedContent } from "@/play/quiz/types";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ resultId: string }>;
};

const SLUG = "yoji-personality";
const quiz = yojiPersonalityQuiz;

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

export default async function YojiPersonalityResultPage({ params }: Props) {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) notFound();

  const dc = result.detailedContent;
  if (!dc || dc.variant !== "yoji-personality") notFound();
  // variant が確認できたので YojiPersonalityDetailedContent として型アサーション
  const yojiDc = dc as YojiPersonalityDetailedContent;

  const shareText = `${quiz.meta.title}の結果は「${result.title}」でした！あなたは? #四字熟語診断 #yolosnet`;
  const shareUrl = `${BASE_URL}/play/${SLUG}/result/${resultId}`;
  const ctaText = "あなたはどの四字熟語? 診断してみよう";

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
      {/* yoji-personality固有のJSX */}
      <div className={styles.detailedSection}>
        {/* キャッチコピー: description の前の静かなリード文（解き終えた画面の ResultCard と同じ組み方）。 */}
        <p className={styles.catchphrase}>{yojiDc.catchphrase}</p>

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

        {/* 四字熟語解説〜すべてのタイプ: 共通コンポーネントで一括レンダリング */}
        <YojiPersonalityContent
          content={yojiDc}
          resultId={resultId}
          placement="resultPage"
          afterMotto={
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
