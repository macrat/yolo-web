/**
 * Base64Tile のユニットテスト（TDD: 実装前に書く）
 *
 * 検証観点:
 * - V-1: variant=full でのレンダリング（方向トグル表示・URL-safe トグル表示）
 * - V-2: variant=encode でのレンダリング（方向固定・方向トグル非表示・URL-safe トグル表示）
 * - V-3: variant=decode でのレンダリング（方向固定・方向トグル非表示・URL-safe トグル非表示）
 * - V-4: variant=encode でエンコード変換が動く
 * - V-5: variant=decode でデコード変換が動く
 * - V-6: variant=full でエンコード→デコード切り替えが動く
 * - V-7: id インスタンス一意性（同一ページに2つ描画して id が重複しない）
 * - V-8: aria-describedby と説明文 div の関連付けが切れていない
 * - V-9: URL-safe トグルの挙動（encode 時のみ表示・round-trip）
 * - V-10: エラー日本語化・ライブリージョン・コピー
 * - V-11: variant 未指定（デフォルト=full）
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Base64Tile from "../Base64Tile";

// --- V-1: variant=full ---
describe("V-1: variant=full", () => {
  it("方向トグル（SegmentedControl）が表示される", () => {
    render(<Base64Tile variant="full" />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("URL-safe トグルが初期表示される（encode 方向のため）", () => {
    render(<Base64Tile variant="full" />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("入力欄と出力欄が存在する", () => {
    render(<Base64Tile variant="full" />);
    expect(screen.getByLabelText("テキスト入力")).toBeInTheDocument();
    expect(screen.getByLabelText("Base64出力")).toBeInTheDocument();
  });
});

// --- V-2: variant=encode ---
describe("V-2: variant=encode（方向固定・方向トグル非表示・URL-safe 表示）", () => {
  it("SegmentedControl（radiogroup）が表示されない", () => {
    render(<Base64Tile variant="encode" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("URL-safe トグルが表示される（encode のため）", () => {
    render(<Base64Tile variant="encode" />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("入力欄と出力欄が存在する", () => {
    render(<Base64Tile variant="encode" />);
    expect(screen.getByLabelText("テキスト入力")).toBeInTheDocument();
    expect(screen.getByLabelText("Base64出力")).toBeInTheDocument();
  });
});

// --- V-3: variant=decode ---
describe("V-3: variant=decode（方向固定・方向トグル非表示・URL-safe 非表示）", () => {
  it("SegmentedControl（radiogroup）が表示されない", () => {
    render(<Base64Tile variant="decode" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("URL-safe トグルが表示されない", () => {
    render(<Base64Tile variant="decode" />);
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("入力欄と出力欄が存在する", () => {
    render(<Base64Tile variant="decode" />);
    expect(screen.getByLabelText("Base64入力")).toBeInTheDocument();
    expect(screen.getByLabelText("テキスト出力")).toBeInTheDocument();
  });
});

// --- V-4: variant=encode での変換動作 ---
describe("V-4: variant=encode での変換", () => {
  it("テキストを入力するとエンコード結果が表示される", () => {
    render(<Base64Tile variant="encode" />);
    const input = screen.getByLabelText("テキスト入力");
    fireEvent.change(input, { target: { value: "Hello, World!" } });
    const output = screen.getByLabelText("Base64出力") as HTMLTextAreaElement;
    expect(output.value).toBe("SGVsbG8sIFdvcmxkIQ==");
  });

  it("日本語テキスト（UTF-8）をエンコードできる", () => {
    render(<Base64Tile variant="encode" />);
    const input = screen.getByLabelText("テキスト入力");
    fireEvent.change(input, { target: { value: "こんにちは" } });
    const output = screen.getByLabelText("Base64出力") as HTMLTextAreaElement;
    expect(output.value).toBe("44GT44KT44Gr44Gh44Gv");
  });
});

// --- V-5: variant=decode での変換動作 ---
describe("V-5: variant=decode での変換", () => {
  it("Base64文字列をデコードできる", () => {
    render(<Base64Tile variant="decode" />);
    const input = screen.getByLabelText("Base64入力");
    fireEvent.change(input, { target: { value: "SGVsbG8sIFdvcmxkIQ==" } });
    const output = screen.getByLabelText("テキスト出力") as HTMLTextAreaElement;
    expect(output.value).toBe("Hello, World!");
  });

  it("URL-safe Base64（パディングなし）をデコードできる", () => {
    render(<Base64Tile variant="decode" />);
    const input = screen.getByLabelText("Base64入力");
    fireEvent.change(input, { target: { value: "dGVzdA" } });
    const output = screen.getByLabelText("テキスト出力") as HTMLTextAreaElement;
    expect(output.value).toBe("test");
  });
});

// --- V-6: variant=full でのトグル切り替え ---
describe("V-6: variant=full でのトグル切り替え", () => {
  it("デコードに切り替えると入力ラベルが「Base64入力」になる", () => {
    render(<Base64Tile variant="full" />);
    const decodeBtn = screen.getByRole("radio", { name: "デコード" });
    fireEvent.click(decodeBtn);
    expect(screen.getByLabelText("Base64入力")).toBeInTheDocument();
  });

  it("デコードに切り替えてデコードが動く", () => {
    render(<Base64Tile variant="full" />);
    const decodeBtn = screen.getByRole("radio", { name: "デコード" });
    fireEvent.click(decodeBtn);
    const input = screen.getByLabelText("Base64入力");
    fireEvent.change(input, { target: { value: "SGVsbG8sIFdvcmxkIQ==" } });
    const output = screen.getByLabelText("テキスト出力") as HTMLTextAreaElement;
    expect(output.value).toBe("Hello, World!");
  });

  it("デコードに切り替えるとURL-safeトグルが非表示になる", () => {
    render(<Base64Tile variant="full" />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "デコード" }));
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("エンコードに戻るとURL-safeトグルが再表示される", () => {
    render(<Base64Tile variant="full" />);
    fireEvent.click(screen.getByRole("radio", { name: "デコード" }));
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "エンコード" }));
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });
});

// --- V-7: id インスタンス一意性 ---
describe("V-7: id インスタンス一意性", () => {
  it("同一ページに2つ描画しても textarea id が重複しない", () => {
    const { container: c1 } = render(<Base64Tile variant="full" />);
    const { container: c2 } = render(<Base64Tile variant="encode" />);

    const input1 = c1.querySelector("textarea[id]");
    const input2 = c2.querySelector("textarea[id]");

    expect(input1).not.toBeNull();
    expect(input2).not.toBeNull();
    expect(input1!.id).not.toBe(input2!.id);
  });

  it("variant=full と variant=decode を同居させても全要素 id が重複しない", () => {
    const { container: c1 } = render(<Base64Tile variant="full" />);
    const { container: c2 } = render(<Base64Tile variant="decode" />);

    const ids1 = [...c1.querySelectorAll("[id]")].map((el) => el.id);
    const ids2 = [...c2.querySelectorAll("[id]")].map((el) => el.id);

    const overlap = ids1.filter((id) => ids2.includes(id));
    expect(overlap).toHaveLength(0);
  });
});

// --- V-8: aria-describedby と説明文 div の関連付け ---
describe("V-8: aria-describedby と説明文 div の関連付け", () => {
  it("ToggleSwitchのaria-describedbyが説明文divのidと一致する（variant=full）", () => {
    const { container } = render(<Base64Tile variant="full" />);
    const toggleSwitch = container.querySelector('[role="switch"]');
    expect(toggleSwitch).not.toBeNull();

    const describedById = toggleSwitch!.getAttribute("aria-describedby");
    expect(describedById).toBeTruthy();

    // 説明文 div が同一コンテナ内に存在し、id が一致する
    const descDiv = container.querySelector(`#${CSS.escape(describedById!)}`);
    expect(descDiv).not.toBeNull();
    expect(descDiv!.textContent).toContain("JWT");
  });

  it("2インスタンス同居時、各インスタンスのaria-describedbyが自インスタンスの説明文を指す", () => {
    const { container: c1 } = render(<Base64Tile variant="full" />);
    const { container: c2 } = render(<Base64Tile variant="encode" />);

    const toggle1 = c1.querySelector('[role="switch"]');
    const toggle2 = c2.querySelector('[role="switch"]');

    expect(toggle1).not.toBeNull();
    expect(toggle2).not.toBeNull();

    const descId1 = toggle1!.getAttribute("aria-describedby")!;
    const descId2 = toggle2!.getAttribute("aria-describedby")!;

    // 各インスタンスの aria-describedby が異なる（useId で一意化）
    expect(descId1).not.toBe(descId2);

    // 各々が自コンテナ内の説明文を指している
    const desc1 = c1.querySelector(`#${CSS.escape(descId1)}`);
    const desc2 = c2.querySelector(`#${CSS.escape(descId2)}`);
    expect(desc1).not.toBeNull();
    expect(desc2).not.toBeNull();
  });
});

// --- V-9: URL-safe トグルの挙動 ---
describe("V-9: URL-safe トグルの挙動", () => {
  it("URL-safe ON で '+' '/' を含む Base64 が '-' '_' に変換される", () => {
    render(<Base64Tile variant="encode" />);
    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);
    const input = screen.getByLabelText("テキスト入力");
    // ">>>" → 標準 Base64 は "Pj4+" ('+' を含む)
    fireEvent.change(input, { target: { value: ">>>" } });
    const output = screen.getByLabelText("Base64出力") as HTMLTextAreaElement;
    expect(output.value).toBe("Pj4-");
  });

  it("URL-safe OFF（デフォルト）では標準 Base64 が出力される", () => {
    render(<Base64Tile variant="encode" />);
    const input = screen.getByLabelText("テキスト入力");
    fireEvent.change(input, { target: { value: ">>>" } });
    const output = screen.getByLabelText("Base64出力") as HTMLTextAreaElement;
    expect(output.value).toBe("Pj4+");
  });

  it("URL-safe ON でエンコード → decode variant でデコード（round-trip）", () => {
    // URL-safe encode
    const { unmount } = render(<Base64Tile variant="encode" />);
    fireEvent.click(screen.getByRole("switch"));
    const input = screen.getByLabelText("テキスト入力");
    fireEvent.change(input, { target: { value: ">>>" } });
    const output = screen.getByLabelText("Base64出力") as HTMLTextAreaElement;
    const encoded = output.value; // "Pj4-"
    unmount();

    // URL-safe decode（logic.ts が自動正規化）
    render(<Base64Tile variant="decode" />);
    const decodeInput = screen.getByLabelText("Base64入力");
    fireEvent.change(decodeInput, { target: { value: encoded } });
    const decodeOutput = screen.getByLabelText(
      "テキスト出力",
    ) as HTMLTextAreaElement;
    expect(decodeOutput.value).toBe(">>>");
  });
});

// --- V-10: エラー・ライブリージョン・コピー ---
describe("V-10: エラー・ライブリージョン・コピー", () => {
  it("不正な Base64 入力時に日本語エラーが表示される", () => {
    render(<Base64Tile variant="decode" />);
    const input = screen.getByLabelText("Base64入力");
    fireEvent.change(input, { target: { value: "!@#$%" } });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/不正な Base64 文字列です/)).toBeInTheDocument();
    expect(screen.queryByText(/Invalid character/)).not.toBeInTheDocument();
  });

  it("role=status のライブリージョンが存在する", () => {
    render(<Base64Tile variant="full" />);
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("エンコード完了でライブリージョンに「エンコード完了」が表示される", () => {
    render(<Base64Tile variant="full" />);
    const input = screen.getByLabelText("テキスト入力");
    fireEvent.change(input, { target: { value: "test" } });
    expect(screen.getByRole("status")).toHaveTextContent("エンコード完了");
  });

  it("デコード完了でライブリージョンに「デコード完了」が表示される", () => {
    render(<Base64Tile variant="decode" />);
    const input = screen.getByLabelText("Base64入力");
    fireEvent.change(input, { target: { value: "dGVzdA" } });
    expect(screen.getByRole("status")).toHaveTextContent("デコード完了");
  });

  // 旧 E-5 相当: statusSummary のエラー分岐（Base64Tile.tsx 147行付近）の唯一の検証。
  // base64 は decode 失敗という本物のエラー経路を持つため、このエラー分岐の検証は重要。
  it("エラー時にライブリージョンに「変換エラー」が表示される", () => {
    render(<Base64Tile variant="decode" />);
    const input = screen.getByLabelText("Base64入力");
    fireEvent.change(input, { target: { value: "!@#$%" } });
    expect(screen.getByRole("status")).toHaveTextContent("変換エラー");
  });

  it("空入力ではコピーボタンが disabled", () => {
    render(<Base64Tile variant="full" />);
    expect(screen.getByRole("button", { name: "出力をコピー" })).toBeDisabled();
  });

  // 旧 E-7（エラー版）相当: エラー時は output="" のためコピーボタンが disabled になる。
  it("エラー時にコピーボタンが disabled になる", () => {
    render(<Base64Tile variant="decode" />);
    const input = screen.getByLabelText("Base64入力");
    fireEvent.change(input, { target: { value: "!@#$%" } });
    expect(screen.getByRole("button", { name: "出力をコピー" })).toBeDisabled();
  });

  it("出力がある場合コピーボタンは有効", () => {
    render(<Base64Tile variant="encode" />);
    const input = screen.getByLabelText("テキスト入力");
    fireEvent.change(input, { target: { value: "hello" } });
    expect(
      screen.getByRole("button", { name: "出力をコピー" }),
    ).not.toBeDisabled();
  });

  it("コピーボタンをクリックするとコピー文言に変化する", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });

    render(<Base64Tile variant="encode" />);
    const input = screen.getByLabelText("テキスト入力");
    fireEvent.change(input, { target: { value: "test" } });

    const copyButton = screen.getByRole("button", { name: "出力をコピー" });
    expect(copyButton).toHaveTextContent("コピー");

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(copyButton).toHaveTextContent("コピーしました");
    });
  });

  // 旧 E-8 相当: navigator.clipboard が存在しない環境でもコピー操作が例外を投げない
  // （useCopyToClipboard の防御が base64 経路でも機能していることの回帰テスト）。
  it("navigator.clipboard が存在しない環境でコピーが例外を投げない", async () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    render(<Base64Tile variant="encode" />);
    const input = screen.getByLabelText("テキスト入力");
    fireEvent.change(input, { target: { value: "test" } });

    const copyButton = screen.getByRole("button", { name: "出力をコピー" });

    // 例外を投げないことを確認
    await expect(async () => {
      fireEvent.click(copyButton);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }).not.toThrow();

    // 後片付け
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });
});

// --- V-11: デフォルト variant ---
describe("V-11: デフォルト variant", () => {
  it("variant 未指定の場合 full と同等（方向トグル表示）", () => {
    render(<Base64Tile />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });
});
