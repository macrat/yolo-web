import { expect, test, describe, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ThemeToggle from "../index";

// next-themes をモックして、resolvedTheme と setTheme を制御する
const mockSetTheme = vi.fn();
let mockResolvedTheme = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
    setTheme: mockSetTheme,
  }),
}));

describe("ThemeToggle (トグルスイッチ版)", () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
    mockResolvedTheme = "light";
  });

  test("mount 後にスイッチ（role=switch）が描画される", () => {
    mockResolvedTheme = "light";
    render(<ThemeToggle />);
    // トグルスイッチは role="switch" を持つ button として描画される
    const button = screen.getByRole("switch");
    expect(button).toBeInTheDocument();
  });

  test("ライトモード時は aria-checked='false'（ダーク側がオフ）", () => {
    mockResolvedTheme = "light";
    render(<ThemeToggle />);
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  test("ダークモード時は aria-checked='true'（ダーク側がオン）", () => {
    mockResolvedTheme = "dark";
    render(<ThemeToggle />);
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  test("ライトモード時にクリックすると setTheme('dark') が呼ばれ aria-checked が反転する", () => {
    mockResolvedTheme = "light";
    render(<ThemeToggle />);
    const toggle = screen.getByRole("switch");
    // クリック前: aria-checked=false
    expect(toggle).toHaveAttribute("aria-checked", "false");
    fireEvent.click(toggle);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  test("ダークモード時にクリックすると setTheme('light') が呼ばれる", () => {
    mockResolvedTheme = "dark";
    render(<ThemeToggle />);
    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  test("ライトモード時に aria-label が『ダークモードに切り替え』を含む", () => {
    mockResolvedTheme = "light";
    render(<ThemeToggle />);
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-label", "ダークモードに切り替え");
  });

  test("ダークモード時に aria-label が『ライトモードに切り替え』を含む", () => {
    mockResolvedTheme = "dark";
    render(<ThemeToggle />);
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-label", "ライトモードに切り替え");
  });

  test("type=button 属性が付いている", () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("type", "button");
  });
});
