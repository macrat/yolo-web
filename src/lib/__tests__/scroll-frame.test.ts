import { describe, test, expect } from "vitest";
import { markScrollFrame, SCROLL_FRAME_LABELS } from "@/lib/scroll-frame";

function frameWith(scrollWidth: number, clientWidth: number): HTMLElement {
  const frame = document.createElement("div");
  Object.defineProperty(frame, "scrollWidth", { value: scrollWidth });
  Object.defineProperty(frame, "clientWidth", { value: clientWidth });
  return frame;
}

describe("markScrollFrame", () => {
  test("はみ出す枠に止まりどころ・名前・印を付ける", () => {
    const frame = frameWith(500, 300);
    markScrollFrame(frame, SCROLL_FRAME_LABELS.table);
    expect(frame.tabIndex).toBe(0);
    expect(frame.getAttribute("role")).toBe("region");
    expect(frame.getAttribute("aria-label")).toBe(
      "表（横にスクロールできます）",
    );
    expect(frame.hasAttribute("data-scrolls")).toBe(true);
  });

  test("はみ出さない枠からは外す", () => {
    const frame = frameWith(300, 300);
    frame.tabIndex = 0;
    frame.setAttribute("role", "region");
    frame.setAttribute("aria-label", SCROLL_FRAME_LABELS.code);
    frame.dataset.scrolls = "";
    markScrollFrame(frame, SCROLL_FRAME_LABELS.code);
    for (const name of ["tabindex", "role", "aria-label", "data-scrolls"]) {
      expect(frame.hasAttribute(name)).toBe(false);
    }
  });
});
