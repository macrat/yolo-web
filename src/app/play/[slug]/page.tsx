import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import QuizContainer from "@/play/quiz/_components/QuizContainer";
import { quizBySlug, getAllQuizSlugs } from "@/play/quiz/registry";
import { generatePlayMetadata, generatePlayJsonLd } from "@/play/seo";
import { safeJsonLdStringify } from "@/lib/seo";
import { playContentBySlug } from "@/play/registry";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * クイズ14種のslugのみを返す。
 * ゲームは固定ルート（/play/irodori/ 等）で処理されるため、
 * 動的ルートの generateStaticParams には含めない。
 * Next.js では固定ルートが動的ルートより優先されるため衝突しない。
 */
export async function generateStaticParams() {
  return getAllQuizSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = playContentBySlug.get(slug);
  if (!meta) return {};
  return generatePlayMetadata(meta);
}

export default async function PlayQuizPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const quiz = quizBySlug.get(slug);
  if (!quiz) notFound();

  // playContentBySlug にも登録されている前提（タスク1で完了済み）
  const meta = playContentBySlug.get(slug);
  const jsonLd = meta ? generatePlayJsonLd(meta) : null;

  // クイズの相性機能: 友達のタイプIDをクエリパラメータ ref から取得する
  // バリデーションはクライアントサイドの ResultExtraLoader が担うため、ここでは渡すだけ
  const resolvedSearchParams = await searchParams;
  const refParam =
    typeof resolvedSearchParams.ref === "string"
      ? resolvedSearchParams.ref
      : undefined;

  return (
    <div className={styles.wrapper}>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
        />
      )}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "遊ぶ", href: "/play" },
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
