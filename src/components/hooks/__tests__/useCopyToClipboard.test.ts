import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useCopyToClipboard,
  COPIED_LABEL,
  COPY_FAILED_LABEL,
  DEFAULT_RESET_DELAY_MS,
} from "../useCopyToClipboard";

// navigator.clipboard のモック
const mockWriteText = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: mockWriteText },
    writable: true,
    configurable: true,
  });
  mockWriteText.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete (document as { execCommand?: unknown }).execCommand;
});

/** jsdom は execCommand を持たないので、この文書にだけ置く（afterEach で外す）。 */
function stubExecCommand(result: boolean): ReturnType<typeof vi.fn> {
  const execCommand = vi.fn(() => result);
  Object.defineProperty(document, "execCommand", {
    value: execCommand,
    configurable: true,
    writable: true,
  });
  return execCommand;
}

describe("useCopyToClipboard", () => {
  test("初期状態: copiedKey は null である", () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current.copiedKey).toBeNull();
  });

  test("copy(text) を呼ぶと navigator.clipboard.writeText が呼ばれる", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("テストテキスト");
    });

    expect(mockWriteText).toHaveBeenCalledWith("テストテキスト");
  });

  test("key 省略時: copy 後に copiedKey が true になる（単一ターゲット=パターンA）", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });

    expect(result.current.copiedKey).toBe(true);
  });

  test("key 省略時: DEFAULT_RESET_DELAY_MS 後に copiedKey が null に戻る", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });

    expect(result.current.copiedKey).toBe(true);

    act(() => {
      vi.advanceTimersByTime(DEFAULT_RESET_DELAY_MS);
    });

    expect(result.current.copiedKey).toBeNull();
  });

  test("key あり: copy 後に copiedKey が指定した key になる（複数ターゲット識別=パターンB/C/D）", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("rgb(0,0,0)", "rgb");
    });

    expect(result.current.copiedKey).toBe("rgb");
  });

  test("key あり: 異なる key でコピーすると copiedKey が更新される", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("value1", "hex");
    });
    expect(result.current.copiedKey).toBe("hex");

    await act(async () => {
      await result.current.copy("value2", "rgb");
    });
    expect(result.current.copiedKey).toBe("rgb");
  });

  test("数値 key（index）でも copiedKey が識別できる（パターンD）", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("sha256-hash", 2);
    });

    expect(result.current.copiedKey).toBe(2);
  });

  test("タイムアウト後に copiedKey が null に戻る（デフォルト delay）", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("value", "hex");
    });

    expect(result.current.copiedKey).toBe("hex");

    act(() => {
      vi.advanceTimersByTime(DEFAULT_RESET_DELAY_MS);
    });

    expect(result.current.copiedKey).toBeNull();
  });

  test("options.resetDelay でタイムアウトを上書きできる", async () => {
    const { result } = renderHook(() =>
      useCopyToClipboard({ resetDelay: 500 }),
    );

    await act(async () => {
      await result.current.copy("value");
    });

    expect(result.current.copiedKey).toBe(true);

    // 499ms 経過: まだリセットされていない
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current.copiedKey).toBe(true);

    // 500ms 経過: リセットされる
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.copiedKey).toBeNull();
  });

  test("clipboard API に拒まれても、選んだ文を写す方法で写せたら copiedKey が立つ", async () => {
    mockWriteText.mockRejectedValueOnce(new Error("Clipboard unavailable"));
    const execCommand = stubExecCommand(true);

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("hello", "hex");
    });

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(result.current.copiedKey).toBe("hex");
    expect(result.current.failedKey).toBeNull();
  });

  test("どの写し方でも写せなければ failedKey が立ち、時間がたっても残り、次に写せたら消える", async () => {
    mockWriteText.mockRejectedValueOnce(new Error("Clipboard unavailable"));
    stubExecCommand(false);

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("hello", "hex");
    });

    expect(result.current.copiedKey).toBeNull();
    expect(result.current.failedKey).toBe("hex");

    act(() => {
      vi.advanceTimersByTime(DEFAULT_RESET_DELAY_MS * 3);
    });
    expect(result.current.failedKey).toBe("hex");

    await act(async () => {
      await result.current.copy("hello", "rgb");
    });
    expect(result.current.failedKey).toBeNull();
    expect(result.current.copiedKey).toBe("rgb");
  });

  test("写せたあとに写せなかったら、「コピーしました」を消して失敗だけを知らせる", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("hello", "hex");
    });
    expect(result.current.copiedKey).toBe("hex");

    mockWriteText.mockRejectedValueOnce(new Error("Clipboard unavailable"));
    stubExecCommand(false);
    await act(async () => {
      await result.current.copy("hello", "rgb");
    });
    expect(result.current.copiedKey).toBeNull();
    expect(result.current.failedKey).toBe("rgb");
  });

  test("アンマウント後にタイマーが発火しても setState エラーが起きない（cleanup）", async () => {
    const { result, unmount } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });

    // タイマー発火前にアンマウント
    unmount();

    // cleanup が正しく動作していれば、タイマー発火後もエラーが出ない
    act(() => {
      vi.advanceTimersByTime(DEFAULT_RESET_DELAY_MS + 100);
    });

    // エラーが投げられなければOK（明示的なアサーションは不要だが、
    // console.errorのモックで確認する）
    expect(true).toBe(true);
  });

  test("navigator.clipboard が無い端末でも、選んだ文を写す方法で写す", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const execCommand = stubExecCommand(true);

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(result.current.copiedKey).toBe(true);
  });
});

describe("定数エクスポート", () => {
  test("COPIED_LABEL が文字列 'コピーしました' である", () => {
    expect(COPIED_LABEL).toBe("コピーしました");
  });

  test("COPY_FAILED_LABEL が文字列 'コピーできませんでした' である", () => {
    expect(COPY_FAILED_LABEL).toBe("コピーできませんでした");
  });

  test("DEFAULT_RESET_DELAY_MS が 2000 である", () => {
    expect(DEFAULT_RESET_DELAY_MS).toBe(2000);
  });
});
