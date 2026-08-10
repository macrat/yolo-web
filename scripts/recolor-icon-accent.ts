/**
 * アイコンのアクセント色だけを、**図と地の構造を変えずに**差し替える。
 *
 * cycle-302 の E0（`public/favicon.ico`・`public/apple-touch-icon.png` から DESIGN §8-1 が禁じる
 * 青を除去した作業）で使った変換をスクリプトとして残す。**成果物を生んだ手順が版管理されていないと、
 * 層を足すときに再現できない。
 *
 * ## 何をするか
 *
 * 元画像で「青みがかっている」画素（`b > r`）だけを対象に、**地とアクセントの混合率 c を保ったまま**
 * 新しいアクセント色へ混ぜ直す。
 *
 *     c   = (b - ground.b) / (source.b - ground.b)
 *     new = ground + c × (target - ground)
 *
 * 白の字も無彩色のアンチエイリアスも地も `b = r` なので、対象から外れて一切動かない。
 *
 * ## 大事な注意
 *
 * **混合率の保存は、明暗の保存ではない。** 色相だけ変えても輝度は変わる。E0 の初版は
 * ライト固定の `ACCENT`（`#af3622`）を暗い地に当てて、アクセントのコントラストを旧ブランドの青
 * （3.568）より低い 2.796 まで落とした。**変換後は必ず各地に対するコントラストを前後で比較すること**
 * （色相だけ変えても輝度は変わる）。
 *
 * ## 使い方
 *
 *   npx tsx scripts/recolor-icon-accent.ts <入力> <出力> --from '#386BDC' --to '#e87a65' --ground '#1a1a1a'
 *
 * ICO のサブイメージは `<path>[n]` で指定する（出力は PNG）。
 */

import sharp from "sharp";
import * as fs from "node:fs/promises";

interface Options {
  readonly input: string;
  readonly output: string;
  readonly from: readonly [number, number, number];
  readonly to: readonly [number, number, number];
  readonly ground: readonly [number, number, number];
}

function parseHex(hex: string): readonly [number, number, number] {
  const m = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(m)) throw new Error(`色の指定が不正: ${hex}`);
  return [
    parseInt(m.slice(0, 2), 16),
    parseInt(m.slice(2, 4), 16),
    parseInt(m.slice(4, 6), 16),
  ] as const;
}

/** `path/to/x.ico[1]` のサブイメージ指定を解いて、sharp が読めるバイト列にする。 */
async function loadImageBuffer(spec: string): Promise<Buffer> {
  const m = spec.match(/^(.*)\[(\d+)\]$/);
  const filePath = m ? m[1] : spec;
  const index = m ? Number(m[2]) : 0;
  const raw = await fs.readFile(filePath);
  if (!filePath.toLowerCase().endsWith(".ico")) return raw;

  const count = raw.readUInt16LE(4);
  if (index >= count) {
    throw new Error(
      `ICO のサブイメージ ${index} は存在しない（全 ${count} 件）`,
    );
  }
  const entry = 6 + index * 16;
  const body = raw.subarray(
    raw.readUInt32LE(entry + 12),
    raw.readUInt32LE(entry + 12) + raw.readUInt32LE(entry + 8),
  );
  if (body.length > 8 && body.readUInt32BE(0) === 0x89504e47) return body;

  // BMP（BITMAPINFOHEADER）。高さは AND マスクぶん 2 倍が入っている。
  const dibHeaderSize = body.readUInt32LE(0);
  const width = body.readInt32LE(4);
  const height = Math.floor(body.readInt32LE(8) / 2);
  const bitCount = body.readUInt16LE(14);
  if (bitCount !== 32 && bitCount !== 24) {
    throw new Error(`未対応の ICO ビット深度: ${bitCount}bpp`);
  }
  const bytesPerPixel = bitCount / 8;
  const rowSize = Math.ceil((width * bytesPerPixel) / 4) * 4;
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    const srcRow = dibHeaderSize + (height - 1 - y) * rowSize; // BMP はボトムアップ
    for (let x = 0; x < width; x++) {
      const s = srcRow + x * bytesPerPixel;
      const d = (y * width + x) * 4;
      rgba[d] = body[s + 2];
      rgba[d + 1] = body[s + 1];
      rgba[d + 2] = body[s];
      rgba[d + 3] = bitCount === 32 ? body[s + 3] : 255;
    }
  }
  return sharp(rgba, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();
}

async function recolor(opts: Options): Promise<{ changed: number }> {
  const { data, info } = await sharp(await loadImageBuffer(opts.input))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const denominator = opts.from[2] - opts.ground[2];
  if (denominator === 0)
    throw new Error("--from と --ground の青成分が同じで混合率を求められない");

  let changed = 0;
  for (let i = 0; i < info.width * info.height; i++) {
    const o = i * info.channels;
    const r = data[o];
    const b = data[o + 2];
    if (b <= r) continue; // 青みでない画素（白の字・無彩色の灰・地）は触らない
    const c = (b - opts.ground[2]) / denominator;
    for (let ch = 0; ch < 3; ch++) {
      data[o + ch] = Math.round(
        opts.ground[ch] + c * (opts.to[ch] - opts.ground[ch]),
      );
    }
    changed += 1;
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png()
    .toFile(opts.output);
  return { changed };
}

function readFlag(name: string, fallback?: string): string {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  if (fallback !== undefined) return fallback;
  throw new Error(`--${name} が必要`);
}

async function main(): Promise<void> {
  const positional = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const flagValues = new Set(
    ["from", "to", "ground"].map((n) => readFlag(n, "")).filter(Boolean),
  );
  const files = positional.filter((a) => !flagValues.has(a));
  if (files.length < 2) {
    console.error(
      "使い方: npx tsx scripts/recolor-icon-accent.ts <入力> <出力> --from '#386BDC' --to '#e87a65' --ground '#1a1a1a'",
    );
    process.exitCode = 1;
    return;
  }
  const { changed } = await recolor({
    input: files[0],
    output: files[1],
    from: parseHex(readFlag("from")),
    to: parseHex(readFlag("to")),
    ground: parseHex(readFlag("ground", "#1a1a1a")),
  });
  console.log(`${files[0]} → ${files[1]}（${changed} 画素を置換）`);
  console.log(
    "※ 変換後は必ず各地に対するコントラストを前後で比較すること（混合率の保存は明暗の保存ではない）。",
  );
}

if (process.argv[1]?.endsWith("recolor-icon-accent.ts")) {
  void main();
}
