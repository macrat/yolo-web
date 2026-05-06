import { expect, test, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ToolMeta } from "@/tools/types";
import * as nextNavigation from "next/navigation";

// useSearchParams / useRouter のモック
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useRouter: vi.fn(() => ({ replace: mockReplace })),
}));

import ToolsFilterableList from "../ToolsFilterableList";

const mockTools: ToolMeta[] = [
  {
    slug: "char-count",
    name: "文字数カウント",
    nameEn: "Character Count",
    description: "テキストの文字数をカウントします",
    shortDescription: "文字数・バイト数をカウント",
    keywords: [],
    category: "text",
    relatedSlugs: [],
    publishedAt: "2026-01-01T00:00:00+09:00",
    trustLevel: "verified",
    howItWorks: "ブラウザ上で処理します",
  },
  {
    slug: "base64",
    name: "Base64エンコード",
    nameEn: "Base64 Encode",
    description: "Base64エンコード/デコードを行います",
    shortDescription: "Base64変換ツール",
    keywords: [],
    category: "encoding",
    relatedSlugs: [],
    publishedAt: "2026-01-01T00:00:00+09:00",
    trustLevel: "verified",
    howItWorks: "ブラウザ上で処理します",
  },
  {
    slug: "json-formatter",
    name: "JSON整形",
    nameEn: "JSON Formatter",
    description: "JSONを整形します",
    shortDescription: "JSONを見やすく整形",
    keywords: [],
    category: "developer",
    relatedSlugs: [],
    publishedAt: "2026-01-01T00:00:00+09:00",
    trustLevel: "verified",
    howItWorks: "ブラウザ上で処理します",
  },
];

// 各テスト前にデフォルトのモック（フィルターなし）に戻す
beforeEach(() => {
  vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
    new URLSearchParams() as ReturnType<typeof nextNavigation.useSearchParams>,
  );
  mockReplace.mockClear();
});

test("フィルターナビゲーションが表示される", () => {
  render(<ToolsFilterableList tools={mockTools} />);
  expect(
    screen.getByRole("navigation", { name: "カテゴリで絞り込む" }),
  ).toBeInTheDocument();
});

test("「すべて」ボタンが表示される", () => {
  render(<ToolsFilterableList tools={mockTools} />);
  expect(screen.getByRole("button", { name: "すべて" })).toBeInTheDocument();
});

test("5つのカテゴリボタンが表示される", () => {
  render(<ToolsFilterableList tools={mockTools} />);
  expect(screen.getByRole("button", { name: "テキスト" })).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "エンコーディング" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "開発者向け" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "セキュリティ" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "生成" })).toBeInTheDocument();
});

test("初期状態では全ツールが表示される", () => {
  render(<ToolsFilterableList tools={mockTools} />);
  expect(screen.getByText("文字数カウント")).toBeInTheDocument();
  expect(screen.getByText("Base64エンコード")).toBeInTheDocument();
  expect(screen.getByText("JSON整形")).toBeInTheDocument();
});

test("初期状態では「すべて」ボタンがアクティブ（aria-pressed=true）", () => {
  render(<ToolsFilterableList tools={mockTools} />);
  const allButton = screen.getByRole("button", { name: "すべて" });
  expect(allButton).toHaveAttribute("aria-pressed", "true");
});

test("カテゴリフィルター押下で router.replace が呼ばれる", async () => {
  render(<ToolsFilterableList tools={mockTools} />);
  const textButton = screen.getByRole("button", { name: "テキスト" });
  await userEvent.click(textButton);
  expect(mockReplace).toHaveBeenCalledOnce();
  // URLに category=text が含まれる
  const calledUrl = mockReplace.mock.calls[0][0] as string;
  expect(calledUrl).toContain("category=text");
});

test("URLに category=text がある状態ではテキストカテゴリのツールのみ表示", () => {
  vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
    new URLSearchParams("category=text") as ReturnType<
      typeof nextNavigation.useSearchParams
    >,
  );

  render(<ToolsFilterableList tools={mockTools} />);
  expect(screen.getByText("文字数カウント")).toBeInTheDocument();
  expect(screen.queryByText("Base64エンコード")).not.toBeInTheDocument();
  expect(screen.queryByText("JSON整形")).not.toBeInTheDocument();
});

test("URLに category=text がある状態ではテキストボタンがアクティブ", () => {
  vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
    new URLSearchParams("category=text") as ReturnType<
      typeof nextNavigation.useSearchParams
    >,
  );

  render(<ToolsFilterableList tools={mockTools} />);
  const textButton = screen.getByRole("button", { name: "テキスト" });
  expect(textButton).toHaveAttribute("aria-pressed", "true");
  const allButton = screen.getByRole("button", { name: "すべて" });
  expect(allButton).toHaveAttribute("aria-pressed", "false");
});

test("アクティブなフィルター押下で「すべて」に戻る（URLから category を削除）", async () => {
  vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
    new URLSearchParams("category=text") as ReturnType<
      typeof nextNavigation.useSearchParams
    >,
  );

  render(<ToolsFilterableList tools={mockTools} />);
  const textButton = screen.getByRole("button", { name: "テキスト" });
  await userEvent.click(textButton);
  expect(mockReplace).toHaveBeenCalledOnce();
  const calledUrl = mockReplace.mock.calls[0][0] as string;
  expect(calledUrl).not.toContain("category");
});
