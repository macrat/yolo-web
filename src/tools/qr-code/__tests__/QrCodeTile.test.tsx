import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import type { QrCodeResult } from "../logic";

// jsdom はキャンバスを描けないので、画像を作る関数を差し替えて、道具の組み方を確かめる。
vi.mock("../logic", () => ({
  generateQrCode: vi.fn((text: string, level?: string): QrCodeResult => {
    if (text === "TOO_LONG") return { success: false, error: "tooLong" };
    if (text === "NO_CANVAS") return { success: false, error: "failed" };
    if (text === "FITS_L_ONLY" && level !== "L")
      return { success: false, error: "tooLong" };
    return {
      success: true,
      dataUrl: `data:image/png;base64,${text.length}`,
      size: 148,
    };
  }),
}));

import { generateQrCode } from "../logic";
import QrCodeTile from "../QrCodeTile";

async function type(value: string) {
  fireEvent.change(screen.getByRole("textbox"), { target: { value } });
  await act(async () => {
    vi.advanceTimersByTime(300);
  });
}

describe("QrCodeTile", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(generateQrCode).mockClear();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("入力欄と選ぶ欄をラベルで名指しでき、道具の全体を枠で囲まない", () => {
    const { container } = render(<QrCodeTile />);
    expect(
      screen.getByRole("textbox", { name: "QRコードにする文字やURL" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "エラー訂正レベル" }),
    ).toHaveValue("M");
    const root = container.firstChild as HTMLElement;
    expect(root.tagName).toBe("DIV");
  });

  test("入力する前は、結果のボックスも保存のボタンも出さない", () => {
    render(<QrCodeTile />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /ダウンロード/ }),
    ).not.toBeInTheDocument();
  });

  test("入力すると、結果のボックスに画像を入れ、保存のボタンをボックスのすぐ下に置く", async () => {
    render(<QrCodeTile />);
    await type("https://example.com");

    const box = screen.getByRole("region", { name: "QRコード" });
    const image = screen.getByRole("img", {
      name: "「https://example.com」のQRコード",
    });
    expect(box).toContainElement(image);
    expect(image).toHaveAttribute("width", "148");
    expect(image).toHaveAttribute("height", "148");

    const download = screen.getByRole("button", {
      name: "PNG画像をダウンロード",
    });
    expect(box).not.toContainElement(download);
    expect(box.nextElementSibling).toBe(download);
    expect(download).toHaveAttribute("data-variant", "primary");
  });

  test("初めて画像ができたときだけ、結果のボックスが登場の動きを持つ", async () => {
    render(<QrCodeTile />);
    await type("a");
    const box = screen.getByRole("region", { name: "QRコード" });
    await type("ab");
    expect(screen.getByRole("region", { name: "QRコード" })).toBe(box);
    expect(box.className).toMatch(/appears/);
  });

  test("長い文の代替テキストは40字で切って「…」を添える", async () => {
    render(<QrCodeTile />);
    await type("あ".repeat(41));
    expect(
      screen.getByRole("img", { name: `「${"あ".repeat(40)}…」のQRコード` }),
    ).toBeInTheDocument();
  });

  test("選んだエラー訂正レベルで作り直す", async () => {
    render(<QrCodeTile />);
    await type("hello");
    expect(generateQrCode).toHaveBeenLastCalledWith("hello", "M");
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "H" } });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(generateQrCode).toHaveBeenLastCalledWith("hello", "H");
  });

  test("打っているあいだは作らず、手が止まってから最後の文で1回だけ作る", async () => {
    render(<QrCodeTile />);
    const textarea = screen.getByRole("textbox");
    for (const value of ["a", "ab", "abc"]) {
      fireEvent.change(textarea, { target: { value } });
      await act(async () => {
        vi.advanceTimersByTime(100);
      });
    }
    expect(generateQrCode).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(generateQrCode).toHaveBeenCalledTimes(1);
    expect(generateQrCode).toHaveBeenCalledWith("abc", "M");
  });

  test("空白だけの文では作らない", async () => {
    render(<QrCodeTile />);
    await type("   ");
    expect(generateQrCode).not.toHaveBeenCalled();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  test("文が長すぎると、欄の直下に直し方を字で言い、欄をエラーにして、前の画像を消す", async () => {
    render(<QrCodeTile />);
    await type("ok");
    expect(screen.getByRole("region")).toBeInTheDocument();
    await type("TOO_LONG");

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(
      "文が長すぎてQRコードに入りません。エラー訂正レベル「中（M）」で入るのは、半角英数なら2,331字、日本語なら777字までです。文を短くするか、エラー訂正レベルを下げてください。",
    );
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAccessibleDescription(alert.textContent!);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  test("いちばん低いレベル（L）で長すぎるときは、レベルを下げるよう言わず、そのレベルで入る数を言う", async () => {
    render(<QrCodeTile />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "L" } });
    await type("TOO_LONG");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "文が長すぎてQRコードに入りません。エラー訂正レベル「低（L）」で入るのは、半角英数なら2,953字、日本語なら984字までです。文を短くしてください。",
    );
  });

  test("レベルを選び直すと待たずに作り直し、前のレベルの誤りを一瞬も出さない", async () => {
    render(<QrCodeTile />);
    await type("FITS_L_ONLY");
    expect(screen.getByRole("alert")).toHaveTextContent("「中（M）」");

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "L" } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(0);
    });
    expect(generateQrCode).toHaveBeenLastCalledWith("FITS_L_ONLY", "L");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "QRコード" }),
    ).toBeInTheDocument();
  });

  test("画像を描けないときも、何が起きたかを字で言う", async () => {
    render(<QrCodeTile />);
    await type("NO_CANVAS");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "QRコードの画像を描けませんでした。",
    );
  });

  test("作ったことを読み上げの知らせで言う", async () => {
    render(<QrCodeTile />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("");
    await type("https://example.com");
    expect(status).toHaveTextContent("QRコードを作りました");
  });

  test("保存のボタンは、見えている画像を qrcode.png として保存する", async () => {
    render(<QrCodeTile />);
    await type("hello");
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.href).toBe("data:image/png;base64,5");
        expect(this.download).toBe("qrcode.png");
      });
    fireEvent.click(
      screen.getByRole("button", { name: "PNG画像をダウンロード" }),
    );
    expect(click).toHaveBeenCalledTimes(1);
    click.mockRestore();
  });

  test("2つ置いても id が重ならない", () => {
    const { container: first } = render(<QrCodeTile />);
    const { container: second } = render(<QrCodeTile />);
    const ids = [first, second].flatMap((c) =>
      Array.from(c.querySelectorAll("[id]"), (el) => el.id),
    );
    expect(new Set(ids).size).toBe(ids.length);
  });
});
