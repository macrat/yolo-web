import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import CheatsheetLayout from "../CheatsheetLayout";
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
};

test("CheatsheetLayout renders breadcrumb", () => {
  render(
    <CheatsheetLayout meta={mockMeta}>
      <div>Content</div>
    </CheatsheetLayout>,
  );
  expect(
    screen.getByRole("navigation", { name: "パンくずリスト" }),
  ).toBeInTheDocument();
});

test("CheatsheetLayout renders AiDisclaimer", () => {
  render(
    <CheatsheetLayout meta={mockMeta}>
      <div>Content</div>
    </CheatsheetLayout>,
  );
  expect(
    screen.getByText(/AIによる実験的プロジェクトの一部です/),
  ).toBeInTheDocument();
});

test("CheatsheetLayout renders children", () => {
  render(
    <CheatsheetLayout meta={mockMeta}>
      <div>Cheatsheet content here</div>
    </CheatsheetLayout>,
  );
  expect(screen.getByText("Cheatsheet content here")).toBeInTheDocument();
});

test("CheatsheetLayout renders title and description", () => {
  render(
    <CheatsheetLayout meta={mockMeta}>
      <div>Content</div>
    </CheatsheetLayout>,
  );
  expect(
    screen.getByRole("heading", { level: 1, name: "テストチートシート" }),
  ).toBeInTheDocument();
  expect(screen.getByText("テスト用のチートシートです。")).toBeInTheDocument();
});
