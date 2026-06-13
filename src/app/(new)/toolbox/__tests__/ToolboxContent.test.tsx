/**
 * ToolboxContent のユニットテスト（cycle-228 T-32 で34ツール規模に再設計、
 * cycle-230 T-6 で中核機構＝追加・削除・永続化の検証を追加、
 * cycle-232 T-3 でデフォルト構成 = daily-life プリセット6枚へ変更）
 *
 * 設計原則:
 * - 「数合わせの空洞化」を排除: 「タイル数=n」だけのアサーションでなく、
 *   各ツールの distinct なシグナル（固有 aria-label・見出し・role 等）で
 *   「そのツールが実在し描画されている」を直接確認する。
 * - デフォルト構成は daily-life 6枚のため通常の render は軽い。全40枚の
 *   render（実測約20秒）が必要な検証（TB-1/TB-2/TB-6）は保存構成として
 *   全カタログを仕込む1つの it に集約する。
 *
 * 検証観点:
 * - TB-0: デフォルト構成（daily-life 6枚）が設計順・単一グリッドで描画され、
 *   daily-life が「適用中」・リセット無効・全カタログが追加候補になる
 * - TB-1: 全35ツールの full タイルが描画できる（全40枚構成で個別検証）
 * - TB-2: 恒久配置の固定 variant 5枚が実在する
 * - TB-3: 構成にカテゴリ見出しを挟まない（全40枚構成でも単一グリッド。
 *   cycle-232 の表示モデル再整理）
 * - TB-4: タイルはリンク/カードではない（<a> タグ・role=link 不在）
 * - TB-5: ダミータイルが存在しない
 * - TB-6: 39インスタンス同居時の DOM id 重複ゼロ（useId 一意化の検証）
 * - TB-7: タイルラッパーがレスポンシブ幅（maxWidth）を使用している
 * - TB-8: タイルの削除・追加（末尾）・リセット（daily-life へ復帰）が動き、
 *   構成が localStorage に反映される
 * - TB-9: 保存済み構成（未知 id 除去込み）がマウント後に適用され、
 *   デフォルト構成の定義変更（daily-life 化）に影響されない
 * - TB-10: プリセット選択（適用・保存・設計順どおりの表示・「適用中」表示・
 *   手作業構成の上書き確認・既存の追加/削除/リセットとの相互作用）
 * - TB-11: GA4 構成操作イベント（追加・削除・リセット・プリセット適用。
 *   item_id = slug / variant 分離、確認キャンセルの不送信。cycle-234 T-3）
 * - TB-12: GA4 tile_first_interaction（タイル本体操作で送信・toolbar 操作は
 *   不送信・マウント中はタイルごとに 1 回だけ＝remount 後も再送しない。
 *   cycle-234 T-4）
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, it, expect, vi } from "vitest";
import {
  trackTileFirstInteraction,
  trackToolboxPresetSelect,
  trackToolboxReset,
  trackToolboxTileAdd,
  trackToolboxTileRemove,
} from "@/lib/analytics";
import ToolboxContent from "../ToolboxContent";
import {
  TOOLBOX_CATALOG,
  TOOLBOX_CATALOG_BY_ID,
  TOOLBOX_CATEGORY_ORDER,
} from "../toolbox-catalog";
import {
  DEFAULT_TOOLBOX_ITEM_IDS,
  DEFAULT_TOOLBOX_PRESET,
  TOOLBOX_PRESETS,
} from "../toolbox-presets";
import {
  TOOLBOX_SCHEMA_VERSION,
  TOOLBOX_STORAGE_KEY,
} from "../toolbox-storage";

// GA4 計測（cycle-234）のモック。track 関数だけ差し替え、他のエクスポートは
// 実体のまま残す（タイル等が将来 analytics の別関数を import しても壊れない）
vi.mock("@/lib/analytics", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/analytics")>();
  return {
    ...actual,
    trackTileFirstInteraction: vi.fn(),
    trackToolboxPresetSelect: vi.fn(),
    trackToolboxReset: vi.fn(),
    trackToolboxTileAdd: vi.fn(),
    trackToolboxTileRemove: vi.fn(),
  };
});

const mockTileFirstInteraction = vi.mocked(trackTileFirstInteraction);
const mockPresetSelect = vi.mocked(trackToolboxPresetSelect);
const mockReset = vi.mocked(trackToolboxReset);
const mockTileAdd = vi.mocked(trackToolboxTileAdd);
const mockTileRemove = vi.mocked(trackToolboxTileRemove);

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

/** 道具箱に並ぶタイルの「外す」ボタンの aria-label を DOM 順で返す（表示順の検証用） */
function removeButtonLabels(): (string | null)[] {
  return screen
    .getAllByRole("button", { name: /を道具箱から外す$/ })
    .map((button) => button.getAttribute("aria-label"));
}

