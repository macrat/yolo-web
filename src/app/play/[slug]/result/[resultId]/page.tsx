import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import ShareButtons from "@/play/quiz/_components/ShareButtons";
import {
  quizBySlug,
  getAllQuizSlugs,
  getResultIdsForQuiz,
} from "@/play/quiz/registry";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { getCompatibility } from "@/play/quiz/data/music-personality";
import {
  getCompatibility as getCharacterCompatibility,
  default as characterPersonalityQuiz,
} from "@/play/quiz/data/character-personality";
import CompatibilityDisplay from "./CompatibilityDisplay";
import { extractWithParam } from "./extractWithParam";
import RelatedQuizzes from "@/play/quiz/_components/RelatedQuizzes";
import RecommendedContent from "@/play/_components/RecommendedContent";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string; resultId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateStaticParams() {
  const params: Array<{ slug: string; resultId: string }> = [];
  for (const slug of getAllQuizSlugs()) {
    for (const resultId of getResultIdsForQuiz(slug)) {
      params.push({ slug, resultId });
    }
  }
  return params;
}

/**
 * 全角文字1文字 = 2、半角文字 = 1 として文字列の表示幅を計算する。
 * タイトル長の制限判定に使用する。
 */
function countCharWidth(text: string): number {
  let width = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    // CJK・ひらがな・カタカナ・全角記号等を全角として判定
    if (
      (code >= 0x1100 && code <= 0x11ff) ||
      (code >= 0x2e80 && code <= 0x2fff) ||
      (code >= 0x3000 && code <= 0x9fff) ||
      (code >= 0xa960 && code <= 0xa97f) ||
      (code >= 0xac00 && code <= 0xd7ff) ||
      (code >= 0xf900 && code <= 0xfaff) ||
      (code >= 0xfe10 && code <= 0xfe1f) ||
      (code >= 0xfe30 && code <= 0xfe4f) ||
      (code >= 0xff00 && code <= 0xff60) ||
      (code >= 0xffe0 && code <= 0xffe6)
    ) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug, resultId } = await params;
  const quiz = quizBySlug.get(slug);
  if (!quiz) return {};
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) return {};

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const compatFriendTypeId = extractWithParam(
    resolvedSearchParams,
    slug,
    resultId,
  );

  let title: string;
  let description: string;

  if (compatFriendTypeId) {
    const friendResult = quiz.results.find((r) => r.id === compatFriendTypeId);
    // Fetch compatibility data via the correct function based on quiz slug
    const compat =
      slug === "character-personality"
        ? getCharacterCompatibility(resultId, compatFriendTypeId)
        : getCompatibility(resultId, compatFriendTypeId);
    title = `${result.title} x ${friendResult?.title ?? ""} - ${compat?.label ?? "相性結果"}`;
    description = compat?.description ?? result.description;
  } else {
    // 新しいtitle形式: 「結果タイトル | クイズ名の結果 | SITE_NAME」
    // 完全なtitle（candidateTitle + " | " + SITE_NAME）が全角30文字相当（width 60）を
    // 超える場合はクイズ名部分を省略してフォールバック。
    // SITE_NAMEサフィックス（" | yolos.net" = 半角12文字）を含めた幅で判定する。
    const FULL_WIDTH_LIMIT = 60;
    const candidateTitle = `${result.title} | ${quiz.meta.title}の結果`;
    title =
      countCharWidth(`${candidateTitle} | ${SITE_NAME}`) > FULL_WIDTH_LIMIT
        ? result.title
        : candidateTitle;
    description = result.description;
  }

  // detailedContent があり、かつ相性ページでない場合のみ index: true にする
  const hasDetailedContent = Boolean(result.detailedContent);
  const shouldIndex = hasDetailedContent && !compatFriendTypeId;

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
      url: `${BASE_URL}/play/${slug}/result/${resultId}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/play/${slug}/result/${resultId}`,
    },
  };
}

/**
 * 静的結果ページ — シェアリンクや検索から来た「第三者」向けのランディングページ。
 *
 * このページを閲覧するのはクイズを受けた本人ではない。本人は /play/[slug] 上の
 * ResultCard（動的コンポーネント）で結果を確認し、そこからシェアする。
 * このページに到達するのは、シェアリンクをクリックした友人や、検索エンジンから
 * 来た来訪者であり、彼らにとっての主要アクションは「自分もクイズを受けてみる」
 * （CTAボタン）である。
 */
