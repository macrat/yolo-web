/**
 * DESIGN.md §8「禁止リスト（AI slop 遮断・機械的に検査する）」の機械ゲート。
 *
 * 目的（フェーズ R・C0）: 後続の workflow 一斉変換で多数ページを量産する際、§8 の
 * 「機械検査できる項目」を lint/テストで機械的に弾く。§8 は担保先が二層で、機械検査
 * できない項目（定型構成の再現・イラスト質感・モーションの意図）は視覚レビュー工程が
 * 担保する——本テストはそれを肩代わりしない（下の「視覚レビューへ回す項目」を参照）。
 *
 * 正典: リポジトリルート DESIGN.md（§2 色 / §3 タイポ / §4 レイアウト / §8 禁止リスト / §10 品質バー）。
 *
 * ── 対象（新デザイン面のみ）──────────────────────────────────────────────
 *   新デザイン（紙・墨・朱 / トークン --paper/--ink/--rule/--accent 等）を採用済みの面だけを
 *   検査する。フェーズ R は C0（基層整備）の段階で、実際に新デザインへ変換済みなのは
 *   globals.css の基層タイポ層と、のれん（Header）・店構え（Footer）の chrome だけ
 *   （`grep -l 新トークン` で実測して確認済み）。旧デザイン資産（--bg / --fg / --r- 系 / --shadow- 系 /
 *   青紫 accent を使う 200 超の module.css・old-globals.css・components/common 配下 等）は
 *   C1 で削除予定であり、いま検査対象に入れると誤検知で正当な移行作業を止めるため除外する。
 *
 *   → C1 以降、コンポーネントを新デザインへ変換したら NEW_DESIGN_CSS / NEW_DESIGN_TSX に
 *     その glob を追記していく（このリストの拡張が「新デザイン面の拡大」と同義になる）。
 *
 * ── 機械検査する項目（§8 の番号付き）──────────────────────────────────────
 *   §8-1  紫〜青（indigo/violet）のアクセント: 色関数 oklch/lch/hsl/hwb で hue≈250〜320。
 *          全面グラデーション背景（linear/radial-gradient）は警告レベル（面積判定は視覚レビュー）。
 *   §8-2  グラスモーフィズム（backdrop-filter: blur）= ERROR。色付き box-shadow/グロー = ERROR。
 *          中性色（黒/白/グレー）の box-shadow は §4「操作フィードバックの最小限のみ許容」に当たる
 *          可能性があるため WARNING（人手確認へ）。
 *   §8-5  一律角丸: border-radius が 0 / var(--radius) / var(--radius-sm) / 2px 以外 = ERROR。
 *          ピル形状（9999px/50%/999px 等）もこの網に掛かる。
 *   §8-7  本文書体に Inter/Roboto/Open Sans 等の欧文既定 sans = ERROR。font-family に monospace = ERROR。
 *   §8-6  all-caps（text-transform: uppercase）= WARNING（§8 注記どおり多用の判定は視覚レビュー）。
 *   §10   色の直書き（トークン非経由の hex / rgb() / hsl() / oklch() 等を色プロパティに直書き）= ERROR。
 *          中性のスクリム（rgba(0,0,0,α) / rgba(255,255,255,α) 等のオーバーレイ幕）は慣例的例外として許容。
 *
 *   すべての検査は「標準 CSS プロパティ宣言」に対して行い、`--*` のカスタムプロパティ定義
 *   （＝トークン定義）は検査しない。理由: §10 はトークン経由での色指定を原則とし、パレット自体は
 *   DESIGN.md §2 が正典で数も小さく視覚レビュー管轄。ゲートは「面でトークンをどう使うか」を見張る。
 *   これにより globals.css に併存する旧トークン定義（--admonition-important の紫 hue290 等、C1 で除去予定の
 *   ブログ GFM Alert 用 legacy）を誤検知しない（タスク要件「globals.css のトークン定義自体は除外」と一致）。
 *
 * ── 機械検査「できない」ので視覚レビュー工程へ回す項目（§8 の二層担保の下層）──────────
 *   §8-3  カード上端/左端だけの色付きボーダー（構図依存・判定は目視）。
 *   §8-4  同型アイコンカード3枚組ヒーロー・H1 直上のピル型バッジ・定型順序（構成の再現は目視）。
 *   §8-6  見出し/ナビ/ボタンの絵文字（絵文字は本文にも正当に出現しうるため機械判定困難・目視）。
 *   §8-8  AI 生成イラスト質感・Corporate Memphis・無関係ストック写真・浮遊3D（画像質感は目視）。
 *   §8-9  全要素一律の fade-in・スクロール登場アニメ（意図の有無は目視）。
 *   §8-11 結果の出し惜しみ・偽の限定・煽り LP 記号（文章/導線の意味は §6 と視覚/内容レビュー）。
 *   これらは take-screenshot / frontend-design スキルによる実見レビューが担保する。
 */