/** itemIds から期待される「外す」ボタンの aria-label 列を組み立てる */
function expectedRemoveLabels(ids: readonly string[]): string[] {
  return ids.map(
    (id) => `${TOOLBOX_CATALOG_BY_ID.get(id)?.displayLabel}を道具箱から外す`,
  );
}

/** カテゴリ見出し（内部タクソノミの h2）が1つも表示されていないことを検証する */
function expectNoCategoryHeadings(): void {
  for (const category of TOOLBOX_CATEGORY_ORDER) {
    expect(screen.queryByRole("heading", { name: category })).toBeNull();
  }
}

/**
 * TB-0: デフォルト構成（daily-life プリセット6枚）。
 * 初回来訪者（localStorage なし）が見る状態をまとめて検証する。
 */
it("ToolboxContent: デフォルト構成は daily-life 6枚（設計順・単一グリッド・適用中表示）", () => {
  const { container } = render(<ToolboxContent />);

  // --- 枚数と並び順（daily-life プリセットの設計順そのまま） ---
  expect(container.querySelectorAll("[class*='tileWrapper']")).toHaveLength(
    DEFAULT_TOOLBOX_ITEM_IDS.length,
  );
  expect(removeButtonLabels()).toEqual(
    expectedRemoveLabels(DEFAULT_TOOLBOX_ITEM_IDS),
  );

  // --- 6ツールの distinct シグナル（生きたタイルとして描画されている） ---
  // unit-converter: aria-label="変換する値" の spinbutton
  expect(screen.getByRole("spinbutton", { name: "変換する値" })).toBeTruthy();
  // age-calculator: aria-label="生年月日"（type="date" は jsdom で role を持たない）
  expect(screen.getByLabelText("生年月日")).toBeTruthy();
  // bmi-calculator: aria-label="身長（cm）" の spinbutton
  expect(screen.getByRole("spinbutton", { name: "身長（cm）" })).toBeTruthy();
  // password-generator: 固有のボタンテキスト
  expect(screen.getByRole("button", { name: "パスワード生成" })).toBeTruthy();
  // qr-code: aria-label="テキストまたはURL" の textbox
  expect(
    screen.getByRole("textbox", { name: "テキストまたはURL" }),
  ).toBeTruthy();
  // image-resizer: FileDropZone の固有 description（"最大20MB" 表記）
  expect(screen.getByText("PNG, JPEG, GIF, WebP対応 (最大20MB)")).toBeTruthy();

  // --- 単一グリッド（カテゴリ見出しなし） ---
  expectNoCategoryHeadings();

  // --- プリセット UI: daily-life が「適用中」、他は適用ボタン ---
  expect(screen.getAllByText("適用中")).toHaveLength(1);
  expect(
    screen.getAllByRole("button", {
      name: /^プリセット「.+」を道具箱に適用$/,
    }),
  ).toHaveLength(TOOLBOX_PRESETS.length - 1);
  expect(
    screen.queryByRole("button", {
      name: `プリセット「${DEFAULT_TOOLBOX_PRESET.name}」を道具箱に適用`,
    }),
  ).toBeNull();

  // --- リセット: デフォルトでは無効。文言が実態（daily-life）と一致 ---
  expect(
    screen.getByRole("button", { name: "最初の状態に戻す" }),
  ).toBeDisabled();
  const expectedResetNote = `道具箱を最初の構成（プリセット「${DEFAULT_TOOLBOX_PRESET.name}」・${DEFAULT_TOOLBOX_ITEM_IDS.length}枚）に戻します。`;
  expect(
    screen.getByText(
      (_, element) =>
        element?.tagName === "SPAN" &&
        element.textContent === expectedResetNote,
    ),
  ).toBeTruthy();

  // --- 全カタログへの到達: 残り33枚すべてが「タイルを追加」候補に並ぶ ---
  expect(
    screen.getAllByRole("button", { name: /を道具箱に追加$/ }),
  ).toHaveLength(TOOLBOX_CATALOG.length - DEFAULT_TOOLBOX_ITEM_IDS.length);

  // --- TB-4: タイルはリンク/カードではない ---
  expect(container.querySelectorAll("a")).toHaveLength(0);
  expect(screen.queryAllByRole("link")).toHaveLength(0);

  // --- TB-5: ダミータイルが存在しない ---
  expect(screen.queryAllByText("（準備中のタイル）")).toHaveLength(0);

  // --- TB-7: タイルラッパーがレスポンシブ幅（maxWidth）を使用している ---
  const wrapperEls = container.querySelectorAll<HTMLElement>(
    "[class*='tileWrapper']",
  );
  expect(wrapperEls.length).toBeGreaterThan(0);
  wrapperEls.forEach((wrapper) => {
    expect(wrapper.style.width).toBeFalsy();
    expect(wrapper.style.maxWidth).toBeTruthy();
  });

  // --- DOM id 重複ゼロ（デフォルト6枚時） ---
  const allIds = [...container.querySelectorAll("[id]")].map((el) => el.id);
  expect(new Set(allIds).size).toBe(allIds.length);
}, 60000);

