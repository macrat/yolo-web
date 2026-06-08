/**
 * FullwidthConverterTile ユニットテスト（T-3 TDD: 実装前に書く）
 *
 * 検証観点:
 * - V-1: variant=full でのレンダリング（方向トグル・checkbox 3個が表示される）
 * - V-2: variant=toHalfwidth（方向固定・トグル非表示・checkbox 3個あり）
 * - V-3: variant=toFullwidth（方向固定・トグル非表示・checkbox 3個あり）
 * - V-4: variant=toHalfwidth で半角変換が動く
 * - V-5: variant=toFullwidth で全角変換が動く
 * - V-6: variant=full でモード切り替えが動く
 * - V-7: id インスタンス一意性（複数インスタンスで id が重複しない）
 * - V-8: checkbox group ラベル関連（role=group + aria-label が存在する）
 * - V-9: checkbox の label と input の関連（htmlFor/id が正しく機能する）
 * - V-10: 出力 readOnly + role=status サマリ（C-3 準拠）
 * - V-11: コピーボタン disabled/enabled 状態
 * - V-12: コピー後ラベル変化（COPIED_LABEL）
 * - V-13: オプション checkbox OFF で対象文字種が変換されない
 * - V-14: デフォルト variant は full と同等
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import FullwidthConverterTile from "../FullwidthConverterTile";

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

// --- V-1: variant=full ---
describe("V-1: variant=full", () => {
  it("方向トグル（SegmentedControl）が表示される", () => {
    render(<FullwidthConverterTile variant="full" />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("入力欄と出力欄が存在する", () => {
    render(<FullwidthConverterTile variant="full" />);
    expect(screen.getByLabelText("入力テキスト")).toBeInTheDocument();
    expect(screen.getByLabelText("変換結果")).toBeInTheDocument();
  });

  it("checkbox が 3 個ある", () => {
    render(<FullwidthConverterTile variant="full" />);
    expect(screen.getByLabelText("英数字")).toBeInTheDocument();
    expect(screen.getByLabelText("カタカナ")).toBeInTheDocument();
    expect(screen.getByLabelText("記号・スペース")).toBeInTheDocument();
  });
});

// --- V-2: variant=toHalfwidth ---
describe("V-2: variant=toHalfwidth（方向固定・トグル非表示）", () => {
  it("SegmentedControl（radiogroup）が表示されない", () => {
    render(<FullwidthConverterTile variant="toHalfwidth" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("入力欄と出力欄が存在する", () => {
    render(<FullwidthConverterTile variant="toHalfwidth" />);
    expect(screen.getByLabelText("入力テキスト")).toBeInTheDocument();
    expect(screen.getByLabelText("変換結果")).toBeInTheDocument();
  });

  it("checkbox が 3 個ある", () => {
    render(<FullwidthConverterTile variant="toHalfwidth" />);
    expect(screen.getByLabelText("英数字")).toBeInTheDocument();
    expect(screen.getByLabelText("カタカナ")).toBeInTheDocument();
    expect(screen.getByLabelText("記号・スペース")).toBeInTheDocument();
  });
});

// --- V-3: variant=toFullwidth ---
describe("V-3: variant=toFullwidth（方向固定・トグル非表示）", () => {
  it("SegmentedControl（radiogroup）が表示されない", () => {
    render(<FullwidthConverterTile variant="toFullwidth" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("入力欄と出力欄が存在する", () => {
    render(<FullwidthConverterTile variant="toFullwidth" />);
    expect(screen.getByLabelText("入力テキスト")).toBeInTheDocument();
    expect(screen.getByLabelText("変換結果")).toBeInTheDocument();
  });

  it("checkbox が 3 個ある", () => {
    render(<FullwidthConverterTile variant="toFullwidth" />);
    expect(screen.getByLabelText("英数字")).toBeInTheDocument();
    expect(screen.getByLabelText("カタカナ")).toBeInTheDocument();
    expect(screen.getByLabelText("記号・スペース")).toBeInTheDocument();
  });
});

// --- V-4: variant=toHalfwidth での変換 ---
describe("V-4: variant=toHalfwidth での変換", () => {
  it("全角英字を入力すると半角英字に変換される", () => {
    render(<FullwidthConverterTile variant="toHalfwidth" />);
    const input = screen.getByLabelText("入力テキスト") as HTMLTextAreaElement;
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: "ＡＢＣ" } });
    expect(output.value).toBe("ABC");
  });
});

// --- V-5: variant=toFullwidth での変換 ---
describe("V-5: variant=toFullwidth での変換", () => {
  it("半角英字を入力すると全角英字に変換される", () => {
    render(<FullwidthConverterTile variant="toFullwidth" />);
    const input = screen.getByLabelText("入力テキスト") as HTMLTextAreaElement;
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: "ABC" } });
    expect(output.value).toBe("ＡＢＣ");
  });
});

// --- V-6: variant=full でのモード切り替え ---
describe("V-6: variant=full でのモード切り替え", () => {
  it("全角に変換モードに切り替えると全角変換が動く", () => {
    render(<FullwidthConverterTile variant="full" />);
    const input = screen.getByLabelText("入力テキスト") as HTMLTextAreaElement;
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;

    // デフォルト（半角に変換）→ 全角に変換 に切り替え
    const fullwidthBtn = screen.getByRole("radio", { name: "全角に変換" });
    fireEvent.click(fullwidthBtn);
    fireEvent.change(input, { target: { value: "ABC" } });
    expect(output.value).toBe("ＡＢＣ");
  });

  it("デフォルト（半角に変換）で半角変換が動く", () => {
    render(<FullwidthConverterTile variant="full" />);
    const input = screen.getByLabelText("入力テキスト") as HTMLTextAreaElement;
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: "ＡＢＣ" } });
    expect(output.value).toBe("ABC");
  });
});

// --- V-7: id インスタンス一意性 ---
describe("V-7: id インスタンス一意性", () => {
  it("同一ページに 2 つ描画しても入力 textarea の id が重複しない", () => {
    const { container: c1 } = render(<FullwidthConverterTile variant="full" />);
    const { container: c2 } = render(
      <FullwidthConverterTile variant="toHalfwidth" />,
    );

    const input1 = c1.querySelector("textarea[id]");
    const input2 = c2.querySelector("textarea[id]");

    expect(input1).not.toBeNull();
    expect(input2).not.toBeNull();
    expect(input1!.id).not.toBe(input2!.id);
  });

  it("variant=full と variant=toFullwidth を同居させても全要素 id が重複しない", () => {
    const { container: c1 } = render(<FullwidthConverterTile variant="full" />);
    const { container: c2 } = render(
      <FullwidthConverterTile variant="toFullwidth" />,
    );

    const ids1 = [...c1.querySelectorAll("[id]")].map((el) => el.id);
    const ids2 = [...c2.querySelectorAll("[id]")].map((el) => el.id);

    const overlap = ids1.filter((id) => ids2.includes(id));
    expect(overlap).toHaveLength(0);
  });

  it("checkbox の id も複数インスタンスで重複しない", () => {
    const { container: c1 } = render(<FullwidthConverterTile variant="full" />);
    const { container: c2 } = render(
      <FullwidthConverterTile variant="toHalfwidth" />,
    );

    const checkboxIds1 = [
      ...c1.querySelectorAll("input[type='checkbox'][id]"),
    ].map((el) => el.id);
    const checkboxIds2 = [
      ...c2.querySelectorAll("input[type='checkbox'][id]"),
    ].map((el) => el.id);

    const overlap = checkboxIds1.filter((id) => checkboxIds2.includes(id));
    expect(overlap).toHaveLength(0);
  });
});

// --- V-8: checkbox group ラベル関連（role=group + aria-label） ---
describe("V-8: checkbox group ラベル関連", () => {
  it("role=group の要素が存在し aria-label が付与されている", () => {
    render(<FullwidthConverterTile variant="full" />);
    const group = screen.getByRole("group", { name: "変換対象" });
    expect(group).toBeInTheDocument();
  });

  it("variant=toHalfwidth でも role=group + aria-label が維持される", () => {
    render(<FullwidthConverterTile variant="toHalfwidth" />);
    const group = screen.getByRole("group", { name: "変換対象" });
    expect(group).toBeInTheDocument();
  });

  it("variant=toFullwidth でも role=group + aria-label が維持される", () => {
    render(<FullwidthConverterTile variant="toFullwidth" />);
    const group = screen.getByRole("group", { name: "変換対象" });
    expect(group).toBeInTheDocument();
  });
});

// --- V-9: checkbox の label と input の関連 ---
describe("V-9: checkbox label/input 関連", () => {
  it("英数字 label が対応する checkbox と正しく関連付けられている", () => {
    render(<FullwidthConverterTile variant="full" />);
    const checkbox = screen.getByLabelText("英数字") as HTMLInputElement;
    expect(checkbox.type).toBe("checkbox");
    // 初期状態では checked
    expect(checkbox.checked).toBe(true);
  });

  it("カタカナ label が対応する checkbox と正しく関連付けられている", () => {
    render(<FullwidthConverterTile variant="full" />);
    const checkbox = screen.getByLabelText("カタカナ") as HTMLInputElement;
    expect(checkbox.type).toBe("checkbox");
    expect(checkbox.checked).toBe(true);
  });

  it("記号・スペース label が対応する checkbox と正しく関連付けられている", () => {
    render(<FullwidthConverterTile variant="full" />);
    const checkbox = screen.getByLabelText(
      "記号・スペース",
    ) as HTMLInputElement;
    expect(checkbox.type).toBe("checkbox");
    expect(checkbox.checked).toBe(true);
  });
});

// --- V-10: 出力 readOnly + role=status サマリ（C-3） ---
describe("V-10: 出力 readOnly + role=status サマリ", () => {
  it("出力 textarea が readOnly である", () => {
    render(<FullwidthConverterTile variant="full" />);
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.readOnly).toBe(true);
  });

  it("role=status aria-live=polite の要素が存在する", () => {
    render(<FullwidthConverterTile variant="full" />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("変換後にサマリテキストが role=status 内に表示される", () => {
    render(<FullwidthConverterTile variant="full" />);
    const input = screen.getByLabelText("入力テキスト") as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "Ａ" } });
    const status = screen.getByRole("status");
    expect(status.textContent).not.toBe("");
  });

  it("空入力時は role=status 内が空", () => {
    render(<FullwidthConverterTile variant="full" />);
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("");
  });
});

// --- V-11: コピーボタン disabled/enabled 状態 ---
describe("V-11: コピーボタン disabled/enabled 状態", () => {
  it("入力が空のときコピーボタンが disabled", () => {
    render(<FullwidthConverterTile variant="full" />);
    const copyBtn = screen.getByRole("button", { name: "コピー" });
    expect(copyBtn).toBeDisabled();
  });

  it("入力があるときコピーボタンが enabled", () => {
    render(<FullwidthConverterTile variant="full" />);
    const input = screen.getByLabelText("入力テキスト") as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "ABC" } });
    const copyBtn = screen.getByRole("button", { name: "コピー" });
    expect(copyBtn).not.toBeDisabled();
  });
});

// --- V-12: コピー後ラベル変化 ---
describe("V-12: コピー後ラベル変化（COPIED_LABEL）", () => {
  it("コピー後に「コピーしました」と表示される", async () => {
    render(<FullwidthConverterTile variant="full" />);
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

// --- V-13: オプション checkbox OFF での変換抑制 ---
describe("V-13: オプション checkbox OFF での変換抑制", () => {
  it("英数字をOFFにすると全角英数字が半角に変換されない", () => {
    render(<FullwidthConverterTile variant="toHalfwidth" />);
    const input = screen.getByLabelText("入力テキスト") as HTMLTextAreaElement;
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    const alphaCheckbox = screen.getByLabelText("英数字") as HTMLInputElement;

    // 英数字をOFF
    fireEvent.click(alphaCheckbox);
    fireEvent.change(input, { target: { value: "ＡＢＣ" } });
    // 英数字OFFなので全角のまま
    expect(output.value).toBe("ＡＢＣ");
  });

  it("カタカナをOFFにすると全角カタカナが半角に変換されない", () => {
    render(<FullwidthConverterTile variant="toHalfwidth" />);
    const input = screen.getByLabelText("入力テキスト") as HTMLTextAreaElement;
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    const katakanaCheckbox = screen.getByLabelText(
      "カタカナ",
    ) as HTMLInputElement;

    // カタカナをOFF
    fireEvent.click(katakanaCheckbox);
    fireEvent.change(input, { target: { value: "アイウ" } });
    // カタカナOFFなので全角のまま
    expect(output.value).toBe("アイウ");
  });
});

// --- V-14: デフォルト variant は full と同等 ---
describe("V-14: デフォルト variant", () => {
  it("variant 未指定の場合 full と同等の動作をする（トグルが表示される）", () => {
    render(<FullwidthConverterTile />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("variant 未指定でも checkbox 3個が存在する", () => {
    render(<FullwidthConverterTile />);
    expect(screen.getByLabelText("英数字")).toBeInTheDocument();
    expect(screen.getByLabelText("カタカナ")).toBeInTheDocument();
    expect(screen.getByLabelText("記号・スペース")).toBeInTheDocument();
  });
});

// --- CSS トークン検証 ---
describe("CSS トークン検証", () => {
  it("--color-* 旧トークンが CSS に存在しない", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/fullwidth-converter/FullwidthConverterTile.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("--accent 直塗りが CSS に存在しない（背景色への直接使用禁止）", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/fullwidth-converter/FullwidthConverterTile.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/background(?:-color)?\s*:\s*var\(--accent\)/);
  });

  it("font-weight: 700 が CSS に存在しない", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/fullwidth-converter/FullwidthConverterTile.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });
});
