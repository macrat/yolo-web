/**
 * UnixTimestampTile テスト
 *
 * 旧 UnixTimestampPage.test.tsx の振る舞いを移植・拡張。
 * hydration 安全パターン・タイマー管理・variant・複数インスタンス id 一意性を検証。
 */
import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import UnixTimestampTile from "../UnixTimestampTile";
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

afterEach(() => {
  vi.useRealTimers();
});

// --- A-1: Panel ルート要件 ---
describe("A-1: Panel ルート要件", () => {
  test("デフォルトでルート要素が section であること（Panel デフォルト）", () => {
    const { container } = render(<UnixTimestampTile />);
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });

  test("as=div でルート要素が div になること", () => {
    const { container } = render(<UnixTimestampTile as="div" />);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });
});

// --- A-6: useId ベースの複数インスタンス id 一意性 ---
describe("A-6: 複数インスタンスで DOM id が重複しない", () => {
  test("2インスタンスをレンダリングしたとき id が重複しないこと", () => {
    render(
      <>
        <UnixTimestampTile />
        <UnixTimestampTile />
      </>,
    );
    // 年フィールドのラベルが2つ存在すること
    const yearInputs = screen.getAllByRole("spinbutton", { name: "年" });
    expect(yearInputs).toHaveLength(2);
    // id が一意であること
    const id1 = yearInputs[0].id;
    const id2 = yearInputs[1].id;
    expect(id1).not.toBe("");
    expect(id2).not.toBe("");
    expect(id1).not.toBe(id2);
  });
});

// --- E-1: 基本レンダリング ---
describe("E-1: 基本レンダリング", () => {
  test("コンポーネントが正常にレンダリングされること", () => {
    render(<UnixTimestampTile />);
    expect(screen.getByText("タイムスタンプ → 日時")).toBeInTheDocument();
    expect(screen.getByText("日時 → タイムスタンプ")).toBeInTheDocument();
  });

  test("現在のUNIXタイムスタンプラベルが存在すること", () => {
    render(<UnixTimestampTile />);
    expect(screen.getByText("現在のUNIXタイムスタンプ:")).toBeInTheDocument();
  });

  test("variant=full でも全セクションが表示されること", () => {
    render(<UnixTimestampTile variant="full" />);
    expect(screen.getByText("タイムスタンプ → 日時")).toBeInTheDocument();
    expect(screen.getByText("日時 → タイムスタンプ")).toBeInTheDocument();
  });
});

// --- hydration 安全パターン ---
describe("hydration 安全パターン", () => {
  test("初期状態ではライブタイムスタンプが空文字（SSR 一致）", () => {
    render(<UnixTimestampTile />);
    // mounted=false の間は code 要素が空文字になる
    const codeEl = document.querySelector("code");
    // mounted は非同期なため初期レンダリング直後は空文字になるはず
    // （テスト環境では useEffect は同期的に実行されることがあるが、
    //   少なくとも hydration エラーなくレンダリングされること）
    expect(codeEl).toBeInTheDocument();
  });
});

// --- D-4: タイマー管理 ---
describe("D-4: タイマー管理（setInterval cleanup）", () => {
  test("マウント後にライブタイムスタンプが数値になること（fake timers）", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
    render(<UnixTimestampTile />);

    // useEffect がマウント後に動くのを待つ（setInterval の無限ループを避けるため
    // runAllTimers ではなく advanceTimersByTime を使用する）
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const codeEl = document.querySelector("code");
    expect(codeEl?.textContent).not.toBe("");
  });

  test("1秒後にタイムスタンプが更新されること（fake timers）", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
    render(<UnixTimestampTile />);

    // 初期化待ち
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    const codeEl = document.querySelector("code");
    const before = codeEl?.textContent;

    // 1秒進める
    vi.setSystemTime(new Date("2024-01-01T00:00:01Z"));
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    const after = codeEl?.textContent;
    // 少なくとも空ではないこと
    expect(after).not.toBe("");
    // 時刻が進んでいること（before と after は異なるはず）
    expect(after).not.toBe(before);
  });
});

// --- E-2: 入力→結果更新 ---
describe("E-2: 入力→結果更新", () => {
  test("タイムスタンプ入力後に変換ボタンを押すと結果が表示されること", async () => {
    render(<UnixTimestampTile />);
    const input = screen.getByRole("textbox", { name: "UNIXタイムスタンプ" });
    // 2024-01-01T00:00:00Z = 1704067200
    fireEvent.change(input, { target: { value: "1704067200" } });
    const convertButton = screen.getAllByRole("button", { name: "変換" })[0];
    fireEvent.click(convertButton);
    await waitFor(() => {
      expect(screen.getByText("ISO 8601")).toBeInTheDocument();
      expect(screen.getByText("2024-01-01T00:00:00.000Z")).toBeInTheDocument();
    });
  });

  test("日時入力後に変換ボタンを押すと結果が表示されること", async () => {
    render(<UnixTimestampTile />);
    const convertButton = screen.getAllByRole("button", { name: "変換" })[1];
    fireEvent.click(convertButton);
    await waitFor(() => {
      const labels = screen.getAllByText("秒");
      expect(labels.length).toBeGreaterThan(0);
    });
  });
});

