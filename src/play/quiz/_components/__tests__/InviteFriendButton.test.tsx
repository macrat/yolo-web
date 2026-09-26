/**
 * InviteFriendButton（相性招待）— GA4 計測の回帰ガード（surface="invite"）。
 *
 * 検証の核心（「実際に完了したアクションのみ計上」）:
 * - navigator.share が成功したときだけ web_share を計上する（キャンセル＝reject では撃たない）。
 * - 共有シートを閉じた回（AbortError）は写さず、何も知らせず、何も計上しない。
 * - 共有シートが無いか、ほかの理由で使えないときは写し、写せたときだけ clipboard を計上する。
 * - どの写し方でも写せなかったら何も計上せず、写せなかったと知らせる。
 * - contentId 未指定の面では計上しない。
 *
 * analytics.ts は window.gtag を直接呼ぶので、gtag を spy に差し替えて送出 payload を検査する。
 */
import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import InviteFriendButton from "../InviteFriendButton";

const gtagSpy = vi.fn();
const mockShare = vi.fn();
const mockClipboardWriteText = vi.fn();

/** gtag.mock.calls から share イベントの params を取り出す（無ければ undefined）。 */
function findShareParams(): Record<string, unknown> | undefined {
  const call = gtagSpy.mock.calls.find(
    (c) => c[0] === "event" && c[1] === "share",
  );
  return call?.[2] as Record<string, unknown> | undefined;
}

beforeEach(() => {
  gtagSpy.mockClear();
  mockShare.mockClear();
  mockClipboardWriteText.mockClear();
  (window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy;
  vi.stubGlobal("navigator", {
    ...navigator,
    share: mockShare,
    clipboard: { writeText: mockClipboardWriteText },
  });
  vi.stubGlobal("location", { origin: "https://example.com" });
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete (document as { execCommand?: unknown }).execCommand;
});

/** 共有シートを持たない端末の navigator に差し替える。 */
function stubNoShare(): void {
  vi.stubGlobal("navigator", {
    ...navigator,
    share: undefined,
    clipboard: { writeText: mockClipboardWriteText },
  });
}

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

function renderButton(contentId?: string) {
  render(
    <InviteFriendButton
      quizSlug="character-personality"
      resultTypeId="type-a"
      inviteText="相性を調べよう!"
      contentId={contentId}
    />,
  );
  return screen.getByRole("button", { name: "友達に診断を送る" });
}

describe("InviteFriendButton 計測", () => {
  test("navigator.share 成功時のみ web_share を invite surface で計上する", async () => {
    mockShare.mockResolvedValue(undefined);
    fireEvent.click(renderButton("quiz-character-personality"));

    await waitFor(() => expect(mockShare).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(findShareParams()).toBeDefined());
    expect(findShareParams()).toMatchObject({
      method: "web_share",
      content_type: "diagnosis",
      item_id: "quiz-character-personality",
      content_id: "quiz-character-personality",
      surface: "invite",
    });
    // 成功時は clipboard フォールバックへ落ちない
    expect(mockClipboardWriteText).not.toHaveBeenCalled();
  });

  test("共有シートを閉じた回（AbortError）は、写さず、何も知らせず、何も送らない", async () => {
    mockShare.mockRejectedValue(new DOMException("cancelled", "AbortError"));
    const execCommand = stubExecCommand(true);
    fireEvent.click(renderButton("quiz-character-personality"));

    await waitFor(() => expect(mockShare).toHaveBeenCalledTimes(1));
    await Promise.resolve();
    await Promise.resolve();
    expect(mockClipboardWriteText).not.toHaveBeenCalled();
    expect(execCommand).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent(/^$/);
    expect(findShareParams()).toBeUndefined();
  });

  test("共有シートがほかの理由で使えなければ、写して clipboard のみ計上する（web_share は撃たない）", async () => {
    mockShare.mockRejectedValue(new DOMException("denied", "NotAllowedError"));
    mockClipboardWriteText.mockResolvedValue(undefined);
    fireEvent.click(renderButton("quiz-character-personality"));

    await waitFor(() => expect(findShareParams()).toBeDefined());
    expect(mockClipboardWriteText).toHaveBeenCalledTimes(1);
    expect(findShareParams()).toMatchObject({
      method: "clipboard",
      content_type: "diagnosis",
      content_id: "quiz-character-personality",
      surface: "invite",
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      /^リンクをコピーしました$/,
    );
  });

  test("共有シートの無い端末では写し、clipboard API に拒まれても選んだ文を写す方法で写せたら計上する", async () => {
    stubNoShare();
    mockClipboardWriteText.mockRejectedValue(new Error("denied"));
    const execCommand = stubExecCommand(true);
    fireEvent.click(renderButton("quiz-character-personality"));

    await waitFor(() => expect(findShareParams()).toBeDefined());
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(findShareParams()).toMatchObject({
      method: "clipboard",
      surface: "invite",
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      /^リンクをコピーしました$/,
    );
  });

  test("どの写し方でも写せなければ何も計上せず、写せなかったと知らせる", async () => {
    stubNoShare();
    mockClipboardWriteText.mockRejectedValue(new Error("denied"));
    stubExecCommand(false);
    fireEvent.click(renderButton("quiz-character-personality"));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        /^リンクをコピーできませんでした$/,
      ),
    );
    expect(findShareParams()).toBeUndefined();
  });

  test("contentId 未指定なら計上しない", async () => {
    mockShare.mockResolvedValue(undefined);
    fireEvent.click(renderButton());

    await waitFor(() => expect(mockShare).toHaveBeenCalledTimes(1));
    await Promise.resolve();
    expect(findShareParams()).toBeUndefined();
  });
});

describe("InviteFriendButton の「リンクをコピーしました」", () => {
  test("続けて写すと、後から写したときから2秒出る", async () => {
    vi.useFakeTimers();
    try {
      stubNoShare();
      mockClipboardWriteText.mockResolvedValue(undefined);
      const button = renderButton("quiz-character-personality");
      await act(async () => {
        fireEvent.click(button);
      });
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });
      await act(async () => {
        fireEvent.click(button);
      });
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByRole("status")).toHaveTextContent(
        /^リンクをコピーしました$/,
      );
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByRole("status")).toHaveTextContent(/^$/);
    } finally {
      vi.useRealTimers();
    }
  });

  test("外したあとにタイマーを残さない", async () => {
    vi.useFakeTimers();
    try {
      stubNoShare();
      mockClipboardWriteText.mockResolvedValue(undefined);
      const { unmount } = render(
        <InviteFriendButton
          quizSlug="character-personality"
          resultTypeId="type-a"
          inviteText="相性を調べよう!"
        />,
      );
      await act(async () => {
        fireEvent.click(
          screen.getByRole("button", { name: "友達に診断を送る" }),
        );
      });
      unmount();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