export default async function PlayQuizResultPage({
  params,
  searchParams,
}: Props) {
  const { slug, resultId } = await params;
  const quiz = quizBySlug.get(slug);
  if (!quiz) notFound();

  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) notFound();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const compatFriendTypeId = extractWithParam(
    resolvedSearchParams,
    slug,
    resultId,
  );

  // Resolve compatibility data server-side for all quiz slugs.
  // This keeps CompatibilityDisplay as a simple display component with required props.
  let compatData:
    | {
        compatibility: { label: string; description: string };
        myType: { id: string; title: string; icon?: string };
        friendType: { id: string; title: string; icon?: string };
      }
    | undefined;

  if (compatFriendTypeId) {
    const getCompatFn =
      slug === "character-personality"
        ? getCharacterCompatibility
        : getCompatibility;
    const quizResults =
      slug === "character-personality"
        ? characterPersonalityQuiz.results
        : quiz.results;
    const myResult2 = quizResults.find((r) => r.id === resultId);
    const friendResult2 = quizResults.find((r) => r.id === compatFriendTypeId);
    const compat = getCompatFn(resultId, compatFriendTypeId);
    if (myResult2 && friendResult2 && compat) {
      compatData = {
        compatibility: {
          label: compat.label,
          description: compat.description,
        },
        myType: {
          id: myResult2.id,
          title: myResult2.title,
          icon: myResult2.icon,
        },
        friendType: {
          id: friendResult2.id,
          title: friendResult2.title,
          icon: friendResult2.icon,
        },
      };
    }
  }

  const shareText = `${quiz.meta.title}の結果は「${result.title}」でした! #${quiz.meta.title.replace(/\s/g, "")} #yolosnet`;
  const shareUrl = `${BASE_URL}/play/${slug}/result/${resultId}`;

  // CTAテキストをクイズタイプに応じて出し分ける
  const ctaText =
    quiz.meta.type === "personality"
      ? "あなたはどのタイプ? 診断してみよう"
      : "あなたも挑戦してみよう";

  const { detailedContent } = result;

  return (
    <div className={styles.wrapper}>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "遊ぶ", href: "/play" },
          { label: quiz.meta.title, href: `/play/${slug}` },
          { label: "結果" },
        ]}
      />
      <div className={styles.card}>
        {result.icon && <div className={styles.icon}>{result.icon}</div>}
        <h1 className={styles.title}>{result.title}</h1>
        <p className={styles.quizName}>{quiz.meta.title}の結果</p>
        <p className={styles.description}>{result.description}</p>

        {/* detailedContent がある場合のみ追加セクションを表示 */}
        {detailedContent && (
          <div className={styles.detailedSection}>
            <h2
              className={styles.detailedSectionHeading}
              style={{ color: quiz.meta.accentColor }}
            >
              あなたの特徴
            </h2>
            <ul className={styles.traitsList}>
              {detailedContent.traits.map((trait, i) => (
                <li key={i} className={styles.traitsItem}>
                  {trait}
                </li>
              ))}
            </ul>

            <h2
              className={styles.detailedSectionHeading}
              style={{ color: quiz.meta.accentColor }}
            >
              こんなところ、ありませんか?
            </h2>
            <ul className={styles.behaviorsList}>
              {detailedContent.behaviors.map((behavior, i) => (
                <li key={i} className={styles.behaviorsItem}>
                  {behavior}
                </li>
              ))}
            </ul>

            <div
              className={styles.adviceCard}
              style={{ backgroundColor: `${quiz.meta.accentColor}18` }}
            >
              {detailedContent.advice}
            </div>
          </div>
        )}

        <div className={styles.trySection}>
          <Link
            href={`/play/${slug}`}
            className={styles.tryButton}
            style={{ backgroundColor: quiz.meta.accentColor }}
          >
            {ctaText}
          </Link>
          <p className={styles.tryCost}>
            全{quiz.meta.questionCount}問 / 登録不要
          </p>
        </div>
        <div className={styles.shareSection}>
          <ShareButtons
            shareText={shareText}
            shareUrl={shareUrl}
            quizTitle={quiz.meta.title}
            contentType={
              quiz.meta.type === "personality" ? "diagnosis" : "quiz"
            }
            contentId={`quiz-${slug}`}
          />
        </div>
        {compatData && (
          <CompatibilityDisplay
            quizSlug={slug}
            quizTitle={quiz.meta.title}
            compatibility={compatData.compatibility}
            myType={compatData.myType}
            friendType={compatData.friendType}
          />
        )}
      </div>
      <RelatedQuizzes currentSlug={slug} category={quiz.meta.category} />
      <RecommendedContent currentSlug={slug} />
    </div>
  );
}
