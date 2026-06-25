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
 * /play/yoji-personality/result/[resultId] 専用 OGP 画像。
 * yoji-personality 専用ルートの OGP 画像生成。
 *
 * 重要: quiz.meta.accentColor ではなく result.color を使用する。
 * タイプごとに固有の色が異なるため、OGP画像でもその色を使用して
 * シェア時のビジュアルインパクトを最大化する。
 *
 * テキストコントラスト:
 * createOgpImageResponse が accentColor の相対輝度を自動計算し、
 * WCAG AA 大文字テキスト基準 (コントラスト比 3:1 以上) を満たす
 * テキスト色を自動選択するため、ここでの指定は不要。
 */

import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";
import { getResultIdsForQuiz } from "@/play/quiz/registry";
import yojiPersonalityQuiz from "@/play/quiz/data/yoji-personality";

export const alt = "クイズ結果";
export const size = ogpSize;
export const contentType = ogpContentType;

const SLUG = "yoji-personality";
const quiz = yojiPersonalityQuiz;

export function generateStaticParams() {
  return getResultIdsForQuiz(SLUG).map((id) => ({ resultId: id }));
}

type Props = {
  params: Promise<{ resultId: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { resultId } = await params;
  const result = quiz.results.find((r) => r.id === resultId);

  // result.color: タイプ固有の色。未設定の場合のみ accentColor にフォールバック。
  // テキスト色は createOgpImageResponse が accentColor の輝度から自動判定する。
  const accentColor = result?.color ?? quiz.meta.accentColor;

  return createOgpImageResponse({
    title: result?.title ?? "結果",
    subtitle: quiz.meta.title,
    icon: result?.icon,
    accentColor,
  });
}
