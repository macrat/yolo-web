import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";
import {
  quizBySlug,
  getAllQuizSlugs,
  getResultIdsForQuiz,
} from "@/play/quiz/registry";

export const alt = "クイズ結果";
export const size = ogpSize;
export const contentType = ogpContentType;

/**
 * contrarian-fortune と character-fortune は専用の具体ルートで処理するため、
 * 動的ルートのOGP画像から除外する。
 */
const CONCRETE_ROUTE_SLUGS = ["contrarian-fortune", "character-fortune"];

export function generateStaticParams() {
  const params: Array<{ slug: string; resultId: string }> = [];
  for (const slug of getAllQuizSlugs()) {
    if (CONCRETE_ROUTE_SLUGS.includes(slug)) continue;
    for (const resultId of getResultIdsForQuiz(slug)) {
      params.push({ slug, resultId });
    }
  }
  return params;
}

type Props = {
  params: Promise<{ slug: string; resultId: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { slug, resultId } = await params;
  const quiz = quizBySlug.get(slug);
  const result = quiz?.results.find((r) => r.id === resultId);

  return createOgpImageResponse({
    title: result?.title ?? "結果",
    subtitle: quiz?.meta.title,
    icon: result?.icon,
    accentColor: quiz?.meta.accentColor,
  });
}
