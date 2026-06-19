import { describe, test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PercentCalculatorTile from "../PercentCalculatorTile";

describe("PercentCalculatorTile", () => {
  test("ルート要素が section（Panel デフォルト）", () => {
    const { container } = render(<PercentCalculatorTile />);
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });

  test("計算パターンのセグメンテッドコントロールが表示される", () => {
    render(<PercentCalculatorTile />);
    expect(
      screen.getByRole("radiogroup", { name: "計算パターン" }),
    ).toBeInTheDocument();
  });

  test("初期状態で「XのY%」モードが選択されている", () => {
    render(<PercentCalculatorTile />);
    const radio = screen.getByRole("radio", { name: "XのY%" });
    expect(radio).toHaveAttribute("aria-checked", "true");
  });

  test("数値入力で計算結果がリアルタイム表示される", () => {
    render(<PercentCalculatorTile />);
    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "2500" } });
    fireEvent.change(inputs[1], { target: { value: "15" } });
    expect(screen.getByText("= 375")).toBeInTheDocument();
  });

  test("「何%？」モードに切り替えて計算できる", () => {
    render(<PercentCalculatorTile />);
    fireEvent.click(screen.getByRole("radio", { name: "何%？" }));

    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "80" } });
    fireEvent.change(inputs[1], { target: { value: "200" } });
    expect(screen.getByText("= 40%")).toBeInTheDocument();
  });

  test("「増減」モードに切り替えて計算できる", () => {
    render(<PercentCalculatorTile />);
    fireEvent.click(screen.getByRole("radio", { name: "増減" }));

    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "3000" } });
    fireEvent.change(inputs[1], { target: { value: "20" } });
    // デフォルトは「減らす」
    expect(screen.getByText("= 2400")).toBeInTheDocument();
  });

  test("「増減」モードで方向を「増やす」に切り替えられる", () => {
    render(<PercentCalculatorTile />);
    fireEvent.click(screen.getByRole("radio", { name: "増減" }));

    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "1000" } });
    fireEvent.change(inputs[1], { target: { value: "10" } });
    fireEvent.click(screen.getByRole("radio", { name: "増やす" }));
    expect(screen.getByText("= 1100")).toBeInTheDocument();
  });

  test("「変化率」モードに切り替えて計算できる", () => {
    render(<PercentCalculatorTile />);
    fireEvent.click(screen.getByRole("radio", { name: "変化率" }));

    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "800" } });
    fireEvent.change(inputs[1], { target: { value: "1000" } });
    expect(screen.getByText("+25%")).toBeInTheDocument();
  });

  test("モード切替時に入力値がリセットされる", () => {
    render(<PercentCalculatorTile />);
    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "100" } });

    fireEvent.click(screen.getByRole("radio", { name: "何%？" }));
    const newInputs = screen.getAllByRole("spinbutton");
    expect(newInputs[0]).toHaveValue(null);
  });

  test("入力が不完全な場合は結果が表示されない", () => {
    render(<PercentCalculatorTile />);
    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "100" } });
    // 2つ目が未入力
    expect(screen.queryByLabelText("計算結果")).not.toBeInTheDocument();
  });

  test("計算式が結果と一緒に表示される", () => {
    render(<PercentCalculatorTile />);
    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "2500" } });
    fireEvent.change(inputs[1], { target: { value: "15" } });
    // 計算式に入力値が含まれる
    expect(screen.getByText(/2500 × 15 ÷ 100/)).toBeInTheDocument();
  });

  test("ライブリージョンが存在する", () => {
    render(<PercentCalculatorTile />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  test("as prop で HTML タグを変更できる", () => {
    const { container } = render(<PercentCalculatorTile as="div" />);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });
});
