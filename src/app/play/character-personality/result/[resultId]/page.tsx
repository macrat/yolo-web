/**
 * character-personality の結果のページ。この診断の詳しい読みものを組む専用のルートで、
 * 動的ルート /play/[slug]/result/[resultId] より優先される。
 *
 * ?with=typeId で友達のタイプを受け取ると、相性をサーバーで解決して CompatibilityDisplay に渡す。
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ResultPageShell from "@/play/quiz/_components/ResultPageShell";
import { resultTexts } from "@/play/quiz/resultTexts";
import CompatibilityDisplay from "@/play/quiz/_components/CompatibilityDisplay";
import CharacterPersonalityContent from "@/play/quiz/_components/CharacterPersonalityContent";
import InviteFriendButton from "@/play/quiz/_components/InviteFriendButton";
import { contentIdForQuiz } from "@/play/quiz/contentId";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { countCharWidth } from "@/lib/countCharWidth";
import { getResultIdsForQuiz } from "@/play/quiz/registry";
import characterPersonalityQuiz, {
  getCompatibility,
  isValidCharacterPersonalityTypeId,
} from "@/play/quiz/data/character-personality";
import type { CharacterPersonalityDetailedContent } from "@/play/quiz/types";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ resultId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const SLUG = "character-personality";
const INVITE_TEXT = "似たキャラ診断で相性を調べよう!";
const quiz = characterPersonalityQuiz;

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
    isValidCharacterPersonalityTypeId(withParam) &&
    isValidCharacterPersonalityTypeId(resultId)
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

export default async function CharacterPersonalityResultPage({
  params,
  searchParams,
}: Props) {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) notFound();

  const dc = result.detailedContent;
  if (!dc || dc.variant !== "character-personality") notFound();
  const characterDc = dc as CharacterPersonalityDetailedContent;

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const withParam =
    typeof resolvedSearchParams?.with === "string"
      ? resolvedSearchParams.with
      : undefined;
  const compatFriendTypeId =
    withParam &&
    isValidCharacterPersonalityTypeId(withParam) &&
    isValidCharacterPersonalityTypeId(resultId)
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
    const myResult = quiz.results.find((r) => r.id === resultId);
    const friendResult = quiz.results.find((r) => r.id === compatFriendTypeId);
    const compat = getCompatibility(resultId, compatFriendTypeId);
    if (myResult && friendResult && compat) {
      compatData = {
        compatibility: { label: compat.label, description: compat.description },
        myType: { id: myResult.id, title: myResult.title },
        friendType: {
          id: friendResult.id,
          title: friendResult.title,
        },
      };
    }
  }

  const { hashtag, ctaText } = resultTexts(SLUG);
  const shareText = `${quiz.meta.shortTitle ?? quiz.meta.title}の結果は「${result.title}」でした！あなたは? #${hashtag} #yolosnet`;
  const shareUrl = `${BASE_URL}/play/${SLUG}/result/${resultId}`;

  return (
    <ResultPageShell
      quiz={quiz}
      result={result}
      shareText={shareText}
      shareUrl={shareUrl}
      lead={characterDc.catchphrase}
      description={result.description}
    >
      <CharacterPersonalityContent
        content={characterDc}
        resultId={resultId}
        afterCharacterMessage={
          <>
            {compatData && (
              <CompatibilityDisplay
                quizSlug={SLUG}
                quizTitle={quiz.meta.title}
                compatibility={compatData.compatibility}
                myType={compatData.myType}
                friendType={compatData.friendType}
              />
            )}
            <InviteFriendButton
              quizSlug={SLUG}
              resultTypeId={resultId}
              inviteText={INVITE_TEXT}
              contentId={contentIdForQuiz(SLUG)}
            />
            <div className={styles.cta2Section}>
              <Link
                href={`/play/${SLUG}`}
                className={styles.cta2Link}
                data-text-box="inline"
              >
                {ctaText}
              </Link>
            </div>
          </>
        }
      />
    </ResultPageShell>
  );
}
