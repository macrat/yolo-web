/**
 * /play/animal-personality/result/[resultId] 専用 OGP 画像。
 * ステップ5: animal-personality 専用ルートの OGP 画像生成。
 */

import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";
import { getResultIdsForQuiz } from "@/play/quiz/registry";
import animalPersonalityQuiz from "@/play/quiz/data/animal-personality";

export const alt = "クイズ結果";
export const size = ogpSize;
export const contentType = ogpContentType;

const SLUG = "animal-personality";
const quiz = animalPersonalityQuiz;

export function generateStaticParams() {
  return getResultIdsForQuiz(SLUG).map((id) => ({ resultId: id }));
}

type Props = {
  params: Promise<{ resultId: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);

  return createOgpImageResponse({
    title: result?.title ?? "結果",
    subtitle: quiz.meta.title,
    icon: result?.icon,
    accentColor: quiz.meta.accentColor,
  });
}
