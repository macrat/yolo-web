/**
 * HtmlEntityTile のユニットテスト（TDD: 実装前に作成）
 *
 * 検証観点:
 * - V-1: variant=full でのレンダリング（方向トグルが表示される）
 * - V-2: variant=encode でのレンダリング（方向固定・トグル非表示）
 * - V-3: variant=decode でのレンダリング（方向固定・トグル非表示）
 * - V-4: variant=encode でエンコード変換が動く
 * - V-5: variant=decode でデコード変換が動く
 * - V-6: variant=full でエンコード→デコード切り替えが動く
 * - V-7: id インスタンス一意性（同一ページに2つ描画して input id が重複しない）
 * - V-8: デフォルト variant は full と同等
 * - V-9: a11y（role="status" aria-live="polite" のサマリ div）
 * - V-10: コピーボタン disabled / 有効状態
 * - V-11: コピー後テキスト変化
 * - V-12: 変換ロジックの正確性（UI経由）
 * - V-13: CSS トークン検証（旧トークン不使用）
 */
import { readFileSync } from "fs";
import path from "path";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import HtmlEntityTile from "../HtmlEntityTile";

// ──────────────────────────────────────────────
// clipboard mock
// ──────────────────────────────────────────────
const mockWriteText = vi.fn();

beforeEach(() => {
  mockWriteText.mockReset();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: mockWriteText },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// --- V-1: variant=full ---
describe("V-1: variant=full", () => {
  it("方向トグル（SegmentedControl）が表示される", () => {
    render(<HtmlEntityTile variant="full" />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("入力欄と出力欄が存在する", () => {
    render(<HtmlEntityTile variant="full" />);
    // 入力欄 (encode 初期状態)
    expect(screen.getByLabelText("テキスト入力")).toBeInTheDocument();
    // 出力欄
    expect(screen.getByLabelText("エンコード結果")).toBeInTheDocument();
  });
});

// --- V-2: variant=encode ---
describe("V-2: variant=encode（方向固定・トグル非表示）", () => {
  it("SegmentedControl（radiogroup）が表示されない", () => {
    render(<HtmlEntityTile variant="encode" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("入力欄と出力欄が存在する", () => {
    render(<HtmlEntityTile variant="encode" />);
    expect(screen.getByLabelText("テキスト入力")).toBeInTheDocument();
    expect(screen.getByLabelText("エンコード結果")).toBeInTheDocument();
  });
});

// --- V-3: variant=decode ---
describe("V-3: variant=decode（方向固定・トグル非表示）", () => {
  it("SegmentedControl（radiogroup）が表示されない", () => {
    render(<HtmlEntityTile variant="decode" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("入力欄と出力欄が存在する", () => {
    render(<HtmlEntityTile variant="decode" />);
    expect(screen.getByLabelText("HTMLエンティティ入力")).toBeInTheDocument();
    expect(screen.getByLabelText("デコード結果")).toBeInTheDocument();
  });
});

// --- V-4: variant=encode での変換動作 ---
describe("V-4: variant=encode での変換", () => {
  it("入力するとエンコード結果が表示される", () => {
    render(<HtmlEntityTile variant="encode" />);
    const input = screen.getByLabelText("テキスト入力");
    fireEvent.change(input, { target: { value: "<b>bold</b>" } });
    const output = screen.getByLabelText(
      "エンコード結果",
    ) as HTMLTextAreaElement;
    expect(output.value).toBe("&lt;b&gt;bold&lt;/b&gt;");
  });
});

// --- V-5: variant=decode での変換動作 ---
describe("V-5: variant=decode での変換", () => {
  it("入力するとデコード結果が表示される", () => {
    render(<HtmlEntityTile variant="decode" />);
    const input = screen.getByLabelText("HTMLエンティティ入力");
    fireEvent.change(input, { target: { value: "&lt;b&gt;" } });
    const output = screen.getByLabelText("デコード結果") as HTMLTextAreaElement;
    expect(output.value).toBe("<b>");
  });
});

// --- V-6: variant=full でのトグル切り替え ---
describe("V-6: variant=full でのトグル切り替え", () => {
  it("デコードに切り替えてデコードが動く", () => {
    render(<HtmlEntityTile variant="full" />);
    const decodeBtn = screen.getByRole("radio", { name: "デコード" });
    fireEvent.click(decodeBtn);
    const input = screen.getByLabelText("HTMLエンティティ入力");
    fireEvent.change(input, { target: { value: "&lt;b&gt;" } });
    const output = screen.getByLabelText("デコード結果") as HTMLTextAreaElement;
    expect(output.value).toBe("<b>");
  });
});

// --- V-7: id インスタンス一意性 ---
describe("V-7: id インスタンス一意性", () => {
  it("同一ページに2つ描画しても input id が重複しない", () => {
    const { container: c1 } = render(<HtmlEntityTile variant="full" />);
    const { container: c2 } = render(<HtmlEntityTile variant="encode" />);

    const input1 = c1.querySelector("textarea[id]");
    const input2 = c2.querySelector("textarea[id]");

    expect(input1).not.toBeNull();
    expect(input2).not.toBeNull();
    expect(input1!.id).not.toBe(input2!.id);
  });

  it("variant=full と variant=decode を同居させても全要素 id が重複しない", () => {
    const { container: c1 } = render(<HtmlEntityTile variant="full" />);
    const { container: c2 } = render(<HtmlEntityTile variant="decode" />);

    const ids1 = [...c1.querySelectorAll("[id]")].map((el) => el.id);
    const ids2 = [...c2.querySelectorAll("[id]")].map((el) => el.id);

    const overlap = ids1.filter((id) => ids2.includes(id));
    expect(overlap).toHaveLength(0);
  });
});

// --- V-8: デフォルト variant は full と同等 ---
describe("V-8: デフォルト variant", () => {
  it("variant 未指定の場合 full と同等の動作をする（トグルが表示される）", () => {
    render(<HtmlEntityTile />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });
});

// --- V-9: a11y ---
describe("V-9: a11y（role='status' aria-live='polite'）", () => {
  it("role='status' の要素が存在する", () => {
    render(<HtmlEntityTile variant="full" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("role='status' の要素に aria-live='polite' が付いている", () => {
    render(<HtmlEntityTile variant="full" />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("入力後にサマリテキストが入る（C-3 要件）", () => {
    render(<HtmlEntityTile variant="full" />);
    fireEvent.change(screen.getByLabelText("テキスト入力"), {
      target: { value: "<b>test</b>" },
    });
    const status = screen.getByRole("status");
    expect(status.textContent).not.toBe("");
  });

  it("SegmentedControl に aria-label が付いている（C-2 要件）", () => {
    render(<HtmlEntityTile variant="full" />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toHaveAttribute("aria-label");
  });
});

// --- V-10: コピーボタン disabled 状態 ---
describe("V-10: コピーボタン disabled 状態", () => {
  it("結果が空のとき、コピーボタンが disabled になる", () => {
    render(<HtmlEntityTile variant="full" />);
    const copyButton = screen.getByRole("button", { name: /コピー/ });
    expect(copyButton).toBeDisabled();
  });

  it("結果がある場合は disabled でない", () => {
    render(<HtmlEntityTile variant="full" />);
    fireEvent.change(screen.getByLabelText("テキスト入力"), {
      target: { value: "<b>" },
    });
    const copyButton = screen.getByRole("button", { name: /コピー/ });
    expect(copyButton).not.toBeDisabled();
  });
});

// --- V-11: コピーボタンの文言変化 ---
describe("V-11: コピーボタンの文言変化", () => {
  it("コピー前は 'コピー' が表示される", () => {
    render(<HtmlEntityTile variant="full" />);
    fireEvent.change(screen.getByLabelText("テキスト入力"), {
      target: { value: "<b>" },
    });
    const copyButton = screen.getByRole("button", { name: /コピー/ });
    expect(copyButton).toHaveTextContent("コピー");
  });

  it("コピー後は 'コピーしました' が表示される", async () => {
    mockWriteText.mockResolvedValue(undefined);
    render(<HtmlEntityTile variant="full" />);
    fireEvent.change(screen.getByLabelText("テキスト入力"), {
      target: { value: "<b>" },
    });
    const copyButton = screen.getByRole("button", { name: /コピー/ });
    await act(async () => {
      fireEvent.click(copyButton);
    });
    expect(copyButton).toHaveTextContent("コピーしました");
  });
});

// --- V-12: 変換ロジックの正確性（UI経由）---
describe("V-12: 変換ロジックの正確性", () => {
  it("encode: HTML特殊文字5種が正しくエスケープされる", () => {
    render(<HtmlEntityTile variant="encode" />);
    fireEvent.change(screen.getByLabelText("テキスト入力"), {
      target: { value: '<script>alert("xss")&foo</script>' },
    });
    expect(screen.getByLabelText("エンコード結果")).toHaveValue(
      "&lt;script&gt;alert(&quot;xss&quot;)&amp;foo&lt;/script&gt;",
    );
  });

  it("decode: 名前付きエンティティが正しく変換される", () => {
    render(<HtmlEntityTile variant="decode" />);
    fireEvent.change(screen.getByLabelText("HTMLエンティティ入力"), {
      target: { value: "&copy; &reg; &trade;" },
    });
    expect(screen.getByLabelText("デコード結果")).toHaveValue("© ® ™");
  });

  it("decode: 数値参照 (10進・16進) が正しく変換される", () => {
    render(<HtmlEntityTile variant="decode" />);
    fireEvent.change(screen.getByLabelText("HTMLエンティティ入力"), {
      target: { value: "&#65;&#x42;&#67;" },
    });
    expect(screen.getByLabelText("デコード結果")).toHaveValue("ABC");
  });

  it("encode→decode の対称性: エンコードした文字列をデコードすると元に戻る", () => {
    render(<HtmlEntityTile variant="full" />);
    const inputStr = '<div class="test">Hello & World</div>';
    fireEvent.change(screen.getByLabelText("テキスト入力"), {
      target: { value: inputStr },
    });
    const encodedOutput = (
      screen.getByLabelText("エンコード結果") as HTMLTextAreaElement
    ).value;

    const decodeOption = screen.getByRole("radio", { name: "デコード" });
    fireEvent.click(decodeOption);
    fireEvent.change(screen.getByLabelText("HTMLエンティティ入力"), {
      target: { value: encodedOutput },
    });
    const decoded = (
      screen.getByLabelText("デコード結果") as HTMLTextAreaElement
    ).value;
    expect(decoded).toBe(inputStr);
  });
});

// --- V-13: CSS トークン検証 ---
describe("V-13: CSS トークン検証", () => {
  const cssPath = path.resolve(__dirname, "../HtmlEntityTile.module.css");

  it("--color-* 旧トークンが存在しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("font-weight: 700 が存在しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight:\s*700/);
  });
});
