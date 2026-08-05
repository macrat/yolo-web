/**
 * ブログ記事「ファビコンが16pxのタブで消えていないかを、目で見ずに画素から測る」の図版を生成する。
 *
 * **なぜコミットするか**: ADR004 が「成果物を生んだ手順が版管理されていないと再現できない」と
 * 定めている。図版は来訪者に届く成果物であり、元にしている fixture
 * （`scripts/__tests__/fixtures/cycle299-shipped-16.png`＝cycle-299 が実際に出荷した壊れた favicon）
 * が変われば図もずれる。**手作業で作った画像を出荷しない。**
 *
 * **なぜ論理幅を図版ごとに分けるか**: `.prose img { max-width: 100% }` があるので、カラムより
 * 広い画像は縮小されて届く。図版Aは「等倍（16×16）」と書いた 16px のアイコンを見せる図で、
 * 縮小されると等倍でなくなる。だから本文カラムが最も狭くなる幅（280px ビューポートで 232px、
 * Playwright 実測）に論理幅を抑え、どのビューポートでも 1:1 で届くようにする。
 * 図版Bにこの制約は無い。等倍要件が無いのに 232px に揃えると、デスクトップ（カラム 660〜672px、
 * Playwright 実測）で幅の 3 分の 1 しか使わず、記事の中心的な証拠が小さいまま右に空白が残る。
 * そこで図版Bは論理幅をカラム幅（--measure = 42rem = 672px）に合わせる。縮小される側の
 * ビューポート（390px なら 342/672 ≒ 0.51 倍）でも図中の文字が潰れないよう、文字を大きめに組む。
 *
 * **なぜ 2 倍で書き出すか**: 論理 232px を DPR 2〜3 の画面で 1:1 表示すると素の画素は拡大されて
 * ぼける。実体を 2 倍（464px）で作り、`<img width="232">` で論理幅を指定して表示する。
 * 記事側は Markdown の `![]()` ではなく `<img>` を直接書く（width 属性が要るため）。
 *
 * 測定値（可視画素数・最大連結塊）は fixture から毎回計算する。図に焼き込む数値を手で書くと、
 * fixture が変わったときに図だけが古い数字を主張し続ける。
 *
 * 使い方:
 *   npx tsx scripts/generate-favicon-article-figures.ts
 *
 * 出力先は `public/blog/`（記事から参照される）。
 */

import sharp from "sharp";
import type { OverlayOptions, Sharp } from "sharp";
import * as path from "node:path";

const ROOT = path.join(__dirname, "..");
const BROKEN = path.join(
  ROOT,
  "scripts/__tests__/fixtures/cycle299-shipped-16.png",
);
const OUT = path.join(ROOT, "public/blog");
const FONT = "IPAGothic, sans-serif";

/** 図版A の論理幅。280px ビューポートの本文カラム幅（実測 232px）＝等倍を保てる上限。 */
const FIGURE_A_WIDTH = 232;
/** 図版B の論理幅。本文カラムの幅そのもの（`--measure: 42rem`）。 */
const FIGURE_B_WIDTH = 672;
/** 実体の画素密度。HiDPI で 1:1 表示してもぼけないように 2 倍で書き出す。 */
const SCALE = 2;

const INK = "#1a1a1a";
const SUB = "#5a5a5a";
const LINE = "#c8c8c8";
const PAPER = "#ffffff";

type RGB = [number, number, number];

const GROUNDS: { name: string; hex: string; rgb: RGB }[] = [
  { name: "ライトのタブ地", hex: "#DEE1E6", rgb: [222, 225, 230] },
  { name: "ダークのタブ地", hex: "#202124", rgb: [32, 33, 36] },
  { name: "純白", hex: "#FFFFFF", rgb: [255, 255, 255] },
  { name: "中間グレー", hex: "#808080", rgb: [128, 128, 128] },
];

function relativeLuminance([r, g, b]: RGB): number {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(a: RGB, b: RGB): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (hi + 0.05) / (lo + 0.05);
}

/** 上下左右でつながった最大成分の大きさ。記事本文に載せている実装と同じ定義。 */
function largestBlob(mask: boolean[], w: number, h: number): number {
  const seen = new Uint8Array(mask.length);
  let best = 0;
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i] || seen[i]) continue;
    let size = 0;
    const stack = [i];
    seen[i] = 1;
    while (stack.length) {
      const c = stack.pop()!;
      size++;
      const x = c % w;
      const y = (c / w) | 0;
      for (const n of [
        y > 0 ? c - w : -1,
        y < h - 1 ? c + w : -1,
        x > 0 ? c - 1 : -1,
        x < w - 1 ? c + 1 : -1,
      ]) {
        if (n >= 0 && mask[n] && !seen[n]) {
          seen[n] = 1;
          stack.push(n);
        }
      }
    }
    best = Math.max(best, size);
  }
  return best;
}

