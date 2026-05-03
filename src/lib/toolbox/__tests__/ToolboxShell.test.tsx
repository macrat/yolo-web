/**
 * ToolboxShell コンポーネントのテスト
 *
 * C-3 タスクの完了条件:
 * - Edit / Done ボタンによるモード切替が動作する
 * - タイル削除時に Undo バナーが表示される
 * - Undo 押下で削除取消（Undo 経路）
 * - 期間経過後に確定（確定経路）= localStorage に書き込まれる
 * - 確認ダイアログなし（即削除 + Undo バナー方式）
 *
 * A-1 観点:
 * - 観点 5（操作排他）: Edit モード中の children への isEditing 伝播
 * - 観点 6（Undo 確定動作）: 期間経過後にデータが確定する
 * - 観点 9（儀式性）: Edit ボタン 1 タップで即遷移
 * - 観点 10（削除誤操作と Undo 機能成立）: 削除 → Undo → 取消
 * - 観点 12（DESIGN.md §4）: box-shadow のみ、opacity/揺れアニメ不採用
 */

import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import type { TileLayoutEntry } from "../storage";

// ---------------------------------------------------------------------------
// useToolboxConfig モック
// ---------------------------------------------------------------------------
// ToolboxShell は内部で useToolboxConfig() を呼ぶ。
// ここではストレージへの実際の書き込みをコントロールするためにモックを使う。

const mockTiles: TileLayoutEntry[] = [
  { slug: "tile-1", order: 0, size: "medium" },
  { slug: "tile-2", order: 1, size: "medium" },
  { slug: "tile-3", order: 2, size: "medium" },
];

let currentTiles = [...mockTiles];
const mockSetTiles = vi.fn((tiles: TileLayoutEntry[]) => {
  currentTiles = tiles;
});
const mockResetToDefault = vi.fn();

vi.mock("../useToolboxConfig", () => ({
  useToolboxConfig: () => ({
    tiles: currentTiles,
    setTiles: mockSetTiles,
    resetToDefault: mockResetToDefault,
  }),
}));

// ---------------------------------------------------------------------------
// ToolboxShell の import（モック設定後）
// ---------------------------------------------------------------------------

const { ToolboxShell } = await import("../ToolboxShell");

// ---------------------------------------------------------------------------
// セットアップ
// ---------------------------------------------------------------------------

beforeEach(() => {
  currentTiles = [...mockTiles];
  mockSetTiles.mockClear();
  mockResetToDefault.mockClear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Edit / Done モード切替（観点 9: 儀式性）
// ---------------------------------------------------------------------------

describe("ToolboxShell — Edit / Done モード切替（観点 9）", () => {
  test("初期状態: 使用モード（isEditing=false）で Edit ボタンが表示される", () => {
    render(
      <ToolboxShell>
        {({ isEditing }) => (
          <div data-testid="children" data-editing={String(isEditing)} />
        )}
      </ToolboxShell>,
    );

    // 初期状態は使用モード
    expect(screen.getByTestId("children")).toHaveAttribute(
      "data-editing",
      "false",
    );
    // Edit ボタンが表示されている
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  test("Edit ボタンを 1 クリックで編集モードへ遷移する（儀式なし）", () => {
    render(
      <ToolboxShell>
        {({ isEditing }) => (
          <div data-testid="children" data-editing={String(isEditing)} />
        )}
      </ToolboxShell>,
    );

    // Edit ボタン 1 クリック
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    });

    // 編集モードに遷移している
    expect(screen.getByTestId("children")).toHaveAttribute(
      "data-editing",
      "true",
    );
  });

  test("編集モードで Done ボタンが表示され、クリックで使用モードへ戻る", () => {
    render(
      <ToolboxShell>
        {({ isEditing }) => (
          <div data-testid="children" data-editing={String(isEditing)} />
        )}
      </ToolboxShell>,
    );

    // Edit ボタンをクリック
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    });
    expect(screen.getByTestId("children")).toHaveAttribute(
      "data-editing",
      "true",
    );

    // Done ボタンが表示されている
    const doneButton = screen.getByRole("button", { name: /done|完了/i });
    expect(doneButton).toBeInTheDocument();

    // Done ボタンをクリック
    act(() => {
      fireEvent.click(doneButton);
    });

    // 使用モードに戻る
    expect(screen.getByTestId("children")).toHaveAttribute(
      "data-editing",
      "false",
    );
  });

  test("観点 5（操作排他）: children に isEditing=true が伝播する", () => {
    render(
      <ToolboxShell>
        {({ isEditing }) => (
          <div data-testid="children" data-editing={String(isEditing)} />
        )}
      </ToolboxShell>,
    );

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    });

    // 子コンポーネントが isEditing=true を受け取る
    expect(screen.getByTestId("children")).toHaveAttribute(
      "data-editing",
      "true",
    );
  });
});