/**
 * TB-1/TB-2/TB-3/TB-6: 全40枚（カタログ全量）の構成。
 *
 * cycle-231 以前にカタログ全40枚の構成を保存した既存来訪者を兼ねた検証:
 * デフォルト定義が daily-life に変わっても、保存済みの全40枚構成は
 * そのまま尊重される（壊れない）。
 * 39タイルの render は重い（実測約20秒）ため、全アサーションを
 * この1つの it に集約する。
 */
it("ToolboxContent: 全40枚の保存構成で全35ツール full + 固定 variant 5枚が描画される", () => {
  window.localStorage.setItem(
    TOOLBOX_STORAGE_KEY,
    JSON.stringify({
      version: TOOLBOX_SCHEMA_VERSION,
      items: TOOLBOX_CATALOG.map((entry) => entry.id),
    }),
  );

  const { container } = render(<ToolboxContent />);

  // =========================================================================
  // TB-1: 全35ツールの full タイルが描画されている
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

  // yoji-search: aria-label="四字熟語を検索" の searchbox
  expect(
    screen.getByRole("searchbox", { name: "四字熟語を検索" }),
  ).toBeTruthy();

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
  expect(screen.getByRole("button", { name: "パスワード生成" })).toBeTruthy();

  // --- 合計枚数（数アサーション: distinct シグナルと併用）---
  const wrappers = container.querySelectorAll("[class*='tileWrapper']");
  expect(wrappers).toHaveLength(TOOLBOX_CATALOG.length);

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
  // TB-3: 全40枚の構成でもカテゴリ見出しを挟まない単一グリッド
  // （cycle-232 表示モデル再整理: 全40枚はもはやデフォルト特例ではなく、
  //   来訪者が組んだ構成のひとつとして itemIds の順序どおりに描画する）
  // =========================================================================

  expectNoCategoryHeadings();
  expect(removeButtonLabels()).toEqual(
    expectedRemoveLabels(TOOLBOX_CATALOG.map((entry) => entry.id)),
  );

  // 保存構成はデフォルトと異なるため、リセット（daily-life へ戻す）は有効
  expect(
    screen.getByRole("button", { name: "最初の状態に戻す" }),
  ).toBeEnabled();

  // =========================================================================
  // TB-4/TB-5: タイルはリンク/カードではない・ダミータイルなし（39枚時）
  // =========================================================================

  expect(container.querySelectorAll("a")).toHaveLength(0);
  expect(screen.queryAllByRole("link")).toHaveLength(0);
  expect(screen.queryAllByText("（準備中のタイル）")).toHaveLength(0);

  // =========================================================================
  // TB-6: 39インスタンス同居時の DOM id 重複ゼロ（useId 一意化の検証）
  // =========================================================================

  const allIds = [...container.querySelectorAll("[id]")].map((el) => el.id);
  expect(allIds.length).toBeGreaterThan(0);
  const uniqueIds = new Set(allIds);
  expect(uniqueIds.size).toBe(allIds.length);

  // =========================================================================
  // TB-7: タイルラッパーがレスポンシブ幅（maxWidth）を使用している（39枚時）
  // =========================================================================

  const wrapperEls = container.querySelectorAll<HTMLElement>(
    "[class*='tileWrapper']",
  );
  expect(wrapperEls.length).toBeGreaterThan(0);
  wrapperEls.forEach((wrapper) => {
    expect(wrapper.style.width).toBeFalsy();
    expect(wrapper.style.maxWidth).toBeTruthy();
  });
}, 120000); // タイムアウト: 39タイルの render 約20秒を考慮して 120秒