interface Icon {
  w: number;
  h: number;
  px: [number, number, number, number][];
}

async function readIcon(file: string): Promise<Icon> {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const px: Icon["px"] = [];
  for (let i = 0; i < info.width * info.height; i++) {
    const o = i * info.channels;
    px.push([data[o], data[o + 1], data[o + 2], data[o + 3]]);
  }
  return { w: info.width, h: info.height, px };
}

/** アイコンを地の上に合成した実際の見え姿。 */
function compositeOn(icon: Icon, ground: RGB): RGB[] {
  return icon.px.map(([r, g, b, a]) => {
    const t = a / 255;
    return [r, g, b].map((v, i) =>
      Math.round(v * t + ground[i] * (1 - t)),
    ) as RGB;
  });
}

/** その地でコントラスト 3:1 以上を保つ画素。計器が「見えている」と数える集合。 */
function visibleMask(icon: Icon, ground: RGB): boolean[] {
  return compositeOn(icon, ground).map((p) => contrastRatio(p, ground) >= 3);
}

/** RGB の並びを最近傍で n 倍に拡大した PNG バッファにする。 */
async function tile(colors: RGB[], w: number, h: number, n: number) {
  const buf = Buffer.alloc(w * h * 3);
  colors.forEach((c, i) => {
    buf[i * 3] = c[0];
    buf[i * 3 + 1] = c[1];
    buf[i * 3 + 2] = c[2];
  });
  return sharp(buf, { raw: { width: w, height: h, channels: 3 } })
    .resize(w * n, h * n, { kernel: "nearest" })
    .png()
    .toBuffer();
}

/** 論理座標で組んだ SVG を、実体の倍率に引き伸ばす。 */
function svgDoc(w: number, h: number, body: string): Buffer {
  return Buffer.from(
    `<svg width="${w * SCALE}" height="${h * SCALE}" xmlns="http://www.w3.org/2000/svg">` +
      `<rect width="${w * SCALE}" height="${h * SCALE}" fill="${PAPER}"/>` +
      `<g transform="scale(${SCALE})">${body}</g></svg>`,
  );
}

function text(
  x: number,
  y: number,
  size: number,
  fill: string,
  s: string,
  anchor = "start",
): string {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;
}

function box(x: number, y: number, w: number, h: number): string {
  return `<rect x="${x - 0.5}" y="${y - 0.5}" width="${w + 1}" height="${h + 1}" fill="none" stroke="${LINE}" stroke-width="1"/>`;
}

async function canvas(w: number, h: number, parts: OverlayOptions[]) {
  return sharp({
    create: {
      width: w * SCALE,
      height: h * SCALE,
      channels: 4,
      background: PAPER,
    },
  }).composite(parts);
}

/** 論理座標での貼り付け位置を実体の座標に直す。 */
function at(input: Buffer, x: number, y: number): OverlayOptions {
  return { input, left: Math.round(x * SCALE), top: Math.round(y * SCALE) };
}

/**
 * 平面的な図なのでパレット PNG で書き出す（図版B は 97KB → 42KB）。
 * 固有色は 337 色しかなく、量子化の影響はアイコンのアンチエイリアス部分に限られる
 * （差の出る画素は 0.37%、チャンネル差の最大は 4）。記事が hex を名指ししている色
 * （地の 4 色とタイルの `#F8F7F2`）は量子化後も完全に一致することを確認済み。
 */
function encode(img: Sharp) {
  return img.png({
    palette: true,
    colors: 256,
    compressionLevel: 9,
    effort: 10,
  });
}

/**
 * 図版A: 等倍と 8 倍の対置。
 * 「等倍」と書いた 16px を本当に 16 CSS px で届けることがこの図の全部なので、
 * 論理幅を本文カラムの最小値に収める（縮小されたら等倍でなくなる）。
 */
