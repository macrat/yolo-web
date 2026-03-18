/**
 * /play セクションのパス生成関数群。
 * URL 構造の変更が生じた場合、このファイルのみを修正すれば
 * サイト全体のリンクに反映される。
 */

import type { PlayContentMeta } from "./types";

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

/**
 * コンテンツのリンク先パスを返す。
 * Fortune（daily）は getDailyFortunePath() を使用し、それ以外は getPlayPath(slug) を使用する。
 * /play ページとトップページの両方から参照される共有関数。
 */
export function getContentPath(content: PlayContentMeta): string {
  if (content.contentType === "fortune") {
    return getDailyFortunePath();
  }
  return getPlayPath(content.slug);
}
