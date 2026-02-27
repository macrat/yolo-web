import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import CheatsheetCard from "../CheatsheetCard";
import type { CheatsheetMeta } from "@/cheatsheets/types";

const mockMeta: CheatsheetMeta = {
  slug: "test-cs",
  name: "テストチートシート",
  nameEn: "Test Cheatsheet",
  description: "テスト用のチートシートです。",
  shortDescription: "テスト用",
  keywords: ["テスト"],
  category: "developer",
  relatedToolSlugs: [],
  relatedCheatsheetSlugs: [],
  sections: [{ id: "s1", title: "セクション1" }],
  publishedAt: "2026-02-19",
  trustLevel: "curated",
};

test("CheatsheetCard renders correct link", () => {
  render(<CheatsheetCard meta={mockMeta} />);
  const link = screen.getByRole("link");
  expect(link).toHaveAttribute("href", "/cheatsheets/test-cs");
});

test("CheatsheetCard displays category label", () => {
  render(<CheatsheetCard meta={mockMeta} />);
  expect(screen.getByText("開発者向け")).toBeInTheDocument();
});

test("CheatsheetCard displays name and description", () => {
  render(<CheatsheetCard meta={mockMeta} />);
  expect(screen.getByText("テストチートシート")).toBeInTheDocument();
  expect(screen.getByText("テスト用")).toBeInTheDocument();
});
