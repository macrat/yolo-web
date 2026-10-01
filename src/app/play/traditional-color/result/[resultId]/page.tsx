/**
 * traditional-color の結果のページ。この診断の詳しい読みものを組む専用のルートで、
 * 動的ルート /play/[slug]/result/[resultId] より優先される。
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ResultPageShell from "@/play/quiz/_components/ResultPageShell";
import { resultTexts } from "@/play/quiz/resultTexts";
import { resultNameWithReading } from "@/play/quiz/resultName";
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
  if (!result) notFound();

  const FULL_WIDTH_LIMIT = 60;
  const resultName = resultNameWithReading(result);
  const candidateTitle = `${resultName} | ${quiz.meta.title}の結果`;
  const title =
    countCharWidth(`${candidateTitle} | ${SITE_NAME}`) > FULL_WIDTH_LIMIT
      ? resultName
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
  const colorDc = dc as TraditionalColorDetailedContent;

  const { hashtag, ctaText } = resultTexts(SLUG);
  const shareText = `${quiz.meta.shortTitle ?? quiz.meta.title}の結果は「${resultNameWithReading(result)}」でした！あなたは? #${hashtag} #yolosnet`;
  const shareUrl = `${BASE_URL}/play/${SLUG}/result/${resultId}`;

  return (
    <ResultPageShell
      quiz={quiz}
      result={result}
      shareText={shareText}
      shareUrl={shareUrl}
      swatch={result.color}
      lead={colorDc.catchphrase}
      description={result.description}
    >
      <TraditionalColorContent
        content={colorDc}
        afterColorAdvice={
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
