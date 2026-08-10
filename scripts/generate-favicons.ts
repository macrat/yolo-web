/**
 * ブランド標章 F2「朱の印・白抜き y」の favicon 資産一式を、再現可能に生成する。
 *
 * B-576（cycle-306）で PM が実レンダーを見て確定した方向を、手でバイナリを置かず
 * スクリプトから作り直すためのもの。生成物:
 *   - public/favicon.ico        16/32/48px を内包するマルチサイズ ICO（PNG 埋め込み）。
 *   - public/icon.svg           モダンブラウザ用のスケーラブルな F2。
 *   - public/apple-touch-icon.png  180×180・朱を全面ブリード＋白抜き y。
 *
 * ## 設計（F2）
 * - favicon: 地＝紙(PAPER)、中央に朱(ACCENT)の角丸正方形の印（タイル比 印≈80%・角丸半径は
 *   正方形の約22%）、その中に紙色(PAPER)で白抜きした小文字「y」（Noto Serif JP・明朝・太字）。
 * - apple-touch: iOS が全面に角丸マスクをかけるため、朱を全面ブリードし、紙色の白抜き y を
 *   大きく置く（紙の縁を作らず二重角丸を避ける）。
 *
 * ## 色は SSoT を厳守
 * PAPER / ACCENT は {@link file://../src/lib/utsuwaHex.ts} から import する（直書きしない）。
 *
 * ## 字形（y）の取り方 — 再現性
 * SVG favicon は環境に Noto Serif JP が無いと字形が崩れるため、`<text>` ではなく **glyph を
 * ベクタ path として埋め込む**。フォントは Google Fonts から wght@900 の TTF を取得し
 * （レガシー UA で css2 に問い合わせると woff2 でなく TTF を返す）、opentype.js で「y」の
 * アウトラインを path 化する。可視 bbox の中心を印の中心に実測で合わせる。
 * PNG（ICO タイル・apple）は同じ SVG を sharp でラスタライズするので、SVG と完全に一致する。
 *
 * ## 使い方
 *   npx tsx scripts/generate-favicons.ts
 */
import sharp from "sharp";
import opentype from "opentype.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { PAPER, ACCENT } from "../src/lib/utsuwaHex";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(HERE, "../public");

// --- F2 の幾何（favicon タイル基準 100×100） ---
const TILE = 100;
const SEAL_RATIO = 0.8; // 印は紙地に少し余白を残す（タイル比 印≈80%）
const SEAL = TILE * SEAL_RATIO; // 80
const SEAL_PAD = (TILE - SEAL) / 2; // 10
const SEAL_RADIUS = SEAL * 0.22; // 角丸半径は正方形の約22%
const FAVICON_GLYPH_PX = 62; // 印の中で y が収まる字サイズ（余白を残す）
// apple は全面ブリードで印枠が無いぶん y を大きく置く。
const APPLE_TILE = 180;
const APPLE_GLYPH_PX = 129;

const FONT_WEIGHT = 900; // 明朝・太字（16px でも読める）

