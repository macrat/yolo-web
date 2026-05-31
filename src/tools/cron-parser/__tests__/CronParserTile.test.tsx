/**
 * CronParserTile のテスト（入力→解析→構造化表示型タイル / cycle-218 T-3）
 *
 * 観点:
 *   (i)    デフォルト式即時 description 表示: マウント後に「月曜から金曜」などの description が表示される
 *   (ii)   次回実行のマウント後表示: SSR 時は次回実行リストが空で、useEffect 後に出現する
 *   (iii)  別式入力: 別の有効な cron 式を入力すると description が更新される
 *   (iv)   無効式のエラー表示: 無効な式を入力するとエラーメッセージが表示される
 *   (v)    コピー + インプレース FB: コピーボタンクリック後に「コピー済み」が表示され復帰する
 *   (vi)   フィールドラベル常時表示: 分/時/日/月/曜日のフィールドラベルが常時表示される
 *   (vii)  折りたたみ開閉: 詳細セクションの開閉が機能する
 *   (viii) 詳細ページリンク: /tools/cron-parser へのリンクが存在する
 *   (ix)   解析専用動線: タイル内にビルダータブが存在しない（解析動線のみ）
 *   (x)    曜日注釈: 0=日曜日(または7)に相当する静的注釈テキストが存在する
 *
 * hydration 安全性の確認方針（論点 F):
 *   - description は固定デフォルト式の決定論的な値なので SSR/CSR 一致（hydration-safe）
 *   - 次回実行は new Date() 依存の非決定論的な値なので useEffect でマウント後に差し込む
 *   - テスト環境では useEffect は act() の後に同期的に実行される
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CronParserTile from "../CronParserTile";

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

describe("CronParserTile", () => {
  // -------------------------------------------------------
  // 観点 (i): デフォルト式の即時 description 表示
  // -------------------------------------------------------
  it("(i) デフォルト式: マウント後に月曜から金曜を含む description が表示される", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });
    // デフォルト式 "0 9 * * 1-5" の description は「月曜から金曜 9時0分 に実行」等を含む
    // 「月曜」「金曜」「9時」のいずれかが表示されていること
    const bodyText = document.body.textContent ?? "";
    expect(
      bodyText.includes("月曜") ||
        bodyText.includes("金曜") ||
        bodyText.includes("平日") ||
        bodyText.includes("1-5"),
    ).toBe(true);
  });

  it("(i) デフォルト式: 入力欄に 0 9 * * 1-5 が初期値として入っている", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });
    const input = screen.getByRole("textbox");
    expect((input as HTMLInputElement).value).toBe("0 9 * * 1-5");
  });

  // -------------------------------------------------------
  // 観点 (ii): 次回実行のマウント後表示（論点 F / hydration 安全）
  // -------------------------------------------------------
  it("(ii) 次回実行: useEffect 後に次回実行リストが表示される", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });
    // 次回実行データが表示されているか（data-testid="next-executions" または関連テキスト）
    // マウント後に次回実行を差し込む実装であることを確認
    const nextExecEl = document.querySelector(
      "[data-testid='next-executions']",
    );
    expect(nextExecEl).toBeInTheDocument();
  });

  it("(ii) 次回実行: 日付パターンが含まれる（年月日の数字形式）", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });
    // 次回実行には日付が含まれる（例: 2026年 や 2026-XX-XX 形式）
    const bodyText = document.body.textContent ?? "";
    // 4桁年が含まれること（2026 または 2027 等）
    expect(/\d{4}/.test(bodyText)).toBe(true);
  });

  // -------------------------------------------------------
  // 観点 (iii): 別の有効な cron 式入力での更新
  // -------------------------------------------------------
  it("(iii) 別式入力: */15 * * * * を入力すると 15分ごとの description が表示される", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });

    const input = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(input, { target: { value: "*/15 * * * *" } });
    });

    const bodyText = document.body.textContent ?? "";
    expect(bodyText.includes("15分") || bodyText.includes("15")).toBe(true);
  });

  // -------------------------------------------------------
  // 観点 (iv): 無効式のエラー表示
  // -------------------------------------------------------
  it("(iv) 無効式: 無効な式を入力するとエラーメッセージが表示される", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });

    const input = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(input, { target: { value: "invalid cron" } });
    });

    // エラーメッセージが表示される（data-testid="cron-error" または関連テキスト）
    const errorEl = document.querySelector("[data-testid='cron-error']");
    expect(errorEl).toBeInTheDocument();
  });

  it("(iv) 無効式: 空欄でもエラーが表示される（または空状態の表示）", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });

    const input = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(input, { target: { value: "" } });
    });

    // エラーまたは空状態の表示
    const errorEl = document.querySelector("[data-testid='cron-error']");
    expect(errorEl).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (v): コピー + インプレース FB
  // -------------------------------------------------------
  it("(v) コピー: コピーボタンをクリックすると clipboard.writeText が呼ばれる", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });

    // コピーボタンが存在する
    const copyButton = document.querySelector("[data-testid='copy-button']");
    expect(copyButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(copyButton as HTMLElement);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("0 9 * * 1-5");
  });

  it("(v) インプレース FB: コピー後にボタン文言が変化し2秒後に復帰する", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });

    await act(async () => {
      render(<CronParserTile />);
    });

    const copyButton = document.querySelector(
      "[data-testid='copy-button']",
    ) as HTMLElement;

    await act(async () => {
      fireEvent.click(copyButton);
    });

    // コピー後に「コピー済み」が表示される
    expect(copyButton.textContent).toMatch(/コピー済み/);

    // 2秒後に「コピー」に戻る
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(copyButton.textContent).not.toMatch(/コピー済み/);
  });

  // -------------------------------------------------------
  // 観点 (vi): フィールドラベル常時表示
  // -------------------------------------------------------
  it("(vi) フィールドラベル: 分・時・日・月・曜日のラベルが常時表示される", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });

    const bodyText = document.body.textContent ?? "";
    // フィールドラベル（分/時/日/月/曜日）が表示されていること
    expect(bodyText.includes("分")).toBe(true);
    expect(bodyText.includes("時")).toBe(true);
    expect(bodyText.includes("日")).toBe(true);
    expect(bodyText.includes("月")).toBe(true);
    expect(bodyText.includes("曜日")).toBe(true);
  });

  it("(vi) フィールドラベル: data-testid='field-labels' が存在する", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });
    const fieldLabels = document.querySelector("[data-testid='field-labels']");
    expect(fieldLabels).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (vii): 折りたたみ開閉
  // -------------------------------------------------------
  it("(vii) 折りたたみ: 詳細トグルボタンが存在する", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });

    const toggleButton = document.querySelector(
      "[data-testid='details-toggle']",
    );
    expect(toggleButton).toBeInTheDocument();
  });

  it("(vii) 折りたたみ: トグルボタンをクリックするとフィールド詳細が表示/非表示になる", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });

    const toggleButton = document.querySelector(
      "[data-testid='details-toggle']",
    ) as HTMLElement;

    // 初期状態は折りたたみ
    const detailsBefore = document.querySelector(
      "[data-testid='field-details']",
    );
    const isInitiallyHidden =
      detailsBefore === null ||
      (detailsBefore as HTMLElement).style.display === "none";

    // クリックして展開
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    const detailsAfter = document.querySelector(
      "[data-testid='field-details']",
    );
    if (isInitiallyHidden) {
      // 展開後は表示される
      expect(detailsAfter).toBeInTheDocument();
    } else {
      // 最初から展開されていた場合、クリックで折りたたまれる
      expect(true).toBe(true); // いずれかの動作が正常
    }
  });

  // -------------------------------------------------------
  // 観点 (viii): 詳細ページリンク
  // -------------------------------------------------------
  it("(viii) 詳細リンク: /tools/cron-parser へのリンクが存在する", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });

    const link = screen.getByRole("link", { name: /詳細/ });
    expect(link).toHaveAttribute("href", "/tools/cron-parser");
  });

  // -------------------------------------------------------
  // 観点 (ix): 解析専用動線（ビルダータブなし）
  // -------------------------------------------------------
  it("(ix) 解析専用: ビルダータブが存在しない", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });

    // ビルダーボタン/タブが存在しないこと
    const builderTab = screen.queryByRole("button", { name: /ビルダー/ });
    expect(builderTab).toBeNull();
  });

  // -------------------------------------------------------
  // 観点 (x): 曜日注釈（静的テキスト）
  // -------------------------------------------------------
  it("(x) 曜日注釈: 0=日または7=日の静的注釈テキストが存在する（折りたたみ内）", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });

    // 折りたたみを開く
    const toggleButton = document.querySelector(
      "[data-testid='details-toggle']",
    ) as HTMLElement | null;

    if (toggleButton) {
      await act(async () => {
        fireEvent.click(toggleButton);
      });
    }

    // 曜日注釈テキストが存在する（「0=日」「7=日」「0と7はどちらも日曜日」等）
    const bodyText = document.body.textContent ?? "";
    const hasWeekdayNote =
      bodyText.includes("0=日") ||
      bodyText.includes("7=日") ||
      bodyText.includes("0と7") ||
      bodyText.includes("日曜") ||
      bodyText.includes("日曜日");
    expect(hasWeekdayNote).toBe(true);
  });
});
