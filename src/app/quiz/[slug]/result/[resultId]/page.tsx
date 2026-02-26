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
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string; resultId: string }>;
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, resultId } = await params;
  const quiz = quizBySlug.get(slug);
  if (!quiz) return {};
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) return {};

  const title = `${quiz.meta.title}の結果: ${result.title}`;
  const description = result.description;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${BASE_URL}/quiz/${slug}/result/${resultId}`,
      siteName: SITE_NAME,
    },
    alternates: {
      canonical: `${BASE_URL}/quiz/${slug}/result/${resultId}`,
    },
  };
}

export default async function QuizResultPage({ params }: Props) {
  const { slug, resultId } = await params;
  const quiz = quizBySlug.get(slug);
  if (!quiz) notFound();

  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) notFound();

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
          />
        </div>
      </div>
    </div>
  );
}
