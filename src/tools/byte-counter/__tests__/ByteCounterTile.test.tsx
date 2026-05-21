import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ByteCounterTile from "../ByteCounterTile";

describe("ByteCounterTile", () => {
  it("renders the tile component", () => {
    render(<ByteCounterTile />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("displays byte count of 3 when 'abc' is entered", () => {
    render(<ByteCounterTile />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "abc" } });
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("displays byte count of 9 when '日本語' is entered (3 bytes each for CJK)", () => {
    render(<ByteCounterTile />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "日本語" } });
    expect(screen.getByText("9")).toBeInTheDocument();
  });

  it("has a link to /tools/byte-counter", () => {
    render(<ByteCounterTile />);
    const link = screen.getByRole("link", { name: /詳細ページで開く/ });
    expect(link).toHaveAttribute("href", "/tools/byte-counter");
  });

  it("has aria-label on the input element", () => {
    render(<ByteCounterTile />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-label", "バイト数カウント入力欄");
  });

  it("shows バイト数 label in status region", () => {
    render(<ByteCounterTile />);
    expect(screen.getByText("バイト数")).toBeInTheDocument();
  });
});
