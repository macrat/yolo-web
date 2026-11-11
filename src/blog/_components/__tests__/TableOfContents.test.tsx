import { describe, test, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import TableOfContents from "@/blog/_components/TableOfContents";

const headings = [
  { level: 2, text: "はじめに", id: "intro" },
  { level: 3, text: "背景", id: "background" },
  { level: 4, text: "細かい話", id: "details" },
  { level: 2, text: "まとめ", id: "conclusion" },
];

describe("TableOfContents", () => {
  test("見出しへ移るリンクを本文の順に並べる", () => {
    render(<TableOfContents headings={headings} onSelect={() => {}} />);
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "はじめに",
      "背景",
      "細かい話",
      "まとめ",
    ]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "#intro",
      "#background",
      "#details",
      "#conclusion",
    ]);
  });

  test("## の項目は字下げせず、### とそれより深い項目を同じ1段だけ字下げする", () => {
    render(<TableOfContents headings={headings} onSelect={() => {}} />);
    const items = screen.getAllByRole("listitem");
    const indented = items.map((item) => item.className !== "");
    expect(indented).toEqual([false, true, true, false]);
    expect(items[1].className).toBe(items[2].className);
  });

  test("項目を押すと、その見出しを onSelect に渡す", () => {
    const onSelect = vi.fn();
    render(<TableOfContents headings={headings} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("link", { name: "細かい話" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(headings[2]);
  });
});
