import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgressBar from "..";

describe("ProgressBar", () => {
  test("見える数・塗り・読み上げが、どれもいまの問の番号を言う", () => {
    const { container } = render(
      <ProgressBar current={2} total={5} label="問の進み具合" />,
    );
    const bar = screen.getByRole("progressbar", { name: "問の進み具合" });
    expect(bar).toHaveAttribute("aria-valuenow", "2");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "5");
    expect(bar).toHaveAttribute("aria-valuetext", "5問中2問目");
    expect(container).toHaveTextContent("2 / 5");
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("40%");
  });

  test("最初の問は「1 / 5」で、塗りを持つ", () => {
    const { container } = render(
      <ProgressBar current={1} total={5} label="問の進み具合" />,
    );
    expect(container).toHaveTextContent("1 / 5");
    const fill = screen.getByRole("progressbar")
      .firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("20%");
  });

  test("見える数は読み上げから外し、同じ数を2度読ませない", () => {
    render(<ProgressBar current={3} total={10} label="設問の進捗" />);
    expect(screen.getByText("3 / 10")).toHaveAttribute("aria-hidden", "true");
  });
});
