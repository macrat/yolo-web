import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import YojiDetail from "../yoji/YojiDetail";
import type { YojiEntry } from "@/dictionary/_lib/types";

const mockYoji: YojiEntry = {
  yoji: "一期一会",
  reading: "いちごいちえ",
  meaning: "一生に一度の出会いを大切にすること",
  difficulty: 1,
  category: "life",
  origin: "日本",
  structure: "組合せ",
  sourceUrl:
    "https://kotobank.jp/word/%E4%B8%80%E6%9C%9F%E4%B8%80%E4%BC%9A-433299",
  example: "テスト用の例文です。",
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
  ).toHaveAttribute("href", "/play/yoji-kimeru");
});

test("renders constituent kanji section", () => {
  render(<YojiDetail yoji={mockYoji} />);
  // "一期一会" has 一 which is in kanji-data.json
  // The character should be linked
  expect(screen.getByText("構成漢字")).toBeInTheDocument();
});

test("renders AI example section when example is present", () => {
  render(<YojiDetail yoji={mockYoji} />);
  expect(screen.getByText("AIによる使用例")).toBeInTheDocument();
  expect(screen.getByText("テスト用の例文です。")).toBeInTheDocument();
});

test("does not render AI example section when example is empty string", () => {
  const yojiWithoutExample: YojiEntry = { ...mockYoji, example: "" };
  render(<YojiDetail yoji={yojiWithoutExample} />);
  expect(screen.queryByText("AIによる使用例")).not.toBeInTheDocument();
});

test("AI example section appears after kanji section and before related yoji section", () => {
  render(<YojiDetail yoji={mockYoji} />);
  const headings = screen
    .getAllByRole("heading", { level: 2 })
    .map((h) => h.textContent);
  const kanjiIndex = headings.findIndex((h) => h === "構成漢字");
  const exampleIndex = headings.findIndex((h) => h === "AIによる使用例");
  const relatedIndex = headings.findIndex((h) =>
    h?.includes("同じカテゴリの四字熟語"),
  );
  expect(kanjiIndex).toBeLessThan(exampleIndex);
  expect(exampleIndex).toBeLessThan(relatedIndex);
});
