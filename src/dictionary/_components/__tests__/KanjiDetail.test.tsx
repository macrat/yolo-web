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
  category: "nature",
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
  expect(screen.getByText("3画")).toBeInTheDocument();
  expect(screen.getByText("1年生")).toBeInTheDocument();
});

test("renders examples", () => {
  render(<KanjiDetail kanji={mockKanji} />);
  expect(screen.getByText("山脈")).toBeInTheDocument();
  expect(screen.getByText("火山")).toBeInTheDocument();
  expect(screen.getByText("登山")).toBeInTheDocument();
});

test("renders game cross-link", () => {
  render(<KanjiDetail kanji={mockKanji} />);
  expect(
    screen.getByRole("link", {
      name: "漢字カナール - 毎日の漢字パズルで遊ぶ",
    }),
  ).toHaveAttribute("href", "/games/kanji-kanaru");
});
