import type { IrodoriGameState } from "./types";
import { calculateTotalScore, getRank, getScoreEmoji } from "./engine";

/**
 * Generate the share text for a completed game.
 *
 * Format:
 *   イロドリ #42 スコア: 87/100 (Aランク)
 *   🟩🟩🟨🟧🟥
 *   https://.../games/irodori
 */
export function generateShareText(state: IrodoriGameState): string {
  const scores = state.rounds.map((r) => r.score ?? 0);
  const totalScore = calculateTotalScore(scores);
  const rank = getRank(totalScore);

  const emojiRow = scores.map((s) => getScoreEmoji(s)).join("");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${baseUrl}/games/irodori`;

  return `\u30A4\u30ED\u30C9\u30EA #${state.puzzleNumber} \u30B9\u30B3\u30A2: ${totalScore}/100 (${rank}\u30E9\u30F3\u30AF)\n${emojiRow}\n${url}`;
}

/**
 * Copy text to the clipboard using the Clipboard API.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return fallbackCopy(text);
    }
  }
  return fallbackCopy(text);
}

/**
 * Fallback clipboard copy using a hidden textarea.
 */
function fallbackCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

/**
 * Generate a Twitter/X share URL with pre-filled text.
 */
export function generateTwitterShareUrl(text: string): string {
  const encoded = encodeURIComponent(text);
  return `https://twitter.com/intent/tweet?text=${encoded}`;
}

/**
 * Generate a result image using Canvas API.
 * Returns a data URL (PNG) or null if Canvas is unavailable.
 */
export function generateResultImage(state: IrodoriGameState): string | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const width = 600;
  const height = 400;
  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px sans-serif";
  ctx.textAlign = "center";
  const scores = state.rounds.map((r) => r.score ?? 0);
  const totalScore = calculateTotalScore(scores);
  const rank = getRank(totalScore);
  ctx.fillText(
    `\u30A4\u30ED\u30C9\u30EA #${state.puzzleNumber}`,
    width / 2,
    40,
  );

  // Score
  ctx.font = "bold 36px sans-serif";
  ctx.fillText(`${totalScore}/100 (${rank}\u30E9\u30F3\u30AF)`, width / 2, 85);

  // Color pairs
  const patchSize = 60;
  const gap = 16;
  const startY = 120;
  const pairWidth = patchSize * 2 + gap;
  const totalPairsWidth =
    state.rounds.length * pairWidth + (state.rounds.length - 1) * gap;
  const startX = (width - totalPairsWidth) / 2;

  state.rounds.forEach((round, i) => {
    const x = startX + i * (pairWidth + gap);

    // Target label
    ctx.fillStyle = "#aaaaaa";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("\u304A\u984C", x + patchSize / 2, startY - 4);

    // Target color patch
    ctx.fillStyle = round.target.hex;
    ctx.beginPath();
    ctx.roundRect(x, startY, patchSize, patchSize, 8);
    ctx.fill();

    // Answer label
    ctx.fillStyle = "#aaaaaa";
    ctx.fillText(
      "\u56DE\u7B54",
      x + patchSize + gap + patchSize / 2,
      startY - 4,
    );

    // Answer color patch
    if (round.answer) {
      const { h, s, l } = round.answer;
      ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
    } else {
      ctx.fillStyle = "#333333";
    }
    ctx.beginPath();
    ctx.roundRect(x + patchSize + gap, startY, patchSize, patchSize, 8);
    ctx.fill();

    // Score below
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `${round.score ?? 0}\u70B9`,
      x + pairWidth / 2,
      startY + patchSize + 20,
    );
  });

  // Footer
  ctx.fillStyle = "#888888";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("yolos.net/games/irodori", width / 2, height - 20);

  try {
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

/**
 * Download a data URL as a file.
 */
export function downloadImage(dataUrl: string, filename: string): void {
  if (typeof document === "undefined") return;
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
