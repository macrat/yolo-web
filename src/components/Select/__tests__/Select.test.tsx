import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import Select from "../index";

describe("Select", () => {
  it("デフォルトで select 要素をレンダリングする", () => {
    render(
      <Select aria-label="選択肢">
        <option value="a">A</option>
      </Select>,
    );
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  it("children として渡した option が描画される", () => {
    render(
      <Select aria-label="フルーツ">
        <option value="apple">りんご</option>
        <option value="banana">バナナ</option>
        <option value="cherry">さくらんぼ</option>
      </Select>,
    );
    expect(screen.getByText("りんご")).toBeInTheDocument();
    expect(screen.getByText("バナナ")).toBeInTheDocument();
    expect(screen.getByText("さくらんぼ")).toBeInTheDocument();
  });

  it("controlled: value/onChange が機能する", () => {
    const handleChange = vi.fn();
    render(
      <Select aria-label="選択" value="b" onChange={handleChange}>
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>,
    );
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("b");

    fireEvent.change(select, { target: { value: "a" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("uncontrolled: defaultValue が反映される", () => {
    render(
      <Select aria-label="選択" defaultValue="b">
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>,
    );
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("b");
  });

  it("disabled 属性が透過される", () => {
    render(
      <Select aria-label="選択" disabled>
        <option value="a">A</option>
      </Select>,
    );
    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
  });

  it("name 属性が透過される", () => {
    render(
      <Select aria-label="選択" name="fruit">
        <option value="a">A</option>
      </Select>,
    );
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("name", "fruit");
  });

  it("aria-label 属性が透過される", () => {
    render(
      <Select aria-label="フルーツ選択">
        <option value="a">A</option>
      </Select>,
    );
    const select = screen.getByRole("combobox", { name: "フルーツ選択" });
    expect(select).toBeInTheDocument();
  });

  it("aria-describedby 属性が透過される", () => {
    render(
      <>
        <span id="desc">フルーツを選んでください</span>
        <Select aria-label="選択" aria-describedby="desc">
          <option value="a">A</option>
        </Select>
      </>,
    );
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("aria-describedby", "desc");
  });

  it("data-* など任意の HTML 属性が透過される（...rest）", () => {
    render(
      <Select aria-label="選択" data-testid="my-select">
        <option value="a">A</option>
      </Select>,
    );
    const select = screen.getByTestId("my-select");
    expect(select).toBeInTheDocument();
  });

  it("カスタム className が追加される", () => {
    render(
      <Select aria-label="選択" className="custom-class">
        <option value="a">A</option>
      </Select>,
    );
    const select = screen.getByRole("combobox");
    expect(select.className).toMatch(/custom-class/);
  });

  // CSS 規約（DESIGN.md §4: 入力欄は角丸 2px の例外）: --radius-sm の使用を確認
  it("Select.module.css が --radius-sm を使っている", () => {
    const cssPath = resolve(__dirname, "../Select.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toContain("var(--radius-sm)");
  });

  // CSS 規約: --rule-strong の使用を確認
  it("Select.module.css が --rule-strong を使っている", () => {
    const cssPath = resolve(__dirname, "../Select.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toContain("var(--rule-strong)");
  });

  // CSS 規約: フォーカスに outline を使用し border-color を使わない
  it("Select.module.css のフォーカスは outline を使っている", () => {
    const cssPath = resolve(__dirname, "../Select.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toContain("outline: 2px solid var(--accent)");
    expect(css).toContain("outline-offset: 2px");
  });

  // WCAG 2.5.5 AAA タップターゲット保証
  it(".select has min-height: 44px for WCAG 2.5.5 AAA tap target", () => {
    const cssPath = resolve(__dirname, "../Select.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const selectBlock = css.match(/\.select\s*\{[^}]+\}/)?.[0] ?? "";
    expect(selectBlock).toContain("min-height: 44px");
  });

  // forwardRef: ref が select 要素に届く
  it("ref が select 要素に届く（forwardRef）", async () => {
    const { default: React } = await import("react");
    const ref = React.createRef<HTMLSelectElement>();
    render(
      <Select aria-label="選択" ref={ref}>
        <option value="a">A</option>
      </Select>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("SELECT");
  });
});