/**
 * TB-8: タイルの削除・追加・リセット（cycle-230 中核機構）。
 * デフォルト構成（daily-life 6枚）を起点に
 * 「外す → 追加で復帰（末尾） → リセットで daily-life へ復帰」を連続検証する。
 */
it("ToolboxContent: タイルの削除・追加（末尾）・リセット（daily-life へ復帰）", () => {
  const { container } = render(<ToolboxContent />);

  const countTiles = (): number =>
    container.querySelectorAll("[class*='tileWrapper']").length;
  const readStored = (): { version: number; items: string[] } =>
    JSON.parse(window.localStorage.getItem(TOOLBOX_STORAGE_KEY) as string) as {
      version: number;
      items: string[];
    };

  // 操作対象: daily-life に含まれる qr-code:full
  const removeLabel = "QRコード生成を道具箱から外す";
  const addLabel = "QRコード生成を道具箱に追加";

  // --- 外す: 枚数が減り、localStorage に反映され、「追加」候補に現れる。
  //     プリセット完全一致が崩れるため「適用中」表示も消える ---
  fireEvent.click(screen.getByRole("button", { name: removeLabel }));
  expect(countTiles()).toBe(DEFAULT_TOOLBOX_ITEM_IDS.length - 1);
  const afterRemove = readStored();
  expect(afterRemove.version).toBe(TOOLBOX_SCHEMA_VERSION);
  expect(afterRemove.items).toHaveLength(DEFAULT_TOOLBOX_ITEM_IDS.length - 1);
  expect(afterRemove.items).not.toContain("qr-code:full");
  expect(screen.queryByRole("button", { name: removeLabel })).toBeNull();
  expect(screen.getByRole("button", { name: addLabel })).toBeTruthy();
  expect(screen.queryByText("適用中")).toBeNull();

  // --- 追加で復帰: 末尾に追加される（構成の並びの途中に割り込まない） ---
  fireEvent.click(screen.getByRole("button", { name: addLabel }));
  expect(countTiles()).toBe(DEFAULT_TOOLBOX_ITEM_IDS.length);
  expect(readStored().items).toEqual([
    ...DEFAULT_TOOLBOX_ITEM_IDS.filter((id) => id !== "qr-code:full"),
    "qr-code:full",
  ]);
  expect(screen.getByRole("button", { name: removeLabel })).toBeTruthy();

  // --- リセット: 「最初の状態に戻す」でデフォルト（daily-life）へ復帰し、
  //     保存が消え、daily-life が再び「適用中」になる ---
  expect(
    screen.getByRole("button", { name: "最初の状態に戻す" }),
  ).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "最初の状態に戻す" }));
  expect(countTiles()).toBe(DEFAULT_TOOLBOX_ITEM_IDS.length);
  expect(removeButtonLabels()).toEqual(
    expectedRemoveLabels(DEFAULT_TOOLBOX_ITEM_IDS),
  );
  expect(window.localStorage.getItem(TOOLBOX_STORAGE_KEY)).toBeNull();
  expect(
    screen.getByRole("button", { name: "最初の状態に戻す" }),
  ).toBeDisabled();
  expect(screen.getAllByText("適用中")).toHaveLength(1);
}, 60000);

