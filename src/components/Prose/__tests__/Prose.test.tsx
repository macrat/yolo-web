import { describe, test, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import Prose from "@/components/Prose";

const HTML =
  '<p>本文</p><div class="table-scroll"><table><tbody><tr><td>1</td></tr></tbody></table></div><pre><code>x</code></pre>';

afterEach(cleanup);

describe("Prose", () => {
  test("HTML を本文として出し、属性とクラスを渡す", () => {
    const { container } = render(
      <Prose html={HTML} className="extra" data-testid="body" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.dataset.testid).toBe("body");
    expect(root.className).toContain("extra");
    expect(root.querySelector("p")?.textContent).toBe("本文");
  });

  test("はみ出さない表とコードには、止まりどころも名前も付けない", () => {
    const { container } = render(<Prose html={HTML} />);
    for (const box of container.querySelectorAll(".table-scroll, pre")) {
      expect(box.hasAttribute("tabindex")).toBe(false);
      expect(box.hasAttribute("role")).toBe(false);
      expect(box.hasAttribute("data-scrolls")).toBe(false);
    }
  });

  test("はみ出す表とコードだけに、キーボードで送れる止まりどころと名前を付け、HTML を替えたら組み直す", () => {
    // 表とコードの中身の幅（500）が、置かれた幅（300）を超える。
    const rect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        const wide = this.tagName === "TABLE" || this.tagName === "CODE";
        return { width: wide ? 500 : 300 } as DOMRect;
      });
    try {
      const { container, rerender } = render(<Prose html={HTML} />);
      const table = container.querySelector(".table-scroll") as HTMLElement;
      const pre = container.querySelector("pre") as HTMLElement;
      expect(table.tabIndex).toBe(0);
      expect(table.getAttribute("role")).toBe("region");
      expect(table.getAttribute("aria-label")).toBe(
        "表（横にスクロールできます）",
      );
      expect(table.hasAttribute("data-scrolls")).toBe(true);
      expect(pre.tabIndex).toBe(0);
      expect(pre.getAttribute("aria-label")).toBe(
        "コード（横にスクロールできます）",
      );
      rerender(<Prose html={`${HTML}<p>足した段落</p>`} />);
      expect(
        container.querySelector(".table-scroll")!.hasAttribute("data-scrolls"),
      ).toBe(true);
    } finally {
      rect.mockRestore();
    }
  });
});
