import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HintBar, {
  hintLineCount,
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
  test("says in words that the puzzle is loading, and names the next hint once loaded", () => {
    const { rerender } = render(
      <HintBar guessCount={0} hint={null} finished={false} />,
    );
    // 読み込むあいだは、解き終えた回かどうかが分からないので、次に出るヒントを言わない（高さは CSS が取っておく）。
    expect(lines()).toEqual(["ヒント読み込んでいます"]);
    rerender(<HintBar guessCount={0} hint={hint} finished={false} />);
    expect(lines()).toEqual([
      "ヒント難易度 ★★3段階の2、読み 8文字",
      "3回目のあとに読みの最初の字",
    ]);
  });

  test("adds one line per hint as guesses go on", () => {
    render(<HintBar guessCount={5} hint={hint} finished={false} />);
    expect(lines()).toEqual([
      "ヒント難易度 ★★3段階の2、読み 8文字",
      "読みの最初の字 い",
      "出典 中国古典由来",
      "分類 変化・転換",
    ]);
  });

  test("does not announce a next hint once the game is over", () => {
    render(<HintBar guessCount={3} hint={hint} finished />);
    expect(lines()).toEqual([
      "ヒント難易度 ★★3段階の2、読み 8文字",
      "読みの最初の字 い",
    ]);
  });

  test("the line count for a finished game has no next-hint line", () => {
    expect(hintLineCount(3)).toBe(3);
    expect(hintLineCount(3, true)).toBe(2);
    expect(hintLineCount(5, true)).toBe(4);
  });
});
