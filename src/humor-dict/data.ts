import type { HumorDictionaryEntry } from "./types";

/**
 * ユーモア辞書の全エントリ。
 * エントリはコンテンツ制作タスクで追加される。
 * 配列の並び順は問わない（取得関数内で五十音順ソートを行う）。
 */
const entries: HumorDictionaryEntry[] = [];

/**
 * 全エントリを五十音順（reading の昇順）で返す。
 * ビルド時の静的生成で使用する。
 */
export function getAllEntries(): HumorDictionaryEntry[] {
  return [...entries].sort((a, b) => a.reading.localeCompare(b.reading, "ja"));
}

/**
 * スラッグでエントリを取得する。
 * 見つからない場合は undefined を返す。
 *
 * @param slug - URL用の英語スラッグ
 */
export function getEntryBySlug(slug: string): HumorDictionaryEntry | undefined {
  return entries.find((e) => e.slug === slug);
}

/**
 * 全スラッグを五十音順（reading の昇順）で返す。
 * generateStaticParams で使用する。
 */
export function getAllSlugs(): string[] {
  return getAllEntries().map((e) => e.slug);
}
