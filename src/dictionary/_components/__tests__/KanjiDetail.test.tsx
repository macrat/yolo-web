import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import KanjiDetail from "../kanji/KanjiDetail";
import type { KanjiEntry } from "@/dictionary/_lib/types";

const mockKanji: KanjiEntry = {
  character: "山",
  radical: "山",
  radicalGroup: 46,
  strokeCount: 3,
  grade: 1,
  onYomi: ["サン", "セン"],
  kunYomi: ["やま"],
  meanings: ["mountain"],
  examples: ["山脈", "火山", "登山"],
};

test("renders kanji detail section", () => {
  render(<KanjiDetail kanji={mockKanji} />);
  const detail = screen.getByTestId("kanji-detail");
  expect(detail).toBeInTheDocument();
  expect(screen.getByText(/漢字「山」/)).toBeInTheDocument();
});

test("renders readings", () => {
  render(<KanjiDetail kanji={mockKanji} />);
  expect(screen.getByText("サン・セン")).toBeInTheDocument();
  expect(screen.getByText("やま")).toBeInTheDocument();
});

test("renders basic info", () => {
  render(<KanjiDetail kanji={mockKanji} />);
  // 画数・部首番号は tabular 数字書体の span に分離（DESIGN §3）。数値と単位が別ノードになる。
  expect(screen.getByText("3")).toBeInTheDocument(); // 画数
  expect(screen.getByText("46")).toBeInTheDocument(); // 部首番号
  expect(screen.getByText("小学1年")).toBeInTheDocument(); // 学年
});

test("renders examples", () => {
  render(<KanjiDetail kanji={mockKanji} />);
  // 使用例はカード/ピルではなく読点で組んだ自然な一文で見せる（DESIGN §4/§6）。
  expect(screen.getByText("山脈、火山、登山")).toBeInTheDocument();
});

test("renders game cross-link", () => {
  render(<KanjiDetail kanji={mockKanji} />);
  expect(
    screen.getByRole("link", {
      name: "漢字カナール - 毎日の漢字パズルで遊ぶ",
    }),
  ).toHaveAttribute("href", "/play/kanji-kanaru");
});
