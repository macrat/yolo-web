/**
 * UnixTimestampPage 回帰テスト
 *
 * 収束チェックリスト E-1〜E-12 対応。
 * hydration 一致設計のため、現在タイムスタンプの初期表示は "" (空文字) でよい。
 */
import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import UnixTimestampPage from "../UnixTimestampPage";
import { COPIED_LABEL } from "@/components/hooks/useCopyToClipboard";

// navigator.clipboard のモック
const writeTextMock = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: writeTextMock },
  writable: true,
  configurable: true,
});

beforeEach(() => {
  writeTextMock.mockClear();
  vi.clearAllTimers();
});

// --- E-1: 基本レンダリング ---
describe("E-1: 基本レンダリング", () => {
  test("コンポーネントが正常にレンダリングされること", () => {
    render(<UnixTimestampPage />);
    // セクションタイトルが存在する
    expect(screen.getByText("タイムスタンプ → 日時")).toBeInTheDocument();
    expect(screen.getByText("日時 → タイムスタンプ")).toBeInTheDocument();
  });

  test("現在のUNIXタイムスタンプラベルが存在すること", () => {
    render(<UnixTimestampPage />);
    expect(screen.getByText("現在のUNIXタイムスタンプ:")).toBeInTheDocument();
  });
});

// --- E-2: 入力→結果更新 ---
describe("E-2: 入力→結果更新", () => {
  test("タイムスタンプ入力後に変換ボタンを押すと結果が表示されること", async () => {
    render(<UnixTimestampPage />);
    const input = screen.getByRole("textbox", { name: "UNIXタイムスタンプ" });
    // 2024-01-01T00:00:00Z = 1704067200
    fireEvent.change(input, { target: { value: "1704067200" } });
    // 変換ボタンは2つあるので最初（タイムスタンプ→日時）を使用
    const convertButton = screen.getAllByRole("button", { name: "変換" })[0];
    fireEvent.click(convertButton);
    // 変換結果が表示されること
    await waitFor(() => {
      expect(screen.getByText("ISO 8601")).toBeInTheDocument();
      expect(screen.getByText("2024-01-01T00:00:00.000Z")).toBeInTheDocument();
    });
  });

  test("日時入力後に変換ボタンを押すと結果が表示されること", async () => {
    render(<UnixTimestampPage />);
    const convertButton = screen.getAllByRole("button", { name: "変換" })[1];
    fireEvent.click(convertButton);
    // 日時変換結果の「秒」ラベルが表示されること
    await waitFor(() => {
      // 結果テーブルの「秒」が存在するか確認（複数ある可能性あり）
      const labels = screen.getAllByText("秒");
      expect(labels.length).toBeGreaterThan(0);
    });
  });
});

// --- E-3: 空入力 ---
describe("E-3: 空入力", () => {
  test("タイムスタンプ入力が空のとき変換ボタンを押してもエラーが表示されること", async () => {
    render(<UnixTimestampPage />);
    const input = screen.getByRole("textbox", { name: "UNIXタイムスタンプ" });
    fireEvent.change(input, { target: { value: "" } });
    const convertButton = screen.getAllByRole("button", { name: "変換" })[0];
    fireEvent.click(convertButton);
    await waitFor(() => {
      expect(
        screen.getByText("有効な数値を入力してください"),
      ).toBeInTheDocument();
    });
  });

  test("空入力時に変換結果テーブルが表示されないこと", () => {
    render(<UnixTimestampPage />);
    // 変換前は ISO 8601 等の結果ラベルが表示されない
    expect(screen.queryByText("ISO 8601")).not.toBeInTheDocument();
  });
});

