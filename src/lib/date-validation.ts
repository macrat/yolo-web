/**
 * ツール内部で使用する日付パース・フォーマットユーティリティ。
 * parseDate はラウンドトリップ検証を行い、JavaScript の Date API による
 * 自動補正（例: 2月31日 -> 3月3日）を検出して null を返す。
 *
 * 注意: src/lib/date.ts は ISO タイムスタンプの表示用フォーマットであり、
 * 本ファイルとは責務が異なる。
 */

/** YYYY-MM-DD 形式の文字列フォーマット検証用正規表現 */
const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * YYYY-MM-DD 形式の日付文字列をパースし、Date オブジェクトを返す。
 * フォーマット不正や存在しない日付（2月31日等）の場合は null を返す。
 *
 * ラウンドトリップ検証により、JavaScript の Date が自動補正した日付を
 * 検出して拒否する。
 */
export function parseDate(dateStr: string): Date | null {
  if (!DATE_FORMAT_REGEX.test(dateStr)) {
    return null;
  }

  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  // 月・日の基本的な範囲チェック（0月、0日、13月以上を弾く）
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (isNaN(date.getTime())) {
    return null;
  }

  // ラウンドトリップ検証: Date が自動補正していないかを確認する
  // 例: new Date(2026, 1, 31) は 2026-03-03 に補正されるため、
  // getMonth() や getDate() が入力値と一致しない
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/**
 * Date オブジェクトを YYYY-MM-DD 形式の文字列にフォーマットする。
 * 月・日は2桁にゼロパディングされる。
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