import { describe, test, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import fg from "fast-glob";

const PROJECT_ROOT = path.resolve(__dirname, "../..");

// 新デザイン面（対象）。C1 で変換したコンポーネントの glob をここへ追記して面を広げる。
// 注意（fast-glob のメタ文字）: Next.js の Route Group ディレクトリ `(new)` と動的
// セグメント `[param]` は、そのまま書くと fast-glob に「extglob グループ」「文字クラス」
// として解釈され、実ファイルに一致せず 0 件で黙って素通りする（＝ゲートが空振りする）。
// パーレンは `\(new\)` とエスケープし、`[param]` は `*`（単一階層ワイルドカード）で受ける。
// 空振りは下の「空振り検出」テストが各 glob 単位で fail させる。
const NEW_DESIGN_CSS = [
  "src/app/globals.css", // 新トークン定義 + 基層タイポ層（§2/§3/§4）
  "src/app/\\(new\\)/page.module.css", // トップ（店構え・§1/§4 の参照実装・C2 変換）
  "src/components/Header/**/*.module.css", // のれん（§4）
  "src/components/Footer/**/*.module.css", // 店構え（§4）
  "src/components/Shinagaki/**/*.module.css", // 品書き（§4 一覧の既定形）
  "src/components/Nefuda/**/*.module.css", // 値札（§4 メタ小ラベル）
  "src/components/Tsutsumi/**/*.module.css", // 包み（§4/§7 結果カード・和色は中身のみ）
  "src/components/In/**/*.module.css", // 印（§4 厳密仕様・朱一色）
  // 辞典トップ 4 面（フェーズ R・C2/C3 変換済み。検索/閲覧を店構えへ一貫変換）。
  "src/app/\\(new\\)/dictionary/kanji/page.module.css",
  "src/app/\\(new\\)/dictionary/yoji/page.module.css",
  "src/app/\\(new\\)/dictionary/colors/page.module.css",
  "src/app/\\(new\\)/dictionary/humor/page.module.css",
  // 辞典共有の検索器（品書きで検索結果を出す器・§4/§8-4）。
  "src/dictionary/_components/DictionarySearch/**/*.module.css",
  // 辞典共有の品書き（一覧の既定形・検索結果とファセット絞り込みが共有・§4/§8-4）。
  "src/dictionary/_components/DictionaryEntryList/**/*.module.css",
  // 辞典共有のファセット索引（他ファセット値への導線・旧 CategoryNav の店構え版・§4/§8-5）。
  "src/dictionary/_components/FacetIndex/**/*.module.css",
  // 辞典ファセット面（学年/部首/画数/カテゴリ・C 変換済み。[param] は * で受ける）。
  "src/app/\\(new\\)/dictionary/kanji/grade/*/page.module.css",
  "src/app/\\(new\\)/dictionary/kanji/radical/*/page.module.css",
  "src/app/\\(new\\)/dictionary/kanji/stroke/*/page.module.css",
  "src/app/\\(new\\)/dictionary/yoji/category/*/page.module.css",
  "src/app/\\(new\\)/dictionary/colors/category/*/page.module.css",
  // 辞典詳細の共有レイアウト（実務／参照の店構え・§7 実務側・C3 変換済み）。
  "src/dictionary/_components/new/DictionaryDetailLayout.module.css",
  // 辞典詳細 4 種の Detail 表現（漢字/四字熟語/伝統色・C3 変換済み。色見本のデータ由来色は成果物内で可）。
  "src/dictionary/_components/kanji/KanjiDetail.module.css",
  "src/dictionary/_components/yoji/YojiDetail.module.css",
  "src/dictionary/_components/color/ColorDetail.module.css",
  // AI 造語（ユーモア辞典）詳細は自前ページ（共有レイアウト非経由）。[slug] は * で受ける。
  "src/app/\\(new\\)/dictionary/humor/*/page.module.css",
  // 多面共有の店構え部品（フェーズ R 変換済み）。辞典詳細・ブログ・結果面に出る。
  // 共有ボタン群（文字＋罫の線画ボタン・§4 札/§8）。
  "src/components/ShareButtons/**/*.module.css",
  // 関連コンテンツ回遊ブロック（品書き化・§4/§8-3）。
  "src/dictionary/_components/new/PlayRecommendBlock.module.css",
];
const NEW_DESIGN_TSX = [
  "src/app/\\(new\\)/page.tsx", // トップ（店構え・C2 変換）。インライン style の禁止を検査
  "src/components/Header/**/*.tsx",
  "src/components/Footer/**/*.tsx",
  "src/components/Shinagaki/**/*.tsx",
  "src/components/Nefuda/**/*.tsx",
  "src/components/Tsutsumi/**/*.tsx",
  "src/components/In/**/*.tsx",
  // 辞典トップ 4 面（フェーズ R・C2/C3 変換済み）。インライン style の禁止を検査。
  "src/app/\\(new\\)/dictionary/kanji/page.tsx",
  "src/app/\\(new\\)/dictionary/yoji/page.tsx",
  "src/app/\\(new\\)/dictionary/colors/page.tsx",
  "src/app/\\(new\\)/dictionary/humor/page.tsx",
  // 辞典共有の検索器（色見本のインライン style は成果物中身＝変数由来で色直書きなし）。
  "src/dictionary/_components/DictionarySearch/**/*.tsx",
  // 辞典共有の品書き（色見本のインライン style は成果物中身＝変数由来で色直書きなし）。
  "src/dictionary/_components/DictionaryEntryList/**/*.tsx",
  // 辞典共有のファセット索引（旧 CategoryNav の店構え版）。
  "src/dictionary/_components/FacetIndex/**/*.tsx",
  // 辞典ファセット面（学年/部首/画数/カテゴリ・C 変換済み）。インライン style の禁止を検査。
  "src/app/\\(new\\)/dictionary/kanji/grade/*/page.tsx",
  "src/app/\\(new\\)/dictionary/kanji/radical/*/page.tsx",
  "src/app/\\(new\\)/dictionary/kanji/stroke/*/page.tsx",
  "src/app/\\(new\\)/dictionary/yoji/category/*/page.tsx",
  "src/app/\\(new\\)/dictionary/colors/category/*/page.tsx",
  // 辞典詳細の共有レイアウト＋4 種の Detail 表現（C3 変換済み）。インライン style の禁止を検査。
  // ColorDetail の色見本インライン style は成果物中身＝変数由来（color.hex）で色直書きなし。
  "src/dictionary/_components/new/DictionaryDetailLayout.tsx",
  "src/dictionary/_components/kanji/KanjiDetail.tsx",
  "src/dictionary/_components/yoji/YojiDetail.tsx",
  "src/dictionary/_components/color/ColorDetail.tsx",
  // 辞典詳細 4 route の page.tsx（漢字/四字熟語/伝統色は共有レイアウトへの配線・ユーモアは自前）。
  "src/app/\\(new\\)/dictionary/kanji/*/page.tsx",
  "src/app/\\(new\\)/dictionary/yoji/*/page.tsx",
  "src/app/\\(new\\)/dictionary/colors/*/page.tsx",
  "src/app/\\(new\\)/dictionary/humor/*/page.tsx",
  // 多面共有の店構え部品（フェーズ R 変換済み）。インライン style の禁止を検査。
  "src/components/ShareButtons/**/*.tsx",
  "src/dictionary/_components/new/PlayRecommendBlock.tsx",
];
// テストコードは走査対象外（テスト文字列に禁止語が入るため）。
const IGNORE = ["**/__tests__/**", "**/*.test.ts", "**/*.test.tsx"];

/**
 * 旧資産の明示的許容（C1 で除去予定の legacy carryover・新デザイン面ではない）。
 * globals.css の .markdown-alert は old-globals.css からの移植（ブログ GFM Alert）で、
 * border-radius: 0 4px 4px 0 は §8-5 に触れるが legacy として C1 で新デザインへ再設計する。
 */
const ALLOWLIST: { fileEndsWith: string; declaration: string }[] = [
  {
    fileEndsWith: "src/app/globals.css",
    declaration: "border-radius: 0 4px 4px 0",
  },
];

type Severity = "ERROR" | "WARN";
interface Violation {
  file: string;
  severity: Severity;
  code: string; // §8-x / §10 など
  message: string;
  declaration: string;
}

// ── CSS 値ユーティリティ ─────────────────────────────────────────────────

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** ルールブロック本体（最内 {…}）から `prop: value` を抽出。セレクタは対象外。 */
function extractDeclarations(css: string): { prop: string; value: string }[] {
  const decls: { prop: string; value: string }[] = [];
  const noComments = stripComments(css);
  const blockRe = /\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(noComments)) !== null) {
    for (const part of m[1].split(";")) {
      const idx = part.indexOf(":");
      if (idx === -1) continue;
      const prop = part.slice(0, idx).trim().toLowerCase();
      const value = part.slice(idx + 1).trim();
      if (!prop || !value) continue;
      decls.push({ prop, value });
    }
  }
  return decls;
}

