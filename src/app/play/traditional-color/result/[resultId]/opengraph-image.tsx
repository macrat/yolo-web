/**
 * /play/traditional-color/result/[resultId] 専用 OGP 画像。
 * traditional-color 専用ルートの OGP 画像生成。
 *
 * 重要: quiz.meta.accentColor ではなく result.color を使用する。
 * タイプごとに固有の伝統色が異なるため、OGP画像でもその色を使用して
 * シェア時のビジュアルインパクトを最大化する。
 */

import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";
import { getResultIdsForQuiz } from "@/play/quiz/registry";
import traditionalColorQuiz from "@/play/quiz/data/traditional-color";

export const alt = "クイズ結果";
export const size = ogpSize;
export const contentType = ogpContentType;

const SLUG = "traditional-color";
const quiz = traditionalColorQuiz;

export function generateStaticParams() {
  return getResultIdsForQuiz(SLUG).map((id) => ({ resultId: id }));
}

type Props = {
  params: Promise<{ resultId: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);

  // result.color: タイプ固有の伝統色。未設定の場合のみ accentColor にフォールバック。
  const accentColor = result?.color ?? quiz.meta.accentColor;

  return createOgpImageResponse({
    title: result?.title ?? "結果",
    subtitle: quiz.meta.title,
    icon: result?.icon,
    accentColor,
  });
}