/**
 * 空状態への到達（T-6 r1 N-2）: デフォルトが daily-life 6枚になったことで
 * 「全タイルを外して空にする」が現実的な操作距離になった。全部外したときに
 * 空状態の案内（プリセット・追加パネルへの導線）が表示され、空構成が
 * 保存されることを固定する。
 */
it("ToolboxContent: デフォルト6枚をすべて外すと空状態の案内が表示される", () => {
  const { container } = render(<ToolboxContent />);

  for (const id of DEFAULT_TOOLBOX_ITEM_IDS) {
    const label = `${TOOLBOX_CATALOG_BY_ID.get(id)?.displayLabel}を道具箱から外す`;
    fireEvent.click(screen.getByRole("button", { name: label }));
  }

  // タイルがゼロになり、空状態の案内メッセージが表示される
  expect(container.querySelectorAll("[class*='tileWrapper']")).toHaveLength(0);
  expect(screen.getByText(/道具箱が空です/)).toBeTruthy();

  // 空配列が「意図して空にした構成」として保存される（再訪問でも尊重される）
  expect(
    (
      JSON.parse(
        window.localStorage.getItem(TOOLBOX_STORAGE_KEY) as string,
      ) as { version: number; items: string[] }
    ).items,
  ).toEqual([]);

  // 案内どおりの復帰手段が生きている: 全40枚が追加候補・リセットも有効
  expect(
    screen.getAllByRole("button", { name: /を道具箱に追加$/ }),
  ).toHaveLength(TOOLBOX_CATALOG.length);
  expect(
    screen.getByRole("button", { name: "最初の状態に戻す" }),
  ).toBeEnabled();
}, 60000);

/**
 * TB-9: 保存済み構成の復元（cycle-230 中核機構の永続化側）。
 *
 * マウント前に localStorage を仕込む必要があるため別 render とする。
 * hydration 安全設計により初回レンダーは常にデフォルト（daily-life 6枚）→
 * マウント後の useEffect で保存構成（2枚）へ縮退することを検証する。
 * 未知 id が混入していても黙って除去される（ツール削除後の再訪問を想定）。
 * デフォルト構成の定義が daily-life に変わっても、保存済み構成が
 * そのまま尊重される（デフォルト変更は「保存がない人」だけに影響する）。
 */
it("ToolboxContent: 保存済み構成（未知 id 除去込み）がマウント後に適用される", () => {
  window.localStorage.setItem(
    TOOLBOX_STORAGE_KEY,
    JSON.stringify({
      version: TOOLBOX_SCHEMA_VERSION,
      items: ["char-count:full", "retired-tool:full", "qr-code:full"],
    }),
  );

  const { container } = render(<ToolboxContent />);

  // 保存構成の2枚だけが残る（未知 id "retired-tool:full" は除去）
  expect(container.querySelectorAll("[class*='tileWrapper']")).toHaveLength(2);
  expect(
    screen.getByRole("region", { name: "文字数カウント結果" }),
  ).toBeTruthy();
  expect(
    screen.getByRole("textbox", { name: "テキストまたはURL" }),
  ).toBeTruthy();

  // カテゴリ見出しを挟まず、保存された順序どおりに描画する
  expectNoCategoryHeadings();
  expect(removeButtonLabels()).toEqual(
    expectedRemoveLabels(["char-count:full", "qr-code:full"]),
  );

  // 外した37枚は「追加」候補に並び、リセット（daily-life へ戻す）は有効
  expect(
    screen.getAllByRole("button", { name: /を道具箱に追加$/ }),
  ).toHaveLength(TOOLBOX_CATALOG.length - 2);
  expect(
    screen.getByRole("button", { name: "最初の状態に戻す" }),
  ).toBeEnabled();
}, 60000);

/**
 * TB-10: プリセット選択（オンボーディング動線）。
 *
 * 1つの render の中で操作フローを連続検証する:
 * 即時適用（デフォルト=daily-life から）→ 即時適用（プリセット間の乗り換え）→
 * 手作業構成からの上書き確認（確認対象の切り替え・キャンセル・確定）→
 * 構成変更による確認の自動クローズ → リセットとの相互作用。
 */
