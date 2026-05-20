import { expect, test, describe, vi, it } from "vitest";
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

  // 旧 ghost variant は廃止。TypeScript 型から除外されているため、
  // ランタイムでも "ghost" を受け付けないことを確認する（型レベルの保証で十分）。

  test("variant を省略すると data-variant='default' がデフォルト", () => {
    render(<Button>省略</Button>);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-variant",
      "default",
    );
  });

  test("size prop: default は data-size='default' を持つ", () => {
    render(<Button size="default">default size</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "default");
  });

  test("size prop: small は data-size='small' を持つ", () => {
    render(<Button size="small">small</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "small");
  });

  test("size を省略すると data-size='default' がデフォルト", () => {
    render(<Button>省略</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "default");
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

  // WCAG 2.5.5 AAA タップターゲット保証
  it(".button has min-height: 44px for WCAG 2.5.5 AAA tap target", () => {
    const cssPath = resolve(__dirname, "../Button.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const buttonBlock = css.match(/\.button\s*\{[^}]+\}/)?.[0] ?? "";
    expect(buttonBlock).toContain("min-height: 44px");
  });

  // small は密集レイアウト限定で WCAG 非準拠のまま据え置く設計意図の回帰防止
  // .button からの cascade 継承（min-height: 44px）を unset で明示的に切ること
  it(".sizeSmall does not enforce min-height: 44px (intentional: dense-layout-only variant)", () => {
    const cssPath = resolve(__dirname, "../Button.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const sizeSmallBlock = css.match(/\.sizeSmall\s*\{[^}]+\}/)?.[0] ?? "";
    expect(sizeSmallBlock).not.toContain("min-height: 44px");
  });

  it(".sizeSmall explicitly sets min-height: unset to cut cascade from .button", () => {
    const cssPath = resolve(__dirname, "../Button.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const sizeSmallBlock = css.match(/\.sizeSmall\s*\{[^}]+\}/)?.[0] ?? "";
    expect(sizeSmallBlock).toContain("min-height: unset");
  });
});
