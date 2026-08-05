/**
 * アイコン（favicon / apple-touch-icon 等）の可読性を**機械計測**する。
 *
 * ## なぜ要るか
 *
 * cycle-299 は 16px で読めない favicon を「拡大すれば y と分かる」を根拠に合格とし、
 * 壊れたまま出荷した（`docs/cycles/cycle-299/incident-1.md`）。cycle-302 はそれを繰り返さない
 * ために「等倍で見る」判定を導入したが、**同じ対照を3人の観測者のうち2人が落とせなかった**。
 *
 * 根本の理由は、`docs/cycles/cycle-302/criteria.md`「基準 v2 への改訂」に書いたとおり——
 * **「LLM が等倍のラスタを見て読めるか」は、人間の 16px 可読性の代理に原理的にならない**。
 * 人間の可読は画素の物理サイズと視距離という光学的限界で決まるが、LLM は画素配列をそのまま読む。
 *
 * そこで可否の一次根拠を、**観測者に依存しない機械計測**へ移す。このスクリプトがその計器である。
 *
 * ## 較正のアンカー（しきい値を恣意的に決めないための固定点）
 *
 * 本プロジェクトで唯一の**人間側の観測**は、cycle-299 が出荷した favicon（commit `fd088fa1`）に
 * ついて記録された「**y の下半分が切れて v に見える／細すぎる／ドットが中黒に見える**」である
 * （incident-1 §2）。**この1件を確実に不合格にできないしきい値は採用しない。**
 *
 * ## 使い方
 *
 *   npx tsx scripts/icon-metrics.ts <画像パス> [<画像パス> ...]
 *   npx tsx scripts/icon-metrics.ts 'public/favicon.ico[0]'
 *
 * ICO のサブイメージは ImageMagick の `[n]` 記法で指定する。
 */

import sharp from "sharp";
import * as fs from "node:fs/promises";

/** 判定用の地（`docs/cycles/cycle-302/criteria.md` §1-2 の G1〜G4）。 */
const SURFACE_GROUNDS: ReadonlyArray<{ id: string; hex: string; rgb: RGB }> = [
  { id: "G1", hex: "#DEE1E6", rgb: [222, 225, 230] }, // ライトのタブ地
  { id: "G2", hex: "#202124", rgb: [32, 33, 36] }, // ダークのタブ地
  { id: "G3", hex: "#FFFFFF", rgb: [255, 255, 255] }, // 純白（検索結果の地）
  { id: "G4", hex: "#808080", rgb: [128, 128, 128] }, // 中間グレー（明暗どちらにも寄れない最悪ケース）
];

/**
 * 「面として存在が残る」と見なす最低コントラスト比。
 * WCAG 2.1 の非テキストコントラスト（1.4.11）の 3:1 を**工学的なしきい値として援用する**。
 * ※ 1.4.11 には「user agent が外観を決定し author が変更しないもの」の除外があり、
 *   ブラウザクロム上の favicon は適用外の公算が大きい。**「適合する」とは書かない**（6巡目 m-3）。
 */
const MIN_CONTRAST_FOR_PRESENCE = 3.0;

/**
 * 「面として存在が残る」と見なす、最大連結可視塊の最小画素数（16×16＝256px に対して）。
 *
 * **このしきい値は恣意的に決めていない。** 較正のアンカー（cycle-299 が出荷した `fd088fa1`。
 * 人間が「v に見える／細すぎる」と観測した唯一の固定点）を確実に落とし、かつ現行アイコン
 * （人間の観測では壊れていない）を通す位置に置いた。実測値:
 *
 * | 対象                          | G1(ライト) | G2(ダーク) | G3(純白) | G4(中間) |
 * | ----------------------------- | ---------- | ---------- | -------- | -------- |
 * | `fd088fa1`（**落とすべき**）  | **塊12**   | 塊241      | **塊16** | 塊208    |
 * | **変換前**の favicon（通すべき） | 塊234      | **塊26**   | 塊239    | 塊230    |
 * | 対照②(紙地＋極細墨図)        | **塊1**    | 塊256      | **塊2**  | 塊236    |
 *
 * 20 は、`fd088fa1` を落とすのに必要な 17 以上と、変換前 favicon を通すのに必要な 25 以下の**帯の中**にある。
 * **片方だけを見て決めていない。** ただし帯の内側（17〜25）ならどれでも較正の要件を満たし、テストは区別しない。
 */
