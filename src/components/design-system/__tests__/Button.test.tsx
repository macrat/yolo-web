import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import Button from "../Button";

describe("Button", () => {
  // --- レンダリング ---

  test("renders with label text", () => {
    render(<Button>送信</Button>);
    expect(screen.getByRole("button", { name: "送信" })).toBeInTheDocument();
  });

  test("default variant is primary", () => {
    render(<Button>primary</Button>);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-variant",
      "primary",
    );
  });

  test("renders ghost variant", () => {
    render(<Button variant="ghost">ghost</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "ghost");
  });

  test("renders danger variant", () => {
    render(<Button variant="danger">danger</Button>);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-variant",
      "danger",
    );
  });

  test("default size is md", () => {
    render(<Button>md</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "md");
  });

  test("renders size=sm", () => {
    render(<Button size="sm">sm</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "sm");
  });

  test("renders size=lg", () => {
    render(<Button size="lg">lg</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "lg");
  });

  // --- 状態 ---

  test("disabled state makes button non-clickable", () => {
    render(<Button disabled>disabled</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
  });

  test("loading state disables button and sets aria-busy", () => {
    render(<Button loading>loading</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  // --- アクセシビリティ ---

  test("default type is button to prevent accidental form submission", () => {
    render(<Button>click</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  test("type=submit can be set explicitly", () => {
    render(<Button type="submit">submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  test("fullWidth sets data-full-width attribute", () => {
    render(<Button fullWidth>full</Button>);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-full-width",
      "true",
    );
  });

  // --- インタラクション ---

  test("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  test("does not call onClick when disabled", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        click
      </Button>,
    );
    // disabled ボタンは fireEvent.click を受け付けない
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  test("does not call onClick when loading", () => {
    const handleClick = vi.fn();
    render(
      <Button loading onClick={handleClick}>
        click
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  // --- E-1: モバイル幅レイアウト（CSS 構造テスト） ---

  test("Button.module.css contains @media (min-width: query for responsive layout", () => {
    const cssPath = resolve(__dirname, "../Button.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toMatch(/@media\s*\(min-width:/);
  });

  test("Button.module.css sm size min-height is 44px (touch target)", () => {
    // sm サイズのタップターゲットが 44px 以上であることを CSS ファイルで確認。
    // WCAG 2.5.5 の要件（44×44px）を満たすことを保証する。
    // --touch-target-min (44px) 変数参照または直値 44px 以上を受け入れる。
    const cssPath = resolve(__dirname, "../Button.module.css");
    const css = readFileSync(cssPath, "utf-8");
    // [data-size="sm"] ブロック内の min-height が --touch-target-min 変数参照か 44px 以上の直値
    const smBlock = css.match(/\[data-size="sm"\]\s*\{[^}]*\}/)?.[0] ?? "";
    const hasTouchTarget =
      /min-height:\s*var\(--touch-target-min\)/.test(smBlock) ||
      /min-height:\s*(4[4-9]|[5-9]\d|\d{3,})px/.test(smBlock);
    expect(hasTouchTarget).toBe(true);
  });
});
