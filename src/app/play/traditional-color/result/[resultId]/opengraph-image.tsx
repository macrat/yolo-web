/**
 * ⚠️ 重要 — このコードは「受検者本人には表示されない」第三者向け結果ページの一部です。
 *
 * ルート `/play/[slug]/result/[resultId]`（診断の result ページ）は【第三者向けの
 * シェア／検索ランディング専用】。診断を遊んだ本人は、完了時に `/play/[slug]` 上に
 * インライン描画される結果（ResultCard 経由）で見ており、この `/result/<id>` ページへは
 * 遷移しない（この URL はシェア用に生成される）。文言・構造・メタ・OGP は
 * 「診断をやっていない第三者が初めて見る」前提で設計すること。本人向け結果体験は
 * `src/play/quiz/_components/ResultCard.tsx` 側で編集する。
 */
/**
 * /play/traditional-color/result/[resultId] 専用 OGP 画像（＝札）。
 *
 * 画像は「札（Tsutsumi の視覚言語）」で組む（DESIGN.md §4「札」/「印」・§8）。
 * character-personality の結果 OGP と同じ共有レンダラ {@link renderFudaImage} を呼ぶ。
 *
 * ただし伝統色診断の結果色は「色＝中身」（cycle-149）——各タイプ固有の伝統色 hex
 * （藍色 #0d5661 等）そのものが結果である。よって記号面の地は和色8色への写像ではなく、
 * `result.color`（固有 hex）を `colorOverride` で渡して復元する（DESIGN §2「色そのものが
 * 中身の面」の例外・cycle-282 の回帰修正 B-579）。旧実装は `createOgpImageResponse`
 * （色ゼロの店構え）を呼んでおり、固有色が消えていた。
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
