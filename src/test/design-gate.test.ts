/**
 * DESIGN.md の規定のうち、CSS と TSX の宣言から機械で判定できるものの検査。
 *
 * 機械で判定できない規定（構成・画像の質感・動きの意図など）は、frontend-design スキルの
 * 「目で確かめる」が担う。この検査はそれを肩代わりしない。
 *
 * ── 対象 ──────────────────────────────────────────────────────────────
 *   `src/**\/*.module.css`・`src/app/globals.css`・`src/**\/*.tsx`・`src/app/global-not-found.js` を
 *   広域 glob で走査する。ページを足しても列挙漏れで検査から外れないようにするため。除外はテスト
 *   （IGNORE）と、理由を添えた個別の許容（ALLOWLIST）だけにする。
 *
 *   削除記事へ返す 410 のページ（`src/middleware.ts`）は、CSS と HTML をテンプレート文字列に
 *   埋め込むので analyzeCss/analyzeTsx が効かない。analyzeEmbeddedDesign が生テキストへ的を絞った
 *   検査（青・青紫の hex と色関数・角丸・絵文字）だけを当てる（EMBEDDED_DESIGN_FILES）。
 *
 * ── 検査する項目（コードは DESIGN.md の節）────────────────────────────────
 *   §2   UI の色は無彩。この検査は、そのうち取り違えやすい青〜紫を見る:
 *        色関数で hue≈250〜320 の色 = ERROR。
 *        --accent-weak / --wairo-* を状態セレクタ（STATE_SELECTOR_RE）の外で background に使う = ERROR。
 *   §3   本文の font-family に Inter/Roboto/Open Sans 等の欧文既定 sans・monospace = ERROR。
 *        見出しの書体（--font-heading）で組む要素のウェイトが 400 以外 = ERROR
 *        （Zen Antique は 400 の1本だけで、ほかのウェイトはブラウザが合成太字を作る。§4「合成太字を作らない」）。
 *   §5   角丸は 0px。影・グロー・半透明ぼかし・グラデーションを持たない。この検査が見るのは:
 *        border-radius が ALLOWED_RADIUS_ATOMS 以外 = ERROR。backdrop-filter: blur・色付きの影 = ERROR。
 *        中性の影・グラデーション背景 = WARN（人手で確認）。絵文字（埋め込み面）= ERROR。
 *        線を引くトークン（LINE_SHADOW_TOKENS）だけの box-shadow は影でないので見ない。
 *   §12  色の直書き（トークンを経由しない hex / rgb() / oklch() 等）= ERROR。
 *        中性のスクリム（rgba(0,0,0,α) 等のオーバーレイ幕）は許す。
 *   英字の全部大文字（text-transform: uppercase）= WARN（frontend-design スキルの目視の項目）。
 *
 *   検査は標準の CSS プロパティの宣言に対して行い、`--*` のトークン定義は検査しない。
 *   トークンの値は DESIGN.md §2 の表と照らすもので、この検査は面がトークンをどう使うかを見る。
 *
 * ── 画像の資産 ────────────────────────────────────────────────────────────
 *   favicon / apple-touch-icon / OGP 画像の png は宣言テキストを持たず、この検査では見られない。
 *   `public/favicon.ico`・`public/icon.svg`・`public/apple-touch-icon.png` は
 *   `scripts/generate-favicons.ts` で生成し、見た目は take-screenshot で確かめる。
 */
