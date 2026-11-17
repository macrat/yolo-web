import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { quizBySlug, getAllQuizSlugs } from "@/play/quiz/registry";
import { generatePlayMetadata } from "@/play/seo";
import { playContentBySlug } from "@/play/registry";
import { playShareImageContent } from "@/play/share-image-content";
import { shareOpenGraphImage } from "@/lib/share-image";
import QuizPlayPageLayout from "@/play/quiz/_components/QuizPlayPageLayout";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * 全クイズのslugを返す。
 * ゲームは固定ルート（/play/irodori/ 等）で処理されるため、
 * 動的ルートの generateStaticParams には含めない。
 * 専用ルートを持つクイズ（/play/music-personality/ 等）は
 * Next.jsのファイルシステムルーティングにより自動的に専用ルートが優先されるため、
 * 除外リストは不要。
 */
export async function generateStaticParams() {
  return getAllQuizSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = playContentBySlug.get(slug);
  if (!meta) notFound();
  return generatePlayMetadata(
    meta,
    shareOpenGraphImage(`/play/${slug}`, playShareImageContent(meta)),
  );
}

export default async function PlayQuizPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const quiz = quizBySlug.get(slug);
  if (!quiz) notFound();

  // クイズの相性機能: 友達のタイプIDをクエリパラメータ ref から取得する
  // 有効なタイプかを確かめるのは ref を受け取って相性を出す各部品なので、ここでは渡すだけ
  const resolvedSearchParams = await searchParams;
  const refParam =
    typeof resolvedSearchParams.ref === "string"
      ? resolvedSearchParams.ref
      : undefined;

  return (
    <QuizPlayPageLayout quiz={quiz} slug={slug} referrerTypeId={refParam} />
  );
}