export const MIN_VISIBLE_COMPONENT_PER_256 = 20;

/**
 * 円マスクで失ってよい図の割合の上限。
 *
 * **較正（両側）**: 落とすべき対照③（四隅に情報）は 48×48 で **56.9%**。通すべき側は
 * 変換前・出荷物の全層とも **0.0%**（図が中央に収まっている）。0 と 56.9 の間で、
 * 「四隅の装飾がわずかに切れる程度は許す」意図から 15% に置く。
 * ※ 通すべき側が全部 0.0% なので、この値は**上側の較正が効いていない**（0.01〜0.56 の
 *   どこでもテストは通る）。**境界にある実例が現れたら較正し直す**——いまは対照③との距離
 *   （56.9 対 15）だけが根拠である。この限界を隠さない（6巡目 M-2）。
 */
export const MAX_OUTSIDE_INSCRIBED_CIRCLE = 0.15;

/**
 * 図が「細すぎない」と見なす、ストローク充実度（4近傍すべてが図である画素の割合）の下限。
 *
 * **較正（両側）**: 落とすべき側は `fd088fa1` **15.8%**・対照②（極細墨図）**3.8%**（**担保に使うのは最大の 15.8%**——落とすべき実例が複数あるとき、最も通りやすい値を下限に置かないと1件しか担保できない）。
 * 通すべき側は**較正のアンカーである変換前**の 16px **22.7%**（出荷物は 27.1%）・32px **51.5%**・apple **88.2%**。
 * **20% は 15.8 と 22.7 の間**にある（テストが通る帯は **0.16〜0.22**）。
 * ※ 当初ここに「27.1%」（＝出荷物の値）と書いていたのは**循環**である。人間の観測が付いているのは
 *   変換前のファイルだけなので、アンカーはそちらでなければならない（M-6 と同じ誤りをここで繰り返していた）。cycle-299 の失敗の第一の機序（細さで消える）を、
 * 地とのコントラストとは独立に捕まえる。
 */
export const MIN_STROKE_SOLIDITY = 0.2;

/** 有彩色と見なす、RGB の最大値と最小値の差の下限。無彩色のアンチエイリアスを除くため。 */
const CHROMATIC_MIN_SPREAD = 20;

/** 図（地でない画素）と見なす、地からの色距離のしきい値（0-255 のユークリッド距離）。 */
const FIGURE_COLOR_DISTANCE = 24;

type RGB = readonly [number, number, number];
/** アルファを含む画素。透過を落とすと、透過の候補を不透明と誤判定する。 */
type RGBA = readonly [number, number, number, number];