const COLOR_PROPS = new Set([
  "color",
  "background",
  "background-color",
  "background-image",
  "border",
  "border-color",
  "border-top",
  "border-bottom",
  "border-left",
  "border-right",
  "border-top-color",
  "border-bottom-color",
  "border-left-color",
  "border-right-color",
  "outline",
  "outline-color",
  "box-shadow",
  "text-shadow",
  "fill",
  "stroke",
  "text-decoration",
  "text-decoration-color",
  "caret-color",
  "column-rule",
  "column-rule-color",
  "-webkit-text-fill-color",
]);

/** 値に含まれる色リテラル（hex / 色関数）を列挙。var() トークンは含めない。 */
function colorLiterals(value: string): string[] {
  const out: string[] = [];
  for (const mm of value.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) out.push(mm[0]);
  for (const mm of value.matchAll(
    /\b(?:rgba?|hsla?|oklch|oklab|lch|lab|hwb)\s*\([^)]*\)/gi,
  )) {
    out.push(mm[0]);
  }
  return out;
}

/** 中性色（黒/白/グレー = 色相を持たない）か。スクリム/中性影の許容判定に使う。 */
function isNeutralColor(lit: string): boolean {
  const l = lit.toLowerCase().trim();
  if (l.startsWith("#")) {
    let hex = l.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return r === g && g === b;
  }
  const nums = (l.match(/[\d.]+/g) || []).map(Number);
  if (l.startsWith("rgb"))
    return nums.length >= 3 && nums[0] === nums[1] && nums[1] === nums[2];
  if (l.startsWith("hsl")) return nums.length >= 2 && nums[1] === 0; // saturation 0
  if (l.startsWith("oklch") || l.startsWith("lch"))
    return nums.length >= 2 && nums[1] === 0; // chroma 0
  return false;
}

