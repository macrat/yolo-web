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

import { execFileSync } from "node:child_process";

/** 判定用の地（`docs/cycles/cycle-302/criteria.md` §1-2 の G1〜G4）。 */
const SURFACE_GROUNDS: ReadonlyArray<{ id: string; hex: string; rgb: RGB }> = [
  { id: "G1", hex: "#DEE1E6", rgb: [222, 225, 230] }, // ライトのタブ地
  { id: "G2", hex: "#202124", rgb: [32, 33, 36] }, // ダークのタブ地
  { id: "G3", hex: "#FFFFFF", rgb: [255, 255, 255] }, // 純白（検索結果の地）
  { id: "G4", hex: "#808080", rgb: [128, 128, 128] }, // 中間グレー（明暗どちらにも寄れない最悪ケース）
];

/**
 * 「面として存在が残る」と見なす最低コントラスト比。
 * WCAG 2.1 の非テキストコントラスト（1.4.11）が UI 部品・図形に求める値と同じ 3:1 を採る。
 * アイコンは文字ではなく図形として識別されるため、本文の 4.5:1 ではなくこちらが適合する。
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
 * | 現行 favicon（通すべき）      | 塊234      | **塊26**   | 塊239    | 塊230    |
 * | 対照②(紙地＋極細墨図)        | **塊1**    | 塊256      | **塊2**  | 塊236    |
 *
 * 20 は、`fd088fa1` の最悪 16 と現行の最悪 26 の間にある。**片方だけを見て決めていない。**
 */
export const MIN_VISIBLE_COMPONENT_PER_256 = 20;

/** 円マスクで失ってよい図の割合の上限。対照③(四隅に情報)が 48% で落ちる位置に置く。 */
export const MAX_OUTSIDE_INSCRIBED_CIRCLE = 0.15;

/** 有彩色と見なす、RGB の最大値と最小値の差の下限。無彩色のアンチエイリアスを除くため。 */
const CHROMATIC_MIN_SPREAD = 20;

/** 図（地でない画素）と見なす、地からの色距離のしきい値（0-255 のユークリッド距離）。 */
const FIGURE_COLOR_DISTANCE = 24;

type RGB = readonly [number, number, number];

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
   * 有彩色の図要素（アクセント等）の、**アイコン自身の地**に対する最大コントラスト比。
   *
   * **面の地（G1〜G4）と混同しない。** アイコン内部の要素は自分のタイルの上に乗っているので、
   * 可読性を決めるのはタイルとのコントラストであって、ページの地とのコントラストではない。
   * この2つを混同すると「暗いタイルの中の明るいドット」が、明るいページ地で不可視と誤判定される。
   */
  readonly chromaticContrastToOwnGround: number;
  /**
   * 青みがかった画素の数（`b > r`）。DESIGN §8-1 は紫〜青のアクセントを名指しで禁じており、
   * cycle-171 の旧ブランドはこれに該当した。**0 でなければ旧ブランドの残存を疑う。**
   */
  readonly bluishPixels: number;
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

