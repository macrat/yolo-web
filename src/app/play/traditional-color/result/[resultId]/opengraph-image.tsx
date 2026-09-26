/**
 * /play/traditional-color/result/[resultId] 専用 OGP 画像（＝札）。
 *
 * 画像は「札（Tsutsumi の視覚言語）」で組み、character-personality の結果 OGP と同じ共有レンダラ
 * {@link renderFudaImage} を呼ぶ。
 *
 * 伝統色診断では、各タイプ固有の伝統色（藍色 #0d5661 等）そのものが結果である（DESIGN.md §2 コンテンツ）。
 * そのため記号面の地は和色8色への写像ではなく、`result.color`（固有 hex）を `colorOverride` で渡す。
 */

import {
  renderFudaImage,
  fudaImageSize,
  fudaImageContentType,
} from "@/lib/fuda-image";
import { getResultIdsForQuiz } from "@/play/quiz/registry";
import traditionalColorQuiz from "@/play/quiz/data/traditional-color";

export const alt = "クイズ結果";
export const size = fudaImageSize;
export const contentType = fudaImageContentType;

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

  // 印は診断結果なので既定の "診"。地色はタイプ固有の伝統色 hex（colorOverride）。
  return renderFudaImage({
    id: result?.id ?? resultId,
    title: result?.title ?? "結果",
    productName: quiz.meta.title,
    colorOverride: result?.color,
  });
}
