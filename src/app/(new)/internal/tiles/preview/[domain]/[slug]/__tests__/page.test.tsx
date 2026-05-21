import { describe, it, expect, vi } from "vitest";

// notFound() をモック
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

// TILE_DECLARATIONS をモック（char-count エントリのみ）
vi.mock("@/tools/_constants/tile-declarations", () => ({
  TILE_DECLARATIONS: [
    {
      domain: "tools",
      slug: "char-count",
      kind: "widget",
      tileComponent: () => (
        <div data-testid="char-count-tile">CharCountTile</div>
      ),
      recommendedSize: { cols: 3, rows: 2 },
      inputPlaceholder: "文字を入力すると数えます",
      outputPlaceholder: "",
      detailPath: "/tools/char-count",
      widgetSummary: "文字数を素早く数える",
    },
  ],
}));

// calcTilePixels をモック
vi.mock("@/tools/_constants/tile-grid", () => ({
  calcTilePixels: vi.fn(() => ({ width: 400, height: 264 })),
}));

import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";
import PreviewPage from "../page";

describe("/internal/tiles/preview/[domain]/[slug]", () => {
  it("renders the tile component for existing slug (tools/char-count)", async () => {
    const element = await PreviewPage({
      params: Promise.resolve({ domain: "tools", slug: "char-count" }),
    });
    render(element);
    expect(screen.getByTestId("char-count-tile")).toBeInTheDocument();
  });

  it("calls notFound() for non-existing slug", async () => {
    await expect(
      PreviewPage({
        params: Promise.resolve({ domain: "tools", slug: "nonexistent-tool" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });
});
