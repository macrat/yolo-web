import { expect, test, describe, vi, it } from "vitest";
import { createRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import Button from "@/components/Button";

describe("Button", () => {
  test("children が描画される", () => {
    render(<Button>テストボタン</Button>);
    expect(
      screen.getByRole("button", { name: "テストボタン" }),
    ).toBeInTheDocument();
  });

  test("variant prop: default は data-variant='default' を持つ", () => {
    render(<Button variant="default">default</Button>);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-variant",
      "default",
    );
  });

  test("variant prop: primary は data-variant='primary' を持つ", () => {
    render(<Button variant="primary">primary</Button>);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-variant",
      "primary",
    );
  });

  test("primary は反転の地を持つ（data-inverted）", () => {
    render(<Button variant="primary">primary</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-inverted");
  });

  test("default は反転の地を持たない", () => {
    render(<Button>default</Button>);
    expect(screen.getByRole("button")).not.toHaveAttribute("data-inverted");
  });

  test("ref は button 要素に渡る", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>次へ</Button>);
    expect(ref.current).toBe(screen.getByRole("button", { name: "次へ" }));
  });

  test("variant を省略すると data-variant='default' がデフォルト", () => {
    render(<Button>省略</Button>);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-variant",
      "default",
    );
  });

  test("通常時に onClick が発火する", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>クリック</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("disabled 時に onClick が発火しない", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        無効
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  test("disabled 時に button 要素が disabled 属性を持つ", () => {
    render(<Button disabled>無効</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  test("type を省略すると type='button' がデフォルト", () => {
    render(<Button>送信</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  test("type='submit' を渡すと type='submit' になる", () => {
    render(<Button type="submit">送信</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  test("type='reset' を渡すと type='reset' になる", () => {
    render(<Button type="reset">リセット</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "reset");
  });

  it(".button has min-height: 44px (§6 tap target)", () => {
    const cssPath = resolve(__dirname, "../Button.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const buttonBlock = css.match(/\.button\s*\{[^}]+\}/)?.[0] ?? "";
    expect(buttonBlock).toContain("min-height: 44px");
  });

  test("無効で理由があれば、理由を横に出してボタンの説明にする", () => {
    render(
      <Button disabled disabledReason="文字を入れると押せます">
        変換
      </Button>,
    );
    const button = screen.getByRole("button", { name: "変換" });
    expect(button).toHaveAccessibleDescription("文字を入れると押せます");
    expect(screen.getByText("文字を入れると押せます")).toBeInTheDocument();
  });

  test("有効なときは理由を出さない", () => {
    render(<Button disabledReason="文字を入れると押せます">変換</Button>);
    expect(
      screen.queryByText("文字を入れると押せます"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-describedby");
  });

  test("呼び出し側の aria-describedby と理由を両方つなぐ", () => {
    render(
      <>
        <p id="note">注記</p>
        <Button disabled disabledReason="理由" aria-describedby="note">
          変換
        </Button>
      </>,
    );
    expect(screen.getByRole("button")).toHaveAccessibleDescription("注記 理由");
  });
});
