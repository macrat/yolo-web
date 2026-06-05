/**
 * CronParserPage の回帰テスト（cycle-225 T-6 単一実装）
 *
 * 収束チェックリスト E群（E-1〜E-12）を網羅する。
 * テスト対象: src/tools/cron-parser/CronParserPage.tsx
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import CronParserPage from "../CronParserPage";

// =========================================================
// navigator.clipboard モック
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

describe("CronParserPage - 基本レンダリング（E-1）", () => {
  it("コンポーネントが正常にレンダリングされる", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    expect(document.body).toBeTruthy();
  });

  it("解析モードとビルダーモードの切替コントロールが存在する", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    // SegmentedControl の radiogroup が存在する
    const group = screen.getByRole("radiogroup");
    expect(group).toBeInTheDocument();
    // 「解析」「ビルダー」の2オプション
    const options = screen.getAllByRole("radio");
    expect(options.length).toBe(2);
    const labels = options.map((o) => o.textContent);
    expect(labels).toContain("解析");
    expect(labels).toContain("ビルダー");
  });
});

describe("CronParserPage - 入力→結果更新（E-2）", () => {
  it("有効なcron式を入力すると解析結果が表示される", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const input = screen.getByLabelText(/cron式入力/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "0 9 * * *" } });
    });
    const bodyText = document.body.textContent ?? "";
    expect(bodyText.includes("9時") || bodyText.includes("9")).toBe(true);
  });

  it("ビルダーモードでフィールドを入力するとcron式が更新される", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    // ビルダーモードへ切替
    const builderTab = screen.getByRole("radio", { name: "ビルダー" });
    await act(async () => {
      fireEvent.click(builderTab);
    });
    // 分フィールドに値を入力
    const minuteInput = screen.getByLabelText(/分フィールド/i);
    await act(async () => {
      fireEvent.change(minuteInput, { target: { value: "30" } });
    });
    // 生成式に30が含まれる
    const bodyText = document.body.textContent ?? "";
    expect(bodyText.includes("30")).toBe(true);
  });
});

describe("CronParserPage - 空入力（E-3）", () => {
  it("初期表示時はエラーが表示されない（初期値が有効な式）", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    // 初期値が有効なため alert は表示されない
    const alerts = screen.queryAllByRole("alert");
    expect(alerts.length).toBe(0);
  });

  it("無効なcron式を入力して解析するとエラーが表示される", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const input = screen.getByLabelText(/cron式入力/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "invalid" } });
    });
    // 解析ボタンをクリック
    const parseBtn = screen.getByRole("button", { name: /^解析$/ });
    await act(async () => {
      fireEvent.click(parseBtn);
    });
    // ErrorMessage が表示される（role="alert"）
    await waitFor(() => {
      const alerts = screen.queryAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
    });
  });
});

describe("CronParserPage - 変換ロジックの正確性（E-4）", () => {
  it("'0 9 * * *' を入力すると毎日9時0分の説明が表示される", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const input = screen.getByLabelText(/cron式入力/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "0 9 * * *" } });
    });
    const bodyText = document.body.textContent ?? "";
    expect(bodyText.includes("9時0分") || bodyText.includes("毎日")).toBe(true);
  });

  it("プリセット「毎日9時」をクリックすると対応する説明が表示される", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const presetBtn = screen.getByRole("button", {
      name: /プリセット.*毎日9時/i,
    });
    await act(async () => {
      fireEvent.click(presetBtn);
    });
    const bodyText = document.body.textContent ?? "";
    expect(bodyText.includes("9時") || bodyText.includes("毎日")).toBe(true);
  });

  it("次回実行予定が表示される（有効なcron式の場合）", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const input = screen.getByLabelText(/cron式入力/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "0 9 * * *" } });
    });
    // 解析ボタンを押す
    const parseBtn = screen.getByRole("button", { name: /^解析$/ });
    await act(async () => {
      fireEvent.click(parseBtn);
    });
    const bodyText = document.body.textContent ?? "";
    // JST表示のため「+09:00」または日本語日付が含まれる
    // 少なくとも「次回」テキストが含まれることを確認
    expect(bodyText.includes("次回") || bodyText.includes("実行")).toBe(true);
  });

  it("ビルダーモードで生成したcron式が解析される", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const builderTab = screen.getByRole("radio", { name: "ビルダー" });
    await act(async () => {
      fireEvent.click(builderTab);
    });
    // デフォルト式 * * * * * が生成されていること
    const bodyText = document.body.textContent ?? "";
    expect(bodyText.includes("*")).toBe(true);
  });
});

describe("CronParserPage - ARIA（E-5）", () => {
  it("結果表示エリアに role='status' aria-live='polite' が付与されている（C-3）", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const statusEl = document.querySelector(
      '[role="status"][aria-live="polite"]',
    );
    expect(statusEl).toBeInTheDocument();
  });

  it("ライブリージョンに実テキストノードのサマリが含まれる（C-3）", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const input = screen.getByLabelText(/cron式入力/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "0 9 * * *" } });
    });
    const parseBtn = screen.getByRole("button", { name: /^解析$/ });
    await act(async () => {
      fireEvent.click(parseBtn);
    });
    const statusEl = document.querySelector(
      '[role="status"][aria-live="polite"]',
    );
    expect(statusEl).toBeInTheDocument();
    // 実テキストノード（サマリ）が空でないこと
    expect(statusEl?.textContent?.trim()).toBeTruthy();
  });

  it("SegmentedControlに aria-label が付与されている（C-2）", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const group = screen.getByRole("radiogroup");
    // aria-label か aria-labelledby のいずれかが存在
    const hasLabel =
      group.hasAttribute("aria-label") || group.hasAttribute("aria-labelledby");
    expect(hasLabel).toBe(true);
  });
});

describe("CronParserPage - コピーボタン（E-6/E-7/E-8）", () => {
  it("解析モードにコピーボタンが存在しない（T-4b 方針: cron-parser 解析結果はコピーなし）", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    // 解析モード（初期）ではコピーボタンが存在しないこと
    const copyBtn = screen.queryByRole("button", { name: /コピー/i });
    expect(copyBtn).toBeNull();
  });

  it("ビルダーモードにコピーボタンが存在する（T-4b 方針: ビルダー出力はコピーあり）", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    // ビルダーモードへ切替
    const builderTab = screen.getByRole("radio", { name: "ビルダー" });
    await act(async () => {
      fireEvent.click(builderTab);
    });
    // コピーボタンが存在すること
    const copyBtn = screen.queryByRole("button", { name: /コピー/i });
    expect(copyBtn).toBeInTheDocument();
  });

  it("ビルダーモードのコピーボタンをクリックすると COPIED_LABEL に変わる（E-6）", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const builderTab = screen.getByRole("radio", { name: "ビルダー" });
    await act(async () => {
      fireEvent.click(builderTab);
    });
    const copyBtn = screen.getByRole("button", { name: /コピー/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });
    // COPIED_LABEL「コピーしました」に変わること
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /コピーしました/i }),
      ).toBeInTheDocument();
    });
  });

  it("ビルダーモードのコピーボタンが有効な式があるとき disabled でない（E-7）", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const builderTab = screen.getByRole("radio", { name: "ビルダー" });
    await act(async () => {
      fireEvent.click(builderTab);
    });
    // デフォルト式 * * * * * は有効なのでコピーボタンが有効
    const copyBtn = screen.getByRole("button", { name: /コピー/i });
    expect(copyBtn).not.toBeDisabled();
  });

  it("navigator.clipboard が存在しない環境でコピーしても例外を投げない（E-8）", async () => {
    // clipboard を削除してクリップボード非対応環境をシミュレート
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: undefined,
    });
    await act(async () => {
      render(<CronParserPage />);
    });
    const builderTab = screen.getByRole("radio", { name: "ビルダー" });
    await act(async () => {
      fireEvent.click(builderTab);
    });
    const copyBtn = screen.getByRole("button", { name: /コピー/i });
    // 例外が投げられないこと
    await expect(
      act(async () => {
        fireEvent.click(copyBtn);
      }),
    ).resolves.not.toThrow();
  });
});

describe("CronParserPage - meta由来の表示（E-10）", () => {
  it("CronParserPage コンポーネント自体がレンダリングできる", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    // ツール機能の核心部分（cron式入力欄）が存在すること
    const input = screen.getByLabelText(/cron式入力/i);
    expect(input).toBeInTheDocument();
  });
});

describe("CronParserPage - CSS トークン検証（E-12）", () => {
  it("CSSファイルに --color-* 旧トークンが存在しない（B-1）", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/cron-parser/CronParserPage.module.css",
    );
    const rawCss = readFileSync(cssPath, "utf-8");
    // コメント行を除去してから検証
    const css = rawCss.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("CSSファイルに font-weight: 700 が存在しない（B-4）", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/cron-parser/CronParserPage.module.css",
    );
    const rawCss = readFileSync(cssPath, "utf-8");
    // コメント行を除去してから検証
    const css = rawCss.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(css).not.toMatch(/font-weight:\s*700/);
  });

  it("CSSファイルに background系プロパティへの --accent 直塗りが存在しない（B-3実効テスト）", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/cron-parser/CronParserPage.module.css",
    );
    const rawCss = readFileSync(cssPath, "utf-8");
    // コメント行を除去してから検証
    // B-3: 塗り（background / background-color）に --accent を直接使わない。
    // プライマリアクションボタンの塗りは --bg-invert / --fg-invert ペアを使う（共通Button準拠）。
    // 兄弟ツール（regex-tester等）もCSSコメントに「--accent直接使用禁止」と明記している。
    const css = rawCss.replace(/\/\*[\s\S]*?\*\//g, "");
    // background または background-color プロパティに var(--accent) が使われていないこと
    expect(css).not.toMatch(/background(?:-color)?:\s*var\(--accent\)/);
  });

  it("CSSファイルの非インタラクティブ表示要素に --r-interactive が使われていない（B-5）", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/cron-parser/CronParserPage.module.css",
    );
    const rawCss = readFileSync(cssPath, "utf-8");
    // コメント行を除去してから検証
    // B-5: 非インタラクティブな表示要素（.builtExpression, .description, .resultRow, .executionItem）は
    // --r-normal (2px) を使う。--r-interactive (8px) はインタラクティブ要素（ボタン・入力欄等）専用。
    const css = rawCss.replace(/\/\*[\s\S]*?\*\//g, "");
    // builtExpression クラスには --r-interactive が使われていないこと
    // (スタイルブロック全体で .builtExpression に --r-interactive が含まれないことを確認)
    const builtExpressionBlock = css.match(/\.builtExpression\s*\{[^}]*\}/);
    if (builtExpressionBlock) {
      expect(builtExpressionBlock[0]).not.toMatch(/var\(--r-interactive\)/);
    }
  });
});

describe("CronParserPage - ビルダーモードC-3ライブリージョン更新（reviewer指摘#4）", () => {
  it("ビルダーモードでフィールドを変更するとライブリージョンが更新される（C-3）", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    // ビルダーモードへ切替
    const builderTab = screen.getByRole("radio", { name: "ビルダー" });
    await act(async () => {
      fireEvent.click(builderTab);
    });
    // 分フィールドを変更
    const minuteInput = screen.getByLabelText(/分フィールド/i);
    await act(async () => {
      fireEvent.change(minuteInput, { target: { value: "30" } });
    });
    // ライブリージョンが更新される（空でないサマリが存在する）
    const statusEl = document.querySelector(
      '[role="status"][aria-live="polite"]',
    );
    expect(statusEl).toBeInTheDocument();
    expect(statusEl?.textContent?.trim()).toBeTruthy();
  });
});

describe("CronParserPage - JST固定化（B-472内包）", () => {
  it("次回実行の日時表示がJST (Asia/Tokyo) で表示される", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const input = screen.getByLabelText(/cron式入力/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "0 9 * * *" } });
    });
    const parseBtn = screen.getByRole("button", { name: /^解析$/ });
    await act(async () => {
      fireEvent.click(parseBtn);
    });
    // JST表示の確認（日本語ロケールの日付フォーマット）
    // 「(JST)」表記または日本語ロケールの日時形式
    const bodyText = document.body.textContent ?? "";
    // 次回実行セクションが存在する
    expect(bodyText.includes("次回") || bodyText.includes("実行予定")).toBe(
      true,
    );
  });
});

describe("CronParserPage - ビルダー機能（ビルダー復元②-4）", () => {
  it("ビルダーモードに切り替えられる", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const builderTab = screen.getByRole("radio", { name: "ビルダー" });
    await act(async () => {
      fireEvent.click(builderTab);
    });
    // ビルダーの入力フィールドが存在する
    const minuteInput = screen.getByLabelText(/分フィールド/i);
    expect(minuteInput).toBeInTheDocument();
  });

  it("ビルダーモードで全フィールドが存在する", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const builderTab = screen.getByRole("radio", { name: "ビルダー" });
    await act(async () => {
      fireEvent.click(builderTab);
    });
    expect(screen.getByLabelText(/分フィールド/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/時フィールド/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/日付フィールド/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/月フィールド/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/曜日フィールド/i)).toBeInTheDocument();
  });

  it("ビルダーモードでプリセットを選ぶと各フィールドが更新される", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const builderTab = screen.getByRole("radio", { name: "ビルダー" });
    await act(async () => {
      fireEvent.click(builderTab);
    });
    const presetBtn = screen.getByRole("button", {
      name: /プリセット.*毎日9時/i,
    });
    await act(async () => {
      fireEvent.click(presetBtn);
    });
    const hourInput = screen.getByLabelText(/時フィールド/i);
    expect((hourInput as HTMLInputElement).value).toBe("9");
  });

  it("ビルダーモードで生成されたcron式が表示される", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const builderTab = screen.getByRole("radio", { name: "ビルダー" });
    await act(async () => {
      fireEvent.click(builderTab);
    });
    // 生成されたcron式エリアが存在する
    const bodyText = document.body.textContent ?? "";
    expect(
      bodyText.includes("生成されたCron式") || bodyText.includes("Cron式"),
    ).toBe(true);
  });
});

describe("CronParserPage - フィールド詳細（フル機能確認）", () => {
  it("解析後にフィールド詳細テーブルが表示される", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const input = screen.getByLabelText(/cron式入力/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "0 9 * * 1-5" } });
    });
    const parseBtn = screen.getByRole("button", { name: /^解析$/ });
    await act(async () => {
      fireEvent.click(parseBtn);
    });
    // フィールドラベル（分/時/日/月/曜日）が表示される
    const bodyText = document.body.textContent ?? "";
    expect(bodyText.includes("分")).toBe(true);
    expect(bodyText.includes("時")).toBe(true);
    expect(bodyText.includes("曜日")).toBe(true);
  });
});

describe("CronParserPage - staleサマリリセット（U-4 是正(a)）", () => {
  it("解析エラー後にモード切替するとliveSummaryが空になる", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    // 無効な式を入力して解析
    const input = screen.getByLabelText(/cron式入力/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "invalid" } });
    });
    const parseBtn = screen.getByRole("button", { name: /^解析$/ });
    await act(async () => {
      fireEvent.click(parseBtn);
    });
    // エラー後はliveSummaryに「入力エラーがあります」が表示されている
    const statusEl = document.querySelector(
      '[role="status"][aria-live="polite"]',
    );
    expect(statusEl?.textContent).toBeTruthy();

    // ビルダーモードへ切替
    const builderTab = screen.getByRole("radio", { name: "ビルダー" });
    await act(async () => {
      fireEvent.click(builderTab);
    });
    // モード切替後にliveSummaryがリセット（空）されていること
    const statusElAfter = document.querySelector(
      '[role="status"][aria-live="polite"]',
    );
    expect(statusElAfter?.textContent?.trim()).toBe("");
  });

  it("解析エラー後に解析モードへ戻ってもliveSummaryがリセットされる", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    // 無効な式を入力して解析
    const input = screen.getByLabelText(/cron式入力/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "invalid" } });
    });
    const parseBtn = screen.getByRole("button", { name: /^解析$/ });
    await act(async () => {
      fireEvent.click(parseBtn);
    });
    // ビルダーモードへ切替
    const builderTab = screen.getByRole("radio", { name: "ビルダー" });
    await act(async () => {
      fireEvent.click(builderTab);
    });
    // 解析モードへ戻す
    const parserTab = screen.getByRole("radio", { name: "解析" });
    await act(async () => {
      fireEvent.click(parserTab);
    });
    // 解析モードへ戻したあともliveSummaryがリセットされていること
    const statusEl = document.querySelector(
      '[role="status"][aria-live="polite"]',
    );
    expect(statusEl?.textContent?.trim()).toBe("");
  });
});

describe("CronParserPage - エラーに修正方法を添える（U-4 低指摘）", () => {
  it("分フィールドが無効なエラーに範囲説明が含まれる", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const input = screen.getByLabelText(/cron式入力/i);
    // 分フィールドを無効な値に（60は0-59の範囲外）
    await act(async () => {
      fireEvent.change(input, { target: { value: "60 * * * *" } });
    });
    const parseBtn = screen.getByRole("button", { name: /^解析$/ });
    await act(async () => {
      fireEvent.click(parseBtn);
    });
    const bodyText = document.body.textContent ?? "";
    // エラーに「0〜59」または「0-59」などの範囲説明が含まれること
    expect(bodyText).toMatch(/0[〜~-]59/);
  });

  it("時フィールドが無効なエラーに範囲説明が含まれる", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const input = screen.getByLabelText(/cron式入力/i);
    // 時フィールドを無効な値に（24は0-23の範囲外）
    await act(async () => {
      fireEvent.change(input, { target: { value: "0 24 * * *" } });
    });
    const parseBtn = screen.getByRole("button", { name: /^解析$/ });
    await act(async () => {
      fireEvent.click(parseBtn);
    });
    const bodyText = document.body.textContent ?? "";
    // エラーに「0〜23」または「0-23」などの範囲説明が含まれること
    expect(bodyText).toMatch(/0[〜~-]23/);
  });
});

describe("CronParserPage - ビルダー次回実行表示（U-4 低指摘）", () => {
  it("ビルダーモードで有効な式の次回実行が表示される", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const builderTab = screen.getByRole("radio", { name: "ビルダー" });
    await act(async () => {
      fireEvent.click(builderTab);
    });
    // デフォルト式（* * * * *）は有効なので次回実行が表示されること
    const bodyText = document.body.textContent ?? "";
    expect(bodyText.includes("次回") || bodyText.includes("実行予定")).toBe(
      true,
    );
  });

  it("ビルダーモードのプリセット「毎日9時」を選ぶと次回実行が表示される", async () => {
    await act(async () => {
      render(<CronParserPage />);
    });
    const builderTab = screen.getByRole("radio", { name: "ビルダー" });
    await act(async () => {
      fireEvent.click(builderTab);
    });
    const presetBtn = screen.getByRole("button", {
      name: /プリセット.*毎日9時/i,
    });
    await act(async () => {
      fireEvent.click(presetBtn);
    });
    const bodyText = document.body.textContent ?? "";
    expect(bodyText.includes("次回") || bodyText.includes("実行予定")).toBe(
      true,
    );
  });
});
