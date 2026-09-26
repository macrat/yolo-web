import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import DescriptionExpander from "../DescriptionExpander";

/** 描いた段落が隠している字の有無を、段落の高さで決める（jsdom は字を組まないので、高さを与える）。 */
function mockParagraphHeights(scrollHeight: number, clientHeight: number) {
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(
    scrollHeight,
  );
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(
    clientHeight,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("DescriptionExpander", () => {
  it("説明の全文を段落に置く", () => {
    mockParagraphHeights(100, 100);
    render(
      <DescriptionExpander
        description="テスト説明文"
        likelyOverflows={false}
      />,
    );
    expect(screen.getByText("テスト説明文")).toBeInTheDocument();
  });

  it("隠れる字が無ければ、見込みが「隠れる」でも「続きを読む」を出さない", () => {
    mockParagraphHeights(100, 100);
    render(<DescriptionExpander description="4行に入る説明" likelyOverflows />);
    expect(screen.queryByText("続きを読む")).not.toBeInTheDocument();
  });

  it("隠れる字があれば、見込みが「隠れない」でも「続きを読む」を出す", () => {
    mockParagraphHeights(200, 100);
    render(
      <DescriptionExpander
        description="4行に入らない説明"
        likelyOverflows={false}
      />,
    );
    expect(screen.getByText("続きを読む")).toBeInTheDocument();
  });

  it("「続きを読む」を押すと全文を開き、「折りたたむ」で戻る", () => {
    mockParagraphHeights(200, 100);
    render(
      <DescriptionExpander description="4行に入らない説明" likelyOverflows />,
    );
    const toggle = screen.getByRole("button", { name: "続きを読む" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "折りたたむ" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: "折りたたむ" }));
    expect(
      screen.getByRole("button", { name: "続きを読む" }),
    ).toBeInTheDocument();
  });
});
