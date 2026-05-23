import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import QrCodeTile from "../QrCodeTile";

// jsdom は HTMLCanvasElement.getContext() が未実装のため canvas 操作をモック化する
function setupCanvasMock() {
  const mockCtx = {
    fillStyle: "",
    fillRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    mockCtx as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(
    (type?: string) => `data:${type ?? "image/png"};base64,mockdata`,
  );
}

describe("QrCodeTile", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setupCanvasMock();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // (i) 空入力時の表示: プレースホルダー + DL ボタン非活性 or 非表示 + role="status" 要素
  it("(i) 空入力時: プレースホルダーが表示され、DL ボタンが非活性、role=status 要素が存在する", () => {
    render(<QrCodeTile />);

    // プレースホルダーが表示される
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("placeholder");
    expect(textarea.getAttribute("placeholder")).not.toBe("");

    // role="status" 要素が存在する
    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();

    // DL ボタンが非活性 or 非表示
    const dlButton = screen.queryByRole("button", { name: /PNG/i });
    if (dlButton) {
      // 表示されているなら disabled であること
      expect(dlButton).toBeDisabled();
    }
    // ボタンが非表示の場合もパスとする（タイル実装側の裁量）
  });

  // (ii) 短い入力で SVG が生成される: "test" 入力 → SVG 描画 + aria-label 動的化
  it('(ii) "test" 入力後 debounce 経過で SVG が描画され aria-label が動的化される', async () => {
    render(<QrCodeTile />);
    const textarea = screen.getByRole("textbox");

    fireEvent.change(textarea, { target: { value: "test" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // SVG が描画される
    const statusEl = screen.getByRole("status");
    expect(statusEl.innerHTML).toContain("<svg");

    // aria-label が動的化される
    expect(statusEl).toHaveAttribute("aria-label");
    const label = statusEl.getAttribute("aria-label");
    expect(label).not.toBe("QR コードプレビューエリア");
    expect(label).toContain("test");
  });

  // (iii) URL 入力で SVG が生成される
  it('(iii) URL "https://yolos.net" 入力後 debounce 経過で SVG が描画される', async () => {
    render(<QrCodeTile />);
    const textarea = screen.getByRole("textbox");

    fireEvent.change(textarea, { target: { value: "https://yolos.net" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    const statusEl = screen.getByRole("status");
    expect(statusEl.innerHTML).toContain("<svg");
  });

  // (iv) debounce 動作: 連続入力中は再描画が抑制され、debounce 経過後に最終結果が反映
  it("(iv) debounce: 300ms 以内の連続入力では SVG は更新されず、経過後に最終入力で生成される", () => {
    render(<QrCodeTile />);
    const textarea = screen.getByRole("textbox");

    // 100ms 間隔で 3 回入力
    fireEvent.change(textarea, { target: { value: "a" } });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.change(textarea, { target: { value: "ab" } });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.change(textarea, { target: { value: "abc" } });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // 300ms 経過前: SVG はまだない
    const statusEl = screen.getByRole("status");
    expect(statusEl.innerHTML).not.toContain("<svg");

    // 300ms 後に発火
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(statusEl.innerHTML).toContain("<svg");
  });

  // (v) 長い入力でもエラーにならない（誤り訂正 M 固定での上限内の入力）
  it("(v) 誤り訂正 M 固定で 500 文字程度の長い入力でもエラーにならず SVG が描画される", async () => {
    render(<QrCodeTile />);
    const textarea = screen.getByRole("textbox");
    // 誤り訂正 M で上限内の長い入力（ASCII 500 文字程度）
    const longInput = "a".repeat(500);

    fireEvent.change(textarea, { target: { value: longInput } });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    const statusEl = screen.getByRole("status");
    // エラーメッセージではなく SVG が描画されること
    expect(statusEl.innerHTML).toContain("<svg");
  });

  // (vi) DL ボタンの click ハンドラ: <a> 要素が download=qrcode.png + href が data:image/png で始まる
  it("(vi) DL ボタンクリック時に download=qrcode.png かつ href が data:image/png で始まる <a> 要素が生成される", () => {
    render(<QrCodeTile />);
    const textarea = screen.getByRole("textbox");

    fireEvent.change(textarea, { target: { value: "https://yolos.net" } });
    // fake timers 環境: debounce 300ms を経過させてから DL ボタンの活性化を確認する
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // getByRole で同期的に DL ボタンを取得（fake timers 環境では findByRole の非同期待機は避ける）
    const dlButton = screen.getByRole("button", { name: /PNG/i });
    expect(dlButton).not.toBeDisabled();

    // document.createElement をスパイして生成された <a> 要素の属性を検証する
    const createdElements: HTMLElement[] = [];
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(
      (tag: string, ...args: unknown[]) => {
        const el = originalCreateElement(tag, ...(args as []));
        if (tag === "a") {
          createdElements.push(el);
        }
        return el;
      },
    );

    fireEvent.click(dlButton);

    // <a> 要素が生成されていることを確認
    const anchorEl = createdElements.find(
      (el): el is HTMLAnchorElement => el instanceof HTMLAnchorElement,
    );
    expect(anchorEl).toBeDefined();
    expect(anchorEl?.getAttribute("download")).toBe("qrcode.png");
    expect(anchorEl?.getAttribute("href")).toMatch(/^data:image\/png/);
  });
});
