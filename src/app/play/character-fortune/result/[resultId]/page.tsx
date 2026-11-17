/**
 * character-fortune の結果のページ。この診断の詳しい読みものを組む専用のルートで、
 * 動的ルート /play/[slug]/result/[resultId] より優先される。
 *
 * ?with=typeId で友達のタイプを受け取ると、相性をサーバーで解決して CompatibilityDisplay に渡す。
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ResultPageShell from "@/play/quiz/_components/ResultPageShell";
import CompatibilityDisplay from "@/play/quiz/_components/CompatibilityDisplay";
import {
  Reading,
  ReadingHeading,
  ReadingList,
  ReadingText,
} from "@/play/quiz/_components/ResultReading";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { countCharWidth } from "@/lib/countCharWidth";
import { getResultIdsForQuiz } from "@/play/quiz/registry";
import characterFortuneQuiz, {
  getCompatibility,
  isValidCharacterTypeId,
} from "@/play/quiz/data/character-fortune";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ resultId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const SLUG = "character-fortune";
const quiz = characterFortuneQuiz;
/** 第三者から見た場面の小見出し。コードに書いた決まった文なので、書き手が文節で区切った並びで持つ。 */
export const THIRD_PARTY_HEADING = [
  "この",
  "キャラの",
  "守護を",
  "受けている",
  "人と",
  "一緒に",
  "いると",
] as const;

export function generateStaticParams() {
  return getResultIdsForQuiz(SLUG).map((id) => ({ resultId: id }));
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) notFound();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const withParam =
    typeof resolvedSearchParams?.with === "string"
      ? resolvedSearchParams.with
      : undefined;
  const compatFriendTypeId =
    withParam &&
    isValidCharacterTypeId(withParam) &&
    isValidCharacterTypeId(resultId)
      ? withParam
      : undefined;

  let title: string;
  let description: string;

  if (compatFriendTypeId) {
    const friendResult = quiz.results.find((r) => r.id === compatFriendTypeId);
    const compat = getCompatibility(resultId, compatFriendTypeId);
    title = `${result.title} x ${friendResult?.title ?? ""} - ${compat?.label ?? "相性結果"}`;
    description = compat?.description ?? result.description;
  } else {
    const FULL_WIDTH_LIMIT = 60;
    const candidateTitle = `${result.title} | ${quiz.meta.title}の結果`;
    title =
      countCharWidth(`${candidateTitle} | ${SITE_NAME}`) > FULL_WIDTH_LIMIT
        ? result.title
        : candidateTitle;
    description = result.description;
  }

  const shouldIndex = !compatFriendTypeId;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    robots: shouldIndex
      ? { index: true, follow: true }
      : { index: false, follow: true },
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

export default async function CharacterFortuneResultPage({
  params,
  searchParams,
}: Props) {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) notFound();

  const shareText = `${quiz.meta.shortTitle ?? quiz.meta.title}の結果は「${result.title}」でした！あなたは? #${quiz.meta.title.replace(/\s/g, "")} #yolosnet`;
  const shareUrl = `${BASE_URL}/play/${SLUG}/result/${resultId}`;
  const ctaText = "あなたはどのタイプ? 診断してみよう";

  // detailedContent は character-fortune では必ず存在する
  const cf = result.detailedContent;
  if (!cf || cf.variant !== "character-fortune") notFound();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const withParam =
    typeof resolvedSearchParams?.with === "string"
      ? resolvedSearchParams.with
      : undefined;
  const compatFriendTypeId =
    withParam &&
    isValidCharacterTypeId(withParam) &&
    isValidCharacterTypeId(resultId)
      ? withParam
      : undefined;

  // 相性データの解決（サーバーサイド）
  let compatData:
    | {
        compatibility: { label: string; description: string };
        myType: { id: string; title: string };
        friendType: { id: string; title: string };
      }
    | undefined;

  if (compatFriendTypeId) {
    const friendResult = quiz.results.find((r) => r.id === compatFriendTypeId);
    const compat = getCompatibility(resultId, compatFriendTypeId);
    if (friendResult && compat) {
      compatData = {
        compatibility: { label: compat.label, description: compat.description },
        myType: { id: result.id, title: result.title },
        friendType: { id: friendResult.id, title: friendResult.title },
      };
    }
  }

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
          phrases={splitIntoPhrases(cf.behaviorsHeading)}
          headingFont={headingFontAttr(cf.behaviorsHeading)}
        />
        <ReadingList items={cf.behaviors} />

        <ReadingHeading
          phrases={splitIntoPhrases(cf.characterMessageHeading)}
          headingFont={headingFontAttr(cf.characterMessageHeading)}
        />
        <ReadingText>{cf.characterMessage}</ReadingText>

        <ReadingHeading phrases={THIRD_PARTY_HEADING} />
        <ReadingText>{cf.thirdPartyNote}</ReadingText>
      </Reading>

      {compatData && (
        <CompatibilityDisplay
          quizSlug={SLUG}
          quizTitle={quiz.meta.title}
          compatibility={compatData.compatibility}
          myType={compatData.myType}
          friendType={compatData.friendType}
        />
      )}

      <div className={styles.compatibilitySection}>
        <p className={styles.compatibilityPrompt}>{cf.compatibilityPrompt}</p>
        <Link
          href={`/play/${SLUG}?ref=${resultId}`}
          className={styles.tryLink}
          data-text-box="inline"
        >
          診断して相性を見てみる
        </Link>
        <p className={styles.tryCost}>
          全{quiz.meta.questionCount}問 / 登録不要
        </p>
      </div>
    </ResultPageShell>
  );
}
