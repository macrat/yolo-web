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
 * /play/character-personality/result/[resultId] 専用 OGP 画像（＝札）。
 *
 * 画像は「札（Tsutsumi の視覚言語）」で組む（DESIGN.md §4「札」/「印」・§2 和色・§8）。
 * レンダラは {@link renderFudaImage} に共有化してあり、この **メタ用 og:image**（Next 自動配線）と、
 * クライアントが決定的 URL で取得する Route Handler（`./fuda-image/route.ts`）が
 * **同じレンダラを呼ぶ**——リンクプレビューと保存画像は単一の真実。
 *
 * 旧実装（全面ベタ塗り result.color ＋絵文字 icon ＋太字ゴシック）は §2 drift のため撤去した。
 * 地色は result.color（任意 hex）ではなく、タイプ ID から決定的に選ぶ和色8色
 * （`pickResultWairoColor`）。文字色は和色ごとに AA を満たす墨/白（`WAIRO_HEX`）。
 */

import { renderFudaImage, fudaImageSize } from "@/lib/fuda-image";
import { ogpContentType } from "@/lib/ogp-image";
import { getResultIdsForQuiz } from "@/play/quiz/registry";
import characterPersonalityQuiz from "@/play/quiz/data/character-personality";

export const alt = "診断結果の札";
export const size = fudaImageSize;
export const contentType = ogpContentType;

const SLUG = "character-personality";
const quiz = characterPersonalityQuiz;

export function generateStaticParams() {
  return getResultIdsForQuiz(SLUG).map((id) => ({ resultId: id }));
}

type Props = {
  params: Promise<{ resultId: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);

  return renderFudaImage({
    id: result?.id ?? resultId,
    title: result?.title ?? "結果",
    productName: quiz.meta.title,
  });
}