export interface Metrics {
  readonly label: string;
  readonly width: number;
  readonly height: number;
  /** 最頻色＝アイコン自身の地。 */
  readonly ownGround: RGB;
  /** 図の画素数。 */
  readonly figurePixels: number;
  /** 図のうち 4近傍すべてが図である画素の割合。低いほどストロークが細い（1px 幅なら 0 に近づく）。 */
  readonly strokeSolidity: number;
  /** 図の最大連結成分の画素数。 */
  readonly largestComponent: number;
  /** 内接円の外にある図の画素の割合（円マスクで失われる量）。 */
  readonly outsideInscribedCircle: number;
  /**
   * 有彩色の図要素（アクセント等）の、**アイコン自身の地**に対するコントラスト比の**中央値**。
   *
   * **面の地（G1〜G4）と混同しない。** アイコン内部の要素は自分のタイルの上に乗っているので、
   * 可読性を決めるのはタイルとのコントラストであって、ページの地とのコントラストではない。
   * この2つを混同すると「暗いタイルの中の明るいドット」が、明るいページ地で不可視と誤判定される。
   */
  readonly chromaticContrastToOwnGround: number;
  /**
   * 青みがかった画素の数（`b > r + 2`。+2 は 8bit の丸め誤差を無彩色と見なすため）。DESIGN §8-1 は紫〜青のアクセントを名指しで禁じており、
   * cycle-171 の旧ブランドはこれに該当した。**0 でなければ旧ブランドの残存を疑う。**
   */
  readonly bluishPixels: number;
  /** 透過を含むか。apple-touch-icon は透過不可（iOS が黒く合成する）＝ N9。 */
  readonly hasTransparency: boolean;
  /** 完全透過の画素数。 */
  readonly fullyTransparentPixels: number;
  /**
   * 地ごとの存在感。`visiblePixels` は「コントラスト 3:1 以上を持つ画素数」、
   * `largestVisibleComponent` はそのうち最大の連結成分。
   * **画素数だけでは足りない**——同じ画素数でも、まとまっていれば図として読め、散っていれば読めない。
   */
  readonly presenceByGround: ReadonlyArray<{
    id: string;
    visiblePixels: number;
    ratio: number;
    largestVisibleComponent: number;
  }>;
}

/**
 * 画素を読み出す。
 *
 * **`sharp` を使う（既に依存に入っている）。** 当初は ImageMagick の `convert` を呼んでいたが、
 * (1) `ubuntu-latest` のランナーイメージから ImageMagick は削除済みで **CI で必ず落ちる**、
 * (2) `sharp` は宣言済み・バージョン固定でどこでも同じ結果になる、
 * (3) `convert ... txt:-` はアルファを落としており、透過を持つ候補を誤って不透明と判定していた。
 *
 * ICO は sharp が読めないので、**サブイメージを自前で切り出してから** sharp に渡す。
 * ICO のバイト列は単純で（6 バイトのヘッダ＋16 バイトのエントリ列＋PNG か BMP の実体）、
 * 外部バイナリに依存するより自前で読むほうが確実である。
 */
async function readPixels(spec: string): Promise<{
  pixels: RGBA[];
  width: number;
  height: number;
}> {
  const buffer = await loadImageBuffer(spec);
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixels: RGBA[] = new Array(info.width * info.height);
  for (let i = 0; i < info.width * info.height; i++) {
    const o = i * info.channels;
    pixels[i] = [data[o], data[o + 1], data[o + 2], data[o + 3]] as const;
  }
  return { pixels, width: info.width, height: info.height };
}

/** `path/to/x.ico[1]` のようなサブイメージ指定を解いて、sharp が読める画像バイト列にする。 */
async function loadImageBuffer(spec: string): Promise<Buffer> {
  const m = spec.match(/^(.*)\[(\d+)\]$/);
  const filePath = m ? m[1] : spec;
  const index = m ? Number(m[2]) : 0;
  const raw = await fs.readFile(filePath);
  if (!filePath.toLowerCase().endsWith(".ico")) return raw;
  return extractIcoSubImage(raw, index);
}

/**
 * ICO からサブイメージを取り出し、sharp が読める PNG バイト列に変換する。
 *
 * ICO の中身は PNG か BMP（DIB）のどちらか。PNG ならそのまま返し、
 * BMP なら 32bpp/24bpp のボトムアップ BGRA(BGR) を読んで PNG に組み直す。
 */
