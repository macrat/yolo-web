/**
 * Color conversion utilities for the Irodori game.
 * Handles RGB <-> HSL <-> Lab conversions.
 */

/**
 * Convert HSL (h:0-360, s:0-100, l:0-100) to RGB (0-255 each).
 */
export function hslToRgb(
  h: number,
  s: number,
  l: number,
): [number, number, number] {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r1: number, g1: number, b1: number;

  if (h < 60) {
    [r1, g1, b1] = [c, x, 0];
  } else if (h < 120) {
    [r1, g1, b1] = [x, c, 0];
  } else if (h < 180) {
    [r1, g1, b1] = [0, c, x];
  } else if (h < 240) {
    [r1, g1, b1] = [0, x, c];
  } else if (h < 300) {
    [r1, g1, b1] = [x, 0, c];
  } else {
    [r1, g1, b1] = [c, 0, x];
  }

  return [
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255),
  ];
}

/**
 * Convert RGB (0-255) to hex string (e.g., "#ff0000").
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) =>
    Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert HSL to hex string.
 */
export function hslToHex(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

/**
 * Convert a single sRGB channel value (0-255) to linear RGB.
 */
function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * Convert RGB (0-255) to CIE XYZ (D65 illuminant).
 */
export function rgbToXyz(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);

  // sRGB to XYZ matrix (D65)
  const x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375;
  const y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.072175;
  const z = rl * 0.0193339 + gl * 0.119192 + bl * 0.9503041;

  return [x * 100, y * 100, z * 100];
}

/**
 * Convert CIE XYZ to CIE L*a*b* (D65 illuminant).
 */
export function xyzToLab(
  x: number,
  y: number,
  z: number,
): [number, number, number] {
  // D65 reference white point
  const xn = 95.047;
  const yn = 100.0;
  const zn = 108.883;

  const f = (t: number): number => {
    const delta = 6 / 29;
    if (t > delta * delta * delta) {
      return Math.cbrt(t);
    }
    return t / (3 * delta * delta) + 4 / 29;
  };

  const fx = f(x / xn);
  const fy = f(y / yn);
  const fz = f(z / zn);

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return [L, a, b];
}

/**
 * Convert RGB (0-255) to CIE L*a*b*.
 */
export function rgbToLab(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  const [x, y, z] = rgbToXyz(r, g, b);
  return xyzToLab(x, y, z);
}

/**
 * Convert HSL (h:0-360, s:0-100, l:0-100) to CIE L*a*b*.
 */
export function hslToLab(
  h: number,
  s: number,
  l: number,
): [number, number, number] {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToLab(r, g, b);
}
