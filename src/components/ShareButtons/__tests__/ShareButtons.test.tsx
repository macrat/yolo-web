import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import ShareButtons from "@/components/ShareButtons";

// window.open のモック
const mockWindowOpen = vi.fn();
// navigator.clipboard のモック
const mockClipboardWriteText = vi.fn();

beforeEach(() => {
  // vi.stubGlobal を使うことで vi.unstubAllGlobals() による確実な teardown を保証し、
  // Object.defineProperty によるグローバル汚染を回避する（既存パターン: common/ShareButtons.test.tsx）
  vi.stubGlobal("open", mockWindowOpen);
  vi.stubGlobal("navigator", {
    ...navigator,
    clipboard: { writeText: mockClipboardWriteText },
  });
  // window 全体をスタブすると document が失われ @testing-library が壊れるため、
  // location のみを個別にスタブする
  vi.stubGlobal("location", { origin: "https://example.com" });
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
        screen.getByRole("button", { name: /^X でシェア/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /^LINE でシェア/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /^はてブに追加/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /URLをコピー/ }),
      ).toBeInTheDocument();
    });

    test("sns prop で表示するボタンを絞り込める", () => {
      render(<ShareButtons url="/blog/test" title="テスト記事" sns={["x"]} />);
      expect(
        screen.getByRole("button", { name: /^X でシェア/ }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /^LINE でシェア/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /^はてブに追加/ }),
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
      fireEvent.click(screen.getByRole("button", { name: /^X でシェア/ }));
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
      fireEvent.click(screen.getByRole("button", { name: /^LINE でシェア/ }));
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
      fireEvent.click(screen.getByRole("button", { name: /^はてブに追加/ }));
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

    test("押し直すと、「コピーしました」は後から押したときから2秒出る", async () => {
      vi.useFakeTimers();
      try {
        mockClipboardWriteText.mockResolvedValue(undefined);
        render(<ShareButtons url="/blog/test" title="テスト記事" />);
        const copy = screen.getByRole("button", { name: /URLをコピー/ });
        await act(async () => {
          fireEvent.click(copy);
        });
        await act(async () => {
          vi.advanceTimersByTime(1500);
        });
        await act(async () => {
          fireEvent.click(copy);
        });
        await act(async () => {
          vi.advanceTimersByTime(1000);
        });
        expect(screen.getByRole("status")).toHaveTextContent("コピーしました");
        await act(async () => {
          vi.advanceTimersByTime(1000);
        });
        expect(screen.getByRole("status")).toHaveTextContent("");
      } finally {
        vi.useRealTimers();
      }
    });

    test("外したあとにタイマーを残さない", async () => {
      vi.useFakeTimers();
      try {
        mockClipboardWriteText.mockResolvedValue(undefined);
        const { unmount } = render(
          <ShareButtons url="/blog/test" title="テスト記事" />,
        );
        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: /URLをコピー/ }));
        });
        unmount();
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("アクセシビリティ", () => {
    // 声で操作する来訪者が、見えている文言で押せる（WCAG 2.5.3）
    test("どのボタンも、読み上げ名が見える文言で始まる", () => {
      render(<ShareButtons url="/blog/test" title="テスト記事" />);
      for (const btn of screen.getAllByRole("button")) {
        const name = btn.getAttribute("aria-label") ?? btn.textContent ?? "";
        expect(name.startsWith(btn.textContent ?? "")).toBe(true);
      }
    });

    test("コピーステータスに role='status' と aria-live が付く", () => {
      render(<ShareButtons url="/blog/test" title="テスト記事" />);
      const status = screen.getByRole("status");
      expect(status).toHaveAttribute("aria-live", "polite");
    });

    test("どのボタンも共通の Button で組む（タップの標的の 44px は Button が持つ）", () => {
      render(<ShareButtons url="/blog/test" title="テスト記事" />);
      for (const btn of screen.getAllByRole("button")) {
        expect(btn).toHaveAttribute("data-variant", "default");
      }
    });
  });
});
