import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";

// vi.hoisted でモック変数をホイストして動的に copiedKey を制御できるようにする
const mockHook = vi.hoisted(() => ({
  copy: vi.fn(),
  copiedKey: null as string | number | boolean | null,
}));

// useCopyToClipboard をモックする（clipboard API 不在環境）
vi.mock("@/components/hooks/useCopyToClipboard", () => ({
  useCopyToClipboard: () => mockHook,
  COPIED_LABEL: "コピーしました",
}));

// YamlFormatterPage を動的にインポート（モック設定後）
import YamlFormatterPage from "../YamlFormatterPage";

describe("YamlFormatterPage", () => {
  beforeEach(() => {
    // 各テスト前にコピー状態をリセット
    mockHook.copiedKey = null;
    mockHook.copy = vi.fn();
  });

  // E-1: 基本レンダリング
  test("renders without crashing", () => {
    render(<YamlFormatterPage />);
    expect(screen.getByLabelText("入力")).toBeInTheDocument();
  });

  // E-10: 入力欄・出力欄が確定提示方式で最初から見える
  test("shows input and output areas on initial render", () => {
    render(<YamlFormatterPage />);
    expect(screen.getByLabelText("入力")).toBeInTheDocument();
    expect(screen.getByLabelText("出力")).toBeInTheDocument();
  });

  // E-3: 空入力時はエラーが表示されない
  test("shows no error on empty input", () => {
    render(<YamlFormatterPage />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // E-2: 変換ボタンで出力が更新される（YAML整形モード）
  test("formats YAML when 変換 button is clicked", () => {
    render(<YamlFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "name: test\nage: 30" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toContain("name: test");
    expect(output.value).toContain("age: 30");
  });

  // E-2: 検証ボタンで有効YAMLのとき日本語の成功メッセージが表示される
  test("shows Japanese validation success when 検証 is clicked with valid YAML", () => {
    render(<YamlFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, {
      target: { value: "name: test\nlist:\n  - item1\n  - item2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "検証" }));
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    // 日本語メッセージで表示されること（"Valid YAML" 等の英語は不可）
    expect(output.value).not.toContain("Valid YAML");
    expect(output.value).toMatch(/[ぁ-ん|ァ-ン|一-龯]/);
  });

  // E-4: YAML → JSON 変換の正確性
  test("converts YAML to JSON correctly", () => {
    render(<YamlFormatterPage />);
    // モード切替: YAML → JSON
    const modeSelect = screen.getByLabelText("モード");
    fireEvent.change(modeSelect, { target: { value: "yaml-to-json" } });
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "name: test\nage: 30" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    const parsed = JSON.parse(output.value);
    expect(parsed).toEqual({ name: "test", age: 30 });
  });

  // E-4: JSON → YAML 変換の正確性
  test("converts JSON to YAML correctly", () => {
    render(<YamlFormatterPage />);
    // モード切替: JSON → YAML
    const modeSelect = screen.getByLabelText("モード");
    fireEvent.change(modeSelect, { target: { value: "json-to-yaml" } });
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, {
      target: { value: '{"name": "test", "age": 30}' },
    });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toContain("name: test");
    expect(output.value).toContain("age: 30");
  });

  // E-4: 無効なYAMLでエラー表示（日本語メッセージ必須）
  test("shows error for invalid YAML input", () => {
    render(<YamlFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "{invalid: yaml: content}" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  // A-4: エラー文言は英語の生パーサーエラーを露出しない（日本語で表示）
  test("shows Japanese error message, not raw English YAML parser error", () => {
    render(<YamlFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "{invalid: yaml: content}" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    const alert = screen.getByRole("alert");
    // 英語の生パーサーエラーが露出していないこと
    expect(alert.textContent).not.toMatch(
      /missed comma|unexpected|expected|duplicate/i,
    );
    // 日本語のメッセージが含まれていること
    expect(alert.textContent).toMatch(/[ぁ-ん|ァ-ン|一-龯]/);
  });

  // A-4: 検証ボタンでも無効YAML時に日本語エラーが出る
  test("shows Japanese error when 検証 is clicked with invalid YAML", () => {
    render(<YamlFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "{invalid: yaml: content}" } });
    fireEvent.click(screen.getByRole("button", { name: "検証" }));
    const alert = screen.getByRole("alert");
    expect(alert.textContent).not.toMatch(
      /missed comma|unexpected|expected|duplicate/i,
    );
    expect(alert.textContent).toMatch(/[ぁ-ん|ァ-ン|一-龯]/);
  });

  // E-5: ARIA — role="status" aria-live="polite" 領域が存在する
  test("has role=status region with aria-live=polite", () => {
    render(<YamlFormatterPage />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeInTheDocument();
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  // E-5a: C-3 — 変換後に role="status" 領域に実テキストサマリが表示される
  test("shows summary text in role=status region after formatting", () => {
    render(<YamlFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "name: test" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    const statusRegion = screen.getByRole("status");
    expect(statusRegion.textContent).not.toBe("");
  });

  // E-5b: C-3 — 検証後に role="status" 領域に実テキストサマリが表示される
  test("shows summary text in role=status region after validation", () => {
    render(<YamlFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "name: test" } });
    fireEvent.click(screen.getByRole("button", { name: "検証" }));
    const statusRegion = screen.getByRole("status");
    expect(statusRegion.textContent).not.toBe("");
  });

  // E-7: 出力が空のときコピーボタンが disabled
  test("copy button is disabled when output is empty", () => {
    render(<YamlFormatterPage />);
    const copyButton = screen.getByRole("button", { name: "コピー" });
    expect(copyButton).toBeDisabled();
  });

  // E-7: 出力があるときコピーボタンが enabled
  test("copy button is enabled when output has content", () => {
    render(<YamlFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "name: test" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    const copyButton = screen.getByRole("button", { name: "コピー" });
    expect(copyButton).not.toBeDisabled();
  });

  // E-6: コピー文言変化 — コピー前は "コピー" が表示される
  test("copy button label is コピー when not copied (copiedKey=null)", () => {
    mockHook.copiedKey = null;
    render(<YamlFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "name: test" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    expect(screen.getByRole("button", { name: "コピー" })).toBeInTheDocument();
  });

  // E-6: コピー文言変化 — コピー後は COPIED_LABEL ("コピーしました") が表示される
  test("copy button label changes to COPIED_LABEL when copiedKey is set", () => {
    mockHook.copiedKey = true;
    render(<YamlFormatterPage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "name: test" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
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
      render(<YamlFormatterPage />);
    }).not.toThrow();

    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
      writable: true,
    });
  });

  // E-12: CSS トークン検証
  test("CSS does not use deprecated --color-* tokens or --accent direct fill or font-weight 700", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/yaml-formatter/YamlFormatterPage.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");

    // 旧トークン --color-* が存在しないこと
    expect(css).not.toMatch(/var\(--color-/);

    // --accent 直塗りがないこと（フォーカス用途 outline: 2px solid var(--accent) は許可）
    const accentDirectUse = css.match(
      /(?:background|color)\s*:\s*var\(--accent\)/g,
    );
    expect(accentDirectUse).toBeNull();

    // font-weight: 700 が CSS 宣言として存在しないこと
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssWithoutComments).not.toMatch(/font-weight\s*:\s*700/);
  });
});