it("ToolboxContent: プリセット選択（適用・保存・上書き確認・既存操作との相互作用）", () => {
  const { container } = render(<ToolboxContent />);

  const countTiles = (): number =>
    container.querySelectorAll("[class*='tileWrapper']").length;
  const readStoredItems = (): string[] =>
    (
      JSON.parse(
        window.localStorage.getItem(TOOLBOX_STORAGE_KEY) as string,
      ) as { version: number; items: string[] }
    ).items;
  const presetApplyButton = (name: string) =>
    screen.getByRole("button", {
      name: `プリセット「${name}」を道具箱に適用`,
    });
  const confirmMessage = (): HTMLElement | null =>
    screen.queryByText(/いまの構成は失われます/);

  const writing = TOOLBOX_PRESETS[0];
  const development = TOOLBOX_PRESETS[1];

  // --- 初期状態（デフォルト構成 = daily-life）: daily-life が「適用中」で、
  //     残り4プリセットの適用ボタンが並ぶ ---
  expect(screen.getAllByText("適用中")).toHaveLength(1);
  expect(
    screen.getAllByRole("button", {
      name: /^プリセット「.+」を道具箱に適用$/,
    }),
  ).toHaveLength(TOOLBOX_PRESETS.length - 1);
  expect(confirmMessage()).toBeNull();

  // --- 即時適用（デフォルト構成から）: 確認なしで構成が切り替わり保存される ---
  fireEvent.click(presetApplyButton(writing.name));
  expect(confirmMessage()).toBeNull();
  expect(countTiles()).toBe(writing.itemIds.length);
  expect(readStoredItems()).toEqual([...writing.itemIds]);
  // 表示は設計どおりの並び。内部タクソノミ（カテゴリ見出し）でグループ化し直さない
  expectNoCategoryHeadings();
  expect(removeButtonLabels()).toEqual(expectedRemoveLabels(writing.itemIds));
  // 適用したプリセットだけが「適用中」になり、適用ボタンが消える。
  // daily-life（デフォルト）には適用ボタンが現れる
  expect(screen.getAllByText("適用中")).toHaveLength(1);
  expect(
    screen.queryByRole("button", {
      name: `プリセット「${writing.name}」を道具箱に適用`,
    }),
  ).toBeNull();
  expect(presetApplyButton(DEFAULT_TOOLBOX_PRESET.name)).toBeTruthy();

  // --- 即時適用（プリセット間の乗り換え）: 適用済みプリセットは再選択で
  //     復元できるため、確認なしで乗り換えられる ---
  fireEvent.click(presetApplyButton(development.name));
  expect(confirmMessage()).toBeNull();
  expect(countTiles()).toBe(development.itemIds.length);
  expect(readStoredItems()).toEqual([...development.itemIds]);
  // カテゴリをまたぐ8枚（developer / encoding / security 混在）も設計順のまま並ぶ
  expect(removeButtonLabels()).toEqual(
    expectedRemoveLabels(development.itemIds),
  );

  // --- 手作業構成を作る: タイルを1枚外すとプリセット完全一致が崩れる ---
  fireEvent.click(
    screen.getByRole("button", { name: "JSON整形・検証を道具箱から外す" }),
  );
  expect(countTiles()).toBe(development.itemIds.length - 1);
  expect(screen.queryByText("適用中")).toBeNull();

  // --- 上書き確認: 手作業構成では即時適用せず、構成も保存も変わらない ---
  fireEvent.click(presetApplyButton(writing.name));
  expect(confirmMessage()).toBeTruthy();
  expect(confirmMessage()?.textContent).toContain(writing.name);
  expect(countTiles()).toBe(development.itemIds.length - 1);
  expect(readStoredItems()).toHaveLength(development.itemIds.length - 1);

  // --- 確認中に別のプリセットを選ぶと確認対象が切り替わる（確認は常に1つ） ---
  fireEvent.click(presetApplyButton(development.name));
  expect(screen.getAllByText(/いまの構成は失われます/)).toHaveLength(1);
  expect(confirmMessage()?.textContent).toContain(development.name);

  // --- キャンセル: 「やめる」で確認が閉じ、構成は変わらない ---
  fireEvent.click(screen.getByRole("button", { name: "やめる" }));
  expect(confirmMessage()).toBeNull();
  expect(countTiles()).toBe(development.itemIds.length - 1);

  // --- 確定: 確認の「適用する」で初めて構成が切り替わり保存される ---
  fireEvent.click(presetApplyButton(writing.name));
  fireEvent.click(
    screen.getByRole("button", {
      name: `プリセット「${writing.name}」を適用する`,
    }),
  );
  expect(confirmMessage()).toBeNull();
  expect(countTiles()).toBe(writing.itemIds.length);
  expect(readStoredItems()).toEqual([...writing.itemIds]);
  expect(screen.getAllByText("適用中")).toHaveLength(1);

  // --- 構成変更で確認が自動で閉じる: 確認表示中に「追加」すると、
  //     確認の前提（変更前の構成）が失われるため確認も消える ---
  fireEvent.click(
    screen.getByRole("button", { name: "文字数カウントを道具箱から外す" }),
  );
  fireEvent.click(presetApplyButton(development.name));
  expect(confirmMessage()).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: "文字数カウントを道具箱に追加" }),
  );
  expect(confirmMessage()).toBeNull();
  expect(countTiles()).toBe(writing.itemIds.length);
  // 追加は末尾に入る（手作業構成の並びの途中に割り込まない）
  expect(readStoredItems()).toEqual([
    ...writing.itemIds.filter((id) => id !== "char-count:full"),
    "char-count:full",
  ]);

  // --- リセットとの相互作用: デフォルト構成（daily-life）へ戻ると保存が消え、
  //     daily-life が再び「適用中」になる ---
  fireEvent.click(screen.getByRole("button", { name: "最初の状態に戻す" }));
  expect(countTiles()).toBe(DEFAULT_TOOLBOX_ITEM_IDS.length);
  expect(window.localStorage.getItem(TOOLBOX_STORAGE_KEY)).toBeNull();
  expect(screen.getAllByText("適用中")).toHaveLength(1);
  expect(
    screen.queryByRole("button", {
      name: `プリセット「${DEFAULT_TOOLBOX_PRESET.name}」を道具箱に適用`,
    }),
  ).toBeNull();
}, 60000);

