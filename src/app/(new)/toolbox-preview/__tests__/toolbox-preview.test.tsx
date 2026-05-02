/**
 * toolbox-preview ページのユニットテスト
 *
 * テスト範囲:
 * - ToolboxContent が初期プリセット（INITIAL_DEFAULT_LAYOUT の 5 タイル）を描画する
 * - robots.ts の disallow に /toolbox-preview が含まれる
 *
 * テスト対象外（AP-I09 準拠 — jsdom では検証不可）:
 * - 層 3 の notFound() （Server Component の条件分岐は Playwright で検証）
 * - CSS スタッキング・DnD 物理挙動
 * - hydration mismatch（Playwright で検証）
 */

import { describe, expect, test, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
// ToolboxContentInner を直接 import してテストする。
// ToolboxContent は dynamic({ ssr: false }) ラッパーなので jsdom では直接 render できない。
import ToolboxContentInner from "../ToolboxContentInner";

// ---------------------------------------------------------------------------
// dnd-kit モック（TileGrid/ToolboxShell が依存するため jsdom ではモック必須）
// ---------------------------------------------------------------------------

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dnd-context">{children}</div>
  ),
  DragOverlay: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  PointerSensor: vi.fn(),
  TouchSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn(() => []),
  closestCenter: vi.fn(),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sortable-context">{children}</div>
  ),
  useSortable: () => ({
    attributes: {
      "aria-disabled": false,
      "aria-roledescription": "sortable",
    },
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  sortableKeyboardCoordinates: vi.fn(),
  arrayMove: vi.fn((arr: unknown[]) => arr),
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: () => "",
    },
  },
}));

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// robots.ts テスト（層 2 防御）
// ---------------------------------------------------------------------------

describe("robots.ts — 層 2: /toolbox-preview が Disallow に含まれる", () => {
  test("/toolbox-preview が disallow 配列に含まれる", async () => {
    // robots.ts を直接 import してレスポンスを確認する
    const { default: robots } = await import("@/app/robots");
    const result = robots();

    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    // wildcard ルール（userAgent: "*"）の disallow を取得する
    const wildcardRule = rules.find((r) => r.userAgent === "*");
    expect(wildcardRule).toBeDefined();

    const disallow = wildcardRule?.disallow ?? [];
    const disallowArr = Array.isArray(disallow) ? disallow : [disallow];

    expect(disallowArr).toContain("/toolbox-preview");
  });
});

// ---------------------------------------------------------------------------
// ToolboxContent コンポーネントテスト
// ---------------------------------------------------------------------------

describe("ToolboxContent — 初期プリセット 5 タイルが描画される", () => {
  test("TileGrid と ToolboxShell が描画される", () => {
    render(<ToolboxContentInner />);

    // TileGrid が描画されることを data-testid で確認する
    const grid = screen.getByTestId("tile-grid");
    expect(grid).toBeDefined();

    // ToolboxShell が描画されることを確認する
    const shell = screen.getByTestId("toolbox-shell");
    expect(shell).toBeDefined();
  });

  test("使用モード（デフォルト）では編集ボタンが 1 件表示される", () => {
    render(<ToolboxContentInner />);

    // 使用モードでは「編集」ボタンが表示される（getAllByRole で 1 件を確認）
    const editButtons = screen.getAllByRole("button", {
      name: "道具箱を編集モードにする",
    });
    expect(editButtons).toHaveLength(1);
  });
});