async function extractIcoSubImage(ico: Buffer, index: number): Promise<Buffer> {
  const count = ico.readUInt16LE(4);
  if (index >= count) {
    throw new Error(
      `ICO のサブイメージ ${index} は存在しない（全 ${count} 件）`,
    );
  }
  const entry = 6 + index * 16;
  const bytes = ico.readUInt32LE(entry + 8);
  const offset = ico.readUInt32LE(entry + 12);
  const body = ico.subarray(offset, offset + bytes);

  // PNG がそのまま埋まっている形式。
  if (body.length > 8 && body.readUInt32BE(0) === 0x89504e47) return body;

  // BMP（BITMAPINFOHEADER）。高さは AND マスクを含むので実際の 2 倍が入っている。
  const dibHeaderSize = body.readUInt32LE(0);
  const width = body.readInt32LE(4);
  const height = Math.floor(body.readInt32LE(8) / 2);
  const bitCount = body.readUInt16LE(14);
  if (bitCount !== 32 && bitCount !== 24) {
    throw new Error(`未対応の ICO ビット深度: ${bitCount}bpp`);
  }
  const bytesPerPixel = bitCount / 8;
  const rowSize = Math.ceil((width * bytesPerPixel) / 4) * 4;
  const pixelStart = dibHeaderSize;
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    // BMP はボトムアップ（最終行が先頭にある）。
    const srcRow = pixelStart + (height - 1 - y) * rowSize;
    for (let x = 0; x < width; x++) {
      const s = srcRow + x * bytesPerPixel;
      const d = (y * width + x) * 4;
      rgba[d] = body[s + 2]; // R
      rgba[d + 1] = body[s + 1]; // G
      rgba[d + 2] = body[s]; // B
      rgba[d + 3] = bitCount === 32 ? body[s + 3] : 255; // A
    }
  }
  return sharp(rgba, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();
}

/** WCAG の相対輝度。 */
function relativeLuminance([r, g, b]: RGB): number {
  const channel = (v: number): number => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG のコントラスト比（1〜21）。 */
function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function colorDistance(a: RGB, b: RGB): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/** 真の画素のうち最大の4近傍連結成分の大きさ。図が「まとまっているか散っているか」を測る。 */
function largestComponentOf(
  mask: readonly boolean[],
  width: number,
  height: number,
): number {
  const seen = new Uint8Array(width * height);
  let largest = 0;
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i] || seen[i]) continue;
    let size = 0;
    const stack = [i];
    seen[i] = 1;
    while (stack.length > 0) {
      const cur = stack.pop() as number;
      size += 1;
      const cx = cur % width;
      const cy = Math.floor(cur / width);
      const neighbours = [
        cy > 0 ? cur - width : -1,
        cy < height - 1 ? cur + width : -1,
        cx > 0 ? cur - 1 : -1,
        cx < width - 1 ? cur + 1 : -1,
      ];
      for (const n of neighbours) {
        if (n >= 0 && mask[n] && !seen[n]) {
          seen[n] = 1;
          stack.push(n);
        }
      }
    }
    if (size > largest) largest = size;
  }
  return largest;
}

