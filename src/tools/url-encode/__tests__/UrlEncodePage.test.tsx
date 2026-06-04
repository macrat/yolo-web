/**
 * url-encode 単一実装（UrlEncodePage）の回帰テスト
 *
 * 検証観点: E-1〜E-12（収束チェックリスト E 群）
 * - E-1: 基本レンダリング
 * - E-2: 入力→結果更新
 * - E-3: 空入力
 * - E-4: 変換ロジックの正確性
 * - E-5: ARIA 属性
 * - E-6: コピー文言変化
 * - E-7: コピー disabled 状態
 * - E-8: clipboard 不在時の silent fail
 * - E-9: 詳細リンク（N/A: page.tsx 単体ページのため不要）
 * - E-10: meta 由来の表示
 * - E-11: logic.ts テスト PASS 維持（別ファイルで実施）
 * - E-12: CSS トークン検証
 */
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import UrlEncodePage from "../UrlEncodePage";

// --- E-8: navigator.clipboard のモック ---
const mockWriteText = vi.fn();

beforeEach(() => {
  mockWriteText.mockClear();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: mockWriteText },
    configurable: true,
    writable: true,
  });
});

// --- E-1: 基本レンダリング ---
describe("E-1: 基本レンダリング", () => {
  it("コンポーネントが正常にレンダリングされる", () => {
    render(<UrlEncodePage />);
    // 入力欄が存在する
    expect(screen.getByLabelText("入力")).toBeInTheDocument();
    // 出力欄が存在する
    expect(screen.getByLabelText("出力")).toBeInTheDocument();
    // SegmentedControl が存在する
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    // モード選択が存在する
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("初期状態でエンコードが選択されている", () => {
    render(<UrlEncodePage />);
    const encodeBtn = screen.getByRole("radio", { name: "エンコード" });
    expect(encodeBtn).toHaveAttribute("aria-checked", "true");
    const decodeBtn = screen.getByRole("radio", { name: "デコード" });
    expect(decodeBtn).toHaveAttribute("aria-checked", "false");
  });

  it("コピーボタンが存在する", () => {
    render(<UrlEncodePage />);
    const copyBtn = screen.getByRole("button", { name: "コピー" });
    expect(copyBtn).toBeInTheDocument();
  });
});

// --- E-2: 入力→結果更新 ---
describe("E-2: 入力→結果更新", () => {
  it("入力するとリアルタイムで結果が更新される（エンコード）", () => {
    render(<UrlEncodePage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "あ" } });
    // encodeURIComponent("あ") = "%E3%81%82"
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toBe("%E3%81%82");
  });

  it("入力するとリアルタイムで結果が更新される（デコード）", () => {
    render(<UrlEncodePage />);
    // デコードに切り替え
    const decodeBtn = screen.getByRole("radio", { name: "デコード" });
    fireEvent.click(decodeBtn);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "%E3%81%82" } });
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toBe("あ");
  });

  it("方向を切り替えると出力が再計算される", () => {
    render(<UrlEncodePage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "hello world" } });

    // エンコード状態: "hello world" → "hello%20world"
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toBe("hello%20world");

    // デコードに切り替え
    const decodeBtn = screen.getByRole("radio", { name: "デコード" });
    fireEvent.click(decodeBtn);
    // "hello world" → デコードしても "hello world"（既にデコード済みのような文字列）
    expect(output.value).toBe("hello world");
  });
});

// --- E-3: 空入力 ---
describe("E-3: 空入力", () => {
  it("入力が空のとき出力も空でエラーは表示されない", () => {
    render(<UrlEncodePage />);
    const input = screen.getByLabelText("入力");
    expect((input as HTMLTextAreaElement).value).toBe("");
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toBe("");
    // エラーが表示されていない
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("入力して空に戻すと出力も空になる", () => {
    render(<UrlEncodePage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "test" } });
    fireEvent.change(input, { target: { value: "" } });
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toBe("");
  });
});

