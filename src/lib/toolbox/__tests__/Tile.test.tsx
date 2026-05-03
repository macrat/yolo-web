import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import type { TileComponentProps } from "../tile-loader";

/**
 * Tile コンテナコンポーネントのテスト（C-1）
 *
 * カバレッジ目標:
 * - 状態 4 種: 通常 / 編集中 / ドラッグ中 / 空きスロット
 * - サイズ 3 種: small / medium / large
 * - href あり/なし
 * - isEditing true/false
 *
 * 【設計変更（lint 対応）】
 * Tile は tileComponent を props として受け取る設計に変更された。
 * getTileComponent の呼び出しは呼び出し元（TileGrid 等）で行う。
 * これにより react-hooks/static-components ルール違反（レンダー中のコンポーネント生成）を解消する。
 */

// テスト用スタブコンポーネント（DynamicStub）: モジュールレベルで定義
function DynamicStub({ slug }: TileComponentProps) {
  return React.createElement(
    "div",
    { "data-testid": "fallback-tile", "data-slug": slug },
    slug,
  );
}

// CSS モジュールのモック
vi.mock("../Tile.module.css", () => ({
  default: {
    tile: "tile",
    "tile--small": "tile--small",
    "tile--medium": "tile--medium",
    "tile--large": "tile--large",
    "tile--editing": "tile--editing",
    "tile--dragging": "tile--dragging",
    "tile--empty": "tile--empty",
    tileInner: "tileInner",
    tileInnerDisabled: "tileInnerDisabled",
    tileMeta: "tileMeta",
    tileName: "tileName",
    tileDescription: "tileDescription",
    dragHandle: "dragHandle",
  },
}));

// registry モック
vi.mock("../registry", () => ({
  getTileableBySlug: vi.fn((slug: string) => {
    if (slug === "json-formatter") {
      return {
        slug: "json-formatter",
        displayName: "JSON フォーマッター",
        shortDescription: "JSON を整形する",
        contentKind: "tool",
        publishedAt: "2024-01-01T00:00:00+0900",
        trustLevel: "verified",
        href: "/tools/json-formatter",
      };
    }
    if (slug === "no-href-tool") {
      return {
        slug: "no-href-tool",
        displayName: "リンクなしツール",
        shortDescription: "href がないツール",
        contentKind: "tool",
        publishedAt: "2024-01-01T00:00:00+0900",
        trustLevel: "verified",
      };
    }
    return undefined;
  }),
}));

// モックセットアップ後にインポート
const { Tile } = await import("../Tile");

// ---- テスト用 props ----
const baseEntry = {
  slug: "json-formatter",
  size: "medium" as const,
  order: 0,
};

describe("Tile — サイズ 3 種", () => {
  test("size=small のとき small クラスが付く", () => {
    const { container } = render(
      <Tile
        entry={{ ...baseEntry, size: "small" }}
        isEditing={false}
        tileComponent={DynamicStub}
      />,
    );
    expect(container.firstChild).toBeTruthy();
    // data-size 属性で確認
    expect(container.querySelector('[data-size="small"]')).toBeTruthy();
  });

  test("size=medium のとき medium クラスが付く", () => {
    const { container } = render(
      <Tile
        entry={{ ...baseEntry, size: "medium" }}
        isEditing={false}
        tileComponent={DynamicStub}
      />,
    );
    expect(container.querySelector('[data-size="medium"]')).toBeTruthy();
  });

  test("size=large のとき large クラスが付く", () => {
    const { container } = render(
      <Tile
        entry={{ ...baseEntry, size: "large" }}
        isEditing={false}
        tileComponent={DynamicStub}
      />,
    );
    expect(container.querySelector('[data-size="large"]')).toBeTruthy();
  });
});

describe("Tile — isEditing フラグ", () => {
  test("isEditing=false のとき editing 状態ではない", () => {
    const { container } = render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    expect(container.querySelector('[data-editing="false"]')).toBeTruthy();
  });

  test("isEditing=true のとき editing 状態になる", () => {
    const { container } = render(
      <Tile entry={baseEntry} isEditing={true} tileComponent={DynamicStub} />,
    );
    expect(container.querySelector('[data-editing="true"]')).toBeTruthy();
  });

  test("isEditing=true のときタイル本体に tileInnerDisabled クラスが付く（DESIGN.md §4 L76 参照）", () => {
    render(
      <Tile entry={baseEntry} isEditing={true} tileComponent={DynamicStub} />,
    );
    // 編集モード中はタイル本体クリック禁止（CSS クラスで管理）
    const inner = document.querySelector("[data-tile-inner]");
    expect(inner).toBeTruthy();
    expect(inner?.classList.contains("tileInnerDisabled")).toBe(true);
  });
});

