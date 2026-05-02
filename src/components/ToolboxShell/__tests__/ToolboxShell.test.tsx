/**
 * ToolboxShell のユニットテスト
 *
 * jsdom 環境では CSS スタッキング・layout 依存・DnD 物理挙動は検証できない（AP-I09）。
 * 以下の観点のみを単体テストで検証する：
 * - mode 状態（"view" | "edit"）の遷移
 * - 「編集」「完了」ボタンの表示切替
 * - 編集モード時に children へ渡される mode prop が "edit" になる
 * - 使用モード時に children へ渡される mode prop が "view" になる
 * - scroll-locked クラスの付与/除去（scroll-lock.ts カウンタ式、AP-I07 準拠）
 * - DndContext の mount/unmount（編集モード時のみ mount）
 * - data-mode 属性の付与（CSS / Playwright の照合用）
 * - focus management（編集/完了ボタンへの自動フォーカス移動）
 * - aria-label による状態通知
 *
 * CSS スタッキング・DragOverlay 実挙動・Playwright 検証は別途 E2E テストで実施する。
 */

import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ToolboxShell from "@/components/ToolboxShell";

// @dnd-kit/core の DndContext / sensors をモック化（jsdom では DnD 物理挙動を評価しない）
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({
    children,
    "data-testid": testid,
  }: {
    children: React.ReactNode;
    "data-testid"?: string;
  }) => <div data-testid={testid ?? "dnd-context-mock"}>{children}</div>,
  PointerSensor: class PointerSensor {},
  TouchSensor: class TouchSensor {},
  KeyboardSensor: class KeyboardSensor {},
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  // closestCenter は ToolboxShell.tsx で collisionDetection として使用
  closestCenter: vi.fn(),
}));

// @dnd-kit/sortable のモック（KeyboardSensor coordinateGetter 依存）
vi.mock("@dnd-kit/sortable", () => ({
  sortableKeyboardCoordinates: vi.fn(),
}));

