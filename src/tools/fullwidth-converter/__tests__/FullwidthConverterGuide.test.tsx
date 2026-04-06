import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import FullwidthConverterGuide from "../FullwidthConverterGuide";

test("renders section heading about difference", () => {
  render(<FullwidthConverterGuide />);
  expect(
    screen.getByRole("heading", { name: "全角と半角の違いとは" }),
  ).toBeInTheDocument();
});

test("renders section heading about use cases", () => {
  render(<FullwidthConverterGuide />);
  expect(
    screen.getByRole("heading", { name: "全角半角変換が必要になる場面" }),
  ).toBeInTheDocument();
});

test("renders section heading for character table", () => {
  render(<FullwidthConverterGuide />);
  expect(
    screen.getByRole("heading", { name: "変換対象の文字一覧" }),
  ).toBeInTheDocument();
});

test("renders character table with correct categories", () => {
  render(<FullwidthConverterGuide />);
  // カテゴリの行ヘッダーが存在すること
  expect(screen.getByText("英数字")).toBeInTheDocument();
  expect(screen.getByText("カタカナ")).toBeInTheDocument();
  expect(screen.getByText("記号・スペース")).toBeInTheDocument();
});

test("renders halfwidth column header", () => {
  render(<FullwidthConverterGuide />);
  const headers = screen.getAllByRole("columnheader");
  const texts = headers.map((h) => h.textContent);
  expect(texts).toContain("半角");
  expect(texts).toContain("全角");
});

test("renders explanation about unicode", () => {
  render(<FullwidthConverterGuide />);
  // Unicode について言及されていること
  expect(screen.getByText(/Unicode/)).toBeInTheDocument();
});
