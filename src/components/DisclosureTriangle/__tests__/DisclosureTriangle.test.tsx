import { expect, test } from "vitest";
import { render } from "@testing-library/react";
import DisclosureTriangle from "@/components/DisclosureTriangle";

test("三角は読み上げに出さない（開閉の状態はコントロールが伝える）", () => {
  const { container } = render(
    <button type="button" aria-expanded={false}>
      <DisclosureTriangle />
      例文
    </button>,
  );
  const svg = container.querySelector("button > svg");
  expect(svg).toHaveAttribute("aria-hidden", "true");
  expect(svg).toHaveAttribute("focusable", "false");
});
