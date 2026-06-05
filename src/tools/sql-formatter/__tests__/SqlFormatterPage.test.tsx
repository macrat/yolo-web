import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import SqlFormatterPage from "../SqlFormatterPage";

// vi.hoisted でモック変数をホイストして動的に copiedKey を制御できるようにする
const mockHook = vi.hoisted(() => ({
  copy: vi.fn(),
  copiedKey: null as string | number | boolean | null,
}));

// useCopyToClipboard をモックする（clipboard API 不在環境）
vi.mock("@/components/hooks/useCopyToClipboard", () => ({
  useCopyToClipboard: () => mockHook,
  COPIED_LABEL: "コピーしました",
}));

describe("SqlFormatterPage", () => {
  beforeEach(() => {
    // 各テスト前にコピー状態をリセット
    mockHook.copiedKey = null;
    mockHook.copy = vi.fn();
  });

  // E-1: 基本レンダリング
  test("renders without crashing", () => {
    render(<SqlFormatterPage />);
    expect(screen.getByLabelText("SQL入力")).toBeInTheDocument();
  });

  // E-10: 入出力欄が存在する（確定提示方式）
  test("renders input and output areas", () => {
    render(<SqlFormatterPage />);
    expect(screen.getByLabelText("SQL入力")).toBeInTheDocument();
    expect(screen.getByLabelText("SQL出力")).toBeInTheDocument();
  });

  // E-3: 空入力時はエラーなし
  test("shows no error on empty input", () => {
    render(<SqlFormatterPage />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // E-2: 整形ボタンで出力が更新される
  test("formats SQL when 整形 button is clicked", () => {
    render(<SqlFormatterPage />);
    const input = screen.getByLabelText("SQL入力");
    fireEvent.change(input, {
      target: { value: "select id, name from users where id = 1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const output = screen.getByLabelText("SQL出力") as HTMLTextAreaElement;
    expect(output.value).toContain("SELECT");
    expect(output.value).toContain("FROM");
  });

  // E-2: 圧縮ボタンで出力が更新される
  test("minifies SQL when 圧縮 button is clicked", () => {
    render(<SqlFormatterPage />);
    const input = screen.getByLabelText("SQL入力");
    fireEvent.change(input, {
      target: {
        value: "SELECT id,\n  name\nFROM users\nWHERE id = 1",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "圧縮" }));
    const output = screen.getByLabelText("SQL出力") as HTMLTextAreaElement;
    expect(output.value).not.toContain("\n");
  });

  // E-4: 変換ロジックの正確性（デフォルトは大文字キーワード）
  test("uppercases keywords by default", () => {
    render(<SqlFormatterPage />);
    const input = screen.getByLabelText("SQL入力");
    fireEvent.change(input, {
      target: { value: "select id from users" },
    });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const output = screen.getByLabelText("SQL出力") as HTMLTextAreaElement;
    expect(output.value).toContain("SELECT");
    expect(output.value).toContain("FROM");
  });

  // E-4: インデント選択が整形に反映される（4スペース）
  test("uses 4 spaces indent when selected", () => {
    render(<SqlFormatterPage />);
    const indentSelect = screen.getByLabelText("インデント");
    fireEvent.change(indentSelect, { target: { value: "4" } });
    const input = screen.getByLabelText("SQL入力");
    fireEvent.change(input, {
      target: {
        value: "select * from users where status = 'active' and age > 18",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const output = screen.getByLabelText("SQL出力") as HTMLTextAreaElement;
    // AND は sub-clause で1段インデント → 4スペース
    const lines = output.value.split("\n");
    const andLine = lines.find((l) => l.trim().startsWith("AND"));
    expect(andLine).toBeDefined();
    expect(andLine!.startsWith("    ")).toBe(true);
  });

  // E-4: キーワード大文字トグルスイッチで小文字切り替え
  test("lowercases keywords when uppercase toggle is turned off", () => {
    render(<SqlFormatterPage />);
    const toggle = screen.getByRole("switch", { name: "キーワード大文字" });
    fireEvent.click(toggle); // toggle off
    const input = screen.getByLabelText("SQL入力");
    fireEvent.change(input, {
      target: { value: "SELECT id FROM users" },
    });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const output = screen.getByLabelText("SQL出力") as HTMLTextAreaElement;
    expect(output.value).toContain("select");
    expect(output.value).toContain("from");
  });

  // E-5: ARIA — role="status" aria-live="polite" 領域が存在する
  test("has role=status region with aria-live=polite", () => {
    render(<SqlFormatterPage />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeInTheDocument();
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  // E-5a: 整形後に role="status" 領域に実テキストサマリが表示される（C-3）
  test("shows summary text in role=status region after formatting", () => {
    render(<SqlFormatterPage />);
    const input = screen.getByLabelText("SQL入力");
    fireEvent.change(input, {
      target: { value: "select id from users" },
    });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveTextContent("整形しました");
  });

  // E-5b: 圧縮後に role="status" 領域に実テキストサマリが表示される（C-3）
  test("shows summary text in role=status region after minifying", () => {
    render(<SqlFormatterPage />);
    const input = screen.getByLabelText("SQL入力");
    fireEvent.change(input, {
      target: { value: "SELECT id FROM users" },
    });
    fireEvent.click(screen.getByRole("button", { name: "圧縮" }));
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveTextContent("圧縮しました");
  });

  // E-7: 出力が空のときコピーボタンが disabled
  test("copy button is disabled when output is empty", () => {
    render(<SqlFormatterPage />);
    const copyButton = screen.getByRole("button", { name: "コピー" });
    expect(copyButton).toBeDisabled();
  });

  // E-7: 出力があるときコピーボタンが enabled
  test("copy button is enabled when output has content", () => {
    render(<SqlFormatterPage />);
    const input = screen.getByLabelText("SQL入力");
    fireEvent.change(input, {
      target: { value: "select id from users" },
    });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const copyButton = screen.getByRole("button", { name: "コピー" });
    expect(copyButton).not.toBeDisabled();
  });

  // E-6: コピー前は "コピー" が表示される
  test("copy button label is コピー when not copied", () => {
    mockHook.copiedKey = null;
    render(<SqlFormatterPage />);
    const input = screen.getByLabelText("SQL入力");
    fireEvent.change(input, {
      target: { value: "select id from users" },
    });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    expect(screen.getByRole("button", { name: "コピー" })).toBeInTheDocument();
  });

  // E-6: コピー後は COPIED_LABEL ("コピーしました") が表示される
  test("copy button label changes to COPIED_LABEL when copiedKey is set", () => {
    mockHook.copiedKey = true;
    render(<SqlFormatterPage />);
    const input = screen.getByLabelText("SQL入力");
    fireEvent.change(input, {
      target: { value: "select id from users" },
    });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    expect(
      screen.getByRole("button", { name: "コピーしました" }),
    ).toBeInTheDocument();
  });

  // E-8: navigator.clipboard が存在しない環境でも例外を投げない
  test("does not throw when navigator.clipboard is absent", () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    expect(() => {
      render(<SqlFormatterPage />);
    }).not.toThrow();

    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
      writable: true,
    });
  });

  // E-12: CSS トークン検証
  test("CSS does not use deprecated --color-* tokens or --accent direct fill or font-weight 700", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/sql-formatter/SqlFormatterPage.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");

    // 旧トークン --color-* が存在しないこと
    expect(css).not.toMatch(/var\(--color-/);

    // background や color プロパティに --accent が直接使われていないこと
    // ToggleSwitch に移行後、SqlFormatterPage.module.css 内に accent-color 宣言は不要
    const accentDirectUse = css.match(
      /(?:background|color|accent-color)\s*:\s*var\(--accent\)/g,
    );
    expect(accentDirectUse).toBeNull();

    // font-weight: 700 が CSS 宣言として存在しないこと（コメント除去後）
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssWithoutComments).not.toMatch(/font-weight\s*:\s*700/);
  });
});
