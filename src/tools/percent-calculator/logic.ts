/** パーセント計算の種別 */
export type CalcMode =
  | "percentOf"
  | "whatPercent"
  | "adjustByPercent"
  | "percentChange";

/** 増減の方向 */
export type AdjustDirection = "increase" | "decrease";

/** 計算結果 */
export interface PercentResult {
  /** 計算結果の数値（小数第4位で丸め） */
  value: number;
  /** 表示用の計算式（例: "2500 × 15 ÷ 100 = 375"） */
  formula: string;
}

/**
 * 数値を小数第 n 位で四捨五入する（デフォルト: 第4位）。
 * 浮動小数点の丸め誤差を補正するため toFixed + parseFloat を使う。
 */
function roundTo(value: number, decimals = 4): number {
  return parseFloat(value.toFixed(decimals));
}

/** 結果の数値を表示用文字列に整形する（末尾ゼロを除去） */
export function formatResult(value: number): string {
  // 整数なら整数として表示、小数なら末尾ゼロを除去
  return roundTo(value).toString();
}

/**
 * X の Y% はいくつ？
 * 計算式: X × Y ÷ 100
 */
export function percentOf(x: number, y: number): PercentResult | null {
  if (!isFinite(x) || !isFinite(y)) return null;

  const value = roundTo((x * y) / 100);
  const formula = `${x} × ${y} ÷ 100 = ${formatResult(value)}`;
  return { value, formula };
}

/**
 * A は B の何%？
 * 計算式: A ÷ B × 100
 */
export function whatPercent(a: number, b: number): PercentResult | null {
  if (!isFinite(a) || !isFinite(b) || b === 0) return null;

  const value = roundTo((a / b) * 100);
  const formula = `${a} ÷ ${b} × 100 = ${formatResult(value)}%`;
  return { value, formula };
}

/**
 * X を Y% 増やす/減らすといくつ？
 * 計算式: X × (1 + Y/100) or X × (1 - Y/100)
 */
export function adjustByPercent(
  x: number,
  y: number,
  direction: AdjustDirection,
): PercentResult | null {
  if (!isFinite(x) || !isFinite(y)) return null;

  const sign = direction === "increase" ? 1 : -1;
  const multiplier = 1 + (sign * y) / 100;
  const value = roundTo(x * multiplier);
  const op = direction === "increase" ? "+" : "-";
  const formula = `${x} × (1 ${op} ${y} ÷ 100) = ${formatResult(value)}`;
  return { value, formula };
}

/**
 * A から B への変化率は？
 * 計算式: (B - A) ÷ A × 100
 */
export function percentChange(a: number, b: number): PercentResult | null {
  if (!isFinite(a) || !isFinite(b) || a === 0) return null;

  const value = roundTo(((b - a) / a) * 100);
  const sign = value >= 0 ? "+" : "";
  const formula = `(${b} - ${a}) ÷ ${a} × 100 = ${sign}${formatResult(value)}%`;
  return { value, formula };
}
