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

test("renders the yoji as the page h1 (DictionaryDetailLayout 設計契約: h1 は Detail 内部で管理)", () => {
  render(<YojiDetail yoji={mockYoji} />);
  const h1 = screen.getByRole("heading", { level: 1 });
  expect(h1).toHaveTextContent("四字熟語「一期一会」");
  // h1 はページに1個だけ（kanji/color と同型の見出し階層）
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
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
  expect(screen.getByText("AIが見た人間のひとコマ")).toBeInTheDocument();
  expect(screen.getByText("テスト用の例文です。")).toBeInTheDocument();
});

test("does not render AI example section when example is empty string", () => {
  const yojiWithoutExample: YojiEntry = { ...mockYoji, example: "" };
  render(<YojiDetail yoji={yojiWithoutExample} />);
  expect(screen.queryByText("AIが見た人間のひとコマ")).not.toBeInTheDocument();
});

test("AI example section appears after kanji section and before related yoji section", () => {
  render(<YojiDetail yoji={mockYoji} />);
  const headings = screen
    .getAllByRole("heading", { level: 2 })
    .map((h) => h.textContent);
  const kanjiIndex = headings.findIndex((h) => h === "構成漢字");
  const exampleIndex = headings.findIndex(
    (h) => h === "AIが見た人間のひとコマ",
  );
  const relatedIndex = headings.findIndex((h) =>
    h?.includes("同じカテゴリの四字熟語"),
  );
  expect(kanjiIndex).toBeLessThan(exampleIndex);
  expect(exampleIndex).toBeLessThan(relatedIndex);
});

test("renders origin label for 中国 as '中国伝来'", () => {
  const chinaYoji: YojiEntry = { ...mockYoji, origin: "中国" };
  render(<YojiDetail yoji={chinaYoji} />);
  expect(screen.getByText("成立と出典")).toBeInTheDocument();
  expect(screen.getByText("中国伝来")).toBeInTheDocument();
});

test("renders structure label for 対句 as '対句構造'", () => {
  const tsuikuYoji: YojiEntry = { ...mockYoji, structure: "対句" };
  render(<YojiDetail yoji={tsuikuYoji} />);
  expect(screen.getByText("対句構造")).toBeInTheDocument();
});

test("renders kotobank source URL as external link with safe rel and target", () => {
  render(<YojiDetail yoji={mockYoji} />);
  const link = screen.getByRole("link", { name: /コトバンク.*外部サイト/ });
  expect(link).toHaveAttribute(
    "href",
    "https://kotobank.jp/word/%E4%B8%80%E6%9C%9F%E4%B8%80%E4%BC%9A-433299",
  );
  expect(link).toHaveAttribute("target", "_blank");
  const rel = link.getAttribute("rel") ?? "";
  expect(rel).toContain("noopener");
  expect(rel).toContain("noreferrer");
});

test("falls back to hostname for unknown source host", () => {
  const unknownHostYoji: YojiEntry = {
    ...mockYoji,
    sourceUrl: "https://unknown.example.com/some/path",
  };
  render(<YojiDetail yoji={unknownHostYoji} />);
  const link = screen.getByRole("link", {
    name: /unknown\.example\.com.*外部サイト/,
  });
  expect(link).toHaveAttribute("href", "https://unknown.example.com/some/path");
});

test("renders origin '不明' honestly without hiding", () => {
  const unknownOriginYoji: YojiEntry = { ...mockYoji, origin: "不明" };
  render(<YojiDetail yoji={unknownOriginYoji} />);
  // 「不明」は隠さず誠実に提示する（憲法 Rule 2 / N-3）
  expect(screen.getByText(/不明/)).toBeInTheDocument();
});
