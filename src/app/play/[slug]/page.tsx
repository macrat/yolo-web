import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { quizBySlug, getAllQuizSlugs } from "@/play/quiz/registry";
import { generatePlayMetadata } from "@/play/seo";
import { playContentBySlug } from "@/play/registry";
import QuizPlayPageLayout from "@/play/quiz/_components/QuizPlayPageLayout";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Slugs that have their own dedicated /play/<slug>/page.tsx */
const CONCRETE_PLAY_SLUGS = ["music-personality"] as const;

/**
 * クイズ14種のslugのみを返す。
 * ゲームは固定ルート（/play/irodori/ 等）で処理されるため、
 * 動的ルートの generateStaticParams には含めない。
 * Next.js では固定ルートが動的ルートより優先されるため衝突しない。
 * CONCRETE_PLAY_SLUGS は専用ルートを持つため除外する。
 */
export async function generateStaticParams() {
  return getAllQuizSlugs()
    .filter((slug) => !CONCRETE_PLAY_SLUGS.includes(slug as never))
    .map((slug) => ({ slug }));
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

  // クイズの相性機能: 友達のタイプIDをクエリパラメータ ref から取得する
  // バリデーションはクライアントサイドの ResultExtraLoader が担うため、ここでは渡すだけ
  const resolvedSearchParams = await searchParams;
  const refParam =
    typeof resolvedSearchParams.ref === "string"
      ? resolvedSearchParams.ref
      : undefined;

  return (
    <QuizPlayPageLayout quiz={quiz} slug={slug} referrerTypeId={refParam} />
  );
}
