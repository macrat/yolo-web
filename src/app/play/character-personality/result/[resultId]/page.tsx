/**
 * /play/character-personality/result/[resultId] 専用ルート。
 * Next.jsのファイルシステムルーティングにより、
 * 動的ルート /play/[slug]/result/[resultId] より優先される。
 *
 * character-personality variant のみを対象とするため、
 * variant dispatch ロジックが不要でシンプルな実装になる。
 *
 * 相性機能: ?with=typeId パラメータを受け取り、
 * サーバーサイドで相性データを解決してCompatibilityDisplayに渡す。
 * music-personality の相性パターンを踏襲。
 */

import type React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ResultPageShell from "@/play/quiz/_components/ResultPageShell";
import DescriptionExpander from "@/app/play/[slug]/result/[resultId]/DescriptionExpander";
import CompatibilityDisplay from "@/app/play/[slug]/result/[resultId]/CompatibilityDisplay";
import CharacterPersonalityContent from "@/play/quiz/_components/CharacterPersonalityContent";
import InviteFriendButton from "@/play/quiz/_components/InviteFriendButton";
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
  if (!result) return {};

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
  // variant が確認できたので CharacterPersonalityDetailedContent として型アサーション
  const characterDc = dc as CharacterPersonalityDetailedContent;

  // result.color は OGP 画像でも使用するタイプ固有色。
  // フォールバックは quiz.meta.accentColor を使用する。
  const resultColor = result.color ?? quiz.meta.accentColor;

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
        myType: { id: string; title: string; icon?: string };
        friendType: { id: string; title: string; icon?: string };
      }
    | undefined;

  if (compatFriendTypeId) {
    const myResult = quiz.results.find((r) => r.id === resultId);
    const friendResult = quiz.results.find((r) => r.id === compatFriendTypeId);
    const compat = getCompatibility(resultId, compatFriendTypeId);
    if (myResult && friendResult && compat) {
      compatData = {
        compatibility: { label: compat.label, description: compat.description },
        myType: { id: myResult.id, title: myResult.title, icon: myResult.icon },
        friendType: {
          id: friendResult.id,
          title: friendResult.title,
          icon: friendResult.icon,
        },
      };
    }
  }

  const shareText = `${quiz.meta.title}の結果は「${result.title}」でした！あなたは? #${quiz.meta.title.replace(/\s/g, "")} #yolosnet`;
  const shareUrl = `${BASE_URL}/play/${SLUG}/result/${resultId}`;
  const ctaText = "あなたはどのタイプ? 診断してみよう";

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
      {/* character-personality固有のJSX */}
      <div
        className={styles.detailedSection}
        style={{ "--type-color": resultColor } as React.CSSProperties}
      >
        {/*
         * キャッチコピーヒーローエリア:
         * タイプカラーを薄く敷いたヒーローセクション。
         * yoji-personality と同じパターン。
         */}
        <div className={styles.colorHero}>
          {/* キャッチコピー: 結果のコアメッセージ */}
          <p className={styles.catchphrase}>{characterDc.catchphrase}</p>
        </div>

        {/* DescriptionExpander: 長いdescriptionは折りたたみ */}
        <DescriptionExpander
          description={result.description}
          isLong={isDescriptionLong}
        />

        {/* CTA1: --type-color CSS変数で制御（タイプごとに色が変わる） */}
        <div className={styles.trySection}>
          <Link href={`/play/${SLUG}`} className={styles.tryButton}>
            {ctaText}
          </Link>
          <p className={styles.tryCost}>
            全{quiz.meta.questionCount}問 / 登録不要
          </p>
        </div>

        {/* キャラ解説〜全タイプ一覧: 共通コンポーネントで一括レンダリング */}
        <CharacterPersonalityContent
          content={characterDc}
          resultId={resultId}
          resultColor={resultColor}
          headingLevel={2}
          allTypesLayout="grid"
          afterCharacterMessage={
            <>
              {/* 相性紹介: withパラメータがある場合のみ表示 */}
              {compatData && (
                <CompatibilityDisplay
                  quizSlug={SLUG}
                  quizTitle={quiz.meta.title}
                  compatibility={compatData.compatibility}
                  myType={compatData.myType}
                  friendType={compatData.friendType}
                />
              )}
              {/* 友達招待ボタン */}
              <InviteFriendButton
                quizSlug={SLUG}
                resultTypeId={resultId}
                inviteText={INVITE_TEXT}
              />
              {/* CTA2: 全タイプ一覧の前に配置 — コンテンツを読み終えた時点での自然な誘導 */}
              <div className={styles.cta2Section}>
                <Link href={`/play/${SLUG}`} className={styles.cta2Link}>
                  {ctaText}
                </Link>
              </div>
            </>
          }
        />
      </div>
    </ResultPageShell>
  );
}
