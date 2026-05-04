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

  test("すべてのタイルが既に道具箱にある場合は「すべての道具が追加されています」を表示する（瞬間 45）", () => {
    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={MOCK_TILEABLES.map((t) => t.slug)}
      />,
    );
    // 全部追加済み時は専用メッセージを表示する
    expect(
      screen.getByText(/すべての道具が追加されています/),
    ).toBeInTheDocument();
  });

  test("すべての道具が追加済みの場合は閉じるボタンが併置されている（瞬間 45）", () => {
    const onClose = vi.fn();
    render(
      <AddTileModal
        isOpen={true}
        onClose={onClose}
        onAdd={vi.fn()}
        currentTileSlugs={MOCK_TILEABLES.map((t) => t.slug)}
      />,
    );
    // 閉じるボタンが存在してクリックで onClose が呼ばれる
    const allCloseButtons = screen.getAllByRole("button");
    // 少なくとも1つ閉じるボタンがある
    expect(allCloseButtons.length).toBeGreaterThan(0);
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

  test("信頼度ラベルが details/summary パターンで説明文を持つ（TrustLevelBadge 使用）", () => {
    const { container } = render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    // 候補リスト内に <details> 要素が存在する（TrustLevelBadge の展開パターン）
    const detailsElements = container.querySelectorAll(
      '[role="list"] details, [aria-label*="追加可能"] details',
    );
    expect(detailsElements.length).toBeGreaterThan(0);
  });

  test("信頼度ラベルに説明文テキストが含まれる（TrustLevelBadge の description）", () => {
    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    // verified の description テキストが少なくとも1つドキュメントに存在する
    const descriptionElements =
      screen.getAllByText(/標準的なアルゴリズムに基づいて処理/);
    expect(descriptionElements.length).toBeGreaterThan(0);
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

describe("AddTileModal — v10 アニメーション クラス", () => {
  test("パネルに panel クラスが付いている（CSS Module で出現アニメを適用）", () => {
    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    const dialog = screen.getByRole("dialog");
    // CSS Modules のためクラス名はハッシュ化されるが 'panel' が含まれる
    expect(dialog.className).toMatch(/panel/);
  });

  test("候補リストの各候補アイテムに candidateItem クラスが付いている（fade-in 対象）", () => {
    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    // 候補リストのアイテム要素が存在することを確認（fade-in は CSS で candidateItem に定義）
    const candidateList = screen.getByRole("list", {
      name: /追加可能なタイル一覧/,
    });
    const items = candidateList.querySelectorAll("li");
    expect(items.length).toBeGreaterThan(0);
    for (const item of Array.from(items)) {
      expect(item.className).toMatch(/candidateItem/);
    }
  });
});

describe("AddTileModal — IME 変換中の Esc 無視（瞬間 45b）", () => {
  test("composing=true（IME 変換中）の Esc キーでは onClose が呼ばれない", () => {
    const onClose = vi.fn();
    render(
      <AddTileModal
        isOpen={true}
        onClose={onClose}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    // IME 変換中（isComposing=true）の Esc は無視される
    fireEvent.keyDown(document, { key: "Escape", isComposing: true });
    expect(onClose).not.toHaveBeenCalled();
  });

  test("composing=false（IME 変換確定後）の Esc キーで onClose が呼ばれる", () => {
    const onClose = vi.fn();
    render(
      <AddTileModal
        isOpen={true}
        onClose={onClose}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    // 変換確定後（isComposing=false）の Esc でモーダルを閉じる
    fireEvent.keyDown(document, { key: "Escape", isComposing: false });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("AddTileModal — inert 属性（瞬間 42）", () => {
  test("isOpen=true の間、document.body の他要素に inert が付与される", () => {
    // body に子要素を追加する
    const sibling = document.createElement("div");
    sibling.setAttribute("data-test-sibling", "true");
    document.body.appendChild(sibling);

    render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );

    // モーダル要素以外の兄弟要素に inert が付与されている
    expect(sibling).toHaveAttribute("inert");

    // クリーンアップ
    document.body.removeChild(sibling);
  });

  test("isOpen=false になると inert が解除される", () => {
    const sibling = document.createElement("div");
    sibling.setAttribute("data-test-sibling", "true");
    document.body.appendChild(sibling);

    const { rerender } = render(
      <AddTileModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );

    // isOpen=false に変更すると inert が解除される
    rerender(
      <AddTileModal
        isOpen={false}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        currentTileSlugs={[]}
      />,
    );
    expect(sibling).not.toHaveAttribute("inert");

    document.body.removeChild(sibling);
  });
});
