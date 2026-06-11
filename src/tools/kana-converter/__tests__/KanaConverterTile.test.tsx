/**
 * KanaConverterTile のユニットテスト（TDD: 実装前に書く）
 *
 * 検証観点:
 * - V-1: variant=full でのレンダリング（4択 SegmentedControl が表示される）
 * - V-2: variant=hiragana-to-katakana（固定・モード選択 UI 非表示）
 * - V-3: variant=katakana-to-hiragana（固定・モード選択 UI 非表示）
 * - V-4: variant=to-fullwidth-katakana（固定・モード選択 UI 非表示）
 * - V-5: variant=to-halfwidth-katakana（固定・モード選択 UI 非表示）
 * - V-6: variant=full でひらがな→カタカナ変換が動く
 * - V-7: variant=full でモード切替後に変換が動く
 * - V-8: 固定 variant での変換動作（hiragana-to-katakana）
 * - V-9: 固定 variant での変換動作（katakana-to-hiragana）
 * - V-10: 固定 variant での変換動作（to-fullwidth-katakana、濁音合成）
 * - V-11: 固定 variant での変換動作（to-halfwidth-katakana、濁音分解）
 * - V-12: id インスタンス一意性（同一ページに2つ描画して id が重複しない）
 * - V-13: タイルのルートが Panel（section タグ）
 * - V-14: ライブリージョン（role=status aria-live=polite）が存在する
 * - V-15: コピーボタンが空入力時に disabled
 * - V-16: コピーボタンが出力ありのとき有効
 * - V-17: 空入力時モード切替後に古い結果が残らない
 * - V-18: SegmentedControl に aria-label が設定されている（C-2）
 * - V-19: CSS トークン検証（--color-* 不使用・--accent 直塗りなし・bold なし）
 * - V-20: コピーボタンクリックで正しい値がクリップボードに書き込まれる（旧 E-6 相当）
 * - V-21: コピー後に COPIED_LABEL が表示される（ラベル遷移）
 * - V-22: clipboard 不在時の silent fail（旧 E-8 相当）
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import KanaConverterTile from "../KanaConverterTile";

// navigator.clipboard のモック（FullwidthConverterTile.test.tsx と同パターン）
const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(global.navigator, "clipboard", {
  value: { writeText: mockWriteText },
  writable: true,
  configurable: true,
});

beforeEach(() => {
  mockWriteText.mockReset();
  mockWriteText.mockResolvedValue(undefined);
});

// --- V-1: variant=full ---
describe("V-1: variant=full", () => {
  it("4択の SegmentedControl（radiogroup）が表示される", () => {
    render(<KanaConverterTile variant="full" />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    // 4つのラジオボタンが存在する
    expect(screen.getAllByRole("radio")).toHaveLength(4);
  });

  it("入力欄と出力欄が存在する", () => {
    render(<KanaConverterTile variant="full" />);
    expect(screen.getByLabelText("入力テキスト")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "変換結果" }),
    ).toBeInTheDocument();
  });
});

// --- V-2: variant=hiragana-to-katakana（固定） ---
describe("V-2: variant=hiragana-to-katakana（固定）", () => {
  it("SegmentedControl（radiogroup）が表示されない", () => {
    render(<KanaConverterTile variant="hiragana-to-katakana" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("入力欄と出力欄が存在する", () => {
    render(<KanaConverterTile variant="hiragana-to-katakana" />);
    expect(screen.getByLabelText("入力テキスト")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "変換結果" }),
    ).toBeInTheDocument();
  });
});

// --- V-3: variant=katakana-to-hiragana（固定） ---
describe("V-3: variant=katakana-to-hiragana（固定）", () => {
  it("SegmentedControl（radiogroup）が表示されない", () => {
    render(<KanaConverterTile variant="katakana-to-hiragana" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });
});

// --- V-4: variant=to-fullwidth-katakana（固定） ---
describe("V-4: variant=to-fullwidth-katakana（固定）", () => {
  it("SegmentedControl（radiogroup）が表示されない", () => {
    render(<KanaConverterTile variant="to-fullwidth-katakana" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });
});

// --- V-5: variant=to-halfwidth-katakana（固定） ---
describe("V-5: variant=to-halfwidth-katakana（固定）", () => {
  it("SegmentedControl（radiogroup）が表示されない", () => {
    render(<KanaConverterTile variant="to-halfwidth-katakana" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });
});

// --- V-6: variant=full でひらがな→カタカナ変換 ---
describe("V-6: variant=full でひらがな→カタカナ変換", () => {
  it("デフォルト（ひらがな→カタカナ）で変換が動く", () => {
    render(<KanaConverterTile variant="full" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "あいうえお" } });
    const output = screen.getByRole("textbox", {
      name: "変換結果",
    }) as HTMLTextAreaElement;
    expect(output.value).toBe("アイウエオ");
  });
});

// --- V-7: variant=full でモード切替 ---
describe("V-7: variant=full でモード切替", () => {
  it("カタカナ→ひらがなに切り替えて変換が動く", () => {
    render(<KanaConverterTile variant="full" />);
    fireEvent.click(screen.getByRole("radio", { name: "カタカナ → ひらがな" }));
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "サクラ" } });
    const output = screen.getByRole("textbox", {
      name: "変換結果",
    }) as HTMLTextAreaElement;
    expect(output.value).toBe("さくら");
  });

  it("半角カナ→全角カナに切り替えて変換が動く", () => {
    render(<KanaConverterTile variant="full" />);
    fireEvent.click(screen.getByRole("radio", { name: "半角カナ → 全角カナ" }));
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "ｶﾞ" } });
    const output = screen.getByRole("textbox", {
      name: "変換結果",
    }) as HTMLTextAreaElement;
    expect(output.value).toBe("ガ");
  });

  it("全角カナ→半角カナに切り替えて変換が動く", () => {
    render(<KanaConverterTile variant="full" />);
    fireEvent.click(screen.getByRole("radio", { name: "全角カナ → 半角カナ" }));
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "ガ" } });
    const output = screen.getByRole("textbox", {
      name: "変換結果",
    }) as HTMLTextAreaElement;
    expect(output.value).toBe("ｶﾞ");
  });
});

// --- V-8: 固定 variant hiragana-to-katakana での変換 ---
describe("V-8: 固定 variant hiragana-to-katakana での変換", () => {
  it("ひらがな→カタカナ変換が動く", () => {
    render(<KanaConverterTile variant="hiragana-to-katakana" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "さくら" } });
    const output = screen.getByRole("textbox", {
      name: "変換結果",
    }) as HTMLTextAreaElement;
    expect(output.value).toBe("サクラ");
  });
});

// --- V-9: 固定 variant katakana-to-hiragana での変換 ---
describe("V-9: 固定 variant katakana-to-hiragana での変換", () => {
  it("カタカナ→ひらがな変換が動く", () => {
    render(<KanaConverterTile variant="katakana-to-hiragana" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "サクラ" } });
    const output = screen.getByRole("textbox", {
      name: "変換結果",
    }) as HTMLTextAreaElement;
    expect(output.value).toBe("さくら");
  });
});

// --- V-10: 固定 variant to-fullwidth-katakana での変換 ---
describe("V-10: 固定 variant to-fullwidth-katakana での変換（濁音合成）", () => {
  it("半角カナ→全角カナ（濁音合成）変換が動く", () => {
    render(<KanaConverterTile variant="to-fullwidth-katakana" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "ｶﾞ" } });
    const output = screen.getByRole("textbox", {
      name: "変換結果",
    }) as HTMLTextAreaElement;
    expect(output.value).toBe("ガ");
  });
});

// --- V-11: 固定 variant to-halfwidth-katakana での変換 ---
describe("V-11: 固定 variant to-halfwidth-katakana での変換（濁音分解）", () => {
  it("全角カナ→半角カナ（濁音分解）変換が動く", () => {
    render(<KanaConverterTile variant="to-halfwidth-katakana" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "ガ" } });
    const output = screen.getByRole("textbox", {
      name: "変換結果",
    }) as HTMLTextAreaElement;
    expect(output.value).toBe("ｶﾞ");
  });
});

// --- V-12: id インスタンス一意性 ---
describe("V-12: id インスタンス一意性", () => {
  it("同一ページに2つ描画しても input id が重複しない", () => {
    const { container: c1 } = render(<KanaConverterTile variant="full" />);
    const { container: c2 } = render(
      <KanaConverterTile variant="hiragana-to-katakana" />,
    );

    const input1 = c1.querySelector("textarea[id]");
    const input2 = c2.querySelector("textarea[id]");

    expect(input1).not.toBeNull();
    expect(input2).not.toBeNull();
    expect(input1!.id).not.toBe(input2!.id);
  });

  it("variant=full と variant=to-halfwidth-katakana を同居させても全要素 id が重複しない", () => {
    const { container: c1 } = render(<KanaConverterTile variant="full" />);
    const { container: c2 } = render(
      <KanaConverterTile variant="to-halfwidth-katakana" />,
    );

    const ids1 = [...c1.querySelectorAll("[id]")].map((el) => el.id);
    const ids2 = [...c2.querySelectorAll("[id]")].map((el) => el.id);

    const overlap = ids1.filter((id) => ids2.includes(id));
    expect(overlap).toHaveLength(0);
  });
});

// --- V-13: タイルのルートが section タグ（Panel のデフォルト） ---
describe("V-13: タイルのルートが section（Panel）", () => {
  it("variant=full のルートが section タグ", () => {
    const { container } = render(<KanaConverterTile variant="full" />);
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });

  it("固定 variant のルートが section タグ", () => {
    const { container } = render(
      <KanaConverterTile variant="hiragana-to-katakana" />,
    );
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });
});

// --- V-14: ライブリージョン ---
describe("V-14: ライブリージョン（C-3）", () => {
  it("role=status aria-live=polite が存在する", () => {
    render(<KanaConverterTile variant="full" />);
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  it("入力後にサマリテキストが更新される", () => {
    render(<KanaConverterTile variant="full" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "あいうえお" } });
    const statusEl = screen.getByRole("status");
    expect(statusEl.textContent).not.toBe("");
  });
});

// --- V-15: コピーボタン disabled ---
describe("V-15: コピーボタン empty 時 disabled", () => {
  it("空入力時はコピーボタンが disabled", () => {
    render(<KanaConverterTile variant="full" />);
    expect(screen.getByRole("button", { name: "コピー" })).toBeDisabled();
  });
});

// --- V-16: コピーボタン有効 ---
describe("V-16: コピーボタン出力あり時有効", () => {
  it("変換結果がある場合コピーボタンが有効", () => {
    render(<KanaConverterTile variant="full" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "あ" } });
    expect(screen.getByRole("button", { name: "コピー" })).not.toBeDisabled();
  });
});

// --- V-17: モード切替後に古い結果が残らない ---
describe("V-17: モード切替後に古い結果が残らない", () => {
  it("空入力でモード切替しても出力が空", () => {
    render(<KanaConverterTile variant="full" />);
    // デフォルト：入力なしで出力欄は空
    const output = screen.getByRole("textbox", {
      name: "変換結果",
    }) as HTMLTextAreaElement;
    expect(output.value).toBe("");
    // モード切替しても出力は空のまま
    fireEvent.click(screen.getByRole("radio", { name: "カタカナ → ひらがな" }));
    expect(output.value).toBe("");
  });
});

// --- V-18: SegmentedControl に aria-label（C-2） ---
describe("V-18: SegmentedControl に aria-label（C-2）", () => {
  it("variant=full の radiogroup に aria-label が設定されている", () => {
    render(<KanaConverterTile variant="full" />);
    const radiogroup = screen.getByRole("radiogroup");
    // aria-label か aria-labelledby のどちらかが設定されているべき
    const hasLabel =
      radiogroup.hasAttribute("aria-label") ||
      radiogroup.hasAttribute("aria-labelledby");
    expect(hasLabel).toBe(true);
  });
});

// --- V-19: CSS トークン検証 ---
describe("V-19: CSS トークン検証", () => {
  it("KanaConverterTile.module.css に旧トークン --color-* が存在しない", () => {
    const cssPath = join(__dirname, "..", "KanaConverterTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("KanaConverterTile.module.css に --accent 直塗りが存在しない", () => {
    const cssPath = join(__dirname, "..", "KanaConverterTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/background[^:]*:\s*var\(--accent\)/);
  });

  it("KanaConverterTile.module.css に font-weight: 700 が存在しない", () => {
    const cssPath = join(__dirname, "..", "KanaConverterTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });
});

// --- デフォルト variant ---
describe("デフォルト variant", () => {
  it("variant 未指定の場合 full と同等（radiogroup が表示される）", () => {
    render(<KanaConverterTile />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });
});

// --- V-20: コピーボタンクリックで正しい値がクリップボードに書き込まれる（旧 E-6 相当） ---
describe("V-20: コピーボタンクリックで出力値が書き込まれる", () => {
  it("クリックで navigator.clipboard.writeText が変換結果で呼ばれる", async () => {
    render(<KanaConverterTile variant="full" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "あいうえお" } });

    const copyBtn = screen.getByRole("button", { name: "コピー" });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith("アイウエオ");
    });
  });

  it("固定 variant hiragana-to-katakana でもコピーが正しく動く", async () => {
    render(<KanaConverterTile variant="hiragana-to-katakana" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "さくら" } });

    const copyBtn = screen.getByRole("button", { name: "コピー" });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith("サクラ");
    });
  });
});

// --- V-21: コピー後に COPIED_LABEL が表示される（ラベル遷移） ---
describe("V-21: コピー後 COPIED_LABEL に遷移する", () => {
  it("コピーボタンクリック後に「コピーしました」と表示される", async () => {
    render(<KanaConverterTile variant="full" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "あ" } });

    const copyBtn = screen.getByRole("button", { name: "コピー" });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "コピーしました" }),
      ).toBeInTheDocument();
    });
  });
});

// --- V-22: clipboard 不在時の silent fail（旧 E-8 相当） ---
describe("V-22: clipboard 不在時の silent fail", () => {
  it("navigator.clipboard が undefined でもコピー操作が例外を投げない", async () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    render(<KanaConverterTile variant="full" />);
    const input = screen.getByLabelText("入力テキスト");
    fireEvent.change(input, { target: { value: "あ" } });

    await expect(async () => {
      fireEvent.click(screen.getByRole("button", { name: "コピー" }));
    }).not.toThrow();

    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
      writable: true,
    });
  });
});
