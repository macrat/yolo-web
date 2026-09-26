/**
 * character-fortune の結果のページ。この診断の詳しい読みものを組む専用のルートで、
 * 動的ルート /play/[slug]/result/[resultId] より優先される。
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ResultPageShell from "@/play/quiz/_components/ResultPageShell";
import OtherTypesNav from "@/play/quiz/_components/OtherTypesNav";
import {
  Reading,
  ReadingHeading,
  ReadingList,
  ReadingText,
} from "@/play/quiz/_components/ResultReading";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { countCharWidth } from "@/lib/countCharWidth";
import { getResultIdsForQuiz } from "@/play/quiz/registry";
import characterFortuneQuiz from "@/play/quiz/data/character-fortune";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ resultId: string }>;
};

const SLUG = "character-fortune";
const quiz = characterFortuneQuiz;
const THIRD_PARTY_HEADING = "このキャラの守護を受けている人と一緒にいると";

export function generateStaticParams() {
  return getResultIdsForQuiz(SLUG).map((id) => ({ resultId: id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) return {};

  // character-fortuneは常にdetailedContentありなので常にindex: true
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

export default async function CharacterFortuneResultPage({ params }: Props) {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) notFound();

  const shareText = `${quiz.meta.title}の結果は「${result.title}」でした！あなたは? #${quiz.meta.title.replace(/\s/g, "")} #yolosnet`;
  const shareUrl = `${BASE_URL}/play/${SLUG}/result/${resultId}`;
  const ctaText = "あなたはどのタイプ? 診断してみよう";

  // detailedContent は character-fortune では必ず存在する
  const cf = result.detailedContent;
  if (!cf || cf.variant !== "character-fortune") notFound();

  return (
    <ResultPageShell
      quiz={quiz}
      result={result}
      shareText={shareText}
      shareUrl={shareUrl}
      lead={cf.characterIntro}
      ctaText={ctaText}
    >
      <Reading>
        <ReadingHeading
          placement="resultPage"
          phrases={splitIntoPhrases(cf.behaviorsHeading)}
        />
        <ReadingList items={cf.behaviors} />

        <ReadingHeading
          placement="resultPage"
          phrases={splitIntoPhrases(cf.characterMessageHeading)}
        />
        <ReadingText>{cf.characterMessage}</ReadingText>

        <ReadingHeading
          placement="resultPage"
          phrases={splitIntoPhrases(THIRD_PARTY_HEADING)}
        />
        <ReadingText>{cf.thirdPartyNote}</ReadingText>
      </Reading>

      <div className={styles.compatibilitySection}>
        <p className={styles.compatibilityPrompt}>{cf.compatibilityPrompt}</p>
        <Link
          href={`/play/${SLUG}`}
          className={styles.tryLink}
          data-text-box="inline"
        >
          診断して相性を見てみる
        </Link>
      </div>

      <OtherTypesNav
        quizSlug={SLUG}
        currentResultId={resultId}
        results={quiz.results}
        placement="resultPage"
      />
      <div className={styles.closingTry}>
        <Link
          href={`/play/${SLUG}`}
          className={styles.tryLink}
          data-text-box="inline"
        >
          {ctaText}
        </Link>
        <p className={styles.tryCost}>
          全{quiz.meta.questionCount}問 / 登録不要
        </p>
      </div>
    </ResultPageShell>
  );
}
