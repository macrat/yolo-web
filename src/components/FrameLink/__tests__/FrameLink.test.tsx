/**
 * FrameLink のテスト。行き先・現在地・太字の幅を取るための字を見る。
 */
import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FrameLink from "..";

describe("FrameLink", () => {
  test("表示名で読まれ、行き先を持つ", () => {
    render(<FrameLink href="/play" label="遊び" current={false} />);
    const link = screen.getByRole("link", { name: "遊び" });
    expect(link).toHaveAttribute("href", "/play");
    expect(link).not.toHaveAttribute("aria-current");
  });

  test("現在地では aria-current=page を持つ（§6）", () => {
    render(<FrameLink href="/play" label="遊び" current />);
    expect(screen.getByRole("link", { name: "遊び" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("太字の幅を取るため、字を data-label にも持つ", () => {
    render(<FrameLink href="/play" label="遊び" current={false} />);
    const label = screen.getByText("遊び");
    expect(label).toHaveAttribute("data-label", "遊び");
  });

  // 縁の見えないコントロールなので、最初の字を左端に揃え、線とリングを字の左右に 8px を持つ押せる範囲に出す（DESIGN.md §5）
  test("縁の見えないコントロールの箱で組む", () => {
    render(<FrameLink href="/play" label="遊び" current={false} />);
    expect(screen.getByRole("link", { name: "遊び" })).toHaveAttribute(
      "data-text-box",
      "inline",
    );
  });
});
