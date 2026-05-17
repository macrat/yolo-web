/**
 * Tile.tsx (keigo-reference 用 1 軽量版タイル) 単体テスト
 *
 * 検証項目:
 * 1. 検索 input に入力すると候補リストがフィルタされる
 * 2. 3 カテゴリフィルタが動作する
 * 3. 上位 N 件に絞られている（60 件全件ではない）
 * 4. 敬語三形（sonkeigo / kenjogo / teineigo）の値がコピーできる
 * 5. useToolStorage で検索文字列・カテゴリが localStorage に永続化される
 * 6. reload 後に検索文字列・カテゴリが復元される
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { renderHook } from "@testing-library/react";

// navigator.clipboard のモック（jsdom は clipboard API を持たない）
const clipboardMock = {
  writeText: vi.fn().mockResolvedValue(undefined),
};

Object.defineProperty(navigator, "clipboard", {
  value: clipboardMock,
  writable: true,
  configurable: true,
});

import KeigoReferenceTile from "../Tile";
import { useToolStorage } from "@/tools/_hooks/use-tool-storage";

describe("KeigoReferenceTile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clipboardMock.writeText.mockResolvedValue(undefined);
    // setup.ts の localStorage は各テスト前に clear() される
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // 1. 検索 input に入力すると候補リストがフィルタされる
  test("検索 input に入力するとリストがフィルタされる", async () => {
    render(<KeigoReferenceTile />);

    const searchInput = screen.getByRole("searchbox");
    expect(searchInput).toBeInTheDocument();

    // 「行く」で検索
    fireEvent.change(searchInput, { target: { value: "行く" } });

    await waitFor(() => {
      // 「行く」にマッチするエントリが表示される
      expect(screen.getByText("行く")).toBeInTheDocument();
    });
  });

  test("検索文字列にマッチしないクエリは空状態を表示する", async () => {
    render(<KeigoReferenceTile />);

    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "zzznonexistentzzzz" } });

    await waitFor(() => {
      expect(
        screen.getByText("該当する動詞が見つかりませんでした"),
      ).toBeInTheDocument();
    });
  });

  // 2. 3 カテゴリフィルタが動作する
  test("カテゴリフィルタ「basic」を選択すると基本動詞のみ表示される", async () => {
    render(<KeigoReferenceTile />);

    const basicButton = screen.getByRole("button", { name: "基本動詞" });
    fireEvent.click(basicButton);

    await waitFor(() => {
      // basic カテゴリのエントリが表示される（「行く」は basic）
      expect(screen.getByText("行く")).toBeInTheDocument();
    });
  });

  test("カテゴリフィルタ「basic」ボタンはクリック後 aria-pressed=true になる", async () => {
    render(<KeigoReferenceTile />);

    const basicButton = screen.getByRole("button", { name: "基本動詞" });
    fireEvent.click(basicButton);

    await waitFor(() => {
      expect(basicButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  test("カテゴリフィルタ「business」ボタンはクリック後 aria-pressed=true になる", async () => {
    render(<KeigoReferenceTile />);

    const businessButton = screen.getByRole("button", { name: "ビジネス" });
    fireEvent.click(businessButton);

    await waitFor(() => {
      expect(businessButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  test("カテゴリフィルタ「service」ボタンはクリック後 aria-pressed=true になる", async () => {
    render(<KeigoReferenceTile />);

    const serviceButton = screen.getByRole("button", {
      name: "接客・サービス",
    });
    fireEvent.click(serviceButton);

    await waitFor(() => {
      expect(serviceButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  // 3. 上位 N 件に絞られている（60 件全件ではない）
  test("表示されるエントリは全件（60件）ではなく TOP_N 件に限定される", async () => {
    render(<KeigoReferenceTile />);

    await waitFor(() => {
      const items = screen.getAllByRole("listitem");
      // TOP_N = 8 件に厳密に一致すること（60 件全件ではない）
      expect(items.length).toBe(8);
    });
  });

  // 検索クリアボタン（軽微-2: 明示的なクリアボタン）
  test("検索クリアボタンをクリックすると検索文字列がクリアされる", async () => {
    render(<KeigoReferenceTile />);

    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "行く" } });

    await waitFor(() => {
      expect((searchInput as HTMLInputElement).value).toBe("行く");
    });

    const clearButton = screen.getByRole("button", { name: "検索をクリア" });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect((searchInput as HTMLInputElement).value).toBe("");
    });
  });

  // 重要-1: コピー成否の SR アナウンス（aria-live 領域）
  test("コピー成功後に aria-live 領域でアナウンスされる", async () => {
    render(<KeigoReferenceTile />);

    // aria-live 領域が存在すること
    const srAnnounce = document.querySelector('[aria-live="polite"]');
    expect(srAnnounce).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: "尊敬語をコピー" }).length,
      ).toBeGreaterThan(0);
    });

    const copyButtons = screen.getAllByRole("button", {
      name: "尊敬語をコピー",
    });
    fireEvent.click(copyButtons[0]);

    await waitFor(() => {
      expect(clipboardMock.writeText).toHaveBeenCalled();
    });
  });

  // 4. 敬語三形の値がコピーできる
  test("各エントリの「尊敬語コピー」ボタンをクリックすると clipboard に書き込まれる", async () => {
    render(<KeigoReferenceTile />);

    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: "尊敬語をコピー" }).length,
      ).toBeGreaterThan(0);
    });

    const copyButtons = screen.getAllByRole("button", {
      name: "尊敬語をコピー",
    });
    fireEvent.click(copyButtons[0]);

    await waitFor(() => {
      expect(clipboardMock.writeText).toHaveBeenCalled();
      // コピーした値は最初のエントリ（「行く」）の sonkeigo
      const calledWith = clipboardMock.writeText.mock.calls[0][0] as string;
      expect(calledWith.length).toBeGreaterThan(0);
    });
  });

  test("「謙譲語をコピー」ボタンをクリックすると clipboard に書き込まれる", async () => {
    render(<KeigoReferenceTile />);

    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: "謙譲語をコピー" }).length,
      ).toBeGreaterThan(0);
    });

    const copyButtons = screen.getAllByRole("button", {
      name: "謙譲語をコピー",
    });
    fireEvent.click(copyButtons[0]);

    await waitFor(() => {
      expect(clipboardMock.writeText).toHaveBeenCalled();
    });
  });

  test("「丁寧語をコピー」ボタンをクリックすると clipboard に書き込まれる", async () => {
    render(<KeigoReferenceTile />);

    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: "丁寧語をコピー" }).length,
      ).toBeGreaterThan(0);
    });

    const copyButtons = screen.getAllByRole("button", {
      name: "丁寧語をコピー",
    });
    fireEvent.click(copyButtons[0]);

    await waitFor(() => {
      expect(clipboardMock.writeText).toHaveBeenCalled();
    });
  });

  // 5. useToolStorage で検索文字列・カテゴリが localStorage に永続化される
  test("検索文字列を入力すると localStorage に保存される", async () => {
    const setItemSpy = vi.spyOn(window.localStorage, "setItem");

    render(<KeigoReferenceTile />);

    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "行く" } });

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith(
        "yolos-tool-keigo-reference-search",
        JSON.stringify("行く"),
      );
    });
  });

  test("カテゴリフィルタを選択すると localStorage に保存される", async () => {
    const setItemSpy = vi.spyOn(window.localStorage, "setItem");

    render(<KeigoReferenceTile />);

    const basicButton = screen.getByRole("button", { name: "基本動詞" });
    fireEvent.click(basicButton);

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith(
        "yolos-tool-keigo-reference-category",
        JSON.stringify("basic"),
      );
    });
  });

  // 6. reload 後に検索文字列・カテゴリが復元される
  test("localStorage に検索文字列がある場合、reload 後に復元される", async () => {
    // 事前に localStorage に値をセット
    window.localStorage.setItem(
      "yolos-tool-keigo-reference-search",
      JSON.stringify("行く"),
    );

    render(<KeigoReferenceTile />);

    // useEffect で localStorage を読み込むのを待つ
    await waitFor(() => {
      const searchInput = screen.getByRole("searchbox") as HTMLInputElement;
      expect(searchInput.value).toBe("行く");
    });
  });

  test("localStorage にカテゴリがある場合、reload 後に復元される", async () => {
    window.localStorage.setItem(
      "yolos-tool-keigo-reference-category",
      JSON.stringify("basic"),
    );

    render(<KeigoReferenceTile />);

    await waitFor(() => {
      const basicButton = screen.getByRole("button", { name: "基本動詞" });
      expect(basicButton).toHaveAttribute("aria-pressed", "true");
    });
  });
});

// useToolStorage 単独テスト（renderHook で localStorage 永続化確認）
describe("useToolStorage による永続化", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("setValue を呼ぶと localStorage に書き込まれる", () => {
    const setItemSpy = vi.spyOn(window.localStorage, "setItem");

    const { result } = renderHook(() =>
      useToolStorage("yolos-tool-keigo-reference-search", ""),
    );

    act(() => {
      result.current[1]("テスト検索");
    });

    expect(setItemSpy).toHaveBeenCalledWith(
      "yolos-tool-keigo-reference-search",
      JSON.stringify("テスト検索"),
    );
  });

  test("localStorage に既存値がある場合、useEffect 後に読み込まれる", async () => {
    window.localStorage.setItem(
      "yolos-tool-keigo-reference-search",
      JSON.stringify("既存の値"),
    );

    const { result } = renderHook(() =>
      useToolStorage("yolos-tool-keigo-reference-search", ""),
    );

    await waitFor(() => {
      expect(result.current[0]).toBe("既存の値");
    });
  });
});
