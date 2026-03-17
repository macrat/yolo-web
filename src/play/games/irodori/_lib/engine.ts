/**
 * Irodori game engine.
 * Implements CIEDE2000 color difference calculation, scoring, and rank judgment.
 */

import { hslToLab } from "./color-utils";

/**
 * Calculate CIEDE2000 color difference between two L*a*b* colors.
 *
 * Implementation based on:
 *   Sharma, Wu, Dalal (2005). "The CIEDE2000 Color-Difference Formula:
 *   Implementation Notes, Supplementary Test Data, and Mathematical Observations."
 *   Color Research and Application, 30(1), 21-30.
 *
 * @returns Delta E (CIEDE2000) value. 0 = identical, higher = more different.
 */
export function ciede2000(
  L1: number,
  a1: number,
  b1: number,
  L2: number,
  a2: number,
  b2: number,
): number {
  const deg2rad = Math.PI / 180;
  const rad2deg = 180 / Math.PI;

  // Step 1: Calculate C'ab, h'ab
  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cab_mean = (C1 + C2) / 2;
  const Cab_mean_pow7 = Math.pow(Cab_mean, 7);
  const G = 0.5 * (1 - Math.sqrt(Cab_mean_pow7 / (Cab_mean_pow7 + 6103515625))); // 25^7 = 6103515625

  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  let h1p = Math.atan2(b1, a1p) * rad2deg;
  if (h1p < 0) h1p += 360;
  let h2p = Math.atan2(b2, a2p) * rad2deg;
  if (h2p < 0) h2p += 360;

  // Step 2: Calculate delta L', delta C', delta H'
  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp: number;
  if (C1p * C2p === 0) {
    dhp = 0;
  } else if (Math.abs(h2p - h1p) <= 180) {
    dhp = h2p - h1p;
  } else if (h2p - h1p > 180) {
    dhp = h2p - h1p - 360;
  } else {
    dhp = h2p - h1p + 360;
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * deg2rad);

  // Step 3: Calculate CIEDE2000
  const Lp_mean = (L1 + L2) / 2;
  const Cp_mean = (C1p + C2p) / 2;

  let hp_mean: number;
  if (C1p * C2p === 0) {
    hp_mean = h1p + h2p;
  } else if (Math.abs(h1p - h2p) <= 180) {
    hp_mean = (h1p + h2p) / 2;
  } else if (h1p + h2p < 360) {
    hp_mean = (h1p + h2p + 360) / 2;
  } else {
    hp_mean = (h1p + h2p - 360) / 2;
  }

  const T =
    1 -
    0.17 * Math.cos((hp_mean - 30) * deg2rad) +
    0.24 * Math.cos(2 * hp_mean * deg2rad) +
    0.32 * Math.cos((3 * hp_mean + 6) * deg2rad) -
    0.2 * Math.cos((4 * hp_mean - 63) * deg2rad);

  const Lp_mean_minus50_sq = (Lp_mean - 50) * (Lp_mean - 50);
  const SL =
    1 + (0.015 * Lp_mean_minus50_sq) / Math.sqrt(20 + Lp_mean_minus50_sq);
  const SC = 1 + 0.045 * Cp_mean;
  const SH = 1 + 0.015 * Cp_mean * T;

  const Cp_mean_pow7 = Math.pow(Cp_mean, 7);
  const RT =
    -2 *
    Math.sqrt(Cp_mean_pow7 / (Cp_mean_pow7 + 6103515625)) *
    Math.sin(60 * deg2rad * Math.exp(-Math.pow((hp_mean - 275) / 25, 2)));

  const dE = Math.sqrt(
    Math.pow(dLp / SL, 2) +
      Math.pow(dCp / SC, 2) +
      Math.pow(dHp / SH, 2) +
      RT * (dCp / SC) * (dHp / SH),
  );

  return dE;
}

/**
 * Calculate CIEDE2000 color difference between two HSL colors.
 */
export function colorDifference(
  h1: number,
  s1: number,
  l1: number,
  h2: number,
  s2: number,
  l2: number,
): number {
  const [L1, a1, b1] = hslToLab(h1, s1, l1);
  const [L2, a2, b2] = hslToLab(h2, s2, l2);
  return ciede2000(L1, a1, b1, L2, a2, b2);
}

/**
 * Calculate the score for a single round based on Delta E.
 * Score ranges from 0 to 100.
 * Lower Delta E -> higher score.
 */
export function calculateRoundScore(deltaE: number): number {
  const score = 100 - Math.min(deltaE * 2, 100);
  return Math.round(Math.max(0, score));
}

/**
 * Calculate the total score (average of all round scores).
 */
export function calculateTotalScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round(sum / scores.length);
}

export type IrodoriRank = "S" | "A" | "B" | "C" | "D";

/**
 * Determine the rank from total score.
 */
export function getRank(totalScore: number): IrodoriRank {
  if (totalScore >= 95) return "S";
  if (totalScore >= 85) return "A";
  if (totalScore >= 70) return "B";
  if (totalScore >= 50) return "C";
  return "D";
}

/**
 * Get the rank label in Japanese.
 */
export function getRankLabel(rank: IrodoriRank): string {
  switch (rank) {
    case "S":
      return "\u8272\u5F69\u306E\u9054\u4EBA"; // 色彩の達人
    case "A":
      return "\u512A\u79C0\u306A\u8272\u5F69\u611F\u899A"; // 優秀な色彩感覚
    case "B":
      return "\u826F\u3044\u8272\u5F69\u611F\u899A"; // 良い色彩感覚
    case "C":
      return "\u307E\u305A\u307E\u305A"; // まずまず
    case "D":
      return "\u7DF4\u7FD2\u3042\u308B\u306E\u307F"; // 練習あるのみ
  }
}

/**
 * Get the score emoji block for share text.
 */
export function getScoreEmoji(score: number): string {
  if (score >= 95) return "\uD83C\uDF1F"; // star (S rank)
  if (score >= 85) return "\uD83D\uDFE9"; // green
  if (score >= 70) return "\uD83D\uDFE8"; // yellow
  if (score >= 50) return "\uD83D\uDFE7"; // orange
  return "\uD83D\uDFE5"; // red
}