/**
 * TB-11: GA4 構成操作イベント（cycle-234 T-3）。
 *
 * - 追加 / 削除: item_id はツール slug・variant は別パラメータ
 *   （variant 込みの entry.id を送らない。固定 variant タイルで分離を検証）
 * - リセット: パラメータなしの toolbox_reset
 * - プリセット: 即時適用と確認経由の適用で送信し、確認を出しただけ・
 *   「やめる」では送らない
 */
it("ToolboxContent: 構成操作で GA4 イベントが送信される（slug/variant 分離・確認キャンセル不送信）", () => {
  render(<ToolboxContent />);

  // --- 削除（外す）: qr-code:full → slug "qr-code" + variant "full" に分離 ---
  fireEvent.click(
    screen.getByRole("button", { name: "QRコード生成を道具箱から外す" }),
  );
  expect(mockTileRemove).toHaveBeenCalledTimes(1);
  expect(mockTileRemove).toHaveBeenCalledWith({
    item_id: "qr-code",
    variant: "full",
  });

  // --- 追加: 固定 variant タイル url-encode:encode → variant "encode" ---
  fireEvent.click(
    screen.getByRole("button", {
      name: "URLエンコード・デコード（エンコード専用）を道具箱に追加",
    }),
  );
  expect(mockTileAdd).toHaveBeenCalledTimes(1);
  expect(mockTileAdd).toHaveBeenCalledWith({
    item_id: "url-encode",
    variant: "encode",
  });

  // --- リセット ---
  fireEvent.click(screen.getByRole("button", { name: "最初の状態に戻す" }));
  expect(mockReset).toHaveBeenCalledTimes(1);

  // --- プリセット即時適用（デフォルト構成から = 確認なし） ---
  const writing = TOOLBOX_PRESETS[0];
  fireEvent.click(
    screen.getByRole("button", {
      name: `プリセット「${writing.name}」を道具箱に適用`,
    }),
  );
  expect(mockPresetSelect).toHaveBeenCalledTimes(1);
  expect(mockPresetSelect).toHaveBeenCalledWith({ preset_id: writing.id });

  // --- 手作業構成を作って上書き確認を出す: 確認表示だけでは送らない ---
  const removeLabel = `${TOOLBOX_CATALOG_BY_ID.get(writing.itemIds[0])?.displayLabel}を道具箱から外す`;
  fireEvent.click(screen.getByRole("button", { name: removeLabel }));
  const development = TOOLBOX_PRESETS[1];
  fireEvent.click(
    screen.getByRole("button", {
      name: `プリセット「${development.name}」を道具箱に適用`,
    }),
  );
  expect(screen.getByText(/いまの構成は失われます/)).toBeTruthy();
  expect(mockPresetSelect).toHaveBeenCalledTimes(1);

  // --- 確認キャンセル（「やめる」）: 送らない ---
  fireEvent.click(screen.getByRole("button", { name: "やめる" }));
  expect(mockPresetSelect).toHaveBeenCalledTimes(1);

  // --- 確認を経た適用（「適用する」）: ここで初めて送る ---
  fireEvent.click(
    screen.getByRole("button", {
      name: `プリセット「${development.name}」を道具箱に適用`,
    }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: `プリセット「${development.name}」を適用する`,
    }),
  );
  expect(mockPresetSelect).toHaveBeenCalledTimes(2);
  expect(mockPresetSelect).toHaveBeenLastCalledWith({
    preset_id: development.id,
  });

  // --- プリセット適用・リセットを構成差分の add/remove として二重送信しない ---
  expect(mockTileAdd).toHaveBeenCalledTimes(1);
  expect(mockTileRemove).toHaveBeenCalledTimes(2); // qr-code + 手作業化の1枚のみ
}, 60000);

