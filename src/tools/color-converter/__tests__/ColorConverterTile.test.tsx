/**
 * ColorConverterTile — 単一正典タイルのテスト
 *
 * cycle-228 T-15: ColorConverterPage.test.tsx の振る舞いを移植・拡張。
 *
 * テスト項目:
 * - variant="full": SegmentedControl 表示・全モード切替・変換ロジック・コピー等
 * - variant="hex": SegmentedControl 非表示・HEX ラベル表示・変換動作・defaultInput プリフィル
 * - variant="rgb": SegmentedControl 非表示・RGB ラベル表示・変換動作・defaultInput プリフィル
 * - variant="hsl": SegmentedControl 非表示・HSL ラベル表示・変換動作・defaultInput プリフィル
 * - 複数インスタンス同居時の id 一意性
 * - Panel ルート要素であること
 * - useId ベース id で label 関連付けが切れないこと
 *
 * logic.test.ts は不可触。
 */
import { readFileSync } from "fs";
import path from "path";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ColorConverterTile from "../ColorConverterTile";

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

describe("E-1: 基本レンダリング (variant=full)", () => {
  it("コンポーネントが正常にレンダリングされる", () => {
    render(<ColorConverterTile />);
    // SegmentedControl (radiogroup) が存在すること
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    // テキスト入力欄が存在すること
    expect(screen.getByLabelText(/HEX値/)).toBeInTheDocument();
    // カラーピッカーが存在すること
    expect(screen.getByLabelText("カラーピッカー")).toBeInTheDocument();
    // 変換ボタンが存在すること
    expect(screen.getByRole("button", { name: "変換" })).toBeInTheDocument();
    // status ライブリージョンが存在すること
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("Panel ルートを持つこと (A-1 要件)", () => {
    const { container } = render(<ColorConverterTile />);
    // Panel は section タグがデフォルト
    const root = container.firstChild;
    expect(root).not.toBeNull();
    // section か div か article か aside のいずれか（Panel の as prop に依存）
    expect(["SECTION", "DIV", "ARTICLE", "ASIDE"]).toContain(
      (root as Element).tagName,
    );
  });
});

describe("E-2: 入力→結果更新 (変換ボタン押下)", () => {
  it("HEX 入力後に変換ボタンを押すと結果が表示される", () => {
    render(<ColorConverterTile />);
    const input = screen.getByLabelText(/HEX値/);
    fireEvent.change(input, { target: { value: "#ffffff" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    expect(screen.getByText("rgb(255, 255, 255)")).toBeInTheDocument();
    expect(screen.getByText("hsl(0, 0%, 100%)")).toBeInTheDocument();
    expect(screen.getByText("#ffffff")).toBeInTheDocument();
  });

  it("RGB モードに切り替えて入力→変換が正しく動作する", () => {
    render(<ColorConverterTile />);
    const rgbOption = screen.getByRole("radio", { name: "RGB" });
    fireEvent.click(rgbOption);
    const input = screen.getByLabelText(/RGB値/);
    fireEvent.change(input, { target: { value: "255, 0, 0" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    expect(screen.getByText("#ff0000")).toBeInTheDocument();
    expect(screen.getByText("hsl(0, 100%, 50%)")).toBeInTheDocument();
  });

  it("カラーピッカー変更で即時変換される", () => {
    render(<ColorConverterTile />);
    const picker = screen.getByLabelText("カラーピッカー");
    fireEvent.change(picker, { target: { value: "#000000" } });
    expect(screen.getByText("rgb(0, 0, 0)")).toBeInTheDocument();
  });
});

describe("E-3: 空入力の挙動", () => {
  it("初期状態では結果カードが表示されず、エラーも表示されない", () => {
    render(<ColorConverterTile />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByText("rgb(")).not.toBeInTheDocument();
  });

  it("入力が空のとき変換ボタンを押しても結果が出ない", () => {
    render(<ColorConverterTile />);
    const input = screen.getByLabelText(/HEX値/);
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    expect(screen.queryByText("rgb(")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("E-4: 変換ロジックの正確性 (UI 経由)", () => {
  it("HEX #3498db → RGB / HSL が正しく変換される", () => {
    render(<ColorConverterTile />);
    const input = screen.getByLabelText(/HEX値/);
    fireEvent.change(input, { target: { value: "#3498db" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    expect(screen.getByText("rgb(52, 152, 219)")).toBeInTheDocument();
    expect(screen.getByText("hsl(204, 70%, 53%)")).toBeInTheDocument();
  });

  it("3桁 HEX #fff が正しく変換される", () => {
    render(<ColorConverterTile />);
    const input = screen.getByLabelText(/HEX値/);
    fireEvent.change(input, { target: { value: "#fff" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    expect(screen.getByText("#ffffff")).toBeInTheDocument();
    expect(screen.getByText("rgb(255, 255, 255)")).toBeInTheDocument();
  });

  it("不正な HEX 入力でエラーメッセージが表示される", () => {
    render(<ColorConverterTile />);
    const input = screen.getByLabelText(/HEX値/);
    fireEvent.change(input, { target: { value: "notahex" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("HSL モード: hsl(210, 68%, 53%) が変換される", () => {
    render(<ColorConverterTile />);
    const hslOption = screen.getByRole("radio", { name: "HSL" });
    fireEvent.click(hslOption);
    const input = screen.getByLabelText(/HSL値/);
    fireEvent.change(input, { target: { value: "hsl(210, 68%, 53%)" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    expect(screen.getByText(/^rgb\(/)).toBeInTheDocument();
  });

  it("代表入力 #ff0000 → rgb(255,0,0) / hsl(0,100%,50%) が正しい (G-5)", () => {
    render(<ColorConverterTile />);
    const input = screen.getByLabelText(/HEX値/);
    fireEvent.change(input, { target: { value: "#ff0000" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    expect(screen.getByText("rgb(255, 0, 0)")).toBeInTheDocument();
    expect(screen.getByText("hsl(0, 100%, 50%)")).toBeInTheDocument();
  });

  it("代表入力 rgb(255,0,0) → #ff0000 / hsl(0,100%,50%) が正しい (G-5)", () => {
    render(<ColorConverterTile />);
    fireEvent.click(screen.getByRole("radio", { name: "RGB" }));
    const input = screen.getByLabelText(/RGB値/);
    fireEvent.change(input, { target: { value: "rgb(255,0,0)" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    expect(screen.getByText("#ff0000")).toBeInTheDocument();
    expect(screen.getByText("hsl(0, 100%, 50%)")).toBeInTheDocument();
  });

  it("代表入力 hsl(0,100%,50%) → #ff0000 / rgb(255,0,0) が正しい (G-5)", () => {
    render(<ColorConverterTile />);
    fireEvent.click(screen.getByRole("radio", { name: "HSL" }));
    const input = screen.getByLabelText(/HSL値/);
    fireEvent.change(input, { target: { value: "hsl(0, 100%, 50%)" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    expect(screen.getByText("#ff0000")).toBeInTheDocument();
    expect(screen.getByText("rgb(255, 0, 0)")).toBeInTheDocument();
  });
});

describe("E-5: ARIA 属性", () => {
  it("SegmentedControl が role='radiogroup' を持つ", () => {
    render(<ColorConverterTile />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("SegmentedControl に aria-label が付いている", () => {
    render(<ColorConverterTile />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toHaveAttribute("aria-label");
  });

  it("結果サマリに role='status' と aria-live='polite' が付いている", () => {
    render(<ColorConverterTile />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("変換後 status 要素に実テキストノードが入る (C-3 要件)", () => {
    render(<ColorConverterTile />);
    const input = screen.getByLabelText(/HEX値/);
    fireEvent.change(input, { target: { value: "#ff0000" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    const status = screen.getByRole("status");
    expect(status.textContent).not.toBe("");
  });

  it("カラーピッカーにアクセシブル名が付いている (C-4 要件)", () => {
    render(<ColorConverterTile />);
    const picker = screen.getByLabelText("カラーピッカー");
    expect(picker).toBeInTheDocument();
  });
});

describe("E-6: コピーボタンの文言変化 (複数ターゲット)", () => {
  it("変換前はコピーボタンが disabled である", () => {
    render(<ColorConverterTile />);
    const copyButtons = screen.queryAllByRole("button", { name: /コピー/ });
    copyButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("コピー後は対応する HEX ボタンが 'コピーしました' に変わる", async () => {
    mockWriteText.mockResolvedValue(undefined);
    render(<ColorConverterTile />);
    const input = screen.getByLabelText(/HEX値/);
    fireEvent.change(input, { target: { value: "#ff0000" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));

    const hexCopyButton = screen.getByRole("button", { name: /HEXをコピー/ });
    await act(async () => {
      fireEvent.click(hexCopyButton);
    });
    expect(hexCopyButton).toHaveTextContent("コピーしました");
  });
});

describe("E-7: コピーボタン disabled 状態", () => {
  it("結果が空のとき、すべてのコピーボタンが disabled になる", () => {
    render(<ColorConverterTile />);
    const copyButtons = screen.queryAllByRole("button", { name: /コピー/ });
    copyButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("変換成功後、コピーボタンが enabled になる", () => {
    render(<ColorConverterTile />);
    const input = screen.getByLabelText(/HEX値/);
    fireEvent.change(input, { target: { value: "#ff0000" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    const copyButtons = screen.getAllByRole("button", { name: /コピー/ });
    const enabledCopyButtons = copyButtons.filter(
      (btn) => !btn.hasAttribute("disabled"),
    );
    expect(enabledCopyButtons.length).toBeGreaterThanOrEqual(3);
  });
});

describe("E-8: clipboard 不在時の silent fail", () => {
  it("navigator.clipboard が存在しない環境でもエラーを投げない", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    render(<ColorConverterTile />);
    const input = screen.getByLabelText(/HEX値/);
    fireEvent.change(input, { target: { value: "#ff0000" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));

    const hexCopyButton = screen.getByRole("button", { name: /HEXをコピー/ });
    await expect(
      act(async () => {
        fireEvent.click(hexCopyButton);
      }),
    ).resolves.not.toThrow();
  });
});

describe("G-1: 入力修正時のエラー状態クリア", () => {
  it("不正入力→変換→入力修正でエラーバナーが消える", () => {
    render(<ColorConverterTile />);
    const input = screen.getByLabelText(/HEX値/);

    fireEvent.change(input, { target: { value: "invalid" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "#FF0000" } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("成功結果が表示されている状態で入力を変えてもエラーでは消えない（過剰クリアしない）", () => {
    render(<ColorConverterTile />);
    const input = screen.getByLabelText(/HEX値/);

    fireEvent.change(input, { target: { value: "#ffffff" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    expect(screen.getByText("rgb(255, 255, 255)")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "#000000" } });
    expect(screen.getByText("rgb(255, 255, 255)")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("variant='hex': 固定 HEX モード", () => {
  it("(a) SegmentedControl が非表示になる", () => {
    render(<ColorConverterTile variant="hex" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("(b) HEX 入力ラベルが表示される", () => {
    render(<ColorConverterTile variant="hex" />);
    expect(screen.getByLabelText(/HEX値/)).toBeInTheDocument();
  });

  it("(c) HEX 入力で変換が動く", () => {
    render(<ColorConverterTile variant="hex" />);
    const input = screen.getByLabelText(/HEX値/);
    fireEvent.change(input, { target: { value: "#ff0000" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    expect(screen.getByText("rgb(255, 0, 0)")).toBeInTheDocument();
    expect(screen.getByText("hsl(0, 100%, 50%)")).toBeInTheDocument();
  });

  it("(d) defaultInput がプリフィルされる", () => {
    render(<ColorConverterTile variant="hex" defaultInput="#aabbcc" />);
    const input = screen.getByLabelText(/HEX値/);
    expect(input).toHaveValue("#aabbcc");
  });
});

describe("variant='rgb': 固定 RGB モード", () => {
  it("(a) SegmentedControl が非表示になる", () => {
    render(<ColorConverterTile variant="rgb" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("(b) RGB 入力ラベルが表示される", () => {
    render(<ColorConverterTile variant="rgb" />);
    expect(screen.getByLabelText(/RGB値/)).toBeInTheDocument();
  });

  it("(c) RGB 入力で変換が動く", () => {
    render(<ColorConverterTile variant="rgb" />);
    const input = screen.getByLabelText(/RGB値/);
    fireEvent.change(input, { target: { value: "255, 0, 0" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    expect(screen.getByText("#ff0000")).toBeInTheDocument();
    expect(screen.getByText("hsl(0, 100%, 50%)")).toBeInTheDocument();
  });

  it("(d) defaultInput がプリフィルされる", () => {
    render(<ColorConverterTile variant="rgb" defaultInput="52, 152, 219" />);
    const input = screen.getByLabelText(/RGB値/);
    expect(input).toHaveValue("52, 152, 219");
  });
});

describe("variant='hsl': 固定 HSL モード", () => {
  it("(a) SegmentedControl が非表示になる", () => {
    render(<ColorConverterTile variant="hsl" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("(b) HSL 入力ラベルが表示される", () => {
    render(<ColorConverterTile variant="hsl" />);
    expect(screen.getByLabelText(/HSL値/)).toBeInTheDocument();
  });

  it("(c) HSL 入力で変換が動く", () => {
    render(<ColorConverterTile variant="hsl" />);
    const input = screen.getByLabelText(/HSL値/);
    fireEvent.change(input, { target: { value: "hsl(0, 100%, 50%)" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    expect(screen.getByText("#ff0000")).toBeInTheDocument();
    expect(screen.getByText("rgb(255, 0, 0)")).toBeInTheDocument();
  });

  it("(d) defaultInput がプリフィルされる", () => {
    render(<ColorConverterTile variant="hsl" defaultInput="210, 68%, 53%" />);
    const input = screen.getByLabelText(/HSL値/);
    expect(input).toHaveValue("210, 68%, 53%");
  });
});

describe("複数インスタンス同居時の id 一意性 (A-6 要件)", () => {
  it("2つのインスタンスの id が重複しない", () => {
    render(
      <>
        <ColorConverterTile />
        <ColorConverterTile />
      </>,
    );
    // 全ての id を収集して重複がないことを確認
    const allIds = Array.from(document.querySelectorAll("[id]")).map(
      (el) => el.id,
    );
    const uniqueIds = new Set(allIds);
    expect(allIds.length).toBe(uniqueIds.size);
  });

  it("2つのインスタンスが同時に動作する", () => {
    render(
      <>
        <ColorConverterTile />
        <ColorConverterTile />
      </>,
    );
    // 各インスタンスのラジオグループが独立していること
    const radiogroups = screen.getAllByRole("radiogroup");
    expect(radiogroups.length).toBe(2);
  });
});

describe("E-12: CSS トークン検証", () => {
  const cssPath = path.resolve(__dirname, "../ColorConverterTile.module.css");

  it("--color-* 旧トークンが存在しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("--accent 直塗りが存在しない (background/color への直接使用禁止)", () => {
    const css = readFileSync(cssPath, "utf-8");
    const lines = css.split("\n");
    for (const line of lines) {
      if (line.includes("var(--accent)")) {
        expect(line).toMatch(/outline/);
      }
    }
  });

  it("font-weight: 700 が存在しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight:\s*700/);
  });

  it("box-shadow が存在しない (B-6 要件)", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/box-shadow/);
  });
});