/** 色関数の色相（deg）。hex/rgb/oklab には極座標 hue が無いため null。 */
function hueOf(lit: string): number | null {
  const l = lit.toLowerCase();
  const nums = (l.match(/-?[\d.]+/g) || []).map(Number);
  if (l.startsWith("oklch") || l.startsWith("lch"))
    return nums.length >= 3 ? nums[2] : null;
  if (l.startsWith("hsl") || l.startsWith("hwb"))
    return nums.length >= 1 ? nums[0] : null;
  return null;
}

const isPurpleHue = (h: number | null): boolean =>
  h !== null && h >= 250 && h <= 320;

// border-radius で許容する値（§4/§8-5）: 0 / var(--radius) / var(--radius-sm) / 2px。
const ALLOWED_RADIUS_ATOMS = new Set([
  "0",
  "0px",
  "2px",
  "var(--radius)",
  "var(--radius-sm)",
  "inherit",
  "initial",
  "unset",
]);

// §8-7: 本文書体に不可の欧文既定 sans。
const BANNED_FONT_RE =
  /\b(inter|roboto|open\s*sans|lato|montserrat|poppins|nunito|source\s*sans)\b/i;

// ── CSS 解析 ─────────────────────────────────────────────────────────────

function analyzeCss(content: string, file: string): Violation[] {
  const v: Violation[] = [];
  const push = (
    severity: Severity,
    code: string,
    message: string,
    prop: string,
    value: string,
  ) =>
    v.push({ file, severity, code, message, declaration: `${prop}: ${value}` });

  for (const { prop, value } of extractDeclarations(content)) {
    // トークン定義（--*）は検査しない（§10 の指標はトークン「利用」側）。
    if (prop.startsWith("--")) continue;

    const isRadius =
      prop === "border-radius" || /^border-[a-z]+-radius$/.test(prop);
    const isFont = prop === "font-family";
    const isBackdrop =
      prop === "backdrop-filter" || prop === "-webkit-backdrop-filter";

    // §8-2 グラスモーフィズム
    if (isBackdrop && /\bblur\s*\(/i.test(value)) {
      push(
        "ERROR",
        "§8-2",
        "backdrop-filter: blur（グラスモーフィズム）は禁止",
        prop,
        value,
      );
    }

    // §8-6 all-caps（警告）
    if (prop === "text-transform" && /\buppercase\b/i.test(value)) {
      push(
        "WARN",
        "§8-6",
        "text-transform: uppercase（all-caps 多用は §8-6・視覚レビューで最終判断）",
        prop,
        value,
      );
    }

    // §8-5 角丸
    if (isRadius) {
      const atoms = value
        .replace(/\s*\/\s*/g, " ")
        .replace(/\(\s+/g, "(")
        .replace(/\s+\)/g, ")")
        .split(/\s+/)
        .filter(Boolean)
        .map((a) => a.toLowerCase());
      const bad = atoms.filter((a) => !ALLOWED_RADIUS_ATOMS.has(a));
      if (bad.length > 0) {
        push(
          "ERROR",
          "§8-5",
          `border-radius は 0 / var(--radius) / var(--radius-sm) / 2px のみ許容（検出: ${bad.join(" ")}）`,
          prop,
          value,
        );
      }
    }

    // §8-7 フォント
    if (isFont) {
      if (BANNED_FONT_RE.test(value)) {
        push(
          "ERROR",
          "§8-7",
          "本文書体に欧文既定 sans（Inter/Roboto/Open Sans 等）は禁止",
          prop,
          value,
        );
      }
      if (/\bmonospace\b/i.test(value)) {
        push(
          "ERROR",
          "§8-7",
          "本文の font-family に monospace は禁止（コードは var(--font-mono) 経由）",
          prop,
          value,
        );
      }
    }

    if (!COLOR_PROPS.has(prop)) continue;

    // §8-1 全面グラデーション背景（警告・面積は視覚レビュー）
    if (
      (prop === "background" || prop === "background-image") &&
      /\b(linear|radial|conic)-gradient\s*\(/i.test(value)
    ) {
      push(
        "WARN",
        "§8-1",
        "gradient 背景を検出（全面グラデーションは §8-1 禁止・面積は視覚レビューで判断）",
        prop,
        value,
      );
    }

    const literals = colorLiterals(value);
    if (prop === "box-shadow" || prop === "text-shadow") {
      if (value.toLowerCase() === "none") continue;
      const colored = literals.filter((lit) => !isNeutralColor(lit));
      if (colored.length > 0) {
        // §8-2 色付き影・グロー
        push(
          "ERROR",
          "§8-2",
          `色付き ${prop}（グロー/色影）は禁止（検出: ${colored.join(", ")}）`,
          prop,
          value,
        );
      } else {
        // 中性影 or var() 参照 → §4「操作フィードバックの最小限のみ許容」の可能性・人手確認
        push(
          "WARN",
          "§8-2",
          `${prop} を検出。§4「影は原則なし」——最小限の操作フィードバックか視覚レビューで確認`,
          prop,
          value,
        );
      }
      continue;
    }

    // §8-1 紫〜青の色関数（hue 250〜320）
    for (const lit of literals) {
      if (isPurpleHue(hueOf(lit))) {
        push(
          "ERROR",
          "§8-1",
          `紫〜青（indigo/violet）のアクセントを検出（${lit}）`,
          prop,
          value,
        );
      }
    }

    // §10 色の直書き（トークン非経由）。中性スクリムは慣例的例外として許容。
    const rawNonNeutral = literals.filter((lit) => !isNeutralColor(lit));
    if (rawNonNeutral.length > 0) {
      push(
        "ERROR",
        "§10",
        `色の直書きを検出（トークン経由が原則: ${rawNonNeutral.join(", ")}）`,
        prop,
        value,
      );
    }
  }
  return v;
}

// ── TSX 解析（インライン style オブジェクトのみ・新デザイン面の chrome 用）────────────

function analyzeTsx(content: string, file: string): Violation[] {
  const v: Violation[] = [];
  const noComments = content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
  for (const mm of noComments.matchAll(/style=\{\{([^{}]*)\}\}/g)) {
    const block = mm[1];
    const push = (severity: Severity, code: string, message: string) =>
      v.push({
        file,
        severity,
        code,
        message,
        declaration: `style={{${block.trim()}}}`,
      });

    if (/backdropFilter\s*:\s*[^,}]*blur\s*\(/i.test(block)) {
      push(
        "ERROR",
        "§8-2",
        "インライン style の backdropFilter: blur（グラスモーフィズム）は禁止",
      );
    }
    if (BANNED_FONT_RE.test(block) && /fontFamily/i.test(block)) {
      push(
        "ERROR",
        "§8-7",
        "インライン style の fontFamily に欧文既定 sans は禁止",
      );
    }
    const brMatch = block.match(/borderRadius\s*:\s*["'`]([^"'`]+)["'`]/);
    if (brMatch) {
      const atoms = brMatch[1]
        .split(/\s+/)
        .filter(Boolean)
        .map((a) => a.toLowerCase());
      const bad = atoms.filter((a) => !ALLOWED_RADIUS_ATOMS.has(a));
      if (bad.length > 0)
        push(
          "ERROR",
          "§8-5",
          `インライン style の borderRadius が不許容（${bad.join(" ")}）`,
        );
    }
    for (const lit of colorLiterals(block)) {
      if (isNeutralColor(lit)) continue;
      if (isPurpleHue(hueOf(lit)))
        push("ERROR", "§8-1", `インライン style に紫〜青の色（${lit}）`);
      push("ERROR", "§10", `インライン style の色直書き（${lit}）`);
    }
  }
  return v;
}

// ── 実行ヘルパ ───────────────────────────────────────────────────────────

function isAllowlisted(vio: Violation): boolean {
  const norm = (s: string) => s.replace(/\s+/g, " ").trim();
  return ALLOWLIST.some(
    (a) =>
      vio.file.replace(/\\/g, "/").endsWith(a.fileEndsWith) &&
      norm(vio.declaration) === norm(a.declaration),
  );
}

function scan(
  globs: string[],
  analyze: (c: string, f: string) => Violation[],
): Violation[] {
  const files = fg.sync(globs, {
    cwd: PROJECT_ROOT,
    ignore: IGNORE,
    absolute: true,
  });
  const all: Violation[] = [];
  for (const abs of files) {
    const rel = path.relative(PROJECT_ROOT, abs).replace(/\\/g, "/");
    for (const vio of analyze(fs.readFileSync(abs, "utf-8"), rel)) {
      if (!isAllowlisted(vio)) all.push(vio);
    }
  }
  return all;
}

const fmt = (vs: Violation[]) =>
  vs
    .map(
      (x) => `  [${x.code}] ${x.file} — ${x.message}\n      ${x.declaration}`,
    )
    .join("\n");

// ── テスト ───────────────────────────────────────────────────────────────

describe("DESIGN.md §8 機械ゲート（新デザイン面）", () => {
  const cssViolations = scan(NEW_DESIGN_CSS, analyzeCss);
  const tsxViolations = scan(NEW_DESIGN_TSX, analyzeTsx);

  test("対象 CSS がゲート対象に含まれていること（設定の空振り検出）", () => {
    const files = fg.sync(NEW_DESIGN_CSS, {
      cwd: PROJECT_ROOT,
      ignore: IGNORE,
    });
    expect(files.length).toBeGreaterThan(0);
    expect(files).toContain("src/app/globals.css");
  });

  // 各 glob が最低 1 ファイルに一致することを個別に検査する。fast-glob は `(new)`/`[param]` を
  // メタ文字と誤解釈して 0 件で黙って素通りしやすい（過去、辞典トップ4面の glob が全て空振り
  // していた）。集合全体の length>0 では個々の空振りを検出できないため、glob 単位で担保する。
  test("各 glob が実ファイルに一致すること（空振り glob の検出）", () => {
    const empty = [...NEW_DESIGN_CSS, ...NEW_DESIGN_TSX].filter(
      (g) => fg.sync(g, { cwd: PROJECT_ROOT, ignore: IGNORE }).length === 0,
    );
    expect(
      empty,
      `\n以下の glob が 0 件（記述ミス/メタ文字の誤解釈で素通り）:\n  ${empty.join("\n  ")}\n`,
    ).toEqual([]);
  });

  test("新デザイン面の CSS に §8 違反（ERROR）が無いこと", () => {
    const errors = cssViolations.filter((x) => x.severity === "ERROR");
    const warns = cssViolations.filter((x) => x.severity === "WARN");
    if (warns.length > 0) {
      // 警告は fail させない（§4 最小影・§8-1 gradient 面積・§8-6 all-caps は視覚レビューで最終判断）。
      console.warn(
        `\n[design-gate] CSS 警告 ${warns.length} 件（視覚レビューへ）:\n${fmt(warns)}`,
      );
    }
    expect(
      errors,
      `\n新デザイン面の CSS に §8 違反:\n${fmt(errors)}\n`,
    ).toEqual([]);
  });

  test("新デザイン面の TSX（インライン style）に §8 違反（ERROR）が無いこと", () => {
    const errors = tsxViolations.filter((x) => x.severity === "ERROR");
    expect(
      errors,
      `\n新デザイン面の TSX に §8 違反:\n${fmt(errors)}\n`,
    ).toEqual([]);
  });
});

/**
 * ゲート自身の検出力の回帰テスト（合成入力）。実ファイルを汚さずに「わざと違反を混ぜたら
 * 検出できる」ことを恒久的に担保する（タスク要件の自己検証）。
 */
describe("§8 機械ゲートの検出力（合成入力）", () => {
  test("§8-1 紫の色関数を検出", () => {
    const vs = analyzeCss(`.x { color: oklch(0.6 0.2 270); }`, "synthetic.css");
    expect(vs.some((x) => x.code === "§8-1")).toBe(true);
  });
  test("§8-2 グラスモーフィズムを検出", () => {
    const vs = analyzeCss(
      `.x { backdrop-filter: blur(8px); }`,
      "synthetic.css",
    );
    expect(vs.some((x) => x.code === "§8-2")).toBe(true);
  });
  test("§8-2 色付き box-shadow を検出", () => {
    const vs = analyzeCss(
      `.x { box-shadow: 0 0 20px oklch(0.6 0.2 270); }`,
      "synthetic.css",
    );
    expect(vs.some((x) => x.code === "§8-2" && x.severity === "ERROR")).toBe(
      true,
    );
  });
  test("§8-5 ピル形状 border-radius を検出", () => {
    const vs = analyzeCss(`.x { border-radius: 9999px; }`, "synthetic.css");
    expect(vs.some((x) => x.code === "§8-5")).toBe(true);
  });
  test("§8-7 本文書体 Inter を検出", () => {
    const vs = analyzeCss(
      `.x { font-family: Inter, sans-serif; }`,
      "synthetic.css",
    );
    expect(vs.some((x) => x.code === "§8-7")).toBe(true);
  });
  test("§10 色の直書き（hex）を検出", () => {
    const vs = analyzeCss(`.x { color: #3366ff; }`, "synthetic.css");
    expect(vs.some((x) => x.code === "§10")).toBe(true);
  });
  test("中性スクリム rgba(0,0,0,α) は許容（誤検知しない）", () => {
    const vs = analyzeCss(
      `.x { background: rgba(0, 0, 0, 0.4); }`,
      "synthetic.css",
    );
    expect(vs.filter((x) => x.severity === "ERROR")).toEqual([]);
  });
  test("トークン経由（var）とトークン定義は違反にならない", () => {
    const vs = analyzeCss(
      `:root { --accent: oklch(0.62 0.22 264); } .x { color: var(--accent); border-radius: var(--radius); }`,
      "synthetic.css",
    );
    expect(vs.filter((x) => x.severity === "ERROR")).toEqual([]);
  });
  test("TSX インライン style の禁止フォントを検出", () => {
    const vs = analyzeTsx(
      `<div style={{ fontFamily: "Inter, sans-serif" }} />`,
      "synthetic.tsx",
    );
    expect(vs.some((x) => x.code === "§8-7")).toBe(true);
  });
});
