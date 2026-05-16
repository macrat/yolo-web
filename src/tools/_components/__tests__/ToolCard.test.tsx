import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ToolMeta } from "@/tools/types";

// next/link のモック
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import ToolCard from "../ToolCard";

function buildMeta(overrides: Partial<ToolMeta> = {}): ToolMeta {
  return {
    slug: "test-tool",
    name: "テストツール",
    nameEn: "Test Tool",
    description: "テストツールの説明",
    shortDescription: "テスト用の短い説明",
    keywords: [],
    category: "developer",
    relatedSlugs: [],
    publishedAt: "2026-01-01T00:00:00+09:00",
    howItWorks: "ブラウザ上で処理します",
    ...overrides,
  };
}

test("ToolCard はツール名を表示する", () => {
  render(<ToolCard meta={buildMeta()} />);
  expect(
    screen.getByRole("heading", { name: "テストツール" }),
  ).toBeInTheDocument();
});

test("ToolCard はカテゴリラベルを表示する", () => {
  render(<ToolCard meta={buildMeta({ category: "text" })} />);
  expect(screen.getByText("テキスト")).toBeInTheDocument();
});

test("isNew=true のとき NEW ラベルが表示される", () => {
  render(<ToolCard meta={buildMeta()} isNew={true} />);
  expect(screen.getByText("NEW")).toBeInTheDocument();
});

test("isNew=false のとき NEW ラベルが表示されない", () => {
  render(<ToolCard meta={buildMeta()} isNew={false} />);
  expect(screen.queryByText("NEW")).not.toBeInTheDocument();
});

test("isNew が省略されたとき NEW ラベルが表示されない", () => {
  render(<ToolCard meta={buildMeta()} />);
  expect(screen.queryByText("NEW")).not.toBeInTheDocument();
});
