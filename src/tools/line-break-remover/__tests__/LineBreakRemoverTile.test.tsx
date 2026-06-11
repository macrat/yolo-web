/**
 * LineBreakRemoverTile のユニットテスト（TDD: 実装前に書く）
 *
 * 検証観点:
 * - V-1: variant=full でのレンダリング（3モード SegmentedControl 表示・ToggleSwitch 表示）
 * - V-2: variant=remove（固定モード・SegmentedControl 非表示・ToggleSwitch 維持）
 * - V-3: variant=replace-space（固定モード・SegmentedControl 非表示・ToggleSwitch 維持）
 * - V-4: variant=smart-pdf（固定モード・SegmentedControl 非表示・行内改行 SegmentedControl 表示）
 * - V-5: variant=full で変換ロジックが動作する
 * - V-6: variant=remove でモードが固定されて動作する
 * - V-7: variant=replace-space でモードが固定されて動作する
 * - V-8: variant=smart-pdf でモードが固定されて動作する
 * - V-9: id インスタンス一意性（同一ページに2つ描画して id が重複しない）
 * - V-10: エラー日本語化・ライブリージョン・コピー disabled/enabled
 * - V-11: aria 属性（aria-labelledby / aria-live）
 * - V-12: clipboard 不在時の silent fail
 * - V-13: デフォルト variant = full
 */
import { readFileSync } from "fs";
import { join } from "path";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import LineBreakRemoverTile from "../LineBreakRemoverTile";
import { COPIED_LABEL } from "@/components/hooks/useCopyToClipboard";

// navigator.clipboard のモック
const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: mockWriteText },
  configurable: true,
  writable: true,
});

beforeEach(() => {
  vi.clearAllMocks();
});

// --- V-1: variant=full ---
describe("V-1: variant=full（全機能・3モード SegmentedControl 表示）", () => {
  it("3つの変換モードが表示される", () => {
    render(<LineBreakRemoverTile variant="full" />);
    expect(
      screen.getByRole("radio", { name: "改行を削除" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "改行をスペースに置換" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "PDFスマートモード" }),
    ).toBeInTheDocument();
  });

  it("入力欄と出力欄が存在する", () => {
    render(<LineBreakRemoverTile variant="full" />);
    expect(screen.getByLabelText("入力テキスト")).toBeInTheDocument();
    expect(screen.getByLabelText("変換結果")).toBeInTheDocument();
  });

  it("初期モード（remove）でトグルスイッチが表示される", () => {
    render(<LineBreakRemoverTile variant="full" />);
    expect(
      screen.getByRole("switch", { name: "連続する改行を1つにまとめる" }),
    ).toBeInTheDocument();
  });

  it("smart-pdf に切り替えるとトグルが非表示・行内改行オプションが表示される", () => {
    render(<LineBreakRemoverTile variant="full" />);
    fireEvent.click(screen.getByRole("radio", { name: "PDFスマートモード" }));
    expect(
      screen.queryByRole("switch", { name: "連続する改行を1つにまとめる" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "削除する" })).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "スペースに置換" }),
    ).toBeInTheDocument();
  });
});

