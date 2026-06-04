/**
 * LineBreakRemoverPage — 単一実装（フル機能ページ本体）のテスト
 * E-1〜E-12 の観点を網羅する
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import LineBreakRemoverPage from "../LineBreakRemoverPage";
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

// E-1: 基本レンダリング
describe("E-1: 基本レンダリング", () => {
  it("コンポーネントが正常にレンダリングされる", () => {
    render(<LineBreakRemoverPage />);
    expect(screen.getByLabelText("入力テキスト")).toBeInTheDocument();
    expect(screen.getByLabelText("変換結果")).toBeInTheDocument();
  });

  it("3つの変換モードが表示される", () => {
    render(<LineBreakRemoverPage />);
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

// E-2: 入力→結果更新
describe("E-2: 入力→結果更新", () => {
  it("入力テキストが変化すると結果がリアルタイムで更新される", () => {
    render(<LineBreakRemoverPage />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "abc\ndef" } });
    // remove モード (デフォルト): 改行を削除
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toBe("abcdef");
  });

  it("モード切替後もリアルタイムで変換される", () => {
    render(<LineBreakRemoverPage />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "abc\ndef" } });

    // replace-space モードに切替
    fireEvent.click(
      screen.getByRole("radio", { name: "改行をスペースに置換" }),
    );
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toBe("abc def");
  });
});

// E-3: 空入力
describe("E-3: 空入力", () => {
  it("初期状態で入力が空のとき出力も空", () => {
    render(<LineBreakRemoverPage />);
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toBe("");
  });

  it("空入力時にエラーが表示されない", () => {
    render(<LineBreakRemoverPage />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("空入力時にコピーボタンが disabled", () => {
    render(<LineBreakRemoverPage />);
    const copyButton = screen.getByRole("button", { name: "コピー" });
    expect(copyButton).toBeDisabled();
  });
});

// E-4: 変換ロジックの正確性（UI経由）
describe("E-4: 変換ロジックの正確性", () => {
  it("removeモード: 改行を削除する", () => {
    render(<LineBreakRemoverPage />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "a\nb\nc" } });
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toBe("abc");
  });

  it("replace-spaceモード: 改行をスペースに置換する", () => {
    render(<LineBreakRemoverPage />);
    fireEvent.click(
      screen.getByRole("radio", { name: "改行をスペースに置換" }),
    );
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "a\nb\nc" } });
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toBe("a b c");
  });

  it("smart-pdfモード: 段落間の空行を保持し、段落内改行を削除", () => {
    render(<LineBreakRemoverPage />);
    fireEvent.click(screen.getByRole("radio", { name: "PDFスマートモード" }));
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "行1\n行2\n\n段落2" } });
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toBe("行1行2\n\n段落2");
  });

  it("removeモード+連続改行統合: 連続改行を1つにしてから削除", () => {
    render(<LineBreakRemoverPage />);
    // 「連続する改行を1つにまとめる」トグルを有効化
    const toggle = screen.getByRole("switch", {
      name: "連続する改行を1つにまとめる",
    });
    fireEvent.click(toggle);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "a\n\n\nb" } });
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toBe("ab");
  });

  it("smart-pdfモード+スペース結合: 行内改行をスペースに置換", () => {
    render(<LineBreakRemoverPage />);
    fireEvent.click(screen.getByRole("radio", { name: "PDFスマートモード" }));
    // スペース置換オプションに切替
    const spaceRadio = screen.getByRole("radio", { name: "スペースに置換" });
    fireEvent.click(spaceRadio);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "Hello\nWorld\n\nNext" } });
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toBe("Hello World\n\nNext");
  });
});

// E-5: ARIA
describe("E-5: ARIA", () => {
  it("変換モード SegmentedControl が role='radiogroup' を持つ", () => {
    render(<LineBreakRemoverPage />);
    // 変換モード選択のradiogroupが存在する
    const radiogroups = screen.getAllByRole("radiogroup");
    expect(radiogroups.length).toBeGreaterThanOrEqual(1);
  });

  it("変換モード SegmentedControl に aria-labelledby が付与されている", () => {
    render(<LineBreakRemoverPage />);
    // 変換モードのradiogroupにaria-labelledbyが付与されている
    const radiogroups = screen.getAllByRole("radiogroup");
    const modeGroup = radiogroups.find(
      (el) => el.getAttribute("aria-labelledby") === "lbr-mode-label",
    );
    expect(modeGroup).toBeDefined();
  });

  it("smart-pdfモード時に行内改行処理のSecondary SegmentedControl が表示される", () => {
    render(<LineBreakRemoverPage />);
    fireEvent.click(screen.getByRole("radio", { name: "PDFスマートモード" }));
    // smart-pdfモード時は2つのradiogroupが存在する
    const radiogroups = screen.getAllByRole("radiogroup");
    expect(radiogroups.length).toBeGreaterThanOrEqual(2);
    // 行内改行処理のradiogroupにaria-labelledbyが付与されている
    const joinGroup = radiogroups.find(
      (el) => el.getAttribute("aria-labelledby") === "lbr-join-label",
    );
    expect(joinGroup).toBeDefined();
  });

  it("ライブリージョン（role=status, aria-live=polite）が存在する", () => {
    render(<LineBreakRemoverPage />);
    const statusEl = document.querySelector(
      "[role='status'][aria-live='polite']",
    );
    expect(statusEl).toBeInTheDocument();
  });

  it("出力 textarea が role=status を持たない（C-3: readOnly textarea ラップ不可）", () => {
    render(<LineBreakRemoverPage />);
    const outputTextarea = screen.getByLabelText("変換結果");
    expect(outputTextarea.getAttribute("role")).not.toBe("status");
  });

  it("ライブリージョンに実テキストノードのサマリが表示される（C-3準拠）", () => {
    render(<LineBreakRemoverPage />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "abc\ndef" } });
    const statusEl = document.querySelector(
      "[role='status'][aria-live='polite']",
    );
    // サマリテキストが空でないこと
    expect(statusEl?.textContent).not.toBe("");
  });
});

// E-6: コピー文言変化
describe("E-6: コピー文言変化", () => {
  it("コピー前は「コピー」、コピー後は COPIED_LABEL が表示される", async () => {
    render(<LineBreakRemoverPage />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "abc\ndef" } });

    const copyButton = screen.getByRole("button", { name: "コピー" });
    expect(copyButton).toHaveTextContent("コピー");

    await act(async () => {
      fireEvent.click(copyButton);
    });

    // コピー後は COPIED_LABEL ("コピーしました") に変化する
    expect(
      screen.getByRole("button", { name: COPIED_LABEL }),
    ).toBeInTheDocument();
  });
});

// E-7: コピー disabled 状態
describe("E-7: コピー disabled 状態", () => {
  it("結果が空のときコピーボタンが disabled", () => {
    render(<LineBreakRemoverPage />);
    const copyButton = screen.getByRole("button", { name: "コピー" });
    expect(copyButton).toBeDisabled();
  });

  it("結果がある場合コピーボタンが enabled", () => {
    render(<LineBreakRemoverPage />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "abc\ndef" } });
    const copyButton = screen.getByRole("button", { name: "コピー" });
    expect(copyButton).not.toBeDisabled();
  });
});

// E-8: clipboard 不在時の silent fail
describe("E-8: clipboard 不在時の silent fail", () => {
  it("navigator.clipboard がない環境でコピーしても例外を投げない", async () => {
    // clipboard を undefined に設定
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    render(<LineBreakRemoverPage />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "abc\ndef" } });

    // 例外を投げないこと
    await expect(async () => {
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "コピー" }));
      });
    }).not.toThrow();

    // 元に戻す
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
      writable: true,
    });
  });
});

// E-10: meta由来の表示（ToolPageLayout経由ではなく、単体コンポーネントなので
// ToolPageLayout なしでレンダリングする。ToolPageLayoutはpage.txsで使用）
describe("E-10: コンポーネントとして正常にレンダリングされる", () => {
  it("コンポーネントが独立してレンダリングされる", () => {
    render(<LineBreakRemoverPage />);
    // 入力欄と変換結果欄の両方が存在する
    expect(screen.getByLabelText("入力テキスト")).toBeInTheDocument();
    expect(screen.getByLabelText("変換結果")).toBeInTheDocument();
  });
});

// E-11: 既存のlogic.tsテストがPASSし続けるか（vitest runで確認）
// logic.tsはそのまま維持されるため、このテストファイルでは検証不要

// E-12: CSSトークン検証
describe("E-12: CSSトークン検証", () => {
  const cssPath = join(
    process.cwd(),
    "src/tools/line-break-remover/LineBreakRemoverPage.module.css",
  );
  const cssContent = readFileSync(cssPath, "utf-8");

  it("旧トークン --color-* が存在しない", () => {
    expect(cssContent).not.toMatch(/var\(--color-/);
  });

  it("--accent 直塗りが存在しない（background/color への直塗り）", () => {
    // background や color に --accent を直接使っていないこと
    // （--accent はフォーカスの outline にのみ使用可）
    const lines = cssContent.split("\n");
    const directAccentLines = lines.filter(
      (line) =>
        line.includes("var(--accent)") &&
        !line.trim().startsWith("//") &&
        !line.trim().startsWith("/*"),
    );
    // outline: 2px solid var(--accent) は許可（フォーカス用）
    // SegmentedControl 化により accent-color は不要になった
    const illegalLines = directAccentLines.filter(
      (line) => !line.includes("outline"),
    );
    expect(illegalLines).toHaveLength(0);
  });

  it("font-weight: 700 が存在しない", () => {
    expect(cssContent).not.toMatch(/font-weight:\s*700/);
  });
});

// オプション切替の詳細テスト
describe("オプション切替の詳細", () => {
  it("removeモード: 「連続する改行を1つにまとめる」トグルが表示される", () => {
    render(<LineBreakRemoverPage />);
    expect(
      screen.getByRole("switch", { name: "連続する改行を1つにまとめる" }),
    ).toBeInTheDocument();
  });

  it("replace-spaceモード: 「連続する改行を1つにまとめる」トグルが表示される", () => {
    render(<LineBreakRemoverPage />);
    fireEvent.click(
      screen.getByRole("radio", { name: "改行をスペースに置換" }),
    );
    expect(
      screen.getByRole("switch", { name: "連続する改行を1つにまとめる" }),
    ).toBeInTheDocument();
  });

  it("smart-pdfモード: 「連続する改行を1つにまとめる」トグルが非表示", () => {
    render(<LineBreakRemoverPage />);
    fireEvent.click(screen.getByRole("radio", { name: "PDFスマートモード" }));
    expect(
      screen.queryByRole("switch", { name: "連続する改行を1つにまとめる" }),
    ).not.toBeInTheDocument();
  });

  it("smart-pdfモード: 「削除する」と「スペースに置換」のラジオが表示される", () => {
    render(<LineBreakRemoverPage />);
    fireEvent.click(screen.getByRole("radio", { name: "PDFスマートモード" }));
    expect(screen.getByRole("radio", { name: "削除する" })).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "スペースに置換" }),
    ).toBeInTheDocument();
  });

  it("removeモード: smart-pdf用ラジオが非表示", () => {
    render(<LineBreakRemoverPage />);
    // デフォルト removeモード
    expect(
      screen.queryByRole("radio", { name: "削除する" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("radio", { name: "スペースに置換" }),
    ).not.toBeInTheDocument();
  });
});

// エラー表示テスト
describe("エラー表示（10万文字超）", () => {
  it("10万文字超の入力でエラーが表示される", () => {
    render(<LineBreakRemoverPage />);
    const input = screen.getByLabelText("入力テキスト");
    const longText = "a".repeat(100_001);
    fireEvent.change(input, { target: { value: longText } });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("エラーメッセージが日本語で表示される", () => {
    render(<LineBreakRemoverPage />);
    const input = screen.getByLabelText("入力テキスト");
    const longText = "a".repeat(100_001);
    fireEvent.change(input, { target: { value: longText } });
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toMatch(/テキストが長すぎます/);
  });
});
