import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import CopyButton, { COPY_FACES } from "@/components/CopyButton";
import { DEFAULT_RESET_DELAY_MS } from "@/components/hooks/useCopyToClipboard";

const writeText = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
  writeText.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  writeText.mockReset();
  delete (document as { execCommand?: unknown }).execCommand;
});

/** クリップボードの API にも、選んだ文を写す方法にも拒まれる端末にする。 */
function refuseEveryCopy(): void {
  writeText.mockRejectedValue(new Error("denied"));
  Object.defineProperty(document, "execCommand", {
    value: vi.fn(() => false),
    configurable: true,
    writable: true,
  });
}

/** 押して、写す処理が終わるまで待つ。 */
async function press(button: HTMLElement): Promise<void> {
  await act(async () => {
    fireEvent.click(button);
  });
}

/** 読み上げに知らせる所。見えないが、写したかどうかを文で言う。 */
function liveRegion(container: HTMLElement): HTMLElement {
  const region = container.querySelector<HTMLElement>('[aria-live="polite"]');
  if (!region) throw new Error("読み上げの知らせの所が無い");
  return region;
}

/** 知らせの文を入れた要素。押すたびに入れ直される。 */
function announcementNode(container: HTMLElement): Element | null {
  return liveRegion(container).firstElementChild;
}

describe("CopyButton", () => {
  test("押す前は「コピー」で、名前は何を写すかを言う。読み上げの知らせは空", () => {
    const { container } = render(<CopyButton text="#ee827c" target="HEX" />);
    const button = screen.getByRole("button", { name: "HEXをコピー" });
    expect(button).toHaveTextContent(COPY_FACES.idle);
    expect(liveRegion(container)).toHaveTextContent(/^$/);
  });

  test("写せたら面が「コピー済み」になり、何を写したかを知らせ、しばらくして面が戻る", async () => {
    const { container } = render(<CopyButton text="#ee827c" target="HEX" />);
    const button = screen.getByRole("button", { name: "HEXをコピー" });

    await press(button);

    expect(writeText).toHaveBeenCalledWith("#ee827c");
    expect(button).toHaveTextContent(COPY_FACES.copied);
    expect(liveRegion(container)).toHaveTextContent("HEXをコピーしました");

    act(() => {
      vi.advanceTimersByTime(DEFAULT_RESET_DELAY_MS);
    });
    expect(button).toHaveTextContent(COPY_FACES.idle);
  });

  test("面の字が替わってもボタンの名前は変えず、知らせはライブリージョンだけが言う", async () => {
    render(<CopyButton text="#ee827c" target="HEX" />);
    const button = screen.getByRole("button", { name: "HEXをコピー" });

    await press(button);

    expect(button).toHaveTextContent(COPY_FACES.copied);
    expect(button).toHaveAccessibleName("HEXをコピー");
  });

  test("「コピー済み」のあいだに押し直しても、知らせを入れ直して読ませる", async () => {
    const { container } = render(<CopyButton text="#ee827c" target="HEX" />);
    const button = screen.getByRole("button", { name: "HEXをコピー" });

    await press(button);
    const first = announcementNode(container);
    await press(button);
    const second = announcementNode(container);

    expect(second).toHaveTextContent("HEXをコピーしました");
    expect(second).not.toBe(first);
  });

  test("写せなかったら面が「コピー失敗」になり、写せなかったことを知らせ、次に押すまで残す", async () => {
    refuseEveryCopy();
    const { container } = render(<CopyButton text="#ee827c" target="HEX" />);
    const button = screen.getByRole("button", { name: "HEXをコピー" });

    await press(button);

    expect(button).toHaveTextContent(COPY_FACES.failed);
    expect(liveRegion(container)).toHaveTextContent(
      "HEXをコピーできませんでした",
    );

    act(() => {
      vi.advanceTimersByTime(DEFAULT_RESET_DELAY_MS * 3);
    });
    expect(button).toHaveTextContent(COPY_FACES.failed);

    writeText.mockResolvedValue(undefined);
    await press(button);
    expect(button).toHaveTextContent(COPY_FACES.copied);
    expect(liveRegion(container)).toHaveTextContent("HEXをコピーしました");
  });

  test("クリップボードの API に拒まれても、選んだ文を写す方法で写せたら「コピー済み」になる", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    const execCommand = vi.fn(() => true);
    Object.defineProperty(document, "execCommand", {
      value: execCommand,
      configurable: true,
      writable: true,
    });
    render(<CopyButton text="#ee827c" target="HEX" />);
    const button = screen.getByRole("button", { name: "HEXをコピー" });

    await press(button);

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(button).toHaveTextContent(COPY_FACES.copied);
  });

  test("showTarget のボタンは、押す前の面で何を写すかを言い、押したあとは短い面になる", async () => {
    render(<CopyButton text="本文" target="メール全文" showTarget />);
    const button = screen.getByRole("button", { name: "メール全文をコピー" });
    expect(button).toHaveTextContent(/^メール全文をコピー$/);

    await press(button);

    expect(button).toHaveTextContent(/^コピー済み$/);
  });

  test("面の字が替わっても大きさが変わらないよう、どの面の字も見えない箱で取っておく", () => {
    const { container } = render(
      <CopyButton text="本文" target="メール全文" showTarget />,
    );
    const reserved = [
      ...container.querySelectorAll<HTMLElement>('[aria-hidden="true"]'),
    ].map((element) => element.textContent);
    expect(reserved).toEqual([
      "メール全文をコピー",
      COPY_FACES.copied,
      COPY_FACES.failed,
    ]);
  });

  test("disabled のときは押せず、写さない", () => {
    render(<CopyButton text="" target="出力" disabled />);
    const button = screen.getByRole("button", { name: "出力をコピー" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(writeText).not.toHaveBeenCalled();
  });

  test("ボタンは Button の見え方（プライマリでないボタン）を持つ", () => {
    render(<CopyButton text="x" target="出力" />);
    expect(
      screen.getByRole("button", { name: "出力をコピー" }),
    ).toHaveAttribute("data-variant", "default");
  });
});
