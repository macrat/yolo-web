/**
 * ShareButtons（quiz/diagnosis のテキスト+URL共有）— GA4 計測是正の回帰ガード（cycle-280 B-551）。
 *
 * 検証の核心:
 * - web_share は共有シートが「成功」したときだけ計上する。キャンセル（shareGameResult=false）
 *   では share イベントを撃たない（旧実装は無条件計上で誤計上していた＝MUST-3）。
 * - content_id が canonical 値で乗り、item_id は温存される（後方互換の additive dual-write）。
 * - surface="text" を渡した面では surface が乗り、未指定の面（fortune 等）では surface キーが
 *   一切乗らない（部分埋めで主指標を汚さない）。
 *
 * analytics.ts は window.gtag を直接呼ぶので、gtag を spy に差し替えて送出 payload を検査する。
 */
import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ShareButtons from "../ShareButtons";

const gtagSpy = vi.fn();
const mockWindowOpen = vi.fn();
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
  mockWindowOpen.mockClear();
  mockClipboardWriteText.mockClear();
  (window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy;
  vi.stubGlobal("open", mockWindowOpen);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** navigator を share あり/なしで差し替える。share ありだと useCanWebShare が true になる。 */
function stubNavigator(share?: (data: unknown) => Promise<void>): void {
  vi.stubGlobal("navigator", {
    ...navigator,
    ...(share ? { share } : {}),
    clipboard: { writeText: mockClipboardWriteText },
  });
}

describe("ShareButtons（quiz）計測是正", () => {
  describe("web_share（成功時のみ計上）", () => {
    test("共有シートが成功したときだけ share を計上し、content_id/surface が乗る", async () => {
      const share = vi.fn().mockResolvedValue(undefined);
      stubNavigator(share);
      render(
        <ShareButtons
          shareText="結果テキスト"
          shareUrl="https://example.com/play/x/result/a"
          quizTitle="診断X"
          contentType="diagnosis"
          contentId="quiz-x"
          surface="text"
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "この結果をシェア" }));

      await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(findShareParams()).toBeDefined());
      expect(findShareParams()).toMatchObject({
        method: "web_share",
        content_type: "diagnosis",
        item_id: "quiz-x",
        content_id: "quiz-x",
        surface: "text",
      });
    });

    test("共有シートがキャンセルされたら share を一切計上しない（誤計上の是正）", async () => {
      const share = vi.fn().mockRejectedValue(new Error("cancelled"));
      stubNavigator(share);
      render(
        <ShareButtons
          shareText="結果テキスト"
          shareUrl="https://example.com/play/x/result/a"
          quizTitle="診断X"
          contentType="diagnosis"
          contentId="quiz-x"
          surface="text"
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "この結果をシェア" }));

      await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
      // マイクロタスクを流し切ってから未計上を確認する
      await Promise.resolve();
      expect(findShareParams()).toBeUndefined();
    });
  });

  describe("twitter/line/clipboard（surface と content_id）", () => {
    test("Xでシェアで surface と content_id/item_id が乗る", () => {
      mockWindowOpen.mockReturnValue(null);
      stubNavigator(); // share 無し → X/LINE/コピーの3ボタン
      render(
        <ShareButtons
          shareText="結果テキスト"
          shareUrl="https://example.com/play/x/result/a"
          quizTitle="診断X"
          contentType="diagnosis"
          contentId="quiz-x"
          surface="text"
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Xでシェア" }));
      expect(findShareParams()).toMatchObject({
        method: "twitter",
        item_id: "quiz-x",
        content_id: "quiz-x",
        surface: "text",
      });
    });

    test("コピー成功で clipboard を計上する", async () => {
      mockClipboardWriteText.mockResolvedValue(undefined);
      stubNavigator();
      render(
        <ShareButtons
          shareText="結果テキスト"
          shareUrl="https://example.com/play/x/result/a"
          quizTitle="診断X"
          contentType="diagnosis"
          contentId="quiz-x"
          surface="text"
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "結果をコピー" }));
      await waitFor(() => expect(findShareParams()).toBeDefined());
      expect(findShareParams()).toMatchObject({
        method: "clipboard",
        content_id: "quiz-x",
        surface: "text",
      });
    });
  });

  describe("後方互換・非汚染", () => {
    test("surface 未指定（fortune 等の面）では surface キーを送らない", () => {
      mockWindowOpen.mockReturnValue(null);
      stubNavigator();
      render(
        <ShareButtons
          shareText="今日の運勢"
          shareUrl="https://example.com/play/fortune"
          quizTitle="今日のユーモア運勢"
          contentType="fortune"
          contentId="fortune-daily"
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Xでシェア" }));
      const params = findShareParams();
      expect(params).toBeDefined();
      expect(params).not.toHaveProperty("surface");
      // item_id は温存（後方互換）
      expect(params).toMatchObject({ item_id: "fortune-daily" });
    });

    test("contentType/contentId が無ければ計上しない", () => {
      mockWindowOpen.mockReturnValue(null);
      stubNavigator();
      render(
        <ShareButtons
          shareText="t"
          shareUrl="https://example.com/x"
          quizTitle="X"
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Xでシェア" }));
      expect(findShareParams()).toBeUndefined();
    });
  });
});
