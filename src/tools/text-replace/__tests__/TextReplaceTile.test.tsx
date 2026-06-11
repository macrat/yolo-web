/**
 * TextReplaceTile のユニットテスト（TDD: 実装前に書く）
 *
 * 検証観点:
 * - V-1: variant=full での基本レンダリング（3 ToggleSwitch・入出力欄・role=status）
 * - V-2: 置換ロジック（通常・正規表現・大文字小文字・全置換）
 * - V-3: 置換件数サマリが role=status に表示される（C-3 要件）
 * - V-4: 正規表現エラー時に日本語エラーが表示される（A-4・G-2 要件）
 * - V-5: 正規表現 ON 時に補足説明が表示される（G-2 要件）
 * - V-6: id インスタンス一意性（複数同居で id 重複なし・A-6 要件）
 * - V-7: コピーボタン disabled 制御（空出力時）
 * - V-8: コピー動作（コピー文言変化・clipboard 不在 silent fail）
 * - V-9: アクセシビリティ（role=status/aria-live・role=status 外の出力欄）
 * - V-10: CSS トークン検証（--color-* ゼロ・font-weight:700 ゼロ・--accent 直塗りなし）
 * - V-11: variant 未指定（デフォルト=full）
 * - V-12: ルート要素が Panel であること（A-1 要件）
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TextReplaceTile from "../TextReplaceTile";

// navigator.clipboard のモック
const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: mockWriteText },
  writable: true,
  configurable: true,
});

// --- V-1: variant=full での基本レンダリング ---
describe("V-1: variant=full 基本レンダリング", () => {
  it("3つのToggleSwitchが表示される（正規表現・大文字小文字・すべて置換）", () => {
    render(<TextReplaceTile variant="full" />);
    expect(
      screen.getByRole("switch", { name: "正規表現" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "大文字小文字を区別" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "すべて置換" }),
    ).toBeInTheDocument();
  });

  it("入力テキスト・検索文字列・置換文字列・置換結果の欄が存在する", () => {
    render(<TextReplaceTile variant="full" />);
    expect(screen.getByLabelText("入力テキスト")).toBeInTheDocument();
    expect(screen.getByLabelText("検索文字列")).toBeInTheDocument();
    expect(screen.getByLabelText("置換文字列")).toBeInTheDocument();
    expect(screen.getByLabelText("置換結果")).toBeInTheDocument();
  });

  it("role=status のライブリージョンが存在する", () => {
    render(<TextReplaceTile variant="full" />);
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("コピーボタンが存在する", () => {
    render(<TextReplaceTile variant="full" />);
    // 初期は disabled だが存在する
    expect(screen.getByRole("button", { name: "コピー" })).toBeInTheDocument();
  });
});

// --- V-2: 置換ロジック ---
describe("V-2: 置換ロジック", () => {
  it("通常置換が動く（全置換デフォルト）", () => {
    render(<TextReplaceTile variant="full" />);
    fireEvent.change(screen.getByLabelText("入力テキスト"), {
      target: { value: "Hello World Hello" },
    });
    fireEvent.change(screen.getByLabelText("検索文字列"), {
      target: { value: "Hello" },
    });
    fireEvent.change(screen.getByLabelText("置換文字列"), {
      target: { value: "Hi" },
    });
    expect(screen.getByLabelText("置換結果")).toHaveValue("Hi World Hi");
  });

  it("正規表現モードで数字列を置換できる", () => {
    render(<TextReplaceTile variant="full" />);
    fireEvent.change(screen.getByLabelText("入力テキスト"), {
      target: { value: "foo123bar456" },
    });
    fireEvent.change(screen.getByLabelText("検索文字列"), {
      target: { value: "\\d+" },
    });
    fireEvent.change(screen.getByLabelText("置換文字列"), {
      target: { value: "NUM" },
    });
    // 正規表現ON
    fireEvent.click(screen.getByRole("switch", { name: "正規表現" }));
    expect(screen.getByLabelText("置換結果")).toHaveValue("fooNUMbarNUM");
  });

  it("大文字小文字区別トグルOFFで大文字小文字を無視して置換する", () => {
    render(<TextReplaceTile variant="full" />);
    fireEvent.change(screen.getByLabelText("入力テキスト"), {
      target: { value: "Hello HELLO hello" },
    });
    fireEvent.change(screen.getByLabelText("検索文字列"), {
      target: { value: "hello" },
    });
    fireEvent.change(screen.getByLabelText("置換文字列"), {
      target: { value: "hi" },
    });
    // 初期状態（区別ON）
    expect(screen.getByLabelText("置換結果")).toHaveValue("Hello HELLO hi");
    // 区別OFFに
    fireEvent.click(screen.getByRole("switch", { name: "大文字小文字を区別" }));
    expect(screen.getByLabelText("置換結果")).toHaveValue("hi hi hi");
  });

  it("すべて置換トグルOFFで最初の1件だけ置換する", () => {
    render(<TextReplaceTile variant="full" />);
    fireEvent.change(screen.getByLabelText("入力テキスト"), {
      target: { value: "foo bar foo" },
    });
    fireEvent.change(screen.getByLabelText("検索文字列"), {
      target: { value: "foo" },
    });
    fireEvent.change(screen.getByLabelText("置換文字列"), {
      target: { value: "baz" },
    });
    fireEvent.click(screen.getByRole("switch", { name: "すべて置換" }));
    expect(screen.getByLabelText("置換結果")).toHaveValue("baz bar foo");
  });

  it("入力テキストが空のとき結果が空になる", () => {
    render(<TextReplaceTile variant="full" />);
    fireEvent.change(screen.getByLabelText("検索文字列"), {
      target: { value: "hello" },
    });
    expect(screen.getByLabelText("置換結果")).toHaveValue("");
  });

  it("検索文字列が空のとき結果は入力と同じ（logic.ts 仕様）", () => {
    render(<TextReplaceTile variant="full" />);
    fireEvent.change(screen.getByLabelText("入力テキスト"), {
      target: { value: "テスト" },
    });
    expect(screen.getByLabelText("置換結果")).toHaveValue("テスト");
  });
});

// --- V-3: 置換件数サマリ ---
describe("V-3: 置換件数サマリ", () => {
  it("置換が発生したとき件数が role=status に含まれる", () => {
    render(<TextReplaceTile variant="full" />);
    fireEvent.change(screen.getByLabelText("入力テキスト"), {
      target: { value: "foo bar foo baz foo" },
    });
    fireEvent.change(screen.getByLabelText("検索文字列"), {
      target: { value: "foo" },
    });
    fireEvent.change(screen.getByLabelText("置換文字列"), {
      target: { value: "qux" },
    });
    expect(screen.getByRole("status")).toHaveTextContent(/3/);
  });
});

// --- V-4: 正規表現エラー（日本語化） ---
describe("V-4: 正規表現エラー日本語化", () => {
  it("不正な正規表現入力時に日本語エラーが表示される（A-4 要件）", () => {
    render(<TextReplaceTile variant="full" />);
    fireEvent.change(screen.getByLabelText("入力テキスト"), {
      target: { value: "test" },
    });
    fireEvent.change(screen.getByLabelText("検索文字列"), {
      target: { value: "[invalid" },
    });
    fireEvent.click(screen.getByRole("switch", { name: "正規表現" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    // 英語エラーが露出していないこと
    expect(screen.queryByText("Invalid regular expression")).toBeNull();
  });

  it("正規表現エラー時にコピーボタンが disabled になる", () => {
    render(<TextReplaceTile variant="full" />);
    fireEvent.change(screen.getByLabelText("入力テキスト"), {
      target: { value: "test" },
    });
    fireEvent.change(screen.getByLabelText("検索文字列"), {
      target: { value: "[invalid" },
    });
    fireEvent.click(screen.getByRole("switch", { name: "正規表現" }));
    expect(screen.getByRole("button", { name: "コピー" })).toBeDisabled();
  });
});

// --- V-5: 正規表現 ON 時の補足説明 ---
describe("V-5: 正規表現ON時の補足説明", () => {
  it("初期状態（オフ）では補足説明が表示されない", () => {
    render(<TextReplaceTile variant="full" />);
    expect(
      screen.queryByText(/分からなければオフのまま/),
    ).not.toBeInTheDocument();
  });

  it("正規表現スイッチON時に補足説明が表示される", () => {
    render(<TextReplaceTile variant="full" />);
    fireEvent.click(screen.getByRole("switch", { name: "正規表現" }));
    expect(screen.getByText(/分からなければオフのまま/)).toBeInTheDocument();
  });

  it("正規表現スイッチON時に $1 などの説明が含まれる", () => {
    render(<TextReplaceTile variant="full" />);
    fireEvent.click(screen.getByRole("switch", { name: "正規表現" }));
    const regexHint = screen.getByTestId("regex-hint");
    expect(regexHint).toBeInTheDocument();
    expect(regexHint.textContent).toMatch(/\$1/);
  });
});

// --- V-6: id インスタンス一意性 ---
describe("V-6: id インスタンス一意性", () => {
  it("同一ページに2つ描画しても textarea の id が重複しない", () => {
    const { container: c1 } = render(<TextReplaceTile variant="full" />);
    const { container: c2 } = render(<TextReplaceTile variant="full" />);

    const ids1 = [...c1.querySelectorAll("[id]")].map((el) => el.id);
    const ids2 = [...c2.querySelectorAll("[id]")].map((el) => el.id);

    const overlap = ids1.filter((id) => ids2.includes(id));
    expect(overlap).toHaveLength(0);
  });

  it("各 label の htmlFor が同コンテナ内の input/textarea の id と対応している", () => {
    const { container } = render(<TextReplaceTile variant="full" />);
    const labels = [...container.querySelectorAll("label[for]")];
    labels.forEach((label) => {
      const targetId = label.getAttribute("for")!;
      const target = container.querySelector(`#${CSS.escape(targetId)}`);
      expect(target).not.toBeNull();
    });
  });
});

// --- V-7: コピーボタン disabled 制御 ---
describe("V-7: コピーボタン disabled 制御", () => {
  it("初期状態（出力空）でコピーボタンが disabled", () => {
    render(<TextReplaceTile variant="full" />);
    expect(screen.getByRole("button", { name: "コピー" })).toBeDisabled();
  });

  it("置換結果がある場合コピーボタンは有効", () => {
    render(<TextReplaceTile variant="full" />);
    fireEvent.change(screen.getByLabelText("入力テキスト"), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByLabelText("検索文字列"), {
      target: { value: "a" },
    });
    fireEvent.change(screen.getByLabelText("置換文字列"), {
      target: { value: "A" },
    });
    expect(screen.getByRole("button", { name: "コピー" })).not.toBeDisabled();
  });
});

// --- V-8: コピー動作 ---
describe("V-8: コピー動作", () => {
  beforeEach(() => {
    mockWriteText.mockClear();
  });

  it("コピーボタン押下後にコピー済み文言に変化する", async () => {
    render(<TextReplaceTile variant="full" />);
    fireEvent.change(screen.getByLabelText("入力テキスト"), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByLabelText("検索文字列"), {
      target: { value: "a" },
    });
    fireEvent.change(screen.getByLabelText("置換文字列"), {
      target: { value: "A" },
    });
    const copyBtn = screen.getByRole("button", { name: "コピー" });
    await act(async () => {
      fireEvent.click(copyBtn);
    });
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "コピーしました" }),
      ).toBeInTheDocument();
    });
  });

  it("navigator.clipboard が存在しない環境でコピーが例外を投げない", async () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    render(<TextReplaceTile variant="full" />);
    fireEvent.change(screen.getByLabelText("入力テキスト"), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByLabelText("検索文字列"), {
      target: { value: "a" },
    });

    const copyBtn = screen.getByRole("button", { name: "コピー" });
    await expect(
      act(async () => {
        fireEvent.click(copyBtn);
      }),
    ).resolves.not.toThrow();

    // 後片付け
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });
});

// --- V-9: アクセシビリティ ---
describe("V-9: アクセシビリティ", () => {
  it("role=status の外に出力 textarea が存在する（C-3 実テキストノード要件）", () => {
    render(<TextReplaceTile variant="full" />);
    const statusEl = screen.getByRole("status");
    const outputTextarea = screen.getByLabelText("置換結果");
    expect(statusEl).not.toContainElement(outputTextarea);
  });
});

// --- V-10: CSS トークン検証 ---
describe("V-10: CSS トークン検証", () => {
  it("CSS ファイルに --color-* 旧トークンが存在しない", () => {
    const cssPath = resolve(__dirname, "../TextReplaceTile.module.css");
    let css = "";
    try {
      css = readFileSync(cssPath, "utf-8");
    } catch {
      return;
    }
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("CSS ファイルに font-weight: 700 が存在しない", () => {
    const cssPath = resolve(__dirname, "../TextReplaceTile.module.css");
    let css = "";
    try {
      css = readFileSync(cssPath, "utf-8");
    } catch {
      return;
    }
    expect(css).not.toMatch(/font-weight:\s*700/);
  });

  it("CSS ファイルに --accent 直塗りが存在しない（B-3 要件）", () => {
    const cssPath = resolve(__dirname, "../TextReplaceTile.module.css");
    let css = "";
    try {
      css = readFileSync(cssPath, "utf-8");
    } catch {
      return;
    }
    expect(css).not.toMatch(/background(?:-color)?:\s*var\(--accent\)/);
    expect(css).not.toMatch(/color:\s*var\(--accent\)/);
  });
});

// --- V-11: デフォルト variant ---
describe("V-11: デフォルト variant", () => {
  it("variant 未指定の場合 full と同等（3 ToggleSwitch が表示される）", () => {
    render(<TextReplaceTile />);
    expect(
      screen.getByRole("switch", { name: "正規表現" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "大文字小文字を区別" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "すべて置換" }),
    ).toBeInTheDocument();
  });
});

// --- V-12: Panel ルート要素 ---
describe("V-12: Panel ルート要素（A-1 要件）", () => {
  it("ルート要素が section タグ（Panel のデフォルト as）", () => {
    const { container } = render(<TextReplaceTile variant="full" />);
    // Panel はデフォルトで section を出力する
    expect(container.firstElementChild?.tagName).toBe("SECTION");
  });

  it("as='div' を渡すと div タグになる", () => {
    const { container } = render(<TextReplaceTile as="div" variant="full" />);
    expect(container.firstElementChild?.tagName).toBe("DIV");
  });
});
