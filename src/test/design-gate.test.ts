/**
 * DESIGN.md の機械ゲート。
 *
 * DESIGN.md は担保先を二層に分けている——機械検査できる規則（禁止色・角丸・書体・約物・
 * 呼び名）はここで弾き、機械検査できない規則（定型構成の再現・イラスト質感・モーションの
 * 意図）は視覚レビュー工程が担保する。本テストは後者を肩代わりしない。
 *
 * 出どころ: リポジトリルート DESIGN.md（§2 色 / §3 タイポ / §4 レイアウト / §6 言葉 /
 * §8 禁止リスト / §10 品質バー）。規範に無い規則をここで強制しない。
 *
 * ── 走査した数を数える ────────────────────────────────────────────────
 *   違反 0 件には「本当に無い」と「一件も見ていない」の二通りがあり、後者はゲートが在るのに
 *   何も守っていない状態である。glob の書き間違い・タグの正規表現の綻び・面の移動のどれでも
 *   起こる。だからどのゲートも、違反が空であることと**実際に走査した対象の数**の両方を主張する。
 *   下限は現状の実測値より低く、0 や桁違いの取りこぼしを捕まえられる高さに置く。
 *
 * ── 対象（src 全体・広域 glob）──────────────────────────────────────────
 *   cycle-279 C1 で (legacy)/ 一式・old-globals.css・旧デザイントークン定義
 *   （--bg / --fg / --r- 系 / --shadow- 系 / status 系 / --admonition-* 等）を完全削除し、
 *   src/ 全体が新トークン体系のみになった。フェーズR 最終レビュー是正（cycle-279 MUST-5）で、
 *   個別列挙方式（新規ページ追加時に列挙漏れが起きると検査対象から漏れる）から
 *   `src/**\/*.module.css` / `src/**\/*.{tsx,js}` の広域 glob へ切り替えた——src/ に live な
 *   デザイン面が新規追加されても自動的に検査対象へ入る。除外は IGNORE のテスト・
 *   ALLOWLIST の意図的な例外（スピナーの回転リング・成果物の和色等・理由付き）のみに限定する。
 *   拡張子で面を切らない——`src/app/global-not-found.js` は Next.js が拡張子を固定する 404 の
 *   器で、JSX を書く面である。
 *
 *   OGP 画像生成（`opengraph-image.tsx`/`twitter-image.tsx`/`src/lib/ogp-image.tsx`）は
 *   cycle-282 で新デザイン（店構え）化し共通レンダラの型から accentColor/icon を撤去したのに
 *   合わせ、IGNORE からの除外を解除して検査対象へ戻した（フェーズR移行漏れの構造的死角を塞ぐ）。
 *   これらの面の style オブジェクトはテンプレートリテラルで寸法を組み立てるので、ブロックの
 *   切り出しはブレースの深さを数えて行う——`}` を含まない区間として切ると、式を持つブロックが
 *   丸ごと未検査のまま通る。
 *
 *   素の CSS/HTML をテンプレート文字列に持つ面（`src/middleware.ts` の 410 ページ）は
 *   analyzeCss/analyzeTsx が効かないので、analyzeEmbeddedDesign が生テキストを検査する。
 *   色は SSoT（@/lib/utsuwaHex）から差し込むため、この面に残る色リテラルは直書きである。
 *
 * ── 機械検査する項目 ──────────────────────────────────────────────────
 *   §2    是正ゲート: `--accent-weak` は DESIGN.md §2「操作・選択状態のハイライト
 *          （hover/selected の座布団）にのみ可。区画の地には不可」。`--wairo-*` は §2
 *          「成果物の内部に限る」——どちらも静的な区画の地には当たらない。background/background-color にこれらが使われている
 *          宣言のうち、そのルールのセレクタが「状態セレクタ」（下の STATE_SELECTOR_RE 参照:
 *          :hover/:focus/:active/:checked・[aria-current] 等・Current/Selected/Active/Correct
 *          命名）を一切含まない場合は、静的な区画/箱の地への誤用の疑いとして ERROR にする。
 *   §3    見出しの階層（1.25 倍スケール）・約物（`palt`/`halt` を掛けない・三点リーダ・
 *          和文の括弧）・入力欄の下限 16px。
 *   §6    来訪者に届く言葉から内部の設計語彙を締め出す。行き先のラベルは着いた先の名前と揃える。
 *   §8-1  紫〜青（indigo/violet）のアクセント: 色関数 oklch/lch/hsl/hwb で hue≈250〜320。
 *          全面グラデーション背景（linear/radial-gradient）は警告レベル（面積判定は視覚レビュー）。
 *   §8-2  グラスモーフィズム（backdrop-filter: blur）= ERROR。色付きの box-shadow/text-shadow と
 *          `filter: drop-shadow()` のグロー = ERROR。中性色（黒/白/グレー）やトークン参照の影は
 *          §4「操作フィードバックの最小限のみ許容」に当たる可能性があるため WARNING（人手確認へ）。
 *   §8-5  一律角丸: border-radius が 0 / var(--radius) / var(--radius-sm) / 2px 以外 = ERROR。
 *          ピル形状（9999px/50%/999px 等）もこの網に掛かる。
 *   §8-6  all-caps（text-transform: uppercase）= WARNING（§8 注記どおり多用の判定は視覚レビュー）。
 *   §8-7  本文書体に Inter/Roboto/Open Sans 等の欧文既定 sans = ERROR。font-family に monospace = ERROR。
 *   §10   色の直書き（トークン非経由の hex / rgb() / hsl() / oklch() 等を色プロパティに直書き）= ERROR。
 *          中性のスクリム（rgba(0,0,0,α) / rgba(255,255,255,α) 等のオーバーレイ幕）は慣例的例外として許容。
 *
 *   すべての検査は「標準 CSS プロパティ宣言」に対して行い、`--*` のカスタムプロパティ定義
 *   （＝トークン定義）は検査しない。理由: §10 はトークン経由での色指定を原則とし、パレット自体は
 *   DESIGN.md §2 が出どころで数も小さく視覚レビュー管轄。ゲートは「面でトークンをどう使うか」を見張る。
 *
 * ── 機械検査「できない」ので視覚レビュー工程へ回す項目（§8 の二層担保の下層）──────────
 *   §8-3  カード上端/左端だけの色付きボーダー（構図依存・判定は目視）。
 *   §8-4  同型アイコンカード3枚組ヒーロー・H1 直上のピル型バッジ・定型順序（構成の再現は目視）。
 *   §8-6  見出し/ナビ/ボタンの絵文字（絵文字は本文にも正当に出現しうるため機械判定困難・目視）。
 *          例外は 410 の埋め込み面で、面が小さく全文が見出し/ナビ/本文なので機械で弾ける。
 *   §8-8  AI 生成イラスト質感・Corporate Memphis・無関係ストック写真・浮遊3D（画像質感は目視）。
 *   §8-9  全要素一律の fade-in・スクロール登場アニメ（意図の有無は目視）。
 *   §8-11 結果の出し惜しみ・偽の限定・煽り LP 記号（文章/導線の意味は §6 と視覚/内容レビュー）。
 *   これらは take-screenshot / frontend-design スキルによる実見レビューが担保する。
 *
 * ── バイナリ資産（CSS/HTML を持たず機械検査「できない」・視覚レビューで担保）──────────
 *   favicon / apple-touch-icon / OGP 画像の png 等のバイナリ画像は宣言テキストを持たず、この
 *   ゲートでは検査できない。店構え（紙地・墨・朱の印）と揃っているかは take-screenshot 等の
 *   視覚レビューで確認する。
 *   （B-576 済み・cycle-306）`public/favicon.ico`・`public/icon.svg`・`public/apple-touch-icon.png`
 *   はブランド標章 F2「朱の印・白抜き y」（紙地＋朱の角丸印＋白抜き明朝 y）へ刷新。資産は
 *   `scripts/generate-favicons.ts` で SSoT 色（utsuwaHex）から再現生成する。
 */
