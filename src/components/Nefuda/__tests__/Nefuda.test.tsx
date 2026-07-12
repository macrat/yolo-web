import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import Nefuda, { NefudaGroup } from "@/components/Nefuda";

describe("Nefuda", () => {
  test("label の文言を表示する", () => {
    render(<Nefuda label="3分" />);
    expect(screen.getByText("3分")).toBeInTheDocument();
  });

  test("空文字のラベルは描画しない（§4: 中身の無いラベルを貼らない）", () => {
    const { container } = render(<Nefuda label="" />);
    expect(container).toBeEmptyDOMElement();
  });

  test("空白のみのラベルも描画しない", () => {
    const { container } = render(<Nefuda label="   " />);
    expect(container).toBeEmptyDOMElement();
  });

  test("単一の span 要素として描画される", () => {
    const { container } = render(<Nefuda label="診断" />);
    const el = container.querySelector("span");
    expect(el).not.toBeNull();
    expect(el?.textContent).toBe("診断");
  });
});

describe("NefudaGroup", () => {
  test("複数のラベルをそれぞれ値札として描画する", () => {
    render(<NefudaGroup labels={["3分", "印刷できます", "診断"]} />);
    expect(screen.getByText("3分")).toBeInTheDocument();
    expect(screen.getByText("印刷できます")).toBeInTheDocument();
    expect(screen.getByText("診断")).toBeInTheDocument();
  });

  test("空・空白のみの要素は間引かれる", () => {
    const { container } = render(
      <NefudaGroup labels={["3分", "", "  ", "診断"]} />,
    );
    // 実体のある値札だけが span として残る（ラッパ span + 値札 span 2 個）
    const labels = Array.from(container.querySelectorAll("span")).filter(
      (s) => s.textContent === "3分" || s.textContent === "診断",
    );
    expect(labels).toHaveLength(2);
  });

  test("全て空なら群ごと描画しない", () => {
    const { container } = render(<NefudaGroup labels={["", "   "]} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("空配列でも描画しない", () => {
    const { container } = render(<NefudaGroup labels={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("ariaLabel を群のラッパに付与できる", () => {
    render(<NefudaGroup labels={["3分"]} ariaLabel="この道具のメタ情報" />);
    expect(screen.getByLabelText("この道具のメタ情報")).toBeInTheDocument();
  });
});
