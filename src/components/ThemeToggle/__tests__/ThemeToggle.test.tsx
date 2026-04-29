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

describe("ThemeToggle (新コンポーネント)", () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
    mockResolvedTheme = "light";
  });

  test("mount 後にボタンが描画される（ライトモード時は「ダーク」と表示）", () => {
    mockResolvedTheme = "light";
    render(<ThemeToggle />);
    // mount 後のボタンが表示される
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    // ライトモードのとき「ダーク」と表示
    expect(button).toHaveTextContent("ダーク");
  });

  test("mount 後にボタンが描画される（ダークモード時は「ライト」と表示）", () => {
    mockResolvedTheme = "dark";
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    // ダークモードのとき「ライト」と表示
    expect(button).toHaveTextContent("ライト");
  });

  test("ライトモード時にクリックすると setTheme('dark') が呼ばれる", () => {
    mockResolvedTheme = "light";
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  test("ダークモード時にクリックすると setTheme('light') が呼ばれる", () => {
    mockResolvedTheme = "dark";
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  test("ボタンに aria-label が設定されている", () => {
    mockResolvedTheme = "light";
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label");
    // aria-label が空でないことを確認
    const ariaLabel = button.getAttribute("aria-label");
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel!.length).toBeGreaterThan(0);
  });

  test("type=button 属性が付いている", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });
});
