import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import ToolLayout from "../ToolLayout";
import type { ToolMeta } from "@/tools/types";

const mockMeta: ToolMeta = {
  slug: "test-tool",
  name: "テストツール",
  nameEn: "Test Tool",
  description: "テストツールの説明です。",
  shortDescription: "テスト用の短い説明",
  keywords: ["テスト"],
  category: "developer",
  relatedSlugs: [],
  publishedAt: "2026-02-13",
  howItWorks: "このツールはブラウザ上でテキストを処理します。",
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

test("ToolLayout renders shortDescription below h1", () => {
  const { container } = render(
    <ToolLayout meta={mockMeta}>
      <div>Content</div>
    </ToolLayout>,
  );
  const shortDescEl = screen.getByText("テスト用の短い説明");
  expect(shortDescEl).toBeInTheDocument();
  // shortDescriptionはheader内に表示される
  const header = container.querySelector("header");
  expect(header).toContainElement(shortDescEl);
});

test("ToolLayout does not render description text on page", () => {
  render(
    <ToolLayout meta={mockMeta}>
      <div>Content</div>
    </ToolLayout>,
  );
  // descriptionはSEO専用でページ上に表示しない
  expect(
    screen.queryByText("テストツールの説明です。"),
  ).not.toBeInTheDocument();
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

test("ToolLayout renders howItWorks section with heading", () => {
  render(
    <ToolLayout meta={mockMeta}>
      <div>Content</div>
    </ToolLayout>,
  );
  expect(
    screen.getByRole("heading", { level: 2, name: "このツールについて" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText("このツールはブラウザ上でテキストを処理します。"),
  ).toBeInTheDocument();
});

test("ToolLayout content section appears in DOM after header", () => {
  const { container } = render(
    <ToolLayout meta={mockMeta}>
      <div>Tool content</div>
    </ToolLayout>,
  );
  const contentSection = container.querySelector("section[aria-label='Tool']");
  expect(contentSection).toBeInTheDocument();
});

test("ToolLayout does not render TrustLevelBadge", () => {
  const { container } = render(
    <ToolLayout meta={mockMeta}>
      <div>Content</div>
    </ToolLayout>,
  );
  // TrustLevelBadgeは表示しない
  expect(container.querySelector("[data-trust-level]")).not.toBeInTheDocument();
});
