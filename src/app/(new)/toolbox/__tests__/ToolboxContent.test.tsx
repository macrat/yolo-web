/**
 * ToolboxContent のユニットテスト（cycle-228 T-32 で34ツール規模に再設計）
 *
 * 設計原則:
 * - 「数合わせの空洞化」を排除: 「タイル数=39」だけのアサーションでなく、
 *   各ツールの distinct なシグナル（固有 aria-label・見出し・role 等）で
 *   「そのツールが実在し描画されている」を直接確認する。
 * - 34種の full タイル × 各1個 + 恒久配置の固定 variant 5枚 = 合計39枚を検証。
 * - 39タイルの render は重い（実測約20秒）ため、全アサーションを1回の render で完了させる。
 *   describe はグルーピングのみ。全 it が独立した render を呼ぶと合計60秒超になる。
 *
 * 検証観点:
 * - TB-1: 全34ツールの full タイルが各1枚描画されている
 *   （ツールごとの distinct シグナルで個別検証 + 合計枚数アサーション併用）
 * - TB-2: 恒久配置の固定 variant 5枚が実在する
 * - TB-3: カテゴリ見出し（<h2>）が存在する
 * - TB-4: タイルはリンク/カードではない（<a> タグ・role=link 不在）
 * - TB-5: ダミータイルが存在しない
 * - TB-6: 39インスタンス同居時の DOM id 重複ゼロ（useId 一意化の検証）
 * - TB-7: タイルラッパーがレスポンシブ幅（maxWidth）を使用している
 */
import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import ToolboxContent from "../ToolboxContent";

/**
 * 全検証を1回の render で完了する単一テスト。
 * 39タイルの render コスト（実測約20秒）を1回に抑えるため、
 * TB-1〜TB-7 の全アサーションをこの it に集約する。
 * タイムアウトは 60秒 に設定（デフォルト 15秒 を明示的に延長）。
 */
