/**
 * contrarian-fortune の結果のページ。この診断の詳しい読みものを組む専用のルートで、
 * 動的ルート /play/[slug]/result/[resultId] より優先される。
 *
 * 相性を持たない診断なので、?with= を受け取らない。
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ResultPageShell from "@/play/quiz/_components/ResultPageShell";
import { resultTexts } from "@/play/quiz/resultTexts";
import { readingTableCells } from "@/play/quiz/readingTableCells";
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

export function generateStaticParams() {
  return getResultIdsForQuiz(SLUG).map((id) => ({ resultId: id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) notFound();

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
  const cfDc = dc as ContrarianFortuneDetailedContent;

  const { hashtag, ctaText } = resultTexts(SLUG);
  const shareText = `${quiz.meta.shortTitle ?? quiz.meta.title}の結果は「${result.title}」でした！あなたは? #${hashtag} #yolosnet`;
  const shareUrl = `${BASE_URL}/play/${SLUG}/result/${resultId}`;

  return (
    <ResultPageShell
      quiz={quiz}
      result={result}
      shareText={shareText}
      shareUrl={shareUrl}
      lead={cfDc.catchphrase}
      description={result.description}
    >
      <ContrarianFortuneContent
        detailedContent={cfDc}
        tableCells={readingTableCells([cfDc])}
        afterThirdPartyNote={
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