describe("ToolboxShell", () => {
  // scroll-locked クラスと dataset をリセット
  beforeEach(() => {
    document.body.classList.remove("scroll-locked");
    delete document.body.dataset["scrollLockCount"];
  });

  afterEach(() => {
    document.body.classList.remove("scroll-locked");
    delete document.body.dataset["scrollLockCount"];
  });

  // --- モード遷移 ---

  test("初期状態は使用モード（view）である", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    // data-mode="view" が付与される
    expect(screen.getByTestId("toolbox-shell")).toHaveAttribute(
      "data-mode",
      "view",
    );
  });

  test("「編集」ボタンが使用モード時に表示される", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    expect(
      screen.getByRole("button", { name: "道具箱を編集モードにする" }),
    ).toBeInTheDocument();
  });

  test("「完了」ボタンが使用モード時には非表示である", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    expect(
      screen.queryByRole("button", { name: "編集を完了して使用モードに戻る" }),
    ).not.toBeInTheDocument();
  });

  test("「編集」ボタンをクリックすると編集モードに遷移する", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    fireEvent.click(
      screen.getByRole("button", { name: "道具箱を編集モードにする" }),
    );
    expect(screen.getByTestId("toolbox-shell")).toHaveAttribute(
      "data-mode",
      "edit",
    );
  });

  test("編集モード時に「完了」ボタンが表示される", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    fireEvent.click(
      screen.getByRole("button", { name: "道具箱を編集モードにする" }),
    );
    expect(
      screen.getByRole("button", { name: "編集を完了して使用モードに戻る" }),
    ).toBeInTheDocument();
  });

  test("編集モード時に「編集」ボタン（テキスト「編集」）が非表示になる", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    fireEvent.click(
      screen.getByRole("button", { name: "道具箱を編集モードにする" }),
    );
    // aria-label "道具箱を編集モードにする" のボタンが消えている
    expect(
      screen.queryByRole("button", { name: "道具箱を編集モードにする" }),
    ).not.toBeInTheDocument();
  });

  test("「完了」ボタンをクリックすると使用モードに戻る", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    fireEvent.click(
      screen.getByRole("button", { name: "道具箱を編集モードにする" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "編集を完了して使用モードに戻る" }),
    );
    expect(screen.getByTestId("toolbox-shell")).toHaveAttribute(
      "data-mode",
      "view",
    );
  });

  // --- children への mode 伝達 ---

  test("children render prop に view モードが渡される（初期）", () => {
    const child = vi.fn(() => null);
    render(<ToolboxShell>{child}</ToolboxShell>);
    // expect.objectContaining で必須 props のみ検証し、将来の props 追加に耐性を持たせる
    expect(child).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "view",
        setDndHandlers: expect.any(Function),
        openOverlayId: null,
        setOpenOverlay: expect.any(Function),
      }),
    );
  });

  test("編集モード時に children render prop に edit モードが渡される", () => {
    const child = vi.fn(() => null);
    render(<ToolboxShell>{child}</ToolboxShell>);
    fireEvent.click(
      screen.getByRole("button", { name: "道具箱を編集モードにする" }),
    );
    // 直近の呼び出しは edit モード
    expect(child).toHaveBeenLastCalledWith(
      expect.objectContaining({
        mode: "edit",
        setDndHandlers: expect.any(Function),
      }),
    );
  });

  test("完了後に children render prop に view モードが戻る", () => {
    const child = vi.fn(() => null);
    render(<ToolboxShell>{child}</ToolboxShell>);
    fireEvent.click(
      screen.getByRole("button", { name: "道具箱を編集モードにする" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "編集を完了して使用モードに戻る" }),
    );
    expect(child).toHaveBeenLastCalledWith(
      expect.objectContaining({
        mode: "view",
        setDndHandlers: expect.any(Function),
      }),
    );
  });

  // --- scroll-locked クラス（AP-I07 準拠） ---

  test("編集モード遷移時に body へ scroll-locked クラスが付与される", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    expect(document.body.classList.contains("scroll-locked")).toBe(false);
    fireEvent.click(
      screen.getByRole("button", { name: "道具箱を編集モードにする" }),
    );
    expect(document.body.classList.contains("scroll-locked")).toBe(true);
  });

  test("使用モードへ戻ると body から scroll-locked クラスが除去される", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    fireEvent.click(
      screen.getByRole("button", { name: "道具箱を編集モードにする" }),
    );
    expect(document.body.classList.contains("scroll-locked")).toBe(true);
    fireEvent.click(
      screen.getByRole("button", { name: "編集を完了して使用モードに戻る" }),
    );
    expect(document.body.classList.contains("scroll-locked")).toBe(false);
  });

  // --- DndContext の mount/unmount ---

  test("使用モード時は DndContext が mount されない", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    // 使用モードでは DndContext（モック）が存在しない
    expect(screen.queryByTestId("dnd-context-mock")).not.toBeInTheDocument();
  });

  test("編集モード時は DndContext が mount される", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    fireEvent.click(
      screen.getByRole("button", { name: "道具箱を編集モードにする" }),
    );
    expect(screen.getByTestId("dnd-context-mock")).toBeInTheDocument();
  });

  test("使用モードへ戻ると DndContext が unmount される", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    fireEvent.click(
      screen.getByRole("button", { name: "道具箱を編集モードにする" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "編集を完了して使用モードに戻る" }),
    );
    expect(screen.queryByTestId("dnd-context-mock")).not.toBeInTheDocument();
  });

  // --- キーボードアクセシビリティ ---

  test("「編集」ボタンは button 要素で、type='button' を持つ", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    const editBtn = screen.getByRole("button", {
      name: "道具箱を編集モードにする",
    });
    expect(editBtn.tagName).toBe("BUTTON");
    expect(editBtn).toHaveAttribute("type", "button");
  });

  test("「完了」ボタンは button 要素で、type='button' を持つ", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    fireEvent.click(
      screen.getByRole("button", { name: "道具箱を編集モードにする" }),
    );
    const doneBtn = screen.getByRole("button", {
      name: "編集を完了して使用モードに戻る",
    });
    expect(doneBtn.tagName).toBe("BUTTON");
    expect(doneBtn).toHaveAttribute("type", "button");
  });

  // --- focus management ---

  test("初回マウント時（使用モード）はフォーカスが奪われない", () => {
    // AP-I09 由来のバグ防止: useEffect([mode]) は初回マウント時にも発火するため、
    // isFirstRender ガードなしだと render 直後に「編集」ボタンへフォーカスが移動し
    // ページ訪問時にスクロールジャンプやキーボード順序破壊が発生する。
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    // フォーカスは body のままであること（ToolboxShell が奪ってはいけない）
    expect(document.activeElement).toBe(document.body);
  });

  test("編集モード遷移後、「完了」ボタンにフォーカスが移動する", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    fireEvent.click(
      screen.getByRole("button", { name: "道具箱を編集モードにする" }),
    );
    const doneBtn = screen.getByRole("button", {
      name: "編集を完了して使用モードに戻る",
    });
    expect(document.activeElement).toBe(doneBtn);
  });

  test("使用モード復帰後、「編集」ボタンにフォーカスが戻る", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    fireEvent.click(
      screen.getByRole("button", { name: "道具箱を編集モードにする" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "編集を完了して使用モードに戻る" }),
    );
    const editBtn = screen.getByRole("button", {
      name: "道具箱を編集モードにする",
    });
    expect(document.activeElement).toBe(editBtn);
  });

  // --- aria-label / 状態通知 ---

  test("「編集」ボタンに aria-label が付与されている", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    const editBtn = screen.getByRole("button", {
      name: "道具箱を編集モードにする",
    });
    expect(editBtn).toHaveAttribute("aria-label");
  });

  test("「完了」ボタンに aria-label が付与されている", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    fireEvent.click(
      screen.getByRole("button", { name: "道具箱を編集モードにする" }),
    );
    const doneBtn = screen.getByRole("button", {
      name: "編集を完了して使用モードに戻る",
    });
    expect(doneBtn).toHaveAttribute("aria-label");
  });

  // --- scroll-lock カウンタ式（Header との共存） ---

  test("編集モード遷移で scrollLockCount が 1 になる", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    fireEvent.click(
      screen.getByRole("button", { name: "道具箱を編集モードにする" }),
    );
    expect(document.body.dataset["scrollLockCount"]).toBe("1");
  });

  test("完了で scrollLockCount が 0 になり scroll-locked が除去される", () => {
    render(<ToolboxShell>{() => null}</ToolboxShell>);
    fireEvent.click(
      screen.getByRole("button", { name: "道具箱を編集モードにする" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "編集を完了して使用モードに戻る" }),
    );
    expect(document.body.dataset["scrollLockCount"]).toBe("0");
    expect(document.body.classList.contains("scroll-locked")).toBe(false);
  });

  test("Header がすでに scroll-locked を持つ状態で ToolboxShell が編集モードに入っても、完了後に scroll-locked が除去されない（カウンタが 1 残る）", () => {
    // Header 相当の別コンポーネントが先に acquireScrollLock している状態をシミュレート
    document.body.classList.add("scroll-locked");
    document.body.dataset["scrollLockCount"] = "1";

    render(<ToolboxShell>{() => null}</ToolboxShell>);
    fireEvent.click(
      screen.getByRole("button", { name: "道具箱を編集モードにする" }),
    );
    // count: 1→2
    expect(document.body.dataset["scrollLockCount"]).toBe("2");

    fireEvent.click(
      screen.getByRole("button", { name: "編集を完了して使用モードに戻る" }),
    );
    // count: 2→1 → scroll-locked はまだ残る
    expect(document.body.dataset["scrollLockCount"]).toBe("1");
    expect(document.body.classList.contains("scroll-locked")).toBe(true);
  });

  // --- overlay 排他制御 ---

  test("初期状態では openOverlayId が null（render props 経由で確認）", () => {
    let capturedId: string | null = undefined as unknown as string | null;
    render(
      <ToolboxShell>
        {({ openOverlayId }) => {
          capturedId = openOverlayId;
          return null;
        }}
      </ToolboxShell>,
    );
    expect(capturedId).toBeNull();
  });

  test("setOpenOverlay('modal-A') を呼ぶと openOverlayId が 'modal-A' になる", () => {
    let capturedId: string | null = null;
    let capturedSet: ((id: string | null) => void) | null = null;

    render(
      <ToolboxShell>
        {({ openOverlayId, setOpenOverlay }) => {
          capturedId = openOverlayId;
          capturedSet = setOpenOverlay;
          return null;
        }}
      </ToolboxShell>,
    );

    // act() で React の状態更新を同期的に flush する
    act(() => {
      capturedSet!("modal-A");
    });
    expect(capturedId).toBe("modal-A");
  });

  test("別の ID が open 中に setOpenOverlay を呼んでも上書きできる（最後の呼び出しが勝つ）", () => {
    let capturedId: string | null = null;
    let capturedSet: ((id: string | null) => void) | null = null;

    render(
      <ToolboxShell>
        {({ openOverlayId, setOpenOverlay }) => {
          capturedId = openOverlayId;
          capturedSet = setOpenOverlay;
          return null;
        }}
      </ToolboxShell>,
    );

    act(() => {
      capturedSet!("modal-A");
    });
    expect(capturedId).toBe("modal-A");

    act(() => {
      capturedSet!(null);
    });
    expect(capturedId).toBeNull();
  });

  test("openOverlayId が null でないとき tilesContainer に inert 属性が付与される", () => {
    let capturedSet: ((id: string | null) => void) | null = null;

    render(
      <ToolboxShell>
        {({ setOpenOverlay }) => {
          capturedSet = setOpenOverlay;
          return <div data-testid="child-content">child</div>;
        }}
      </ToolboxShell>,
    );

    // overlay が開いていない初期状態
    const tilesContainer = screen
      .getByTestId("toolbox-shell")
      .querySelector("[data-testid='toolbox-tiles']");
    expect(tilesContainer).not.toHaveAttribute("inert");

    // overlay を開く
    act(() => {
      capturedSet!("some-modal");
    });
    expect(tilesContainer).toHaveAttribute("inert");

    // overlay を閉じる
    act(() => {
      capturedSet!(null);
    });
    expect(tilesContainer).not.toHaveAttribute("inert");
  });
});