it("ToolboxContent: 全34ツール full タイル + 固定 variant 5枚 + 構造アサーション", () => {
  const { container } = render(<ToolboxContent />);

  // =========================================================================
  // TB-1: 全34ツールの full タイルが描画されている
  // =========================================================================

  // --- developer カテゴリ (12ツール) ---

  // color-converter: aria-label="入力モード" の radiogroup
  expect(screen.getByRole("radiogroup", { name: "入力モード" })).toBeTruthy();

  // cron-parser: aria-label="Cron式入力" の textbox
  expect(screen.getByRole("textbox", { name: "Cron式入力" })).toBeTruthy();

  // csv-converter: aria-label="入力形式" の combobox
  expect(screen.getByRole("combobox", { name: "入力形式" })).toBeTruthy();

  // date-calculator: aria-label="日付1" の type="date" input
  // type="date" は jsdom では spinbutton role に解釈されないため getByLabelText を使う
  expect(screen.getByLabelText("日付1")).toBeTruthy();

  // email-validator: aria-label="メールアドレスを入力" の textbox
  expect(
    screen.getByRole("textbox", { name: "メールアドレスを入力" }),
  ).toBeTruthy();

  // json-formatter: aria-label="インデント" の combobox（full + format-only + yaml で複数）
  const indents = screen.getAllByRole("combobox", { name: "インデント" });
  expect(indents.length).toBeGreaterThanOrEqual(1);

  // markdown-preview: aria-label="Markdown入力" の textbox
  expect(screen.getByRole("textbox", { name: "Markdown入力" })).toBeTruthy();

  // number-base-converter: aria-label="入力する進数" の radiogroup（full のみ表示）
  expect(screen.getByRole("radiogroup", { name: "入力する進数" })).toBeTruthy();

  // regex-tester: aria-label="正規表現パターン" の textbox
  expect(
    screen.getByRole("textbox", { name: "正規表現パターン" }),
  ).toBeTruthy();

  // sql-formatter: aria-label="SQL入力" の textbox
  expect(screen.getByRole("textbox", { name: "SQL入力" })).toBeTruthy();

  // unix-timestamp: aria-label="UNIXタイムスタンプ" の type="text" input
  // getByLabelText で要素タイプに依存せず取得する
  expect(screen.getByLabelText("UNIXタイムスタンプ")).toBeTruthy();

  // yaml-formatter: aria-label="モード" の combobox（yaml-formatter 固有）
  expect(screen.getByRole("combobox", { name: "モード" })).toBeTruthy();

  // --- text カテゴリ (9ツール) ---

  // business-email: aria-label="メールカテゴリ" の radiogroup
  expect(
    screen.getByRole("radiogroup", { name: "メールカテゴリ" }),
  ).toBeTruthy();

  // byte-counter: aria-label="バイト数計算結果" の region
  expect(screen.getByRole("region", { name: "バイト数計算結果" })).toBeTruthy();

  // char-count: aria-label="文字数カウント結果" の region
  expect(
    screen.getByRole("region", { name: "文字数カウント結果" }),
  ).toBeTruthy();

  // fullwidth-converter: aria-label="変換対象" の group（checkbox 群）
  const fullwidthGroups = screen.getAllByRole("group", { name: "変換対象" });
  expect(fullwidthGroups.length).toBeGreaterThanOrEqual(1);

  // kana-converter: aria-label="変換結果" の textbox（full + 固定 variant で複数）
  const kanaOutputs = screen.getAllByRole("textbox", { name: "変換結果" });
  expect(kanaOutputs.length).toBeGreaterThanOrEqual(1);

  // keigo-reference: aria-label="敬語を検索" の textbox
  expect(screen.getByRole("textbox", { name: "敬語を検索" })).toBeTruthy();

  // line-break-remover: aria-label="入力テキスト" の textbox
  const lineBreakInputs = screen.getAllByRole("textbox", {
    name: "入力テキスト",
  });
  expect(lineBreakInputs.length).toBeGreaterThanOrEqual(1);

  // text-diff: aria-label="変更前テキスト" の textbox
  expect(screen.getByRole("textbox", { name: "変更前テキスト" })).toBeTruthy();

  // text-replace: aria-label="検索文字列" の textbox（text-replace 固有）
  expect(screen.getByRole("textbox", { name: "検索文字列" })).toBeTruthy();

  // --- generator カテゴリ (7ツール) ---

  // age-calculator: aria-label="生年月日" の type="date" input（age-calculator 固有）
  // getByLabelText で要素タイプに依存せず取得する
  expect(screen.getByLabelText("生年月日")).toBeTruthy();

  // bmi-calculator: aria-label="身長（cm）" の spinbutton
  expect(screen.getByRole("spinbutton", { name: "身長（cm）" })).toBeTruthy();

  // dummy-text: aria-label="テキスト言語" の radiogroup
  expect(screen.getByRole("radiogroup", { name: "テキスト言語" })).toBeTruthy();

  // image-resizer: FileDropZone の description テキスト（image-resizer 固有の "最大20MB" 表記）。
  // 出力形式 Select は画像読込後にしか描画されないため常時表示の description を使う。
  // image-base64 の description は "最大10MB" と表記が異なり重複しない。
  expect(screen.getByText("PNG, JPEG, GIF, WebP対応 (最大20MB)")).toBeTruthy();

  // qr-code: aria-label="テキストまたはURL" の textbox
  expect(
    screen.getByRole("textbox", { name: "テキストまたはURL" }),
  ).toBeTruthy();

  // traditional-color-palette: aria-label="カテゴリフィルタ" の radiogroup
  expect(
    screen.getByRole("radiogroup", { name: "カテゴリフィルタ" }),
  ).toBeTruthy();

  // unit-converter: aria-label="変換する値" の spinbutton
  expect(screen.getByRole("spinbutton", { name: "変換する値" })).toBeTruthy();

  // --- encoding カテゴリ (4ツール) ---

  // base64: aria-label="Base64出力" の textbox（full の初期 encode 方向）
  const base64Outputs = screen.getAllByRole("textbox", {
    name: "Base64出力",
  });
  expect(base64Outputs.length).toBeGreaterThanOrEqual(1);

  // html-entity: aria-label="エンコード結果" の textbox
  const entityResults = screen.getAllByRole("textbox", {
    name: "エンコード結果",
  });
  expect(entityResults.length).toBeGreaterThanOrEqual(1);

  // image-base64: aria-label="変換モード" の radiogroup（full + encode で複数）
  const imageModeGroups = screen.getAllByRole("radiogroup", {
    name: "変換モード",
  });
  expect(imageModeGroups.length).toBeGreaterThanOrEqual(1);

  // url-encode: aria-label="入力" の textbox（full + encode 固定 variant で複数）
  const urlInputs = screen.getAllByRole("textbox", { name: "入力" });
  expect(urlInputs.length).toBeGreaterThanOrEqual(1);

  // --- security カテゴリ (2ツール) ---

  // hash-generator: placeholder="ハッシュ化するテキストを入力..." の textbox（hash-generator 固有）。
  // 「出力形式」combobox は csv-converter と共有されるため placeholder で識別する。
  expect(
    screen.getByPlaceholderText("ハッシュ化するテキストを入力..."),
  ).toBeTruthy();

  // password-generator: 「パスワード生成」ボタン（password-generator 固有のボタンテキスト）。
  // role="status" は33ツールが共有するため固有シグナルにならない。
  expect(screen.getByRole("button", { name: "パスワード生成" })).toBeTruthy();

  // --- 合計枚数（数アサーション: distinct シグナルと併用）---
  const wrappers = container.querySelectorAll("[class*='tileWrapper']");
  expect(wrappers).toHaveLength(39);

  // =========================================================================
  // TB-2: 恒久配置の固定 variant 5枚が実在する
  // =========================================================================

  // url-encode encode: 「入力」textbox が full + encode = ≥2 存在する
  expect(urlInputs.length).toBeGreaterThanOrEqual(2);

  // kana-converter hiragana-to-katakana: 「変換結果」textbox が full + 固定 = ≥2 存在する
  expect(kanaOutputs.length).toBeGreaterThanOrEqual(2);

  // number-base-converter bin-hex: aria-label="変換する数値（2進数）" が存在する
  // bin-hex では radiogroup が非表示になり「2進数 → 16進数」固定ラベルに変わる
  expect(screen.getByLabelText("変換する数値（2進数）")).toBeTruthy();

  // json-formatter format-only: 「インデント」combobox が full + format-only + yaml = ≥2 存在する
  expect(indents.length).toBeGreaterThanOrEqual(2);

  // image-base64 encode: 「変換モード」radiogroup が full + encode = ≥2 存在する
  expect(imageModeGroups.length).toBeGreaterThanOrEqual(2);

  // =========================================================================
  // TB-3: カテゴリ見出し（<h2>）が存在する
  // =========================================================================

  const headings = screen.getAllByRole("heading", { level: 2 });
  expect(headings.length).toBeGreaterThanOrEqual(5);
  expect(screen.getByRole("heading", { name: "developer" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "text" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "generator" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "encoding" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "security" })).toBeTruthy();

  // =========================================================================
  // TB-4: タイルはリンク/カードではない（ページ遷移なしの構造的確認）
  // =========================================================================

  expect(container.querySelectorAll("a")).toHaveLength(0);
  expect(screen.queryAllByRole("link")).toHaveLength(0);

  // =========================================================================
  // TB-5: ダミータイルが存在しない
  // =========================================================================

  expect(screen.queryAllByText("（準備中のタイル）")).toHaveLength(0);

  // =========================================================================
  // TB-6: 39インスタンス同居時の DOM id 重複ゼロ（useId 一意化の検証）
  // =========================================================================

  const allIds = [...container.querySelectorAll("[id]")].map((el) => el.id);
  expect(allIds.length).toBeGreaterThan(0);
  const uniqueIds = new Set(allIds);
  expect(uniqueIds.size).toBe(allIds.length);

  // =========================================================================
  // TB-7: タイルラッパーがレスポンシブ幅（maxWidth）を使用している
  // =========================================================================

  const wrapperEls = container.querySelectorAll<HTMLElement>(
    "[class*='tileWrapper']",
  );
  expect(wrapperEls.length).toBeGreaterThan(0);
  wrapperEls.forEach((wrapper) => {
    expect(wrapper.style.width).toBeFalsy();
    expect(wrapper.style.maxWidth).toBeTruthy();
  });
}, 60000); // タイムアウト: 39タイルの render は 約20秒、余裕を持って 60秒
