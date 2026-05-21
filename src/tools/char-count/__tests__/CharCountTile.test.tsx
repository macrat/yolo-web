import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CharCountTile from "../CharCountTile";

describe("CharCountTile", () => {
  it("renders the tile component", () => {
    render(<CharCountTile />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("displays char count of 3 when 'abc' is entered", () => {
    render(<CharCountTile />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "abc" } });
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("has a link to /tools/char-count", () => {
    render(<CharCountTile />);
    const link = screen.getByRole("link", { name: /詳細ページで開く/ });
    expect(link).toHaveAttribute("href", "/tools/char-count");
  });

  it("has aria-label on the input element", () => {
    render(<CharCountTile />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-label");
  });
});
