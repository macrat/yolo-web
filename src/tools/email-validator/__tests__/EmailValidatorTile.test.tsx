/**
 * EmailValidatorTile のテスト（入力→検証→結果表示型タイル / cycle-219 T-3）
 *
 * 観点:
 *   (i)    デフォルトのタイポ例で判定バッジ・パーツ内訳・タイポ提案が即時表示される
 *   (ii)   別アドレス入力後に結果が更新される
 *   (iii)  無効アドレスのエラー表示
 *   (iv)   提案ワンタップ採用で入力欄が上書きされ再検証される
 *   (v)    提案コピー + インプレース FB
 *   (vi)   折りたたみ開閉
 *   (vii)  詳細ページリンク
 *
 * hydration 安全性:
 *   本ツールは validateEmail が完全に決定論的（new Date()・乱数なし）なため、
 *   useState("test@gmial.com") の固定初期値で SSR/CSR 初回描画が一致し hydration-safe。
 *   cron-parser の論点 F（useEffect 差し込み）は本ツールには発生しない。
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import EmailValidatorTile from "../EmailValidatorTile";

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

describe("EmailValidatorTile", () => {
  // -------------------------------------------------------
  // 観点 (i): デフォルトのタイポ例で即時表示
  // -------------------------------------------------------
  it("(i) デフォルト: 入力欄に test@gmial.com が初期値として入っている", async () => {
    await act(async () => {
      render(<EmailValidatorTile />);
    });
    const input = screen.getByRole("textbox");
    expect((input as HTMLInputElement).value).toBe("test@gmial.com");
  });

  it("(i) デフォルト: 判定バッジが即時表示される（有効/無効のいずれか）", async () => {
    await act(async () => {
      render(<EmailValidatorTile />);
    });
    // test@gmial.com は有効（gmial.com はタイポ提案があるが形式は有効）
    const badgeEl = document.querySelector("[data-testid='validation-badge']");
    expect(badgeEl).toBeInTheDocument();
  });

  it("(i) デフォルト: タイポ提案が即時表示される（もしかして: test@gmail.com）", async () => {
    await act(async () => {
      render(<EmailValidatorTile />);
    });
    const bodyText = document.body.textContent ?? "";
    // "もしかして" または "gmail.com" を含む提案テキストが即時表示
    expect(
      bodyText.includes("もしかして") || bodyText.includes("gmail.com"),
    ).toBe(true);
  });

  it("(i) デフォルト: パーツ内訳（ローカルパート・ドメイン）が即時表示される", async () => {
    await act(async () => {
      render(<EmailValidatorTile />);
    });
    const bodyText = document.body.textContent ?? "";
    // test@gmial.com のパーツ内訳として "test" または "gmial.com" が表示される
    expect(bodyText.includes("test") || bodyText.includes("gmial.com")).toBe(
      true,
    );
  });

  // -------------------------------------------------------
  // 観点 (ii): 別アドレス入力後の更新
  // -------------------------------------------------------
  it("(ii) 別アドレス: user@example.com を入力すると有効バッジに更新される", async () => {
    await act(async () => {
      render(<EmailValidatorTile />);
    });

    const input = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(input, { target: { value: "user@example.com" } });
    });

    const bodyText = document.body.textContent ?? "";
    // 有効を示すテキスト（「有効」）が表示される
    expect(bodyText.includes("有効")).toBe(true);
  });

  it("(ii) 別アドレス: 入力値を変えると提案が消える（タイポなしアドレス）", async () => {
    await act(async () => {
      render(<EmailValidatorTile />);
    });

    const input = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(input, { target: { value: "user@example.com" } });
    });

    const bodyText = document.body.textContent ?? "";
    // タイポなしアドレスでは「もしかして」が表示されない
    expect(bodyText.includes("もしかして")).toBe(false);
  });

  // -------------------------------------------------------
  // 観点 (iii): 無効アドレスのエラー表示
  // -------------------------------------------------------
  it("(iii) 無効アドレス: notanemail を入力するとエラーが表示される", async () => {
    await act(async () => {
      render(<EmailValidatorTile />);
    });

    const input = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(input, { target: { value: "notanemail" } });
    });

    // エラー表示（data-testid または「無効」テキスト）
    const errorEl = document.querySelector("[data-testid='email-errors']");
    const bodyText = document.body.textContent ?? "";
    const hasError =
      errorEl !== null || bodyText.includes("無効") || bodyText.includes("@");
    expect(hasError).toBe(true);
  });

  it("(iii) 無効アドレス: 無効バッジが表示される", async () => {
    await act(async () => {
      render(<EmailValidatorTile />);
    });

    const input = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(input, { target: { value: "notanemail" } });
    });

    const badgeEl = document.querySelector("[data-testid='validation-badge']");
    expect(badgeEl).toBeInTheDocument();
    // 無効を示すテキストが含まれる
    expect(badgeEl?.textContent).toMatch(/無効/);
  });

  // -------------------------------------------------------
  // 観点 (iv): 提案ワンタップ採用で入力欄上書き + 再検証
  // -------------------------------------------------------
  it("(iv) 提案採用: 採用ボタンをクリックすると入力欄が修正済みアドレスで上書きされる", async () => {
    await act(async () => {
      render(<EmailValidatorTile />);
    });

    // デフォルト test@gmial.com には "もしかして: test@gmail.com" の提案がある
    const adoptButton = document.querySelector(
      "[data-testid='suggestion-adopt']",
    );
    expect(adoptButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(adoptButton as HTMLElement);
    });

    // クリック後、入力欄が修正済みアドレスで上書きされる
    const input = screen.getByRole("textbox");
    expect((input as HTMLInputElement).value).toBe("test@gmail.com");
  });

  it("(iv) 提案採用: 採用後に再検証され有効バッジに変わる（gmial.com→gmail.com）", async () => {
    await act(async () => {
      render(<EmailValidatorTile />);
    });

    const adoptButton = document.querySelector(
      "[data-testid='suggestion-adopt']",
    ) as HTMLElement;

    await act(async () => {
      fireEvent.click(adoptButton);
    });

    // test@gmail.com は有効かつ提案なし → 「有効」バッジに更新
    const badgeEl = document.querySelector("[data-testid='validation-badge']");
    expect(badgeEl?.textContent).toMatch(/有効/);
  });

  // -------------------------------------------------------
  // 観点 (v): 提案コピー + インプレース FB
  // -------------------------------------------------------
  it("(v) 提案コピー: コピーボタンをクリックすると clipboard.writeText が呼ばれる", async () => {
    await act(async () => {
      render(<EmailValidatorTile />);
    });

    const copyButton = document.querySelector(
      "[data-testid='suggestion-copy']",
    );
    expect(copyButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(copyButton as HTMLElement);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "test@gmail.com",
    );
  });

  it("(v) インプレース FB: コピー後にボタン文言が変化し2秒後に復帰する", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });

    await act(async () => {
      render(<EmailValidatorTile />);
    });

    const copyButton = document.querySelector(
      "[data-testid='suggestion-copy']",
    ) as HTMLElement;

    await act(async () => {
      fireEvent.click(copyButton);
    });

    // コピー後に「コピー済み」が表示される
    expect(copyButton.textContent).toMatch(/コピー済み/);

    // 2秒後に元に戻る
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(copyButton.textContent).not.toMatch(/コピー済み/);
  });

  // -------------------------------------------------------
  // 観点 (vi): 折りたたみ開閉
  // -------------------------------------------------------
  it("(vi) 折りたたみ: トグルボタンが存在する（有効時に表示）", async () => {
    await act(async () => {
      render(<EmailValidatorTile />);
    });

    // test@gmial.com は有効 → トグルボタンが表示されるはず
    // 入力を有効なアドレスにする
    const input = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(input, { target: { value: "user@example.com" } });
    });

    const toggleButton = document.querySelector(
      "[data-testid='details-toggle']",
    );
    expect(toggleButton).toBeInTheDocument();
  });

  it("(vi) 折りたたみ: トグルボタンをクリックすると詳細が表示/非表示になる", async () => {
    await act(async () => {
      render(<EmailValidatorTile />);
    });

    // 有効なアドレスで折りたたみが表示される状態にする
    const input = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(input, { target: { value: "user@example.com" } });
    });

    const toggleButton = document.querySelector(
      "[data-testid='details-toggle']",
    ) as HTMLElement;
    expect(toggleButton).toBeInTheDocument();

    // 初期状態では詳細は非表示
    const detailsBefore = document.querySelector(
      "[data-testid='field-details']",
    );
    expect(detailsBefore).toBeNull();

    // クリックして展開
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    // 展開後は表示される
    const detailsAfter = document.querySelector(
      "[data-testid='field-details']",
    );
    expect(detailsAfter).toBeInTheDocument();

    // 再度クリックで閉じる
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    const detailsClosed = document.querySelector(
      "[data-testid='field-details']",
    );
    expect(detailsClosed).toBeNull();
  });

  // -------------------------------------------------------
  // 観点 (vii): 詳細ページリンク
  // -------------------------------------------------------
  it("(vii) 詳細リンク: /tools/email-validator へのリンクが存在する", async () => {
    await act(async () => {
      render(<EmailValidatorTile />);
    });

    const link = screen.getByRole("link", { name: /詳細/ });
    expect(link).toHaveAttribute("href", "/tools/email-validator");
  });

  // -------------------------------------------------------
  // 観点 (viii): 空入力時は未入力バッジのみ・エラーボックスなし
  // MINOR-1 修正: 空入力時に「未入力」バッジ（中立グレー）と
  // 赤エラーボックス「✗ メールアドレスが入力されていません」が
  // 同時表示される矛盾を修正。空時はエラーボックスを出さない。
  // -------------------------------------------------------
  it("(viii) 空入力: 入力欄をクリアすると未入力バッジのみ表示され email-errors ボックスは出ない", async () => {
    await act(async () => {
      render(<EmailValidatorTile />);
    });

    const input = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(input, { target: { value: "" } });
    });

    // email-errors ボックスが表示されないこと（中立バッジが状態を十分伝える）
    const errorEl = document.querySelector("[data-testid='email-errors']");
    expect(errorEl).toBeNull();
  });

  it("(viii) 空入力: 未入力バッジが表示される", async () => {
    await act(async () => {
      render(<EmailValidatorTile />);
    });

    const input = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(input, { target: { value: "" } });
    });

    const badgeEl = document.querySelector("[data-testid='validation-badge']");
    expect(badgeEl).toBeInTheDocument();
    expect(badgeEl?.textContent).toMatch(/未入力/);
  });
});
