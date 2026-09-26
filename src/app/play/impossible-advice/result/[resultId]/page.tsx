/**
 * impossible-advice の結果のページ。この診断の詳しい読みものを組む専用のルートで、
 * 動的ルート /play/[slug]/result/[resultId] より優先される。
 *
 * 相性を持たない診断なので、?with= を受け取らない。
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ResultPageShell from "@/play/quiz/_components/ResultPageShell";
import ImpossibleAdviceContent from "@/play/quiz/_components/ImpossibleAdviceContent";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { countCharWidth } from "@/lib/countCharWidth";
import { getResultIdsForQuiz } from "@/play/quiz/registry";
import impossibleAdviceQuiz from "@/play/quiz/data/impossible-advice";
import type { ImpossibleAdviceDetailedContent } from "@/play/quiz/types";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ resultId: string }>;
};

const SLUG = "impossible-advice";
const quiz = impossibleAdviceQuiz;

/** 診断への誘いの文言。375px の画面で1行に収まる長さに保つ。 */
export const CTA_TEXT = "あなたも診断してみよう";

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

export default async function ImpossibleAdviceResultPage({ params }: Props) {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) notFound();

  const dc = result.detailedContent;
  if (!dc || dc.variant !== "impossible-advice") notFound();
  const iaDc = dc as ImpossibleAdviceDetailedContent;

  const shareText = `${quiz.meta.title}の結果は「${result.title}」でした！あなたは? #達成困難アドバイス診断 #yolosnet`;
  const shareUrl = `${BASE_URL}/play/${SLUG}/result/${resultId}`;
  const ctaText = CTA_TEXT;

  return (
    <ResultPageShell
      quiz={quiz}
      result={result}
      shareText={shareText}
      shareUrl={shareUrl}
      lead={iaDc.catchphrase}
      description={result.description}
      ctaText={ctaText}
    >
      <ImpossibleAdviceContent
        quizSlug={SLUG}
        resultId={resultId}
        detailedContent={iaDc}
        allResults={quiz.results}
        placement="resultPage"
        afterPracticalTip={
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
    </ResultPageShell>
  );
}
