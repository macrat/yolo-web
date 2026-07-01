/**
 * 道具箱ページ（実用層）のテスト — cycle-276 / B-545 決定(a)
 *
 * cycle-232 でトップ `/` にあった道具箱を /toolbox へ降ろした。
 *
 * 検証観点:
 * - h1 がページに1つで「道具箱」（ToolboxContent 内の見出しと衝突しない）
 * - 道具箱の説明 intro がある
 * - 道具箱本体（ToolboxContent）が描画される（プリセット・追加の h2 で確認。
 *   道具箱操作系の網羅検証は ToolboxContent.test.tsx が担う）
 * - metadata: 道具箱の実用説明・canonical /toolbox・noindex の不在
 */
import { beforeEach, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import ToolboxPage, { metadata } from "../page";
import { SITE_NAME, BASE_URL } from "@/lib/constants";

beforeEach(() => {
  window.localStorage.clear();
});

test("h1 はページに1つで「道具箱」を表示する", () => {
  render(<ToolboxPage />);
  const h1s = screen.getAllByRole("heading", { level: 1 });
  expect(h1s).toHaveLength(1);
  expect(h1s[0]).toHaveTextContent("道具箱");
});

test("道具箱の説明 intro がある", () => {
  render(<ToolboxPage />);
  expect(screen.getByText(/気に入った道具をここに並べて/)).toBeInTheDocument();
});

test("道具箱本体（ToolboxContent）が描画される", () => {
  render(<ToolboxPage />);
  expect(
    screen.getByRole("heading", { level: 2, name: "プリセットから始める" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 2, name: "タイルを追加" }),
  ).toBeInTheDocument();
});

// ===== metadata =====

test("metadata title は「道具箱 | サイト名」", () => {
  expect(metadata.title).toBe(`道具箱 | ${SITE_NAME}`);
});

test("metadata は道具箱の実用説明で、canonical は /toolbox・noindex なし", () => {
  const description = metadata.description as string;
  expect(description).toMatch(/道具箱/);
  expect(metadata.alternates?.canonical).toBe(`${BASE_URL}/toolbox`);
  expect(metadata.robots).toBeUndefined();
});
