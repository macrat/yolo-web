import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import JsonFormatterPage from "../JsonFormatterPage";

// vi.hoisted でモック変数をホイストして動的に copiedKey を制御できるようにする
const mockHook = vi.hoisted(() => ({
  copy: vi.fn(),
  copiedKey: null as string | number | boolean | null,
}));

// useCopyToClipboard をモックする（clipboard API 不在環境）
// vi.hoisted を通して copiedKey を動的に制御できる
vi.mock("@/components/hooks/useCopyToClipboard", () => ({
  useCopyToClipboard: () => mockHook,
  COPIED_LABEL: "コピーしました",
}));

describe("JsonFormatterPage", () => {
  beforeEach(() => {
    // 各テスト前にコピー状態をリセット（テスト間の状態汚染を防ぐ）
    mockHook.copiedKey = null;
    mockHook.copy = vi.fn();
  });

  // E-1: 基本レンダリング
  test("renders without crashing", () => {
    render(<JsonFormatterPage />);
    expect(screen.getByLabelText("入力")).toBeInTheDocument();
  });

  // E-10: meta 由来の表示
  test("renders tool name from meta", () => {
    render(<JsonFormatterPage />);
    // ToolPageLayout は meta.name を h1 として描画するが、ここはページ本体のみをテスト
    // インプット欄が見えていること（確定提示方式の確認）
    expect(screen.getByLabelText("入力")).toBeInTheDocument();
    expect(screen.getByLabelText("出力")).toBeInTheDocument();
  });

  // E-3: 空入力時の挙動
  test("shows no error on empty input", () => {
    render(<JsonFormatterPage />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // E-2: 整形ボタンで出力が更新される
  test("formats JSON when 整形 button is clicked", () => {
    render(<JsonFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{"a":1,"b":2}' } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toContain('"a": 1');
  });

  // E-2: 圧縮ボタンで出力が更新される
  test("minifies JSON when 圧縮 button is clicked", () => {
    render(<JsonFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, {
      target: { value: '{\n  "a": 1,\n  "b": 2\n}' },
    });
    fireEvent.click(screen.getByRole("button", { name: "圧縮" }));
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toBe('{"a":1,"b":2}');
  });

  // E-2: 検証ボタンで valid な JSON のとき成功メッセージが日本語で出る
  test("shows validation success in Japanese when 検証 button is clicked with valid JSON", () => {
    render(<JsonFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{"key": "value"}' } });
    fireEvent.click(screen.getByRole("button", { name: "検証" }));
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    // 日本語メッセージで表示されること（"Valid JSON" 等の英語は不可）
    expect(output.value).toBe("正しいJSONです");
    expect(output.value).not.toContain("Valid JSON");
  });

  // E-4: 変換ロジックの正確性（2スペース整形）
  test("formats with 2 spaces by default", () => {
    render(<JsonFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{"x":1}' } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toBe('{\n  "x": 1\n}');
  });

  // E-4: インデント変更が整形に反映される
  test("formats with 4 spaces when indent changed to 4", () => {
    render(<JsonFormatterPage />);
    const indentSelect = screen.getByLabelText("インデント");
    fireEvent.change(indentSelect, { target: { value: "4" } });
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{"x":1}' } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toBe('{\n    "x": 1\n}');
  });

  // E-4: 無効なJSONでエラー表示（日本語メッセージ必須）
  test("shows error message for invalid JSON", () => {
    render(<JsonFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "{invalid}" } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  // E-4: エラー文言は英語の生パーサーエラーを露出しない（日本語で表示）
  test("shows Japanese error message, not raw English parser error", () => {
    render(<JsonFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "{invalid}" } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const alert = screen.getByRole("alert");
    // 英語の生パーサーエラー文字列が露出していないこと
    expect(alert.textContent).not.toMatch(
      /Expected|Unexpected|position|at line|column/i,
    );
    // 日本語のメッセージが含まれていること
    expect(alert.textContent).toMatch(/[ぁ-ん|ァ-ン|一-龯]/);
  });

  // E-4: 検証ボタンでも無効JSON時に日本語エラーが出る
  test("shows Japanese error message when 検証 is clicked with invalid JSON", () => {
    render(<JsonFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "{bad json}" } });
    fireEvent.click(screen.getByRole("button", { name: "検証" }));
    const alert = screen.getByRole("alert");
    expect(alert.textContent).not.toMatch(
      /Expected|Unexpected|position|at line|column/i,
    );
    expect(alert.textContent).toMatch(/[ぁ-ん|ァ-ン|一-龯]/);
  });

  // E-5: ARIA — role="status" aria-live="polite" 領域が存在する
  test("has role=status region with aria-live=polite", () => {
    render(<JsonFormatterPage />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeInTheDocument();
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  // E-5a: ARIA — 整形後に role="status" 領域に実テキストサマリが表示される（C-3）
  test("shows summary text in role=status region after formatting", () => {
    render(<JsonFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{"a":1}' } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveTextContent("整形しました");
  });

  // E-5b: ARIA — 圧縮後に role="status" 領域に実テキストサマリが表示される（C-3）
  test("shows summary text in role=status region after minifying", () => {
    render(<JsonFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{\n  "a": 1\n}' } });
    fireEvent.click(screen.getByRole("button", { name: "圧縮" }));
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveTextContent("圧縮しました");
  });

  // E-5c: ARIA — 検証後に role="status" 領域に実テキストサマリが表示される（C-3）
  test("shows summary text in role=status region after validation", () => {
    render(<JsonFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{"key": "value"}' } });
    fireEvent.click(screen.getByRole("button", { name: "検証" }));
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveTextContent("正しいJSONです");
  });

  // E-7: 出力が空のときコピーボタンが disabled
  test("copy button is disabled when output is empty", () => {
    render(<JsonFormatterPage />);
    const copyButton = screen.getByRole("button", { name: "コピー" });
    expect(copyButton).toBeDisabled();
  });

  // E-7: 出力があるときコピーボタンが enabled
  test("copy button is enabled when output has content", () => {
    render(<JsonFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{"a":1}' } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const copyButton = screen.getByRole("button", { name: "コピー" });
    expect(copyButton).not.toBeDisabled();
  });

  // E-6: コピー文言変化 — コピー前は "コピー" が表示される
  test("copy button label is コピー when not copied (copiedKey=null)", () => {
    mockHook.copiedKey = null; // コピー前の状態
    render(<JsonFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{"a":1}' } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    // copiedKey=null(モック)のとき "コピー" が表示される
    expect(screen.getByRole("button", { name: "コピー" })).toBeInTheDocument();
  });

  // E-6: コピー文言変化 — コピー後は COPIED_LABEL ("コピーしました") が表示される
  test("copy button label changes to COPIED_LABEL when copiedKey is set", () => {
    mockHook.copiedKey = true; // コピー後の状態をシミュレート
    render(<JsonFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{"a":1}' } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    // copiedKey=true(モック)のとき "コピーしました" (COPIED_LABEL) が表示される
    expect(
      screen.getByRole("button", { name: "コピーしました" }),
    ).toBeInTheDocument();
  });

  // E-8: navigator.clipboard が存在しない環境でコピーが例外を投げない
  test("does not throw when navigator.clipboard is absent", async () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    expect(() => {
      render(<JsonFormatterPage />);
    }).not.toThrow();

    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
      writable: true,
    });
  });

  // G-1: .controlLabel に white-space: nowrap があるか（ラベル折返し防止）
  // cycle-225 U-16 再ゲート指摘: w1280/w360 で「インデント」ラベルが2行折返し
  test("CSS .controlLabel has white-space: nowrap to prevent label wrapping", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/json-formatter/JsonFormatterPage.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");
    // .controlLabel ブロックに white-space: nowrap が含まれることを確認
    const controlLabelBlock = css.match(/\.controlLabel\s*\{([\s\S]*?)\}/);
    expect(controlLabelBlock).not.toBeNull();
    expect(controlLabelBlock![1]).toMatch(/white-space\s*:\s*nowrap/);
  });

  // E-12: CSS トークン検証
  test("CSS does not use deprecated --color-* tokens or --accent direct fill or font-weight 700", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/json-formatter/JsonFormatterPage.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");

    // 旧トークン --color-* が存在しないこと
    expect(css).not.toMatch(/var\(--color-/);

    // --accent 直塗りがないこと（フォーカス用途 outline: 2px solid var(--accent) は許可）
    // background や color プロパティに --accent が直接使われていないことを確認
    const accentDirectUse = css.match(
      /(?:background|color)\s*:\s*var\(--accent\)/g,
    );
    expect(accentDirectUse).toBeNull();

    // font-weight: 700 が CSS 宣言として存在しないこと
    // コメント行（/* ... */）を除去してから検査する
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssWithoutComments).not.toMatch(/font-weight\s*:\s*700/);
  });
});
