import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Panel from "../index";

describe("Panel", () => {
  it("デフォルトで section タグでレンダリングされる", () => {
    render(<Panel>content</Panel>);
    const el = screen.getByText("content").closest("section");
    expect(el).toBeInTheDocument();
  });

  it("as prop でタグを変更できる", () => {
    render(<Panel as="article">content</Panel>);
    const el = screen.getByText("content").closest("article");
    expect(el).toBeInTheDocument();
  });

  it("className prop が結合される", () => {
    render(<Panel className="extra">content</Panel>);
    const el = screen.getByText("content").closest("section");
    expect(el?.className).toContain("extra");
  });
});
