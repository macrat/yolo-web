import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ShareButtons from "@/components/ShareButtons";

// window.open のモック
const mockWindowOpen = vi.fn();
// navigator.clipboard のモック
const mockClipboardWriteText = vi.fn();

beforeEach(() => {
  vi.stubGlobal("open", mockWindowOpen);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: mockClipboardWriteText },
    configurable: true,
  });
  // window.location.origin のスタブ
  Object.defineProperty(window, "location", {
    value: { origin: "https://example.com" },
    configurable: true,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  mockWindowOpen.mockClear();
  mockClipboardWriteText.mockClear();
});

describe("ShareButtons", () => {
  describe("レンダリング", () => {
    test("デフォルトでは X / LINE / はてブ / コピー の 4 ボタンが表示される", () => {
      render(<ShareButtons url="/blog/test" title="テスト記事" />);
      expect(
        screen.getByRole("button", { name: /X で共有/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /LINE で共有/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /はてなブックマークに追加/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /URLをコピー/ }),
      ).toBeInTheDocument();
    });

    test("sns prop で表示するボタンを絞り込める", () => {
      render(<ShareButtons url="/blog/test" title="テスト記事" sns={["x"]} />);
      expect(
        screen.getByRole("button", { name: /X で共有/ }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /LINE で共有/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /はてなブックマークに追加/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /URLをコピー/ }),
      ).not.toBeInTheDocument();
    });

    test("sns=[] のとき何も表示しない", () => {
      render(<ShareButtons url="/blog/test" title="テスト記事" sns={[]} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("X 共有", () => {
    test("X ボタンをクリックすると新規タブで Twitter 共有 URL を開く", () => {
      mockWindowOpen.mockReturnValue(null);
      render(<ShareButtons url="/blog/test" title="テスト記事" />);
      fireEvent.click(screen.getByRole("button", { name: /X で共有/ }));
      expect(mockWindowOpen).toHaveBeenCalledTimes(1);
      const [url, target] = mockWindowOpen.mock.calls[0];
      expect(url).toContain("twitter.com/intent/tweet");
      expect(url).toContain(encodeURIComponent("テスト記事"));
      expect(url).toContain(
        encodeURIComponent("https://example.com/blog/test"),
      );
      expect(target).toBe("_blank");
    });
  });

  describe("LINE 共有", () => {
    test("LINE ボタンをクリックすると新規タブで LINE 共有 URL を開く", () => {
      mockWindowOpen.mockReturnValue(null);
      render(<ShareButtons url="/blog/test" title="テスト記事" />);
      fireEvent.click(screen.getByRole("button", { name: /LINE で共有/ }));
      expect(mockWindowOpen).toHaveBeenCalledTimes(1);
      const [url, target] = mockWindowOpen.mock.calls[0];
      expect(url).toContain("line.me/R/share");
      expect(target).toBe("_blank");
    });
  });

  describe("はてなブックマーク共有", () => {
    test("はてブボタンをクリックすると新規タブではてな URL を開く", () => {
      mockWindowOpen.mockReturnValue(null);
      render(<ShareButtons url="/blog/test" title="テスト記事" />);
      fireEvent.click(
        screen.getByRole("button", { name: /はてなブックマークに追加/ }),
      );
      expect(mockWindowOpen).toHaveBeenCalledTimes(1);
      const [url, target] = mockWindowOpen.mock.calls[0];
      expect(url).toContain("b.hatena.ne.jp");
      expect(target).toBe("_blank");
    });
  });

  describe("コピー機能", () => {
    test("コピーボタンをクリックするとクリップボードに URL とタイトルが書き込まれる", async () => {
      mockClipboardWriteText.mockResolvedValue(undefined);
      render(<ShareButtons url="/blog/test" title="テスト記事" />);
      fireEvent.click(screen.getByRole("button", { name: /URLをコピー/ }));
      await waitFor(() => {
        expect(mockClipboardWriteText).toHaveBeenCalledTimes(1);
      });
      const writtenText = mockClipboardWriteText.mock.calls[0][0];
      expect(writtenText).toContain("テスト記事");
      expect(writtenText).toContain("https://example.com/blog/test");
    });

    test("コピー成功後に「コピーしました」メッセージが表示される", async () => {
      mockClipboardWriteText.mockResolvedValue(undefined);
      render(<ShareButtons url="/blog/test" title="テスト記事" />);
      fireEvent.click(screen.getByRole("button", { name: /URLをコピー/ }));
      await waitFor(() => {
        expect(screen.getByRole("status")).toHaveTextContent("コピーしました");
      });
    });
  });

  describe("アクセシビリティ", () => {
    test("各ボタンに aria-label が存在する", () => {
      render(<ShareButtons url="/blog/test" title="テスト記事" />);
      const buttons = screen.getAllByRole("button");
      for (const btn of buttons) {
        expect(btn).toHaveAttribute("aria-label");
      }
    });

    test("コピーステータスに role='status' と aria-live が付く", () => {
      render(<ShareButtons url="/blog/test" title="テスト記事" />);
      const status = screen.getByRole("status");
      expect(status).toHaveAttribute("aria-live", "polite");
    });
  });
});