import { describe, test, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import fg from "fast-glob";
import { toolsBySlug } from "@/tools/registry";
import { playContentBySlug } from "@/play/registry";

const PROJECT_ROOT = path.resolve(__dirname, "../..");

// 新デザイン面（対象）。C1 で変換したコンポーネントの glob をここへ追記して面を広げる。
// 注意（fast-glob のメタ文字）: literal パスに fast-glob のメタ文字を含む名前をそのまま
// glob へ書くと、意図した実パスに一致せず 0 件で黙って素通りする（＝ゲートが空振り）。
// 実害を起こしたのは旧 Route Group `(new)`/`(legacy)` のパーレン——fast-glob（picomatch）は
// エスケープしない丸括弧を生成正規表現のグループとしてそのまま通すため、`(new)` は中身の
// `new`（括弧なし）に一致する正規表現になり、実ディレクトリ名 `(new)`（括弧込み）に一致せず
// 0 件になった（extglob ではない・`{extglob:false}` でも同一正規表現）。`\(new\)` のエスケープが
// 必要だった（フェーズ R・C1 で src/app/ 直下へ平坦化し、この問題自体が消滅）。動的セグメント
// `[param]` のブラケットは、この fast-glob バージョンでは literal の `[param]` ディレクトリに
// 一致し空振りの実害は無かったが、一般には文字クラスと解釈されうるメタ文字なので `*` で受ける。
// 空振りは下の「空振り検出」テストが各 glob 単位で fail させる。
const NEW_DESIGN_CSS = [
  // src 全体の live な *.module.css を広域 glob で網羅する（cycle-279 MUST-5）。
  // 新規ページ追加時の列挙漏れを構造的に防ぐ——除外は IGNORE（テスト）のみ。
  "src/**/*.module.css",
  // トークン定義本体（*.module.css ではないため上の glob に一致しない・明示的に追加）。
  "src/app/globals.css",
];
const NEW_DESIGN_TSX = [
  // src 全体の live な JSX を広域 glob で網羅する（cycle-279 MUST-5）。
  // 新規ページ追加時の列挙漏れを構造的に防ぐ——除外は IGNORE（テスト）のみ。
  // OGP 生成物（opengraph-image/twitter-image/ogp-image）も cycle-282 で対象へ含めた。
  // `.js` を含めるのは `src/app/global-not-found.js`（Next.js が拡張子を固定する 404 の器）が
  // JSX を書く面だからで、拡張子で網から外すと inline style がどこにも検査されない。
  "src/**/*.{tsx,js}",
];
// 走査対象外はテストコードだけ（テスト文字列に禁止語が入るため）。OGP 生成物を除外しない
// 理由はヘッダの「対象」節を参照。
const IGNORE = ["**/__tests__/**", "**/*.test.ts", "**/*.test.tsx"];

// 素の CSS/HTML をテンプレート文字列に持つ稼働デザイン面。CSS ファイルにも JSX にも載らない
// ——middleware は Edge 実行で globals.css を読み込めないため、410 Gone ページの意匠を文字列
// として組み立てる。色は @/lib/utsuwaHex から差し込むので、生テキストに残る色は直書きである。
const EMBEDDED_DESIGN_FILES = ["src/middleware.ts"];

/**
 * 旧資産の明示的許容（新デザイン面の物理的メタファーによる例外）。
 * globals.css の .markdown-alert は cycle-279 C1 で新トークン（--rule/--paper-2/--accent）へ
 * 再設計済み（border-radius も var(--radius) の 0px に統一したため、旧 legacy 許容は不要）。
 */
const ALLOWLIST: { fileEndsWith: string; declaration: string }[] = [
  // 唯一の円形例外＝ローディングスピナーの回転リング。DESIGN.md §4「角丸 0px 基調」は
  // 「回転で読み込み中を示すインジケータ」を想定していない——リングは円形でなければ回転が
  // 視認できず機能を果たさない。装飾目的の一律角丸（§8-5）ではなく機能上不可避な形状として、
  // この2ファイルのスピナーのみ個別許容する。トグル・スライダーのつまみ・進捗ドット等の
  // 操作系は cycle-279 ですべて var(--radius)/var(--radius-sm) へ変換済みで、ここには含めない
  // （「操作メタファーの円形」という自己正当化での横抜けを一切残さない）。
  {
    fileEndsWith:
      "src/play/games/kanji-kanaru/_components/GameContainer.module.css",
    declaration: "border-radius: 50%",
  },
  {
    fileEndsWith:
      "src/play/games/yoji-kimeru/_components/styles/GameContainer.module.css",
    declaration: "border-radius: 50%",
  },
  // §2 是正ゲートの追加許容: --wairo-* はゲームの駒/結果など「成果物」の中身の色として
  // DESIGN.md §2「成果物パレット（中身の色・唯一の例外）」が明示的に認めている。
  // STATE_SELECTOR_RE は「hover/selected の座布団」用の許容のみを機械判定するため、
  // 状態セレクタ名を持たない成果物カラーの静的宣言はここで個別に許容する
  // （器＝ページ UI の静的背景には和色を使わない・§2 の原則自体は変えない）。
  {
    fileEndsWith:
      "src/play/games/kanji-kanaru/_components/styles/KanjiKanaru.module.css",
    declaration: ".cellClose { background-color: var(--wairo-yamabuki); }",
  },
  {
    fileEndsWith:
      "src/play/games/kanji-kanaru/_components/styles/KanjiKanaru.module.css",
    declaration:
      ".distributionBarHighlight { background-color: var(--wairo-tokiwa); }",
  },
  {
    fileEndsWith:
      "src/play/games/kanji-kanaru/_components/styles/KanjiKanaru.module.css",
    declaration:
      ".legendChipClose { background-color: var(--wairo-yamabuki); }",
  },
  {
    fileEndsWith:
      "src/play/games/nakamawake/_components/SolvedGroups.module.css",
    declaration: ".yellow { background: var(--wairo-yamabuki); }",
  },
  {
    fileEndsWith:
      "src/play/games/nakamawake/_components/SolvedGroups.module.css",
    declaration: ".green { background: var(--wairo-moegi); }",
  },
  {
    fileEndsWith:
      "src/play/games/nakamawake/_components/SolvedGroups.module.css",
    declaration: ".blue { background: var(--wairo-ai); }",
  },
  {
    fileEndsWith:
      "src/play/games/nakamawake/_components/SolvedGroups.module.css",
    declaration: ".purple { background: var(--wairo-fuji); }",
  },
  {
    fileEndsWith:
      "src/play/games/nakamawake/_components/ResultModal.module.css",
    declaration: ".yellow { background: var(--wairo-yamabuki); }",
  },
  {
    fileEndsWith:
      "src/play/games/nakamawake/_components/ResultModal.module.css",
    declaration: ".green { background: var(--wairo-moegi); }",
  },
  {
    fileEndsWith:
      "src/play/games/nakamawake/_components/ResultModal.module.css",
    declaration: ".blue { background: var(--wairo-ai); }",
  },
  {
    fileEndsWith:
      "src/play/games/nakamawake/_components/ResultModal.module.css",
    declaration: ".purple { background: var(--wairo-fuji); }",
  },
  {
    fileEndsWith:
      "src/play/games/nakamawake/_components/HowToPlayModal.module.css",
    declaration: ".swatchYellow { background: var(--wairo-yamabuki); }",
  },
  {
    fileEndsWith:
      "src/play/games/nakamawake/_components/HowToPlayModal.module.css",
    declaration: ".swatchGreen { background: var(--wairo-moegi); }",
  },
  {
    fileEndsWith:
      "src/play/games/nakamawake/_components/HowToPlayModal.module.css",
    declaration: ".swatchBlue { background: var(--wairo-ai); }",
  },
  {
    fileEndsWith:
      "src/play/games/nakamawake/_components/HowToPlayModal.module.css",
    declaration: ".swatchPurple { background: var(--wairo-fuji); }",
  },
  {
    fileEndsWith: "src/play/games/nakamawake/_components/StatsModal.module.css",
    declaration:
      ".distributionBarHighlight { background-color: var(--wairo-tokiwa); }",
  },
  // yoji-kimeru の判定フィードバック色（成果物＝ゲームの駒の中身）。cellCorrect/
  // legendChipCorrect は selector 名に "Correct" を含み STATE_SELECTOR_RE で
  // 自動許容されるが、cellPresent/legendChipPresent は "Present" のため個別許容する
  // （kanji-kanaru の cellClose/legendChipClose と同じ理由）。
  {
    fileEndsWith:
      "src/play/games/yoji-kimeru/_components/styles/YojiKimeru.module.css",
    declaration: ".cellPresent { background-color: var(--wairo-yamabuki); }",
  },
  {
    fileEndsWith:
      "src/play/games/yoji-kimeru/_components/styles/YojiKimeru.module.css",
    declaration:
      ".legendChipPresent { background-color: var(--wairo-yamabuki); }",
  },
  {
    fileEndsWith:
      "src/play/games/yoji-kimeru/_components/styles/YojiKimeru.module.css",
    declaration:
      ".distributionBarHighlight { background-color: var(--wairo-tokiwa); }",
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

/**
 * TypeScript/JSX のコメント（ブロック・行）を落とす。JSDoc は `<textarea>` や `style={{…}}` を
 * 例として書くので、外さないと説明文が実装として数えられる。
 */
function stripCodeComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
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
  "filter",
  "-webkit-filter",
  "fill",
  "stroke",
  "text-decoration",
  "text-decoration-color",
  "caret-color",
  "accent-color",
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

/**
 * ルール単位で { selector, prop, value } を抽出する（宣言が属するセレクタ文脈も保持する）。
 * extractDeclarations と同じ「最内 {…} ブロックのみ拾う」正規表現方式を流用する。
 * @media 等のラッパーは自然に読み飛ばされる——外側ブロックは内側にも `{` を含むため、
 * `([^{}]*)\{([^{}]*)\}` の単発マッチは外側単独では成立せず、内側の `.foo { … }` だけが
 * 正しく selector="​.foo" として抽出される（バックトラックにより外側の前置文字列は捨てられる）。
 */
function extractDeclarationsWithSelector(
  css: string,
): { selector: string; prop: string; value: string }[] {
  const out: { selector: string; prop: string; value: string }[] = [];
  const noComments = stripComments(css);
  const ruleRe = /([^{}]*)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = ruleRe.exec(noComments)) !== null) {
    const selector = m[1].trim();
    for (const part of m[2].split(";")) {
      const idx = part.indexOf(":");
      if (idx === -1) continue;
      const prop = part.slice(0, idx).trim().toLowerCase();
      const value = part.slice(idx + 1).trim();
      if (!prop || !value) continue;
      out.push({ selector, prop, value });
    }
  }
  return out;
}

/**
 * 状態セレクタの許可リスト（DESIGN.md §2 是正ゲート・cycle-278 C4）。
 * これに一致するセレクタ内の --accent-weak / --wairo-* 背景は「操作・選択状態のハイライト」
 * として正当なので誤検知しない。一致しない場合のみ「静的な区画の地への誤用」と判定する。
 *   - 疑似クラス: :hover / :focus / :focus-visible / :focus-within / :active / :checked / ::selection
 *   - ARIA/data 状態属性: [aria-current] [aria-selected] [aria-pressed] [aria-checked]
 *     [data-selected] [data-current] [data-active] [data-state=...]
 *   - 本コードベースの慣例的な状態クラス名（JS 側で条件付与される操作結果ハイライトで、
 *     静的な区画の地ではない）: Current / Selected / Active / Correct
 *     （例: .allTypesItemCurrent・.itemCurrent・.choiceCorrect）
 * 迷ったときの既定は「静的背景＝誤用」（DESIGN.md §1「器は静か」）に倣い、このリストを
 * 広げすぎない。判定に迷う新規パターンが出た場合はここへの追記ではなく実装側の見直しを優先する。
 */
const STATE_SELECTOR_RE =
  /:hover\b|:focus(-visible|-within)?\b|:active\b|:checked\b|::selection\b|\[aria-(current|selected|pressed|checked)\b|\[data-(selected|current|active|state)\b|current|selected|active|correct/i;

/**
 * DESIGN.md §2 是正ゲート（cycle-278 C4）: --accent-weak / --wairo-* が background /
 * background-color の値に使われ、かつそのルールのセレクタが STATE_SELECTOR_RE に一致しない
 * 場合を検出する。結果面(quiz)で発生した「朱の気配を区画の地に静的に使う」系統的違反
 * （§2「区画の地には不可」）の再発を機械的に検出するための追加ゲート。
 */
function analyzeStaticAccentBackground(css: string, file: string): Violation[] {
  const v: Violation[] = [];
  for (const { selector, prop, value } of extractDeclarationsWithSelector(
    css,
  )) {
    if (prop !== "background" && prop !== "background-color") continue;
    const usesAccentWeak = /var\(--accent-weak\)/.test(value);
    const usesWairo = /var\(--wairo-[a-z]+\)/i.test(value);
    if (!usesAccentWeak && !usesWairo) continue;
    if (STATE_SELECTOR_RE.test(selector)) continue;
    v.push({
      file,
      severity: "ERROR",
      code: "§2",
      message: `${usesAccentWeak ? "--accent-weak" : "--wairo-*"} が状態セレクタを含まないルールの ${prop} に使われている——静的な区画の地への誤用の疑い（DESIGN.md §2: hover/selected の座布団にのみ可）`,
      declaration: `${selector} { ${prop}: ${value}; }`,
    });
  }
  return v;
}

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
    // §8-2 影とグロー。`filter: drop-shadow()` は box-shadow と並ぶグローの手段なので
    // 同じ網に掛ける。色を持たない filter（brightness 等の操作フィードバック）は素通りさせる。
    const isGlow =
      (prop === "filter" || prop === "-webkit-filter") &&
      /drop-shadow\s*\(/i.test(value);
    if (prop === "box-shadow" || prop === "text-shadow" || isGlow) {
      if (value.toLowerCase() === "none") continue;
      const what = isGlow ? `${prop} の drop-shadow` : prop;
      const colored = literals.filter((lit) => !isNeutralColor(lit));
      if (colored.length > 0) {
        // §8-2 色付き影・グロー
        push(
          "ERROR",
          "§8-2",
          `色付き ${what}（グロー/色影）は禁止（検出: ${colored.join(", ")}）`,
          prop,
          value,
        );
      } else {
        // 中性影 or var() 参照 → §4「操作フィードバックの最小限のみ許容」の可能性・人手確認
        push(
          "WARN",
          "§8-2",
          `${what} を検出。§4「影は原則なし」——最小限の操作フィードバックか視覚レビューで確認`,
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
  // §2 是正ゲート（cycle-278 C4）: --accent-weak/--wairo-* の静的背景誤用。
  v.push(...analyzeStaticAccentBackground(content, file));
  return v;
}

// ── TSX/JSX 解析（インライン style オブジェクトのみ・新デザイン面の chrome 用）────────────

/**
 * JSX のインライン style オブジェクト（`style={{…}}`）の中身を、一つずつ取り出す。
 *
 * 値にはテンプレートリテラル（`` `${width}px` ``）や入れ子のオブジェクトが入る。閉じ括弧を
 * 「`}` を含まない区間の次」として探すと、そういうブロックは一致せず**丸ごと検査されないまま
 * 通る**。ブレースと引用符の深さを数え、対応する閉じ括弧までを一つのブロックとして返す。
 */
function jsxStyleBlocks(code: string): string[] {
  const blocks: string[] = [];
  const head = /style=\{\{/g;
  let m: RegExpExecArray | null;
  while ((m = head.exec(code)) !== null) {
    const start = m.index + m[0].length;
    let depth = 2; // `{{` の内側から数える
    let quote: string | null = null;
    let end = -1;
    let i = start;
    for (; i < code.length && depth > 0; i++) {
      const c = code[i];
      if (quote) {
        if (c === "\\") i++;
        else if (c === quote) quote = null;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") quote = c;
      else if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 1) end = i;
      }
    }
    blocks.push(code.slice(start, end === -1 ? i : end));
    head.lastIndex = i;
  }
  return blocks;
}

function analyzeTsx(content: string, file: string): Violation[] {
  const v: Violation[] = [];
  for (const block of jsxStyleBlocks(stripCodeComments(content))) {
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
    // §8-2 色付きグロー（drop-shadow）。CSS 側と同じ規則をインライン style にも当てる。
    for (const shadow of block.matchAll(/drop-shadow\s*\(([^)]*)\)/gi)) {
      const colored = colorLiterals(shadow[1]).filter(
        (lit) => !isNeutralColor(lit),
      );
      if (colored.length > 0) {
        push(
          "ERROR",
          "§8-2",
          `インライン style の色付きグロー（drop-shadow: ${colored.join(", ")}）`,
        );
      }
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

// ── テンプレート埋め込みデザイン面の解析（middleware の 410 ページ）────────────
//
// analyzeCss は「CSS 宣言ブロック `{…}`」を、analyzeTsx は「JSX の style={{…}} オブジェクト」を
// 前提とするため、テンプレート文字列内に素の CSS/HTML を持つ面には効かない。ここでは生テキストへ
// 正規表現を当て、§8 が名指しで禁じるパターンと §10 の色の直書きを検査する。

/**
 * 絵文字（§8-6: 見出し/ナビ/ボタンの絵文字は不可）。CJK（漢字/かな）を巻き込まないよう
 * 絵文字ブロック（記号・ダインバット・絵文字・補助記号・絵文字異体字セレクタ）に限定する。
 */
const EMOJI_RE =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;

/** border-radius の値を atom 配列へ分解し、非許容 atom（§8-5）を返す（analyzeCss と同一規則）。 */
function disallowedRadiusAtoms(value: string): string[] {
  return value
    .replace(/\s*\/\s*/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((a) => a.toLowerCase())
    .filter((a) => !ALLOWED_RADIUS_ATOMS.has(a));
}

/**
 * テンプレート文字列に CSS/HTML を埋め込む稼働デザイン面（EMBEDDED_DESIGN_FILES）を生テキストで
 * 検査する:
 *   §10   色の直書き（中性のスクリム以外の hex / 色関数）。この面の色は SSoT（@/lib/utsuwaHex）
 *          から `${PAPER}` のように差し込むので、生テキストに残る色リテラルはトークンを経由して
 *          いない色——旧ブランドの青（#2563eb）も冷色スレート（#f8fafc）もここで落ちる。
 *   §8-1  そのうち紫〜青（indigo/violet・hue 250〜320）の色関数
 *   §8-5  非許容の border-radius（0 / var(--radius) / var(--radius-sm) / 2px 以外）
 *   §8-6  絵文字
 * コメント内は検査しない（旧色を「撤去済み」と書いた記述を違反として拾わないため）。
 */
function analyzeEmbeddedDesign(content: string, file: string): Violation[] {
  const v: Violation[] = [];
  const text = stripComments(content);
  const push = (code: string, message: string, declaration: string) =>
    v.push({ file, severity: "ERROR", code, message, declaration });

  // §10 色の直書き（§8-1 紫〜青はそのうち色相で名指しできるもの）。
  for (const lit of colorLiterals(text)) {
    if (isNeutralColor(lit)) continue;
    if (isPurpleHue(hueOf(lit))) {
      push("§8-1", `紫〜青（indigo/violet）の色を検出（${lit}）`, lit);
    }
    push(
      "§10",
      `色の直書きを検出（この面の色は utsuwaHex から差し込む: ${lit}）`,
      lit,
    );
  }

  // §8-5 非許容の角丸（テンプレート CSS の border-radius 宣言）。
  for (const mm of text.matchAll(/border-radius\s*:\s*([^;}"'`]+)/gi)) {
    const value = mm[1].trim();
    const bad = disallowedRadiusAtoms(value);
    if (bad.length > 0) {
      push(
        "§8-5",
        `border-radius は 0 / var(--radius) / var(--radius-sm) / 2px のみ許容（検出: ${bad.join(" ")}）`,
        `border-radius: ${value}`,
      );
    }
  }

  // §8-6 絵文字（見出し/ナビ/ボタン）。
  const emoji = text.match(EMOJI_RE);
  if (emoji) {
    push(
      "§8-6",
      "絵文字を検出（見出し/ナビ/ボタンの絵文字は §8-6 で不可）",
      emoji[0],
    );
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

/**
 * 走査の結果。`units` は**実際に検査した単位の数**（CSS の宣言・style ブロック・生テキストの
 * 文字数）で、解析器が数える対象と同じものを数える。違反 0 件には「本当に無い」と「一件も
 * 見ていない」の二通りがあり、後者を見分けられるのはこの数だけである——タグの正規表現や
 * glob を壊して対象を 0 件にしても、違反 0 件のゲートは緑のまま通る。
 */
interface ScanResult {
  violations: Violation[];
  units: number;
  files: number;
}

function scan(
  globs: string[],
  analyze: (c: string, f: string) => Violation[],
  countUnits: (c: string) => number,
): ScanResult {
  const files = fg.sync(globs, {
    cwd: PROJECT_ROOT,
    ignore: IGNORE,
    absolute: true,
  });
  const violations: Violation[] = [];
  let units = 0;
  for (const abs of files) {
    const rel = path.relative(PROJECT_ROOT, abs).replace(/\\/g, "/");
    const content = fs.readFileSync(abs, "utf-8");
    units += countUnits(content);
    for (const vio of analyze(content, rel)) {
      if (!isAllowlisted(vio)) violations.push(vio);
    }
  }
  return { violations, units, files: files.length };
}

const fmt = (vs: Violation[]) =>
  vs
    .map(
      (x) => `  [${x.code}] ${x.file} — ${x.message}\n      ${x.declaration}`,
    )
    .join("\n");

// ── テスト ───────────────────────────────────────────────────────────────

describe("DESIGN.md §8 機械ゲート（新デザイン面）", () => {
  const css = scan(
    NEW_DESIGN_CSS,
    analyzeCss,
    (c) => extractDeclarations(c).length,
  );
  const tsx = scan(
    NEW_DESIGN_TSX,
    analyzeTsx,
    (c) => jsxStyleBlocks(stripCodeComments(c)).length,
  );
  const embedded = scan(
    EMBEDDED_DESIGN_FILES,
    analyzeEmbeddedDesign,
    (c) => stripComments(c).length,
  );
  const cssViolations = css.violations;
  const tsxViolations = tsx.violations;
  const embeddedViolations = embedded.violations;

  test("対象 CSS がゲート対象に含まれていること（設定の空振り検出）", () => {
    const files = fg.sync(NEW_DESIGN_CSS, {
      cwd: PROJECT_ROOT,
      ignore: IGNORE,
    });
    expect(files.length).toBeGreaterThan(0);
    expect(files).toContain("src/app/globals.css");
  });

  // 違反 0 件が「本当に無い」のか「一件も見ていない」のかを分ける下限。現状は CSS 宣言 8,376・
  // インライン style 101 ブロック・埋め込み面 5,296 字を走査している。下限はその半分弱に置く
  // ——面が減って割り込むことより、解析が壊れて 0 になることを捕まえるための下限である。
  test("§8 ゲートが実際に走査していること（空振り検出）", () => {
    expect(css.units, "CSS 宣言を一件も抽出していない").toBeGreaterThan(4000);
    expect(
      tsx.units,
      "インライン style ブロックを一件も抽出していない",
    ).toBeGreaterThan(50);
    expect(embedded.files).toBe(EMBEDDED_DESIGN_FILES.length);
    expect(embedded.units, "埋め込み面の本文を読めていない").toBeGreaterThan(
      2000,
    );
  });

  // 各 glob が最低 1 ファイルに一致することを個別に検査する。fast-glob は `[param]` を
  // メタ文字と誤解釈して 0 件で黙って素通りしやすい（過去、辞典トップ4面の glob が全て空振り
  // していた）。集合全体の length>0 では個々の空振りを検出できないため、glob 単位で担保する。
  test("各 glob が実ファイルに一致すること（空振り glob の検出）", () => {
    const empty = [
      ...NEW_DESIGN_CSS,
      ...NEW_DESIGN_TSX,
      ...EMBEDDED_DESIGN_FILES,
    ].filter(
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

  test("テンプレート埋め込みデザイン面（middleware の 410 ページ）に §8 違反（ERROR）が無いこと", () => {
    const errors = embeddedViolations.filter((x) => x.severity === "ERROR");
    expect(
      errors,
      `\nテンプレート埋め込みデザイン面に §8 違反:\n${fmt(errors)}\n`,
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
  test("§8-2 色付きグロー（filter: drop-shadow）を検出", () => {
    const vs = analyzeCss(
      `.x { filter: drop-shadow(0 0 20px #7c3aed); }`,
      "synthetic.css",
    );
    expect(vs.some((x) => x.code === "§8-2" && x.severity === "ERROR")).toBe(
      true,
    );
  });
  test("色を持たない filter（brightness）は誤検知しない", () => {
    const vs = analyzeCss(
      `.x:hover { filter: brightness(0.92); }`,
      "synthetic.css",
    );
    expect(vs.filter((x) => x.severity === "ERROR")).toEqual([]);
  });
  test("§10 accent-color の直書きを検出", () => {
    const vs = analyzeCss(`.x { accent-color: #7c3aed; }`, "synthetic.css");
    expect(vs.some((x) => x.code === "§10")).toBe(true);
  });
  test("TSX インライン style の禁止フォントを検出", () => {
    const vs = analyzeTsx(
      `<div style={{ fontFamily: "Inter, sans-serif" }} />`,
      "synthetic.tsx",
    );
    expect(vs.some((x) => x.code === "§8-7")).toBe(true);
  });

  test("式を含む TSX インライン style も中まで検査する", () => {
    const vs = analyzeTsx(
      '<div style={{ width: `${1}px`, background: "#7c3aed", borderRadius: "12px" }} />',
      "synthetic.tsx",
    );
    expect(vs.some((x) => x.code === "§10")).toBe(true);
    expect(vs.some((x) => x.code === "§8-5")).toBe(true);
  });

  // §2 是正ゲート（cycle-278 C4）: --accent-weak/--wairo-* の静的背景誤用を検出する追加ゲート。
  test("§2 静的セレクタの --accent-weak 背景（区画の地）を検出", () => {
    const vs = analyzeCss(
      `.todayActionCard { background: var(--accent-weak); }`,
      "synthetic.css",
    );
    expect(vs.some((x) => x.code === "§2" && x.severity === "ERROR")).toBe(
      true,
    );
  });
  test("§2 :hover セレクタの --accent-weak 背景は許容（誤検知しない）", () => {
    const vs = analyzeCss(
      `.choiceButton:hover { background-color: var(--accent-weak); }`,
      "synthetic.css",
    );
    expect(vs.filter((x) => x.code === "§2")).toEqual([]);
  });
  test("§2 [aria-current] セレクタの --accent-weak 背景は許容（誤検知しない）", () => {
    const vs = analyzeCss(
      `.item[aria-current="true"] { background: var(--accent-weak); }`,
      "synthetic.css",
    );
    expect(vs.filter((x) => x.code === "§2")).toEqual([]);
  });
  test("§2 Current/Selected 命名クラスの --accent-weak 背景は許容（誤検知しない）", () => {
    const vs = analyzeCss(
      `.allTypesItemCurrent a { background-color: var(--accent-weak); }
       .optionSelected { background: var(--accent-weak); }`,
      "synthetic.css",
    );
    expect(vs.filter((x) => x.code === "§2")).toEqual([]);
  });
  test("§2 静的セレクタの --wairo-* 背景（区画の地）を検出", () => {
    const vs = analyzeCss(
      `.heroBanner { background: var(--wairo-kurenai); }`,
      "synthetic.css",
    );
    expect(vs.some((x) => x.code === "§2" && x.severity === "ERROR")).toBe(
      true,
    );
  });
  test("§2 background 以外のプロパティに使う --wairo-* は対象外（誤検知しない・成果物中身の色）", () => {
    const vs = analyzeCss(
      `.barFill { background-color: var(--extra-fill); }
       .wrapper[data-color="kurenai"] { --extra-fill: var(--wairo-kurenai); }`,
      "synthetic.css",
    );
    expect(vs.filter((x) => x.code === "§2")).toEqual([]);
  });

  // 埋め込みデザイン面（middleware の 410 ページ）を生テキストで検査する力。
  test("埋め込み面: 色の直書き（旧ブランドの青 #2563eb）を検出", () => {
    const vs = analyzeEmbeddedDesign(
      `body{background:#2563eb;color:#fff}`,
      "synthetic.ts",
    );
    expect(vs.some((x) => x.code === "§10")).toBe(true);
  });
  test("埋め込み面: 禁止表に無い色（#00b4ff）も直書きなら検出", () => {
    const vs = analyzeEmbeddedDesign(`a{color:#00b4ff}`, "synthetic.ts");
    expect(vs.some((x) => x.code === "§10")).toBe(true);
  });
  test("埋め込み面: 青紫 hue の色関数を検出", () => {
    const vs = analyzeEmbeddedDesign(
      `.x{color:oklch(0.6 0.2 270)}`,
      "synthetic.ts",
    );
    expect(vs.some((x) => x.code === "§8-1")).toBe(true);
  });
  test("埋め込み面: 非許容の角丸（8px）を検出", () => {
    const vs = analyzeEmbeddedDesign(`a{border-radius:8px}`, "synthetic.ts");
    expect(vs.some((x) => x.code === "§8-5")).toBe(true);
  });
  test("埋め込み面: 絵文字を検出", () => {
    const vs = analyzeEmbeddedDesign(`<a>トップへ ✨</a>`, "synthetic.ts");
    expect(vs.some((x) => x.code === "§8-6")).toBe(true);
  });
  test("埋め込み面: トークン差し込みと角丸0は誤検知しない", () => {
    const vs = analyzeEmbeddedDesign(
      "body{background:${PAPER};color:${INK};border-top:1px solid ${RULE}}\n" +
        "a.home{color:${ACCENT};border-radius:0}",
      "synthetic.ts",
    );
    expect(vs.filter((x) => x.severity === "ERROR")).toEqual([]);
  });
  test("埋め込み面: 日本語（漢字/かな）は絵文字として誤検知しない", () => {
    const vs = analyzeEmbeddedDesign(
      `<h1>このコンテンツは終了しました</h1>`,
      "synthetic.ts",
    );
    expect(vs.filter((x) => x.code === "§8-6")).toEqual([]);
  });
});

/**
 * §3「見出しに `palt` と `halt` を掛けない」のゲート。
 *
 * どちらも `chws` と排他で、書くと書体が既定で有効にしている `chws`（連続約物のアキ詰め）が
 * 切れる。実測（600/31px・「」「」——！？）で指定なし 224.3px に対し palt 指定 239.8px——詰める
 * ための指定が字を広げていた。`halt` は約物だけを半角幅へ寄せ、単独の鉤括弧まで半角にする。
 *
 * 面を選ばず落とす。本文にも `palt` は掛けられない（§3「本文はベタ組み」）し、`font-feature-settings`
 * は継承して解決後の書体に効くので、その宣言が見出しに当たるかどうかはブロックからは読めない
 * ——「明朝の指定と同じブロックにある palt」だけを見ると、親から書体を継承する要素への指定が
 * 素通りする。通すのは `tnum`（数字の等幅・§7 の桁揃え）で、現行の配信環境では `chws` と併存
 * する——ただし OpenType 仕様は `chws` を `tnum` を含む10機能と相互排他と定めており、併存は
 * ブラウザの実装に依っている。詳細は docs/knowledge/frontend.md。
 *
 * grep 一行で検査できる規則なので機械ゲートに置く。cycle-312 で 26 宣言 /
 * 20 ファイルが素通りしていた（globals.css だけ直して直したつもりになっていた）。
 */
describe("DESIGN.md §3 約物（palt と halt を掛けない）", () => {
  test("font-feature-settings に palt / halt が無いこと", () => {
    const files = fg.sync(NEW_DESIGN_CSS, {
      cwd: PROJECT_ROOT,
      ignore: IGNORE,
    });
    const offenders: string[] = [];
    let declarations = 0;
    for (const rel of files) {
      const css = fs.readFileSync(path.join(PROJECT_ROOT, rel), "utf-8");
      // コメントを外してから見る（説明文中の "palt" を拾わない）。
      for (const { prop, value } of extractDeclarations(css)) {
        if (prop !== "font-feature-settings") continue;
        declarations++;
        if (/\b(?:palt|halt)\b/.test(value)) offenders.push(`${rel}: ${value}`);
      }
    }
    expect(offenders).toEqual([]);
    expect(
      declarations,
      "font-feature-settings を一つも走査していない",
    ).toBeGreaterThan(4);
  });
});

/**
 * `\uXXXX` の並びを実際の字へ戻す。
 *
 * 一部のファイルは和文を丸ごとエスケープで書いている。そのままでは和文を探す検査に
 * 一字も引っ掛からず、**ファイルごと網の外に落ちる**——走査範囲556ファイルのうち
 * 26ファイルが、この形で一字も見えていなかった（実測）。読む側の目には同じ文なので、
 * 検査も同じ文として読む。
 */
function decodeEscapes(text: string): string {
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );
}

/**
 * TypeScript ソースから、文字列リテラルの中身だけを順に取り出す。
 *
 * 引用符を素朴に対で拾うと、コメント中の引用符や `'"'` のような「引用符そのものを
 * 値にしたリテラル」で対がずれ、無関係な範囲がひとつの文字列に化ける。ずれた範囲は
 * 誤検知を生むだけでなく、その内側に入った本物の違反を飲み込んで見逃す。だから
 * コメントと3種のリテラルを先頭から順に食べ、リテラルの中身だけを返す。
 */
function jsStringLiterals(src: string): string[] {
  // 正規表現リテラルを先に食べるのは、その中の引用符やバッククォート
  // （`/[a-z'`{|}]/` のような文字クラス）が文字列の始まりに見えてしまい、
  // そこから対がずれるためである。
  const TOKEN =
    /\/\/[^\n]*|\/\*[\s\S]*?\*\/|(?:^|[=(,:[!&|?;{+\-*%~^]|\breturn|\btypeof)\s*\/(?![*/])(?:[^/\\\n[]|\\.|\[(?:[^\]\\]|\\.)*\])+\/[gimsuy]*|'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
  const bodies: string[] = [];
  for (const m of src.matchAll(TOKEN)) {
    if (m[1] !== undefined) bodies.push(decodeEscapes(m[1]));
    else if (m[2] !== undefined) bodies.push(decodeEscapes(m[2]));
    // テンプレートの `${...}` は式であって、来訪者が読む文ではない。
    else if (m[3] !== undefined)
      bodies.push(decodeEscapes(m[3].replace(/\$\{[^{}]*\}/g, "")));
  }
  return bodies;
}

/**
 * JSX のタグに挟まれた地の文を取り出す。
 *
 * 画面の文言は文字列リテラルとは限らない——`<p>読み込み中……</p>` のように JSX へ直に
 * 書かれた文は、リテラルを何度走査しても出てこない。そして地の文には `{count}` のような式が
 * 挟まる。式を含む区間を丸ごと捨てると、**最も普通の書き方をした本文が一字も検査されない**
 * ので、式は空白へ畳んで一続きの文として読む。`&amp;` のような実体参照も地の文の一部である。
 *
 * 適用は JSX を書く面（`.tsx`/`.js`）に限る——`.ts` の不等号や総称型は JSX ではないので、
 * 同じ網に掛けると無関係なコードが地の文に化ける。化けた区間には `;` や対を欠くブレースが
 * 残るので、それを目印に落とす。
 */
function jsxTextNodes(src: string): string[] {
  // JSDoc が例として `<Tile />` のようなタグを書くので、コメントを外してから
  // 拾う。外さないと、コメント中の `>` と `<` に挟まれた解説文が地の文に化ける。
  const code = stripCodeComments(src);
  const texts: string[] = [];
  // `=>` や `->` の `>` はタグの終わりではない。
  for (const m of code.matchAll(/(?<![=\-])>([^<>]*)</g)) {
    let body = m[1];
    for (let folded = ""; folded !== body;) {
      folded = body;
      body = body.replace(/\{[^{}]*\}/g, " ");
    }
    body = body.replace(/&(?:[a-zA-Z]+|#\d+);/g, " ");
    if (/[;{}]/.test(body)) continue;
    texts.push(body);
  }
  return texts;
}

/** JSX の開始タグ一つ分。`childrenAt` は開始タグの次の文字の位置（子要素の先頭）。 */
interface JsxTag {
  name: string;
  attrs: string;
  childrenAt: number;
}

/**
 * JSX の開始タグを、属性の式ごと取り出す。
 *
 * 属性には `onChange={(e) => setValue(e.target.value)}` のように `>` を含む式が入る。最初に
 * 見つけた `>` でタグを切ると、その後ろに置かれた属性が読めない——**正しく組まれた欄が、
 * 属性の並び順のせいで落ちる**。ブレースと引用符の深さを数え、式の外に出た `>` だけを
 * タグの終わりとする。
 */
function jsxOpenTags(code: string, names: readonly string[]): JsxTag[] {
  const tags: JsxTag[] = [];
  const head = new RegExp(`<(${names.join("|")})(?=[\\s/>])`, "g");
  let m: RegExpExecArray | null;
  while ((m = head.exec(code)) !== null) {
    const start = m.index + m[0].length;
    let depth = 0;
    let quote: string | null = null;
    let i = start;
    for (; i < code.length; i++) {
      const c = code[i];
      if (quote) {
        if (c === "\\") i++;
        else if (c === quote) quote = null;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") quote = c;
      else if (c === "{") depth++;
      else if (c === "}") depth--;
      else if (c === ">" && depth === 0) break;
    }
    tags.push({ name: m[1], attrs: code.slice(start, i), childrenAt: i + 1 });
    head.lastIndex = i;
  }
  return tags;
}

/** 来訪者が読む文の出どころ。`.ts` のデータ定義も、`.tsx`/`.js` の画面も等しく見る。 */
const PROSE_SOURCES = ["src/**/*.{ts,tsx,js}"];

/** §6 が適用範囲外と定める内部の検証面（`/storybook`）は、文章のゲートから外す。 */
const PROSE_IGNORE = [...IGNORE, "**/storybook/**"];

/** JSX を書く面か（`.tsx` と、Next.js が拡張子を固定する `global-not-found.js`）。 */
function isJsxFile(rel: string): boolean {
  return rel.endsWith(".tsx") || rel.endsWith(".js");
}

/**
 * 来訪者が読む文を、置き場所に依らず集める。変数に置かれた文言・prop で渡る文言・JSX に直に
 * 書かれた文言のどれが欠けても、その面の文は検査されないまま出荷される。
 */
function visibleTexts(rel: string, src: string): string[] {
  return isJsxFile(rel)
    ? [...jsStringLiterals(src), ...jsxTextNodes(src)]
    : jsStringLiterals(src);
}

/**
 * §3「約物」のゲート——三点リーダと括弧。
 *
 * 来訪者が読む文字に ASCII の三点（`...`）が混ざる、和文を半角括弧で囲む——どちらも
 * 和文の組版が崩れる。grep 一行で検査できる規則なので機械へ置く。
 *
 * 走査は「来訪者が読む文」であって「特定の属性」ではない。属性形の `placeholder="…"` だけを
 * 見ると、変数に置かれた文言・prop で渡る文言・JSX に直に書かれた文言が丸ごと網から漏れる。
 * `/storybook` は §6 が適用範囲外と定める内部の検証面なので、どの走査からも外す。
 */
describe("DESIGN.md §3 約物（三点リーダと括弧）", () => {
  /** 来訪者に読ませる文かどうかの判定。識別子やパスは和文を含まない。 */
  const JAPANESE = /[ぁ-んァ-ヶ一-龠]/;

  /** 走査した和文の文の本数と、違反した文。 */
  function scanProse(judge: (body: string) => boolean): {
    offenders: string[];
    texts: number;
  } {
    const files = fg.sync(PROSE_SOURCES, {
      cwd: PROJECT_ROOT,
      ignore: PROSE_IGNORE,
    });
    const offenders: string[] = [];
    let texts = 0;
    for (const rel of files) {
      const src = fs.readFileSync(path.join(PROJECT_ROOT, rel), "utf-8");
      for (const body of visibleTexts(rel, src)) {
        // 和文を含む文＝来訪者に読ませる文。識別子やパスは対象外。
        if (!JAPANESE.test(body)) continue;
        texts++;
        if (judge(body)) offenders.push(`${rel}: ${body.trim().slice(0, 40)}`);
      }
    }
    return { offenders, texts };
  }

  test("来訪者が読む散文に ASCII の三点が無いこと", () => {
    const { offenders, texts } = scanProse((body) => body.includes("..."));
    expect(offenders).toEqual([]);
    expect(texts, "和文の文を一つも走査していない").toBeGreaterThan(2000);
  });

  test("和文が入る括弧が全角であること", () => {
    const { offenders, texts } = scanProse((body) =>
      // 中身が欧文・数値・単位だけの括弧は半角のままでよい（§3）。
      Array.from(body.matchAll(/\(([^()]*)\)/g)).some((paren) =>
        JAPANESE.test(paren[1]),
      ),
    );
    expect(offenders).toEqual([]);
    expect(texts, "和文の文を一つも走査していない").toBeGreaterThan(2000);
  });

  /**
   * 記事の本文。サイトでいちばん分量のある和文がここにある。
   *
   * `site-concept.md` は「来訪者に届く言葉の規則はブログにも掛かる」と定めている。
   * ゲートが `.ts`/`.tsx` だけを見ていたあいだ、公開中の記事に §3 の違反が61箇所
   * 残っていた（実測）——画面の文言を直しても、いちばん読まれる和文は網の外だった。
   */
  test("記事の本文が §3 の約物に従うこと", () => {
    const offenders: string[] = [];
    let lines = 0;
    const files = fg.sync(["src/blog/content/*.md"], { cwd: PROJECT_ROOT });
    for (const rel of files) {
      const md = fs.readFileSync(path.join(PROJECT_ROOT, rel), "utf-8");
      // frontmatter・コード・リンクの URL は組版の対象ではない。
      const body = md
        .replace(/^---\n[\s\S]*?\n---\n/, "")
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`[^`\n]*`/g, "")
        .replace(/\]\([^)]*\)/g, "]")
        .replace(/https?:\/\/\S+/g, "");
      for (const line of body.split("\n")) {
        if (!JAPANESE.test(line)) continue;
        lines++;
        const halfWidthParen = Array.from(line.matchAll(/\(([^()]*)\)/g)).some(
          (paren) => JAPANESE.test(paren[1]),
        );
        const asciiDots =
          /[ぁ-んァ-ヶ一-龠]\.\.\.|\.\.\.[ぁ-んァ-ヶ一-龠]/.test(line);
        const halfWidthPunct = /[ぁ-んァ-ヶ一-龠ー々。、」』）][?!]/.test(line);
        if (halfWidthParen || asciiDots || halfWidthPunct) {
          offenders.push(`${rel}: ${line.trim().slice(0, 50)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
    expect(lines, "記事の和文を一行も走査していない").toBeGreaterThan(1000);
  });
});

/**
 * §6「来訪者に届く言葉」のゲート。
 *
 * 内部の設計語彙（品書き・値札・のれん・包み・札）が、来訪者に届く言葉へ漏れていないか。
 * §6 の適用範囲は「来訪者に届くすべての言葉」なので、走査も置き場所で切らない——読み上げ
 * られる属性は二重引用符のリテラルだけでなく式（``aria-label={`…`}``）でも書けるし、画面の
 * 地の文（`<h2>…</h2>`）はそもそも属性ですらない。cycle-312 では `ariaLabel` が prop 名
 * だったために `aria-label=` を探す走査から漏れ、10件が長く残っていた。同じ漏れ方を残さない。
 *
 * 対象外は §6 自身が範囲外と定めるもの——内部識別子とコード内の名前（＝ここで走査しない
 * `.ts` のデータや変数名）、および `/storybook`。
 */
describe("DESIGN.md §6 来訪者に届く言葉（内部語彙を漏らさない）", () => {
  const INTERNAL_VOCAB = /品書き|値札|のれん|店構え|店主|包み(?!込)|札(?!幌)/;

  /** 来訪者に読み上げられる属性。リテラル形・式形・prop 形（ariaLabel）を同じ網に掛ける。 */
  const READ_ALOUD_ATTRIBUTE =
    /(?:aria-label|ariaLabel|alt|title|placeholder)=(?:"([^"]*)"|'([^']*)'|\{\s*`([^`]*)`\s*\}|\{\s*"([^"]*)"\s*\})/g;

  test("来訪者に届く言葉（画面の地の文・読み上げ属性）に内部語彙が無いこと", () => {
    const files = fg.sync(PROSE_SOURCES, {
      cwd: PROJECT_ROOT,
      ignore: PROSE_IGNORE,
    });
    const offenders: string[] = [];
    let values = 0;
    for (const rel of files) {
      if (!isJsxFile(rel)) continue;
      const src = fs.readFileSync(path.join(PROJECT_ROOT, rel), "utf-8");
      const code = stripCodeComments(src);
      const texts = [
        ...Array.from(
          code.matchAll(READ_ALOUD_ATTRIBUTE),
          // テンプレートの `${…}` は式であって、読み上げられる言葉ではない。
          (m) => (m[1] ?? m[2] ?? m[3] ?? m[4]).replace(/\$\{[^{}]*\}/g, ""),
        ),
        ...jsxTextNodes(src),
      ];
      for (const value of texts) {
        values++;
        if (INTERNAL_VOCAB.test(value))
          offenders.push(`${rel}: ${value.trim().slice(0, 40)}`);
      }
    }
    expect(offenders).toEqual([]);
    expect(values, "来訪者に届く言葉を一つも走査していない").toBeGreaterThan(
      1000,
    );
  });
});

/**
 * 入力欄の下限 16px のゲート。
 *
 * iOS Safari は 16px 未満の欄にフォーカスするとページごと拡大し、来訪者はタップのたびに
 * ピンチで戻すことになる。拡大するのは文字を打つ欄だけではない——`<select>` も同じ規則で
 * 拡大する。共有部品（Input・Textarea・Select）は `max(1rem, 16px)` を敷いているが、生の欄を
 * 自前で組んでいる面がある。cycle-312 で共有部品だけを直して「入力欄を16px相当へ」と報告した
 * とき、辞典の検索欄が網の外に残っていた。**書いた欄を数えるのではなく、在る欄を数える。**
 *
 * 走査は className→CSS の対応を辿る。辿れない欄は**落とす**——見えないものを「問題なし」と
 * 黙って通すと、このゲートは在るだけで何も守らなくなる。
 */
describe("入力欄は 16px を下回らない（iOS Safari の自動ズーム）", () => {
  /** フォーカスで iOS が拡大する型。range/checkbox/color/file/button は拡大しない。 */
  const ZOOMING_TYPE = /^(?:text|search|number|email|tel|url|password)$/;

  /** 関数の引数をカンマで分ける。入れ子の括弧の中のカンマでは分けない。 */
  function splitArguments(inside: string): string[] {
    const args: string[] = [];
    let depth = 0;
    let current = "";
    for (const c of inside) {
      if (c === "(") depth++;
      if (c === ")") depth--;
      if (c === "," && depth === 0) {
        args.push(current);
        current = "";
        continue;
      }
      current += c;
    }
    args.push(current);
    return args;
  }

  /**
   * その指定が「設定に関わらず下回らない」と言える px。言えないときは 0。
   *
   * `rem`/`em`/`vw` は来訪者の文字サイズ設定や画面幅に比例するので、既定の 16px で何 px に
   * なるかは担保にならない——設定を小さくしている人の画面では 1.5rem でも 16px を割る。
   * 床が確定するのは絶対値そのものと、それを `max()` に並べたときだけである。`min()` の床は
   * 引数の床の最小値、`clamp()` の床は第1引数——`clamp(12px, 2vw, 20px)` は 12px まで縮む。
   */
  function pxFloor(value: string): number {
    const expression = value.trim();
    const call = expression.match(/^([a-z-]+)\(([\s\S]*)\)$/i);
    if (call) {
      const args = splitArguments(call[2]);
      switch (call[1].toLowerCase()) {
        case "max":
          return Math.max(...args.map(pxFloor));
        case "min":
          return Math.min(...args.map(pxFloor));
        case "clamp":
          return args.length === 3 ? pxFloor(args[0]) : 0;
        default:
          return 0; // calc() 等は解けない＝床を言えない。
      }
    }
    const absolute = expression.match(/^([\d.]+)px$/);
    return absolute ? Number(absolute[1]) : 0;
  }

  /**
   * 入力欄に効いている CSS Modules のクラス名を取り出す。
   *
   * 直に `className={styles.input}` と書く面と、共有部品のように
   * `const classNames = [styles.input, ...]` を組み立てて渡す面がある。後者を
   * 辿らないと、**最も多くの欄に効いている共有部品が黙って網から外れる**。
   */
  function resolveStyleClass(src: string, attrs: string): string | null {
    const direct = attrs.match(/className=\{styles\.([A-Za-z0-9_]+)\}/);
    if (direct) return direct[1];

    const viaVariable = attrs.match(/className=\{([A-Za-z0-9_]+)\}/);
    if (!viaVariable) return null;
    const declaration = src.match(
      new RegExp(`const\\s+${viaVariable[1]}\\s*=\\s*\\[([\\s\\S]*?)\\]`),
    );
    return declaration?.[1].match(/styles\.([A-Za-z0-9_]+)/)?.[1] ?? null;
  }

  test("生の入力欄の font-size が 16px 以上であること", () => {
    const files = fg.sync(PROSE_SOURCES, {
      cwd: PROJECT_ROOT,
      ignore: PROSE_IGNORE,
      absolute: false,
    });
    const offenders: string[] = [];
    let fields = 0;

    for (const rel of files) {
      if (!isJsxFile(rel)) continue;
      const abs = path.join(PROJECT_ROOT, rel);
      // JSDoc は `<textarea>` を説明のために書く。コードとして数えない。
      const code = stripCodeComments(fs.readFileSync(abs, "utf-8"));

      for (const { name, attrs } of jsxOpenTags(code, [
        "input",
        "textarea",
        "select",
      ])) {
        if (name === "input") {
          // 素の `<input>` の既定は text。型を書いていない欄も、`type={type}` の
          // ように動的な欄も、文字を打てる欄として数える——「型が読めないから
          // 対象外」にすると、共有部品のように型を prop で受ける欄が全部外れる。
          const literalType = attrs.match(/type="([a-z]+)"/)?.[1];
          if (literalType && !ZOOMING_TYPE.test(literalType)) continue;
        }
        fields++;
        const cls = resolveStyleClass(code, attrs);
        if (!cls) {
          offenders.push(`${rel}: ${name} の className を辿れない`);
          continue;
        }

        // 同じディレクトリか styles/ 配下の module.css を探す。
        const sheets = fg.sync(["*.module.css", "styles/*.module.css"], {
          cwd: path.dirname(abs),
          absolute: true,
        });
        const rules = sheets
          .map((sheet) => fs.readFileSync(sheet, "utf-8"))
          .flatMap(
            (css) =>
              css.match(new RegExp(`\\.${cls}\\s*\\{[^}]*\\}`, "g")) ?? [],
          );
        const sizes = rules
          .map((rule) => rule.match(/font-size:\s*([^;]+);/)?.[1])
          .filter((v): v is string => v !== undefined);

        if (sizes.length === 0) {
          offenders.push(`${rel}: .${cls} の font-size を辿れない`);
        } else if (!sizes.every((size) => pxFloor(size) >= 16)) {
          offenders.push(
            `${rel}: .${cls} に 16px の床が無い（${sizes.join(" / ")}）`,
          );
        }
      }
    }
    expect(offenders).toEqual([]);
    expect(fields, "入力欄を一つも走査していない").toBeGreaterThan(5);
  });
});

/**
 * §6-4「行き先を指す名前は、着いた先が名指しているものを名指す」のゲート。
 *
 * 「道具」と書いて「ツール」に着けば、来訪者は別の場所に来たと思う。名指す対象そのものが
 * 入れ替わっているからである。出どころ（レジストリ）の名と、画面に置いたラベルを機械で
 * 突き合わせる。
 *
 * ラベルの置き場所は二通りある——一覧を組む `{ name, href }` のオブジェクトと、
 * `<Link href="…">ラベル</Link>` の地の文。後者は属性と地の文に分かれて書かれるので、対を
 * 探す走査では拾えない。どちらも同じ網に掛ける。
 */
describe("DESIGN.md §6-4 行き先の名前（着いた先の名前と揃える）", () => {
  /** 行き先の正式名。道具は meta.name、遊びはレジストリの表示名。 */
  function canonicalName(href: string): string | null {
    const tool = href.match(/^\/tools\/([a-z0-9-]+)$/);
    if (tool) return toolsBySlug.get(tool[1])?.meta.name ?? null;
    const play = href.match(/^\/play\/([a-z0-9-]+)$/);
    if (play) {
      const content = playContentBySlug.get(play[1]);
      // 一覧・推薦・関連リンクはどの面も shortTitle を使う。行き先の「navigation
      // 上の名前」はこれなので、突き合わせの基準もこれに置く。
      return content ? (content.shortTitle ?? content.title) : null;
    }
    return null;
  }

  /** 正式名のうち、ラベルが残していなければならない割合。 */
  const KEPT_AT_LEAST = 0.6;

  /**
   * 突き合わせの前に、活用と誘い文句を落とす。§6-4 は逐語の一致を求めていない——
   * 「四字熟語パズルで遊ぶ」の「遊ぶ」も「カラーコードを変換する」の格助詞も、
   * 名指している対象は変えていない。
   */
  function nameOnly(text: string): string {
    return decodeEscapes(text)
      .replace(/\s+/g, "")
      .replace(/(?:受ける|見る|遊ぶ|試す|する|やる|ひらく)$/, "")
      .replace(/[をにへ]/g, "")
      .replace(/[がではと]$/, "");
  }

  /**
   * ラベルが正式名を指していると言えるか。
   *
   * 完全一致だけを通すと、正式名に限定語を足した形（「JSON整形」→「JSON整形・検証」）や、
   * 誘い文句を添えた形（「四字キメル - 毎日の四字熟語パズルで遊ぶ」）まで落ちる。来訪者は
   * これで迷わない——迷うのは**別の語に替える**ことである。
   *
   * 逆に、正式名を切り詰めたラベルは、切り詰めるほど別の語に近づく。「漢字カナール」の
   * 「ル」も、「診断」のような総称語も、どちらかがもう一方を含んでいれば通す判定では
   * 「指している」ことになってしまう。切り詰めの側は、正式名の大半を残している場合に限る。
   */
  /** 主題として意味を持つ最短の連なり（「藍」だけの一致で通さないための下限）。 */
  const SUBJECT_MIN_LENGTH = 3;

  /**
   * 二つの名前が同じものを名指しているか。
   *
   * 逐語一致は求めない——一覧の「日本の伝統色診断」と、着いた先の「あなたを日本の
   * 伝統色に例えると？」は、どちらも『日本の伝統色』を名指しているので迷わない。
   * 迷うのは「道具」と「ツール」のように、名指す語そのものが入れ替わる形である。
   * 共通の連なりが主題と呼べる長さに達しているかで分ける。
   */
  function sharesSubject(a: string, b: string): boolean {
    const x = nameOnly(a);
    const y = nameOnly(b);
    for (
      let len = Math.min(x.length, y.length);
      len >= SUBJECT_MIN_LENGTH;
      len--
    ) {
      for (let i = 0; i + len <= x.length; i++) {
        if (y.includes(x.slice(i, i + len))) return true;
      }
    }
    return false;
  }

  function pointsTo(label: string, canonical: string): boolean {
    const name = nameOnly(label);
    const target = nameOnly(canonical);
    if (name.includes(target)) return true;
    return (
      target.includes(name) && name.length >= target.length * KEPT_AT_LEAST
    );
  }

  /** 行き先ごとに `{ ラベル, href }` を集める。読めないラベルは対象にしない。 */
  function linkLabels(
    rel: string,
    src: string,
  ): { label: string; href: string }[] {
    const pairs: { label: string; href: string }[] = [];
    // `{ name: "…", href: "/tools/x" }` と `{ label: "…", href: "…" }` の両形。
    // 順序はどちらでも書けるので、両向きを見る。
    const patterns = [
      /(?:name|label):\s*"([^"]+)",\s*href:\s*"([^"]+)"/g,
      /href:\s*"([^"]+)",\s*(?:name|label):\s*"([^"]+)"/g,
    ];
    for (const [index, re] of patterns.entries()) {
      for (const m of src.matchAll(re)) {
        pairs.push({
          label: index === 0 ? m[1] : m[2],
          href: index === 0 ? m[2] : m[1],
        });
      }
    }
    if (!isJsxFile(rel)) return pairs;

    const code = stripCodeComments(src);
    for (const tag of jsxOpenTags(code, ["Link", "a"])) {
      const href = tag.attrs.match(/href="([^"]+)"/)?.[1];
      if (href === undefined) continue; // 行き先が式のリンクは、ここからは読めない。
      const closing = code.indexOf("</", tag.childrenAt);
      if (closing === -1) continue;
      const inner = code.slice(tag.childrenAt, closing);
      const expressions = Array.from(
        inner.matchAll(/\{([^{}]*)\}/g),
        (m) => m[1],
      );
      // 式で組み立てるラベル（`{categoryLabel}`）は読めない。文字列リテラルを式で
      // 包んだだけの形（`{"漢字…"}`）は、来訪者には地の文と同じに見える。
      if (expressions.some((e) => !/["'`]/.test(e))) continue;
      const label = inner
        .replace(/<[^<>]*>/g, " ")
        .replace(/[{}"'`]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (label !== "") pairs.push({ label, href });
    }
    return pairs;
  }

  test("リンクのラベルが行き先の名前と別の語でないこと", () => {
    const files = fg.sync(PROSE_SOURCES, {
      cwd: PROJECT_ROOT,
      ignore: [...PROSE_IGNORE, "**/meta.ts"],
    });
    const offenders: string[] = [];
    let pairs = 0;

    for (const rel of files) {
      const src = fs.readFileSync(path.join(PROJECT_ROOT, rel), "utf-8");
      for (const { label, href } of linkLabels(rel, src)) {
        if (!/^\/(?:tools|play)\/[a-z0-9-]+$/.test(href)) continue;
        pairs++;
        const canonical = canonicalName(href);
        if (canonical === null) {
          // 実在しない行き先か、レジストリの形が変わったかのどちらか。
          // どちらも「黙って通す」が最悪の結果なので落とす。
          offenders.push(`${rel}: ${href} の名前を引けない`);
        } else if (!pointsTo(label, canonical)) {
          offenders.push(`${rel}: 「${label}」→ ${href}（「${canonical}」）`);
        }
      }
    }
    expect(offenders).toEqual([]);
    expect(pairs, "行き先とラベルの対を一つも走査していない").toBeGreaterThan(
      20,
    );
  });

  /**
   * 一覧に出す短い呼び名（`shortTitle`）と、着いた先が名乗る題（`title`）。
   *
   * どちらを使ってもよいが、同じものを名指していなければならない。ここを誰も
   * 見ていなかったので、一覧のラベルと着いた先の見出しが別の語という状態が、
   * リンク側のゲートをすり抜けて残っていた。
   */
  test("短い呼び名が、着いた先の題と同じものを名指していること", () => {
    const offenders: string[] = [];
    let checked = 0;
    for (const content of playContentBySlug.values()) {
      if (content.shortTitle === undefined) continue;
      checked++;
      if (!sharesSubject(content.shortTitle, content.title)) {
        offenders.push(`${content.title} ↔ ${content.shortTitle}`);
      }
    }
    expect(offenders).toEqual([]);
    // 短い呼び名を持つ面は実測7件。走査が壊れて0件になったら落とす。
    expect(checked, "短い呼び名を一つも走査していない").toBeGreaterThan(5);
  });
});

/**
 * §3「見出しの階層は 1.25 倍スケール（16/20/25/31/39px）」のゲート。
 *
 * CSS を書けない面（410）は CSS を文字列で持つので、`globals.css` の見出しトークンが効かない。
 * cycle-312 で 410 の CSS ブロックを丸ごと書き直しながら `h1: 1.6rem`・`h2: 1.125rem` を出荷
 * しかけた——どちらもスケールに無い値である。手で写す面ほど、機械で見張る。
 *
 * 読めない指定は「対象外」ではなく**落とす**。手で写す面に最も自然に出てくる単位は px であり、
 * `var(--x)` や `calc()` はこの面では解決できない——スケールに載っていることを確かめられない
 * 値を黙って通すと、見張っているのは「rem で書いた見出しだけ」になる。
 */
describe("DESIGN.md §3 見出しの階層スケール（CSS を埋め込む面）", () => {
  /** 1.25 倍スケール。px と、16px 基準で同じ大きさになる rem。 */
  const SCALE_PX = [16, 20, 25, 31, 39];
  const SCALE_REM = [1, 1.25, 1.5625, 1.9375, 2.4375];

  /** セレクタが素の h1〜h6 を含むならその段。`h1,.shop{…}` の複合セレクタも見る。 */
  function headingLevel(selector: string): number | null {
    for (const part of selector.split(",")) {
      const heading = part.trim().match(/(?:^|[\s>+~])h([1-6])(?![\w-])/);
      if (heading) return Number(heading[1]);
    }
    return null;
  }

  test("埋め込み CSS の見出しが 1.25 倍スケールの値であること", () => {
    const offenders: string[] = [];
    let headings = 0;
    for (const rel of EMBEDDED_DESIGN_FILES) {
      // テンプレートの `${TOKEN}` は `}` を含むので、先に外す——外さないと
      // CSS ルールがそこで切れたと誤読し、font-size に一度も到達しない。
      const src = stripComments(
        fs.readFileSync(path.join(PROJECT_ROOT, rel), "utf-8"),
      ).replace(/\$\{[^{}]*\}/g, "");
      // 例: "h1{font-family:…;font-size:1.5625rem;…}"
      for (const rule of src.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
        const level = headingLevel(rule[1]);
        if (level === null) continue;
        const size = rule[2].match(/font-size:\s*([^;]+)/)?.[1]?.trim();
        // 大きさを書かないブロック（余白だけの指定）は階層を作らない。
        if (size === undefined) continue;
        headings++;
        const rem = size.match(/^([\d.]+)rem$/);
        const px = size.match(/^([\d.]+)px$/);
        const onScale = rem
          ? SCALE_REM.includes(Number(rem[1]))
          : px
            ? SCALE_PX.includes(Number(px[1]))
            : false;
        if (!onScale) offenders.push(`${rel}: h${level} が ${size}`);
      }
    }
    expect(offenders).toEqual([]);
    expect(headings, "見出しの指定を一つも走査していない").toBeGreaterThan(1);
  });
});