/** ImageMagick で画素を読み出す（外部ライブラリを足さずに済ませるため）。 */
function readPixels(path: string): {
  pixels: RGB[];
  width: number;
  height: number;
} {
  const txt = execFileSync("convert", [path, "-depth", "8", "txt:-"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const lines = txt.split("\n");
  // 1行目は "# ImageMagick pixel enumeration: 16,16,255,srgb"
  const header = lines[0].match(/enumeration:\s*(\d+),(\d+)/);
  if (!header) throw new Error(`画素列挙のヘッダを解釈できない: ${lines[0]}`);
  const width = Number(header[1]);
  const height = Number(header[2]);
  const pixels: RGB[] = new Array(width * height);
  for (const line of lines.slice(1)) {
    // 例: "0,0: (26,26,26)  #1A1A1A  grey10"
    const m = line.match(/^(\d+),(\d+):\s*\(([^)]+)\)/);
    if (!m) continue;
    const x = Number(m[1]);
    const y = Number(m[2]);
    const parts = m[3].split(",").map((v) => Number(v.trim()));
    pixels[y * width + x] = [parts[0], parts[1], parts[2]] as const;
  }
  return { pixels, width, height };
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

export function measure(path: string): Metrics {
  const { pixels, width, height } = readPixels(path);

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
  let chromaticContrastToOwnGround = 0;
  for (let i = 0; i < pixels.length; i++) {
    if (!isFigure[i]) continue;
    const p = pixels[i];
    const chroma = Math.max(...p) - Math.min(...p);
    if (chroma <= CHROMATIC_MIN_SPREAD) continue;
    const cr = contrastRatio(p, ownGround);
    if (cr > chromaticContrastToOwnGround) chromaticContrastToOwnGround = cr;
  }

  // 地ごとの存在感。
  //
  // 画素数だけでは足りない——現行 favicon はダークのタブ地でタイルが溶けて 26px しか残らないが、
  // その 26px は白い「y」としてまとまっており識別できる。一方 cycle-299 の不合格品はライト地で
  // 20px 残るが、それは細い線の最も濃い芯が飛び飛びに残ったもので図をなさない。
  // **同じ画素数でも、まとまっているか散っているかで可読性が正反対になる**ので、両方を測る。
  const presenceByGround = SURFACE_GROUNDS.map((g) => {
    const visible = pixels.map(
      (p) => contrastRatio(p, g.rgb) >= MIN_CONTRAST_FOR_PRESENCE,
    );
    const visiblePixels = visible.filter(Boolean).length;
    return {
      id: g.id,
      visiblePixels,
      ratio: visiblePixels / pixels.length,
      largestVisibleComponent: largestComponentOf(visible, width, height),
    };
  });

  return {
    label: path,
    width,
    height,
    ownGround,
    figurePixels,
    strokeSolidity,
    largestComponent,
    outsideInscribedCircle,
    chromaticContrastToOwnGround,
    bluishPixels,
    presenceByGround,
  };
}

/** しきい値に照らした合否。CLI とテストで同じ判定を使う（判定の二重定義を作らない）。 */
export function verdictOf(m: Metrics): {
  pass: boolean;
  failedGrounds: string[];
  maskFails: boolean;
} {
  const minBlob = (MIN_VISIBLE_COMPONENT_PER_256 * m.width * m.height) / 256;
  const failedGrounds = m.presenceByGround
    .filter((p) => p.largestVisibleComponent < minBlob)
    .map((p) => p.id);
  const maskFails = m.outsideInscribedCircle > MAX_OUTSIDE_INSCRIBED_CIRCLE;
  return {
    pass: failedGrounds.length === 0 && !maskFails,
    failedGrounds,
    maskFails,
  };
}

function formatMetrics(m: Metrics): string {
  const presence = m.presenceByGround
    .map((p) => `${p.id}=${p.visiblePixels}px/塊${p.largestVisibleComponent}`)
    .join(" ");
  const area = m.width * m.height;
  const minBlob = (MIN_VISIBLE_COMPONENT_PER_256 * area) / 256;
  const failedGrounds = m.presenceByGround
    .filter((p) => p.largestVisibleComponent < minBlob)
    .map((p) => p.id);
  const maskFails = m.outsideInscribedCircle > MAX_OUTSIDE_INSCRIBED_CIRCLE;
  const verdict =
    failedGrounds.length === 0 && !maskFails
      ? "PASS"
      : `FAIL(${[
          failedGrounds.length > 0
            ? `地に溶ける:${failedGrounds.join("/")}`
            : "",
          maskFails ? "円マスクで欠ける" : "",
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
    `   有彩色要素のCR      : ${m.chromaticContrastToOwnGround.toFixed(3)}  ← アイコン自身の地に対して(WCAG 1.4.11 は 3:1 以上)`,
    `   面として残る画素    : ${presence}  ← 可視画素数/最大連結塊(コントラスト${MIN_CONTRAST_FOR_PRESENCE}:1以上)`,
  ].join("\n");
}

// テストから import されたときは実行しない（CLI として起動されたときだけ走る）。
if (process.argv[1]?.endsWith("icon-metrics.ts")) {
  const targets = process.argv.slice(2);
  if (targets.length === 0) {
    console.error(
      "使い方: npx tsx scripts/icon-metrics.ts <画像パス> [<画像パス> ...]",
    );
    process.exit(1);
  }
  for (const t of targets) {
    console.log(formatMetrics(measure(t)));
    console.log("");
  }
}