async function imageA(icon: Icon) {
  const W = FIGURE_A_WIDTH;
  const H = 244;
  const actual = await tile(
    icon.px.map((p) => [p[0], p[1], p[2]] as RGB),
    icon.w,
    icon.h,
    SCALE,
  );
  const zoomed = await tile(
    icon.px.map((p) => [p[0], p[1], p[2]] as RGB),
    icon.w,
    icon.h,
    8 * SCALE,
  );
  const body =
    text(14, 18, 14, INK, "等倍（16×16）") +
    box(14, 26, 16, 16) +
    text(40, 39, 11, SUB, "これがタブに並ぶ大きさだ") +
    text(14, 76, 14, INK, "同じ画像を8倍に拡大") +
    box(14, 84, 128, 128) +
    text(14, 232, 11, SUB, "拡大すれば y と読める。上と同じ画像だ");
  await encode(
    await canvas(W, H, [
      { input: svgDoc(W, H, body), left: 0, top: 0 },
      at(actual, 14, 26),
      at(zoomed, 14, 84),
    ]),
  ).toFile(path.join(OUT, "2026-08-05-favicon-actual-size-vs-zoomed.png"));
}

/**
 * 図版B: 4 つの地それぞれについて、合成した姿と、計器が数えた画素の集合を並べる。
 * 「可視 20px」のような数字だけを出しても何を数えたのかが見えないので、
 * 数えた画素そのものを塗り出す。地に沈んで数から落ちた面はここで黒が消える。
 */
async function imageB(icon: Icon) {
  const W = FIGURE_B_WIDTH;
  const ZOOM = 8;
  const ART = icon.w * ZOOM; // 128
  /** 合成した姿の周りに地を残す幅。地とアイコンの境目が見えないと「沈む」を確かめられない。 */
  const PAD = 8;
  const PANEL = ART + PAD * 2; // 144
  const MARGIN = 20;
  const GAP = 16;
  const ROW_H = PANEL + 18;
  const TOP = 68;
  const LABEL_X = MARGIN + PANEL * 2 + GAP + 24;
  const H = TOP + ROW_H * GROUNDS.length;

  let body =
    text(MARGIN, 26, 17, SUB, "左＝アイコンを地に合成した姿") +
    text(
      MARGIN,
      50,
      17,
      SUB,
      "右＝計器が数えた画素（3:1以上）を黒、数えなかった画素を白で塗った図",
    );
  const parts: OverlayOptions[] = [];

  for (const [i, g] of GROUNDS.entries()) {
    const cy = TOP + i * ROW_H;
    const composed = compositeOn(icon, g.rgb);
    const mask = visibleMask(icon, g.rgb);
    const visible = mask.filter(Boolean).length;
    const blob = largestBlob(mask, icon.w, icon.h);
    const inked: RGB[] = mask.map((v) => (v ? [26, 26, 26] : [255, 255, 255]));
    const maskX = MARGIN + PANEL + GAP;

    body +=
      `<rect x="${MARGIN}" y="${cy}" width="${PANEL}" height="${PANEL}" fill="${g.hex}"/>` +
      box(MARGIN, cy, PANEL, PANEL) +
      box(maskX, cy, PANEL, PANEL) +
      text(LABEL_X, cy + 34, 20, INK, g.name) +
      text(LABEL_X, cy + 58, 16, SUB, g.hex) +
      text(LABEL_X, cy + 92, 17, SUB, `可視 ${visible}px`) +
      text(LABEL_X, cy + 116, 17, SUB, `最大塊 ${blob}px`);
    parts.push(
      at(
        await tile(composed, icon.w, icon.h, ZOOM * SCALE),
        MARGIN + PAD,
        cy + PAD,
      ),
    );
    parts.push(
      at(
        await tile(inked, icon.w, icon.h, ZOOM * SCALE),
        maskX + PAD,
        cy + PAD,
      ),
    );
  }

  await encode(
    await canvas(W, H, [
      { input: svgDoc(W, H, body), left: 0, top: 0 },
      ...parts,
    ]),
  ).toFile(path.join(OUT, "2026-08-05-favicon-four-grounds.png"));
}

void (async () => {
  const icon = await readIcon(BROKEN);
  await imageA(icon);
  await imageB(icon);
  // 記事の <img width/height> と実体がずれると等倍が崩れるので、書き出した実寸を印字する。
  for (const f of [
    "2026-08-05-favicon-actual-size-vs-zoomed.png",
    "2026-08-05-favicon-four-grounds.png",
  ]) {
    const m = await sharp(path.join(OUT, f)).metadata();
    console.log(
      `${f}: ${m.width}x${m.height} → width="${m.width! / SCALE}" height="${m.height! / SCALE}"`,
    );
  }
})();
