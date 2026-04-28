/**
 * cycle-170 C-1 受け入れ基準テスト
 *
 * C-1 タスクの受け入れ基準（cycle-170.md C-1 節）を自動検証する:
 *
 * 1. CSS / TSX の実コード部分に未定義変数のフォールバック参照がないこと
 * 2. var(--color-) 旧変数の参照が 0 件
 * 3. CSS ファイルの実コード部分に直値 (#xxx, Npx, Nrem 等) がないこと
 * 4. <p style={...}> のインライン style が 0 件（TSX コメントを除く）
 * 5. .section / .preview の独自 CSS クラスが削除されていること
 * 6. design-system 7 部品 (Button/Input/Textarea/Panel/SectionHead/SiteHeader/SiteFooter) が import されている
 * 7. ArticleArea の import がないこと（コメントは許可、import 文は禁止）
 */
import { expect, test } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const devPreviewDir = resolve(__dirname, "..");

function readFile(filename: string): string {
  return readFileSync(resolve(devPreviewDir, filename), "utf-8");
}

/**
 * CSS ファイルのコメントブロックを除去した実コード部分を返す。
 * CSS コメント /* ... *\/ を除去してから空行を詰める。
 */
function removeCssComments(css: string): string {
  // CSS ブロックコメントを除去
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/**
 * TSX / TS ファイルのコメント部分を除去した実コード部分を返す。
 * ブロックコメント /* ... *\/ と行コメント // ... を除去する。
 */
function removeTsxComments(code: string): string {
  // JSX コメント {/* ... */} を除去
  let result = code.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  // ブロックコメント /* ... */ を除去
  result = result.replace(/\/\*[\s\S]*?\*\//g, "");
  // 行コメント // ... を除去
  result = result.replace(/\/\/.*/g, "");
  return result;
}

function readCssFilesCode(): string {
  const files = [
    "page.module.css",
    "DevComponents.module.css",
    "layout.module.css",
  ].map((f) => {
    try {
      return removeCssComments(readFile(f));
    } catch {
      return ""; // ファイルが削除されていれば空文字
    }
  });
  return files.join("\n");
}

function readAllDevPreviewCode(): string {
  const cssCode = readCssFilesCode();
  const pageTsxCode = removeTsxComments(readFile("page.tsx"));
  const devComponentsTsxCode = removeTsxComments(readFile("DevComponents.tsx"));
  return `${cssCode}\n${pageTsxCode}\n${devComponentsTsxCode}`;
}

// ---------------------------------------------------------------
// 1. フォールバック付き未定義変数参照がないこと（コメント除外後に検証）
//    M-1 対応: CSS ファイル全体でフォールバック付き var() が一切ないことを検証する。
//    var(--bg-soft, #f4f4f1) のような「定義済み変数に無用なフォールバック」も禁止。
//    理由: C-1 受け入れ基準は「フォールバック値付き参照が 0 件」であり、
//    globals.css に定義済みの変数であっても、フォールバック値の記述自体を禁止している。
// ---------------------------------------------------------------
test("CSS Modules 実コードにフォールバック付き var() がないこと（M-1 対応）", () => {
  const cssCode = readCssFilesCode();
  // var(--xxx, fallback) パターン: カンマがあればフォールバック付き
  const fallbackMatches = cssCode.match(/var\(--[^,)]+,[^)]+\)/g) ?? [];
  expect(fallbackMatches).toHaveLength(0);
});