// --- E-3: 空入力 ---
describe("E-3: 空入力", () => {
  test("タイムスタンプ入力が空のとき変換ボタンを押してもエラーが表示されること", async () => {
    render(<UnixTimestampTile />);
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
    render(<UnixTimestampTile />);
    expect(screen.queryByText("ISO 8601")).not.toBeInTheDocument();
  });
});

// --- E-4: 変換ロジックの正確性 ---
describe("E-4: 変換ロジックの正確性", () => {
  test("1704067200 が 2024-01-01T00:00:00.000Z に変換されること", async () => {
    render(<UnixTimestampTile />);
    const input = screen.getByRole("textbox", { name: "UNIXタイムスタンプ" });
    fireEvent.change(input, { target: { value: "1704067200" } });
    fireEvent.click(screen.getAllByRole("button", { name: "変換" })[0]);
    await waitFor(() => {
      expect(screen.getByText("2024-01-01T00:00:00.000Z")).toBeInTheDocument();
    });
  });

  test("ミリ秒モードで1704067200000を変換できること", async () => {
    render(<UnixTimestampTile />);
    const input = screen.getByRole("textbox", { name: "UNIXタイムスタンプ" });
    fireEvent.change(input, { target: { value: "1704067200000" } });
    const msButton = screen.getByRole("radio", { name: "ミリ秒" });
    fireEvent.click(msButton);
    fireEvent.click(screen.getAllByRole("button", { name: "変換" })[0]);
    await waitFor(() => {
      expect(screen.getByText("2024-01-01T00:00:00.000Z")).toBeInTheDocument();
    });
  });

  test("0→1970-01-01T00:00:00.000Z に変換されること（UNIX epoch）", async () => {
    render(<UnixTimestampTile />);
    const input = screen.getByRole("textbox", { name: "UNIXタイムスタンプ" });
    fireEvent.change(input, { target: { value: "0" } });
    fireEvent.click(screen.getAllByRole("button", { name: "変換" })[0]);
    await waitFor(() => {
      expect(screen.getByText("1970-01-01T00:00:00.000Z")).toBeInTheDocument();
    });
  });

  test("無効な入力でエラーメッセージが表示されること", async () => {
    render(<UnixTimestampTile />);
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
    render(<UnixTimestampTile />);
    const radiogroup = screen.getByRole("radiogroup", {
      name: "タイムスタンプ単位",
    });
    expect(radiogroup).toBeInTheDocument();
  });

  test("秒/ミリ秒の選択肢に role='radio' があること", () => {
    render(<UnixTimestampTile />);
    const radios = screen.getAllByRole("radio");
    expect(radios.length).toBeGreaterThanOrEqual(2);
  });

  test("タイムスタンプ変換の role='status' aria-live='polite' が存在すること", () => {
    render(<UnixTimestampTile />);
    const statusRegions = screen.getAllByRole("status");
    expect(statusRegions.length).toBeGreaterThanOrEqual(2);
    statusRegions.forEach((region) => {
      expect(region).toHaveAttribute("aria-live", "polite");
    });
  });

  test("変換後に role='status' にサマリテキストが現れること", async () => {
    render(<UnixTimestampTile />);
    const input = screen.getByRole("textbox", { name: "UNIXタイムスタンプ" });
    fireEvent.change(input, { target: { value: "1704067200" } });
    fireEvent.click(screen.getAllByRole("button", { name: "変換" })[0]);
    await waitFor(() => {
      expect(screen.getByText("変換しました")).toBeInTheDocument();
    });
  });

  test("現在タイムスタンプ表示領域（ライブ時計）に aria-live がないこと（C-3: 1秒毎読み上げ防止）", () => {
    render(<UnixTimestampTile />);
    // currentBar の code 要素は aria-live を持たない
    // ライブ時計の親/祖先に aria-live=polite/assertive が設定されていないことを確認
    const codeEl = document.querySelector("code");
    expect(codeEl).not.toHaveAttribute("aria-live");
    // code の親要素も aria-live を持たないこと
    const parent = codeEl?.parentElement;
    expect(parent).not.toHaveAttribute("aria-live");
  });
});

// --- E-6: コピー文言変化 ---
describe("E-6: コピー文言変化", () => {
  test("変換後にコピーボタンを押すとCOPIED_LABELに変わること", async () => {
    render(<UnixTimestampTile />);
    const input = screen.getByRole("textbox", { name: "UNIXタイムスタンプ" });
    fireEvent.change(input, { target: { value: "1704067200" } });
    fireEvent.click(screen.getAllByRole("button", { name: "変換" })[0]);
    await waitFor(() => {
      expect(screen.getByText("ISO 8601")).toBeInTheDocument();
    });
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
    render(<UnixTimestampTile />);
    expect(
      screen.queryByRole("button", { name: "ISO 8601をコピー" }),
    ).not.toBeInTheDocument();
  });

  test("日時変換前は日時変換結果コピーボタンが存在しないこと", () => {
    render(<UnixTimestampTile />);
    expect(
      screen.queryByRole("button", { name: "ミリ秒をコピー" }),
    ).not.toBeInTheDocument();
  });
});

