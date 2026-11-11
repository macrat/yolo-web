import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCopyToClipboard, COPIED_DISPLAY_MS } from "../useCopyToClipboard";

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

/** クリップボードの API にも、選んだ文を写す方法にも拒まれる端末にする。 */
function refuseNextCopy(): void {
  mockWriteText.mockRejectedValueOnce(new Error("Clipboard unavailable"));
  stubExecCommand(false);
}

describe("useCopyToClipboard", () => {
  test("はじめは写していない状態", () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current.status).toBe("idle");
  });

  test("写すと、クリップボードの API に文を渡し、写せたことを返す", async () => {
    const { result } = renderHook(() => useCopyToClipboard());
    let copied: boolean | undefined;

    await act(async () => {
      copied = await result.current.copy("テストテキスト");
    });

    expect(mockWriteText).toHaveBeenCalledWith("テストテキスト");
    expect(copied).toBe(true);
    expect(result.current.status).toBe("copied");
  });

  test("写せた状態は、COPIED_DISPLAY_MS たつと写していない状態に戻る", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });
    act(() => {
      vi.advanceTimersByTime(COPIED_DISPLAY_MS - 1);
    });
    expect(result.current.status).toBe("copied");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.status).toBe("idle");
  });

  test("写せた状態のあいだに写し直すと、そこから数え直す", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });
    act(() => {
      vi.advanceTimersByTime(COPIED_DISPLAY_MS - 500);
    });
    await act(async () => {
      await result.current.copy("hello");
    });
    act(() => {
      vi.advanceTimersByTime(COPIED_DISPLAY_MS - 1);
    });
    expect(result.current.status).toBe("copied");
  });

  test("clipboard API に拒まれても、選んだ文を写す方法で写せたら写せた状態になる", async () => {
    mockWriteText.mockRejectedValueOnce(new Error("Clipboard unavailable"));
    const execCommand = stubExecCommand(true);
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(result.current.status).toBe("copied");
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
    expect(result.current.status).toBe("copied");
  });

  test("どの写し方でも写せなければ、写せなかったことを返し、時間がたっても残し、次に写せたら替える", async () => {
    refuseNextCopy();
    const { result } = renderHook(() => useCopyToClipboard());
    let copied: boolean | undefined;

    await act(async () => {
      copied = await result.current.copy("hello");
    });
    expect(copied).toBe(false);
    expect(result.current.status).toBe("failed");

    act(() => {
      vi.advanceTimersByTime(COPIED_DISPLAY_MS * 3);
    });
    expect(result.current.status).toBe("failed");

    stubExecCommand(true);
    await act(async () => {
      await result.current.copy("hello");
    });
    expect(result.current.status).toBe("copied");
  });

  test("写せたあとに写せなかったら、写せなかった状態になり、戻るためのタイマーで消えない", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });
    refuseNextCopy();
    await act(async () => {
      await result.current.copy("hello");
    });
    act(() => {
      vi.advanceTimersByTime(COPIED_DISPLAY_MS * 2);
    });

    expect(result.current.status).toBe("failed");
  });

  test("外したあとにタイマーが来ても、状態を変えようとしない", async () => {
    const consoleError = vi.spyOn(console, "error");
    const { result, unmount } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });
    unmount();
    act(() => {
      vi.advanceTimersByTime(COPIED_DISPLAY_MS + 100);
    });

    expect(consoleError).not.toHaveBeenCalled();
  });
});
