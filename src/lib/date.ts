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

/**
 * 指定した日時（省略時は現在時刻）の年初からの経過日数を JSTベースで返す（1〜366）。
 *
 * サーバーのシステムタイムゾーンに依存しないよう、Intl.DateTimeFormat を使って
 * Asia/Tokyo タイムゾーンで年・月・日を取得し、年初からの日数を計算する。
 * これにより、UTC環境のサーバーでも日本時間での正しい日替わりコンテンツ選択が機能する。
 */
export function getDayOfYearJst(date: Date = new Date()): number {
  const jstFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // "YYYY-MM-DD" 形式の JST 日付文字列を取得
  const jstDateStr = jstFormatter.format(date);
  const [year, month, day] = jstDateStr.split("-").map(Number);

  // JST での年初（1月1日 00:00 JST）の Date オブジェクトを構築
  // "YYYY-01-01T00:00:00+09:00" として解析することで、タイムゾーンに依存しない年初を得る
  const startOfYearJst = new Date(`${year}-01-01T00:00:00+09:00`);
  const currentDayJst = new Date(
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00+09:00`,
  );

  // ミリ秒差を1日（86400000ms）で割り、1始まりに揃えるため +1
  return (
    Math.floor(
      (currentDayJst.getTime() - startOfYearJst.getTime()) / 86400000,
    ) + 1
  );
}
