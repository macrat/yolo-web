import { act } from "react";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import QuantityBars, { type QuantityBar } from "@/components/QuantityBars";
import { layoutQuantityBars } from "@/components/QuantityBars/layout";

const distribution: QuantityBar[] = [
  { name: "1回目", value: 2, valueText: "2" },
  { name: "2回目", value: 8, valueText: "8", current: true },
  { name: "3回目", value: 0, valueText: "0" },
];

// jsdom は字を組まないので、Range の矩形を持たない。字の幅を、字の数 × 10px として返す。
beforeAll(() => {
  Range.prototype.getBoundingClientRect = function (this: Range) {
    const width = (this.startContainer.textContent ?? "").length * 10;
    return { width } as DOMRect;
  };
});

function fillWidths(list: HTMLElement): (string | null)[] {
  return [...list.querySelectorAll("li")].map((item) => {
    const fill = item.querySelector<HTMLElement>("[aria-hidden] > span");
    return fill ? fill.style.width : null;
  });
}

describe("QuantityBars", () => {
  test("一覧の行ごとに、名前・値・「今回」の順に読み、帯の図と進み具合を読ませない", () => {
    render(<QuantityBars label="当てた回数" items={distribution} />);
    const list = screen.getByRole("list", { name: "当てた回数" });
    const items = within(list).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "1回目2",
      "2回目8今回",
      "3回目0",
    ]);
    expect(screen.queryByRole("progressbar")).toBeNull();
    for (const item of items) {
      expect(item.querySelector('[aria-hidden="true"]')).not.toBeNull();
    }
  });

  test("上限を省くと、いちばん多い行が枠いっぱいに塗られ、値が0の行は塗らない", () => {
    render(<QuantityBars label="分布" items={distribution} />);
    expect(fillWidths(screen.getByRole("list"))).toEqual(["25%", "100%", null]);
  });

  test("満点を上限に渡すと、満点に対する割合で塗る", () => {
    render(
      <QuantityBars
        label="スコア"
        max={100}
        items={[
          { name: "理論", value: 75, valueText: "75%" },
          { name: "創造", value: 0, valueText: "0%" },
        ]}
      />,
    );
    expect(fillWidths(screen.getByRole("list"))).toEqual(["75%", null]);
  });

  test("どの行も0なら、どの帯も塗らない", () => {
    render(
      <QuantityBars
        label="分布"
        items={[
          { name: "1回目", value: 0, valueText: "0" },
          { name: "2回目", value: 0, valueText: "0" },
        ]}
      />,
    );
    expect(fillWidths(screen.getByRole("list"))).toEqual([null, null]);
  });

  test("「今回」を持つ行が無ければ、「今回」の列を持たない", () => {
    render(
      <QuantityBars
        labelledBy="heading"
        items={distribution.map((item) => ({ ...item, current: false }))}
      />,
    );
    expect(
      screen.getByRole("list").querySelector("[data-bar-current]"),
    ).toBeNull();
  });

  test("サーバーで描くときだけ、組みを決めるスクリプトを並びの直後に置く", () => {
    const html = renderToString(
      <QuantityBars label="分布" items={distribution} />,
    );
    expect(html).toMatch(/<\/ul><script>/);
    const { container } = render(
      <QuantityBars label="分布" items={distribution} />,
    );
    expect(container.querySelector("script")).toBeNull();
  });
});

describe("layoutQuantityBars", () => {
  function listOf(width: number): HTMLElement {
    const { container } = render(
      <QuantityBars label="分布" items={distribution} />,
    );
    const list = container.querySelector("ul")!;
    Object.defineProperty(list, "clientWidth", { value: width });
    return list;
  }

  // 字の列は 30px（「2回目」）+ 10px（値）+ 20px（「今回」）= 60px。列のあいだは jsdom では 0。
  test("枠が並びの幅の半分以上になるなら、1行の組みにする", () => {
    const list = listOf(120);
    layoutQuantityBars(list);
    expect(list.dataset.layout).toBe("inline");
  });

  test("枠が並びの幅の半分に届かないなら、組みの属性を外して並び全体を2行の組みにする", () => {
    const list = listOf(119);
    list.dataset.layout = "inline";
    layoutQuantityBars(list);
    expect(list.dataset.layout).toBeUndefined();
  });
});

describe("サーバーで描いた並びの水和", () => {
  test("並びの直後のスクリプトが組みを付けた HTML を、エラーを出さずに引き継ぐ", async () => {
    const element = <QuantityBars label="分布" items={distribution} />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.appendChild(container);
    const list = container.querySelector("ul")!;
    Object.defineProperty(list, "clientWidth", { value: 1000 });
    // jsdom は innerHTML で入れたスクリプトを動かさないので、スクリプトと同じ関数で組みを付ける。
    layoutQuantityBars(list);
    expect(list.dataset.layout).toBe("inline");

    const actEnvironment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
    const previousActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
    actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const root = await act(async () => hydrateRoot(container, element));
    expect(errors).not.toHaveBeenCalled();
    expect(list.dataset.layout).toBe("inline");
    errors.mockRestore();
    act(() => root.unmount());
    container.remove();
    actEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  });
});
