import { expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import KanjiDetail from "../kanji/KanjiDetail";
import { getKanjiByChar, getKanjiByRadical } from "@/dictionary/_lib/kanji";
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
  // 画数・部首番号は数値の span に分離。数値と単位が別ノードになる。
  expect(screen.getByText("3")).toBeInTheDocument(); // 画数
  expect(screen.getByText("46")).toBeInTheDocument(); // 部首番号
  expect(screen.getByText("小学1年")).toBeInTheDocument(); // 学年
});

test("renders examples", () => {
  render(<KanjiDetail kanji={mockKanji} />);
  // 使用例はカード/ピルではなく読点で組んだ自然な一文で見せる。
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

test("Zen Antique で組める見出しには、本文の書体で組む属性を付けない", () => {
  render(<KanjiDetail kanji={mockKanji} />);
  expect(
    screen.getByRole("heading", { level: 1, name: "漢字「山」" }),
  ).not.toHaveAttribute("data-heading-font");
});

test("Zen Antique に無い字の見出しと大字は、和文を本文の書体で組む", () => {
  render(
    <KanjiDetail kanji={{ ...mockKanji, character: "𠮟", radical: "辵" }} />,
  );
  expect(
    screen.getByRole("heading", { level: 1, name: "漢字「𠮟」" }),
  ).toHaveAttribute("data-heading-font", "fallback");
  expect(screen.getByText("𠮟", { selector: "span" })).toHaveAttribute(
    "data-heading-font",
    "fallback",
  );
});

test("大字は直後の h1 と同じ字なので、読み上げの木に現れない", () => {
  render(<KanjiDetail kanji={mockKanji} />);
  expect(screen.getByText("山", { selector: "span" })).toHaveAttribute(
    "aria-hidden",
    "true",
  );
});

test("同じ部首の漢字は、見出しが字の数を言い、画数ごとのリストとして読まれる", () => {
  const water = getKanjiByChar("水")!;
  const others = getKanjiByRadical("水").filter((k) => k.character !== "水");
  expect(others).toHaveLength(117);
  render(<KanjiDetail kanji={water} />);

  const heading = screen.getByRole("heading", {
    level: 2,
    name: `同じ部首の漢字（${others.length}字）`,
  });
  expect(heading).toBeInTheDocument();
  const index = screen.getByRole("group", { name: heading.textContent! });

  const strokeCounts = [...new Set(others.map((k) => k.strokeCount))].sort(
    (a, b) => a - b,
  );
  const groupHeadings = within(index).getAllByRole("heading", { level: 3 });
  expect(groupHeadings.map((h) => h.textContent)).toEqual(
    strokeCounts.map((count) => `${count}画`),
  );

  for (const count of strokeCounts) {
    const list = within(index).getByRole("list", { name: `${count}画` });
    expect(
      within(list)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual(
      others.filter((k) => k.strokeCount === count).map((k) => k.character),
    );
  }
  expect(within(index).getAllByRole("link")).toHaveLength(others.length);
});