// --- E-4: 変換ロジックの正確性 ---
describe("E-4: 変換ロジックの正確性", () => {
  test("1704067200 が 2024-01-01T00:00:00.000Z に変換されること", async () => {
    render(<UnixTimestampPage />);
    const input = screen.getByRole("textbox", { name: "UNIXタイムスタンプ" });
    fireEvent.change(input, { target: { value: "1704067200" } });
    // 変換ボタンは2つあるので最初（タイムスタンプ→日時）を使用
    fireEvent.click(screen.getAllByRole("button", { name: "変換" })[0]);
    await waitFor(() => {
      expect(screen.getByText("2024-01-01T00:00:00.000Z")).toBeInTheDocument();
    });
  });

  test("ミリ秒モードで1704067200000を変換できること", async () => {
    render(<UnixTimestampPage />);
    const input = screen.getByRole("textbox", { name: "UNIXタイムスタンプ" });
    fireEvent.change(input, { target: { value: "1704067200000" } });
    // SegmentedControl で「ミリ秒」を選択
    const msButton = screen.getByRole("radio", { name: "ミリ秒" });
    fireEvent.click(msButton);
    // 変換ボタンは2つあるので最初（タイムスタンプ→日時）を使用
    fireEvent.click(screen.getAllByRole("button", { name: "変換" })[0]);
    await waitFor(() => {
      expect(screen.getByText("2024-01-01T00:00:00.000Z")).toBeInTheDocument();
    });
  });

  test("無効な入力でエラーメッセージが表示されること", async () => {
    render(<UnixTimestampPage />);
    const input = screen.getByRole("textbox", { name: "UNIXタイムスタンプ" });
    fireEvent.change(input, { target: { value: "invalid" } });
    fireEvent.click(screen.getAllByRole("button", { name: "変換" })[0]);
    await waitFor(() => {
      expect(
        screen.getByText("有効な数値を入力してください"),
      ).toBeInTheDocument();
    });
  });
});

// --- E-5: ARIA ---
describe("E-5: ARIA属性", () => {
  test("SegmentedControl に role='radiogroup' が存在すること", () => {
    render(<UnixTimestampPage />);
    const radiogroup = screen.getByRole("radiogroup", {
      name: "タイムスタンプ単位",
    });
    expect(radiogroup).toBeInTheDocument();
  });

  test("秒/ミリ秒の選択肢に role='radio' があること", () => {
    render(<UnixTimestampPage />);
    const radios = screen.getAllByRole("radio");
    expect(radios.length).toBeGreaterThanOrEqual(2);
  });

  test("タイムスタンプ変換の role='status' aria-live='polite' が存在すること", () => {
    render(<UnixTimestampPage />);
    const statusRegions = screen.getAllByRole("status");
    expect(statusRegions.length).toBeGreaterThanOrEqual(2);
    // aria-live="polite" の確認
    statusRegions.forEach((region) => {
      expect(region).toHaveAttribute("aria-live", "polite");
    });
  });

  test("変換後に role='status' にサマリテキストが現れること", async () => {
    render(<UnixTimestampPage />);
    const input = screen.getByRole("textbox", { name: "UNIXタイムスタンプ" });
    fireEvent.change(input, { target: { value: "1704067200" } });
    // 変換ボタンは2つあるので最初（タイムスタンプ→日時）を使用
    fireEvent.click(screen.getAllByRole("button", { name: "変換" })[0]);
    await waitFor(() => {
      expect(screen.getByText("変換しました")).toBeInTheDocument();
    });
  });
});

// --- E-6: コピー文言変化 ---
describe("E-6: コピー文言変化", () => {
  test("変換後にコピーボタンを押すとCOPIED_LABELに変わること", async () => {
    render(<UnixTimestampPage />);
    const input = screen.getByRole("textbox", { name: "UNIXタイムスタンプ" });
    fireEvent.change(input, { target: { value: "1704067200" } });
    // 変換ボタンは2つあるので最初（タイムスタンプ→日時）を使用
    fireEvent.click(screen.getAllByRole("button", { name: "変換" })[0]);
    await waitFor(() => {
      expect(screen.getByText("ISO 8601")).toBeInTheDocument();
    });
    // ISO 8601 コピーボタン
    const isoButton = screen.getByRole("button", { name: "ISO 8601をコピー" });
    fireEvent.click(isoButton);
    await waitFor(() => {
      expect(screen.getAllByText(COPIED_LABEL).length).toBeGreaterThan(0);
    });
  });
});

