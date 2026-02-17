import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import YojiDetail from "../yoji/YojiDetail";
import type { YojiEntry } from "@/lib/dictionary/types";

const mockYoji: YojiEntry = {
  yoji: "一期一会",
  reading: "いちごいちえ",
  meaning: "一生に一度の出会いを大切にすること",
  difficulty: 1,
  category: "life",
};

test("renders yoji prominently", () => {
  render(<YojiDetail yoji={mockYoji} />);
  const detail = screen.getByTestId("yoji-detail");
  expect(detail).toBeInTheDocument();
  expect(
    screen.getByText("一期一会", { selector: "span" }),
  ).toBeInTheDocument();
});

test("renders reading and meaning", () => {
  render(<YojiDetail yoji={mockYoji} />);
  expect(screen.getByText("いちごいちえ")).toBeInTheDocument();
  expect(
    screen.getByText("一生に一度の出会いを大切にすること"),
  ).toBeInTheDocument();
});

test("renders difficulty badge", () => {
  render(<YojiDetail yoji={mockYoji} />);
  expect(screen.getByText("初級")).toBeInTheDocument();
});

test("renders category badge", () => {
  render(<YojiDetail yoji={mockYoji} />);
  expect(screen.getByText("人生")).toBeInTheDocument();
});

test("renders game cross-link", () => {
  render(<YojiDetail yoji={mockYoji} />);
  expect(
    screen.getByRole("link", {
      name: "四字キメル - 毎日の四字熟語パズルで遊ぶ",
    }),
  ).toHaveAttribute("href", "/games/yoji-kimeru");
});

test("renders constituent kanji section", () => {
  render(<YojiDetail yoji={mockYoji} />);
  // "一期一会" has 一 which is in kanji-data.json
  // The character should be linked
  expect(screen.getByText("構成漢字")).toBeInTheDocument();
});
