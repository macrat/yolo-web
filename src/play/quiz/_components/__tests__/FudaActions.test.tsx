/**
 * FudaActions（札の保存/共有）— 分岐ロジックと GA4 計測の回帰ガード（cycle-280 タスクC）。
 *
 * 検証の核心（「実際に完了したアクションだけ計上する」B-551）:
 * - 共有: canShare({files}) true → navigator.share({files}) 成功時に trackShare("web_share",…,"fuda")。
 * - 共有: canShare false/未定義 → clipboard コピー成功時に trackShare("clipboard",…,"fuda")。
 * - 共有: 共有シートのキャンセル（reject）では計上しない。
 * - 保存: アンカー download で保存し trackSave(…,"download","fuda")。
 * - fetch 失敗（!res.ok）は握りつぶさずエラー表示にし、UI は壊さない（計上しない）。
 *
 * analytics.ts は window.gtag を直接呼ぶので gtag を spy に差し替えて送出 payload を検査する。
 * fetch / navigator.canShare|share|clipboard / URL.createObjectURL をモックする。
 */
import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FudaActions from "../FudaActions";

const gtagSpy = vi.fn();
const mockFetch = vi.fn();
const mockCanShare = vi.fn();
const mockShare = vi.fn();
const mockClipboardWriteText = vi.fn();
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

/** gtag.mock.calls から指定イベント名の params を取り出す（無ければ undefined）。 */
function findEventParams(name: string): Record<string, unknown> | undefined {
  const call = gtagSpy.mock.calls.find(
    (c) => c[0] === "event" && c[1] === name,
  );
  return call?.[2] as Record<string, unknown> | undefined;
}

/** 成功する fuda-image レスポンス（PNG Blob）を返す fetch モックを仕込む。 */
function stubFetchOk() {
  mockFetch.mockResolvedValue({
    ok: true,
    blob: async () => new Blob(["png-bytes"], { type: "image/png" }),
  });
}