import { describe, test, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import fg from "fast-glob";
import postcss from "postcss";

const PROJECT_ROOT = path.resolve(__dirname, "../..");

// 検査する面。literal のパスに fast-glob のメタ文字（丸括弧・角括弧）を含む名前をそのまま
// 書くと、picomatch がそれを正規表現のグループや文字クラスとして読み、実パスに一致せず 0 件で
// 黙って素通りする。動的セグメント `[param]` は `*` で受ける。空振りは下の「空振り glob の検出」が
// glob ごとに fail させる。
const DESIGN_CSS_GLOBS = [
  "src/**/*.module.css",
  // トークン定義と要素の既定（*.module.css ではないので明示する）。
  "src/app/globals.css",
];
const DESIGN_TSX_GLOBS = [
  "src/**/*.tsx",
  // 404 のルート。Next.js が拡張子 .js で読むファイル名なので明示する。
  "src/app/global-not-found.js",
];
// テストはテスト文字列に禁止語を含むので走査しない。
const IGNORE = ["**/__tests__/**", "**/*.test.ts", "**/*.test.tsx"];

// テンプレート文字列に CSS/HTML を埋め込む面。上の glob の解析が効かないが来訪者に表示されるため、
// analyzeEmbeddedDesign で生テキストを検査する。
//   - src/middleware.ts : 削除記事へ返す 410 Gone ページの HTML/CSS
const EMBEDDED_DESIGN_FILES = ["src/middleware.ts"];

/** 理由を添えて個別に許す宣言。 */
const ALLOWLIST: { fileEndsWith: string; declaration: string }[] = [
  // ローディングスピナーの回転リング。円でなければ回転が見えず、読み込み中を示せないため、
  // この2ファイルのスピナーだけ円を許す。操作に使う部品（トグル・スライダーのつまみ・進捗ドット等）は
  // ここに含めない。
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
  // ゲームの駒・結果の色見本など、中身に和色（--wairo-*）を敷く宣言。セレクタ名が状態を
  // 表さないので STATE_SELECTOR_RE に掛からず、ここで個別に許す。
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
  code: string; // DESIGN.md の節（§2 など）
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

// border-radius で ERROR にしない値。§5 は角丸を 0px とするが、この検査は 2px も ERROR にしない。
// box-shadow で線を引くトークン（§6 フォーカスの内の輪・hover の細いボーダー）。ずらしもぼかしも持たない
// 広がりだけの値で、影ではない。値の定義は globals.css。
const LINE_SHADOW_TOKENS = new Set([
  "var(--focus-ring-fill)",
  "var(--hover-line)",
]);

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

// §3: 本文の書体に使わない欧文の既定の sans。
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
 * 状態セレクタ。これに一致するセレクタ内の --accent-weak / --wairo-* の背景は、操作や選択の
 * 状態を示す地として許す。一致しないものは、静的な区画に地を敷いた疑いとして検出する。
 *   - 疑似クラス: :hover / :focus / :focus-visible / :focus-within / :active / :checked / ::selection
 *   - ARIA/data 状態属性: [aria-current] [aria-selected] [aria-pressed] [aria-checked]
 *     [data-selected] [data-current] [data-active] [data-state=...]
 *   - 本コードベースの慣例的な状態クラス名（JS 側で条件付与される操作結果ハイライトで、
 *     静的な区画の地ではない）: Current / Selected / Active / Correct
 *     （例: .allTypesItemCurrent・.itemCurrent・.choiceCorrect）
 * UI は無彩（DESIGN.md §1）なので、このリストを広げすぎない。判定に迷うパターンが出たら、
 * ここへ足すより実装の側を見直す。
 */
const STATE_SELECTOR_RE =
  /:hover\b|:focus(-visible|-within)?\b|:active\b|:checked\b|::selection\b|\[aria-(current|selected|pressed|checked)\b|\[data-(selected|current|active|state)\b|current|selected|active|correct/i;

/**
 * --accent-weak / --wairo-* が background / background-color の値に使われ、かつそのルールの
 * セレクタが STATE_SELECTOR_RE に一致しない宣言を検出する。静的な区画に地を敷かないため。
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
      message: `${usesAccentWeak ? "--accent-weak" : "--wairo-*"} が状態セレクタを含まないルールの ${prop} に使われている——静的な区画に地を敷いている疑い`,
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
    // トークン定義（--*）は検査しない（見るのはトークンの使い方）。
    if (prop.startsWith("--")) continue;

    const isRadius =
      prop === "border-radius" || /^border-[a-z]+-radius$/.test(prop);
    const isFont = prop === "font-family";
    const isBackdrop =
      prop === "backdrop-filter" || prop === "-webkit-backdrop-filter";

    // §5 半透明ぼかし
    if (isBackdrop && /\bblur\s*\(/i.test(value)) {
      push(
        "ERROR",
        "§5",
        "backdrop-filter: blur（半透明ぼかし）は持たない",
        prop,
        value,
      );
    }

    // 英字の全部大文字（警告）
    if (prop === "text-transform" && /\buppercase\b/i.test(value)) {
      push(
        "WARN",
        "uppercase",
        "text-transform: uppercase（英字の全部大文字は目視で確かめる）",
        prop,
        value,
      );
    }

    // §5 角丸
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
          "§5",
          `border-radius は 0 / var(--radius) / var(--radius-sm) / 2px のみ許容（検出: ${bad.join(" ")}）`,
          prop,
          value,
        );
      }
    }

    // §3 書体
    if (isFont) {
      if (BANNED_FONT_RE.test(value)) {
        push(
          "ERROR",
          "§3",
          "本文の書体に欧文の既定の sans（Inter/Roboto/Open Sans 等）は使わない",
          prop,
          value,
        );
      }
      if (/\bmonospace\b/i.test(value)) {
        push(
          "ERROR",
          "§3",
          "本文の font-family に monospace は使わない（コードは var(--font-mono) 経由）",
          prop,
          value,
        );
      }
    }

    if (!COLOR_PROPS.has(prop)) continue;

    // §5 グラデーション背景（警告・色が中身かどうかは目視で確かめる）
    if (
      (prop === "background" || prop === "background-image") &&
      /\b(linear|radial|conic)-gradient\s*\(/i.test(value)
    ) {
      push(
        "WARN",
        "§5",
        "gradient 背景を検出（グラデーションは持たない。中身の表示かどうかを目視で確かめる）",
        prop,
        value,
      );
    }

    const literals = colorLiterals(value);
    if (prop === "box-shadow" || prop === "text-shadow") {
      if (value.toLowerCase() === "none") continue;
      if (prop === "box-shadow" && LINE_SHADOW_TOKENS.has(value)) continue;
      const colored = literals.filter((lit) => !isNeutralColor(lit));
      if (colored.length > 0) {
        // §5 色付きの影・グロー
        push(
          "ERROR",
          "§5",
          `色付き ${prop}（グロー/色影）は持たない（検出: ${colored.join(", ")}）`,
          prop,
          value,
        );
      } else {
        // 中性の影や var() 参照は、目視で確かめる
        push(
          "WARN",
          "§5",
          `${prop} を検出。影は持たない（§5）——目視で確認`,
          prop,
          value,
        );
      }
      continue;
    }

    // §2 青〜紫の色関数（hue 250〜320）
    for (const lit of literals) {
      if (isPurpleHue(hueOf(lit))) {
        push(
          "ERROR",
          "§2",
          `青〜紫（indigo/violet）の色を検出（${lit}）`,
          prop,
          value,
        );
      }
    }

    // §12 色の直書き（トークンを経由しない）。中性のスクリムは許す。
    const rawNonNeutral = literals.filter((lit) => !isNeutralColor(lit));
    if (rawNonNeutral.length > 0) {
      push(
        "ERROR",
        "§12",
        `色の直書きを検出（トークンを経由する: ${rawNonNeutral.join(", ")}）`,
        prop,
        value,
      );
    }
  }
  // §2 --accent-weak/--wairo-* を静的な区画の地に使っていないか。
  v.push(...analyzeStaticAccentBackground(content, file));
  return v;
}

// ── TSX 解析（インライン style オブジェクト）──────────────────────────────────

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
        "§5",
        "インライン style の backdropFilter: blur（半透明ぼかし）は持たない",
      );
    }
    if (BANNED_FONT_RE.test(block) && /fontFamily/i.test(block)) {
      push(
        "ERROR",
        "§3",
        "インライン style の fontFamily に欧文の既定の sans は使わない",
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
          "§5",
          `インライン style の borderRadius が不許容（${bad.join(" ")}）`,
        );
    }
    for (const lit of colorLiterals(block)) {
      if (isNeutralColor(lit)) continue;
      if (isPurpleHue(hueOf(lit)))
        push("ERROR", "§2", `インライン style に青〜紫の色（${lit}）`);
      push("ERROR", "§12", `インライン style の色直書き（${lit}）`);
    }
  }
  return v;
}

// ── テンプレート埋め込みデザイン面の解析（middleware 410）────────────────────────────
//
// analyzeCss は「CSS 宣言ブロック `{…}`」を、analyzeTsx は「JSX の style={{…}} オブジェクト」を
// 前提とするため、テンプレート文字列内に素の CSS/HTML を持つ面には効かない。ここでは具体的な
// パターンだけを生テキストへ正規表現で当てる。一般の色直書き検査（§12）はしない——410 のページは
// CSS module を使えず、トークンの値（紙・墨・線の oklch）をこの面の中に定義として持つため。

/**
 * 無彩の UI（§2）に入り込みやすい青・青紫・冷色スレートの hex。埋め込み CSS/HTML には
 * 一般の色直書き検査を当てないので、これらの色だけを的を絞って弾く。
 */
const BANNED_EMBEDDED_HEX: readonly string[] = [
  "#2563eb", // blue-600
  "#1d4ed8", // blue-700
  "#3b82f6", // blue-500
  "#7c3aed", // violet-600
  "#6d28d9", // violet-700
  "#4f46e5", // indigo-600
  "#f8fafc", // 冷色スレート地（slate-50・無彩でない冷たい白）
  "#1e293b", // 冷色スレート（slate-800）
];

/**
 * 絵文字（§5: どこにも置かない）。CJK（漢字/かな）を巻き込まないよう
 * 絵文字ブロック（記号・ダインバット・絵文字・補助記号・絵文字異体字セレクタ）に限定する。
 */
const EMOJI_RE =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;

/** border-radius の値を atom 配列へ分解し、非許容 atom（§5）を返す（analyzeCss と同一規則）。 */
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
 * 検査する。検出対象は次の具体パターンに限る:
 *   §2  青・青紫の hex（BANNED_EMBEDDED_HEX）／青〜紫 hue の色関数（oklch/hsl/hwb・250〜320）
 *   §5  ERROR にしない値（0 / var(--radius) / var(--radius-sm) / 2px）以外の border-radius・絵文字
 * 一般の色直書き検査（§12）はしない。/* *​/ コメント内は検査しない。
 */
function analyzeEmbeddedDesign(content: string, file: string): Violation[] {
  const v: Violation[] = [];
  const text = stripComments(content);
  const push = (code: string, message: string, declaration: string) =>
    v.push({ file, severity: "ERROR", code, message, declaration });

  // §2 青・青紫の hex。
  const lower = text.toLowerCase();
  for (const hex of BANNED_EMBEDDED_HEX) {
    if (lower.includes(hex)) {
      push("§2", `青・青紫系の hex（${hex}）の直書きを検出`, hex);
    }
  }

  // §2 青〜紫 hue の色関数。hex は極座標 hue を持たない（hueOf=null）ため対象外。
  for (const lit of colorLiterals(text)) {
    if (isPurpleHue(hueOf(lit))) {
      push("§2", `青〜紫（indigo/violet）の色関数を検出（${lit}）`, lit);
    }
  }

  // §5 非許容の角丸（テンプレート CSS の border-radius 宣言）。
  for (const mm of text.matchAll(/border-radius\s*:\s*([^;}"'`]+)/gi)) {
    const value = mm[1].trim();
    const bad = disallowedRadiusAtoms(value);
    if (bad.length > 0) {
      push(
        "§5",
        `border-radius は 0 / var(--radius) / var(--radius-sm) / 2px のみ許容（検出: ${bad.join(" ")}）`,
        `border-radius: ${value}`,
      );
    }
  }

  // §5 絵文字。
  const emoji = text.match(EMOJI_RE);
  if (emoji) {
    push("§5", "絵文字を検出（絵文字はどこにも置かない）", emoji[0]);
  }

  return v;
}

// ── 見出しの書体のウェイト（§3・§4）──────────────────────────────────────
//
// 見出しの書体 Zen Antique はウェイト 400 の1本だけを配る。見出しの書体で組む要素に 400 以外の
// ウェイトが当たると、ブラウザが合成太字を作り、字の中の空きが潰れる（§4「合成太字を作らない」）。
// 見出しにウェイトの差も使わない（§3）。見出しの書体で組む要素は次の3通りで生まれるので、
// それぞれに当たるウェイトを検査する:
//   1. font-family に var(--font-heading) を当てたクラス（同じファイルの別のルールのウェイトも見る）
//   2. globals.css が見出しの書体を当てる h1〜h6 を、要素セレクタで指すルール
//   3. TSX で h1〜h6 に付けたクラス（そのクラスが本文の書体へ替えていないもの）

const HEADING_FONT_RE = /var\(--font-heading\)/;
const HEADING_ELEMENT_RE = /(^|[^\w.#-])h[1-6](?![\w-])/;
const REGULAR_WEIGHTS = new Set([
  "400",
  "normal",
  "inherit",
  "initial",
  "unset",
]);

/** セレクタの最後の複合セレクタ（スタイルが当たる要素を表す部分）。 */
function subjectOf(selector: string): string {
  const parts = selector.trim().split(/\s*[\s>+~]\s*/);
  return parts[parts.length - 1] ?? "";
}

/** 複合セレクタが持つクラス名。 */
function classesOf(compound: string): string[] {
  return [...compound.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((m) => m[1]);
}

interface WeightRule {
  selector: string;
  subject: string;
  fontFamily: string | null;
  fontWeight: string | null;
}

/** CSS のルールを、セレクタごとに font-family と font-weight の宣言へまとめる。 */
function weightRules(css: string): WeightRule[] {
  const out: WeightRule[] = [];
  postcss.parse(css).walkRules((rule) => {
    let fontFamily: string | null = null;
    let fontWeight: string | null = null;
    rule.each((node) => {
      if (node.type !== "decl") return;
      if (node.prop === "font-family") fontFamily = node.value;
      if (node.prop === "font-weight") fontWeight = node.value;
    });
    for (const selector of rule.selectors) {
      out.push({
        selector,
        subject: subjectOf(selector),
        fontFamily,
        fontWeight,
      });
    }
  });
  return out;
}

const isRegularWeight = (weight: string): boolean =>
  REGULAR_WEIGHTS.has(weight.trim().toLowerCase());

/** 見出しの書体を当てたクラスの集合。 */
function headingFontClasses(rules: WeightRule[]): Set<string> {
  const classes = new Set<string>();
  for (const rule of rules) {
    if (rule.fontFamily !== null && HEADING_FONT_RE.test(rule.fontFamily)) {
      for (const cls of classesOf(rule.subject)) classes.add(cls);
    }
  }
  return classes;
}

/** 1・2: CSS の中で、見出しの書体で組む要素に 400 以外のウェイトを当てた宣言。 */
function analyzeHeadingWeightCss(content: string, file: string): Violation[] {
  const rules = weightRules(content);
  const headingClasses = headingFontClasses(rules);
  const v: Violation[] = [];
  for (const rule of rules) {
    if (rule.fontWeight === null || isRegularWeight(rule.fontWeight)) continue;
    const setsBodyFont =
      rule.fontFamily !== null && !HEADING_FONT_RE.test(rule.fontFamily);
    if (setsBodyFont) continue;
    const setsHeadingFont =
      rule.fontFamily !== null && HEADING_FONT_RE.test(rule.fontFamily);
    const targetsHeadingClass = classesOf(rule.subject).some((cls) =>
      headingClasses.has(cls),
    );
    const targetsHeadingElement = HEADING_ELEMENT_RE.test(rule.subject);
    if (setsHeadingFont || targetsHeadingClass || targetsHeadingElement) {
      v.push({
        file,
        severity: "ERROR",
        code: "§3",
        message: `見出しの書体で組む要素に font-weight: ${rule.fontWeight}（Zen Antique は 400 だけで、ほかは合成太字になる）`,
        declaration: `${rule.selector} { font-weight: ${rule.fontWeight}; }`,
      });
    }
  }
  return v;
}

/** TSX の `import x from "….module.css"` を、プロジェクトルートからのパスへ解決する。 */
function cssModuleImports(content: string, file: string): Map<string, string> {
  const imports = new Map<string, string>();
  for (const m of content.matchAll(
    /import\s+(\w+)\s+from\s+["']([^"']+\.module\.css)["']/g,
  )) {
    const [, alias, spec] = m;
    const resolved = spec.startsWith("@/")
      ? path.join("src", spec.slice(2))
      : path.join(path.dirname(file), spec);
    imports.set(alias, resolved.replace(/\\/g, "/"));
  }
  return imports;
}

/** 3: TSX の h1〜h6 に付けたクラスが、本文の書体へ替えずに 400 以外のウェイトを当てている。 */
function analyzeHeadingWeightTsx(
  content: string,
  file: string,
  readCss: (cssPath: string) => string | null,
): Violation[] {
  const imports = cssModuleImports(content, file);
  if (imports.size === 0) return [];
  const v: Violation[] = [];
  for (const tag of content.matchAll(/<h([1-6])\b([^>]*)>/g)) {
    const attrs = tag[2];
    for (const [alias, cssPath] of imports) {
      const refs = attrs.matchAll(
        new RegExp(`\\b${alias}(?:\\.(\\w+)|\\[["'](\\w+)["']\\])`, "g"),
      );
      for (const ref of refs) {
        const cls = ref[1] ?? ref[2];
        const css = readCss(cssPath);
        if (css === null) continue;
        const rules = weightRules(css).filter((rule) =>
          classesOf(rule.subject).includes(cls),
        );
        const setsBodyFont = rules.some(
          (rule) =>
            rule.fontFamily !== null && !HEADING_FONT_RE.test(rule.fontFamily),
        );
        if (setsBodyFont) continue;
        for (const rule of rules) {
          if (rule.fontWeight === null || isRegularWeight(rule.fontWeight))
            continue;
          v.push({
            file,
            severity: "ERROR",
            code: "§3",
            message: `<h${tag[1]}> に付けた .${cls}（${cssPath}）が font-weight: ${rule.fontWeight} を当てている（見出しの書体は 400 だけ）`,
            declaration: `${rule.selector} { font-weight: ${rule.fontWeight}; }`,
          });
        }
      }
    }
  }
  return v;
}

function readProjectCss(cssPath: string): string | null {
  const abs = path.join(PROJECT_ROOT, cssPath);
  return fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8") : null;
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

describe("DESIGN.md の機械の検査", () => {
  const cssViolations = scan(DESIGN_CSS_GLOBS, analyzeCss);
  const tsxViolations = scan(DESIGN_TSX_GLOBS, analyzeTsx);
  const headingWeightViolations = [
    ...scan(DESIGN_CSS_GLOBS, analyzeHeadingWeightCss),
    ...scan(DESIGN_TSX_GLOBS, (content, file) =>
      analyzeHeadingWeightTsx(content, file, readProjectCss),
    ),
  ];
  const embeddedViolations = scan(EMBEDDED_DESIGN_FILES, analyzeEmbeddedDesign);

  test("対象 CSS がゲート対象に含まれていること（設定の空振り検出）", () => {
    const files = fg.sync(DESIGN_CSS_GLOBS, {
      cwd: PROJECT_ROOT,
      ignore: IGNORE,
    });
    expect(files.length).toBeGreaterThan(0);
    expect(files).toContain("src/app/globals.css");
  });

  // 各 glob が最低 1 ファイルに一致することを個別に検査する。fast-glob はメタ文字を含む
  // literal パスを 0 件で黙って素通りしやすく、集合全体の length>0 では個々の空振りを
  // 検出できないため、glob 単位で担保する。
  test("各 glob が実ファイルに一致すること（空振り glob の検出）", () => {
    const empty = [
      ...DESIGN_CSS_GLOBS,
      ...DESIGN_TSX_GLOBS,
      ...EMBEDDED_DESIGN_FILES,
    ].filter(
      (g) => fg.sync(g, { cwd: PROJECT_ROOT, ignore: IGNORE }).length === 0,
    );
    expect(
      empty,
      `\n以下の glob が 0 件（記述ミス/メタ文字の誤解釈で素通り）:\n  ${empty.join("\n  ")}\n`,
    ).toEqual([]);
  });

  test("CSS に違反（ERROR）が無いこと", () => {
    const errors = cssViolations.filter((x) => x.severity === "ERROR");
    const warns = cssViolations.filter((x) => x.severity === "WARN");
    if (warns.length > 0) {
      // 警告は fail させない（影・グラデーション・英字の全部大文字は目視で最終判断する）。
      console.warn(
        `\n[design-gate] CSS 警告 ${warns.length} 件（視覚レビューへ）:\n${fmt(warns)}`,
      );
    }
    expect(errors, `\nCSS に違反:\n${fmt(errors)}\n`).toEqual([]);
  });

  test("TSX（インライン style）に違反（ERROR）が無いこと", () => {
    const errors = tsxViolations.filter((x) => x.severity === "ERROR");
    expect(errors, `\nTSX に違反:\n${fmt(errors)}\n`).toEqual([]);
  });

  test("テンプレート埋め込みデザイン面（middleware 410）に違反（ERROR）が無いこと", () => {
    const errors = embeddedViolations.filter((x) => x.severity === "ERROR");
    expect(
      errors,
      `\nテンプレート埋め込みデザイン面に違反:\n${fmt(errors)}\n`,
    ).toEqual([]);
  });

  test("見出しの書体で組む要素のウェイトが 400 であること（合成太字を作らない）", () => {
    expect(
      headingWeightViolations,
      `\n見出しの書体で組む要素に 400 以外のウェイト:\n${fmt(headingWeightViolations)}\n`,
    ).toEqual([]);
  });
});

/**
 * 検査そのものの検出力（合成入力）。実ファイルを汚さずに、違反を混ぜたら検出でき、
 * 正当なものを誤検知しないことを確かめる。
 */
describe("機械の検査の検出力（合成入力）", () => {
  test("§2 青〜紫の色関数を検出", () => {
    const vs = analyzeCss(`.x { color: oklch(0.6 0.2 270); }`, "synthetic.css");
    expect(vs.some((x) => x.code === "§2")).toBe(true);
  });
  test("§5 半透明ぼかしを検出", () => {
    const vs = analyzeCss(
      `.x { backdrop-filter: blur(8px); }`,
      "synthetic.css",
    );
    expect(vs.some((x) => x.code === "§5")).toBe(true);
  });
  test("§5 色付き box-shadow を検出", () => {
    const vs = analyzeCss(
      `.x { box-shadow: 0 0 20px oklch(0.6 0.2 270); }`,
      "synthetic.css",
    );
    expect(vs.some((x) => x.code === "§5" && x.severity === "ERROR")).toBe(
      true,
    );
  });
  test("§5 ピル形状 border-radius を検出", () => {
    const vs = analyzeCss(`.x { border-radius: 9999px; }`, "synthetic.css");
    expect(vs.some((x) => x.code === "§5")).toBe(true);
  });
  test("§3 本文の書体 Inter を検出", () => {
    const vs = analyzeCss(
      `.x { font-family: Inter, sans-serif; }`,
      "synthetic.css",
    );
    expect(vs.some((x) => x.code === "§3")).toBe(true);
  });
  test("§12 色の直書き（hex）を検出", () => {
    const vs = analyzeCss(`.x { color: #3366ff; }`, "synthetic.css");
    expect(vs.some((x) => x.code === "§12")).toBe(true);
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
    expect(vs.some((x) => x.code === "§3")).toBe(true);
  });

  // §2 --accent-weak/--wairo-* を静的な区画の地に使う宣言の検出。
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
  test("§2 background 以外のプロパティに使う --wairo-* は対象外（誤検知しない）", () => {
    const vs = analyzeCss(
      `.barFill { background-color: var(--extra-fill); }
       .wrapper[data-color="kurenai"] { --extra-fill: var(--wairo-kurenai); }`,
      "synthetic.css",
    );
    expect(vs.filter((x) => x.code === "§2")).toEqual([]);
  });

  // 埋め込みデザイン面（middleware 410）の的を絞った検査の検出力。
  test("埋め込み面: 青の hex（#2563eb）を検出", () => {
    const vs = analyzeEmbeddedDesign(
      `body{background:#2563eb;color:#fff}`,
      "synthetic.ts",
    );
    expect(vs.some((x) => x.code === "§2")).toBe(true);
  });
  test("埋め込み面: 青紫 hue の色関数を検出", () => {
    const vs = analyzeEmbeddedDesign(
      `.x{color:oklch(0.6 0.2 270)}`,
      "synthetic.ts",
    );
    expect(vs.some((x) => x.code === "§2")).toBe(true);
  });
  test("埋め込み面: 非許容の角丸（8px）を検出", () => {
    const vs = analyzeEmbeddedDesign(`a{border-radius:8px}`, "synthetic.ts");
    expect(vs.some((x) => x.code === "§5")).toBe(true);
  });
  test("埋め込み面: 絵文字を検出", () => {
    const vs = analyzeEmbeddedDesign(`<a>トップへ ✨</a>`, "synthetic.ts");
    expect(vs.some((x) => x.code === "§5")).toBe(true);
  });
  test("埋め込み面: 青紫でない hex と角丸0は誤検知しない", () => {
    const vs = analyzeEmbeddedDesign(
      `body{background:#f8f7f2;color:#201e1a;border-top:1px solid #cdcac5}
       a.home{color:#af3622;border-radius:0}`,
      "synthetic.ts",
    );
    expect(vs.filter((x) => x.severity === "ERROR")).toEqual([]);
  });
  test("埋め込み面: 日本語（漢字/かな）は絵文字として誤検知しない", () => {
    const vs = analyzeEmbeddedDesign(
      `<h1>このコンテンツは終了しました</h1>`,
      "synthetic.ts",
    );
    expect(vs.filter((x) => x.code === "§5")).toEqual([]);
  });

  // 見出しの書体のウェイト（§3・§4）。
  test("見出しの書体を当てたルールの font-weight: 600 を検出", () => {
    const vs = analyzeHeadingWeightCss(
      `.character { font-family: var(--font-heading); font-weight: 600; }`,
      "synthetic.css",
    );
    expect(vs.some((x) => x.code === "§3")).toBe(true);
  });
  test("見出しの書体を当てたクラスへ別のルールで当てたウェイトを検出", () => {
    const vs = analyzeHeadingWeightCss(
      `.title { font-family: var(--font-heading); }
       @media (min-width: 45rem) { .title { font-weight: bold; } }`,
      "synthetic.css",
    );
    expect(vs.some((x) => x.code === "§3")).toBe(true);
  });
  test("h1〜h6 を要素セレクタで指すルールのウェイトを検出", () => {
    const vs = analyzeHeadingWeightCss(
      `.card h3 { font-weight: 700; }`,
      "synthetic.css",
    );
    expect(vs.some((x) => x.code === "§3")).toBe(true);
  });
  test("h1〜h6 に付けたクラスのウェイトを検出", () => {
    const css = `.heading { font-size: 1.5rem; font-weight: 600; }`;
    const vs = analyzeHeadingWeightTsx(
      `import styles from "./X.module.css";
       export const X = () => <h2 className={styles.heading}>見出し</h2>;`,
      "src/synthetic/X.tsx",
      (cssPath) => (cssPath === "src/synthetic/X.module.css" ? css : null),
    );
    expect(vs.some((x) => x.code === "§3")).toBe(true);
  });
  test("ウェイト 400 と、本文の書体へ替えたルールのウェイトは誤検知しない", () => {
    const css = `.heading { font-family: var(--font-heading); font-weight: 400; }
       .label { font-family: var(--font-body); font-weight: 700; }
       .h2Like { font-weight: 700; }`;
    expect(analyzeHeadingWeightCss(css, "synthetic.css")).toEqual([]);
    const vs = analyzeHeadingWeightTsx(
      `import styles from "./X.module.css";
       export const X = () => <h2 className={styles.label}>見出し</h2>;`,
      "src/synthetic/X.tsx",
      () => css,
    );
    expect(vs).toEqual([]);
  });
});
