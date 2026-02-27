import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import ToolLayout from "../ToolLayout";
import type { ToolMeta } from "@/tools/types";

const mockMeta: ToolMeta = {
  slug: "test-tool",
  name: "テストツール",
  nameEn: "Test Tool",
  description: "テストツールの説明です。",
  shortDescription: "テスト用",
  keywords: ["テスト"],
  category: "developer",
  relatedSlugs: [],
  publishedAt: "2026-02-13",
  trustLevel: "verified",
};

test("ToolLayout renders tool name as heading", () => {
  render(
    <ToolLayout meta={mockMeta}>
      <div>Tool content</div>
    </ToolLayout>,
  );
  expect(
    screen.getByRole("heading", { level: 1, name: "テストツール" }),
  ).toBeInTheDocument();
});

test("ToolLayout renders children", () => {
  render(
    <ToolLayout meta={mockMeta}>
      <div>Tool content here</div>
    </ToolLayout>,
  );
  expect(screen.getByText("Tool content here")).toBeInTheDocument();
});

test("ToolLayout renders description", () => {
  render(
    <ToolLayout meta={mockMeta}>
      <div>Content</div>
    </ToolLayout>,
  );
  expect(screen.getByText("テストツールの説明です。")).toBeInTheDocument();
});

test("ToolLayout renders privacy note text", () => {
  render(
    <ToolLayout meta={mockMeta}>
      <div>Content</div>
    </ToolLayout>,
  );
  expect(
    screen.getByText(
      "このツールはブラウザ上で動作します。入力データがサーバーに送信されることはありません。",
    ),
  ).toBeInTheDocument();
});

test("ToolLayout privacy note has role='note'", () => {
  render(
    <ToolLayout meta={mockMeta}>
      <div>Content</div>
    </ToolLayout>,
  );
  const note = screen.getByRole("note");
  expect(note).toBeInTheDocument();
  expect(note).toHaveTextContent(
    "このツールはブラウザ上で動作します。入力データがサーバーに送信されることはありません。",
  );
});
