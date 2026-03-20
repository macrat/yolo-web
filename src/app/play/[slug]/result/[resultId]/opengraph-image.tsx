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

export function generateStaticParams() {
  const params: Array<{ slug: string; resultId: string }> = [];
  for (const slug of getAllQuizSlugs()) {
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
