import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import SegmentedControl from "@/components/SegmentedControl";

const defaultOptions = [
  { label: "オプションA", value: "a" },
  { label: "オプションB", value: "b" },
  { label: "オプションC", value: "c" },
];

describe("SegmentedControl", () => {
  // ---- ARIA: radiogroup / radio / aria-checked ----

  it("コンテナが role='radiogroup' を持つ", () => {
    render(
      <SegmentedControl
        options={defaultOptions}
        value="a"
        onChange={vi.fn()}
        aria-label="テスト"
      />,
    );
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("各選択肢が role='radio' を持つ", () => {
    render(
      <SegmentedControl
        options={defaultOptions}
        value="a"
        onChange={vi.fn()}
        aria-label="テスト"
      />,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
  });

  it("選択中の選択肢は aria-checked='true'、他は aria-checked='false'", () => {
    render(
      <SegmentedControl
        options={defaultOptions}
        value="b"
        onChange={vi.fn()}
        aria-label="テスト"
      />,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("aria-checked", "false");
    expect(radios[1]).toHaveAttribute("aria-checked", "true");
    expect(radios[2]).toHaveAttribute("aria-checked", "false");
  });

  it("aria-label が radiogroup に付与される", () => {
    render(
      <SegmentedControl
        options={defaultOptions}
        value="a"
        onChange={vi.fn()}
        aria-label="モード選択"
      />,
    );
    expect(screen.getByRole("radiogroup")).toHaveAttribute(
      "aria-label",
      "モード選択",
    );
  });

  it("aria-labelledby が radiogroup に付与される", () => {
    render(
      <div>
        <span id="seg-label">テストラベル</span>
        <SegmentedControl
          options={defaultOptions}
          value="a"
          onChange={vi.fn()}
          aria-labelledby="seg-label"
        />
      </div>,
    );
    expect(screen.getByRole("radiogroup")).toHaveAttribute(
      "aria-labelledby",
      "seg-label",
    );
  });

  it("選択肢のラベルが表示される", () => {
    render(
      <SegmentedControl
        options={defaultOptions}
        value="a"
        onChange={vi.fn()}
        aria-label="テスト"
      />,
    );
    expect(screen.getByText("オプションA")).toBeInTheDocument();
    expect(screen.getByText("オプションB")).toBeInTheDocument();
    expect(screen.getByText("オプションC")).toBeInTheDocument();
  });

  // ---- ロービング tabindex ----

  it("選択中の選択肢は tabindex=0、他は tabindex=-1", () => {
    render(
      <SegmentedControl
        options={defaultOptions}
        value="b"
        onChange={vi.fn()}
        aria-label="テスト"
      />,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("tabindex", "-1");
    expect(radios[1]).toHaveAttribute("tabindex", "0");
    expect(radios[2]).toHaveAttribute("tabindex", "-1");
  });

  // ---- onChange ----

  it("クリックで onChange が発火し、正しい value が渡される", () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={defaultOptions}
        value="a"
        onChange={handleChange}
        aria-label="テスト"
      />,
    );
    const radios = screen.getAllByRole("radio");
    fireEvent.click(radios[1]);
    expect(handleChange).toHaveBeenCalledWith("b");
  });

  it("選択中の選択肢をクリックしても onChange は発火する（制御コンポーネントのため）", () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={defaultOptions}
        value="a"
        onChange={handleChange}
        aria-label="テスト"
      />,
    );
    const radios = screen.getAllByRole("radio");
    fireEvent.click(radios[0]);
    expect(handleChange).toHaveBeenCalledWith("a");
  });

  // ---- キーボード操作（矢印キー） ----

  it("右矢印キーで次の選択肢に移動して onChange を呼ぶ", () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={defaultOptions}
        value="a"
        onChange={handleChange}
        aria-label="テスト"
      />,
    );
    const radios = screen.getAllByRole("radio");
    fireEvent.keyDown(radios[0], { key: "ArrowRight" });
    expect(handleChange).toHaveBeenCalledWith("b");
  });

  it("下矢印キーで次の選択肢に移動して onChange を呼ぶ", () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={defaultOptions}
        value="a"
        onChange={handleChange}
        aria-label="テスト"
      />,
    );
    const radios = screen.getAllByRole("radio");
    fireEvent.keyDown(radios[0], { key: "ArrowDown" });
    expect(handleChange).toHaveBeenCalledWith("b");
  });

  it("左矢印キーで前の選択肢に移動して onChange を呼ぶ", () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={defaultOptions}
        value="b"
        onChange={handleChange}
        aria-label="テスト"
      />,
    );
    const radios = screen.getAllByRole("radio");
    fireEvent.keyDown(radios[1], { key: "ArrowLeft" });
    expect(handleChange).toHaveBeenCalledWith("a");
  });

  it("上矢印キーで前の選択肢に移動して onChange を呼ぶ", () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={defaultOptions}
        value="b"
        onChange={handleChange}
        aria-label="テスト"
      />,
    );
    const radios = screen.getAllByRole("radio");
    fireEvent.keyDown(radios[1], { key: "ArrowUp" });
    expect(handleChange).toHaveBeenCalledWith("a");
  });

  it("最後の選択肢で右矢印キーを押すと先頭に折り返す", () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={defaultOptions}
        value="c"
        onChange={handleChange}
        aria-label="テスト"
      />,
    );
    const radios = screen.getAllByRole("radio");
    fireEvent.keyDown(radios[2], { key: "ArrowRight" });
    expect(handleChange).toHaveBeenCalledWith("a");
  });

  it("最初の選択肢で左矢印キーを押すと末尾に折り返す", () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={defaultOptions}
        value="a"
        onChange={handleChange}
        aria-label="テスト"
      />,
    );
    const radios = screen.getAllByRole("radio");
    fireEvent.keyDown(radios[0], { key: "ArrowLeft" });
    expect(handleChange).toHaveBeenCalledWith("c");
  });

  it("Enter キーで onChange を呼ぶ", () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={defaultOptions}
        value="a"
        onChange={handleChange}
        aria-label="テスト"
      />,
    );
    const radios = screen.getAllByRole("radio");
    fireEvent.keyDown(radios[1], { key: "Enter" });
    expect(handleChange).toHaveBeenCalledWith("b");
  });

  it("Space キーで onChange を呼ぶ", () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={defaultOptions}
        value="a"
        onChange={handleChange}
        aria-label="テスト"
      />,
    );
    const radios = screen.getAllByRole("radio");
    fireEvent.keyDown(radios[1], { key: " " });
    expect(handleChange).toHaveBeenCalledWith("b");
  });

  // ---- CSS 検証: --accent 直塗り禁止 ----

  it("CSS: 選択中の背景に --accent を直接使っていない（--bg-invert を使う）", () => {
    const cssPath = resolve(__dirname, "../SegmentedControl.module.css");
    const css = readFileSync(cssPath, "utf-8");
    // 選択中スタイルブロックに background: var(--accent) が無いことを確認
    expect(css).not.toMatch(/background:\s*var\(--accent\)/);
    // --bg-invert が使われていることを確認
    expect(css).toContain("--bg-invert");
  });

  it("CSS: 選択中の文字色に --fg-invert を使っている", () => {
    const cssPath = resolve(__dirname, "../SegmentedControl.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toContain("--fg-invert");
  });

  // ---- CSS 検証: フォーカスアウトライン ----

  it("CSS: フォーカスに outline: 2px solid var(--accent) を使っている", () => {
    const cssPath = resolve(__dirname, "../SegmentedControl.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toContain("outline: 2px solid var(--accent)");
    expect(css).toContain("outline-offset: 2px");
  });

  // ---- CSS 検証: 角丸 ----

  it("CSS: 角丸に --r-interactive を使っている", () => {
    const cssPath = resolve(__dirname, "../SegmentedControl.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toContain("--r-interactive");
  });

  // ---- CSS 検証: font-weight:700 不使用 ----

  it("CSS: font-weight:700 を使っていない", () => {
    const cssPath = resolve(__dirname, "../SegmentedControl.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });
});
