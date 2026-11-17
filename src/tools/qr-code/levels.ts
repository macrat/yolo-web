export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

/** 道具を開いたときに選んでいるレベル。 */
export const DEFAULT_LEVEL: ErrorCorrectionLevel = "M";

/** いちばん多く入るレベル。これより下げて入る量を増やすことはできない。 */
export const LOWEST_LEVEL: ErrorCorrectionLevel = "L";

/** 選ぶ欄に並べる順のレベルと、その名前・汚れや破損から復元できる割合。 */
export const LEVELS: readonly {
  value: ErrorCorrectionLevel;
  name: string;
  recovery: string;
}[] = [
  { value: "L", name: "低", recovery: "7%" },
  { value: "M", name: "中", recovery: "15%" },
  { value: "Q", name: "高", recovery: "25%" },
  { value: "H", name: "最高", recovery: "30%" },
];

/** 文の中でレベルを指す名前（「中（M）」）。 */
export function levelName(level: ErrorCorrectionLevel): string {
  const { name } = LEVELS.find((entry) => entry.value === level)!;
  return `${name}（${level}）`;
}

/**
 * エラー訂正レベルごとに、1つの QR コード（最大の40型）に入るバイトの数。道具は文をいつも UTF-8 のバイトの
 * モードで符号にするので、入る量はこのバイトの数で決まる。数字だけの文も英数字の文も、このバイトの数まで。
 */
export const MAX_BYTES: Record<ErrorCorrectionLevel, number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
};

/** 日本語の字（ひらがな・カタカナ・漢字）は UTF-8 で1字3バイト。 */
const JAPANESE_CHAR_BYTES = 3;

/** レベルごとに入る字の数。半角英数は1字1バイト、日本語は1字3バイトで数える。 */
export function maxChars(level: ErrorCorrectionLevel): {
  ascii: number;
  japanese: number;
} {
  const bytes = MAX_BYTES[level];
  return { ascii: bytes, japanese: Math.floor(bytes / JAPANESE_CHAR_BYTES) };
}

/** 字の数を、3桁ごとに区切って書く（「2,331」）。 */
export function formatCount(n: number): string {
  return n.toLocaleString("ja-JP");
}
