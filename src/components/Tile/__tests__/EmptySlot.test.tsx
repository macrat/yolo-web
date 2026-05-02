/**
 * EmptySlot コンポーネントのテスト
 *
 * テスト戦略:
 * - data-size 属性が size prop に応じて正しく付与されることを検証する
 * - inline gridColumn スタイルが存在しないことを検証する
 *   （gridColumn は TileGrid.module.css の data-size セレクタで制御する方式に統一）
 * - aria-label・クリックコールバック等の基本動作を検証する
 */

import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EmptySlot from "../EmptySlot";

describe("EmptySlot — data-size 属性", () => {
  test("size='small' のとき data-size='small' を持つ", () => {
    render(<EmptySlot size="small" />);
    const slot = screen.getByRole("button");
    expect(slot).toHaveAttribute("data-size", "small");
  });

  test("size='medium' のとき data-size='medium' を持つ", () => {
    render(<EmptySlot size="medium" />);
    const slot = screen.getByRole("button");
    expect(slot).toHaveAttribute("data-size", "medium");
  });

  test("size='large' のとき data-size='large' を持つ", () => {
    render(<EmptySlot size="large" />);
    const slot = screen.getByRole("button");
    expect(slot).toHaveAttribute("data-size", "large");
  });

  test("size 省略時（デフォルト medium）のとき data-size='medium' を持つ", () => {
    render(<EmptySlot />);
    const slot = screen.getByRole("button");
    expect(slot).toHaveAttribute("data-size", "medium");
  });
});

describe("EmptySlot — inline gridColumn なし", () => {
  test("ルート要素に inline gridColumn スタイルが存在しない", () => {
    render(<EmptySlot size="medium" />);
    const slot = screen.getByRole("button");
    // gridColumn はインラインスタイルではなく TileGrid.module.css の data-size セレクタで制御する
    expect(slot.style.gridColumn).toBe("");
  });

  test("size='small' でも inline gridColumn スタイルが存在しない", () => {
    render(<EmptySlot size="small" />);
    const slot = screen.getByRole("button");
    expect(slot.style.gridColumn).toBe("");
  });

  test("size='large' でも inline gridColumn スタイルが存在しない", () => {
    render(<EmptySlot size="large" />);
    const slot = screen.getByRole("button");
    expect(slot.style.gridColumn).toBe("");
  });
});

describe("EmptySlot — 基本レンダリング", () => {
  test("デフォルトラベル「ツールを追加」が描画される", () => {
    render(<EmptySlot />);
    expect(screen.getByText("ツールを追加")).toBeInTheDocument();
  });

  test("label prop でラベルテキストを変更できる", () => {
    render(<EmptySlot label="カスタムラベル" />);
    expect(screen.getByText("カスタムラベル")).toBeInTheDocument();
  });

  test("onAdd クリックで onAdd が呼ばれる", () => {
    const handleAdd = vi.fn();
    render(<EmptySlot onAdd={handleAdd} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleAdd).toHaveBeenCalledTimes(1);
  });
});

describe("EmptySlot — a11y", () => {
  test("index 未指定時は aria-label がラベルテキストと同じ", () => {
    render(<EmptySlot label="ツールを追加" />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "ツールを追加",
    );
  });

  test("index 指定時は aria-label に番号が含まれる", () => {
    render(<EmptySlot label="ツールを追加" index={0} />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "1 番目のスロットにツールを追加",
    );
  });

  test("index=2 のとき aria-label に「3 番目」が含まれる", () => {
    render(<EmptySlot label="ツールを追加" index={2} />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "3 番目のスロットにツールを追加",
    );
  });
});
