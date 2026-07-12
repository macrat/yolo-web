import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import Tsutsumi from "@/components/Tsutsumi";

describe("Tsutsumi（包み）", () => {
  test("タイプ名を表示する", () => {
    render(<Tsutsumi typeName="静かな観察者" color="ai" />);
    expect(screen.getByText("静かな観察者")).toBeInTheDocument();
  });

  test("一言・店号・品名・補足を表示する", () => {
    render(
      <Tsutsumi
        typeName="静かな観察者"
        word="よく見て、少しだけ動く。"
        color="ai"
        shopName="yolos.net"
        productName="キャラ診断"
        caption="この結果は AI が作った実験です。"
      />,
    );
    expect(screen.getByText("よく見て、少しだけ動く。")).toBeInTheDocument();
    expect(screen.getByText("yolos.net")).toBeInTheDocument();
    expect(screen.getByText("キャラ診断")).toBeInTheDocument();
    expect(
      screen.getByText("この結果は AI が作った実験です。"),
    ).toBeInTheDocument();
  });

  test("和色キーが data-color に反映される（器＝紙のまま・地は .figure の中だけ）", () => {
    const { container } = render(
      <Tsutsumi typeName="紅の型" color="kurenai" />,
    );
    expect(container.querySelector('[data-color="kurenai"]')).not.toBeNull();
  });

  test("数字があれば数字を主役にする（単位付き）", () => {
    render(
      <Tsutsumi typeName="反応速度" number={98} unit="点" color="moegi" />,
    );
    expect(screen.getByText("98")).toBeInTheDocument();
    expect(screen.getByText("点")).toBeInTheDocument();
  });

  test("数字が無く記号があれば記号を主役にする", () => {
    render(<Tsutsumi typeName="風の型" symbol="風" color="tokiwa" />);
    expect(screen.getByText("風")).toBeInTheDocument();
  });

  test("数字と記号が両方あれば数字を優先し記号は出さない", () => {
    render(<Tsutsumi typeName="両方" number={42} symbol="風" color="tokiwa" />);
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.queryByText("風")).toBeNull();
  });

  test("seal を渡すと印（一文字）を捺す", () => {
    render(<Tsutsumi typeName="占い" color="suou" seal="吉" />);
    // In が role=img（label 付き）で描画され、文字が読める
    expect(screen.getByText("吉")).toBeInTheDocument();
  });

  test("seal が無ければ印は出さない", () => {
    const { container } = render(<Tsutsumi typeName="占い" color="suou" />);
    expect(container.querySelector("svg")).toBeNull();
  });

  test("figure（figure 要素）として描画される", () => {
    const { container } = render(<Tsutsumi typeName="型" color="yamabuki" />);
    expect(container.querySelector("figure")).not.toBeNull();
  });
});
