import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import QuizContainer from "@/quiz/_components/QuizContainer";
import { quizBySlug, getAllQuizSlugs } from "@/quiz/registry";
import { generateQuizMetadata, generateQuizJsonLd } from "@/lib/seo";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
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

export default async function QuizPage({ params }: Props) {
  const { slug } = await params;
  const quiz = quizBySlug.get(slug);
  if (!quiz) notFound();

  const jsonLd = generateQuizJsonLd(quiz.meta);

  return (
    <div className={styles.wrapper}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
      <QuizContainer quiz={quiz} />
    </div>
  );
}
