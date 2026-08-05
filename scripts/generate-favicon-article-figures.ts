/**
 * ブログ記事「ファビコンが16pxで読めるかを、目で見ずに画素から測る」の図版を生成する。
 *
 * **なぜコミットするか**: ADR004 が「成果物を生んだ手順が版管理されていないと再現できない」と
 * 定めている。図版は来訪者に届く成果物であり、元にしている fixture
 * （`scripts/__tests__/fixtures/cycle299-shipped-16.png`＝cycle-299 が実際に出荷した壊れた favicon）
 * が変われば図もずれる。**手作業で作った画像を出荷しない。**
 *
 * 使い方:
 *   npx tsx scripts/generate-favicon-article-figures.ts
 *
 * 出力先は `public/blog/`（記事から参照される）。
 */

import sharp from "sharp";
import type { OverlayOptions } from "sharp";
import * as path from "node:path";

const ROOT = path.join(__dirname, "..");
const BROKEN = path.join(
  ROOT,
  "scripts/__tests__/fixtures/cycle299-shipped-16.png",
);
const OUT = path.join(ROOT, "public/blog");
const FONT = "IPAGothic, sans-serif";

const zoom = (n: number) =>
  sharp(BROKEN)
    .resize(16 * n, 16 * n, { kernel: "nearest" })
    .png()
    .toBuffer();

async function imageA() {
  const W = 672,
    H = 250;
  const big = await zoom(8); // 128
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="#ffffff"/>
    <text x="24" y="34" font-family="${FONT}" font-size="19" fill="#1a1a1a">等倍（16×16）</text>
    <text x="336" y="34" font-family="${FONT}" font-size="19" fill="#1a1a1a">同じ画像を8倍に拡大</text>
    <rect x="151.5" y="83.5" width="17" height="17" fill="none" stroke="#c8c8c8" stroke-width="1"/>
    <rect x="463.5" y="59.5" width="129" height="129" fill="none" stroke="#c8c8c8" stroke-width="1"/>
    <text x="24" y="228" font-family="${FONT}" font-size="17" fill="#5a5a5a">拡大すれば y と読める。だがタブに並ぶのは左の 256 画素のほうだ</text>
  </svg>`;
  await sharp({
    create: { width: W, height: H, channels: 4, background: "#ffffff" },
  })
    .composite([
      { input: Buffer.from(svg), left: 0, top: 0 },
      { input: await sharp(BROKEN).png().toBuffer(), left: 152, top: 84 },
      { input: big, left: 464, top: 60 },
    ])
    .png()
    .toFile(path.join(OUT, "2026-08-05-favicon-actual-size-vs-zoomed.png"));
}

const GROUNDS: [string, string, string][] = [
  ["ライトのタブ地", "#DEE1E6", "可視 20px / 塊 12"],
  ["ダークのタブ地", "#202124", "可視 241px / 塊 241"],
  ["純白", "#FFFFFF", "可視 30px / 塊 16"],
  ["中間グレー", "#808080", "可視 208px / 塊 208"],
];

async function imageB() {
  const W = 672,
    H = 290;
  const COL = 168,
    TILE = 128;
  const big = await zoom(6); // 96
  const parts: OverlayOptions[] = [];
  let svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="#ffffff"/>`;
  GROUNDS.forEach(([name, hex, note], i) => {
    const x = i * COL + (COL - TILE) / 2;
    svg += `<text x="${i * COL + COL / 2}" y="28" text-anchor="middle" font-family="${FONT}" font-size="17" fill="#1a1a1a">${name}</text>`;
    svg += `<rect x="${x}" y="40" width="${TILE}" height="${TILE}" fill="${hex}"/>`;
    svg += `<rect x="${x}" y="180" width="${TILE}" height="44" fill="${hex}"/>`;
    svg += `<rect x="${x - 0.5}" y="39.5" width="${TILE + 1}" height="${TILE + 1}" fill="none" stroke="#c8c8c8" stroke-width="1"/>`;
    svg += `<rect x="${x - 0.5}" y="179.5" width="${TILE + 1}" height="45" fill="none" stroke="#c8c8c8" stroke-width="1"/>`;
    svg += `<text x="${i * COL + COL / 2}" y="248" text-anchor="middle" font-family="${FONT}" font-size="15" fill="#5a5a5a">${note.split(" / ")[0]}</text>`;
    svg += `<text x="${i * COL + COL / 2}" y="268" text-anchor="middle" font-family="${FONT}" font-size="15" fill="#5a5a5a">${note.split(" / ")[1]}</text>`;
  });
  svg += `</svg>`;
  GROUNDS.forEach((_, i) => {
    const x = i * COL + (COL - TILE) / 2;
    parts.push({ input: big, left: Math.round(x + (TILE - 96) / 2), top: 56 });
    parts.push({
      input: BROKEN,
      left: Math.round(x + (TILE - 16) / 2),
      top: 194,
    });
  });
  await sharp({
    create: { width: W, height: H, channels: 4, background: "#ffffff" },
  })
    .composite([{ input: Buffer.from(svg), left: 0, top: 0 }, ...parts])
    .png()
    .toFile(path.join(OUT, "2026-08-05-favicon-four-grounds.png"));
}

void (async () => {
  await imageA();
  await imageB();
  console.log("done");
})();
