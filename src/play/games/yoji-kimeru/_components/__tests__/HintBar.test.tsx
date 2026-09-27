import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HintBar, {
  type HintSource,
} from "@/play/games/yoji-kimeru/_components/HintBar";

const hint: HintSource = {
  reading: "いっせきにちょう",
  category: "change",
  origin: "中国",
  difficulty: 2,
};

function lines(): string[] {
  return Array.from(
    screen.getByRole("status", { name: "ヒント" }).querySelectorAll("p"),
    (p) => p.textContent ?? "",
  );
}

describe("HintBar", () => {
  test("says in words that the puzzle is loading, on as many lines as after loading", () => {
    const { rerender } = render(<HintBar guessCount={0} hint={null} />);
    expect(lines()).toEqual([
      "ヒント読み込んでいます",
      "3回目のあとに読みの最初の字",
    ]);
    rerender(<HintBar guessCount={0} hint={hint} />);
    expect(lines()).toEqual([
      "ヒント難易度 ★★3段階の2、読み 8文字",
      "3回目のあとに読みの最初の字",
    ]);
  });

  test("adds one line per hint as guesses go on", () => {
    render(<HintBar guessCount={5} hint={hint} />);
    expect(lines()).toEqual([
      "ヒント難易度 ★★3段階の2、読み 8文字",
      "読みの最初の字 い",
      "出典 中国古典由来",
      "分類 変化・転換",
    ]);
  });
});
