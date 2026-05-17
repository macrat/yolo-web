/**
 * Component.tsx (keigo-reference 詳細ページ コンポーネント) 単体テスト
 *
 * 検証項目:
 * - Button / Input を使用している（DESIGN.md §5 準拠）
 * - useToolStorage で状態が永続化される
 * - 検索フィルタ / カテゴリフィルタが動作する
 * - AccordionItem で例文が展開できる
 * - よくある間違いタブが表示される
 * - アクセシビリティ属性が正しい
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// next/navigation モック（Panel 等が next/link を使う場合への対策）
vi.mock("next/navigation", () => ({
  usePathname: () => "/tools/keigo-reference",
  useRouter: () => ({ push: vi.fn() }),
}));

// navigator.clipboard のモック
const clipboardMock = { writeText: vi.fn().mockResolvedValue(undefined) };
Object.defineProperty(navigator, "clipboard", {
  value: clipboardMock,
  writable: true,
  configurable: true,
});

import KeigoReferenceComponent from "../Component";

describe("KeigoReferenceComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("検索 input が存在する（Input type=search を使用）", () => {
    render(<KeigoReferenceComponent />);
    const searchInput = screen.getByRole("searchbox");
    expect(searchInput).toBeInTheDocument();
  });

  test("カテゴリフィルタボタンが存在する（Button を使用）", () => {
    render(<KeigoReferenceComponent />);
    // 「すべて」ボタンが存在すること
    expect(screen.getByRole("button", { name: "すべて" })).toBeInTheDocument();
    // 各カテゴリのボタンが存在すること
    expect(
      screen.getByRole("button", { name: "基本動詞" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ビジネス" }),
    ).toBeInTheDocument();
  });

  test("検索入力でエントリがフィルタされる", async () => {
    render(<KeigoReferenceComponent />);
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "行く" } });

    await waitFor(() => {
      // デスクトップ・モバイル両方にレンダリングされるため getAllByText を使用
      expect(screen.getAllByText("行く").length).toBeGreaterThan(0);
    });
  });

  test("カテゴリフィルタ「基本動詞」クリックで動作する", async () => {
    render(<KeigoReferenceComponent />);
    const basicButton = screen.getByRole("button", { name: "基本動詞" });
    fireEvent.click(basicButton);

    await waitFor(() => {
      // 「行く」は basic カテゴリなので表示される（デスクトップ・モバイル両方）
      expect(screen.getAllByText("行く").length).toBeGreaterThan(0);
    });
  });

  test("「よくある間違い」タブに切替できる", async () => {
    render(<KeigoReferenceComponent />);

    // よくある間違いタブが存在する（role="tab" を持つ Button）
    const mistakesTab = screen.getByRole("tab", { name: "よくある間違い" });
    expect(mistakesTab).toBeInTheDocument();
    fireEvent.click(mistakesTab);

    await waitFor(() => {
      // よくある間違いのコンテンツが表示される
      expect(screen.getByText("二重敬語")).toBeInTheDocument();
    });
  });

  test("useToolStorage で検索文字列が localStorage に保存される", async () => {
    const setItemSpy = vi.spyOn(window.localStorage, "setItem");
    render(<KeigoReferenceComponent />);

    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "見る" } });

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith(
        "yolos-tool-keigo-reference-search",
        JSON.stringify("見る"),
      );
    });
  });

  test("useToolStorage でカテゴリが localStorage に保存される", async () => {
    const setItemSpy = vi.spyOn(window.localStorage, "setItem");
    render(<KeigoReferenceComponent />);

    const basicButton = screen.getByRole("button", { name: "基本動詞" });
    fireEvent.click(basicButton);

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith(
        "yolos-tool-keigo-reference-category-filter",
        JSON.stringify("basic"),
      );
    });
  });

  test("localStorage から検索文字列が復元される", async () => {
    window.localStorage.setItem(
      "yolos-tool-keigo-reference-search",
      JSON.stringify("行く"),
    );
    render(<KeigoReferenceComponent />);

    await waitFor(() => {
      const searchInput = screen.getByRole("searchbox") as HTMLInputElement;
      expect(searchInput.value).toBe("行く");
    });
  });

  test("各エントリ行をクリックすると例文が展開される（AccordionItem）", async () => {
    render(<KeigoReferenceComponent />);

    // 「行く」エントリが表示されるまで待つ（デスクトップ・モバイル両方）
    await waitFor(() => {
      expect(screen.getAllByText("行く").length).toBeGreaterThan(0);
    });

    // AccordionItem の「例文を見る」ボタンをクリック
    const expandButtons = screen.getAllByRole("button", {
      name: "例文を見る",
    });
    expect(expandButtons.length).toBeGreaterThan(0);
    fireEvent.click(expandButtons[0]);

    await waitFor(() => {
      // 例文コンテンツが表示される（デスクトップ・モバイル両方にレンダリング）
      expect(screen.getAllByText(/移動先を伝えるとき/).length).toBeGreaterThan(
        0,
      );
    });
  });
});
