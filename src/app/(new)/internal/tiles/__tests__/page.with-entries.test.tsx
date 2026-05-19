import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// 1 件のタイル定義を mock する
vi.mock("@/lib/toolbox/registry", () => ({
  allTileDefinitions: [
    {
      slug: "test-tool",
      displayName: "テストツール",
      size: { colSpan: 2, rowSpan: 1 },
    },
  ],
}));

import TilesIndexPage from "../page";

test("1 件追加時にエントリが表示される", () => {
  render(<TilesIndexPage />);
  expect(screen.getByText("test-tool")).toBeInTheDocument();
  expect(screen.getByText("テストツール")).toBeInTheDocument();
  expect(screen.getByText("2 × 1")).toBeInTheDocument();
});

test("1 件追加時は空状態文言が表示されない", () => {
  render(<TilesIndexPage />);
  expect(screen.queryByText(/タイルはまだ 0 件です/)).not.toBeInTheDocument();
});
