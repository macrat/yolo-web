// @ts-check
/**
 * ブランドアイコン（favicon / apple-touch-icon）の生成器。
 *
 * なぜスクリプトにするか: `public/favicon.ico`・`public/apple-touch-icon.png` は
 * コミットされるバイナリのブランド資産で、差分レビューで中身を読めない（cycle-282 が
 * 「バイナリ死角」として B-576 を起票した理由）。生成の素性（どのフォント・どの色・どの
 * 構図か）をこのスクリプトに固定し、将来の微調整・再ブランドを再現可能にする。
 *
 * 構図（cycle-299・DESIGN.md §4「のれん」の店号をアイコンへ縮約）:
 *   のれん（`src/components/Header`）は店号「yolos.net」を明朝・墨で組み、ドット「.」だけを
 *   朱にする。その識別子を頭文字へ縮約したのが本アイコン＝「紙地に明朝の墨『y』＋朱のドット」。
 *   旧アイコン（cycle-171・暗地ベタ＋白ゴシック y＋青ドット #2563eb）は cycle-282 で店構えへ
 *   刷新された視覚言語（紙・墨・明朝・朱）に取り残されていた。これを正す。
 *   印「試」は使わない（印/店の主張の要否は B-583 で未決＝先取りしない）。
 *
 * 器の色 SSoT は `src/lib/utsuwaHex.ts`。このスクリプトの hex はそれと一致させること
 *   （PAPER/INK/ACCENT を変えるときは両方直す）。
 * 見出し明朝は `src/lib/fonts.ts` と同じ Noto Serif JP 600（源ノ明朝）。Google Fonts から
 *   TTF を取得する（Satori/ImageMagick は woff2 を扱えないため、Android UA で TTF を引く）。
 *
 * 依存: ImageMagick `convert`（実フォントのグリフ描画・合成・ico 出力）。ネットワーク（フォント取得）。
 * 実行: `node scripts/generate-brand-icons.mjs`（ビルド工程には含めない一回性の資産生成）。
 *
 * サイズ設計（16-32px は別種の craft・cycle-282）: favicon はタイルをよく埋めて豆粒でも読める
 *   ように、apple-touch（180px・iOS ホーム画面）は角丸マスクを見越した安全余白を取り優美に組む。
 *   apple-touch は透過なし（iOS は透過を黒く合成する）＝紙地ベタで自然に満たす。
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// 器の色（SSoT = src/lib/utsuwaHex.ts と一致させる）。
// なぜ import せず再宣言か: この3値の import は不可能ではない（`.ts` 化して tsx で実行すれば
// utsuwaHex.ts を直接 import できる）。それでも一回性・非 CI の資産生成器を node-standalone に
// 保ち、資産の再生成を src/ のビルド設定へ結合させない方針で、あえて再宣言する（受容した
// トレードオフ）。SSoT を変えたら両方直すこと。乖離ガード不在は B-611 で追跡。
const PAPER = "#f8f7f2"; // 紙地
const INK = "#201e1a"; // 墨（字）
const ACCENT = "#af3622"; // 朱（ドット）

// 見出し明朝（src/lib/fonts.ts と同じ Noto Serif JP 600）を TTF で取得するための CSS。
const MINCHO_CSS_URL =
  "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@600&display=swap";
// Android 端末の UA を使うと Google が単一ファイルの TTF を返す（woff2 を避ける）。
const TTF_USER_AGENT =
  "Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; Nexus 5 Build/KOT49H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30";

const repoRoot = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const publicDir = join(repoRoot, "public");

/** Noto Serif JP 600 の TTF バイナリを取得する。 */
async function fetchMinchoTtf() {
  const cssRes = await fetch(MINCHO_CSS_URL, {
    headers: { "User-Agent": TTF_USER_AGENT },
  });
  if (!cssRes.ok) throw new Error(`font css fetch failed: ${cssRes.status}`);
  const css = await cssRes.text();
  const m = css.match(/src:\s*url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
  if (!m) throw new Error("could not find font url in css");
  const fontRes = await fetch(m[1]);
  if (!fontRes.ok) throw new Error(`font fetch failed: ${fontRes.status}`);
  const buf = Buffer.from(await fontRes.arrayBuffer());
  // TTF のマジックナンバー（0x00010000）を確認。
  if (!(
    buf[0] === 0x00 &&
    buf[1] === 0x01 &&
    buf[2] === 0x00 &&
    buf[3] === 0x00
  )) {
    throw new Error("fetched font is not TTF (unexpected magic number)");
  }
  return buf;
}

/**
 * 512px の正方タイルに「紙地 + 明朝の墨 y + 朱のドット」を組む。
 * pointsize / y の位置オフセット / ドットの中心・半径はサイズ用途ごとに調整する
 * （favicon はマークを大きく、apple-touch は余白を取る）。
 * ドットは y のディセンダと混ざらないよう字の右・中ほどに独立配置する（豆粒可読の要）。
 */
function composeMaster(
  fontPath,
  outPath,
  { pointsize, glyphOffset, dotCx, dotCy, dotR },
) {
  execFileSync("convert", [
    "-size",
    "512x512",
    `xc:${PAPER}`,
    "-font",
    fontPath,
    "-fill",
    INK,
    "-gravity",
    "center",
    "-pointsize",
    String(pointsize),
    "-annotate",
    glyphOffset,
    "y",
    "-fill",
    ACCENT,
    "-draw",
    `circle ${dotCx},${dotCy} ${dotCx},${dotCy + dotR}`,
    outPath,
  ]);
}

async function main() {
  const work = mkdtempSync(join(tmpdir(), "brand-icons-"));
  try {
    const fontPath = join(work, "mincho.ttf");
    writeFileSync(fontPath, await fetchMinchoTtf());

    // favicon 用マスター（マークがタイルをよく埋める）。
    // dotR は 16px 実寸でも朱の点が「朱」と読めるサイズに取る（半径 52/512 ≒ 16px で直径 ~3.3px）。
    // これ未満だと最小サイズで店の識別子=朱アクセントが消える（cycle-299 視覚レビュー）。
    // apple と同様、y はディセンダを持つため glyphOffset の y を上へ寄せて光学中央にする
    // （さもないと descender が下端へ沈み上が空く＝下重心。cycle-299 視覚レビュー）。
    const favMaster = join(work, "fav-master.png");
    composeMaster(fontPath, favMaster, {
      pointsize: 455,
      glyphOffset: "-44-40",
      dotCx: 398,
      dotCy: 286,
      dotR: 52,
    });

    // apple-touch 用マスター（安全余白 ~12%・優美に）。
    // y はディセンダを持つため、center gravity のままだと質量が下へ沈む。glyphOffset の y を
    // 大きめの負値（上へ）にして光学中央へ寄せ、ディセンダ下端が下 ~12% 安全域に収まるようにする
    // （cycle-299 視覚レビュー Major＝下重心の是正）。
    const appleMaster = join(work, "apple-master.png");
    composeMaster(fontPath, appleMaster, {
      pointsize: 330,
      glyphOffset: "-30-40",
      dotCx: 316,
      dotCy: 268,
      dotR: 28,
    });

    // favicon.ico（16/32/48 のマルチ解像度）。
    const icoSizes = [16, 32, 48];
    const icoParts = icoSizes.map((s) => {
      const p = join(work, `fav-${s}.png`);
      // -depth 8 -strip で 8bit・メタ無しに保ちファイルを小さく保つ。
      execFileSync("convert", [
        favMaster,
        "-filter",
        "Lanczos",
        "-resize",
        `${s}x${s}`,
        "-depth",
        "8",
        "-strip",
        p,
      ]);
      return p;
    });
    execFileSync("convert", [...icoParts, join(publicDir, "favicon.ico")]);

    // apple-touch-icon.png（180×180・透過なし・8bit・メタ無し）。
    // -alpha off で未使用のアルファチャネルを剥がし、真に不透明（iOS の黒合成対象の透明画素ゼロ）
    // かつ最小バイトにする（cycle-299 レビュー nit）。
    execFileSync("convert", [
      appleMaster,
      "-filter",
      "Lanczos",
      "-resize",
      "180x180",
      "-background",
      PAPER,
      "-flatten",
      "-alpha",
      "off",
      "-depth",
      "8",
      "-strip",
      join(publicDir, "apple-touch-icon.png"),
    ]);

    console.log(
      "wrote public/favicon.ico (16/32/48) and public/apple-touch-icon.png (180)",
    );
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
