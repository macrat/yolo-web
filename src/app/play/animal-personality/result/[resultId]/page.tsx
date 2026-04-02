/**
 * /play/animal-personality/result/[resultId] 専用ルート。
 * ステップ4: Next.jsのファイルシステムルーティングにより、
 * 動的ルート /play/[slug]/result/[resultId] より優先される。
 *
 * animal-personality variant のみを対象とするため、
 * variant dispatch ロジックが不要でシンプルな実装になる。
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ResultPageShell from "@/play/quiz/_components/ResultPageShell";
import DescriptionExpander from "@/app/play/[slug]/result/[resultId]/DescriptionExpander";
import CompatibilityDisplay from "@/app/play/[slug]/result/[resultId]/CompatibilityDisplay";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { countCharWidth } from "@/lib/countCharWidth";
import { getResultIdsForQuiz } from "@/play/quiz/registry";
import animalPersonalityQuiz, {
  getCompatibility,
  isValidAnimalTypeId,
} from "@/play/quiz/data/animal-personality";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ resultId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const SLUG = "animal-personality";
const quiz = animalPersonalityQuiz;

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
    withParam && isValidAnimalTypeId(withParam) && isValidAnimalTypeId(resultId)
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

export default async function AnimalPersonalityResultPage({
  params,
  searchParams,
}: Props) {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) notFound();

  const dc = result.detailedContent;
  if (!dc || dc.variant !== "animal-personality") notFound();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const withParam =
    typeof resolvedSearchParams?.with === "string"
      ? resolvedSearchParams.with
      : undefined;
  const compatFriendTypeId =
    withParam && isValidAnimalTypeId(withParam) && isValidAnimalTypeId(resultId)
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
      {/* animal-personality固有のJSX */}
      <div className={styles.detailedSection}>
        {/* キャッチコピー: DescriptionExpanderの前に配置し第一印象を与える */}
        <p className={styles.catchphrase}>{dc.catchphrase}</p>

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
            style={{ backgroundColor: quiz.meta.accentColor }}
          >
            {ctaText}
          </Link>
          <p className={styles.tryCost}>
            全{quiz.meta.questionCount}問 / 登録不要
          </p>
        </div>

        {/* 強み */}
        <h2
          className={styles.detailedSectionHeading}
          style={{ color: quiz.meta.accentColor }}
        >
          このタイプの強み
        </h2>
        <ul className={styles.strengthsList}>
          {dc.strengths.map((item, i) => (
            <li key={i} className={styles.strengthsItem}>
              {item}
            </li>
          ))}
        </ul>

        {/* 弱み */}
        <h2
          className={styles.detailedSectionHeading}
          style={{ color: quiz.meta.accentColor }}
        >
          このタイプの弱み
        </h2>
        <ul className={styles.weaknessesList}>
          {dc.weaknesses.map((item, i) => (
            <li key={i} className={styles.weaknessesItem}>
              {item}
            </li>
          ))}
        </ul>

        {/* あるある行動パターン */}
        <h2
          className={styles.detailedSectionHeading}
          style={{ color: quiz.meta.accentColor }}
        >
          この動物に似た行動パターン
        </h2>
        <ul className={styles.behaviorsList}>
          {dc.behaviors.map((behavior, i) => (
            <li key={i} className={styles.behaviorsItem}>
              {behavior}
            </li>
          ))}
        </ul>

        {/* 今日のアクション */}
        <h2
          className={styles.detailedSectionHeading}
          style={{ color: quiz.meta.accentColor }}
        >
          今日試してほしいこと
        </h2>
        <div
          className={styles.todayActionCard}
          style={{ backgroundColor: `${quiz.meta.accentColor}18` }}
        >
          {dc.todayAction}
        </div>

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

        {/* CTA2: 全タイプ一覧の前に配置 — コンテンツを読み終えた時点での自然な誘導 */}
        <div className={styles.cta2Section}>
          <Link href={`/play/${SLUG}`} className={styles.cta2Link}>
            {ctaText}
          </Link>
        </div>

        {/* 全タイプ一覧セクション */}
        <div className={styles.allTypesSection}>
          <h2 className={styles.allTypesCta}>他の動物も見てみよう</h2>

          <ul className={styles.allTypesList}>
            {quiz.results.map((r) => (
              <li
                key={r.id}
                className={
                  r.id === resultId
                    ? styles.allTypesItemCurrent
                    : styles.allTypesItem
                }
              >
                <Link href={`/play/${SLUG}/result/${r.id}`}>
                  {r.icon && <span>{r.icon}</span>}
                  <span>{r.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ResultPageShell>
  );
}
