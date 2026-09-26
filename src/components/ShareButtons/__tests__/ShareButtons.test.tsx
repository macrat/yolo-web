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
// analytics.ts は window.gtag を直接呼ぶので、送った値をこの spy で読む
const gtagSpy = vi.fn();

/** gtag に送った share イベントの値（送っていなければ undefined）。 */
function findShareParams(): Record<string, unknown> | undefined {
  const call = gtagSpy.mock.calls.find(
    (c) => c[0] === "event" && c[1] === "share",
  );
  return call?.[2] as Record<string, unknown> | undefined;
}

/** 端末の共有シートを開ける navigator に差し替える。 */
function stubWebShare(share: (data: unknown) => Promise<void>): void {
  vi.stubGlobal("navigator", {
    ...navigator,
    share,
    clipboard: { writeText: mockClipboardWriteText },
  });
}

/** jsdom は execCommand を持たないので、この文書にだけ置く（afterEach で外す）。 */
function stubExecCommand(
  impl: (command: string) => boolean,
): ReturnType<typeof vi.fn> {
  const execCommand = vi.fn(impl);
  Object.defineProperty(document, "execCommand", {
    value: execCommand,
    configurable: true,
    writable: true,
  });
  return execCommand;
}

beforeEach(() => {
  // window の上のもの（open・navigator・location）は vi.stubGlobal で置き、afterEach の vi.unstubAllGlobals() で戻す。
  // document の上に置く execCommand（stubExecCommand）は、afterEach で消す。
  vi.stubGlobal("open", mockWindowOpen);
  vi.stubGlobal("navigator", {
    ...navigator,
    clipboard: { writeText: mockClipboardWriteText },
  });
  // window 全体をスタブすると document が失われ @testing-library が壊れるため、
  // location のみを個別にスタブする
  vi.stubGlobal("location", { origin: "https://example.com" });
  (window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete (document as { execCommand?: unknown }).execCommand;
  mockWindowOpen.mockClear();
  mockClipboardWriteText.mockClear();
  gtagSpy.mockClear();
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

  describe("クリップボードの API で写せない端末", () => {
    test("API に拒まれても、押したボタンの並びに置いた欄を選んで写し、「コピーしました」を出す", async () => {
      mockClipboardWriteText.mockRejectedValue(new Error("denied"));
      let copiedFrom: Element | null = null;
      const execCommand = stubExecCommand(() => {
        copiedFrom = document.querySelector("textarea")?.parentElement ?? null;
        return true;
      });
      render(<ShareButtons url="/blog/test" title="テスト記事" />);
      const copy = screen.getByRole("button", { name: "URLをコピー" });
      fireEvent.click(copy);
      await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent("コピーしました"),
      );
      expect(execCommand).toHaveBeenCalledWith("copy");
      expect(copiedFrom).toBe(copy.parentElement);
    });

    test("どの方法でも写せなければ、写せなかったことと代わりの手を知らせ、次に押すまで残す", async () => {
      vi.useFakeTimers();
      try {
        mockClipboardWriteText.mockRejectedValue(new Error("denied"));
        stubExecCommand(() => false);
        render(<ShareButtons url="/blog/test" title="テスト記事" />);
        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: "URLをコピー" }));
        });
        const message = "コピーできませんでした。ほかの共有先をお使いください";
        expect(screen.getByRole("status")).toHaveTextContent(message);
        await act(async () => {
          vi.advanceTimersByTime(5000);
        });
        expect(screen.getByRole("status")).toHaveTextContent(message);
        mockClipboardWriteText.mockResolvedValue(undefined);
        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: "URLをコピー" }));
        });
        expect(screen.getByRole("status")).toHaveTextContent("コピーしました");
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
  describe("結果の共有", () => {
    const quizText = "診断Xの結果は「タイプA」でした! #診断X #yolosnet";
    const gameText = "ゲームY #12 3/6\n◯△×\n#ゲームY #yolosnet";

    test("文を渡すと、X・LINE・コピーに文と URL を渡し、コピーは「結果をコピー」になる", async () => {
      mockClipboardWriteText.mockResolvedValue(undefined);
      render(
        <ShareButtons
          url="/play/x/result/a"
          title="診断X"
          text={quizText}
          sns={["x", "line", "copy"]}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /^X でシェア/ }));
      fireEvent.click(screen.getByRole("button", { name: /^LINE でシェア/ }));
      fireEvent.click(screen.getByRole("button", { name: "結果をコピー" }));
      expect(mockWindowOpen.mock.calls.map((c) => c[0])).toEqual([
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(quizText)}&url=${encodeURIComponent("https://example.com/play/x/result/a")}`,
        `https://line.me/R/share?text=${encodeURIComponent(`${quizText}\nhttps://example.com/play/x/result/a`)}`,
      ]);
      await waitFor(() =>
        expect(mockClipboardWriteText).toHaveBeenCalledWith(
          `${quizText}\nhttps://example.com/play/x/result/a`,
        ),
      );
    });

    test("http で始まる URL は、そのまま共有する", () => {
      render(
        <ShareButtons
          url="https://yolos.net/play/x/result/a"
          title="診断X"
          text={quizText}
          sns={["x"]}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /^X でシェア/ }));
      expect(mockWindowOpen.mock.calls[0][0]).toContain(
        `&url=${encodeURIComponent("https://yolos.net/play/x/result/a")}`,
      );
    });

    test("複数行の文も、X・LINE・コピーに URL を1つだけ付けて渡す", async () => {
      mockClipboardWriteText.mockResolvedValue(undefined);
      render(
        <ShareButtons
          url="/play/game-y"
          title="ゲームY"
          text={gameText}
          sns={["x", "line", "copy"]}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /^X でシェア/ }));
      fireEvent.click(screen.getByRole("button", { name: /^LINE でシェア/ }));
      fireEvent.click(screen.getByRole("button", { name: "結果をコピー" }));
      const pageUrl = "https://example.com/play/game-y";
      expect(mockWindowOpen.mock.calls.map((c) => c[0])).toEqual([
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(gameText)}&url=${encodeURIComponent(pageUrl)}`,
        `https://line.me/R/share?text=${encodeURIComponent(`${gameText}\n${pageUrl}`)}`,
      ]);
      await waitFor(() =>
        expect(mockClipboardWriteText).toHaveBeenCalledWith(
          `${gameText}\n${pageUrl}`,
        ),
      );
    });

    test("共有シートを開ける端末では、共有シートのボタン1つに任せ、ほかの操作は並びの最後に残る", async () => {
      const share = vi.fn().mockResolvedValue(undefined);
      stubWebShare(share);
      render(
        <ShareButtons
          url="/play/game-y"
          title="ゲームY"
          text={gameText}
          sns={["x", "line", "copy"]}
        >
          <button type="button">画像を保存</button>
        </ShareButtons>,
      );
      expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
        "この結果をシェア",
        "画像を保存",
      ]);
      fireEvent.click(screen.getByRole("button", { name: "この結果をシェア" }));
      await waitFor(() =>
        expect(share).toHaveBeenCalledWith({
          title: "ゲームY",
          text: gameText,
          url: "https://example.com/play/game-y",
        }),
      );
    });

    test("文を渡さないページの共有は、共有シートを開ける端末でも共有先を並べる", () => {
      stubWebShare(vi.fn());
      render(<ShareButtons url="/blog/test" title="テスト記事" />);
      expect(
        screen.queryByRole("button", { name: "この結果をシェア" }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "URLをコピー" }),
      ).toBeInTheDocument();
    });
  });

  describe("計測", () => {
    // 面ごとに、共有の部品へ渡す計測の値と、GA に届く値。
    const surfaces = [
      {
        name: "診断の解き終えた画面・結果のページ・相性",
        props: {
          contentType: "diagnosis",
          contentId: "quiz-x",
          surface: "text",
        },
        expected: {
          content_type: "diagnosis",
          item_id: "quiz-x",
          content_id: "quiz-x",
          surface: "text",
        },
      },
      {
        name: "知識クイズの解き終えた画面",
        props: { contentType: "quiz", contentId: "quiz-y", surface: "text" },
        expected: {
          content_type: "quiz",
          item_id: "quiz-y",
          content_id: "quiz-y",
          surface: "text",
        },
      },
      {
        name: "今日の運勢",
        props: { contentType: "fortune", contentId: "fortune-daily" },
        expected: {
          content_type: "fortune",
          item_id: "fortune-daily",
          content_id: "fortune-daily",
        },
      },
      {
        name: "ゲームの結果",
        props: { contentType: "game", contentId: "kanji-kanaru" },
        expected: {
          content_type: "game",
          item_id: "kanji-kanaru",
          content_id: "kanji-kanaru",
        },
      },
    ] as const;

    for (const { name, props, expected } of surfaces) {
      test(`${name}: X・LINE・コピーが、渡した計測の値をそのまま送る`, async () => {
        mockClipboardWriteText.mockResolvedValue(undefined);
        render(
          <ShareButtons
            url="/play/x"
            title="タイトル"
            text="結果"
            sns={["x", "line", "copy"]}
            {...props}
          />,
        );
        fireEvent.click(screen.getByRole("button", { name: /^X でシェア/ }));
        fireEvent.click(screen.getByRole("button", { name: /^LINE でシェア/ }));
        fireEvent.click(screen.getByRole("button", { name: "結果をコピー" }));
        await waitFor(() =>
          expect(
            gtagSpy.mock.calls.filter((c) => c[1] === "share"),
          ).toHaveLength(3),
        );
        const sent = gtagSpy.mock.calls
          .filter((c) => c[0] === "event" && c[1] === "share")
          .map((c) => c[2]);
        expect(sent).toEqual([
          { method: "twitter", ...expected },
          { method: "line", ...expected },
          { method: "clipboard", ...expected },
        ]);
        if (!("surface" in expected)) {
          for (const params of sent) {
            expect(params).not.toHaveProperty("surface");
          }
        }
      });

      test(`${name}: 共有シートで共有を終えたときだけ web_share を送る`, async () => {
        const share = vi
          .fn()
          .mockRejectedValueOnce(new Error("cancelled"))
          .mockResolvedValueOnce(undefined);
        stubWebShare(share);
        render(
          <ShareButtons
            url="/play/x"
            title="タイトル"
            text="結果"
            {...props}
          />,
        );
        const button = screen.getByRole("button", { name: "この結果をシェア" });
        fireEvent.click(button);
        await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
        await Promise.resolve();
        expect(findShareParams()).toBeUndefined();
        fireEvent.click(button);
        await waitFor(() => expect(findShareParams()).toBeDefined());
        expect(findShareParams()).toEqual({ method: "web_share", ...expected });
        if (!("surface" in expected)) {
          expect(findShareParams()).not.toHaveProperty("surface");
        }
      });
    }

    test("ページの共有は、surface を送らない", () => {
      render(
        <ShareButtons
          url="/play/x"
          title="診断X"
          contentType="quiz"
          contentId="x"
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /^はてブに追加/ }));
      expect(findShareParams()).toEqual({
        method: "hatena",
        content_type: "quiz",
        item_id: "x",
        content_id: "x",
      });
      expect(findShareParams()).not.toHaveProperty("surface");
    });

    test("contentType と contentId がそろわなければ送らない", () => {
      render(<ShareButtons url="/play/x" title="診断X" contentType="quiz" />);
      fireEvent.click(screen.getByRole("button", { name: /^X でシェア/ }));
      expect(findShareParams()).toBeUndefined();
    });

    test("コピーに失敗したら送らない", async () => {
      mockClipboardWriteText.mockRejectedValue(new Error("denied"));
      stubExecCommand(() => false);
      render(
        <ShareButtons
          url="/play/x"
          title="診断X"
          contentType="quiz"
          contentId="x"
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "URLをコピー" }));
      await waitFor(() =>
        expect(mockClipboardWriteText).toHaveBeenCalledTimes(1),
      );
      await Promise.resolve();
      expect(findShareParams()).toBeUndefined();
    });
  });
});
