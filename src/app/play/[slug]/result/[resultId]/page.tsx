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
        <Link
          href={`/play/${slug}`}
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
    </div>
  );
}
