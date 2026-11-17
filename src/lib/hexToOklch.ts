/**
 * sRGB(hex) → OKLCH 変換。色を目で見た明るさ（L）と色相（H）の順に並べるために使う。HSL の L は目で見た明るさの
 * 順にならない（純粋な黄と青がどちらも 50%）ので、明るさで並べるときは OKLCH の L を使う。
 *
 * 変換式は CSS Color 4 / OKLab の標準係数に従い、oklchToHex の逆にあたる。
 */

import type { Oklch } from "./oklchToHex";

/** 8bit ガンマ sRGB（0..255）をリニア sRGB（0..1）に変換する。 */
function srgb8bitToLinear(value: number): number {
  const gamma = value / 255;
  return gamma <= 0.04045
    ? gamma / 12.92
    : Math.pow((gamma + 0.055) / 1.055, 2.4);
}

/**
 * "#rrggbb" を OKLCH にする。色相は 0 以上 360 未満の度で、クロマが 0 の無彩色でも計算した値を返す
 * （無彩色の色相には意味が無いので、使う側が明るさで扱う）。
 */
export function hexToOklch(hex: string): Oklch {
  const r = srgb8bitToLinear(Number.parseInt(hex.slice(1, 3), 16));
  const g = srgb8bitToLinear(Number.parseInt(hex.slice(3, 5), 16));
  const b = srgb8bitToLinear(Number.parseInt(hex.slice(5, 7), 16));

  // リニア sRGB → LMS（三乗根をとる前）
  const lCube = Math.cbrt(
    0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b,
  );
  const mCube = Math.cbrt(
    0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b,
  );
  const sCube = Math.cbrt(
    0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b,
  );

  // LMS → OKLab
  const l = 0.2104542553 * lCube + 0.793617785 * mCube - 0.0040720468 * sCube;
  const a = 1.9779984951 * lCube - 2.428592205 * mCube + 0.4505937099 * sCube;
  const bAxis =
    0.0259040371 * lCube + 0.7827717662 * mCube - 0.808675766 * sCube;

  const hue = (Math.atan2(bAxis, a) * 180) / Math.PI;
  return { l, c: Math.hypot(a, bAxis), h: hue < 0 ? hue + 360 : hue };
}