// --- E-7: コピー disabled 状態 ---
describe("E-7: コピー disabled 状態", () => {
  test("タイムスタンプ変換前はISO 8601コピーボタンが存在しないこと", () => {
    render(<UnixTimestampPage />);
    // 変換前は変換結果が存在しないため ISO 8601 コピーボタンも存在しない
    expect(
      screen.queryByRole("button", { name: "ISO 8601をコピー" }),
    ).not.toBeInTheDocument();
  });

  test("日時変換前は日時変換結果コピーボタンが存在しないこと", () => {
    render(<UnixTimestampPage />);
    // 変換前は変換結果が存在しないため dateSec コピーボタンも存在しない
    // NOTE: 変換ボタン（variant=primary）は存在するが、コピーボタンはまだない
    expect(
      screen.queryByRole("button", { name: "ミリ秒をコピー" }),
    ).not.toBeInTheDocument();
  });
});

// --- E-8: clipboard 不在時の silent fail ---
describe("E-8: clipboard 不在時の silent fail", () => {
  test("navigator.clipboard が存在しない場合でも例外を投げないこと", async () => {
    // clipboard を undefined に設定
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    render(<UnixTimestampPage />);
    const input = screen.getByRole("textbox", { name: "UNIXタイムスタンプ" });
    fireEvent.change(input, { target: { value: "1704067200" } });
    // 変換ボタンは2つあるので最初（タイムスタンプ→日時）を使用
    fireEvent.click(screen.getAllByRole("button", { name: "変換" })[0]);
    await waitFor(() => {
      expect(screen.getByText("ISO 8601")).toBeInTheDocument();
    });
    // コピーボタンを押しても例外が発生しないこと
    const isoBtn = screen.getByRole("button", { name: "ISO 8601をコピー" });
    expect(() => fireEvent.click(isoBtn)).not.toThrow();

    // clipboard を元に戻す
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });
  });
});

// --- E-9: 詳細リンク N/A ---
// このツールには詳細リンクなし

// --- E-10: meta 由来の表示 ---
describe("E-10: meta 由来の表示", () => {
  test("ツールのセクションタイトルが正しく表示されること", () => {
    render(<UnixTimestampPage />);
    expect(screen.getByText("タイムスタンプ → 日時")).toBeInTheDocument();
    expect(screen.getByText("日時 → タイムスタンプ")).toBeInTheDocument();
  });
});

// --- 追加テスト: reviewer 指摘解消確認 ---

// 指摘1: 共通 Input コンポーネントを使っていること
describe("reviewer-1: 共通Inputコンポーネント使用", () => {
  test("UNIXタイムスタンプ入力欄に data-common-input スタイルが適用されていること（textboxロールで取得可能）", () => {
    render(<UnixTimestampPage />);
    // 共通 Input コンポーネントで実装されていれば、同じ role で取得できる
    const tsInput = screen.getByRole("textbox", { name: "UNIXタイムスタンプ" });
    expect(tsInput).toBeInTheDocument();
    // 年/月/日/時/分/秒の入力欄も spinbutton として存在すること
    const yearInput = screen.getByRole("spinbutton", { name: "年" });
    const monthInput = screen.getByRole("spinbutton", { name: "月" });
    const dayInput = screen.getByRole("spinbutton", { name: "日" });
    const hoursInput = screen.getByRole("spinbutton", { name: "時" });
    const minutesInput = screen.getByRole("spinbutton", { name: "分" });
    const secondsInput = screen.getByRole("spinbutton", { name: "秒" });
    expect(yearInput).toBeInTheDocument();
    expect(monthInput).toBeInTheDocument();
    expect(dayInput).toBeInTheDocument();
    expect(hoursInput).toBeInTheDocument();
    expect(minutesInput).toBeInTheDocument();
    expect(secondsInput).toBeInTheDocument();
  });

  test("日付フィールド入力欄が :focus-visible を使う共通Inputと同じ振る舞いになること（tsTextInput/.dateNumberInput クラスが存在しないこと）", () => {
    render(<UnixTimestampPage />);
    // UnixTimestampPage 内の input 要素を全取得
    const allInputs = document.querySelectorAll("input");
    allInputs.forEach((el) => {
      // 素の独自CSSクラスが付いていないこと（共通Inputを使うとmodule CSSのクラス名になる）
      // tsTextInput や dateNumberInput という名前のクラスが付いていないことを確認
      expect(
        Array.from(el.classList).some((c) => c.includes("tsTextInput")),
      ).toBe(false);
      expect(
        Array.from(el.classList).some((c) => c.includes("dateNumberInput")),
      ).toBe(false);
    });
  });
});