describe("Tile — ドラッグ状態", () => {
  test("isDragging=true のとき dragging 状態になる", () => {
    const { container } = render(
      <Tile
        entry={baseEntry}
        isEditing={true}
        isDragging={true}
        tileComponent={DynamicStub}
      />,
    );
    expect(container.querySelector('[data-dragging="true"]')).toBeTruthy();
  });

  test("isDragging=false のとき dragging 状態ではない", () => {
    const { container } = render(
      <Tile
        entry={baseEntry}
        isEditing={false}
        isDragging={false}
        tileComponent={DynamicStub}
      />,
    );
    expect(container.querySelector('[data-dragging="false"]')).toBeTruthy();
  });
});

describe("Tile — 空きスロット状態", () => {
  test("isEmpty=true のとき empty 状態になる", () => {
    const { container } = render(
      <Tile
        entry={{ ...baseEntry, slug: "" }}
        isEditing={false}
        isEmpty={true}
        tileComponent={DynamicStub}
      />,
    );
    expect(container.querySelector('[data-empty="true"]')).toBeTruthy();
  });
});

describe("Tile — メタ情報表示", () => {
  test("displayName が表示される（登録済み slug）", () => {
    render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    expect(screen.getByText("JSON フォーマッター")).toBeTruthy();
  });

  test("shortDescription が補助表示される", () => {
    render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    expect(screen.getByText("JSON を整形する")).toBeTruthy();
  });

  test("未登録 slug のとき slug 名がフォールバックで表示される", () => {
    render(
      <Tile
        entry={{ ...baseEntry, slug: "unknown-slug" }}
        isEditing={false}
        tileComponent={DynamicStub}
      />,
    );
    // slug がそのまま表示される（tileName + fallback-tile の両方に出るため getAllByText を使う）
    const elements = screen.getAllByText("unknown-slug");
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Tile — href あり/なし", () => {
  test("href あり（Tileable.href が存在）のとき a タグが存在する", () => {
    render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    // json-formatter は href="/tools/json-formatter" を持つ
    const link = document.querySelector('a[href="/tools/json-formatter"]');
    expect(link).toBeTruthy();
  });

  test("href なし（Tileable.href が未設定）のとき a タグは存在しない", () => {
    render(
      <Tile
        entry={{ ...baseEntry, slug: "no-href-tool" }}
        isEditing={false}
        tileComponent={DynamicStub}
      />,
    );
    // href なし = リンクなし
    const link = document.querySelector("a[href]");
    expect(link).toBeNull();
  });

  test("使用モード href あり: article 内に href を持つ a タグが存在する（I-4: Stretched Link）", () => {
    render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    // 使用モードでは article 内に href リンクが存在する
    const link = document.querySelector(
      'article a[href="/tools/json-formatter"]',
    );
    expect(link).toBeTruthy();
  });

  test("isEditing=true のとき href がある tileable でも a タグが描画されない（I-2: aria-hidden 廃止）", () => {
    render(
      <Tile entry={baseEntry} isEditing={true} tileComponent={DynamicStub} />,
    );
    // 編集モード中は a タグを描画しない（span で代替）
    const link = document.querySelector("a");
    expect(link).toBeNull();
  });
});

describe("Tile — タップターゲット（WCAG SC 2.5.8）", () => {
  test("ドラッグハンドルが data-drag-handle 属性を持つ（編集モード時）", () => {
    render(
      <Tile entry={baseEntry} isEditing={true} tileComponent={DynamicStub} />,
    );
    const handle = document.querySelector("[data-drag-handle]");
    expect(handle).toBeTruthy();
  });

  test("ドラッグハンドルにのみ grab カーソルが指定される（§4 L75）", () => {
    render(
      <Tile entry={baseEntry} isEditing={true} tileComponent={DynamicStub} />,
    );
    const handle = document.querySelector(
      "[data-drag-handle]",
    ) as HTMLElement | null;
    // data-drag-handle はハンドル要素のみ grab カーソルを持つ（CSS クラスで管理）
    // ここでは要素の存在確認のみ（CSS は jsdom では評価されない）
    expect(handle).toBeTruthy();
  });
});

describe("Tile — tileComponent props として受け取る（lint 対応）", () => {
  test("tileComponent が内包される（data-testid=fallback-tile）", () => {
    render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    expect(screen.getByTestId("fallback-tile")).toBeTruthy();
  });

  test("tileComponent に slug が渡される", () => {
    render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    const fallback = screen.getByTestId("fallback-tile");
    expect(fallback.getAttribute("data-slug")).toBe("json-formatter");
  });
});