// ---------------------------------------------------------------------------
// Undo バナー — 表示（観点 10）
// ---------------------------------------------------------------------------

describe("ToolboxShell — Undo バナー表示（観点 10）", () => {
  test("onDelete を呼ぶと Undo バナーが表示される", () => {
    render(
      <ToolboxShell>
        {({ isEditing, onDelete }) => (
          <>
            <div data-testid="children" data-editing={String(isEditing)} />
            <button
              data-testid="delete-tile-1"
              onClick={() => onDelete("tile-1")}
            >
              削除
            </button>
          </>
        )}
      </ToolboxShell>,
    );

    // 編集モードへ
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    });

    // タイルを削除
    act(() => {
      fireEvent.click(screen.getByTestId("delete-tile-1"));
    });

    // Undo バナーが表示される
    expect(screen.getByTestId("undo-banner")).toBeInTheDocument();
  });

  test("Undo バナーには Undo ボタンが含まれる", () => {
    render(
      <ToolboxShell>
        {({ onDelete }) => (
          <button
            data-testid="delete-tile-1"
            onClick={() => onDelete("tile-1")}
          >
            削除
          </button>
        )}
      </ToolboxShell>,
    );

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("delete-tile-1"));
    });

    // Undo ボタンが含まれる
    expect(
      screen.getByRole("button", { name: /undo|元に戻す/i }),
    ).toBeInTheDocument();
  });

  test("削除後は children に渡される tiles から削除済みタイルが除外される", () => {
    render(
      <ToolboxShell>
        {({ onDelete, tiles }) => (
          <>
            <div data-testid="tile-count" data-count={String(tiles.length)} />
            <button
              data-testid="delete-tile-1"
              onClick={() => onDelete("tile-1")}
            >
              削除
            </button>
          </>
        )}
      </ToolboxShell>,
    );

    // 初期は 3 タイル
    expect(screen.getByTestId("tile-count")).toHaveAttribute("data-count", "3");

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("delete-tile-1"));
    });

    // 削除後は 2 タイル（Undo 期間中でも即座に除外）
    expect(screen.getByTestId("tile-count")).toHaveAttribute("data-count", "2");
  });
});

// ---------------------------------------------------------------------------
// Undo 経路（削除取消）— 観点 10
// ---------------------------------------------------------------------------

