import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// allTileDefinitions を mock して制御可能にする
vi.mock("@/lib/toolbox/registry", () => ({
  allTileDefinitions: [],
}));

import TilesIndexPage, { metadata } from "../page";

test("metadata.robots は noindex, nofollow を返す", () => {
  expect(metadata.robots).toEqual({ index: false, follow: false });
});

test("0 件時に空状態文言が render される", () => {
  render(<TilesIndexPage />);
  expect(screen.getByText(/タイルはまだ 0 件です/)).toBeInTheDocument();
});

test("ページ見出し（h1）が存在する", () => {
  render(<TilesIndexPage />);
  expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
});
