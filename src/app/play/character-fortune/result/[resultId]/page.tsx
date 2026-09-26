/**
 * /play/character-fortune/result/[resultId] 専用ルート。
 * Next.jsのファイルシステムルーティングにより、
 * 動的ルート /play/[slug]/result/[resultId] より優先される。
 *
 * character-fortune variant のみを対象とするため、
 * variant dispatch ロジックが不要でシンプルな実装になる。
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import ResultPageShell from "@/play/quiz/_components/ResultPageShell";
import OtherTypesNav from "@/play/quiz/_components/OtherTypesNav";
import PhrasedText from "@/components/PhrasedText";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { countCharWidth } from "@/lib/countCharWidth";
import { getResultIdsForQuiz } from "@/play/quiz/registry";
import { contentIdForQuiz } from "@/play/quiz/contentId";
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
    >
      <div className={styles.detailedSection}>
        <p className={styles.characterIntro}>{cf.characterIntro}</p>

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

        <PhrasedText
          as="h2"
          phrases={splitIntoPhrases(cf.behaviorsHeading)}
          className={styles.subheading}
          {...headingFontAttr(cf.behaviorsHeading)}
        />
        <ul className={styles.list}>
          {cf.behaviors.map((behavior, i) => (
            <li key={i}>{behavior}</li>
          ))}
        </ul>

        {/* あるあるを読んで「自分のことだ」と思った所で共有できるよう、読みものの途中にも置く。 */}
        <div className={styles.midShareSection}>
          <ShareButtons
            url={shareUrl}
            title={quiz.meta.title}
            text={shareText}
            sns={["x", "line", "copy"]}
            contentType="diagnosis"
            contentId={contentIdForQuiz(SLUG)}
            surface="text"
          />
        </div>

        <PhrasedText
          as="h2"
          phrases={splitIntoPhrases(cf.characterMessageHeading)}
          className={styles.subheading}
          {...headingFontAttr(cf.characterMessageHeading)}
        />
        <p className={styles.paragraph}>{cf.characterMessage}</p>

        <PhrasedText
          as="h2"
          phrases={splitIntoPhrases(THIRD_PARTY_HEADING)}
          className={styles.subheading}
          {...headingFontAttr(THIRD_PARTY_HEADING)}
        />
        <p className={styles.paragraph}>{cf.thirdPartyNote}</p>

        <div className={styles.compatibilitySection}>
          <p className={styles.paragraph}>{cf.compatibilityPrompt}</p>
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
      </div>
    </ResultPageShell>
  );
}