test("dev-preview 実コードに var(--radius-md, ...) のフォールバック参照がないこと", () => {
  const code = readAllDevPreviewCode();
  expect(code).not.toMatch(/var\(--radius-md/);
});

test("dev-preview 実コードに var(--type-lg, ...) のフォールバック参照がないこと", () => {
  const code = readAllDevPreviewCode();
  expect(code).not.toMatch(/var\(--type-lg/);
});

test("dev-preview 実コードに var(--type-sm, ...) のフォールバック参照がないこと", () => {
  const code = readAllDevPreviewCode();
  expect(code).not.toMatch(/var\(--type-sm/);
});

test("dev-preview 実コードに var(--sp-12, ...) のフォールバック参照がないこと", () => {
  const code = readAllDevPreviewCode();
  expect(code).not.toMatch(/var\(--sp-12/);
});

// ---------------------------------------------------------------
// 2. var(--color-) の旧変数参照がないこと（コメント除外後に検証）
// ---------------------------------------------------------------
test("dev-preview 実コードに var(--color- の参照がないこと", () => {
  const code = readAllDevPreviewCode();
  expect(code).not.toMatch(/var\(--color-/);
});

// ---------------------------------------------------------------
// 3. CSS ファイルの実コード部分に直値がないこと
//    M-1 対応: ': #xxx' パターン限定から「行内のどこにあっても検出」に拡張。
//    var(--bg-soft, #f4f4f1) のようなフォールバック内の直値も検出できる。
//    参考: AP-WF09「形式的チェック通過の回避」
// ---------------------------------------------------------------
test("CSS Modules 実コードに 16 進数カラーコード (#xxx) がないこと", () => {
  const cssCode = readCssFilesCode();
  // ': #xxx' 限定ではなく、行内のいかなる位置の #xxx も検出する（M-1 対応）。
  // var(--bg-soft, #f4f4f1) のフォールバック内直値も含む。
  // セレクタ内の # (例: #id-selector) と区別するため、
  // 「# の直後が 3〜8 桁の hex 文字列」かつ「英字で終わらない」（id セレクタは英字や - が続く）
  // というパターンを使う。CSS Modules ではクラスセレクタのみなので id セレクタは出ないが、
  // 安全のため hex 文字パターンを 3〜8 桁の連続 hex 数字に限定する。
  const hexMatches = cssCode.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
  // oklch() / hsl() 等の中の値は # を含まないため、ここでは hex カラー直値のみ対象
  expect(hexMatches).toHaveLength(0);
});

test("CSS Modules 実コードに直値 rem がないこと", () => {
  const cssCode = readCssFilesCode();
  // M-1 対応: ': ' 限定から行内の全 rem 値検出に拡張。
  // var(--sp-3, 0.75rem) のフォールバック内直値も含む。
  const remMatches = cssCode.match(/[\d.]+rem/g) ?? [];
  expect(remMatches).toHaveLength(0);
});

test("CSS Modules 実コードに 2px 以上の直値 px がないこと（border の 1px は許容）", () => {
  const cssCode = readCssFilesCode();
  // M-1 対応: ': ' 限定から行内の全 px 値検出に拡張。
  // var(--radius-md, 6px) のフォールバック内 px 直値も含む。
  // border プロパティの 1px 指定は設計上許容（thin hairline として慣例的）。
  const pxMatches = (cssCode.match(/\d+px/g) ?? []).filter((m) => {
    const num = parseInt(m, 10);
    return num >= 2; // 1px (border hairline) を許容、2px 以上を直値として禁止
  });
  expect(pxMatches).toHaveLength(0);
});

// ---------------------------------------------------------------
// 4. インライン style オブジェクトリテラルがないこと（コメント除外後に検証）
//    style={{ ... }} のようなオブジェクトリテラル直書きを禁止する。
//    style={LABEL_STYLE} のような定数参照は許容（B-1 候補 69-71 対応で使用）。
// ---------------------------------------------------------------
test("DevComponents.tsx 実コードに style={{ ... }} のオブジェクトリテラル直書きがないこと", () => {
  const devComponentsCode = removeTsxComments(readFile("DevComponents.tsx"));
  // style={{ ... }} パターン（オブジェクトリテラル直書き）を禁止
  // style={CONSTANT} のような定数参照は許容
  expect(devComponentsCode).not.toMatch(/style\s*=\s*\{\{/);
});

test("page.tsx 実コードに style={{ ... }} のオブジェクトリテラル直書きがないこと", () => {
  const pageTsxCode = removeTsxComments(readFile("page.tsx"));
  expect(pageTsxCode).not.toMatch(/style\s*=\s*\{\{/);
});

// ---------------------------------------------------------------
// 5. .section / .preview の独自クラスが module.css から削除されていること
//    (Panel に置き換えられたため)
//    m-2 対応: 先頭マッチ限定 /^\.section\s*\{/ から複合セレクタも検出できるパターンに拡張。
// ---------------------------------------------------------------
test("DevComponents.module.css に .section セレクタがないこと", () => {
  let content = "";
  try {
    content = removeCssComments(readFile("DevComponents.module.css"));
  } catch {
    // ファイルが削除されていれば OK
    return;
  }
  // m-2 対応: /^\.section\s*\{/m（先頭のみ）から
  // 行頭・複合セレクタ・インデント付きのいずれも検出できる形に拡張
  expect(content).not.toMatch(/\.section[\s,{]/);
});

test("DevComponents.module.css に .preview セレクタがないこと", () => {
  let content = "";
  try {
    content = removeCssComments(readFile("DevComponents.module.css"));
  } catch {
    return;
  }
  // m-2 対応: 先頭マッチ限定から拡張
  expect(content).not.toMatch(/\.preview[\s,{]/);
});

test("page.module.css の .pageHeader はレイアウト指定のみで背景/ボーダー定義がないこと", () => {
  // .pageHeader は Panel(variant=inset) の位置調整用として残るが、
  // background / border-radius / border-color の独自定義は禁止
  let content = "";
  try {
    content = removeCssComments(readFile("page.module.css"));
  } catch {
    return;
  }
  // .pageHeader ブロックを抽出して background / border-radius の直値定義を確認
  const pageHeaderBlock =
    content.match(/\.pageHeader\s*\{([^}]*)\}/)?.[1] ?? "";
  expect(pageHeaderBlock).not.toMatch(/background\s*:/);
  expect(pageHeaderBlock).not.toMatch(/border-radius\s*:/);
  expect(pageHeaderBlock).not.toMatch(/border\s*:\s*\d/); // border: 1px... のような直値定義
});

// ---------------------------------------------------------------
// 5b. M-2 対応: .row / .column / .label が CSS Modules から廃止されていること
//     B-1 候補 69-71「インライン HTML + 既存変数で済む」判定の実装確認
// ---------------------------------------------------------------
test("DevComponents.module.css に .row セレクタがないこと（インライン style 定数に移行済み）", () => {
  let content = "";
  try {
    content = removeCssComments(readFile("DevComponents.module.css"));
  } catch {
    return;
  }
  expect(content).not.toMatch(/\.row[\s,{]/);
});

test("DevComponents.module.css に .column セレクタがないこと（インライン style 定数に移行済み）", () => {
  let content = "";
  try {
    content = removeCssComments(readFile("DevComponents.module.css"));
  } catch {
    return;
  }
  expect(content).not.toMatch(/\.column[\s,{]/);
});

test("DevComponents.module.css に .label セレクタがないこと（インライン style 定数に移行済み）", () => {
  let content = "";
  try {
    content = removeCssComments(readFile("DevComponents.module.css"));
  } catch {
    return;
  }
  expect(content).not.toMatch(/\.label[\s,{]/);
});

// ---------------------------------------------------------------
// 6. design-system 7 部品が DevComponents.tsx に import されていること
// ---------------------------------------------------------------
const DESIGN_SYSTEM_COMPONENTS = [
  "Button",
  "Input",
  "Textarea",
  "Panel",
  "SectionHead",
  "SiteHeader",
  "SiteFooter",
] as const;

for (const component of DESIGN_SYSTEM_COMPONENTS) {
  test(`DevComponents.tsx に ${component} が import されていること`, () => {
    const devComponents = readFile("DevComponents.tsx");
    expect(devComponents).toContain(
      `import ${component} from "@/components/design-system/${component}"`,
    );
  });
}

// ---------------------------------------------------------------
// 7. ArticleArea の import がないこと（コメントは許可、import 文は禁止）
// ---------------------------------------------------------------
test("DevComponents.tsx に ArticleArea の import 文がないこと", () => {
  const devComponents = readFile("DevComponents.tsx");
  // import ArticleArea from ... のパターン
  expect(devComponents).not.toMatch(/^import\s+ArticleArea\s+from/m);
});

test("page.tsx に ArticleArea の import 文がないこと", () => {
  const pageTsx = readFile("page.tsx");
  expect(pageTsx).not.toMatch(/^import\s+ArticleArea\s+from/m);
});
