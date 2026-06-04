/**
 * FullwidthConverterPage 回帰テスト
 * convergence-checklist.md E-1〜E-12 に対応
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import FullwidthConverterPage from "../FullwidthConverterPage";

// navigator.clipboard のモック
const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(global.navigator, "clipboard", {
  value: { writeText: mockWriteText },
  writable: true,
  configurable: true,
});

beforeEach(() => {
  mockWriteText.mockReset();
  mockWriteText.mockResolvedValue(undefined);
});

// E-1: 基本レンダリング
describe("基本レンダリング", () => {
  test("コンポーネントが正常にレンダリングされる", () => {
    render(<FullwidthConverterPage />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  test("入力テキストエリアが存在する", () => {
    render(<FullwidthConverterPage />);
    expect(screen.getByLabelText("入力テキスト")).toBeInTheDocument();
  });

  test("変換結果テキストエリアが存在する", () => {
    render(<FullwidthConverterPage />);
    expect(screen.getByLabelText("変換結果")).toBeInTheDocument();
  });

  test("モード切替の2つのボタンが存在する", () => {
    render(<FullwidthConverterPage />);
    expect(
      screen.getByRole("radio", { name: "半角に変換" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "全角に変換" }),
    ).toBeInTheDocument();
  });

  test("オプションのチェックボックスが3つ存在する", () => {
    render(<FullwidthConverterPage />);
    expect(screen.getByLabelText("英数字")).toBeInTheDocument();
    expect(screen.getByLabelText("カタカナ")).toBeInTheDocument();
    expect(screen.getByLabelText("記号・スペース")).toBeInTheDocument();
  });
});

// E-2: 入力→結果更新
describe("入力→結果更新", () => {
  test("入力値変化で結果が更新される", async () => {
    render(<FullwidthConverterPage />);
    const input = screen.getByLabelText("入力テキスト") as HTMLTextAreaElement;
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;

    // 半角モードで全角英字を入力
    fireEvent.change(input, { target: { value: "ＡＢＣ" } });
    expect(output.value).toBe("ABC");
  });

  test("モード切替で再変換される", () => {
    render(<FullwidthConverterPage />);
    const input = screen.getByLabelText("入力テキスト") as HTMLTextAreaElement;
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    const fullwidthBtn = screen.getByRole("radio", { name: "全角に変換" });

    fireEvent.change(input, { target: { value: "ABC" } });
    fireEvent.click(fullwidthBtn);
    expect(output.value).toBe("ＡＢＣ");
  });
});

// E-3: 空入力
describe("空入力", () => {
  test("初期状態で入力欄が空", () => {
    render(<FullwidthConverterPage />);
    const input = screen.getByLabelText("入力テキスト") as HTMLTextAreaElement;
    expect(input.value).toBe("");
  });

  test("初期状態で結果欄が空", () => {
    render(<FullwidthConverterPage />);
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toBe("");
  });

  test("空入力時にエラーメッセージが表示されない", () => {
    render(<FullwidthConverterPage />);
    // ErrorMessage は表示されないことを確認
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

// E-4: 変換ロジックの正確性
describe("変換ロジックの正確性", () => {
  test("全角英字 → 半角英字の変換", () => {
    render(<FullwidthConverterPage />);
    const input = screen.getByLabelText("入力テキスト") as HTMLTextAreaElement;
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;

    // 全角英字（Ａ=U+FF21, ｂ=U+FF42, ｃ=U+FF43）を入力
    fireEvent.change(input, { target: { value: "Ａｂｃ" } });
    expect(output.value).toBe("Abc");
  });

  test("半角英字 → 全角英字の変換", () => {
    render(<FullwidthConverterPage />);
    const input = screen.getByLabelText("入力テキスト") as HTMLTextAreaElement;
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    const fullwidthBtn = screen.getByRole("radio", { name: "全角に変換" });

    fireEvent.click(fullwidthBtn);
    fireEvent.change(input, { target: { value: "Abc" } });
    expect(output.value).toBe("Ａｂｃ");
  });

  test("オプションをOFFにすると対象文字種が変換されない", () => {
    render(<FullwidthConverterPage />);
    const input = screen.getByLabelText("入力テキスト") as HTMLTextAreaElement;
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    const alphaOption = screen.getByLabelText("英数字") as HTMLInputElement;

    // 英数字をOFF
    fireEvent.click(alphaOption);
    fireEvent.change(input, { target: { value: "ＡＢＣ" } }); // ＡＢＣ
    // 英数字OFFなので全角のまま
    expect(output.value).toBe("ＡＢＣ");
  });
});

// E-5: ARIA
describe("ARIA属性", () => {
  test("モード切替に role=radiogroup が付与されている", () => {
    render(<FullwidthConverterPage />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  test("SegmentedControl に aria-label が付与されている", () => {
    render(<FullwidthConverterPage />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toHaveAttribute("aria-label");
  });

  test("出力欄にサマリのライブリージョンがある (role=status, aria-live=polite)", () => {
    render(<FullwidthConverterPage />);
    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
  });

  test("ライブリージョンに実テキストノードが含まれる（変換後）", () => {
    render(<FullwidthConverterPage />);
    const input = screen.getByLabelText("入力テキスト") as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: "Ａ" } });
    const liveRegion = screen.getByRole("status");
    // 変換後にサマリテキストが表示されること
    expect(liveRegion.textContent).not.toBe("");
  });
});

// E-6: コピー文言変化
describe("コピーボタンの動作", () => {
  test("コピー前は「コピー」と表示される", () => {
    render(<FullwidthConverterPage />);
    const input = screen.getByLabelText("入力テキスト") as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "ABC" } });

    expect(screen.getByRole("button", { name: "コピー" })).toBeInTheDocument();
  });

  test("コピー後に COPIED_LABEL が表示される", async () => {
    render(<FullwidthConverterPage />);
    const input = screen.getByLabelText("入力テキスト") as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "ABC" } });

    const copyBtn = screen.getByRole("button", { name: "コピー" });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "コピーしました" }),
      ).toBeInTheDocument();
    });
  });
});

// E-7: コピー disabled 状態
describe("コピーボタン disabled 状態", () => {
  test("入力が空のときコピーボタンが disabled", () => {
    render(<FullwidthConverterPage />);
    const copyBtn = screen.getByRole("button", { name: "コピー" });
    expect(copyBtn).toBeDisabled();
  });

  test("入力があるときコピーボタンが enabled", () => {
    render(<FullwidthConverterPage />);
    const input = screen.getByLabelText("入力テキスト") as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "ABC" } });

    const copyBtn = screen.getByRole("button", { name: "コピー" });
    expect(copyBtn).not.toBeDisabled();
  });
});

// E-8: clipboard 不在時の silent fail
describe("clipboard 不在時の silent fail", () => {
  test("clipboard が存在しない環境でもエラーにならない", async () => {
    // clipboard を undefined にする
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(global.navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    render(<FullwidthConverterPage />);
    const input = screen.getByLabelText("入力テキスト") as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "ABC" } });

    const copyBtn = screen.getByRole("button", { name: "コピー" });
    // 例外を投げないことを確認
    expect(() => fireEvent.click(copyBtn)).not.toThrow();

    // clipboardを戻す
    Object.defineProperty(global.navigator, "clipboard", {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });
});

// E-10: meta 由来の表示
describe("meta 由来の表示", () => {
  test("ツール本体がレンダリングされる", () => {
    render(<FullwidthConverterPage />);
    // ツール本体の要素が描画されていること
    expect(screen.getByLabelText("入力テキスト")).toBeInTheDocument();
  });
});

// E-12: CSS トークン検証
describe("CSS トークン検証", () => {
  test("--color-* 旧トークンが CSS に存在しない", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/fullwidth-converter/FullwidthConverterPage.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  test("--accent 直塗りが CSS に存在しない（背景色への直接使用禁止）", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/fullwidth-converter/FullwidthConverterPage.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");
    // background[-color] に --accent を直接使っていないことを確認
    expect(css).not.toMatch(/background(?:-color)?\s*:\s*var\(--accent\)/);
  });

  test("font-weight: 700 が CSS に存在しない", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/fullwidth-converter/FullwidthConverterPage.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });
});
