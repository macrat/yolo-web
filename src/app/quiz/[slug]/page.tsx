import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import QuizContainer from "@/quiz/_components/QuizContainer";
import { quizBySlug, getAllQuizSlugs } from "@/quiz/registry";
import {
  generateQuizMetadata,
  generateQuizJsonLd,
  safeJsonLdStringify,
} from "@/lib/seo";
import { isValidMusicTypeId } from "@/quiz/data/music-personality";
import { renderMusicPersonalityExtra } from "@/quiz/_components/MusicPersonalityResultExtra";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateStaticParams() {
  return getAllQuizSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const quiz = quizBySlug.get(slug);
  if (!quiz) return {};
  return generateQuizMetadata(quiz.meta);
}

export default async function QuizPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const quiz = quizBySlug.get(slug);
  if (!quiz) notFound();

  const jsonLd = generateQuizJsonLd(quiz.meta);

  // Extract referrer type ID from search params for compatibility feature
  const resolvedSearchParams = await searchParams;
  const refParam =
    typeof resolvedSearchParams.ref === "string"
      ? resolvedSearchParams.ref
      : undefined;

  // Only pass valid referrer type IDs for quizzes that support compatibility
  const isMusicPersonality = slug === "music-personality";
  const referrerTypeId =
    isMusicPersonality && refParam && isValidMusicTypeId(refParam)
      ? refParam
      : undefined;

  return (
    <div className={styles.wrapper}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "クイズ", href: "/quiz" },
          { label: quiz.meta.title },
        ]}
      />
      <TrustLevelBadge
        level={quiz.meta.trustLevel}
        note={quiz.meta.trustNote}
      />
      <QuizContainer
        quiz={quiz}
        referrerTypeId={referrerTypeId}
        renderResultExtra={
          isMusicPersonality
            ? renderMusicPersonalityExtra(referrerTypeId)
            : undefined
        }
      />
    </div>
  );
}
