import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import QuizContainer from "@/play/quiz/_components/QuizContainer";
import { quizBySlug, getAllQuizSlugs } from "@/play/quiz/registry";
import {
  generateQuizMetadata,
  generateQuizJsonLd,
  safeJsonLdStringify,
} from "@/lib/seo";
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

  // Referrer type validation is handled client-side by ResultExtraLoader
  // to avoid statically importing heavy quiz data modules into the page bundle

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
      <QuizContainer quiz={quiz} referrerTypeId={refParam} />
    </div>
  );
}
