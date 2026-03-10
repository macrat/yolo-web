import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import ShareButtons from "@/quiz/_components/ShareButtons";
import {
  quizBySlug,
  getAllQuizSlugs,
  getResultIdsForQuiz,
} from "@/quiz/registry";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import {
  getCompatibility,
  isValidMusicTypeId,
} from "@/quiz/data/music-personality";
import CompatibilityDisplay from "./CompatibilityDisplay";
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
 * Extract the "with" query parameter for compatibility display.
 * Returns a valid type ID or undefined.
 */
function extractWithParam(
  resolvedSearchParams:
    | Record<string, string | string[] | undefined>
    | undefined,
  slug: string,
  resultId: string,
): string | undefined {
  if (!resolvedSearchParams) return undefined;
  const withParam =
    typeof resolvedSearchParams.with === "string"
      ? resolvedSearchParams.with
      : undefined;
  const isMusicPersonality = slug === "music-personality";
  if (
    isMusicPersonality &&
    withParam &&
    isValidMusicTypeId(withParam) &&
    isValidMusicTypeId(resultId)
  ) {
    return withParam;
  }
  return undefined;
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
    const compat = getCompatibility(resultId, compatFriendTypeId);
    title = `${result.title} x ${friendResult?.title ?? ""} - ${compat?.label ?? "相性結果"}`;
    description = compat?.description ?? result.description;
  } else {
    title = `${quiz.meta.title}の結果: ${result.title}`;
    description = result.description;
  }

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    /* Compatibility result pages and individual result pages are noindex */
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${BASE_URL}/quiz/${slug}/result/${resultId}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/quiz/${slug}/result/${resultId}`,
    },
  };
}

export default async function QuizResultPage({ params, searchParams }: Props) {
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

  const shareText = `${quiz.meta.title}の結果は「${result.title}」でした! #yolosnet`;
  const shareUrl = `${BASE_URL}/quiz/${slug}/result/${resultId}`;

  return (
    <div className={styles.wrapper}>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "クイズ", href: "/quiz" },
          { label: quiz.meta.title, href: `/quiz/${slug}` },
          { label: "結果" },
        ]}
      />
      <div className={styles.card}>
        {result.icon && <div className={styles.icon}>{result.icon}</div>}
        <h1 className={styles.title}>{result.title}</h1>
        <p className={styles.quizName}>{quiz.meta.title}の結果</p>
        <p className={styles.description}>{result.description}</p>
        <Link
          href={`/quiz/${slug}`}
          className={styles.tryButton}
          style={{ backgroundColor: quiz.meta.accentColor }}
        >
          あなたも挑戦してみる?
        </Link>
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
        {compatFriendTypeId && (
          <CompatibilityDisplay
            myResultId={resultId}
            friendTypeId={compatFriendTypeId}
            quizSlug={slug}
          />
        )}
      </div>
    </div>
  );
}
