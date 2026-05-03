/**
 * AddTileModal のユニットテスト
 *
 * テスト対象:
 * - 開閉状態の描画制御
 * - タイル候補の表示（currentTileSlugs による除外）
 * - 検索フィルタ機能
 * - 追加コールバック（onAdd）
 * - Esc キーで閉じる
 * - 背景クリックで閉じる
 * - scroll-lock の取得と解放
 *
 * テスト方針:
 * - scroll-lock をモックしてカウント呼び出しを検証する
 * - getAllTileables はモックして制御可能なデータセットを使う
 * - フォーカストラップは基本的な Esc / Tab 挙動のみ検証（視覚的な z-index はブラウザ依存）
 */

import { describe, expect, test, beforeEach, vi, type Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// scroll-lock をモック
vi.mock("@/lib/scroll-lock", () => ({
  acquireScrollLock: vi.fn(),
  releaseScrollLock: vi.fn(),
}));

// getAllTileables をモックしてテスト用データを使う
vi.mock("@/lib/toolbox/registry", () => ({
  getAllTileables: vi.fn(),
}));

import { acquireScrollLock, releaseScrollLock } from "@/lib/scroll-lock";
import { getAllTileables } from "@/lib/toolbox/registry";
import AddTileModal from "../AddTileModal";
import type { Tileable } from "../types";

// テスト用 Tileable データ
const MOCK_TILEABLES: Tileable[] = [
  {
    slug: "json-formatter",
    displayName: "JSON フォーマッター",
    shortDescription: "JSONを整形します",
    contentKind: "tool",
    publishedAt: "2024-01-01T00:00:00+09:00",
    trustLevel: "verified",
  },
  {
    slug: "password-generator",
    displayName: "パスワード生成",
    shortDescription: "安全なパスワードを生成します",
    contentKind: "tool",
    publishedAt: "2024-01-01T00:00:00+09:00",
    trustLevel: "verified",
  },
  {
    slug: "age-calculator",
    displayName: "年齢計算",
    shortDescription: "生年月日から年齢を計算します",
    contentKind: "tool",
    publishedAt: "2024-01-01T00:00:00+09:00",
    trustLevel: "verified",
  },
  {
    slug: "tetris",
    displayName: "テトリス",
    shortDescription: "テトリスゲーム",
    contentKind: "play",
    publishedAt: "2024-01-01T00:00:00+09:00",
    trustLevel: "generated",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  (getAllTileables as Mock).mockReturnValue(MOCK_TILEABLES);
});

describe("AddTileModal — 開閉制御", () => {
  test("isOpen=false のとき何も描画しない", () => {
    render(
      <AddTileModal
        isOpen={false}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    // モーダルダイアログが存在しない
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("isOpen=true のときモーダルを描画する", () => {
    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("isOpen=true のとき aria-modal='true' が設定されている", () => {
    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  test("isOpen=true のとき aria-labelledby が設定されている", () => {
    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    const dialog = screen.getByRole("dialog");
    const labelledBy = dialog.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    // aria-labelledby が指す要素が存在する
    expect(document.getElementById(labelledBy!)).toBeInTheDocument();
  });
});

describe("AddTileModal — 候補表示", () => {
  test("候補タイルの displayName が表示される", () => {
    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    expect(screen.getByText("JSON フォーマッター")).toBeInTheDocument();
    expect(screen.getByText("パスワード生成")).toBeInTheDocument();
    expect(screen.getByText("年齢計算")).toBeInTheDocument();
    expect(screen.getByText("テトリス")).toBeInTheDocument();
  });

  test("currentTileSlugs に含まれるタイルは候補から除外される", () => {
    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={["json-formatter", "tetris"]}
      />,
    );
    // 除外されたタイルは表示されない
    expect(screen.queryByText("JSON フォーマッター")).not.toBeInTheDocument();
    expect(screen.queryByText("テトリス")).not.toBeInTheDocument();
    // 残りは表示される
    expect(screen.getByText("パスワード生成")).toBeInTheDocument();
    expect(screen.getByText("年齢計算")).toBeInTheDocument();
  });

  test("すべてのタイルが既に道具箱にある場合は空状態を表示する", () => {
    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={MOCK_TILEABLES.map((t) => t.slug)}
      />,
    );
    // 追加可能なタイルがない旨のメッセージが表示される
    expect(
      screen.getByText(/追加できるタイルはありません/),
    ).toBeInTheDocument();
  });

  test("trustLevel が表示される", () => {
    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    // verified trustLevel のラベルが少なくとも1つ表示される
    const verifiedLabels = screen.getAllByText(/正確な処理/);
    expect(verifiedLabels.length).toBeGreaterThan(0);
  });
});

describe("AddTileModal — 検索フィルタ", () => {
  test("検索ボックスが存在する", () => {
    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  test("検索テキストで displayName をフィルタできる", () => {
    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    const searchbox = screen.getByRole("searchbox");
    fireEvent.change(searchbox, { target: { value: "JSON" } });

    expect(screen.getByText("JSON フォーマッター")).toBeInTheDocument();
    expect(screen.queryByText("パスワード生成")).not.toBeInTheDocument();
    expect(screen.queryByText("年齢計算")).not.toBeInTheDocument();
    expect(screen.queryByText("テトリス")).not.toBeInTheDocument();
  });

  test("検索テキストで shortDescription をフィルタできる", () => {
    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    const searchbox = screen.getByRole("searchbox");
    fireEvent.change(searchbox, { target: { value: "生年月日" } });

    expect(screen.getByText("年齢計算")).toBeInTheDocument();
    expect(screen.queryByText("JSON フォーマッター")).not.toBeInTheDocument();
  });

  test("検索結果が0件の場合はメッセージを表示する", () => {
    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    const searchbox = screen.getByRole("searchbox");
    fireEvent.change(searchbox, { target: { value: "存在しない検索語" } });

    expect(screen.getByText(/該当するタイルはありません/)).toBeInTheDocument();
  });

  test("大文字小文字を区別しない検索（英字）", () => {
    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    const searchbox = screen.getByRole("searchbox");
    fireEvent.change(searchbox, { target: { value: "json" } });

    expect(screen.getByText("JSON フォーマッター")).toBeInTheDocument();
  });
});

describe("AddTileModal — 追加コールバック", () => {
  test("候補タイルの追加ボタンをクリックすると onAdd が slug を引数に呼ばれる", () => {
    const onAdd = vi.fn();
    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={onAdd}
        currentTileSlugs={[]}
      />,
    );
    // JSON フォーマッターの追加ボタンをクリック
    const addButtons = screen.getAllByRole("button", { name: /追加/ });
    fireEvent.click(addButtons[0]);

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(MOCK_TILEABLES[0].slug);
  });

  test("追加ボタンのタップターゲットが 44px 以上（addButton クラスで確認）", () => {
    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    const addButtons = screen.getAllByRole("button", { name: /追加/ });
    // 各追加ボタンが addButton クラスを持つことを確認（CSS で min-height: 44px が適用される）
    // CSS Modules のためクラス名はハッシュ化されるので部分一致で検証
    for (const btn of addButtons) {
      expect(btn.className).toMatch(/addButton/);
    }
  });
});

describe("AddTileModal — 閉じる操作", () => {
  test("Esc キーを押すと onClose が呼ばれる", () => {
    const onClose = vi.fn();
    render(
      <AddTileModal
        isOpen={true}
        onClose={onClose}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("背景（オーバーレイ）クリックで onClose が呼ばれる", () => {
    const onClose = vi.fn();
    render(
      <AddTileModal
        isOpen={true}
        onClose={onClose}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    // data-overlay 属性を持つ要素をクリック
    const overlay = document.querySelector("[data-overlay]");
    expect(overlay).toBeTruthy();
    fireEvent.click(overlay!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("閉じるボタンをクリックすると onClose が呼ばれる", () => {
    const onClose = vi.fn();
    render(
      <AddTileModal
        isOpen={true}
        onClose={onClose}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    const closeButton = screen.getByRole("button", { name: /閉じる/ });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("AddTileModal — scroll-lock", () => {
  test("isOpen=true になると acquireScrollLock が呼ばれる", () => {
    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    expect(acquireScrollLock).toHaveBeenCalledTimes(1);
  });

  test("isOpen=false のとき acquireScrollLock は呼ばれない", () => {
    render(
      <AddTileModal
        isOpen={false}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    expect(acquireScrollLock).not.toHaveBeenCalled();
  });

  test("コンポーネントがアンマウントされると releaseScrollLock が呼ばれる（isOpen=true）", () => {
    const { unmount } = render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    unmount();
    expect(releaseScrollLock).toHaveBeenCalledTimes(1);
  });

  test("isOpen=false → true → false の変化で acquire/release が対称に呼ばれる", () => {
    const { rerender } = render(
      <AddTileModal
        isOpen={false}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    expect(acquireScrollLock).not.toHaveBeenCalled();

    rerender(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    expect(acquireScrollLock).toHaveBeenCalledTimes(1);

    rerender(
      <AddTileModal
        isOpen={false}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    expect(releaseScrollLock).toHaveBeenCalledTimes(1);
  });
});
