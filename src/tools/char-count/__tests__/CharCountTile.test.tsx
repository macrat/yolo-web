/**
 * CharCountTile のユニットテスト（TDD: 実装前に書く）
 *
 * 検証観点:
 * - V-1: variant=full でのレンダリング（全6統計ラベルが表示される）
 * - V-2: variant=compact でのレンダリング（主要統計のみ）
 * - V-3: 入力→リアルタイム統計更新
 * - V-4: 空入力時は0表示（エラーなし）
 * - V-5: バイト数正確性（日本語3バイト）
 * - V-6: 複数行・段落カウント
 * - V-7: id インスタンス一意性（複数インスタンス同居）
 * - V-8: ルートが Panel（セマンティクス確認）
 * - V-9: ARIA（role="status" aria-live="polite" + 実テキストノード）
 * - V-10: コピーボタン非表示（char-count は知る対象）
 * - V-11: 絵文字を1文字として計上
 * - V-12: デフォルト variant（full と同等）
 * - V-13: CSS トークン検証（--color-* 禁止・font-weight:700 禁止）
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import CharCountTile from "../CharCountTile";

// --- V-1: variant=full ---
describe("V-1: variant=full", () => {
  it("全6統計ラベルが表示される", () => {
    render(<CharCountTile variant="full" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Hello World" } });
    expect(screen.getByText("文字数", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("文字数（空白除く）")).toBeInTheDocument();
    expect(screen.getByText(/バイト数/)).toBeInTheDocument();
    expect(screen.getByText("単語数")).toBeInTheDocument();
    expect(screen.getByText("行数")).toBeInTheDocument();
    expect(screen.getByText("段落数")).toBeInTheDocument();
  });

  it("テキスト入力欄が存在する", () => {
    render(<CharCountTile variant="full" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});

// --- V-2: variant=compact ---
describe("V-2: variant=compact", () => {
  it("テキスト入力欄が存在する", () => {
    render(<CharCountTile variant="compact" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("主要統計（文字数・バイト数）が表示される", () => {
    render(<CharCountTile variant="compact" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "abc" } });
    expect(screen.getByText("文字数", { exact: true })).toBeInTheDocument();
    expect(screen.getByText(/バイト数/)).toBeInTheDocument();
  });

  it("段落数は表示されない（compact は主要統計のみ）", () => {
    render(<CharCountTile variant="compact" />);
    expect(screen.queryByText("段落数")).not.toBeInTheDocument();
  });
});

// --- V-3: 入力→リアルタイム統計更新 ---
describe("V-3: 入力→リアルタイム統計更新", () => {
  it("テキストを入力すると文字数が更新される", () => {
    render(<CharCountTile variant="full" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "abc" } });
    const threeElements = screen.getAllByText("3");
    expect(threeElements.length).toBeGreaterThan(0);
  });

  // nit: UI 層の具体値での結線確認（"Hello World" → words=2 が UI に表示されること）
  it("'Hello World' 入力で単語数=2 が UI に表示される", () => {
    render(<CharCountTile variant="full" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Hello World" } });

    // 統計リージョン内に "2"（単語数）が存在することを確認
    const statsRegion = screen.getByRole("region", {
      name: "文字数カウント結果",
    });
    const twoElements = [...statsRegion.querySelectorAll("*")].filter(
      (el) => el.textContent?.trim() === "2",
    );
    expect(twoElements.length).toBeGreaterThan(0);
  });
});

// --- V-4: 空入力時は0表示（エラーなし） ---
describe("V-4: 空入力時の状態", () => {
  it("空入力時は0を表示する", () => {
    render(<CharCountTile variant="full" />);
    const zeroElements = screen.getAllByText("0");
    expect(zeroElements.length).toBeGreaterThan(0);
  });

  it("空入力時にエラーを表示しない", () => {
    render(<CharCountTile variant="full" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

// --- V-5: バイト数正確性 ---
describe("V-5: バイト数正確性", () => {
  it("日本語テキストのバイト数を正確にカウント（あいう=9バイト）", () => {
    render(<CharCountTile variant="full" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "あいう" } });
    const nineElements = screen.getAllByText("9");
    expect(nineElements.length).toBeGreaterThan(0);
  });
});

// --- V-6: 複数行・段落カウント ---
describe("V-6: 複数行・段落カウント", () => {
  it("複数行テキストの行数を正確にカウント", () => {
    render(<CharCountTile variant="full" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "line1\nline2\nline3" } });
    const threeElements = screen.getAllByText("3");
    expect(threeElements.length).toBeGreaterThan(0);
  });

  it("段落数を正確にカウント", () => {
    render(<CharCountTile variant="full" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "para1\n\npara2" } });
    const twoElements = screen.getAllByText("2");
    expect(twoElements.length).toBeGreaterThan(0);
  });
});

// --- V-7: id インスタンス一意性 ---
describe("V-7: id インスタンス一意性（複数インスタンス同居）", () => {
  it("同一ページに2つ描画しても textarea の id が重複しない", () => {
    const { container: c1 } = render(<CharCountTile variant="full" />);
    const { container: c2 } = render(<CharCountTile variant="compact" />);

    const input1 = c1.querySelector("textarea[id]");
    const input2 = c2.querySelector("textarea[id]");

    expect(input1).not.toBeNull();
    expect(input2).not.toBeNull();
    expect(input1!.id).not.toBe(input2!.id);
  });

  it("2つのインスタンスで全 id が重複しない", () => {
    const { container: c1 } = render(<CharCountTile variant="full" />);
    const { container: c2 } = render(<CharCountTile variant="full" />);

    const ids1 = [...c1.querySelectorAll("[id]")].map((el) => el.id);
    const ids2 = [...c2.querySelectorAll("[id]")].map((el) => el.id);

    const overlap = ids1.filter((id) => ids2.includes(id));
    expect(overlap).toHaveLength(0);
  });
});

// --- V-8: ルートが Panel ---
describe("V-8: ルートが Panel", () => {
  it("ルート要素が section タグである（Panel のデフォルト）", () => {
    const { container } = render(<CharCountTile variant="full" />);
    const root = container.firstElementChild;
    expect(root?.tagName.toLowerCase()).toBe("section");
  });

  it("as='div' でルートが div になる", () => {
    const { container } = render(<CharCountTile variant="full" as="div" />);
    const root = container.firstElementChild;
    expect(root?.tagName.toLowerCase()).toBe("div");
  });
});

// --- V-9: ARIA ---
describe("V-9: ARIA（role=status / aria-live）", () => {
  it("role=status の要素が存在する", () => {
    render(<CharCountTile variant="full" />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeInTheDocument();
  });

  it("role=status に aria-live=polite が設定されている", () => {
    render(<CharCountTile variant="full" />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  it("入力後にライブリージョンに実テキストノードが存在する（C-3 要件）", () => {
    render(<CharCountTile variant="full" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    const statusRegion = screen.getByRole("status");
    expect(statusRegion.textContent).not.toBe("");
  });

  it("空入力でもライブリージョンにテキストが存在する", () => {
    render(<CharCountTile variant="full" />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion.textContent).not.toBe("");
  });

  // [should-fix 1] 結果リージョンの role 検証（将来の削除・改名を検知する回帰テスト）
  it("aria-label='文字数カウント結果' の region が存在する", () => {
    render(<CharCountTile variant="full" />);
    expect(
      screen.getByRole("region", { name: "文字数カウント結果" }),
    ).toBeInTheDocument();
  });

  // [should-fix 2] status リージョンと stats リージョンの構造的独立（C-3 設計の回帰テスト）
  it("status リージョンが stats リージョンを内包しない（C-3: ライブリージョンはサマリのみ）", () => {
    render(<CharCountTile variant="full" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    const statusRegion = screen.getByRole("status");
    // status の中に「文字数カウント結果」region が入っていないこと
    expect(
      statusRegion.querySelector('[aria-label="文字数カウント結果"]'),
    ).toBeNull();
    // status の中に詳細統計ラベルが含まれないこと
    expect(statusRegion.textContent).not.toContain("文字数（空白除く）");
    expect(statusRegion.textContent).not.toContain("段落数");
  });
});

// --- V-10: コピーボタン非表示 ---
describe("V-10: コピーボタン非表示", () => {
  it("コピーボタンが存在しない（char-count は知る対象）", () => {
    render(<CharCountTile variant="full" />);
    expect(
      screen.queryByRole("button", { name: /コピー/ }),
    ).not.toBeInTheDocument();
  });
});

// --- V-11: 絵文字を1文字として計上 ---
describe("V-11: 絵文字を1文字として計上", () => {
  it("絵文字が1文字としてカウントされる（Unicode コードポイント単位）", () => {
    render(<CharCountTile variant="full" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "😀" } });
    const oneElements = screen.getAllByText("1");
    expect(oneElements.length).toBeGreaterThan(0);
  });
});

// --- V-12: デフォルト variant ---
describe("V-12: デフォルト variant", () => {
  it("variant 未指定の場合 full と同等（全6統計が表示される）", () => {
    render(<CharCountTile />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "test" } });
    expect(screen.getByText("文字数", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("段落数")).toBeInTheDocument();
  });
});

// --- V-13: CSS トークン検証 ---
describe("V-13: CSS トークン検証", () => {
  const cssPath = join(__dirname, "..", "CharCountTile.module.css");

  it("--color-* トークンを使用していない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("--accent を背景色・文字色に直接使用していない", () => {
    const css = readFileSync(cssPath, "utf-8");
    const illegalAccentUse = css.match(
      /(?:background|background-color|color)\s*:\s*var\(--accent\)/g,
    );
    expect(illegalAccentUse).toBeNull();
  });

  it("font-weight: 700 を使用していない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight:\s*700/);
  });
});
