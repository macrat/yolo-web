import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Panel from "../Panel";

describe("Panel", () => {
  // --- レンダリング ---

  test("renders children", () => {
    render(<Panel>本文コンテンツ</Panel>);
    expect(screen.getByText("本文コンテンツ")).toBeInTheDocument();
  });

  test("renders with default variant=default", () => {
    render(<Panel>content</Panel>);
    const el = screen.getByText("content").closest("[data-variant]");
    expect(el).toHaveAttribute("data-variant", "default");
  });

  test("renders flush variant", () => {
    render(<Panel variant="flush">content</Panel>);
    const el = screen.getByText("content").closest("[data-variant]");
    expect(el).toHaveAttribute("data-variant", "flush");
  });

  test("renders inset variant", () => {
    render(<Panel variant="inset">content</Panel>);
    const el = screen.getByText("content").closest("[data-variant]");
    expect(el).toHaveAttribute("data-variant", "inset");
  });

  test("renders as section element when as=section", () => {
    // section 要素は aria-label がなければ region ロールを持たない（ARIA 仕様）。
    // aria-label を付与したケースで region ロールを確認する。
    render(
      <Panel as="section" aria-label="ツールパネル">
        content
      </Panel>,
    );
    expect(
      screen.getByRole("region", { name: "ツールパネル" }),
    ).toBeInTheDocument();
  });

  test("renders as article element when as=article", () => {
    render(<Panel as="article">content</Panel>);
    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  test("renders as div by default", () => {
    render(<Panel>content</Panel>);
    const el = screen.getByText("content").closest("div");
    expect(el).toBeInTheDocument();
  });

  // --- アクセシビリティ ---

  test("passes through aria-label", () => {
    render(<Panel aria-label="ツールパネル">content</Panel>);
    expect(screen.getByLabelText("ツールパネル")).toBeInTheDocument();
  });
});