export async function measure(spec: string): Promise<Metrics> {
  const { pixels: rgba, width, height } = await readPixels(spec);
  // 色の計算は RGB で行い、アルファは別に持つ（透過を落とすと透過の候補を誤判定する）。
  const pixels: RGB[] = rgba.map((p) => [p[0], p[1], p[2]] as const);
  const alpha = rgba.map((p) => p[3]);
  const fullyTransparentPixels = alpha.filter((a) => a === 0).length;
  const hasTransparency = alpha.some((a) => a < 255);

  // アイコン自身の地＝最頻色。
  const counts = new Map<string, { rgb: RGB; n: number }>();
  for (const p of pixels) {
    const key = p.join(",");
    const hit = counts.get(key);
    if (hit) hit.n += 1;
    else counts.set(key, { rgb: p, n: 1 });
  }
  const ownGround = [...counts.values()].sort((a, b) => b.n - a.n)[0].rgb;

  // 図＝地から十分離れた画素。
  const isFigure = pixels.map(
    (p) => colorDistance(p, ownGround) > FIGURE_COLOR_DISTANCE,
  );
  const figurePixels = isFigure.filter(Boolean).length;

  // ストロークの太さ: 4近傍すべてが図である画素の割合。
  // 1px 幅の線はこの条件をほぼ満たさないので 0 に近づく＝「細い」ことの機械的な指標。
  let solid = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!isFigure[y * width + x]) continue;
      const up = y > 0 && isFigure[(y - 1) * width + x];
      const down = y < height - 1 && isFigure[(y + 1) * width + x];
      const left = x > 0 && isFigure[y * width + (x - 1)];
      const right = x < width - 1 && isFigure[y * width + (x + 1)];
      if (up && down && left && right) solid += 1;
    }
  }
  const strokeSolidity = figurePixels === 0 ? 0 : solid / figurePixels;

  const largestComponent = largestComponentOf(isFigure, width, height);

  // 内接円の外にある図の割合（円マスクで失われる量）。
  const cx = (width - 1) / 2;
  const cy = (height - 1) / 2;
  const radius = Math.min(width, height) / 2;
  let outside = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!isFigure[y * width + x]) continue;
      if (Math.hypot(x - cx, y - cy) > radius) outside += 1;
    }
  }
  const outsideInscribedCircle =
    figurePixels === 0 ? 0 : outside / figurePixels;

  // 青みの残存（DESIGN §8-1 の禁止色の検出）。
  const bluishPixels = pixels.filter((p) => p[2] > p[0] + 2).length;

  // 有彩色要素（アクセント）の、アイコン自身の地に対するコントラスト。
  // 白やグレーのアンチエイリアスは無彩色なので除外し、色を担っている画素だけを見る。
  // **最大値は採らない。** 最大だと、大部分の朱が地に沈んでいてもアンチエイリアスの
  // 1 画素が明るければ通ってしまう——「不合格を出しうる測度」を作ったつもりで、
  // 最も合格しやすい統計量を選ぶことになる（6巡目 M-5）。**中央値**を採る。
  const chromaticContrasts: number[] = [];
  for (let i = 0; i < pixels.length; i++) {
    if (!isFigure[i]) continue;
    const p = pixels[i];
    if (Math.max(...p) - Math.min(...p) <= CHROMATIC_MIN_SPREAD) continue;
    chromaticContrasts.push(contrastRatio(p, ownGround));
  }
  chromaticContrasts.sort((a, b) => a - b);
  const chromaticContrastToOwnGround =
    chromaticContrasts.length === 0
      ? 0
      : chromaticContrasts[Math.floor(chromaticContrasts.length / 2)];

  // 地ごとの存在感。
  //
  // 画素数だけでは足りない——現行 favicon はダークのタブ地でタイルが溶けて 26px しか残らないが、
  // その 26px は白い「y」としてまとまっており識別できる。一方 cycle-299 の不合格品はライト地で
  // 20px 残るが、それは細い線の最も濃い芯が飛び飛びに残ったもので図をなさない。
  // **同じ画素数でも、まとまっているか散っているかで可読性が正反対になる**ので、両方を測る。
  const presenceByGround = SURFACE_GROUNDS.map((g) => {
    // **地の上に合成してから測る。** 透過を無視して素の RGB を比べると、
    // 完全透過の画素がその RGB（多くは 0,0,0 や 255,255,255）で「見えている」ことになり、
    // **透過ファビコンに対して安全でない方向へ誤って合格を返す**（7巡目のブログレビュー B1）。
    // 実際に起きるのは「地の上に合成された姿」なので、それを測る。
    const visible = rgba.map((p) => {
      const a = p[3] / 255;
      const composited: RGB = [
        Math.round(p[0] * a + g.rgb[0] * (1 - a)),
        Math.round(p[1] * a + g.rgb[1] * (1 - a)),
        Math.round(p[2] * a + g.rgb[2] * (1 - a)),
      ];
      return contrastRatio(composited, g.rgb) >= MIN_CONTRAST_FOR_PRESENCE;
    });
    const visiblePixels = visible.filter(Boolean).length;
    return {
      id: g.id,
      visiblePixels,
      ratio: visiblePixels / pixels.length,
      largestVisibleComponent: largestComponentOf(visible, width, height),
    };
  });

  return {
    label: spec,
    width,
    height,
    ownGround,
    figurePixels,
    strokeSolidity,
    largestComponent,
    outsideInscribedCircle,
    chromaticContrastToOwnGround,
    bluishPixels,
    hasTransparency,
    fullyTransparentPixels,
    presenceByGround,
  };
}