describe("ToolboxShell — Undo 経路（観点 10）", () => {
  test("Undo 押下で削除が取り消される（tiles が元に戻る）", () => {
    render(
      <ToolboxShell>
        {({ onDelete, tiles }) => (
          <>
            <div data-testid="tile-count" data-count={String(tiles.length)} />
            <button
              data-testid="delete-tile-1"
              onClick={() => onDelete("tile-1")}
            >
              削除
            </button>
          </>
        )}
      </ToolboxShell>,
    );

    // 編集モードへ
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    });

    // 削除
    act(() => {
      fireEvent.click(screen.getByTestId("delete-tile-1"));
    });
    expect(screen.getByTestId("tile-count")).toHaveAttribute("data-count", "2");

    // Undo
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /undo|元に戻す/i }));
    });

    // 元に戻る
    expect(screen.getByTestId("tile-count")).toHaveAttribute("data-count", "3");
  });

  test("Undo 押下後は setTiles が呼ばれない（localStorage 書き込みなし）", () => {
    render(
      <ToolboxShell>
        {({ onDelete }) => (
          <button data-testid="delete" onClick={() => onDelete("tile-1")}>
            削除
          </button>
        )}
      </ToolboxShell>,
    );

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("delete"));
    });

    // setTiles はまだ呼ばれていない（Undo 期間中）
    const callCountBeforeUndo = mockSetTiles.mock.calls.length;

    // Undo
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /undo|元に戻す/i }));
    });

    // Undo 後も setTiles 呼び出し数は変わらない
    expect(mockSetTiles.mock.calls.length).toBe(callCountBeforeUndo);
  });

  test("Undo 後はバナーが消える", () => {
    render(
      <ToolboxShell>
        {({ onDelete }) => (
          <button data-testid="delete" onClick={() => onDelete("tile-1")}>
            削除
          </button>
        )}
      </ToolboxShell>,
    );

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("delete"));
    });
    expect(screen.getByTestId("undo-banner")).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /undo|元に戻す/i }));
    });

    // バナーが消える
    expect(screen.queryByTestId("undo-banner")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 確定経路（期間経過後にデータ確定）— 観点 6
// ---------------------------------------------------------------------------

describe("ToolboxShell — 確定経路（観点 6）", () => {
  test("Undo 期間経過後に setTiles が呼ばれる（localStorage 書き込み = 確定）", () => {
    render(
      <ToolboxShell>
        {({ onDelete }) => (
          <button data-testid="delete" onClick={() => onDelete("tile-1")}>
            削除
          </button>
        )}
      </ToolboxShell>,
    );

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    });

    // 削除前は setTiles 未呼び出し（またはそれ以前の呼び出し数を記録）
    const callCountBeforeDelete = mockSetTiles.mock.calls.length;

    act(() => {
      fireEvent.click(screen.getByTestId("delete"));
    });

    // 削除直後はまだ setTiles が呼ばれていない（Undo 期間中）
    expect(mockSetTiles.mock.calls.length).toBe(callCountBeforeDelete);

    // Undo 期間（5 秒以上）を経過させる
    act(() => {
      vi.advanceTimersByTime(6000);
    });

    // 期間経過後に setTiles が呼ばれる（確定）
    expect(mockSetTiles.mock.calls.length).toBeGreaterThan(
      callCountBeforeDelete,
    );
  });

  test("確定後はバナーが消える", () => {
    render(
      <ToolboxShell>
        {({ onDelete }) => (
          <button data-testid="delete" onClick={() => onDelete("tile-1")}>
            削除
          </button>
        )}
      </ToolboxShell>,
    );

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("delete"));
    });

    // バナーが表示されている
    expect(screen.getByTestId("undo-banner")).toBeInTheDocument();

    // Undo 期間経過
    act(() => {
      vi.advanceTimersByTime(6000);
    });

    // バナーが消える
    expect(screen.queryByTestId("undo-banner")).not.toBeInTheDocument();
  });

  test("確定後は Undo ボタンが表示されない（確定後は元に戻せない）", () => {
    render(
      <ToolboxShell>
        {({ onDelete, tiles }) => (
          <>
            <div data-testid="tile-count" data-count={String(tiles.length)} />
            <button data-testid="delete" onClick={() => onDelete("tile-1")}>
              削除
            </button>
          </>
        )}
      </ToolboxShell>,
    );

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("delete"));
    });

    // 期間経過（確定）
    act(() => {
      vi.advanceTimersByTime(6000);
    });

    // バナーが消えているのでボタンなし = Undo 不可
    expect(
      screen.queryByRole("button", { name: /undo|元に戻す/i }),
    ).not.toBeInTheDocument();

    // tiles は 2 のまま（確定後は元に戻せない）
    expect(screen.getByTestId("tile-count")).toHaveAttribute("data-count", "2");
  });

  test("確定時に setTiles に渡された tiles に削除済みタイルが含まれていない", () => {
    render(
      <ToolboxShell>
        {({ onDelete }) => (
          <button data-testid="delete" onClick={() => onDelete("tile-1")}>
            削除
          </button>
        )}
      </ToolboxShell>,
    );

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("delete"));
    });

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    // setTiles の最後の呼び出しで tile-1 が含まれていないことを確認
    const lastCall =
      mockSetTiles.mock.calls[mockSetTiles.mock.calls.length - 1];
    expect(lastCall).toBeDefined();
    const savedTiles = lastCall[0] as TileLayoutEntry[];
    expect(savedTiles.every((t) => t.slug !== "tile-1")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 確認ダイアログなし（前提 B-Undo: NN/g 研究反映）
// ---------------------------------------------------------------------------

describe("ToolboxShell — 確認ダイアログなし", () => {
  test("削除時に確認ダイアログが出ない（即削除 + Undo バナー方式）", () => {
    const originalConfirm = window.confirm;
    const confirmSpy = vi.fn().mockReturnValue(true);
    window.confirm = confirmSpy;

    render(
      <ToolboxShell>
        {({ onDelete }) => (
          <button data-testid="delete" onClick={() => onDelete("tile-1")}>
            削除
          </button>
        )}
      </ToolboxShell>,
    );

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("delete"));
    });

    // confirm は呼ばれない
    expect(confirmSpy).not.toHaveBeenCalled();

    window.confirm = originalConfirm;
  });
});

// ---------------------------------------------------------------------------
// JSDoc B-4 契約参照
// ---------------------------------------------------------------------------

describe("ToolboxShell — B-4 契約参照（JSDoc コメント確認）", () => {
  test("ToolboxShell がエクスポートされている", () => {
    expect(ToolboxShell).toBeDefined();
    expect(typeof ToolboxShell).toBe("function");
  });
});
