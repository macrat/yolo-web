import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ListStatus from "@/components/ListStatus";

describe("ListStatus", () => {
  test("件数の文を見える行に置き、フォーカスを受けられる。行はライブリージョンでない", () => {
    render(
      <ListStatus
        total={86}
        matched={86}
        filtering={false}
        unit="件"
        range={{ start: 1, end: 50 }}
        announcement=""
      />,
    );
    const line = screen.getByText("全86件のうち1〜50件目");
    expect(line).toHaveAttribute("tabindex", "-1");
    expect(line).not.toHaveAttribute("role");
    expect(line).not.toHaveAttribute("aria-live");
  });

  test("読み上げに伝える文は、見えない role=status の中に置き、渡された文だけを持つ", () => {
    const { rerender } = render(
      <ListStatus
        total={86}
        matched={12}
        filtering
        unit="件"
        range={{ start: 1, end: 12 }}
        announcement=""
      />,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveClass("visually-hidden");
    expect(status).toBeEmptyDOMElement();

    rerender(
      <ListStatus
        total={86}
        matched={12}
        filtering
        unit="件"
        range={{ start: 1, end: 12 }}
        announcement="12件（全86件）"
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(/^12件（全86件）$/);
  });

  test("該当が0件のときだけ「絞り込みを外す」を出し、ライブリージョンの外に置く", () => {
    const onClear = vi.fn();
    const { rerender } = render(
      <ListStatus
        total={30}
        matched={3}
        filtering
        unit="語"
        announcement="3語（全30語）"
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
        announcement="条件に合う語はありません（全30語）"
        onClear={onClear}
      />,
    );
    expect(
      screen.getByText("条件に合う語はありません（全30語）", {
        selector: "p:not([role])",
      }),
    ).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "絞り込みを外す" });
    expect(screen.getByRole("status")).not.toContainElement(button);
    fireEvent.click(button);
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
