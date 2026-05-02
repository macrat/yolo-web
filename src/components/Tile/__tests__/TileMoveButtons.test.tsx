/**
 * TileMoveButtons コンポーネントのテスト
 *
 * 移動ボタン（前へ / 後へ / 先頭へ / 末尾へ）の表示・disabled 制御・コールバック。
 * small サイズ展開 UI についても基本動作を検証。
 */

import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TileMoveButtons from "../TileMoveButtons";

const defaultProps = {
  isFirst: false,
  isLast: false,
  onMoveFirst: vi.fn(),
  onMovePrev: vi.fn(),
  onMoveNext: vi.fn(),
  onMoveLast: vi.fn(),
};

describe("TileMoveButtons — 表示", () => {
  test("4 つのボタンがすべて描画される（medium サイズ）", () => {
    render(<TileMoveButtons {...defaultProps} size="medium" />);
    expect(
      screen.getByRole("button", { name: "先頭へ移動" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "前へ移動" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "後へ移動" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "末尾へ移動" }),
    ).toBeInTheDocument();
  });
});

describe("TileMoveButtons — disabled 制御", () => {
  test("isFirst=true のとき「先頭へ」「前へ」が disabled になる", () => {
    render(<TileMoveButtons {...defaultProps} size="medium" isFirst={true} />);
    expect(screen.getByRole("button", { name: "先頭へ移動" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "前へ移動" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "後へ移動" })).not.toBeDisabled();
    expect(
      screen.getByRole("button", { name: "末尾へ移動" }),
    ).not.toBeDisabled();
  });

  test("isLast=true のとき「後へ」「末尾へ」が disabled になる", () => {
    render(<TileMoveButtons {...defaultProps} size="medium" isLast={true} />);
    expect(
      screen.getByRole("button", { name: "先頭へ移動" }),
    ).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "前へ移動" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "後へ移動" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "末尾へ移動" })).toBeDisabled();
  });

  test("isFirst=true かつ isLast=true のとき 4 ボタンすべて disabled", () => {
    render(
      <TileMoveButtons
        {...defaultProps}
        size="medium"
        isFirst={true}
        isLast={true}
      />,
    );
    expect(screen.getByRole("button", { name: "先頭へ移動" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "前へ移動" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "後へ移動" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "末尾へ移動" })).toBeDisabled();
  });
});

describe("TileMoveButtons — コールバック", () => {
  test("「先頭へ」クリックで onMoveFirst が呼ばれる", () => {
    const onMoveFirst = vi.fn();
    render(
      <TileMoveButtons
        {...defaultProps}
        size="medium"
        onMoveFirst={onMoveFirst}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "先頭へ移動" }));
    expect(onMoveFirst).toHaveBeenCalledTimes(1);
  });

  test("「前へ」クリックで onMovePrev が呼ばれる", () => {
    const onMovePrev = vi.fn();
    render(
      <TileMoveButtons
        {...defaultProps}
        size="medium"
        onMovePrev={onMovePrev}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "前へ移動" }));
    expect(onMovePrev).toHaveBeenCalledTimes(1);
  });

  test("「後へ」クリックで onMoveNext が呼ばれる", () => {
    const onMoveNext = vi.fn();
    render(
      <TileMoveButtons
        {...defaultProps}
        size="medium"
        onMoveNext={onMoveNext}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "後へ移動" }));
    expect(onMoveNext).toHaveBeenCalledTimes(1);
  });

  test("「末尾へ」クリックで onMoveLast が呼ばれる", () => {
    const onMoveLast = vi.fn();
    render(
      <TileMoveButtons
        {...defaultProps}
        size="medium"
        onMoveLast={onMoveLast}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "末尾へ移動" }));
    expect(onMoveLast).toHaveBeenCalledTimes(1);
  });

  test("disabled ボタンをクリックしてもコールバックが呼ばれない", () => {
    const onMoveFirst = vi.fn();
    render(
      <TileMoveButtons
        {...defaultProps}
        size="medium"
        isFirst={true}
        onMoveFirst={onMoveFirst}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "先頭へ移動" }));
    expect(onMoveFirst).not.toHaveBeenCalled();
  });
});

describe("TileMoveButtons — small サイズ", () => {
  test("small サイズでも 4 種類すべての操作が利用可能（展開後に 4 ボタン表示）", () => {
    render(<TileMoveButtons {...defaultProps} size="small" />);
    // small サイズは展開トリガーボタンを表示する
    const trigger = screen.getByRole("button", { name: "移動操作を展開" });
    expect(trigger).toBeInTheDocument();

    // トリガーをクリックして展開
    fireEvent.click(trigger);

    // 展開後に 4 ボタンがすべて表示される
    expect(
      screen.getByRole("button", { name: "先頭へ移動" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "前へ移動" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "後へ移動" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "末尾へ移動" }),
    ).toBeInTheDocument();
  });

  test("small サイズで展開後、もう一度トリガーをクリックすると閉じる", () => {
    render(<TileMoveButtons {...defaultProps} size="small" />);
    const trigger = screen.getByRole("button", { name: "移動操作を展開" });

    fireEvent.click(trigger);
    expect(
      screen.getByRole("button", { name: "先頭へ移動" }),
    ).toBeInTheDocument();

    // 展開パネル内の閉じるボタンをクリック
    const closeBtn = screen.getByRole("button", { name: "移動操作を閉じる" });
    fireEvent.click(closeBtn);
    expect(
      screen.queryByRole("button", { name: "先頭へ移動" }),
    ).not.toBeInTheDocument();
  });
});
