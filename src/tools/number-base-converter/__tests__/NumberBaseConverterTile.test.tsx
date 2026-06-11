/**
 * NumberBaseConverterTile — 回帰テスト
 * 旧 NumberBaseConverterPage.test.tsx の振る舞いを Tile 向けに移植・拡張。
 *
 * テスト群:
 * - T-full-*: variant="full" の振る舞い（旧 E-1〜E-12 相当）
 * - T-bin-hex-*: variant="bin-hex" の振る舞い（2進→16進固定）
 * - T-multi-*: 複数インスタンス同居時の DOM id 一意性
 * - T-css-*: CSS トークン検証
 */
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import NumberBaseConverterTile from "../NumberBaseConverterTile";

// ---- mock setup ----
vi.mock("@/tools/registry", () => ({
  toolsBySlug: new Map(),
}));

// navigator.clipboard のモック
const clipboardWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(globalThis, "navigator", {
  value: { clipboard: { writeText: clipboardWriteText } },
  writable: true,
  configurable: true,
});

describe("NumberBaseConverterTile (variant=full)", () => {
  beforeEach(() => {
    clipboardWriteText.mockClear();
  });

  // T-full-1: 基本レンダリング
  test("T-full-1: renders without crashing", () => {
    render(<NumberBaseConverterTile variant="full" />);
    // 入力欄が表示されること
    expect(screen.getByLabelText("変換する数値")).toBeInTheDocument();
    // SegmentedControl (入力基数選択) が表示されること
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  // T-full-2: Panel がルート要素
  test("T-full-2: root element is a section (Panel default)", () => {
    const { container } = render(<NumberBaseConverterTile variant="full" />);
    // Panel は デフォルト "section" タグ
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });

  // T-full-3: 入力→結果更新
  test("T-full-3: updates results when input changes (255 decimal)", () => {
    render(<NumberBaseConverterTile variant="full" />);
    const input = screen.getByLabelText("変換する数値");

    fireEvent.change(input, { target: { value: "255" } });

    // 2進数: 1111 1111, 8進数: 377, 16進数: ff
    expect(screen.getByTestId("result-binary")).toHaveTextContent("1111 1111");
    expect(screen.getByTestId("result-octal")).toHaveTextContent("377");
    expect(screen.getByTestId("result-decimal")).toHaveTextContent("255");
    expect(screen.getByTestId("result-hexadecimal")).toHaveTextContent("ff");
  });

  // T-full-4: 空入力
  test("T-full-4: shows no error and empty results on empty input", () => {
    render(<NumberBaseConverterTile variant="full" />);
    // 初期状態でエラーが出ていないこと
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    const input = screen.getByLabelText("変換する数値");
    fireEvent.change(input, { target: { value: "10" } });
    fireEvent.change(input, { target: { value: "" } });

    // エラーが消えていること
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // T-full-5: 16進入力 ff → 他基数
  test("T-full-5: correctly converts hex ff to other bases", () => {
    render(<NumberBaseConverterTile variant="full" />);

    const hexOption = screen.getByRole("radio", { name: "16進数 (HEX)" });
    fireEvent.click(hexOption);

    const input = screen.getByLabelText("変換する数値");
    fireEvent.change(input, { target: { value: "ff" } });

    expect(screen.getByTestId("result-decimal")).toHaveTextContent("255");
    expect(screen.getByTestId("result-binary")).toHaveTextContent("1111 1111");
    expect(screen.getByTestId("result-octal")).toHaveTextContent("377");
  });

  // T-full-6: 2進入力 1010 → 他基数
  test("T-full-6: correctly converts binary 1010 to other bases", () => {
    render(<NumberBaseConverterTile variant="full" />);

    const binOption = screen.getByRole("radio", { name: "2進数 (BIN)" });
    fireEvent.click(binOption);

    const input = screen.getByLabelText("変換する数値");
    fireEvent.change(input, { target: { value: "1010" } });

    expect(screen.getByTestId("result-decimal")).toHaveTextContent("10");
    expect(screen.getByTestId("result-hexadecimal")).toHaveTextContent("a");
    expect(screen.getByTestId("result-octal")).toHaveTextContent("12");
  });

  // T-full-7: 無効入力でエラー表示
  test("T-full-7: shows error for invalid binary input", () => {
    render(<NumberBaseConverterTile variant="full" />);

    const binOption = screen.getByRole("radio", { name: "2進数 (BIN)" });
    fireEvent.click(binOption);

    const input = screen.getByLabelText("変換する数値");
    fireEvent.change(input, { target: { value: "123" } });

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  // T-full-8: ARIA - radiogroup に aria-label が付いている
  test("T-full-8: radiogroup has aria-label", () => {
    render(<NumberBaseConverterTile variant="full" />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toHaveAttribute("aria-label");
  });

  // T-full-9: ARIA - role=status aria-live=polite のライブリージョン
  test("T-full-9: has role=status aria-live=polite on summary region", () => {
    render(<NumberBaseConverterTile variant="full" />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  // T-full-10: コピーボタン - クリック後に「コピーしました」
  test("T-full-10: copy button shows COPIED_LABEL after click", async () => {
    render(<NumberBaseConverterTile variant="full" />);

    const input = screen.getByLabelText("変換する数値");
    fireEvent.change(input, { target: { value: "255" } });

    const copyButtons = screen.getAllByRole("button", { name: "コピー" });
    expect(copyButtons.length).toBeGreaterThan(0);
    fireEvent.click(copyButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "コピーしました" }),
      ).toBeInTheDocument();
    });
  });

  // T-full-11: コピーボタン - 入力空のとき disabled
  test("T-full-11: copy buttons are disabled when input is empty", () => {
    render(<NumberBaseConverterTile variant="full" />);

    const copyButtons = screen.getAllByRole("button", { name: "コピー" });
    copyButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  // T-full-12: コピーボタン - 結果あり時 enabled
  test("T-full-12: copy buttons are enabled when there is a result", () => {
    render(<NumberBaseConverterTile variant="full" />);

    const input = screen.getByLabelText("変換する数値");
    fireEvent.change(input, { target: { value: "10" } });

    const copyButtons = screen.getAllByRole("button", { name: "コピー" });
    copyButtons.forEach((btn) => {
      expect(btn).not.toBeDisabled();
    });
  });

  // T-full-13: clipboard 不在時の silent fail
  test("T-full-13: does not throw when clipboard is not available", async () => {
    const originalNavigator = globalThis.navigator;
    Object.defineProperty(globalThis, "navigator", {
      value: {},
      writable: true,
      configurable: true,
    });

    render(<NumberBaseConverterTile variant="full" />);
    const input = screen.getByLabelText("変換する数値");
    fireEvent.change(input, { target: { value: "10" } });

    const copyButtons = screen.getAllByRole("button", { name: "コピー" });
    expect(() => fireEvent.click(copyButtons[0])).not.toThrow();

    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  // T-full-14: BigInt 大数の変換
  test("T-full-14: handles large BigInt number conversion", () => {
    render(<NumberBaseConverterTile variant="full" />);

    const input = screen.getByLabelText("変換する数値");
    fireEvent.change(input, { target: { value: "18446744073709551615" } });

    expect(screen.getByTestId("result-hexadecimal")).toHaveTextContent(
      "ff ff ff ff ff ff ff ff",
    );
  });

  // T-full-15: 基数切替後に古い結果が残らない（G-1 要件）
  test("T-full-15: clears input when base is changed", () => {
    render(<NumberBaseConverterTile variant="full" />);

    const input = screen.getByLabelText("変換する数値");
    fireEvent.change(input, { target: { value: "255" } });

    // 2進数へ切り替え → 入力がクリアされること
    const binOption = screen.getByRole("radio", { name: "2進数 (BIN)" });
    fireEvent.click(binOption);

    // 古い結果が消えていること（入力がクリアされているため結果も空）
    expect(screen.getByTestId("result-binary")).toHaveTextContent("—");
  });

  // T-full-16: 4基数の結果カードがすべて表示される
  test("T-full-16: shows all 4 result cards", () => {
    render(<NumberBaseConverterTile variant="full" />);
    expect(screen.getByTestId("result-binary")).toBeInTheDocument();
    expect(screen.getByTestId("result-octal")).toBeInTheDocument();
    expect(screen.getByTestId("result-decimal")).toBeInTheDocument();
    expect(screen.getByTestId("result-hexadecimal")).toBeInTheDocument();
  });
});

describe("NumberBaseConverterTile (variant=bin-hex)", () => {
  beforeEach(() => {
    clipboardWriteText.mockClear();
  });

  // T-bin-hex-1: 基本レンダリング
  test("T-bin-hex-1: renders without crashing", () => {
    render(<NumberBaseConverterTile variant="bin-hex" />);
    expect(screen.getByLabelText("変換する数値（2進数）")).toBeInTheDocument();
  });

  // T-bin-hex-2: SegmentedControl が表示されない（固定 variant）
  test("T-bin-hex-2: SegmentedControl is not shown (fixed variant)", () => {
    render(<NumberBaseConverterTile variant="bin-hex" />);
    // 基数選択の radiogroup が非表示
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  // T-bin-hex-3: 2進入力 11111111 → 16進結果 ff 表示
  test("T-bin-hex-3: converts binary 11111111 to hex ff", () => {
    render(<NumberBaseConverterTile variant="bin-hex" />);

    const input = screen.getByLabelText("変換する数値（2進数）");
    fireEvent.change(input, { target: { value: "11111111" } });

    expect(screen.getByTestId("result-hexadecimal")).toHaveTextContent("ff");
  });

  // T-bin-hex-4: 2進→16進変換であることが一目で分かる見出し
  test("T-bin-hex-4: shows conversion direction label", () => {
    render(<NumberBaseConverterTile variant="bin-hex" />);
    // 「2進数 → 16進数」などの方向ラベルが表示されていること
    expect(screen.getByText(/2進数.*16進数|2進.*16進/)).toBeInTheDocument();
  });

  // T-bin-hex-5: エラー表示（無効な2進入力）
  test("T-bin-hex-5: shows error for invalid binary input", () => {
    render(<NumberBaseConverterTile variant="bin-hex" />);

    const input = screen.getByLabelText("変換する数値（2進数）");
    fireEvent.change(input, { target: { value: "123" } });

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  // T-bin-hex-6: コピーボタン - 結果あり時 enabled
  test("T-bin-hex-6: copy button is enabled when there is a result", () => {
    render(<NumberBaseConverterTile variant="bin-hex" />);

    const input = screen.getByLabelText("変換する数値（2進数）");
    fireEvent.change(input, { target: { value: "11111111" } });

    const copyButton = screen.getByRole("button", { name: "コピー" });
    expect(copyButton).not.toBeDisabled();
  });

  // T-bin-hex-7: role=status aria-live=polite
  test("T-bin-hex-7: has role=status aria-live=polite", () => {
    render(<NumberBaseConverterTile variant="bin-hex" />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  // T-bin-hex-8: Panel がルート要素
  test("T-bin-hex-8: root element is a section (Panel default)", () => {
    const { container } = render(<NumberBaseConverterTile variant="bin-hex" />);
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });
});

describe("NumberBaseConverterTile (複数インスタンス同居)", () => {
  // T-multi-1: DOM id 一意性
  test("T-multi-1: DOM ids are unique across multiple instances", () => {
    render(
      <>
        <NumberBaseConverterTile variant="full" />
        <NumberBaseConverterTile variant="bin-hex" />
      </>,
    );

    // 全ての input id を取得して重複がないこと
    const inputs = document.querySelectorAll("input[id]");
    const ids = Array.from(inputs).map((el) => el.getAttribute("id"));
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  // T-multi-2: 複数インスタンスが独立して動作する
  test("T-multi-2: multiple instances operate independently", () => {
    render(
      <>
        <NumberBaseConverterTile variant="full" />
        <NumberBaseConverterTile variant="full" />
      </>,
    );

    const inputs = screen.getAllByLabelText("変換する数値");
    expect(inputs.length).toBe(2);

    // 1番目のインスタンスのみ入力
    fireEvent.change(inputs[0], { target: { value: "255" } });

    // 2番目のインスタンスは変化しないこと
    const resultCards = screen.getAllByTestId("result-binary");
    expect(resultCards[0]).toHaveTextContent("1111 1111");
    expect(resultCards[1]).toHaveTextContent("—");
  });
});

describe("NumberBaseConverterTile (CSS トークン検証)", () => {
  // T-css-1: 旧 --color-* トークン不使用・--accent 直塗り禁止・font-weight 700 禁止
  test("T-css-1: CSS does not use deprecated --color-* tokens or forbidden styles", () => {
    const css = readFileSync(
      join(__dirname, "..", "NumberBaseConverterTile.module.css"),
      "utf-8",
    );
    expect(css).not.toMatch(/var\(--color-/);
    expect(css).not.toMatch(/background[^;]*var\(--accent\)/);
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });
});
