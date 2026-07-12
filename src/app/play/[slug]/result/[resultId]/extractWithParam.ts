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

import { isValidMusicTypeId } from "@/play/quiz/data/music-personality";

/**
 * Extract the "with" query parameter for compatibility display.
 * Returns a valid type ID or undefined.
 * Validates the param against the correct type set for each quiz slug.
 *
 * Note: character-personality has its own dedicated route at
 * /play/character-personality/result/[resultId], so it is not handled here.
 */
export function extractWithParam(
  resolvedSearchParams:
    | Record<string, string | string[] | undefined>
    | undefined,
  slug: string,
  resultId: string,
): string | undefined {
  if (!resolvedSearchParams) return undefined;
  const withParam =
    typeof resolvedSearchParams.with === "string"
      ? resolvedSearchParams.with
      : undefined;
  if (slug === "music-personality") {
    if (
      withParam &&
      isValidMusicTypeId(withParam) &&
      isValidMusicTypeId(resultId)
    ) {
      return withParam;
    }
    return undefined;
  }
  return undefined;
}