// --- E-4: 変換ロジックの正確性 ---
describe("E-4: 変換ロジックの正確性", () => {
  it("日本語テキストをエンコードできる（コンポーネントモード）", () => {
    render(<UrlEncodePage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "こんにちは" } });
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toBe("%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF");
  });

  it("特殊文字をエンコードできる（コンポーネントモード）", () => {
    render(<UrlEncodePage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "hello world&foo=bar" } });
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toBe("hello%20world%26foo%3Dbar");
  });

  it("パーセントエンコードをデコードできる", () => {
    render(<UrlEncodePage />);
    const decodeBtn = screen.getByRole("radio", { name: "デコード" });
    fireEvent.click(decodeBtn);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, {
      target: { value: "%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF" },
    });
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toBe("こんにちは");
  });

  it("不正なエンコード文字列でエラーが表示される（デコードモード）", () => {
    render(<UrlEncodePage />);
    const decodeBtn = screen.getByRole("radio", { name: "デコード" });
    fireEvent.click(decodeBtn);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "%ZZ" } });
    // エラーメッセージが表示される
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("URL全体モードに切り替えてエンコードできる", () => {
    render(<UrlEncodePage />);
    const modeSelect = screen.getByRole("combobox");
    fireEvent.change(modeSelect, { target: { value: "full" } });
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, {
      target: { value: "https://example.com/path?q=こんにちは" },
    });
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    // encodeURI は URL 構造（:// / ? =）を保持する
    expect(output.value).toContain("https://example.com/path?q=");
    expect(output.value).not.toContain("こんにちは");
  });
});

// --- E-5: ARIA 属性 ---
describe("E-5: ARIA 属性", () => {
  it("SegmentedControl が role='radiogroup' を持つ", () => {
    render(<UrlEncodePage />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("SegmentedControl が aria-label を持つ", () => {
    render(<UrlEncodePage />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toHaveAttribute("aria-label");
  });

  it("出力欄のサマリに role='status' と aria-live='polite' が付与されている", () => {
    render(<UrlEncodePage />);
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  it("出力が存在するとき status 要素に実テキストサマリが入る", () => {
    render(<UrlEncodePage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "test" } });
    const statusEl = screen.getByRole("status");
    // サマリテキストが存在する（「エンコードしました」など）
    expect(statusEl.textContent).not.toBe("");
  });

  it("入力が空のとき status 要素が空になる", () => {
    render(<UrlEncodePage />);
    const statusEl = screen.getByRole("status");
    expect(statusEl.textContent).toBe("");
  });
});

// --- E-6: コピー文言変化 ---
describe("E-6: コピー文言変化", () => {
  it("コピー前は「コピー」と表示され、コピー後は COPIED_LABEL に変わる", async () => {
    mockWriteText.mockResolvedValue(undefined);
    render(<UrlEncodePage />);

    // 出力を生成
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "test" } });

    const copyBtn = screen.getByRole("button", { name: "コピー" });
    expect(copyBtn).toBeInTheDocument();

    // コピーボタンをクリック
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    // コピー後は「コピーしました」に変わる
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "コピーしました" }),
      ).toBeInTheDocument();
    });
  });
});

// --- E-7: コピー disabled 状態 ---
describe("E-7: コピー disabled 状態", () => {
  it("出力が空のときコピーボタンが disabled になる", () => {
    render(<UrlEncodePage />);
    const copyBtn = screen.getByRole("button", { name: "コピー" });
    expect(copyBtn).toBeDisabled();
  });

  it("出力が存在するときコピーボタンが enabled になる", () => {
    render(<UrlEncodePage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "test" } });
    const copyBtn = screen.getByRole("button", { name: "コピー" });
    expect(copyBtn).not.toBeDisabled();
  });
});

// --- E-8: clipboard 不在時の silent fail ---
describe("E-8: clipboard 不在時の silent fail", () => {
  it("navigator.clipboard が存在しない環境でコピーしても例外を投げない", async () => {
    // clipboard を undefined に設定
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    render(<UrlEncodePage />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "test" } });

    const copyBtn = screen.getByRole("button", { name: "コピー" });

    // 例外が投げられないことを確認
    await expect(
      act(async () => {
        fireEvent.click(copyBtn);
      }),
    ).resolves.not.toThrow();
  });
});

// --- E-10: meta 由来の表示 ---
describe("E-10: meta 由来の表示", () => {
  it("ToolPageLayout に渡す meta.name が UrlEncodePage 内で参照されている（ページがレンダリングされることを確認）", () => {
    render(<UrlEncodePage />);
    // UrlEncodePage がクラッシュせずレンダリングされること
    expect(screen.getByLabelText("入力")).toBeInTheDocument();
  });
});

// --- E-12: CSS トークン検証 ---
describe("E-12: CSS トークン検証", () => {
  const cssPath = join(
    process.cwd(),
    "src/tools/url-encode/UrlEncodePage.module.css",
  );

  it("--color-* 旧トークンが CSS に存在しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("--accent 直塗り（背景・塗り色への直接使用）が CSS に存在しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    // background や background-color に --accent を直接使っていないか確認
    expect(css).not.toMatch(/background(?:-color)?:\s*var\(--accent\)/);
  });

  it("font-weight: 700 が CSS に存在しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight:\s*700/);
  });
});
