import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ListStatus from "@/components/ListStatus";

describe("ListStatus", () => {
  test("件数の文を role=status の行に置き、フォーカスを受けられる", () => {
    render(
      <ListStatus
        total={86}
        matched={86}
        filtering={false}
        unit="件"
        range={{ start: 1, end: 50 }}
      />,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("全86件のうち1〜50件目");
    expect(status).toHaveAttribute("tabindex", "-1");
  });

  test("該当が0件のときだけ「絞り込みを外す」を出し、ライブリージョンの外に置く", () => {
    const onClear = vi.fn();
    const { rerender } = render(
      <ListStatus
        total={30}
        matched={3}
        filtering
        unit="語"
        onClear={onClear}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "絞り込みを外す" }),
    ).not.toBeInTheDocument();

    rerender(
      <ListStatus
        total={30}
        matched={0}
        filtering
        unit="語"
        onClear={onClear}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "条件に合う語はありません（全30語）",
    );
    const button = screen.getByRole("button", { name: "絞り込みを外す" });
    expect(screen.getByRole("status")).not.toContainElement(button);
    fireEvent.click(button);
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
