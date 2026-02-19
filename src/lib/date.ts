/**
 * ISO 8601タイムスタンプから表示用の日付文字列を生成する。
 * 例: "2026-02-14T07:57:19+09:00" -> "2026-02-14"
 */
export function formatDate(isoString: string): string {
  // 日付のみ(YYYY-MM-DD)の場合はそのまま返す
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
    return isoString;
  }
  // +09:00のタイムスタンプをJST日付として取得するため、
  // Intlを使ってAsia/Tokyoで日付部分を取得する
  const date = new Date(isoString);
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date); // "2026-02-14" 形式
}
