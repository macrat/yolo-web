import type { ErrorCorrectionLevel } from "./logic";

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
