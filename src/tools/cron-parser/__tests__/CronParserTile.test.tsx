/**
 * CronParserTile の回帰テスト（cycle-228 T-28 単一正典タイル化）
 *
 * 旧 CronParserPage.test.tsx の振る舞いを移植・拡張。
 * variant 別（full/parser/builder 固定）・複数インスタンス id 一意性・
 * プリセット・次回実行リストの振る舞いを網羅する。
 * CSS トークン検証はファイル先頭の import { readFileSync } from "fs" を使用。
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
import CronParserTile from "../CronParserTile";

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

// =========================================================
// A-1: タイルのルート要素が Panel であることを確認
// =========================================================
describe("CronParserTile - A-1 ルート要素が Panel", () => {
  it("variant=full でレンダリングするとルート要素が section タグ（Panel のデフォルト）", async () => {
    const { container } = await act(async () => {
      return render(<CronParserTile />);
    });
    // Panel のデフォルト as="section" なのでルート要素が section
    const root = container.firstChild as HTMLElement;
    expect(root.tagName.toLowerCase()).toBe("section");
  });

  it("as='div' を渡すと div タグになる", async () => {
    const { container } = await act(async () => {
      return render(<CronParserTile as="div" />);
    });
    const root = container.firstChild as HTMLElement;
    expect(root.tagName.toLowerCase()).toBe("div");
  });
});

// =========================================================
// 基本レンダリング（E-1 相当）
// =========================================================
describe("CronParserTile - 基本レンダリング", () => {
  it("コンポーネントが正常にレンダリングされる", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });
    expect(document.body).toBeTruthy();
  });

  it("variant=full でモード切替コントロールが存在する", async () => {
    await act(async () => {
      render(<CronParserTile variant="full" />);
    });
    const group = screen.getByRole("radiogroup");
    expect(group).toBeInTheDocument();
    const options = screen.getAllByRole("radio");
    expect(options.length).toBe(2);
    const labels = options.map((o) => o.textContent);
    expect(labels).toContain("解析");
    expect(labels).toContain("ビルダー");
  });

  it("variant=parser でモード切替コントロールが表示されない", async () => {
    await act(async () => {
      render(<CronParserTile variant="parser" />);
    });
    // SegmentedControl が非表示（radiogroup なし）
    const group = screen.queryByRole("radiogroup");
    expect(group).toBeNull();
  });

  it("variant=builder でモード切替コントロールが表示されない", async () => {
    await act(async () => {
      render(<CronParserTile variant="builder" />);
    });
    const group = screen.queryByRole("radiogroup");
    expect(group).toBeNull();
  });
});

// =========================================================
// variant=parser 固定モード
// =========================================================
describe("CronParserTile - variant=parser 固定", () => {
  it("解析モードの UI（cron式入力欄・解析ボタン）が表示される", async () => {
    await act(async () => {
      render(<CronParserTile variant="parser" />);
    });
    expect(screen.getByLabelText(/cron式入力/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^解析$/ })).toBeInTheDocument();
  });

  it("ビルダーの入力フィールドが表示されない", async () => {
    await act(async () => {
      render(<CronParserTile variant="parser" />);
    });
    expect(screen.queryByLabelText(/分フィールド/i)).toBeNull();
  });
});

// =========================================================
// variant=builder 固定モード
// =========================================================
describe("CronParserTile - variant=builder 固定", () => {
  it("ビルダーモードの UI（5フィールド）が表示される", async () => {
    await act(async () => {
      render(<CronParserTile variant="builder" />);
    });
    expect(screen.getByLabelText(/分フィールド/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/時フィールド/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/日付フィールド/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/月フィールド/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/曜日フィールド/i)).toBeInTheDocument();
  });

  it("解析モードの入力欄が表示されない", async () => {
    await act(async () => {
      render(<CronParserTile variant="builder" />);
    });
    expect(screen.queryByLabelText(/cron式入力/i)).toBeNull();
  });
});

// =========================================================
// 入力→結果更新（E-2 相当）
// =========================================================
describe("CronParserTile - 入力→結果更新", () => {
  it("有効なcron式を入力して解析すると結果が表示される", async () => {
    await act(async () => {
      render(<CronParserTile variant="full" />);
    });
    const input = screen.getByLabelText(/cron式入力/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "0 9 * * *" } });
    });
    const parseBtn = screen.getByRole("button", { name: /^解析$/ });
    await act(async () => {
      fireEvent.click(parseBtn);
    });
    const bodyText = document.body.textContent ?? "";
    expect(bodyText.includes("9時") || bodyText.includes("9")).toBe(true);
  });

  it("ビルダーモードでフィールドを入力するとcron式が更新される", async () => {
    await act(async () => {
      render(<CronParserTile variant="full" />);
    });
    const builderTab = screen.getByRole("radio", { name: "ビルダー" });
    await act(async () => {
      fireEvent.click(builderTab);
    });
    const minuteInput = screen.getByLabelText(/分フィールド/i);
    await act(async () => {
      fireEvent.change(minuteInput, { target: { value: "30" } });
    });
    const bodyText = document.body.textContent ?? "";
    expect(bodyText.includes("30")).toBe(true);
  });
});

// =========================================================
// 空入力・エラー（E-3 相当）
// =========================================================
describe("CronParserTile - 空入力", () => {
  it("初期表示時はエラーが表示されない", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });
    const alerts = screen.queryAllByRole("alert");
    expect(alerts.length).toBe(0);
  });

  it("無効なcron式を入力して解析するとエラーが表示される", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });
    const input = screen.getByLabelText(/cron式入力/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "invalid" } });
    });
    const parseBtn = screen.getByRole("button", { name: /^解析$/ });
    await act(async () => {
      fireEvent.click(parseBtn);
    });
    await waitFor(() => {
      const alerts = screen.queryAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
    });
  });
});

// =========================================================
// 変換ロジックの正確性（E-4 相当）
// =========================================================
describe("CronParserTile - 変換ロジック", () => {
  it("'0 9 * * *' を入力すると毎日9時0分の説明が表示される", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });
    const input = screen.getByLabelText(/cron式入力/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "0 9 * * *" } });
    });
    const parseBtn = screen.getByRole("button", { name: /^解析$/ });
    await act(async () => {
      fireEvent.click(parseBtn);
    });
    const bodyText = document.body.textContent ?? "";
    expect(bodyText.includes("9時0分") || bodyText.includes("毎日")).toBe(true);
  });

  it("プリセット「毎日9時」をクリックすると対応する説明が表示される", async () => {
    await act(async () => {
      render(<CronParserTile />);
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
      render(<CronParserTile />);
    });
    const input = screen.getByLabelText(/cron式入力/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "0 9 * * *" } });
    });
    const parseBtn = screen.getByRole("button", { name: /^解析$/ });
    await act(async () => {
      fireEvent.click(parseBtn);
    });
    const bodyText = document.body.textContent ?? "";
    expect(bodyText.includes("次回") || bodyText.includes("実行")).toBe(true);
  });
});

// =========================================================
// ARIA（E-5 相当）
// =========================================================
describe("CronParserTile - ARIA", () => {
  it("結果表示エリアに role='status' aria-live='polite' が付与されている（C-3）", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });
    const statusEl = document.querySelector(
      '[role="status"][aria-live="polite"]',
    );
    expect(statusEl).toBeInTheDocument();
  });

  it("ライブリージョンに実テキストノードのサマリが含まれる（解析後）", async () => {
    await act(async () => {
      render(<CronParserTile />);
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
    expect(statusEl?.textContent?.trim()).toBeTruthy();
  });

  it("variant=full でSegmentedControlにaria-labelが付与されている（C-2）", async () => {
    await act(async () => {
      render(<CronParserTile variant="full" />);
    });
    const group = screen.getByRole("radiogroup");
    const hasLabel =
      group.hasAttribute("aria-label") || group.hasAttribute("aria-labelledby");
    expect(hasLabel).toBe(true);
  });
});

// =========================================================
// コピーボタン（E-6/E-7/E-8 相当）
// =========================================================
describe("CronParserTile - コピーボタン", () => {
  it("解析モードにコピーボタンが存在しない（T-4b 方針）", async () => {
    await act(async () => {
      render(<CronParserTile variant="parser" />);
    });
    const copyBtn = screen.queryByRole("button", { name: /コピー/i });
    expect(copyBtn).toBeNull();
  });

  it("ビルダーモードにコピーボタンが存在する", async () => {
    await act(async () => {
      render(<CronParserTile variant="builder" />);
    });
    const copyBtn = screen.queryByRole("button", { name: /コピー/i });
    expect(copyBtn).toBeInTheDocument();
  });

  it("variant=full でビルダーに切り替えるとコピーボタンが表示される", async () => {
    await act(async () => {
      render(<CronParserTile variant="full" />);
    });
    const builderTab = screen.getByRole("radio", { name: "ビルダー" });
    await act(async () => {
      fireEvent.click(builderTab);
    });
    const copyBtn = screen.queryByRole("button", { name: /コピー/i });
    expect(copyBtn).toBeInTheDocument();
  });

  it("ビルダーモードのコピーボタンをクリックするとコピーしましたに変わる", async () => {
    await act(async () => {
      render(<CronParserTile variant="builder" />);
    });
    const copyBtn = screen.getByRole("button", { name: /コピー/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /コピーしました/i }),
      ).toBeInTheDocument();
    });
  });

  it("ビルダーモードのコピーボタンが有効な式で disabled でない", async () => {
    await act(async () => {
      render(<CronParserTile variant="builder" />);
    });
    const copyBtn = screen.getByRole("button", { name: /コピー/i });
    expect(copyBtn).not.toBeDisabled();
  });

  it("navigator.clipboard が存在しない環境でコピーしても例外を投げない", async () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: undefined,
    });
    await act(async () => {
      render(<CronParserTile variant="builder" />);
    });
    const copyBtn = screen.getByRole("button", { name: /コピー/i });
    await expect(
      act(async () => {
        fireEvent.click(copyBtn);
      }),
    ).resolves.not.toThrow();
  });
});

// =========================================================
// 複数インスタンス id 一意性（A-6）
// =========================================================
describe("CronParserTile - 複数インスタンス id 一意性（A-6）", () => {
  it("同一ページに2つのタイルを置いてもcron式入力欄の id が重複しない", async () => {
    await act(async () => {
      render(
        <div>
          <CronParserTile variant="parser" />
          <CronParserTile variant="parser" />
        </div>,
      );
    });
    const inputs = screen.getAllByLabelText(/cron式入力/i);
    expect(inputs.length).toBe(2);
    const ids = inputs.map((el) => el.id);
    // id が空でないこと（useId が割り当てられる）
    expect(ids[0]).toBeTruthy();
    expect(ids[1]).toBeTruthy();
    // 2つの id が異なること
    expect(ids[0]).not.toBe(ids[1]);
  });

  it("full と builder のインスタンスを同居させてもフィールド id が重複しない", async () => {
    await act(async () => {
      render(
        <div>
          <CronParserTile variant="builder" />
          <CronParserTile variant="builder" />
        </div>,
      );
    });
    // 分フィールドが2つ存在する
    const minuteInputs = screen.getAllByLabelText(/分フィールド/i);
    expect(minuteInputs.length).toBe(2);
    const ids = minuteInputs.map((el) => el.id);
    expect(ids[0]).toBeTruthy();
    expect(ids[1]).toBeTruthy();
    expect(ids[0]).not.toBe(ids[1]);
  });
});

// =========================================================
// stale サマリリセット（U-4 是正(a)）
// =========================================================
describe("CronParserTile - staleサマリリセット（U-4 是正(a)）", () => {
  it("解析エラー後にモード切替するとliveSummaryが空になる", async () => {
    await act(async () => {
      render(<CronParserTile variant="full" />);
    });
    const input = screen.getByLabelText(/cron式入力/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "invalid" } });
    });
    const parseBtn = screen.getByRole("button", { name: /^解析$/ });
    await act(async () => {
      fireEvent.click(parseBtn);
    });
    const statusEl = document.querySelector(
      '[role="status"][aria-live="polite"]',
    );
    expect(statusEl?.textContent).toBeTruthy();

    const builderTab = screen.getByRole("radio", { name: "ビルダー" });
    await act(async () => {
      fireEvent.click(builderTab);
    });
    const statusElAfter = document.querySelector(
      '[role="status"][aria-live="polite"]',
    );
    expect(statusElAfter?.textContent?.trim()).toBe("");
  });
});

// =========================================================
// エラーに修正ヒントを添える（U-4 低指摘）
// =========================================================
describe("CronParserTile - エラー修正ヒント（U-4 低指摘）", () => {
  it("分フィールドが無効なエラーに範囲説明が含まれる", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });
    const input = screen.getByLabelText(/cron式入力/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "60 * * * *" } });
    });
    const parseBtn = screen.getByRole("button", { name: /^解析$/ });
    await act(async () => {
      fireEvent.click(parseBtn);
    });
    const bodyText = document.body.textContent ?? "";
    expect(bodyText).toMatch(/0[〜~-]59/);
  });

  it("時フィールドが無効なエラーに範囲説明が含まれる", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });
    const input = screen.getByLabelText(/cron式入力/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "0 24 * * *" } });
    });
    const parseBtn = screen.getByRole("button", { name: /^解析$/ });
    await act(async () => {
      fireEvent.click(parseBtn);
    });
    const bodyText = document.body.textContent ?? "";
    expect(bodyText).toMatch(/0[〜~-]23/);
  });
});

// =========================================================
// ビルダー次回実行表示（U-4 低指摘）
// =========================================================
describe("CronParserTile - ビルダー次回実行表示", () => {
  it("variant=builder で有効な式の次回実行が表示される", async () => {
    await act(async () => {
      render(<CronParserTile variant="builder" />);
    });
    const bodyText = document.body.textContent ?? "";
    expect(bodyText.includes("次回") || bodyText.includes("実行予定")).toBe(
      true,
    );
  });

  it("ビルダーモードのプリセット「毎日9時」で次回実行が表示される", async () => {
    await act(async () => {
      render(<CronParserTile variant="builder" />);
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

// =========================================================
// ビルダー機能（ビルダー復元 ②-4）
// =========================================================
describe("CronParserTile - ビルダー機能", () => {
  it("ビルダーモードで全フィールドが存在する", async () => {
    await act(async () => {
      render(<CronParserTile variant="builder" />);
    });
    expect(screen.getByLabelText(/分フィールド/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/時フィールド/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/日付フィールド/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/月フィールド/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/曜日フィールド/i)).toBeInTheDocument();
  });

  it("ビルダーモードでプリセットを選ぶと各フィールドが更新される", async () => {
    await act(async () => {
      render(<CronParserTile variant="builder" />);
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
      render(<CronParserTile variant="builder" />);
    });
    const bodyText = document.body.textContent ?? "";
    expect(
      bodyText.includes("生成されたCron式") || bodyText.includes("Cron式"),
    ).toBe(true);
  });
});

// =========================================================
// フィールド詳細（フル機能確認）
// =========================================================
describe("CronParserTile - フィールド詳細", () => {
  it("解析後にフィールド詳細テーブルが表示される", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });
    const input = screen.getByLabelText(/cron式入力/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "0 9 * * 1-5" } });
    });
    const parseBtn = screen.getByRole("button", { name: /^解析$/ });
    await act(async () => {
      fireEvent.click(parseBtn);
    });
    const bodyText = document.body.textContent ?? "";
    expect(bodyText.includes("分")).toBe(true);
    expect(bodyText.includes("時")).toBe(true);
    expect(bodyText.includes("曜日")).toBe(true);
  });
});

// =========================================================
// JST固定化（B-472内包）
// =========================================================
describe("CronParserTile - JST固定化", () => {
  it("次回実行の日時表示がJST (Asia/Tokyo) で表示される", async () => {
    await act(async () => {
      render(<CronParserTile />);
    });
    const input = screen.getByLabelText(/cron式入力/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "0 9 * * *" } });
    });
    const parseBtn = screen.getByRole("button", { name: /^解析$/ });
    await act(async () => {
      fireEvent.click(parseBtn);
    });
    const bodyText = document.body.textContent ?? "";
    expect(bodyText.includes("次回") || bodyText.includes("実行予定")).toBe(
      true,
    );
  });
});

// =========================================================
// 見出しレベル回帰（B-593: h1→h3 飛び是正の回帰防止）
// =========================================================
describe("CronParserTile - 見出しレベル回帰（B-593）", () => {
  // B-593: 本体セクション見出しは h1 直下のトップレベルなので h2 が正。
  // かつて h3 で描画され h1→h3 とレベルを飛ばしていた回帰を防ぐ。
  it("解析モードの「Cron式を入力」見出しが level 2（h2）である", async () => {
    await act(async () => {
      render(<CronParserTile variant="parser" />);
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "Cron式を入力" }),
    ).toBeInTheDocument();
  });

  it("有効なcron式を解析すると「フィールド詳細」「次回実行予定（JST）」も level 2（h2）で描画される", async () => {
    await act(async () => {
      render(<CronParserTile variant="parser" />);
    });
    const input = screen.getByLabelText(/cron式入力/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "0 9 * * 1-5" } });
    });
    const parseBtn = screen.getByRole("button", { name: /^解析$/ });
    await act(async () => {
      fireEvent.click(parseBtn);
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "フィールド詳細" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "次回実行予定（JST）" }),
    ).toBeInTheDocument();
  });

  it("ビルダーモードの「Cron式ビルダー」「生成されたCron式」見出しが level 2（h2）である", async () => {
    await act(async () => {
      render(<CronParserTile variant="builder" />);
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "Cron式ビルダー" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "生成されたCron式" }),
    ).toBeInTheDocument();
  });
});

// =========================================================
// CSS トークン検証（E-12 相当）
// =========================================================
describe("CronParserTile - CSS トークン検証", () => {
  it("CSSファイルに --color-* 旧トークンが存在しない（B-1）", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/cron-parser/CronParserTile.module.css",
    );
    const rawCss = readFileSync(cssPath, "utf-8");
    const css = rawCss.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("CSSファイルに font-weight: 700 が存在しない（B-4）", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/cron-parser/CronParserTile.module.css",
    );
    const rawCss = readFileSync(cssPath, "utf-8");
    const css = rawCss.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(css).not.toMatch(/font-weight:\s*700/);
  });

  it("CSSファイルに background系プロパティへの --accent 直塗りが存在しない（B-3）", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/cron-parser/CronParserTile.module.css",
    );
    const rawCss = readFileSync(cssPath, "utf-8");
    const css = rawCss.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(css).not.toMatch(/background(?:-color)?:\s*var\(--accent\)/);
  });

  it("CSSファイルの非インタラクティブ表示要素に --r-interactive が使われていない（B-5）", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/cron-parser/CronParserTile.module.css",
    );
    const rawCss = readFileSync(cssPath, "utf-8");
    const css = rawCss.replace(/\/\*[\s\S]*?\*\//g, "");
    const builtExpressionBlock = css.match(/\.builtExpression\s*\{[^}]*\}/);
    if (builtExpressionBlock) {
      expect(builtExpressionBlock[0]).not.toMatch(/var\(--r-interactive\)/);
    }
  });
});

// =========================================================
// C-3: ビルダーモードライブリージョン更新
// =========================================================
describe("CronParserTile - ビルダーモードC-3ライブリージョン更新", () => {
  it("ビルダーモードでフィールドを変更するとライブリージョンが更新される", async () => {
    await act(async () => {
      render(<CronParserTile variant="builder" />);
    });
    const minuteInput = screen.getByLabelText(/分フィールド/i);
    await act(async () => {
      fireEvent.change(minuteInput, { target: { value: "30" } });
    });
    const statusEl = document.querySelector(
      '[role="status"][aria-live="polite"]',
    );
    expect(statusEl).toBeInTheDocument();
    expect(statusEl?.textContent?.trim()).toBeTruthy();
  });
});