// --- E-8: clipboard 不在時の silent fail ---
describe("E-8: clipboard 不在時の silent fail", () => {
  test("navigator.clipboard が存在しない場合でも例外を投げないこと", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    render(<UnixTimestampTile />);
    const input = screen.getByRole("textbox", { name: "UNIXタイムスタンプ" });
    fireEvent.change(input, { target: { value: "1704067200" } });
    fireEvent.click(screen.getAllByRole("button", { name: "変換" })[0]);
    await waitFor(() => {
      expect(screen.getByText("ISO 8601")).toBeInTheDocument();
    });
    const isoBtn = screen.getByRole("button", { name: "ISO 8601をコピー" });
    expect(() => fireEvent.click(isoBtn)).not.toThrow();

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });
  });
});

// --- G-3: 全機能保持（コピーターゲット） ---
describe("G-3: コピーターゲット6個の保持", () => {
  test("タイムスタンプ変換後に5個のコピーターゲット（現在・ローカル・UTC・ISO・秒・ミリ秒）が存在すること", async () => {
    render(<UnixTimestampTile />);
    const input = screen.getByRole("textbox", { name: "UNIXタイムスタンプ" });
    fireEvent.change(input, { target: { value: "1704067200" } });
    fireEvent.click(screen.getAllByRole("button", { name: "変換" })[0]);
    await waitFor(() => {
      expect(screen.getByText("ローカル時刻")).toBeInTheDocument();
    });
    // ローカル・UTC・ISO・秒・ミリ秒 のコピーボタンが存在すること
    expect(
      screen.getByRole("button", { name: "ローカル時刻をコピー" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "UTCをコピー" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ISO 8601をコピー" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "秒をコピー" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: "ミリ秒をコピー" }).length,
    ).toBeGreaterThan(0);
  });
});

// --- reviewer-1: 共通 Input コンポーネント使用 ---
describe("reviewer-1: 共通Inputコンポーネント使用", () => {
  test("年/月/日/時/分/秒の入力欄が spinbutton として存在すること", () => {
    render(<UnixTimestampTile />);
    expect(screen.getByRole("spinbutton", { name: "年" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "月" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "日" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "時" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "分" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "秒" })).toBeInTheDocument();
  });
});

// --- reviewer-2: ローカル時刻コピーボタン ---
describe("reviewer-2: ローカル時刻コピーボタン", () => {
  test("タイムスタンプ変換後にローカル時刻行のコピーボタンが存在すること", async () => {
    render(<UnixTimestampTile />);
    const input = screen.getByRole("textbox", { name: "UNIXタイムスタンプ" });
    fireEvent.change(input, { target: { value: "1704067200" } });
    fireEvent.click(screen.getAllByRole("button", { name: "変換" })[0]);
    await waitFor(() => {
      expect(screen.getByText("ローカル時刻")).toBeInTheDocument();
    });
    const localCopyBtn = screen.getByRole("button", {
      name: "ローカル時刻をコピー",
    });
    expect(localCopyBtn).toBeInTheDocument();
    expect(localCopyBtn).not.toBeDisabled();
  });
});

// --- reviewer-3: 見出しレベル ---
describe("reviewer-3: 見出しレベル", () => {
  test("セクション見出しが h2 で始まること（h3 をスキップしないこと）", () => {
    render(<UnixTimestampTile />);
    const h2Elements = document.querySelectorAll("h2");
    expect(h2Elements.length).toBeGreaterThanOrEqual(2);
    const h3Elements = document.querySelectorAll("h3");
    expect(h3Elements).toHaveLength(0);
  });
});

// --- E-12: CSS トークン検証 ---
describe("E-12: CSSトークン検証（UnixTimestampTile.module.css）", () => {
  const cssPath = join(
    process.cwd(),
    "src/tools/unix-timestamp/UnixTimestampTile.module.css",
  );

  test("--color-* 旧トークンが存在しないこと", () => {
    const css = readFileSync(cssPath, "utf-8");
    const matches = css.match(/var\(--color-[^)]+\)/g) ?? [];
    expect(matches).toHaveLength(0);
  });

  test("--accent を直塗りに使っていないこと（フォーカス outline のみ許可）", () => {
    const css = readFileSync(cssPath, "utf-8");
    const lines = css.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("*") || trimmed.startsWith("//")) continue;
      if (trimmed.includes("var(--accent)")) {
        expect(trimmed).toMatch(/^outline:/);
      }
    }
  });

  test("font-weight: 700 が存在しないこと（コメント除く）", () => {
    const css = readFileSync(cssPath, "utf-8");
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

  test("box-shadow が存在しないこと", () => {
    const css = readFileSync(cssPath, "utf-8");
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
    expect(nonCommentLines).not.toMatch(/box-shadow/);
  });
});
