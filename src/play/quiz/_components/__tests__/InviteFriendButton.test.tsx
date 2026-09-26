/**
 * InviteFriendButton（相性招待）— GA4 計測の回帰ガード（surface="invite"）。
 *
 * 検証の核心（「実際に完了したアクションのみ計上」）:
 * - navigator.share が成功したときだけ web_share を計上する（キャンセル＝reject では撃たない）。
 * - share 取消 → clipboard フォールバックが成功したときだけ clipboard を計上する。
 * - どの写し方でも写せなかったら何も計上せず、写せなかったと知らせる。
 * - contentId 未指定の面では計上しない。
 *
 * analytics.ts は window.gtag を直接呼ぶので、gtag を spy に差し替えて送出 payload を検査する。
 */
import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  test("share 取消 → clipboard 成功時は clipboard のみ計上（web_share は撃たない）", async () => {
    mockShare.mockRejectedValue(new Error("cancelled"));
    mockClipboardWriteText.mockResolvedValue(undefined);
    fireEvent.click(renderButton("quiz-character-personality"));

    await waitFor(() =>
      expect(mockClipboardWriteText).toHaveBeenCalledTimes(1),
    );
    await waitFor(() => expect(findShareParams()).toBeDefined());
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

  test("clipboard API に拒まれても、選んだ文を写す方法で写せたら clipboard を計上する", async () => {
    mockShare.mockRejectedValue(new Error("cancelled"));
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

  test("share 取消 → どの写し方でも写せなければ何も計上せず、写せなかったと知らせる", async () => {
    mockShare.mockRejectedValue(new Error("cancelled"));
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
