import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TableOfContents from "@/blog/_components/TableOfContents";

const mockHeadings = [
  { level: 2, text: "はじめに", id: "intro" },
  { level: 3, text: "背景", id: "background" },
  { level: 2, text: "まとめ", id: "conclusion" },
];

describe("TableOfContents", () => {
  test("renders 'h2' with text '目次'", () => {
    render(<TableOfContents headings={mockHeadings} />);
    expect(screen.getByRole("heading", { name: "目次" })).toBeInTheDocument();
  });

  test("renders all heading links", () => {
    render(<TableOfContents headings={mockHeadings} />);
    expect(screen.getByRole("link", { name: "はじめに" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "背景" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "まとめ" })).toBeInTheDocument();
  });

  test("each link href points to the heading id", () => {
    render(<TableOfContents headings={mockHeadings} />);
    expect(screen.getByRole("link", { name: "はじめに" })).toHaveAttribute(
      "href",
      "#intro",
    );
    expect(screen.getByRole("link", { name: "背景" })).toHaveAttribute(
      "href",
      "#background",
    );
  });

  test("returns null when headings array is empty", () => {
    const { container } = render(<TableOfContents headings={[]} />);
    expect(container.innerHTML).toBe("");
  });

  test("nav has aria-label 'Table of contents'", () => {
    render(<TableOfContents headings={mockHeadings} />);
    expect(
      screen.getByRole("navigation", { name: "Table of contents" }),
    ).toBeInTheDocument();
  });
});
