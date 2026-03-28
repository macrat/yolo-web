/**
 * SearchTrigger 視認性改善テスト
 *
 * - 検索ボタンに「検索」テキストラベルが含まれること（デスクトップ向け）
 */
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SearchTrigger from "@/components/search/SearchTrigger";

// jsdom は scrollIntoView を実装していない
Element.prototype.scrollIntoView = vi.fn();

// jsdom は HTMLDialogElement.showModal / close を実装していない。
// SearchTrigger は内部で SearchModal をレンダリングし、
// dialog.showModal() / dialog.close() が呼ばれるためモックが必要。
HTMLDialogElement.prototype.showModal = vi.fn(function (
  this: HTMLDialogElement,
) {
  this.setAttribute("open", "");
});
HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
});

// next/navigation をモック
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }),
  );
});

describe("SearchTrigger 視認性", () => {
  test("検索ボタンに「検索」テキストが含まれている", () => {
    render(<SearchTrigger />);
    // ボタン内に「検索」テキストが表示されていること
    const button = screen.getByRole("button", { name: /サイト内検索/ });
    expect(button).toBeInTheDocument();
    // テキスト「検索」がボタン内に存在すること
    expect(button.textContent).toContain("検索");
  });

  test("検索ボタンにショートカットキーラベル(kbd)が含まれている", () => {
    render(<SearchTrigger />);
    // kbd 要素がボタン内に存在すること
    const button = screen.getByRole("button", { name: /サイト内検索/ });
    const kbd = button.querySelector("kbd");
    expect(kbd).not.toBeNull();
  });
});
