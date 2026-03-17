/**
 * /play セクションのパス生成関数群。
 * URL 構造の変更が生じた場合、このファイルのみを修正すれば
 * サイト全体のリンクに反映される。
 */

/** /play/{slug} へのパスを返す */
export function getPlayPath(slug: string): string {
  return `/play/${slug}`;
}

/** /play/{slug}/result/{resultId} へのパスを返す */
export function getPlayResultPath(slug: string, resultId: string): string {
  return `/play/${slug}/result/${resultId}`;
}

/** デイリー占いページ /play/daily へのパスを返す */
export function getDailyFortunePath(): string {
  return "/play/daily";
}