beforeEach(() => {
  gtagSpy.mockClear();
  mockFetch.mockClear();
  mockCanShare.mockClear();
  mockShare.mockClear();
  mockClipboardWriteText.mockClear();
  mockCreateObjectURL.mockClear();
  mockRevokeObjectURL.mockClear();

  (window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy;
  vi.stubGlobal("fetch", mockFetch);
  vi.stubGlobal("location", { origin: "https://example.com" });
  vi.stubGlobal("navigator", {
    ...navigator,
    canShare: mockCanShare,
    share: mockShare,
    clipboard: { writeText: mockClipboardWriteText },
  });
  mockCreateObjectURL.mockReturnValue("blob:mock-object-url");
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderActions() {
  render(
    <FudaActions
      resultId="blazing-strategist"
      resultTitle="炎の策士"
      quizTitle="キャラ性格診断"
      quizSlug="character-personality"
    />,
  );
  return {
    saveButton: screen.getByRole("button", { name: "保存" }),
    shareButton: screen.getByRole("button", { name: "共有" }),
  };
}

describe("FudaActions 共有", () => {
  test("canShare({files}) true → navigator.share({files}) 成功時に web_share を fuda surface で計上", async () => {
    stubFetchOk();
    mockCanShare.mockReturnValue(true);
    mockShare.mockResolvedValue(undefined);

    const { shareButton } = renderActions();
    fireEvent.click(shareButton);

    await waitFor(() => expect(mockShare).toHaveBeenCalledTimes(1));
    // 固定 URL から札を取得している。
    expect(mockFetch).toHaveBeenCalledWith(
      "/play/character-personality/result/blazing-strategist/fuda-image",
    );
    // files 付きで共有している。
    const shareArg = mockShare.mock.calls[0][0] as { files?: File[] };
    expect(shareArg.files).toHaveLength(1);
    expect(shareArg.files?.[0].name).toBe(
      "yolos-character-personality-blazing-strategist.png",
    );

    await waitFor(() => expect(findEventParams("share")).toBeDefined());
    expect(findEventParams("share")).toMatchObject({
      method: "web_share",
      content_type: "diagnosis",
      content_id: "quiz-character-personality",
      surface: "fuda",
    });
    // ファイル共有できたので clipboard へは落ちない。
    expect(mockClipboardWriteText).not.toHaveBeenCalled();
  });

  test("canShare false → clipboard コピー成功時に clipboard を fuda surface で計上", async () => {
    stubFetchOk();
    mockCanShare.mockReturnValue(false);
    mockClipboardWriteText.mockResolvedValue(undefined);

    const { shareButton } = renderActions();
    fireEvent.click(shareButton);

    await waitFor(() =>
      expect(mockClipboardWriteText).toHaveBeenCalledTimes(1),
    );
    // 共有 URL をコピーしている。
    expect(mockClipboardWriteText).toHaveBeenCalledWith(
      "https://example.com/play/character-personality/result/blazing-strategist",
    );
    // ファイル共有は呼ばれない。
    expect(mockShare).not.toHaveBeenCalled();

    await waitFor(() => expect(findEventParams("share")).toBeDefined());
    expect(findEventParams("share")).toMatchObject({
      method: "clipboard",
      content_type: "diagnosis",
      content_id: "quiz-character-personality",
      surface: "fuda",
    });
  });

  test("共有シートのキャンセル（reject）では計上しない", async () => {
    stubFetchOk();
    mockCanShare.mockReturnValue(true);
    mockShare.mockRejectedValue(new Error("AbortError"));

    const { shareButton } = renderActions();
    fireEvent.click(shareButton);

    await waitFor(() => expect(mockShare).toHaveBeenCalledTimes(1));
    // マイクロタスクを流してから未計上を確認する。
    await Promise.resolve();
    expect(findEventParams("share")).toBeUndefined();
    // キャンセルは clipboard へ落ちない（ファイル共有可能環境のため）。
    expect(mockClipboardWriteText).not.toHaveBeenCalled();
  });
});

describe("FudaActions 保存", () => {
  test("アンカー download で保存し download を fuda surface で計上", async () => {
    stubFetchOk();

    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tag: string) => {
        const el = originalCreateElement(tag) as HTMLElement;
        if (tag === "a") {
          // click はテスト環境でナビゲーションを起こさないよう差し替える。
          (el as HTMLAnchorElement).click = clickSpy;
        }
        return el;
      });

    const { saveButton } = renderActions();
    fireEvent.click(saveButton);

    await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-object-url");

    await waitFor(() => expect(findEventParams("save")).toBeDefined());
    expect(findEventParams("save")).toMatchObject({
      content_id: "quiz-character-personality",
      content_type: "diagnosis",
      method: "download",
      surface: "fuda",
    });
    // 保存は共有シートを経由しない（download 対応環境）。
    expect(mockShare).not.toHaveBeenCalled();

    createElementSpy.mockRestore();
  });

  test("アンカー download 非対応（iOS）は共有シート経由で保存し web_share_files を計上", async () => {
    stubFetchOk();
    mockCanShare.mockReturnValue(true);
    mockShare.mockResolvedValue(undefined);

    // isAnchorDownloadSupported() を false にする：createElement("a") が
    // "download" プロパティを持たない要素を返すようエミュレートする（iOS Safari 等）。
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tag: string) => {
        if (tag === "a") {
          // "download" in el === false になるオブジェクトを返す。
          return { tagName: "A" } as unknown as HTMLElement;
        }
        return originalCreateElement(tag) as HTMLElement;
      });

    const { saveButton } = renderActions();
    fireEvent.click(saveButton);

    await waitFor(() => expect(mockShare).toHaveBeenCalledTimes(1));
    // files 付きで共有シートに渡している（保存＝ファイル共有経由）。
    const shareArg = mockShare.mock.calls[0][0] as { files?: File[] };
    expect(shareArg.files).toHaveLength(1);
    expect(shareArg.files?.[0].name).toBe(
      "yolos-character-personality-blazing-strategist.png",
    );
    // アンカー download は使わない（createObjectURL を踏まない）。
    expect(mockCreateObjectURL).not.toHaveBeenCalled();

    await waitFor(() => expect(findEventParams("save")).toBeDefined());
    expect(findEventParams("save")).toMatchObject({
      content_id: "quiz-character-personality",
      content_type: "diagnosis",
      method: "web_share_files",
      surface: "fuda",
    });

    createElementSpy.mockRestore();
  });
});

describe("FudaActions fetch 失敗", () => {
  test("!res.ok では計上せずエラーメッセージを表示（UI は壊さない）", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      blob: async () => new Blob([]),
    });

    const { saveButton } = renderActions();
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(
        screen.getByText(
          "画像を用意できませんでした。時間をおいて再度お試しください。",
        ),
      ).toBeInTheDocument(),
    );
    expect(findEventParams("save")).toBeUndefined();
    expect(findEventParams("share")).toBeUndefined();
    // ボタンは再度押せる状態に戻っている（busy 解除）。
    expect(saveButton).not.toBeDisabled();
  });
});
