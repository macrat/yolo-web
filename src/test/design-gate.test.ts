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
 * ── 対象（src 全体・広域 glob）──────────────────────────────────────────
 *   cycle-279 C1 で (legacy)/ 一式・old-globals.css・旧デザイントークン定義
 *   （--bg / --fg / --r- 系 / --shadow- 系 / status 系 / --admonition-* 等）を完全削除し、
 *   src/ 全体が新トークン体系のみになった。フェーズR 最終レビュー是正（cycle-279 MUST-5）で、
 *   個別列挙方式（新規ページ追加時に列挙漏れが起きると検査対象から漏れる）から
 *   `src/**\/*.module.css` / `src/**\/*.tsx` の広域 glob へ切り替えた——src/ に live な
 *   デザイン面が新規追加されても自動的に検査対象へ入る。除外は IGNORE のテスト/生成物・
 *   ALLOWLIST の意図的な例外（スピナーの回転リング・成果物の和色等・理由付き）のみに限定する。
 *   （OGP 画像生成 `opengraph-image.tsx`/`twitter-image.tsx`/`src/lib/ogp-image.tsx` は
 *   実測の結果 style={{}} に色リテラルを直書きしないため無検査でも誤検知しない——
 *   accentColor は関数引数として渡され JSX の style ブロック内には現れない。）
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
 *   §2    是正ゲート（cycle-278 C4・結果面(quiz)の系統的違反を受けて追加）: `--accent-weak` /
 *          `--wairo-*` は DESIGN.md §2「操作・選択状態のハイライト（hover/selected の座布団）
 *          にのみ可。区画の地には不可」。background/background-color にこれらが使われている
 *          宣言のうち、そのルールのセレクタが「状態セレクタ」（下の STATE_SELECTOR_RE 参照:
 *          :hover/:focus/:active/:checked・[aria-current] 等・Current/Selected/Active/Correct
 *          命名）を一切含まない場合は、静的な区画/箱の地への誤用の疑いとして ERROR にする。
 *
 *   すべての検査は「標準 CSS プロパティ宣言」に対して行い、`--*` のカスタムプロパティ定義
 *   （＝トークン定義）は検査しない。理由: §10 はトークン経由での色指定を原則とし、パレット自体は
 *   DESIGN.md §2 が正典で数も小さく視覚レビュー管轄。ゲートは「面でトークンをどう使うか」を見張る。
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
// 注意（fast-glob のメタ文字）: 動的セグメント `[param]` は、そのまま書くと fast-glob に
// 「文字クラス」として解釈され、実ファイルに一致せず 0 件で黙って素通りする（＝ゲートが
// 空振りする）。`[param]` は `*`（単一階層ワイルドカード）で受ける
//（旧 Route Group `(new)` はフェーズ R・C1 で src/app/ 直下へ平坦化済みのため、
// パーレンのエスケープは不要になった）。
// 空振りは下の「空振り検出」テストが各 glob 単位で fail させる。
const NEW_DESIGN_CSS = [
  // src 全体の live な *.module.css を広域 glob で網羅する（cycle-279 MUST-5）。
  // 新規ページ追加時の列挙漏れを構造的に防ぐ——除外は IGNORE（テスト）のみ。
  "src/**/*.module.css",
  // トークン定義本体（*.module.css ではないため上の glob に一致しない・明示的に追加）。
  "src/app/globals.css",
];
const NEW_DESIGN_TSX = [
  // src 全体の live な *.tsx を広域 glob で網羅する（cycle-279 MUST-5）。
  // 新規ページ追加時の列挙漏れを構造的に防ぐ——除外は IGNORE（テスト/OGP 画像生成）のみ。
  "src/**/*.tsx",
];
// テストコードは走査対象外（テスト文字列に禁止語が入るため）。
// opengraph-image.tsx / twitter-image.tsx / src/lib/ogp-image.tsx は @vercel/og の
// ImageResponse で描画する「生成物」（OGP 画像・DOM/CSS カスケードを持たないレンダラ）で、
// アクセントカラーは関数引数として渡り JSX の style ブロック内には literal で現れない
// （実測: false positive 無し）。器（ページ UI）ではないため広域 glob の対象から明示的に除外する。
const IGNORE = [
  "**/__tests__/**",
  "**/*.test.ts",
  "**/*.test.tsx",
  "**/opengraph-image.tsx",
  "**/twitter-image.tsx",
  "src/lib/ogp-image.tsx",
];

/**
 * 旧資産の明示的許容（新デザイン面の物理的メタファーによる例外）。
 * globals.css の .markdown-alert は cycle-279 C1 で新トークン（--rule/--paper-2/--accent）へ
 * 再設計済み（border-radius も var(--radius) の 0px に統一したため、旧 legacy 許容は不要）。
 */
const ALLOWLIST: { fileEndsWith: string; declaration: string }[] = [
  // 唯一の円形例外＝ローディングスピナーの回転リング。DESIGN.md §4「角丸 0px 基調」は
  // 「回転で読み込み中を示すインジケータ」を想定していない——リングは円形でなければ回転が
  // 視認できず機能を果たさない。装飾目的の一律角丸（§8-5）ではなく機能上不可避な形状として、
  // この3ファイルのスピナーのみ個別許容する。トグル・スライダーのつまみ・進捗ドット等の
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
  {
    fileEndsWith: "src/components/search/SearchInput.module.css",
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
  // §2 是正ゲート（cycle-278 C4）: --accent-weak/--wairo-* の静的背景誤用。
  v.push(...analyzeStaticAccentBackground(content, file));
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

  // 各 glob が最低 1 ファイルに一致することを個別に検査する。fast-glob は `[param]` を
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
});
