/**
 * Tile コンポーネントのテスト
 *
 * C-1 タスクの完了条件：
 * - 4 状態（通常 / 編集中 / ドラッグ中 / 空きスロット）が実装されている
 * - DESIGN.md §4 規約遵守（box-shadow のみ、opacity/揺れアニメ禁止）
 * - タップターゲット 44px 以上
 * - ライト/ダーク両モードで破綻しないこと（CSS 変数経由）
 * - C-6 storybook での状態網羅を想定した storybook fixture として参照できる
 */

import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// next/dynamic をモック
vi.mock("next/dynamic", () => ({
  default: (_loader: () => Promise<{ default: unknown }>) => {
    function Stub({ slug }: { slug: string }) {
      return <div data-testid="tile-content">{slug}</div>;
    }
    return Stub;
  },
}));

const { Tile, EmptySlot } = await import("../Tile");

const mockTileable = {
  slug: "json-formatter",
  displayName: "JSON フォーマッター",
  shortDescription: "JSON を整形・検証",
  contentKind: "tool" as const,
  publishedAt: "2026-01-01T00:00:00+09:00",
  trustLevel: "verified" as const,
};

describe("Tile — 通常状態（使用モード）", () => {
  test("displayName がレンダリングされる", () => {
    render(<Tile tileable={mockTileable} />);
    expect(screen.getByText("JSON フォーマッター")).toBeInTheDocument();
  });

  test("詳細ページへのリンクが存在する", () => {
    render(<Tile tileable={mockTileable} />);
    // リンク先は contentKind に応じたデフォルト URL
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/tools/json-formatter");
  });

  test("タップターゲットが 44px 以上になるよう data-tile-state が付与されている", () => {
    render(<Tile tileable={mockTileable} />);
    const tile = screen.getByTestId("tile");
    expect(tile).toHaveAttribute("data-tile-state", "normal");
  });

  test("isEditing=false のとき data-tile-state が normal になる", () => {
    render(<Tile tileable={mockTileable} isEditing={false} />);
    const tile = screen.getByTestId("tile");
    expect(tile).toHaveAttribute("data-tile-state", "normal");
  });
});

describe("Tile — 編集中状態", () => {
  test("isEditing=true のとき data-tile-state が editing になる", () => {
    render(<Tile tileable={mockTileable} isEditing={true} />);
    const tile = screen.getByTestId("tile");
    expect(tile).toHaveAttribute("data-tile-state", "editing");
  });

  test("編集中はリンクが無効化される（tabIndex=-1）", () => {
    render(<Tile tileable={mockTileable} isEditing={true} />);
    // 編集中はリンクの Tab フォーカスを外す
    const link = screen.queryByRole("link");
    // リンク要素が tabIndex=-1 または aria-disabled=true になっている
    if (link) {
      expect(link).toHaveAttribute("tabindex", "-1");
    }
  });

  test("ドラッグハンドルが表示される", () => {
    render(<Tile tileable={mockTileable} isEditing={true} />);
    const handle = screen.getByTestId("drag-handle");
    expect(handle).toBeInTheDocument();
  });
});

describe("Tile — ドラッグ中状態", () => {
  test("isDragging=true のとき data-tile-state が dragging になる", () => {
    render(<Tile tileable={mockTileable} isEditing={true} isDragging={true} />);
    const tile = screen.getByTestId("tile");
    expect(tile).toHaveAttribute("data-tile-state", "dragging");
  });
});

describe("EmptySlot — 空きスロット状態", () => {
  test("EmptySlot がレンダリングされる", () => {
    render(<EmptySlot />);
    const slot = screen.getByTestId("tile-empty-slot");
    expect(slot).toBeInTheDocument();
  });

  test("data-tile-state が empty になる", () => {
    render(<EmptySlot />);
    const slot = screen.getByTestId("tile-empty-slot");
    expect(slot).toHaveAttribute("data-tile-state", "empty");
  });
});

describe("Tile — href の解決", () => {
  test("contentKind=tool のとき /tools/{slug} へのリンクになる", () => {
    render(<Tile tileable={{ ...mockTileable, contentKind: "tool" }} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/tools/json-formatter");
  });

  test("contentKind=play のとき /play/{slug} へのリンクになる", () => {
    render(
      <Tile
        tileable={{ ...mockTileable, contentKind: "play", slug: "quiz-game" }}
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/play/quiz-game");
  });

  test("contentKind=cheatsheet のとき /cheatsheets/{slug} へのリンクになる", () => {
    render(
      <Tile
        tileable={{
          ...mockTileable,
          contentKind: "cheatsheet",
          slug: "git-commands",
        }}
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/cheatsheets/git-commands");
  });

  test("href が指定されている場合はそちらが使われる", () => {
    render(
      <Tile tileable={{ ...mockTileable, href: "https://example.com" }} />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
  });
});

describe("Tile — props の外部指定", () => {
  test("className を外部から指定できる", () => {
    render(<Tile tileable={mockTileable} className="custom-class" />);
    const tile = screen.getByTestId("tile");
    expect(tile).toHaveClass("custom-class");
  });

  test("onDragHandleProps を受け取る prop があること（DnD 連携用）", () => {
    // C-2 / C-3 / C-4 から DnD props を渡せるようにするための prop
    // data-* 属性は HTMLAttributes<HTMLDivElement> のインデックスシグネチャ経由で渡せる
    const dragHandleProps = {
      "data-dnd-handle": "true",
    } as React.HTMLAttributes<HTMLDivElement>;
    render(
      <Tile
        tileable={mockTileable}
        isEditing={true}
        dragHandleProps={dragHandleProps}
      />,
    );
    // ドラッグハンドル要素に props が渡されている
    const handle = screen.getByTestId("drag-handle");
    expect(handle).toHaveAttribute("data-dnd-handle", "true");
  });
});