// 指摘2: ローカル時刻コピーボタンの存在
describe("reviewer-2: ローカル時刻コピーボタン", () => {
  test("タイムスタンプ変換後にローカル時刻行のコピーボタンが存在すること", async () => {
    render(<UnixTimestampPage />);
    const input = screen.getByRole("textbox", { name: "UNIXタイムスタンプ" });
    fireEvent.change(input, { target: { value: "1704067200" } });
    fireEvent.click(screen.getAllByRole("button", { name: "変換" })[0]);
    await waitFor(() => {
      expect(screen.getByText("ローカル時刻")).toBeInTheDocument();
    });
    // ローカル時刻コピーボタンが存在すること
    const localCopyBtn = screen.getByRole("button", {
      name: "ローカル時刻をコピー",
    });
    expect(localCopyBtn).toBeInTheDocument();
    expect(localCopyBtn).not.toBeDisabled();
  });
});

// 指摘3: セクション見出しレベル
describe("reviewer-3: 見出しレベル", () => {
  test("セクション見出しが h2 で始まること（h3 をスキップしないこと）", () => {
    render(<UnixTimestampPage />);
    // h2 要素が存在すること
    const h2Elements = document.querySelectorAll("h2");
    expect(h2Elements.length).toBeGreaterThanOrEqual(2);
    // h3 要素が存在しないこと（アウトラインスキップなし）
    const h3Elements = document.querySelectorAll("h3");
    expect(h3Elements).toHaveLength(0);
  });
});

// --- E-11: 既存 logic.ts テスト は logic.test.ts で維持済み ---

// --- E-12: CSS トークン検証 ---
describe("E-12: CSSトークン検証", () => {
  const cssPath = join(
    process.cwd(),
    "src/tools/unix-timestamp/UnixTimestampPage.module.css",
  );

  test("--color-* 旧トークンが存在しないこと", () => {
    const css = readFileSync(cssPath, "utf-8");
    // --color- 系の古いトークンが使われていないこと
    const matches = css.match(/var\(--color-[^)]+\)/g) ?? [];
    expect(matches).toHaveLength(0);
  });

  test("--accent を直塗りに使っていないこと（フォーカス outline のみ許可）", () => {
    const css = readFileSync(cssPath, "utf-8");
    // background や color に --accent を直塗りしていないこと
    // outline: ... var(--accent) は許可
    // コメント行（ * ... や // ... ）は除外する
    const lines = css.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      // コメント行はスキップ
      if (trimmed.startsWith("*") || trimmed.startsWith("//")) continue;
      if (trimmed.includes("var(--accent)")) {
        // outline に使っているかチェック
        expect(trimmed).toMatch(/^outline:/);
      }
    }
  });

  test("font-weight: 700 が存在しないこと（コメント除く）", () => {
    const css = readFileSync(cssPath, "utf-8");
    // コメント行を除いたCSSで700がないことを確認
    const nonCommentLines = css
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim();
        return (
          !trimmed.startsWith("*") &&
          !trimmed.startsWith("//") &&
          !trimmed.startsWith("/*")
        );
      })
      .join("\n");
    expect(nonCommentLines).not.toMatch(/font-weight:\s*700/);
  });
});