/** しきい値に照らした合否。CLI とテストで同じ判定を使う（判定の二重定義を作らない）。 */
export function verdictOf(m: Metrics): {
  pass: boolean;
  failedGrounds: string[];
  maskFails: boolean;
  tooThin: boolean;
} {
  const minBlob = (MIN_VISIBLE_COMPONENT_PER_256 * m.width * m.height) / 256;
  const failedGrounds = m.presenceByGround
    .filter((p) => p.largestVisibleComponent < minBlob)
    .map((p) => p.id);
  // N3（円マスク耐性）は **32px 以上の層にのみ課す**。
  // 16×16 で内接円の外を使わないと実効の図領域が約 11×11 に落ち、実在が確定した要件
  // （16px 可読）を、実在が未確認の制約（検索結果の円形マスク）で損なうため
  // （criteria.md【M-4】の凍結済みの判断。計器がこれに従っていないと基準と矛盾する）。
  const maskApplies = Math.min(m.width, m.height) >= 32;
  const maskFails =
    maskApplies && m.outsideInscribedCircle > MAX_OUTSIDE_INSCRIBED_CIRCLE;
  // 細さは、地とのコントラストとは独立の失敗の機序（cycle-299 の第一の機序）。
  // 表示するだけで判定に使っていなかったのを是正した（6巡目 M-4）。
  const tooThin = m.strokeSolidity < MIN_STROKE_SOLIDITY;
  return {
    pass: failedGrounds.length === 0 && !maskFails && !tooThin,
    failedGrounds,
    maskFails,
    tooThin,
  };
}

function formatMetrics(m: Metrics): string {
  const presence = m.presenceByGround
    .map((p) => `${p.id}=${p.visiblePixels}px/塊${p.largestVisibleComponent}`)
    .join(" ");
  const v = verdictOf(m);
  const verdict = v.pass
    ? "PASS"
    : `FAIL(${[
        v.failedGrounds.length > 0
          ? `地に溶ける:${v.failedGrounds.join("/")}`
          : "",
        v.maskFails ? "円マスクで欠ける" : "",
        v.tooThin ? "図が細すぎる" : "",
      ]
        .filter(Boolean)
        .join(" ")})`;
  return [
    `── ${m.label}  ${m.width}×${m.height}  → ${verdict}`,
    `   地(最頻色)          : rgb(${m.ownGround.join(",")})`,
    `   図の画素数          : ${m.figurePixels}`,
    `   ストローク充実度    : ${(m.strokeSolidity * 100).toFixed(1)}%  ← 低いほど細い(1px幅は0に近づく)`,
    `   最大連結成分        : ${m.largestComponent}px`,
    `   内接円の外の図      : ${(m.outsideInscribedCircle * 100).toFixed(1)}%  ← 円マスクで失う量`,
    `   青みの画素(§8-1)    : ${m.bluishPixels}px  ← 0 でなければ旧ブランドの残存を疑う`,
    `   透過                : ${m.hasTransparency ? `あり(完全透過 ${m.fullyTransparentPixels}px)` : "なし"}  ← apple-touch は透過不可(N9)`,
    `   有彩色要素のCR      : ${m.chromaticContrastToOwnGround.toFixed(3)}（中央値）  ← アイコン自身の地に対して(WCAG 1.4.11 の 3:1 を援用)`,
    `   面として残る画素    : ${presence}  ← 可視画素数/最大連結塊(コントラスト${MIN_CONTRAST_FOR_PRESENCE}:1以上)`,
  ].join("\n");
}

// テストから import されたときは実行しない（CLI として起動されたときだけ走る）。
async function main(): Promise<void> {
  const targets = process.argv.slice(2);
  if (targets.length === 0) {
    console.error(
      "使い方: npx tsx scripts/icon-metrics.ts <画像パス> [<画像パス> ...]",
    );
    process.exitCode = 1;
    return;
  }
  for (const t of targets) {
    console.log(formatMetrics(await measure(t)));
    console.log("");
  }
}

// テストから import されたときは実行しない（CLI として起動されたときだけ走る）。
if (process.argv[1]?.endsWith("icon-metrics.ts")) {
  void main();
}