// --- V-2: variant=remove（モード固定・SegmentedControl 非表示）---
describe("V-2: variant=remove（モード固定）", () => {
  it("モード切替 SegmentedControl が表示されない", () => {
    render(<LineBreakRemoverTile variant="remove" />);
    // remove/replace-space/PDFスマートモードのラジオが無い
    expect(
      screen.queryByRole("radio", { name: "改行を削除" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("radio", { name: "改行をスペースに置換" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("radio", { name: "PDFスマートモード" }),
    ).not.toBeInTheDocument();
  });

  it("ToggleSwitch（連続改行統合）が表示される（機能を削らない）", () => {
    render(<LineBreakRemoverTile variant="remove" />);
    expect(
      screen.getByRole("switch", { name: "連続する改行を1つにまとめる" }),
    ).toBeInTheDocument();
  });

  it("入力欄と出力欄が存在する", () => {
    render(<LineBreakRemoverTile variant="remove" />);
    expect(screen.getByLabelText("入力テキスト")).toBeInTheDocument();
    expect(screen.getByLabelText("変換結果")).toBeInTheDocument();
  });
});

// --- V-3: variant=replace-space（モード固定）---
describe("V-3: variant=replace-space（モード固定）", () => {
  it("モード切替 SegmentedControl が表示されない", () => {
    render(<LineBreakRemoverTile variant="replace-space" />);
    expect(
      screen.queryByRole("radio", { name: "改行を削除" }),
    ).not.toBeInTheDocument();
  });

  it("ToggleSwitch（連続改行統合）が表示される", () => {
    render(<LineBreakRemoverTile variant="replace-space" />);
    expect(
      screen.getByRole("switch", { name: "連続する改行を1つにまとめる" }),
    ).toBeInTheDocument();
  });

  it("入力欄と出力欄が存在する", () => {
    render(<LineBreakRemoverTile variant="replace-space" />);
    expect(screen.getByLabelText("入力テキスト")).toBeInTheDocument();
    expect(screen.getByLabelText("変換結果")).toBeInTheDocument();
  });
});

// --- V-4: variant=smart-pdf（モード固定）---
describe("V-4: variant=smart-pdf（モード固定）", () => {
  it("モード切替 SegmentedControl が表示されない", () => {
    render(<LineBreakRemoverTile variant="smart-pdf" />);
    expect(
      screen.queryByRole("radio", { name: "改行を削除" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("radio", { name: "改行をスペースに置換" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("radio", { name: "PDFスマートモード" }),
    ).not.toBeInTheDocument();
  });

  it("行内改行処理の SegmentedControl が表示される", () => {
    render(<LineBreakRemoverTile variant="smart-pdf" />);
    expect(screen.getByRole("radio", { name: "削除する" })).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "スペースに置換" }),
    ).toBeInTheDocument();
  });

  it("ToggleSwitch（連続改行統合）が表示されない（smart-pdf モード対象外）", () => {
    render(<LineBreakRemoverTile variant="smart-pdf" />);
    expect(
      screen.queryByRole("switch", { name: "連続する改行を1つにまとめる" }),
    ).not.toBeInTheDocument();
  });
});

// --- V-5: variant=full での変換動作 ---
describe("V-5: variant=full での変換", () => {
  it("デフォルト（removeモード）で改行を削除する", () => {
    render(<LineBreakRemoverTile variant="full" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "abc\ndef" } });
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toBe("abcdef");
  });

  it("replace-space モードに切り替えると改行がスペースに置換される", () => {
    render(<LineBreakRemoverTile variant="full" />);
    fireEvent.click(
      screen.getByRole("radio", { name: "改行をスペースに置換" }),
    );
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "abc\ndef" } });
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toBe("abc def");
  });

  it("smart-pdf モードで段落構造を保持する", () => {
    render(<LineBreakRemoverTile variant="full" />);
    fireEvent.click(screen.getByRole("radio", { name: "PDFスマートモード" }));
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "行1\n行2\n\n段落2" } });
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toBe("行1行2\n\n段落2");
  });

  it("モード切替後に古い結果が残らない（G-1）", () => {
    render(<LineBreakRemoverTile variant="full" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "a\nb" } });
    // remove モードの結果確認
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toBe("ab");
    // replace-space に切り替え → 即時再変換
    fireEvent.click(
      screen.getByRole("radio", { name: "改行をスペースに置換" }),
    );
    expect(output.value).toBe("a b");
  });
});

// --- V-6: variant=remove でのモード固定動作 ---
describe("V-6: variant=remove での変換", () => {
  it("改行を削除する（removeモード固定）", () => {
    render(<LineBreakRemoverTile variant="remove" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "a\nb\nc" } });
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toBe("abc");
  });

  it("連続改行統合オンで動作する", () => {
    render(<LineBreakRemoverTile variant="remove" />);
    const toggle = screen.getByRole("switch", {
      name: "連続する改行を1つにまとめる",
    });
    fireEvent.click(toggle);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "a\n\n\nb" } });
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toBe("ab");
  });
});

// --- V-7: variant=replace-space でのモード固定動作 ---
describe("V-7: variant=replace-space での変換", () => {
  it("改行をスペースに置換する", () => {
    render(<LineBreakRemoverTile variant="replace-space" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "a\nb\nc" } });
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toBe("a b c");
  });
});

// --- V-8: variant=smart-pdf でのモード固定動作 ---
describe("V-8: variant=smart-pdf での変換", () => {
  it("段落構造を保持しつつ行内改行を削除する", () => {
    render(<LineBreakRemoverTile variant="smart-pdf" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "行1\n行2\n\n段落2" } });
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toBe("行1行2\n\n段落2");
  });

  it("スペースに置換オプションで動作する", () => {
    render(<LineBreakRemoverTile variant="smart-pdf" />);
    fireEvent.click(screen.getByRole("radio", { name: "スペースに置換" }));
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "Hello\nWorld\n\nNext" } });
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toBe("Hello World\n\nNext");
  });
});

// --- V-9: id インスタンス一意性 ---
describe("V-9: id インスタンス一意性", () => {
  it("同一ページに2つ描画しても textarea id が重複しない", () => {
    const { container: c1 } = render(<LineBreakRemoverTile variant="full" />);
    const { container: c2 } = render(<LineBreakRemoverTile variant="remove" />);

    const ids1 = [...c1.querySelectorAll("[id]")].map((el) => el.id);
    const ids2 = [...c2.querySelectorAll("[id]")].map((el) => el.id);

    const overlap = ids1.filter((id) => ids2.includes(id));
    expect(overlap).toHaveLength(0);
  });

  it("variant=full と variant=smart-pdf を同居させても id が重複しない", () => {
    const { container: c1 } = render(<LineBreakRemoverTile variant="full" />);
    const { container: c2 } = render(
      <LineBreakRemoverTile variant="smart-pdf" />,
    );

    const ids1 = [...c1.querySelectorAll("[id]")].map((el) => el.id);
    const ids2 = [...c2.querySelectorAll("[id]")].map((el) => el.id);

    const overlap = ids1.filter((id) => ids2.includes(id));
    expect(overlap).toHaveLength(0);
  });
});

