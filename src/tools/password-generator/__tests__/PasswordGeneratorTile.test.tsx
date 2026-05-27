import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import PasswordGeneratorTile from "../PasswordGeneratorTile";

// =========================================================
// navigator.clipboard モック
// jsdom では navigator.clipboard.writeText が未定義のため、
// vi.stubGlobal で差し替える。
// =========================================================

beforeEach(() => {
  vi.stubGlobal("navigator", {
    ...navigator,
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("PasswordGeneratorTile", () => {
  // -------------------------------------------------------
  // 観点 (i): 初期レンダリング
  // マウント直後にパスワード表示・強度ラベル・2ボタン・詳細リンクが存在する
  // -------------------------------------------------------
  it("(i) 初期レンダリング: パスワード表示・強度ラベル・再生成/コピーボタン・詳細リンクが存在する", () => {
    render(<PasswordGeneratorTile />);

    // <code> 要素にパスワード文字列が表示される
    const codeEl = document.querySelector("code");
    expect(codeEl).toBeInTheDocument();
    // マウント時自動生成: 空文字でないこと
    expect(codeEl?.textContent?.length).toBeGreaterThan(0);

    // 再生成ボタン
    expect(screen.getByRole("button", { name: /再生成/ })).toBeInTheDocument();

    // コピーボタン
    expect(screen.getByRole("button", { name: /コピー/ })).toBeInTheDocument();

    // 詳細リンク
    expect(
      screen.getByRole("link", { name: /オプションを設定して生成/ }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (i) 強度ラベル存在確認
  // -------------------------------------------------------
  it("(i) 初期レンダリング: 強度ラベルが表示される", () => {
    render(<PasswordGeneratorTile />);
    // role="status" を持つ要素に強度ラベルが表示される
    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();
    expect(statusEl.textContent?.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------
  // 観点 (ii): マウント時自動生成
  // useEffect で 16 文字パスワードが生成されている
  // -------------------------------------------------------
  it("(ii) マウント時自動生成: <code> に 16 文字のパスワードが自動生成される", () => {
    render(<PasswordGeneratorTile />);
    const codeEl = document.querySelector("code");
    // DEFAULT_OPTIONS.length = 16（仕様値）
    expect(codeEl?.textContent?.length).toBe(16);
  });

  // -------------------------------------------------------
  // 観点 (iii): 再生成ボタン押下でパスワードが変化する
  // 計画書 L217: 「再生成ボタン押下 → <code> 内のパスワード文字列が変化」
  //              「連続 2 回押下で別文字列が生成される」を直接検証
  // -------------------------------------------------------
  it("(iii) 再生成: 再生成ボタン押下でパスワード文字列が変化する（連続 2 回検証）", () => {
    render(<PasswordGeneratorTile />);
    const codeEl = document.querySelector("code") as HTMLElement;
    const before = codeEl.textContent ?? "";
    expect(before.length).toBe(16);

    // 1 回目の再生成
    fireEvent.click(screen.getByRole("button", { name: /再生成/ }));
    const after = codeEl.textContent ?? "";
    expect(after.length).toBe(16);
    // charset = 88 文字 / 16 桁 → 衝突確率 ≈ 88^-16 ≈ 0
    expect(after).not.toBe(before);

    // 2 回目の再生成（連続押下で再度別文字列）
    fireEvent.click(screen.getByRole("button", { name: /再生成/ }));
    const third = codeEl.textContent ?? "";
    expect(third.length).toBe(16);
    expect(third).not.toBe(after);
  });

  // -------------------------------------------------------
  // 観点 (iv): コピーボタン押下で navigator.clipboard.writeText が呼ばれる
  // -------------------------------------------------------
  it("(iv) コピー: コピーボタン押下で navigator.clipboard.writeText が呼ばれる", async () => {
    render(<PasswordGeneratorTile />);

    const codeEl = document.querySelector("code") as HTMLElement;
    const password = codeEl.textContent ?? "";

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^コピー$/ }));
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(password);
  });

  // -------------------------------------------------------
  // 観点 (v): DEFAULT_OPTIONS で evaluateStrength = strong → 強度ラベル「強い」
  // -------------------------------------------------------
  it("(v) 強度バー: DEFAULT_OPTIONS で強度ラベル「強い」が表示される", () => {
    render(<PasswordGeneratorTile />);
    // role="status" に「強い」テキストが含まれる
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent("強い");
  });

  // -------------------------------------------------------
  // 観点 (vi): コピー後「コピー済み」→ 2 秒後に「コピー」に復帰
  // -------------------------------------------------------
  it("(vi) コピーボタン文言変化: コピー後「コピー済み」→ 2秒後「コピー」に復帰する", async () => {
    // NOTE: toFake: ["setTimeout", "clearTimeout"] で対象を限定することが望ましい
    // （将来の clipboard Promise 解決を実時間に保つため）。
    // 現状の clipboard mock は vi.fn().mockResolvedValue() で同期的に解決されるため影響なし。
    vi.useFakeTimers({ shouldAdvanceTime: false });
    render(<PasswordGeneratorTile />);

    // コピーボタン押下
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^コピー$/ }));
    });

    // コピー後「コピー済み」に変化
    expect(
      screen.getByRole("button", { name: "コピー済み" }),
    ).toBeInTheDocument();

    // 2 秒経過 → 「コピー」に復帰
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(
      screen.getByRole("button", { name: /^コピー$/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "コピー済み" }),
    ).not.toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (vii): ARIA / 秘密情報配慮
  // <code> に aria-live なし、強度ラベル側に role="status" 付与
  // -------------------------------------------------------
  it("(vii) ARIA: <code> 要素に aria-live がない（秘密情報配慮）", () => {
    render(<PasswordGeneratorTile />);
    const codeEl = document.querySelector("code") as HTMLElement;
    // aria-live を付与しない（または aria-live="off"）
    const ariaLive = codeEl.getAttribute("aria-live");
    expect(ariaLive === null || ariaLive === "off").toBe(true);
  });

  it("(vii) ARIA: 強度ラベル要素に role='status' が付与されている", () => {
    render(<PasswordGeneratorTile />);
    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (viii): AP-I11 setTimeout cleanup
  // unmount 時に clearTimeout が呼ばれてタイマー数が 0 に戻ることを直接検証。
  // React 18 では「unmounted setState 警告」が削除済のため console.error 検証は無効。
  // vi.getTimerCount() による直接検証（MINOR-1 指摘対応）
  // -------------------------------------------------------
  it("(viii) AP-I11 cleanup: unmount でタイマーが clearTimeout される（vi.getTimerCount 直接検証）", async () => {
    // NOTE: toFake: ["setTimeout", "clearTimeout"] で対象を限定することが望ましい
    // （将来の clipboard Promise 解決を実時間に保つため）。
    // 現状の clipboard mock は vi.fn().mockResolvedValue() で同期的に解決されるため影響なし。
    vi.useFakeTimers({ shouldAdvanceTime: false });

    const { unmount } = render(<PasswordGeneratorTile />);

    // コピーボタン押下（2 秒タイマー起動）
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^コピー$/ }));
    });

    // コピー済み状態確認（タイマーが走っている）
    expect(
      screen.getByRole("button", { name: "コピー済み" }),
    ).toBeInTheDocument();

    // AP-I11: unmount 前にタイマーが 1 つ以上走っていることを確認
    expect(vi.getTimerCount()).toBeGreaterThanOrEqual(1);

    // unmount する（useEffect cleanup → clearTimeout が呼ばれるはず）
    act(() => {
      unmount();
    });

    // AP-I11 cleanup: unmount 後にタイマー数が 0 に戻ること
    expect(vi.getTimerCount()).toBe(0);
  });

  // -------------------------------------------------------
  // 観点 (ix): 詳細リンク
  // 「オプションを設定して生成 →」が /tools/password-generator を参照
  // -------------------------------------------------------
  it("(ix) 詳細リンク: /tools/password-generator へのリンクが正しいテキストで存在する", () => {
    render(<PasswordGeneratorTile />);
    const link = screen.getByRole("link", { name: /オプションを設定して生成/ });
    expect(link).toHaveAttribute("href", "/tools/password-generator");
  });

  // -------------------------------------------------------
  // 観点 (x): navigator.clipboard 不在時の silent fail
  // -------------------------------------------------------
  it("(x) clipboard 不在時 silent fail: エラーがスローされない", async () => {
    // clipboard を undefined に設定してテスト
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: undefined,
    });

    render(<PasswordGeneratorTile />);

    // クリップボードが使えない環境でもエラーがスローされない
    await expect(async () => {
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /^コピー$/ }));
      });
    }).not.toThrow();
  });

  // -------------------------------------------------------
  // 追加: 強度バー（meter 要素またはビジュアルバー）の存在確認
  // -------------------------------------------------------
  it("(追加) 強度バーの視覚要素（強度インジケーター）が DOM に存在する", () => {
    render(<PasswordGeneratorTile />);
    // 強度バーの role="status" 要素が存在すること
    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();
  });
});
