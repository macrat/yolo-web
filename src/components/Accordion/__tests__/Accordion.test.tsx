import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Accordion from "../index";

describe("Accordion", () => {
  it("details と summary で組み、summary がラベルを持つ", () => {
    const { container } = render(
      <Accordion summary="目次">
        <p>中身</p>
      </Accordion>,
    );
    const summary = container.querySelector("details > summary");
    expect(summary).toHaveTextContent("目次");
    expect(summary).toHaveAttribute("data-text-box", "inline");
    expect(screen.getByText("中身")).toBeInTheDocument();
  });

  it("三角は支援技術に読ませない", () => {
    const { container } = render(
      <Accordion summary="目次">
        <p>中身</p>
      </Accordion>,
    );
    expect(container.querySelector("summary svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("open を渡すと開いた状態で描き、開閉で onToggle を呼ぶ", () => {
    const onToggle = vi.fn();
    const { container } = render(
      <Accordion summary="目次" open onToggle={onToggle}>
        <p>中身</p>
      </Accordion>,
    );
    const details = container.querySelector("details")!;
    expect(details.open).toBe(true);
    details.open = false;
    details.dispatchEvent(new Event("toggle"));
    expect(onToggle).toHaveBeenCalled();
  });
});