/**
 * TB-12: GA4 tile_first_interaction（cycle-234 T-4）。
 *
 * - タイル本体（renderTile の描画領域）への最初のポインタ/キーボード操作で
 *   1 回だけ送る（同一タイルへの2回目は送らない）
 * - wrapper 内の操作列（「外す」ボタン）への操作は「タイルを使った」に
 *   含めない（capture リスナーをタイル本体だけに置く構造的除外の検証）
 * - 外す→戻すで要素が remount しても、マウント中の送信は entry につき 1 回
 *   （送信済み記録は ToolboxContent の ref が保持する）
 */
it("ToolboxContent: タイル本体の最初の操作で tile_first_interaction を1回だけ送信する", () => {
  render(<ToolboxContent />);

  // --- toolbar（「外す」ボタン）へのポインタ操作では送らない ---
  fireEvent.pointerDown(
    screen.getByRole("button", { name: "QRコード生成を道具箱から外す" }),
  );
  expect(mockTileFirstInteraction).not.toHaveBeenCalled();

  // --- タイル本体（qr-code の入力欄）へのポインタ操作で送る ---
  const qrInput = screen.getByRole("textbox", { name: "テキストまたはURL" });
  fireEvent.pointerDown(qrInput);
  expect(mockTileFirstInteraction).toHaveBeenCalledTimes(1);
  expect(mockTileFirstInteraction).toHaveBeenCalledWith({
    item_id: "qr-code",
    surface: "toolbox",
    variant: "full",
  });

  // --- 同一タイルへの2回目の操作（ポインタ・キーボードとも）は送らない ---
  fireEvent.pointerDown(qrInput);
  fireEvent.keyDown(qrInput, { key: "a" });
  expect(mockTileFirstInteraction).toHaveBeenCalledTimes(1);

  // --- 別タイル（unit-converter）はキーボード操作でも送る（タイル単位で1回） ---
  fireEvent.keyDown(screen.getByRole("spinbutton", { name: "変換する値" }), {
    key: "ArrowUp",
  });
  expect(mockTileFirstInteraction).toHaveBeenCalledTimes(2);
  expect(mockTileFirstInteraction).toHaveBeenLastCalledWith({
    item_id: "unit-converter",
    surface: "toolbox",
    variant: "full",
  });

  // --- 外す→戻す（remount）後の再操作でも、マウント中は再送しない ---
  fireEvent.click(
    screen.getByRole("button", { name: "QRコード生成を道具箱から外す" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "QRコード生成を道具箱に追加" }),
  );
  fireEvent.pointerDown(
    screen.getByRole("textbox", { name: "テキストまたはURL" }),
  );
  expect(mockTileFirstInteraction).toHaveBeenCalledTimes(2);
}, 60000);
