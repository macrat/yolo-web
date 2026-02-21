import { expect, test, describe, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ThemeToggle from "../ThemeToggle";

// Mock next-themes
const mockSetTheme = vi.fn();
let mockTheme = "system";
let mockResolvedTheme = "light";
let mockMounted = true;

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
    resolvedTheme: mockResolvedTheme,
  }),
}));

// Mock useState to control mounted state when needed
const originalUseState = await import("react").then((m) => m.useState);

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
    mockTheme = "system";
    mockResolvedTheme = "light";
    mockMounted = true;
  });

  test("renders a button with accessible label", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label");
  });

  test("has type=button attribute", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });

  // Theme cycle: system -> light -> dark -> system
  test("cycles from system to light", () => {
    mockTheme = "system";
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  test("cycles from light to dark", () => {
    mockTheme = "light";
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  test("cycles from dark to system", () => {
    mockTheme = "dark";
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });

  // Icon display per theme
  test("displays system icon when theme is system", () => {
    mockTheme = "system";
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    // System icon has a <rect> element (monitor shape)
    const rect = button.querySelector("rect");
    expect(rect).toBeInTheDocument();
  });

  test("displays sun icon when theme is light", () => {
    mockTheme = "light";
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    // Sun icon has a <circle> element
    const circle = button.querySelector("circle");
    expect(circle).toBeInTheDocument();
  });

  test("displays moon icon when theme is dark", () => {
    mockTheme = "dark";
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    // Moon icon has a <path> element but no <circle> or <rect>
    const path = button.querySelector("path");
    const circle = button.querySelector("circle");
    const rect = button.querySelector("rect");
    expect(path).toBeInTheDocument();
    expect(circle).not.toBeInTheDocument();
    expect(rect).not.toBeInTheDocument();
  });

  // Accessible labels
  test("shows correct aria-label for system theme", () => {
    mockTheme = "system";
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute(
      "aria-label",
      expect.stringContaining("システム設定に従う"),
    );
  });

  test("shows correct aria-label for light theme", () => {
    mockTheme = "light";
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute(
      "aria-label",
      expect.stringContaining("ライトモード"),
    );
  });

  test("shows correct aria-label for dark theme", () => {
    mockTheme = "dark";
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute(
      "aria-label",
      expect.stringContaining("ダークモード"),
    );
  });
});
