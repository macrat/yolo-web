import type { Metadata } from "next";
import musicPersonalityQuiz from "@/play/quiz/data/music-personality";
import QuizPlayPageLayout from "@/play/quiz/_components/QuizPlayPageLayout";
import { generatePlayMetadata } from "@/play/seo";
import { playContentBySlug } from "@/play/registry";

const SLUG = "music-personality";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * 専用ルートのため generateStaticParams は不要（slugパラメータなし）。
 * Next.js の静的エクスポートとの互換性のために空配列を返す。
 */
export async function generateStaticParams(): Promise<[]> {
  return [];
}

export async function generateMetadata(): Promise<Metadata> {
  const meta = playContentBySlug.get(SLUG);
  if (!meta) return {};
  return generatePlayMetadata(meta);
}

export default async function MusicPersonalityPlayPage({
  searchParams,
}: Props) {
  const resolvedSearchParams = await searchParams;
  const refParam =
    typeof resolvedSearchParams.ref === "string"
      ? resolvedSearchParams.ref
      : undefined;

  return (
    <QuizPlayPageLayout
      quiz={musicPersonalityQuiz}
      slug={SLUG}
      referrerTypeId={refParam}
    />
  );
}
