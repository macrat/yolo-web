import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import Slider, { trackPosition, trackPositionPx } from "..";

function Controlled({
  initial,
  min = 0,
  max = 360,
  step,
  onChange,
  format,
}: {
  initial: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  format?: (value: number) => string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <Slider
      items={[
        {
          label: "色相",
          value,
          min,
          max,
          step,
          formatValue: format,
          onChange: (next) => {
            setValue(next);
            onChange?.(next);
          },
          decreaseLabel: "色相を1減らす",
          increaseLabel: "色相を1増やす",
        },
      ]}
    />
  );
}

const status = () => screen.getByRole("status");

describe("つまみの中心の対応", () => {
  test("端の値はつまみの半分の幅だけ内側、真ん中の値は溝の真ん中を指す", () => {
    expect(trackPositionPx(0, 0, 360, 200)).toBe(8);
    expect(trackPositionPx(360, 0, 360, 200)).toBe(192);
    expect(trackPositionPx(180, 0, 360, 200)).toBe(100);
    expect(trackPositionPx(-10, 0, 360, 200)).toBe(8);
  });

  test("溝の色の止まりは、同じ対応を CSS の長さで言う", () => {
    expect(trackPosition(0, 0, 100)).toBe("calc(8px + (100% - 16px) * 0)");
    expect(trackPosition(50, 0, 100)).toBe("calc(8px + (100% - 16px) * 0.5)");
    expect(trackPosition(100, 0, 100)).toBe("calc(8px + (100% - 16px) * 1)");
  });

  test("溝に色を渡したスライダーは、止まりをその対応の位置に置いた塗りを持つ", () => {
    render(
      <Slider
        items={[
          {
            label: "明度",
            value: 30,
            min: 0,
            max: 100,
            onChange: () => {},
            decreaseLabel: "明度を1減らす",
            increaseLabel: "明度を1増やす",
            trackStops: [
              { value: 0, color: "black" },
              { value: 100, color: "white" },
            ],
          },
        ]}
      />,
    );
    const input = screen.getByRole("slider", { name: "明度" });
    expect(input.style.getPropertyValue("--slider-track")).toBe(
      "linear-gradient(to right, black calc(8px + (100% - 16px) * 0), white calc(8px + (100% - 16px) * 1))",
    );
  });
});

describe("− と ＋", () => {
  test("1刻みずつ動かし、使う側に値を渡し、新しい値を1度知らせる", () => {
    const onChange = vi.fn();
    render(<Controlled initial={100} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "色相を1増やす" }));
    expect(onChange).toHaveBeenLastCalledWith(101);
    expect(screen.getByRole("slider", { name: "色相" })).toHaveValue("101");
    expect(status()).toHaveTextContent("色相 101");
    fireEvent.click(screen.getByRole("button", { name: "色相を1減らす" }));
    fireEvent.click(screen.getByRole("button", { name: "色相を1減らす" }));
    expect(onChange).toHaveBeenLastCalledWith(99);
    expect(status()).toHaveTextContent("色相 99");
  });

  test("刻みが1でないときは、その刻みで動く", () => {
    render(
      <Controlled
        initial={90}
        min={10}
        max={100}
        step={5}
        format={(value) => `${value}%`}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "色相を1増やす" }));
    const input = screen.getByRole("slider", { name: "色相" });
    expect(input).toHaveValue("95");
    expect(input).toHaveAttribute("aria-valuetext", "95%");
    expect(status()).toHaveTextContent("色相 95%");
  });

  test("端では無効になり、押しても値も知らせも変わらず、フォーカスを落とさない", () => {
    const onChange = vi.fn();
    render(<Controlled initial={359} onChange={onChange} />);
    const increase = screen.getByRole("button", { name: "色相を1増やす" });
    increase.focus();
    fireEvent.click(increase);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(increase).toHaveAttribute("aria-disabled", "true");
    expect(increase).not.toBeDisabled();
    expect(increase).toHaveFocus();
    const before = status().textContent;
    fireEvent.click(increase);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(status().textContent).toBe(before);
    expect(
      screen.getByRole("button", { name: "色相を1減らす" }),
    ).not.toHaveAttribute("aria-disabled");
  });

  test("Tab の順に入らず、マウスで押してもフォーカスを移さない", () => {
    render(<Controlled initial={100} />);
    const input = screen.getByRole("slider", { name: "色相" });
    const increase = screen.getByRole("button", { name: "色相を1増やす" });
    expect(increase).toHaveAttribute("tabindex", "-1");
    input.focus();
    const mouseDown = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
    });
    increase.dispatchEvent(mouseDown);
    expect(mouseDown.defaultPrevented).toBe(true);
    fireEvent.click(increase);
    expect(input).toHaveFocus();
  });

  test("スライダーにフォーカスがあるまま押したときは、スライダーが値を読むので知らせを出さない", () => {
    render(<Controlled initial={100} />);
    const input = screen.getByRole("slider", { name: "色相" });
    input.focus();
    fireEvent.click(screen.getByRole("button", { name: "色相を1増やす" }));
    expect(input).toHaveValue("101");
    expect(status()).toHaveTextContent("");
  });

  test("引く・矢印のキーで変えた値は知らせない", () => {
    const onChange = vi.fn();
    render(<Controlled initial={100} onChange={onChange} />);
    fireEvent.change(screen.getByRole("slider", { name: "色相" }), {
      target: { value: "150" },
    });
    expect(onChange).toHaveBeenLastCalledWith(150);
    expect(status()).toHaveTextContent("");
  });
});

describe("値の字", () => {
  test("値の場所は、とりうるいちばん長い値の幅をいつも取る", () => {
    const { container, rerender } = render(<Controlled initial={9} />);
    const space = () =>
      container.querySelector('[aria-hidden="true"] > span')?.textContent;
    expect(space()).toBe("360");
    rerender(<Controlled initial={100} />);
    expect(space()).toBe("360");
    render(
      <Controlled
        initial={95}
        min={10}
        max={100}
        step={5}
        format={(value) => `${value}%`}
      />,
    );
    expect(screen.getAllByText("100%", { exact: true }).length).toBeGreaterThan(
      0,
    );
  });
});
