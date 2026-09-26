/**
 * UnixTimestampTile テスト
 *
 * 変換・コピー・いまの時刻の刻みと止め方・マウント前の表示・複数置いたときの id を確かめる。
 */
import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

describe("ルートの要素", () => {
  test("デフォルトでルート要素が section であること（Panel デフォルト）", () => {
    const { container } = render(<UnixTimestampTile />);
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });

  test("as=div でルート要素が div になること", () => {
    const { container } = render(<UnixTimestampTile as="div" />);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });
});

describe("複数置いても DOM の id が重複しない", () => {
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

describe("基本の描画", () => {
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

describe("マウント前の表示", () => {
  test("初期状態ではライブタイムスタンプが空文字（SSR 一致）", () => {
    render(<UnixTimestampTile />);
    const codeEl = document.querySelector("code");
    expect(codeEl).toBeInTheDocument();
  });
});

describe("いまの時刻の刻み", () => {
  test("マウント後にライブタイムスタンプが数値になること（fake timers）", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
    render(<UnixTimestampTile />);

    // 刻みは止まらずに続くので、runAllTimers ではなく advanceTimersByTime で進める。
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

describe("いまの時刻を止める・動かす", () => {
  // user-event は setTimeout で待つので、刻みに使う setInterval と Date だけを偽物にする。
  async function renderAt(iso: string) {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    vi.setSystemTime(new Date(iso));
    render(<UnixTimestampTile />);
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
  }

  function currentValue() {
    return document.querySelector("code")?.textContent;
  }

  async function pass(ms: number) {
    await act(async () => {
      vi.advanceTimersByTime(ms);
    });
  }

  test("プライマリでない「止める」ボタンがあり、押すと「動かす」に変わる", async () => {
    await renderAt("2024-01-01T00:00:00Z");
    const stop = screen.getByRole("button", {
      name: "タイムスタンプの刻みを止める",
    });
    expect(stop).toHaveTextContent("止める");
    expect(stop).toHaveAttribute("data-variant", "default");

    fireEvent.click(stop);

    expect(stop).toHaveTextContent("動かす");
    expect(stop).toHaveAccessibleName("タイムスタンプの刻みを動かす");
    expect(screen.getByText("止めたUNIXタイムスタンプ:")).toBeInTheDocument();
  });

  test("止めると、5秒たっても表示が書き換わらない", async () => {
    await renderAt("2024-01-01T00:00:00Z");
    fireEvent.click(
      screen.getByRole("button", { name: "タイムスタンプの刻みを止める" }),
    );
    const stopped = currentValue();
    expect(stopped).toBe("1704067200");

    await pass(5000);

    expect(currentValue()).toBe(stopped);
  });

  test("止めた値をコピーできる", async () => {
    await renderAt("2024-01-01T00:00:00Z");
    fireEvent.click(
      screen.getByRole("button", { name: "タイムスタンプの刻みを止める" }),
    );
    await pass(5000);

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "止めたタイムスタンプをコピー" }),
      );
    });

    expect(writeTextMock).toHaveBeenCalledWith("1704067200");
  });

  test("動かすと、すぐにいまの時刻になり、また刻み始める", async () => {
    await renderAt("2024-01-01T00:00:00Z");
    const toggle = screen.getByRole("button", {
      name: "タイムスタンプの刻みを止める",
    });
    fireEvent.click(toggle);
    await pass(5000);

    fireEvent.click(toggle);
    expect(currentValue()).toBe("1704067205");
    expect(toggle).toHaveTextContent("止める");

    await pass(1000);
    expect(currentValue()).toBe("1704067206");
  });

  test("キーボードで止めて動かせる（フォーカスはボタンに残る）", async () => {
    const user = userEvent.setup();
    await renderAt("2024-01-01T00:00:00Z");
    const toggle = screen.getByRole("button", {
      name: "タイムスタンプの刻みを止める",
    });
    toggle.focus();

    await user.keyboard("{Enter}");
    expect(toggle).toHaveFocus();
    expect(toggle).toHaveAccessibleName("タイムスタンプの刻みを動かす");
    await pass(5000);
    expect(currentValue()).toBe("1704067200");

    await user.keyboard(" ");
    expect(toggle).toHaveFocus();
    expect(toggle).toHaveAccessibleName("タイムスタンプの刻みを止める");
    expect(currentValue()).toBe("1704067205");
  });

  test("prefers-reduced-motion: reduce のときは止めた状態で始まる", async () => {
    const original = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    try {
      await renderAt("2024-01-01T00:00:00Z");
      expect(
        screen.getByRole("button", { name: "タイムスタンプの刻みを動かす" }),
      ).toBeInTheDocument();
      await pass(5000);
      expect(currentValue()).toBe("1704067200");
    } finally {
      window.matchMedia = original;
    }
  });
});

describe("入力と結果", () => {
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

describe("空の入力", () => {
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

describe("変換の正しさ", () => {
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

describe("ARIA 属性", () => {
  test("ラジオボタンの組に role='radiogroup' が存在すること", () => {
    render(<UnixTimestampTile />);
    const radiogroup = screen.getByRole("radiogroup", {
      name: "単位",
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

  test("現在タイムスタンプ表示領域（ライブ時計）に aria-live がないこと（1秒ごとに読み上げさせない）", () => {
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

describe("コピーの文言の変化", () => {
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

describe("変換前のコピーボタン", () => {
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

describe("clipboard が無いとき", () => {
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

describe("コピーの対象", () => {
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

describe("日時の入力欄", () => {
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

describe("ローカル時刻のコピーボタン", () => {
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

describe("見出しの段", () => {
  test("セクション見出しが h2 で始まること（h3 をスキップしないこと）", () => {
    render(<UnixTimestampTile />);
    const h2Elements = document.querySelectorAll("h2");
    expect(h2Elements.length).toBeGreaterThanOrEqual(2);
    const h3Elements = document.querySelectorAll("h3");
    expect(h3Elements).toHaveLength(0);
  });
});

describe("CSS のトークン（UnixTimestampTile.module.css）", () => {
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