// --- V-10: エラー・ライブリージョン・コピー ---
describe("V-10: エラー・ライブリージョン・コピー", () => {
  it("10万文字超の入力で日本語エラーが表示される", () => {
    render(<LineBreakRemoverTile variant="full" />);
    const input = screen.getByLabelText("入力テキスト");
    const longText = "a".repeat(100_001);
    fireEvent.change(input, { target: { value: longText } });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("alert").textContent).toMatch(
      /テキストが長すぎます/,
    );
  });

  it("role=status のライブリージョンが存在する", () => {
    render(<LineBreakRemoverTile variant="full" />);
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("変換後にライブリージョンに件数サマリが表示される", () => {
    render(<LineBreakRemoverTile variant="full" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "abc\ndef" } });
    const status = screen.getByRole("status");
    expect(status.textContent).not.toBe("");
    expect(status.textContent).toMatch(/1件/);
  });

  it("空入力時はコピーボタンが disabled", () => {
    render(<LineBreakRemoverTile variant="full" />);
    const copyButton = screen.getByRole("button", { name: "コピー" });
    expect(copyButton).toBeDisabled();
  });

  it("結果がある場合コピーボタンが有効", () => {
    render(<LineBreakRemoverTile variant="full" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "abc\ndef" } });
    expect(screen.getByRole("button", { name: "コピー" })).not.toBeDisabled();
  });

  it("コピーボタンクリック後に COPIED_LABEL に変化する", async () => {
    render(<LineBreakRemoverTile variant="full" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "abc\ndef" } });

    const copyButton = screen.getByRole("button", { name: "コピー" });
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(
      screen.getByRole("button", { name: COPIED_LABEL }),
    ).toBeInTheDocument();
  });
});

// --- V-11: aria 属性 ---
describe("V-11: aria 属性", () => {
  it("variant=full: 変換モード SegmentedControl に aria-labelledby が付与されている", () => {
    render(<LineBreakRemoverTile variant="full" />);
    const radiogroups = screen.getAllByRole("radiogroup");
    const modeGroup = radiogroups.find(
      (el) => el.getAttribute("aria-labelledby") !== null,
    );
    expect(modeGroup).toBeDefined();
  });

  it("variant=full, smart-pdf モード時: 行内改行処理の SegmentedControl にも aria-labelledby が付与される", () => {
    render(<LineBreakRemoverTile variant="full" />);
    fireEvent.click(screen.getByRole("radio", { name: "PDFスマートモード" }));
    const radiogroups = screen.getAllByRole("radiogroup");
    // 2つの radiogroup が存在する
    expect(radiogroups.length).toBeGreaterThanOrEqual(2);
    // 両方に aria-labelledby が付与されている
    radiogroups.forEach((rg) => {
      expect(rg.getAttribute("aria-labelledby")).not.toBeNull();
    });
  });

  it("出力 textarea が role=status を持たない（readOnly textarea ラップ不可）", () => {
    render(<LineBreakRemoverTile variant="full" />);
    const outputTextarea = screen.getByLabelText("変換結果");
    expect(outputTextarea.getAttribute("role")).not.toBe("status");
  });
});

// --- V-12: clipboard 不在時の silent fail ---
describe("V-12: clipboard 不在時の silent fail", () => {
  it("navigator.clipboard が undefined でもコピー操作が例外を投げない", async () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    render(<LineBreakRemoverTile variant="full" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "abc\ndef" } });

    await expect(async () => {
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "コピー" }));
      });
    }).not.toThrow();

    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
      writable: true,
    });
  });
});

// --- V-13: デフォルト variant ---
describe("V-13: デフォルト variant", () => {
  it("variant 未指定の場合 full と同等（3モード SegmentedControl 表示）", () => {
    render(<LineBreakRemoverTile />);
    expect(
      screen.getByRole("radio", { name: "改行を削除" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "改行をスペースに置換" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "PDFスマートモード" }),
    ).toBeInTheDocument();
  });
});

// --- V-14: CSS トークン検証（旧 E-12 相当の回帰ガード） ---
describe("V-14: CSS トークン検証", () => {
  const cssPath = join(__dirname, "..", "LineBreakRemoverTile.module.css");

  it("--color-* 旧トークンを使用しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("--accent を背景色・文字色に直接使用しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    const illegalAccentUse = css.match(
      /(?:background|background-color|color)\s*:\s*var\(--accent\)/g,
    );
    expect(illegalAccentUse).toBeNull();
  });

  it("font-weight: 700 を使用しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight:\s*700/);
  });
});