/** Google Fonts から Noto Serif JP の TTF を取得する（レガシー UA で TTF を強制）。 */
async function fetchNotoSerifJpTtf(weight: number): Promise<opentype.Font> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@${weight}`;
  const css = await (
    await fetch(cssUrl, { headers: { "User-Agent": "Mozilla/4.0" } })
  ).text();
  const m = css.match(/url\((https:[^)]+\.(?:ttf|otf))\)/);
  if (!m) throw new Error("Google Fonts から TTF の URL を取得できなかった");
  const buf = Buffer.from(await (await fetch(m[1])).arrayBuffer());
  return opentype.parse(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  );
}

/**
 * 「y」の path data を、可視 bbox の中心が (cx, cy) に来るように配置して返す。
 * fontPx はデザイン座標（TILE や APPLE_TILE と同じ単位）でのサイズ。
 */
function centeredGlyphPathData(
  font: opentype.Font,
  fontPx: number,
  cx: number,
  cy: number,
): string {
  const raw = font.getPath("y", 0, 0, fontPx);
  const bb = raw.getBoundingBox();
  const dx = cx - (bb.x1 + bb.x2) / 2;
  const dy = cy - (bb.y1 + bb.y2) / 2;
  const placed = font.getPath("y", dx, dy, fontPx);
  return placed.toPathData(3);
}

/** favicon 用 SVG（紙地＋朱の角丸印＋白抜き y）。 */
function faviconSvg(font: opentype.Font): string {
  const d = centeredGlyphPathData(font, FAVICON_GLYPH_PX, TILE / 2, TILE / 2);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}" viewBox="0 0 ${TILE} ${TILE}">`,
    `<rect width="${TILE}" height="${TILE}" fill="${PAPER}"/>`,
    `<rect x="${SEAL_PAD}" y="${SEAL_PAD}" width="${SEAL}" height="${SEAL}" rx="${SEAL_RADIUS}" ry="${SEAL_RADIUS}" fill="${ACCENT}"/>`,
    `<path d="${d}" fill="${PAPER}"/>`,
    `</svg>`,
  ].join("");
}

/** apple-touch 用 SVG（朱を全面ブリード＋白抜き y）。 */
function appleSvg(font: opentype.Font): string {
  const d = centeredGlyphPathData(
    font,
    APPLE_GLYPH_PX,
    APPLE_TILE / 2,
    APPLE_TILE / 2,
  );
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${APPLE_TILE}" height="${APPLE_TILE}" viewBox="0 0 ${APPLE_TILE} ${APPLE_TILE}">`,
    `<rect width="${APPLE_TILE}" height="${APPLE_TILE}" fill="${ACCENT}"/>`,
    `<path d="${d}" fill="${PAPER}"/>`,
    `</svg>`,
  ].join("");
}

/** SVG 文字列を指定 px 四方の PNG バッファへラスタライズする。 */
async function svgToPng(svg: string, size: number): Promise<Buffer> {
  return sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
}

/**
 * 複数サイズの PNG を PNG 埋め込み ICO へパックする。
 * ICONDIR(6) + ICONDIRENTRY(16×N) + 連結した PNG 本体。各エントリの bitCount=32。
 */
function packIco(images: { size: number; png: Buffer }[]): Buffer {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  const entries: Buffer[] = [];
  let offset = 6 + count * 16;
  for (const { size, png } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width（256 は 0）
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2); // color count
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // color planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(png.length, 8); // bytes in resource
    e.writeUInt32LE(offset, 12); // image offset
    entries.push(e);
    offset += png.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

async function main(): Promise<void> {
  const font = await fetchNotoSerifJpTtf(FONT_WEIGHT);

  const favSvg = faviconSvg(font);
  const appSvg = appleSvg(font);

  // 1) icon.svg（モダンブラウザ用のスケーラブル F2）
  await fs.writeFile(path.join(PUBLIC, "icon.svg"), favSvg, "utf8");

  // 2) favicon.ico（16/32/48 を内包）
  const icoSizes = [16, 32, 48];
  const icoImages = await Promise.all(
    icoSizes.map(async (size) => ({ size, png: await svgToPng(favSvg, size) })),
  );
  await fs.writeFile(path.join(PUBLIC, "favicon.ico"), packIco(icoImages));

  // 3) apple-touch-icon.png（180・全面ブリード）
  await fs.writeFile(
    path.join(PUBLIC, "apple-touch-icon.png"),
    await svgToPng(appSvg, APPLE_TILE),
  );

  console.log("生成完了:");
  console.log("  public/icon.svg");
  console.log(`  public/favicon.ico (${icoSizes.join("/")}px)`);
  console.log("  public/apple-touch-icon.png (180px)");
}

if (process.argv[1] && process.argv[1].endsWith("generate-favicons.ts")) {
  void main();
}
